/**
 * RIPEDA Website Lead — Receiver Worker
 * -------------------------------------
 * Runs on: ripeda-website-lead-receiver.wandering-silence-da5d.workers.dev
 * Job: receive the website contact form, confirm it's a real person (Turnstile),
 *      then create a prospect OPPORTUNITY in HaloPSA on the "Lead" type.
 *
 * WHY AN OPPORTUNITY, NOT A TICKET
 * A plain Halo ticket requires a Client/Site/User, so a client-less website
 * enquiry fails with 400 "Please select a valid Client/Site/User". An
 * Opportunity supports a new contact / prospect with no client record: you
 * fill the native opp* fields and simply omit client_id / user_id.
 * See website-lead-opportunity-reconciliation.md for the full field spec.
 *
 * Secrets this Worker expects (Settings > Variables and Secrets):
 *   TURNSTILE_SECRET_KEY  (Secret)  - from the Cloudflare Turnstile widget
 *   HALO_CLIENT_ID        (Text)    - HaloPSA API application Client ID
 *   HALO_CLIENT_SECRET    (Secret)  - HaloPSA API application Client Secret
 *   HALO_BASE_URL         (Text)    - https://ripeda.halopsa.com
 *
 * The Halo API application needs scopes:
 *   read:tickets, edit:tickets, read:sales, edit:sales
 * (POST /Opportunities requires Agent + Sales Modify. Halo has no
 *  *:opportunities scope — opportunities live under the Sales module.)
 *
 * The website form POSTs JSON to this Worker with these keys:
 *   turnstile_token, first_name, last_name, email, phone, company, job_title,
 *   company_size, industry, current_challenge, device_count,
 *   inquiry_type (array or comma string), additional_info, newsletter_opt_in,
 *   website  (honeypot: must be empty)
 */

// "Lead" opportunity type — Configuration > Sales > Opportunity Types.
// NOT the retired "Website Lead" ticket type (36), which was Use = Tickets.
const LEAD_OPPORTUNITY_TYPETYPE_ID = 27;

// Only allow the real site to POST here (adjust if you add domains).
const ALLOWED_ORIGINS = [
  "https://ripeda.com",
  "https://www.ripeda.com",
  "http://localhost:4000", // TEST ONLY — remove before go-live
];

// Map the "current challenge" short codes the form sends -> readable text for Halo.
const CHALLENGE_LABELS = {
  reactive: "Always fixing problems instead of preventing them",
  scaling: "IT processes don't scale with business growth",
  reliability: "Frequent outages and system failures",
  security: "Balancing security with productivity",
  planning: "No clear technology roadmap or planning",
  other: "Other challenge",
};

/**
 * CFOppSize (167) accepts ONLY these exact strings ("add new choices
 * dynamically" is off). The website dropdown sends a subset of them verbatim,
 * so this is a guard against form drift, not a translation table.
 */
const VALID_COMPANY_SIZES = new Set([
  "1", "2", "3-5", "6-10", "11-20", "21-50",
  "51-100", "101-250", "251-500", "501-1000", "1000+",
]);

/**
 * CFCompanyType (164) accepts ONLY these exact strings. The website industry
 * dropdown is generated from this same list, so again: a drift guard.
 * Keep in sync with Configuration > Custom Objects > Custom Fields > id 164.
 */
const VALID_INDUSTRIES = new Set([
  "Agriculture", "Construction", "Education", "Energy", "Engineering",
  "Entertainment", "Food and Drink", "Healthcare", "Hospitality", "IT",
  "Legal", "Manufacturing", "Marketing", "Media", "Other",
  "Professional Services", "Retail", "Software", "Telecommunication",
  "Transport",
]);

/**
 * CFinquiryType (320) is multi-select and takes the raw checkbox labels.
 * CFOpportunityType (165) is single-select and drives the Sales team's native
 * reporting, so we derive one primary value. First match wins, in this order.
 */
const OPPORTUNITY_TYPE_PRIORITY = [
  ["Full MSP Support", "New Managed Service"],
  ["DaaS", "DaaS"],
  ["Device Management", "New Managed Service"],
  ["Repairs", "Repair"],
];
const OPPORTUNITY_TYPE_FALLBACK = "Other";

// CFHowDidTheyHear (166) — "Website Form" must exist as a value on the field.
const HOW_DID_THEY_HEAR = "Website Form";

// CFSalesRequirements (168) is a Rich (HTML) field, so plain newlines vanish.
function toRichText(text) {
  if (!text) return "";
  return text
    .split(/\n{2,}/)
    .map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`)
    .join("");
}

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

function json(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
  });
}

// Safe message extraction: a caught value is not guaranteed to be an Error.
function errorMessage(err) {
  return err instanceof Error ? err.message : String(err);
}

// Basic input cleaning: trim, cap length, strip angle brackets.
function clean(value, max = 2000) {
  if (value == null) return "";
  return String(value).replace(/[<>]/g, "").trim().slice(0, max);
}

// Only send a selection value Halo will actually accept; otherwise send nothing
// so the create doesn't fail on one bad dropdown.
function validated(value, allowed) {
  return allowed.has(value) ? value : "";
}

function primaryOpportunityType(inquiries) {
  for (const [needle, halo] of OPPORTUNITY_TYPE_PRIORITY) {
    if (inquiries.includes(needle)) return halo;
  }
  return OPPORTUNITY_TYPE_FALLBACK;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }
    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405, origin);
    }

    // 1. Read the form data
    let data;
    try {
      data = await request.json();
    } catch {
      return json({ error: "Invalid request" }, 400, origin);
    }

    // 2. Honeypot: real users leave this empty; bots fill it. Pretend success.
    if (clean(data.website)) {
      return json({ success: true }, 200, origin);
    }

    // 3. Verify the Turnstile token with Cloudflare
    const token = data.turnstile_token;
    if (!token) return json({ error: "Missing verification" }, 400, origin);

    const verify = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret: env.TURNSTILE_SECRET_KEY,
          response: token,
          remoteip: request.headers.get("CF-Connecting-IP") || "",
        }),
      }
    );
    const verifyResult = await verify.json();
    if (!verifyResult.success) {
      return json({ error: "Verification failed" }, 403, origin);
    }

    // 4. Get a HaloPSA access token (client credentials)
    let accessToken;
    try {
      const tokenRes = await fetch(`${env.HALO_BASE_URL}/auth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: env.HALO_CLIENT_ID,
          client_secret: env.HALO_CLIENT_SECRET,
          scope: "all",
        }),
      });
      if (!tokenRes.ok) throw new Error("token " + tokenRes.status);
      accessToken = (await tokenRes.json()).access_token;
    } catch (e) {
      return json({ error: "CRM auth error" }, 502, origin);
    }

    // 5. Normalise the incoming fields
    const firstName = clean(data.first_name, 100);
    const lastName = clean(data.last_name, 100);
    const contactName = `${firstName} ${lastName}`.trim();
    const email = clean(data.email, 200);
    const phone = clean(data.phone, 60);
    const company = clean(data.company, 200);
    const jobTitle = clean(data.job_title, 200);
    const deviceCount = clean(data.device_count, 40);
    const additionalInfo = clean(data.additional_info, 4000);
    const newsletterOptIn = !!data.newsletter_opt_in;

    // Selection fields: must match Halo's value lists exactly.
    const companySize = validated(clean(data.company_size, 40), VALID_COMPANY_SIZES);
    const industry = validated(clean(data.industry, 80), VALID_INDUSTRIES);

    const challengeRaw = clean(data.current_challenge, 80);
    const challenge = CHALLENGE_LABELS[challengeRaw] || challengeRaw;

    // inquiry_type may arrive as an array (checkboxes) or a comma string
    const inquiryList = Array.isArray(data.inquiry_type)
      ? data.inquiry_type.map((v) => clean(v, 60)).filter(Boolean)
      : clean(data.inquiry_type, 200).split(",").map((v) => v.trim()).filter(Boolean);
    const inquiry = inquiryList.join(", ");
    const opportunityType = primaryOpportunityType(inquiryList);

    // 6. Readable body — captures everything, including anything unmapped.
    const details =
      `New website lead.\n\n` +
      `Name: ${contactName}\nEmail: ${email}\nPhone: ${phone}\n` +
      `Company: ${company}\nJob Title: ${jobTitle}\n` +
      `Company Size: ${clean(data.company_size, 40)}\n` +
      `Industry: ${clean(data.industry, 80)}\n` +
      `Interested in: ${inquiry}\n` +
      `Biggest challenge: ${challenge}\nDevice count: ${deviceCount}\n` +
      `Newsletter opt-in: ${newsletterOptIn ? "Yes" : "No"}\n\n` +
      `Additional info:\n${additionalInfo}`;

    // 7. Custom fields, referenced by name.
    //    Reused from the existing Lead form: CFOppSize 167, CFCompanyType 164,
    //    CFOpportunityType 165, CFHowDidTheyHear 166, CFSalesRequirements.
    //    CFSalesRequirements 168 (Rich). Website-specific: CFdeviceCount 309,
    //    CFcurrentChallenge 310, CFinquiryType 320, CFleadEnrichmentStatus 318.
    const customfields = [
      { name: "CFdeviceCount", value: deviceCount },
      { name: "CFcurrentChallenge", value: challenge },
      { name: "CFinquiryType", value: inquiry },
      { name: "CFOpportunityType", value: opportunityType },
      { name: "CFHowDidTheyHear", value: HOW_DID_THEY_HEAR },
      { name: "CFSalesRequirements", value: toRichText(additionalInfo) },
      { name: "CFleadEnrichmentStatus", value: "Pending" }, // enrichment Worker polls this
    ];
    // Only include selection fields when the value passed validation — an empty
    // string on a single-select can be rejected outright.
    if (companySize) customfields.push({ name: "CFOppSize", value: companySize });
    if (industry) customfields.push({ name: "CFCompanyType", value: industry });

    // 8. Create the prospect Opportunity.
    //    POST expects an ARRAY; omitting id creates. NO client_id / user_id —
    //    that is what makes this a new-contact prospect rather than a ticket.
    const opportunity = [
      {
        summary: `Website Lead: ${company || contactName || "New enquiry"}`,
        details,
        tickettype_id: LEAD_OPPORTUNITY_TYPETYPE_ID,
        oppcompanyname: company,
        oppcontactname: contactName,
        oppemailaddress: email,
        opptel: phone,
        oppcustomertitle: jobTitle,
        opphear: `Website contact form (ripeda.com)`,
        oppdontaddtomailinglist: !newsletterOptIn, // inverted: opt-in => don't suppress
        customfields,
      },
    ];

    try {
      const res = await fetch(`${env.HALO_BASE_URL}/api/Opportunities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(opportunity),
      });
      if (!res.ok) {
        const text = await res.text();
        console.log("Halo opportunity create failed", res.status, text);
        return json({ error: "Could not create lead" }, 502, origin);
      }
    } catch (e) {
      console.log("Halo opportunity create error", errorMessage(e));
      return json({ error: "Could not create lead" }, 502, origin);
    }

    return json({ success: true }, 200, origin);
  },
};
