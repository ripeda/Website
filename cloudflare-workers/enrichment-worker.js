/**
 * RIPEDA Website Lead — Enrichment Worker
 * ---------------------------------------
 * Runs on a Cron Trigger (e.g. every 10 min). No public URL.
 * Job: find Lead OPPORTUNITIES whose Enrichment Status is "Pending",
 *      run Claude to research/score them, write the results back into
 *      the AI custom fields, mark them "Complete", and post a Slack brief.
 *
 * Reads and writes /api/Opportunities (not /api/Tickets) — website leads are
 * prospect opportunities on the "Lead" type (27). See
 * website-lead-opportunity-reconciliation.md.
 *
 * Secrets this Worker expects (Settings > Variables and Secrets):
 *   HALO_CLIENT_ID      (Text)   - HaloPSA API application Client ID
 *   HALO_CLIENT_SECRET  (Secret) - HaloPSA API application Client Secret
 *   HALO_BASE_URL       (Text)   - https://ripeda.halopsa.com
 *   ANTHROPIC_API_KEY   (Secret) - Anthropic API key
 *   SLACK_WEBHOOK_URL   (Secret) - Slack incoming webhook URL
 *   ADMIN_KEY           (Secret) - gates the whole HTTP surface. Generate with
 *                                 `openssl rand -hex 32`. Without it set, every
 *                                 fetch route returns 404 (fails closed). The
 *                                 cron trigger is unaffected.
 *
 * The Halo API application needs read:sales + edit:sales (opportunities live
 * under Halo's Sales module; there is no *:opportunities scope).
 */

// Bump this on every deploy. It is echoed by ?debug=1 and in every log line,
// so "did my deploy actually land?" is never a guess.
const BUILD = "2026-07-30a-gated-endpoints";

const LEAD_OPPORTUNITY_TYPE_ID = 27;
const MODEL = "claude-sonnet-5";            // primary: best judgement
const FALLBACK_MODEL = "claude-haiku-4-5";  // used only if the primary is overloaded

// Anthropic-hosted web search. This is what makes the enrichment an actual
// lookup rather than inference. Billed at $10 per 1,000 searches on top of
// tokens, so MAX_SEARCHES is the per-lead cost ceiling (~$0.05 at 5).
// Versions: web_search_20250305 (basic), web_search_20260209 (dynamic
// filtering), web_search_20260318 (adds response_inclusion). Basic is the right
// choice here — the payload is tiny and dynamic filtering needs Claude 4.6+.
const WEB_SEARCH_TOOL = "web_search_20250305";
const MAX_SEARCHES = 5;
// Search turns can pause (stop_reason "pause_turn") and need resuming.
const MAX_TURNS = 6;
const MAX_PER_RUN = 15;                    // safety cap per scheduled run

// Custom field IDs to pull back on the read.
// Reused sales fields: 164 CFCompanyType, 165 CFOpportunityType,
//   166 CFHowDidTheyHear, 167 CFOppSize, 168 CFSalesRequirements,
//   163 CFExistingProvider, 175 CFoppWebsite.
// Website intake: 309 CFdeviceCount, 310 CFcurrentChallenge, 320 CFinquiryType.
// Status flag: 318 CFleadEnrichmentStatus.
const INCLUDE_FIELDS = "163,164,165,166,167,168,175,309,310,318,320";

async function haloToken(env) {
  const res = await fetch(`${env.HALO_BASE_URL}/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: env.HALO_CLIENT_ID,
      client_secret: env.HALO_CLIENT_SECRET,
      scope: "all",
    }),
  });
  if (!res.ok) throw new Error("Halo token failed " + res.status);
  return (await res.json()).access_token;
}

/**
 * IMPORTANT — how Halo returns custom fields.
 *
 * For a single/multiple SELECTION field, `value` is the numeric LOOKUP ID, not
 * the label. Reading `value` and comparing it to "Pending" silently never
 * matches, which is exactly why the enrichment loop no-opped. Halo does supply
 * the label alongside, but the key name varies by version, so try the known
 * spellings before falling back to the raw value.
 */
function cfField(record, name) {
  const list = record.customfields || record.customFields || [];
  return list.find((f) => (f.name || "").toLowerCase() === name.toLowerCase()) || null;
}

function cf(record, name) {
  const f = cfField(record, name);
  if (!f) return "";
  for (const k of ["display", "displayvalue", "displayValue", "valuedisplay", "text", "label"]) {
    if (f[k] !== undefined && f[k] !== null && f[k] !== "") return f[k];
  }
  return f.value ?? "";
}

// CFleadEnrichmentStatus (318) — value order is Pending, Complete, Failed.
// We match on the label when Halo gives us one and fall back to the ID.
// Order matters: these are the lookup value IDs in Halo, in list order.
// "Processing" is the in-flight claim marker — add it as the 4th value on
// CFleadEnrichmentStatus (318) so it lands on ID 4.
const ENRICHMENT_STATUS_BY_ID = { 1: "Pending", 2: "Complete", 3: "Failed", 4: "Processing" };

function enrichmentStatus(record) {
  const f = cfField(record, "CFleadEnrichmentStatus");
  if (!f) return { present: false, label: "(field absent)" };
  const resolved = cf(record, "CFleadEnrichmentStatus");
  if (typeof resolved === "string" && resolved && !/^\d+$/.test(resolved)) {
    return { present: true, label: resolved, source: "label" };
  }
  const n = Number(f.value);
  if (!Number.isNaN(n) && ENRICHMENT_STATUS_BY_ID[n]) {
    return { present: true, label: ENRICHMENT_STATUS_BY_ID[n], source: "id" };
  }
  return { present: true, label: String(f.value ?? ""), source: "raw" };
}

// Rich (HTML) custom fields come back as markup; strip it for the AI prompt.
function stripHtml(value) {
  return String(value || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .trim();
}

async function updateOpportunity(env, token, payload) {
  const res = await fetch(`${env.HALO_BASE_URL}/api/Opportunities`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify([payload]),
  });
  if (!res.ok) throw new Error("Halo update failed " + res.status + " " + (await res.text()));
}

/**
 * Transient vs. terminal.
 *
 * 429 (rate limited) and 5xx — notably 529 "overloaded" — mean "try again
 * later", not "this lead is bad". Marking such a lead Failed removes it from
 * the Pending filter permanently, so a 30-second API blip silently costs you a
 * real prospect. These are retried in-run, then left Pending for the next cron.
 */
const RETRYABLE_HTTP = new Set([408, 409, 425, 429, 500, 502, 503, 504, 529]);
const MAX_ATTEMPTS = 3;
const BACKOFF_MS = [1000, 3000];

/**
 * A real Error subclass, so the retryable-ness is part of the type rather than
 * a property bolted onto a plain Error. Editors flag `e.retryable = true` on an
 * Error instance ("property does not exist"); declaring it in a constructor is
 * the idiomatic form and keeps the checker quiet.
 */
class TransientError extends Error {
  constructor(message) {
    super(message);
    this.name = "TransientError";
    this.retryable = true;
  }
}

function transientError(message) {
  return new TransientError(message);
}

/**
 * Prefer the type check, but fall back to the marker.
 *
 * `instanceof` compares class identity, so it fails if this module ever ends up
 * loaded twice (bundling, or a test harness instantiating it more than once).
 * Misclassifying a transient failure as terminal would park a good lead as
 * Failed, so the belt-and-braces check is worth the extra line.
 */
function isTransient(err) {
  if (err instanceof TransientError) return true;
  return Boolean(err) && err.name === "TransientError" && err.retryable === true;
}

function errorMessage(err) {
  return err instanceof Error ? err.message : String(err);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * The prompt deliberately separates two different kinds of output:
 *
 *   GROUNDED IN THE FORM  — priority_score, deal_size_estimate, pain_points.
 *                           Derived from data the prospect actually submitted.
 *   GROUNDED IN SEARCH    — findings, decision_maker_path, company_verified.
 *                           Must come from a citation or be declared unknown.
 *
 * The previous version said "Research and score this lead" with no search tool
 * attached, which invited the model to invent a research summary. Anything that
 * cannot be sourced must now say so explicitly.
 */
function leadPrompt(lead) {
  return (
    `You are a B2B sales analyst for RIPEDA, an Apple-focused managed IT ` +
    `provider based in Alberta, Canada. Assess this inbound website lead.\n\n` +
    `You have exactly two sources of information: the submitted form data ` +
    `below, and the web_search tool. You have no other knowledge of this ` +
    `company or person.\n\n` +
    `SEARCHES TO RUN (use your ${MAX_SEARCHES} searches deliberately):\n` +
    `a. The company itself — does it exist, what does it do, where, how big.\n` +
    `b. Recent news, last ~18 months: contract wins, funding rounds, ` +
    `acquisitions, expansion, new offices, leadership changes, layoffs. These ` +
    `are buying signals — a firm that just won a big contract or raised money ` +
    `is likelier to be spending on IT.\n` +
    `c. The named contact, to confirm the submitted job title and seniority. ` +
    `Use only professional/public sources: the company's own site, a public ` +
    `professional profile, a press release. Confirm role only — do NOT compile ` +
    `personal detail beyond their professional position at this company.\n` +
    `d. Technology signals if visible: Apple/Mac usage, MDM, job ads ` +
    `mentioning macOS or Jamf.\n\n` +
    `SCORING RUBRIC — score three axes 1-5, then total them.\n\n` +
    `This mirrors RIPEDA's outbound prospecting rubric so inbound and outbound ` +
    `scores mean the same thing, but the anchors are re-cut for inbound, where ` +
    `the prospect has told you who they are and what they want.\n\n` +
    `FIT (1-5) — platform alignment and economic band.\n` +
    `IMPORTANT: RIPEDA is Apple-focused, but a PC shop that wants to MOVE to ` +
    `Apple is an excellent lead, not a poor one — that is a migration project ` +
    `plus a hardware refresh plus ongoing management. Do not score down for ` +
    `being on PC today if they are asking about switching.\n` +
    `  5 — Apple fleet already, or a clear intent to move to Apple; seats ` +
    `roughly 10-250 (RIPEDA's sweet spot); shaped like managed services\n` +
    `  4 — Apple fleet or credible Apple migration interest; seats 5-10 or ` +
    `250-1000 — workable, less ideal\n` +
    `  3 — mixed PC/Mac wanting Apple support, or exploring a switch without ` +
    `having committed\n` +
    `  2 — PC-only with only vague Apple curiosity, or seats right at the ` +
    `economic margin (~5)\n` +
    `  1 — PC-only with no Apple interest; or a competitor/MSP, an existing ` +
    `RIPEDA client, under 5 seats, or 5000+ seats with mature in-house IT\n\n` +
    `INTENT (1-5) — what they asked for, and why now. The submission itself is ` +
    `already a fresh signal, so do NOT score on recency; score on commitment.\n` +
    `  5 — Full MSP support requested AND a change trigger present (leaving ` +
    `their current provider, recent funding or contract win, new office, rapid ` +
    `growth, or an urgent pain such as outages or a security incident)\n` +
    `  4 — Full MSP or DaaS requested with a clearly articulated operational pain\n` +
    `  3 — specific service enquiry with a defined problem\n` +
    `  2 — general or exploratory enquiry, no stated pain or timeline\n` +
    `  1 — one-off transactional request (a single repair), or too vague to act on\n\n` +
    `REACHABILITY (1-5) — who submitted, and did their role verify.\n` +
    `  5 — owner, C-level or IT decision-maker, title CONFIRMED by a public ` +
    `source, with both email and phone\n` +
    `  4 — owner, C-level or IT lead by submitted title, not independently confirmed\n` +
    `  3 — manager or non-IT exec at a small org (can still decide), or a clear ` +
    `influencer\n` +
    `  2 — junior or unclear role with no obvious budget authority\n` +
    `  1 — no usable route: generic role, free-email domain not matching the ` +
    `company, or a contact that looks fabricated\n\n` +
    `TOTAL = (Fit x 3) + (Intent x 2) + Reachability. Max 30. >= 20 is worked first.\n\n` +
    `Note any serviceability concern in score_basis (under 5 seats, competitor, ` +
    `existing client, very large with in-house IT) but still score the lead.\n\n` +
    `RULES — these matter more than producing a complete-looking answer:\n` +
    `1. Every factual claim about the company or the contact MUST come from a ` +
    `search result. If you did not find it, do not state it.\n` +
    `2. If search returns nothing about this company, say so plainly. Do NOT ` +
    `infer anything from the company name itself.\n` +
    `3. Never invent people, job titles, reporting lines, revenue, headcount, ` +
    `client lists, or existing IT arrangements.\n` +
    `4. If you cannot confirm the named contact, say so explicitly. An ` +
    `unconfirmable contact at a real company is a useful signal, not a gap to ` +
    `paper over.\n` +
    `5. Scoring may reason from the submitted form data alone — that is ` +
    `expected, and you must say which fields drove it.\n` +
    `6. Obviously fake or placeholder submissions (test data, nonsense names, ` +
    `malformed domains) should be reported as such, with a low score.\n` +
    `7. Output PLAIN TEXT inside the JSON values. No citation markup, no ` +
    `<cite> tags, no markdown links, no HTML. Sources are captured separately.\n\n` +
    `Return ONLY valid JSON, no markdown, with exactly these keys:\n` +
    `- company_verified: "confirmed" | "not_found" | "ambiguous" | "appears_fake"\n` +
    `- fit_score: integer 1-5 per the FIT anchors above\n` +
    `- intent_score: integer 1-5 per the INTENT anchors above\n` +
    `- reachability_score: integer 1-5 per the REACHABILITY anchors above\n` +
    `- priority_score: integer 3-30 = (fit_score x 3) + (intent_score x 2) + reachability_score\n` +
    `- score_basis: one or two sentences justifying each axis, plus any ` +
    `serviceability concern\n` +
    `- platform_today: "apple" | "windows" | "mixed" | "unknown" — what they run ` +
    `NOW, and note if they are asking to switch\n` +
    `- deal_size_estimate: short string, from the submitted device/seat counts\n` +
    `- contact_authority: what the SUBMITTED job title implies, or "unknown"\n` +
    `- contact_verification: whether the named contact was confirmed at this ` +
    `company and by what kind of source, or exactly "contact not confirmed"\n` +
    `- decision_maker_path: only if sourced from search; otherwise "insufficient data"\n` +
    `- pain_points: from the submitted challenge and requirements only\n` +
    `- recent_news: sourced developments with rough dates, or exactly ` +
    `"no recent news found"\n` +
    `- buying_signals: anything suggesting they are in a spending cycle ` +
    `(growth, funding, contract wins, hiring, office moves), or exactly "none identified"\n` +
    `- findings: 2-4 sentences of SOURCED facts about the company only, or ` +
    `exactly "No public information found for this company."\n` +
    `- confidence: "high" | "medium" | "low"\n\n` +
    `Form data as submitted:\n${JSON.stringify(lead, null, 2)}`
  );
}

/**
 * Clean model prose before it reaches Halo or Slack.
 *
 * With web search on, the model emits inline citation markup like
 * <cite index="2-1,2-2">...</cite>, and sometimes markdown links such as
 * [(403) 555-0100](tel:...). Written raw into a Halo custom field that is
 * unreadable noise. The real sources are collected separately in _citations,
 * so the tags carry no information we lose by removing them.
 */
function sanitizeModelText(value) {
  if (value === null || value === undefined) return "";
  let s = String(value);
  s = s.replace(/<\/?cite\b[^>]*>/gi, "");        // citation markup
  s = s.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");  // [text](url) -> text
  s = s.replace(/<[^>]+>/g, "");                  // any other stray tags
  s = s.replace(/[ \t]{2,}/g, " ");
  s = s.replace(/\n{3,}/g, "\n\n");
  return s.trim();
}

/**
 * Recompute the total from the sub-scores rather than trusting the model's
 * arithmetic, and clamp each axis to 1-5. An LLM adding three weighted numbers
 * is a needless failure point when the formula is fixed and known.
 *
 * Returns the axes plus the authoritative total, and flags a disagreement so a
 * silently-wrong model is visible rather than invisible.
 */
const SCORE_WEIGHTS = { fit: 3, intent: 2, reachability: 1 };
const SCORE_MAX = 30;
const SCORE_WORK_FIRST = 20;

function clampAxis(value) {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n)) return null;
  return Math.min(5, Math.max(1, n));
}

function computeScore(r) {
  const fit = clampAxis(r.fit_score);
  const intent = clampAxis(r.intent_score);
  const reach = clampAxis(r.reachability_score);

  // If the model omitted the axes entirely, fall back to whatever total it gave
  // so a lead is never silently zeroed.
  if (fit === null || intent === null || reach === null) {
    const fallback = Math.round(Number(r.priority_score));
    return {
      fit,
      intent,
      reachability: reach,
      total: Number.isFinite(fallback) ? Math.min(SCORE_MAX, Math.max(0, fallback)) : 0,
      axesMissing: true,
    };
  }

  const total =
    fit * SCORE_WEIGHTS.fit + intent * SCORE_WEIGHTS.intent + reach * SCORE_WEIGHTS.reachability;
  const claimed = Math.round(Number(r.priority_score));
  return {
    fit,
    intent,
    reachability: reach,
    total,
    axesMissing: false,
    modelDisagreed: Number.isFinite(claimed) && claimed !== total ? claimed : null,
  };
}

/** Apply sanitizeModelText to every string field the model produced. */
const MODEL_TEXT_FIELDS = [
  "score_basis",
  "deal_size_estimate",
  "contact_authority",
  "decision_maker_path",
  "pain_points",
  "findings",
  "recent_news",
  "buying_signals",
  "contact_verification",
  "platform_today",
];

function sanitizeResult(r) {
  const out = { ...r };
  for (const k of MODEL_TEXT_FIELDS) {
    if (k in out) out[k] = sanitizeModelText(out[k]);
  }
  return out;
}

/** Collect {url,title} from citations and from raw search results, deduped. */
function extractCitations(contentBlocks) {
  const byUrl = new Map();
  for (const block of contentBlocks || []) {
    for (const c of block?.citations || []) {
      if (c?.url && !byUrl.has(c.url)) byUrl.set(c.url, c.title || c.url);
    }
    if (block?.type === "web_search_tool_result" && Array.isArray(block.content)) {
      for (const r of block.content) {
        if (r?.url && !byUrl.has(r.url)) byUrl.set(r.url, r.title || r.url);
      }
    }
  }
  return [...byUrl].map(([url, title]) => ({ url, title }));
}

/** Surface search-tool errors: the API returns 200 with the error nested. */
function searchToolErrors(contentBlocks) {
  const errs = [];
  for (const block of contentBlocks || []) {
    if (
      block?.type === "web_search_tool_result" &&
      block.content?.type === "web_search_tool_result_error"
    ) {
      errs.push(block.content.error_code || "unknown");
    }
  }
  return errs;
}

/**
 * With search enabled the reply is many blocks: narration, server_tool_use,
 * results, then the answer. Take the LAST text block that parses as JSON.
 */
function parseJsonFromBlocks(contentBlocks) {
  const texts = (contentBlocks || [])
    .filter((b) => b?.type === "text" && typeof b.text === "string")
    .map((b) => b.text);

  for (let i = texts.length - 1; i >= 0; i--) {
    const cleaned = texts[i].trim().replace(/^```json\s*|\s*```$/g, "");
    try {
      return JSON.parse(cleaned);
    } catch {
      const first = cleaned.indexOf("{");
      const last = cleaned.lastIndexOf("}");
      if (first !== -1 && last > first) {
        try {
          return JSON.parse(cleaned.slice(first, last + 1));
        } catch {
          /* keep looking */
        }
      }
    }
  }
  return null;
}

/** One HTTP request to /v1/messages, with retry on transient failures. */
async function postMessages(env, model, messages) {
  let lastErr;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    let res;
    try {
      res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          // Larger than before: search results and citations share this budget.
          max_tokens: 4096,
          // The actual lookup capability. Anthropic runs these server-side and
          // returns cited results; max_uses is the cost ceiling per request.
          tools: [{ type: WEB_SEARCH_TOOL, name: "web_search", max_uses: MAX_SEARCHES }],
          messages,
        }),
      });
    } catch (netErr) {
      lastErr = transientError(`${model} network error: ${errorMessage(netErr)}`);
      console.log(`[enrichment] ${model} attempt ${attempt}/${MAX_ATTEMPTS} ${lastErr.message}`);
      if (attempt < MAX_ATTEMPTS) await sleep(BACKOFF_MS[attempt - 1]);
      continue;
    }

    if (res.ok) return await res.json();

    const bodyText = (await res.text()).slice(0, 300);
    if (RETRYABLE_HTTP.has(res.status)) {
      lastErr = transientError(`${model} ${res.status} (retryable): ${bodyText}`);
      console.log(`[enrichment] ${model} attempt ${attempt}/${MAX_ATTEMPTS} ${lastErr.message}`);
      if (attempt < MAX_ATTEMPTS) await sleep(BACKOFF_MS[attempt - 1]);
      continue;
    }

    // 400 / 401 / 403 — config or payload. Retrying won't help, and it will
    // fail identically on the fallback model, so don't waste that call either.
    throw new Error(`${model} ${res.status} (terminal): ${bodyText}`);
  }
  throw lastErr || transientError(`${model} failed after ${MAX_ATTEMPTS} attempts`);
}

/**
 * One model, run to completion. A search turn can come back as
 * stop_reason "pause_turn"; to continue you send the assistant message back
 * unchanged. Accumulates content blocks across turns so citations from earlier
 * turns are not lost.
 */
async function callModel(env, model, prompt) {
  const messages = [{ role: "user", content: prompt }];
  const allBlocks = [];
  let searches = 0;

  for (let turn = 1; turn <= MAX_TURNS; turn++) {
    const data = await postMessages(env, model, messages);
    searches += data?.usage?.server_tool_use?.web_search_requests || 0;
    if (Array.isArray(data?.content)) allBlocks.push(...data.content);

    const searchErrs = searchToolErrors(data?.content);
    if (searchErrs.length) {
      console.log(`[enrichment] ${model} web_search errors: ${searchErrs.join(", ")}`);
    }

    if (data?.stop_reason === "pause_turn") {
      // Long-running search paused. Send it back verbatim to resume.
      messages.push({ role: "assistant", content: data.content });
      console.log(`[enrichment] ${model} pause_turn, resuming (turn ${turn}/${MAX_TURNS})`);
      continue;
    }

    const parsed = parseJsonFromBlocks(data?.content);
    if (!parsed) {
      // A formatting miss, not a bad lead — treat as transient so the record
      // stays Pending rather than being parked as Failed.
      throw transientError(`${model} returned no parseable JSON (stop_reason ${data?.stop_reason})`);
    }

    return {
      ...sanitizeResult(parsed),
      _model: model,
      _searches: searches,
      _citations: extractCitations(allBlocks),
      _searchErrors: searchErrs,
    };
  }

  throw transientError(`${model} did not finish within ${MAX_TURNS} turns`);
}

/**
 * Primary model, then FALLBACK_MODEL if the primary is capacity-constrained.
 * An inbound prospect scored by Haiku beats an inbound prospect not scored at
 * all. The model that produced the result is recorded on the lead so a score
 * can always be traced back to what generated it.
 *
 * A terminal error is NOT retried on the fallback — a bad API key or malformed
 * request will fail the same way and only burns time.
 */
async function researchLead(env, lead) {
  const prompt = leadPrompt(lead);
  const chain = [MODEL, FALLBACK_MODEL].filter(Boolean);

  let lastTransient;
  for (const model of chain) {
    try {
      const result = await callModel(env, model, prompt);
      if (model !== MODEL) {
        console.log(`[enrichment] NOTE scored with fallback model ${model} (primary ${MODEL} unavailable)`);
      }
      console.log(
        `[enrichment] ${model} done: verification=${result.company_verified || "?"} ` +
          `confidence=${result.confidence || "?"} searches=${result._searches ?? 0} ` +
          `sources=${(result._citations || []).length}`
      );
      if ((result._searches ?? 0) === 0) {
        // Loud, because a zero-search result is inference, not research — the
        // exact failure mode this whole change exists to prevent.
        console.log(`[enrichment] WARNING no web searches ran; findings are UNSOURCED`);
      }
      return { ...result, _model: model };
    } catch (e) {
      if (!isTransient(e)) throw e; // terminal — fallback won't help
      lastTransient = e;
      console.log(`[enrichment] ${model} exhausted retries; ${model === chain[chain.length - 1] ? "no fallback left" : "trying fallback"}`);
    }
  }

  throw lastTransient || transientError("all models failed");
}

/**
 * Compose the Halo research field so provenance travels with the content.
 * If nothing was verified, that is stated up front rather than buried.
 */
function researchFieldValue(r) {
  const findings = (r.findings || "").trim();
  if (!findings && !r.company_verified) return "";

  const verified = r.company_verified || "unknown";
  const searches = r._searches ?? 0;
  const lines = [];

  if (verified === "appears_fake") {
    lines.push("[FLAGGED: submission appears to be test or placeholder data]");
  } else if (verified === "not_found") {
    lines.push("[NOT VERIFIED: no public information found for this company]");
  }

  lines.push(findings || "No public information found for this company.");

  // Kept as labelled sections so a reader can tell company research from
  // buying signals from contact verification at a glance.
  if (r.recent_news) {
    lines.push("");
    lines.push(`RECENT NEWS: ${r.recent_news}`);
  }
  if (r.buying_signals) {
    lines.push("");
    lines.push(`BUYING SIGNALS: ${r.buying_signals}`);
  }
  if (r.contact_verification) {
    lines.push("");
    lines.push(`CONTACT CHECK: ${r.contact_verification}`);
  }

  const s = r._score || {};
  if (s.fit != null) {
    lines.push("");
    lines.push(
      `SCORE ${s.total}/${SCORE_MAX}` +
        `${s.total >= SCORE_WORK_FIRST ? " (work first)" : ""} — ` +
        `Fit ${s.fit}/5 x3, Intent ${s.intent}/5 x2, Reachability ${s.reachability}/5`
    );
  }
  if (r.platform_today) lines.push(`PLATFORM TODAY: ${r.platform_today}`);

  lines.push("");
  lines.push(
    `[verification: ${verified} | confidence: ${r.confidence || "unknown"} | ` +
      `web searches run: ${searches} | model: ${r._model || MODEL}]`
  );
  if (r.score_basis) lines.push(`[score basis: ${r.score_basis}]`);

  const cites = r._citations || [];
  if (cites.length) {
    lines.push("");
    lines.push("Sources:");
    for (const c of cites.slice(0, 10)) lines.push(`- ${c.title} — ${c.url}`);
  } else if (searches > 0) {
    lines.push("");
    lines.push("Sources: none cited (searches ran but returned nothing usable)");
  } else {
    lines.push("");
    lines.push("Sources: NONE — no web search was performed for this lead");
  }
  return lines.join("\n");
}

const VERIFY_BADGE = {
  confirmed: "✅ verified",
  ambiguous: "⚠️ ambiguous match",
  not_found: "❓ not found online",
  appears_fake: "🚩 looks like test data",
};

async function postSlack(env, lead, r) {
  const score = parseInt(r.priority_score, 10) || 0;
  const verified = r.company_verified || "unknown";
  const searches = r._searches ?? 0;
  const cites = r._citations || [];
  const s = r._score || {};

  // Thresholds are on the /30 scale now: >= 20 is RIPEDA's "work first" line.
  // An unverified or fake-looking lead is red regardless of score, so it can't
  // be mistaken for a hot prospect at a glance.
  const suspect = verified === "appears_fake" || verified === "not_found";
  const color = suspect
    ? "#e01e5a"
    : score >= SCORE_WORK_FIRST
      ? "#2eb67d"
      : score >= 12
        ? "#ecb22e"
        : "#e01e5a";

  const badge = VERIFY_BADGE[verified] || "❓ unverified";
  const sourceLine = cites.length
    ? cites.slice(0, 5).map((c) => `<${c.url}|${c.title}>`).join("\n")
    : searches > 0
      ? "_searches ran, nothing usable returned_"
      : "*none — no web search performed*";

  const fields = [
    { title: "Contact", value: `${lead.contact_name}\n${lead.email}\n${lead.phone}`, short: true },
    { title: "Industry / Size", value: `${lead.industry || "—"} / ${lead.company_size || "—"}`, short: true },
    { title: "Interested in", value: lead.inquiry_type || "—", short: true },
    { title: "Deal size (from form)", value: r.deal_size_estimate || "—", short: true },
    {
      title: "Score breakdown",
      value:
        s.fit != null
          ? `Fit ${s.fit}/5 ×3 = ${s.fit * 3}  ·  Intent ${s.intent}/5 ×2 = ${s.intent * 2}` +
            `  ·  Reach ${s.reachability}/5 = ${s.reachability}   →   *${score}/${SCORE_MAX}*`
          : "sub-scores unavailable",
      short: false,
    },
    { title: "Platform today", value: r.platform_today || "unknown", short: true },
    { title: "Score basis", value: r.score_basis || "—", short: false },
    { title: "Contact authority (from submitted title)", value: r.contact_authority || "—", short: false },
    { title: "Contact check", value: r.contact_verification || "not checked", short: false },
    { title: "Decision-maker path", value: r.decision_maker_path || "insufficient data", short: false },
    { title: "Key pain points (as submitted)", value: r.pain_points || "—", short: false },
    // Labelled "Findings" not "Summary", and only ever sourced content.
    { title: "Findings (sourced)", value: r.findings || "—", short: false },
    { title: "Recent news", value: r.recent_news || "no recent news found", short: false },
    { title: "Buying signals", value: r.buying_signals || "none identified", short: false },
    { title: "Sources", value: sourceLine, short: false },
  ];

  // NOTE: no top-level `text`. Setting both `text` and `attachments` makes
  // Slack render a summary line AND a card, which reads as two posts. The
  // attachment's `fallback` supplies the notification preview instead.
  await fetch(env.SLACK_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      attachments: [
        {
          color,
          fallback: `New website lead: ${lead.company || lead.summary} — ${score}/${SCORE_MAX} (${badge})`,
          title:
            `${lead.company || "New lead"} — ${score}/${SCORE_MAX}` +
            `${score >= SCORE_WORK_FIRST ? " · WORK FIRST" : ""} · ${badge}`,
          fields,
          footer:
            `HaloPSA opportunity #${lead.id}` +
            ` · confidence ${r.confidence || "unknown"}` +
            ` · ${searches} search${searches === 1 ? "" : "es"}` +
            ` · ${r._model || MODEL}` +
            (r._model && r._model !== MODEL ? " (fallback)" : ""),
        },
      ],
    }),
  });
}

function listUrl(env, opts = {}) {
  const p = new URLSearchParams();
  if (opts.openOnly !== false) p.set("open_only", "true");
  if (opts.byType !== false) p.set("requesttype_id", String(LEAD_OPPORTUNITY_TYPE_ID));
  p.set("include_custom_fields", INCLUDE_FIELDS);
  p.set("page_size", "50");
  p.set("pageinate", "true");
  return `${env.HALO_BASE_URL}/api/Opportunities?${p.toString()}`;
}

// Halo has returned the array under different keys across versions; don't guess.
function extractRecords(body) {
  if (Array.isArray(body)) return { key: "(root array)", records: body };
  for (const k of ["opportunities", "tickets", "records", "data"]) {
    if (Array.isArray(body?.[k])) return { key: k, records: body[k] };
  }
  const found = Object.keys(body || {}).find((k) => Array.isArray(body[k]));
  return found ? { key: found, records: body[found] } : { key: null, records: [] };
}

/**
 * Diagnostics — hit  <worker-url>?debug=1  to see exactly what Halo returns.
 * Read-only: never calls Claude, never posts to Slack, never writes to Halo.
 * Tries three query variants so a bad filter is obvious rather than inferred.
 */
async function diagnose(env) {
  const out = { build: BUILD, leadTypeId: LEAD_OPPORTUNITY_TYPE_ID, variants: [] };

  try {
    await haloToken(env);
    out.haloAuth = "ok";
  } catch (e) {
    out.haloAuth = "FAILED: " + errorMessage(e);
    return out;
  }
  const token = await haloToken(env);

  const variants = [
    { label: "as the cron runs it", opts: {} },
    { label: "no requesttype_id filter", opts: { byType: false } },
    { label: "no open_only filter", opts: { openOnly: false } },
  ];

  for (const v of variants) {
    const url = listUrl(env, v.opts);
    const entry = { label: v.label, url: url.replace(env.HALO_BASE_URL, "") };
    try {
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      entry.httpStatus = res.status;
      const text = await res.text();
      if (!res.ok) {
        entry.error = text.slice(0, 500);
        out.variants.push(entry);
        continue;
      }
      const body = JSON.parse(text);
      entry.topLevelKeys = Object.keys(body || {});
      const { key, records } = extractRecords(body);
      entry.arrayFoundUnderKey = key;
      entry.recordCount = records.length;
      entry.records = records.slice(0, 10).map((o) => ({
        id: o.id,
        summary: o.summary,
        tickettype_id: o.tickettype_id,
        requesttype_id: o.requesttype_id,
        oppcompanyname: o.oppcompanyname,
        // The whole custom-field payload, verbatim. If CFleadEnrichmentStatus
        // is absent or shaped differently, this is where it shows up.
        customFieldKeys: Object.keys(o).filter((k) => /custom/i.test(k)),
        customfields: o.customfields || o.customFields || null,
        // Which keys a selection field actually carries — this is what told us
        // `value` was a lookup ID rather than the label.
        selectionFieldShape: (o.customfields || o.customFields || [])
          .filter((f) => /leadEnrichmentStatus|OppSize|CompanyType|OpportunityType/i.test(f.name || ""))
          .map((f) => ({ name: f.name, keys: Object.keys(f), value: f.value, resolved: cf(o, f.name) })),
        enrichmentStatus: enrichmentStatus(o),
        wouldEnrich: isPending(o),
      }));
      entry.pendingCount = records.filter(isPending).length;
    } catch (e) {
      entry.error = errorMessage(e);
    }
    out.variants.push(entry);
  }
  return out;
}

/**
 * Length-safe comparison that does not short-circuit on the first differing
 * byte. Overkill for a shared secret on a low-traffic Worker, but free.
 */
function secretsMatch(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Gate for the whole HTTP surface.
 *
 * Every fetch route either exposes lead data (?debug=1 returns contact names,
 * emails and phone numbers) or costs money (a run spends web searches and
 * tokens; ?requeue writes to Halo). None of it should be reachable by anyone
 * who guesses the workers.dev hostname.
 *
 * Fails CLOSED: if ADMIN_KEY is unset, nothing is reachable. A misconfigured
 * deploy should lock us out, not open the door.
 *
 * The cron trigger calls scheduled(), not fetch(), so automated runs are
 * unaffected by this.
 */
function authorized(request, env, url) {
  const expected = env.ADMIN_KEY;
  if (!expected) return false;
  const supplied = request.headers.get("X-Admin-Key") || url.searchParams.get("key") || "";
  return secretsMatch(supplied, expected);
}

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(run(env));
  },
  // All routes require ADMIN_KEY, via the X-Admin-Key header (preferred) or a
  // ?key= parameter (convenient in a browser, but it lands in history and logs).
  //   curl -H "X-Admin-Key: $KEY" https://<worker>/?debug=1
  async fetch(request, env) {
    const url = new URL(request.url);
    const json = (o, status = 200) =>
      new Response(JSON.stringify(o, null, 2), {
        status,
        headers: { "Content-Type": "application/json" },
      });

    // Only the root path triggers work.
    //
    // Without this, opening the Worker URL in a browser fires TWO runs: one for
    // the page and one for /favicon.ico. They race — both read the record as
    // Pending before either writes — so the lead gets enriched twice, charged
    // twice, and posted to Slack twice.
    if (url.pathname !== "/") {
      return json({ build: BUILD, ignored: url.pathname }, 404);
    }
    if (request.method !== "GET" && request.method !== "POST") {
      return json({ build: BUILD, error: "method not allowed" }, 405);
    }

    // 404 rather than 401: an unauthenticated prober learns nothing about
    // whether this endpoint exists or what it does.
    if (!authorized(request, env, url)) {
      console.log(`[enrichment] denied ${request.method} from ${request.headers.get("CF-Connecting-IP") || "?"}`);
      return json({ error: "not found" }, 404);
    }

    if (url.searchParams.get("debug") === "1") return json(await diagnose(env));

    // ?requeue=failed | complete | all | <opportunityId>   ("1" == failed)
    // Resets the status flag so the next run reprocesses. See requeue().
    const rq = url.searchParams.get("requeue");
    if (rq) return json(await requeue(env, rq === "1" ? "failed" : rq));

    try {
      return json(await run(env));
    } catch (e) {
      return json({ build: BUILD, error: errorMessage(e), stack: e instanceof Error ? e.stack : undefined });
    }
  },
};

// Tolerant of label-vs-ID, whitespace and casing so nothing stalls the pipeline.
function isPending(record) {
  return enrichmentStatus(record).label.trim().toLowerCase() === "pending";
}

function statusLabel(record) {
  return enrichmentStatus(record).label.trim().toLowerCase();
}

/**
 * Flip records back to Pending so the next run reprocesses them.
 *
 * `scope` is deliberately explicit rather than defaulting to everything:
 *   failed   — recover from a parked failure (the original use case)
 *   complete — re-run leads that already succeeded, e.g. after a prompt change
 *   all      — both
 *   <number> — one specific opportunity ID
 *
 * Reprocessing spends real money now that web search is enabled (up to
 * MAX_SEARCHES per lead), so "complete" and "all" must be asked for by name.
 * Does not call Claude or Slack — it only resets the flag.
 */
async function requeue(env, scope = "failed") {
  const out = { build: BUILD, scope, requeued: [], skipped: [], errors: [] };
  const token = await haloToken(env);
  const res = await fetch(listUrl(env), { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) {
    out.errors.push(`Halo list failed ${res.status}`);
    return out;
  }
  const { records } = extractRecords(await res.json());
  out.recordsSeen = records.length;

  const targetId = /^\d+$/.test(String(scope)) ? Number(scope) : null;
  const wanted = (o) => {
    if (targetId !== null) return o.id === targetId;
    const s = statusLabel(o);
    // "all" deliberately excludes Processing — those may be in flight right
    // now, and resetting them would cause the duplicate this guard prevents.
    if (scope === "all") return s === "failed" || s === "complete";
    if (scope === "complete") return s === "complete";
    if (scope === "processing") return s === "processing";
    return s === "failed";
  };

  const targets = records.filter(wanted);
  out.matched = targets.length;
  for (const o of records) {
    if (!targets.includes(o)) out.skipped.push({ id: o.id, status: statusLabel(o) || "(blank)" });
  }
  if (!targets.length) {
    out.hint =
      targetId !== null
        ? `opportunity ${targetId} not in the current list — it may be closed, or not on Lead type ${LEAD_OPPORTUNITY_TYPE_ID}`
        : `no records with status "${scope}". Try ?requeue=complete to re-run already-enriched leads, or ?requeue=all`;
  }

  const estimatedSearches = targets.length * MAX_SEARCHES;
  if (targets.length) {
    out.costNote = `up to ${estimatedSearches} web searches on the next run (~$${(estimatedSearches * 0.01).toFixed(2)})`;
  }

  for (const o of targets) {
    try {
      await updateOpportunity(env, token, {
        id: o.id,
        customfields: [{ name: "CFleadEnrichmentStatus", value: "Pending" }],
      });
      out.requeued.push(o.id);
      console.log(`[enrichment] requeued opportunity ${o.id} (was ${statusLabel(o)}) -> Pending`);
    } catch (e) {
      out.errors.push(`${o.id}: ${errorMessage(e)}`);
    }
  }
  return out;
}

async function run(env) {
  const summary = {
    build: BUILD,
    fetched: 0,
    pending: 0,
    enriched: 0,
    deferred: 0, // transient failure, left Pending for the next run
    failed: 0, // terminal failure, parked as Failed
    notes: [],
  };
  console.log(`[enrichment] start build=${BUILD}`);

  const token = await haloToken(env);
  console.log("[enrichment] Halo auth ok");

  const url = listUrl(env);
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) {
    const text = await res.text();
    console.log(`[enrichment] Halo list FAILED ${res.status} ${text.slice(0, 300)}`);
    throw new Error("Halo list failed " + res.status);
  }
  const body = await res.json();
  const { key, records } = extractRecords(body);
  summary.fetched = records.length;
  summary.arrayFoundUnderKey = key;
  console.log(
    `[enrichment] Halo returned ${records.length} record(s) under "${key}"; ` +
      `top-level keys: ${Object.keys(body || {}).join(",")}`
  );

  // Only enrich records the receiver flagged Pending. Manually created leads
  // have the field blank, so they are left alone.
  const pending = records.filter(isPending).slice(0, MAX_PER_RUN);
  summary.pending = pending.length;

  if (records.length && !pending.length) {
    // The most common silent failure: records exist but the status flag is not
    // what we expect. Log what we actually saw so it needs no guesswork.
    const seen = records.map((o) => {
      const s = enrichmentStatus(o);
      return { id: o.id, status: s.label, resolvedFrom: s.source || "n/a" };
    });
    summary.notes.push("records found but none Pending");
    summary.statusesSeen = seen;
    console.log(`[enrichment] no Pending records. Statuses seen: ${JSON.stringify(seen)}`);
  }
  if (!records.length) {
    summary.notes.push("Halo returned zero records for this query — check the filters via ?debug=1");
    console.log("[enrichment] zero records returned; try ?debug=1");
  }

  for (const o of pending) {
    const lead = {
      id: o.id,
      summary: o.summary,
      // Native opportunity fields — the receiver writes these directly, so no
      // more scraping the details body with regexes.
      contact_name: o.oppcontactname || "",
      email: o.oppemailaddress || "",
      phone: o.opptel || "",
      company: o.oppcompanyname || "",
      job_title: o.oppcustomertitle || "",
      website: cf(o, "CFoppWebsite"),
      company_size: cf(o, "CFOppSize"),
      industry: cf(o, "CFCompanyType"),
      opportunity_type: cf(o, "CFOpportunityType"),
      existing_provider: cf(o, "CFExistingProvider"),
      inquiry_type: cf(o, "CFinquiryType"),
      current_challenge: cf(o, "CFcurrentChallenge"),
      device_count: cf(o, "CFdeviceCount"),
      requirements: stripHtml(cf(o, "CFSalesRequirements")),
    };

    // Selection fields come back as lookup IDs unless Halo also sends a label.
    // A bare number here means the AI would be scoring "industry: 7" — useless.
    // Drop those rather than feed Claude noise, and say so loudly in the log.
    const numericish = [];
    for (const k of ["company_size", "industry", "opportunity_type", "existing_provider", "inquiry_type"]) {
      const v = lead[k];
      if (v !== "" && v !== null && v !== undefined && /^\d+$/.test(String(v).trim())) {
        numericish.push(`${k}=${v}`);
        lead[k] = "";
      }
    }
    if (numericish.length) {
      const msg = `opportunity ${o.id}: selection fields returned as IDs, omitted from prompt (${numericish.join(", ")})`;
      summary.notes.push(msg);
      console.log(`[enrichment] WARNING ${msg}`);
    }

    // CLAIM THE RECORD FIRST.
    //
    // Flip Pending -> Processing before spending money on search and inference.
    // Any concurrent run (manual trigger overlapping the cron, a browser's
    // favicon request, a retry) will no longer see this record as Pending, so
    // it cannot be enriched or posted to Slack twice.
    try {
      await updateOpportunity(env, token, {
        id: o.id,
        customfields: [{ name: "CFleadEnrichmentStatus", value: "Processing" }],
      });
      console.log(`[enrichment] claimed opportunity ${o.id} (Pending -> Processing)`);
    } catch (claimErr) {
      // Could not claim it — skip rather than risk a duplicate.
      summary.skippedUnclaimed = (summary.skippedUnclaimed || 0) + 1;
      summary.notes.push(`opportunity ${o.id} skipped, claim failed: ${errorMessage(claimErr)}`);
      console.log(`[enrichment] SKIP ${o.id}, claim failed: ${errorMessage(claimErr)}`);
      continue;
    }

    try {
      console.log(`[enrichment] researching opportunity ${o.id} (${lead.company})`);
      const raw = await researchLead(env, lead);

      // Trust the axes, not the model's addition.
      const score = computeScore(raw);
      const r = { ...raw, priority_score: score.total, _score: score };
      if (score.axesMissing) {
        summary.notes.push(`opportunity ${o.id}: model omitted sub-scores, used its total`);
        console.log(`[enrichment] WARNING ${o.id} returned no sub-scores`);
      } else if (score.modelDisagreed !== null) {
        console.log(
          `[enrichment] NOTE ${o.id} model said ${score.modelDisagreed}, ` +
            `recomputed ${score.total} from F${score.fit}/I${score.intent}/R${score.reachability}`
        );
      }
      console.log(
        `[enrichment] ${o.id} score ${score.total}/${SCORE_MAX} ` +
          `(fit ${score.fit} x3, intent ${score.intent} x2, reach ${score.reachability})` +
          `${score.total >= SCORE_WORK_FIRST ? " — WORK FIRST" : ""}`
      );

      await updateOpportunity(env, token, {
        id: o.id,
        customfields: [
          { name: "CFleadPriorityScore", value: parseInt(r.priority_score, 10) || 0 },
          { name: "CFleadDealSize", value: r.deal_size_estimate || "" },
          { name: "CFleadContactAuthority", value: r.contact_authority || "" },
          { name: "CFleadDecisionPath", value: r.decision_maker_path || "" },
          { name: "CFleadPainPoints", value: r.pain_points || "" },
          {
            name: "CFleadAIResearch",
            // Findings plus provenance: verification status, confidence, how
            // many searches ran, which model, and the actual source URLs. A
            // reader must be able to tell sourced fact from model reasoning.
            value: researchFieldValue(r),
          },
          { name: "CFleadEnrichmentStatus", value: "Complete" },
          { name: "CFleadEnrichedAt", value: new Date().toISOString().split("T")[0] },
        ],
      });
      summary.enriched++;
      console.log(`[enrichment] opportunity ${o.id} written, status Complete`);

      // Slack is deliberately OUTSIDE the block that decides the Halo status.
      // A dead webhook is cosmetic; it must not mark an enriched lead Failed
      // and hide it from the Pending filter forever.
      try {
        await postSlack(env, lead, r);
        console.log(`[enrichment] Slack posted for ${o.id}`);
      } catch (slackErr) {
        summary.notes.push(`Slack post failed for ${o.id}: ${errorMessage(slackErr)}`);
        console.log(`[enrichment] Slack FAILED for ${o.id}: ${errorMessage(slackErr)}`);
      }
    } catch (e) {
      if (isTransient(e)) {
        // Release the claim: put it back to Pending so the next cron run picks
        // it up. A 529 is Anthropic being busy; the lead is fine and must not
        // be left stuck in Processing.
        summary.deferred++;
        summary.notes.push(`opportunity ${o.id} deferred (transient): ${errorMessage(e)}`);
        console.log(`[enrichment] DEFERRED opportunity ${o.id}, releasing to Pending: ${errorMessage(e)}`);
        try {
          await updateOpportunity(env, token, {
            id: o.id,
            customfields: [{ name: "CFleadEnrichmentStatus", value: "Pending" }],
          });
        } catch (relErr) {
          // Left in Processing — recoverable with ?requeue=processing.
          summary.notes.push(`opportunity ${o.id} STUCK in Processing: ${errorMessage(relErr)}`);
          console.log(`[enrichment] WARNING ${o.id} stuck in Processing; use ?requeue=processing`);
        }
        continue;
      }
      summary.failed++;
      console.log(`[enrichment] TERMINAL error on opportunity ${o.id}: ${errorMessage(e)}`);
      // Only genuine, non-retryable problems get parked as Failed.
      try {
        await updateOpportunity(env, token, {
          id: o.id,
          customfields: [{ name: "CFleadEnrichmentStatus", value: "Failed" }],
        });
      } catch (_) {}
    }
  }

  console.log(`[enrichment] done ${JSON.stringify(summary)}`);
  return summary;
}
