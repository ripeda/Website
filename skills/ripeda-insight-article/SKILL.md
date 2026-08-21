---
name: ripeda-insight-article
description: Use this skill whenever Kevin or anyone at RIPEDA wants to create, draft, or publish a new spoke article in the RIPEDA Insights blog. Triggers include any request to "convert Issue [N]", "write a new insight on [topic]", "draft an insight article about [X]", "turn this newsletter into a public article", "publish an article on the Insights blog", or "add an article to /resources/insights/". The skill produces a Markdown file in _insights/ AND registers the entry in _data/insights.yml so the article appears on the Insights hub at /resources/insights/. Do NOT use this skill for top-level pages (services, industries, about, case studies) or for the AI-training site at getanhourback.com - those have separate layouts and conventions.
---

# RIPEDA Insight Article Skill

This skill codifies the spec for writing a RIPEDA Insight (a spoke article in the `/resources/insights/` collection).
Two reference examples already exist in the repo:

- `_insights/business-network-infrastructure.md` (Issue 78 conversion)
- `_insights/apple-repair-business-fleets.md` (Issue 82 conversion)

Read at least one of these as a structural reference before drafting.

---

## What this skill produces

Every run produces two changes:

1. A new Markdown file at `_insights/[slug].md` containing the article body and frontmatter.
2. A new entry at the top of the matching vertical section of `_data/insights.yml` with `slug:` and `published: true`.

The Markdown file becomes a live article at `/resources/insights/[slug]/`.
The data file entry surfaces the article as a clickable "Published" card on the Insights hub.

---

## Inputs the skill needs

If any of these are missing, ASK before drafting. Do not guess.

- **Source content.** A newsletter HTML file, raw notes, a topic + outline, or an existing draft.
- **Vertical(s).** Which of the eight verticals does this article belong to? One is normal, multiple is allowed when the content genuinely applies across categories. Always ask, even when the answer seems obvious.
- **Anything specific about positioning.** Is this an Education-for-Repair piece? A Dental clinic piece? A Strategy-Advisory piece? Context shapes voice and the related-reading links.

The seven verticals (defined in `_data/insights.yml`):

| id | label | scope |
|---|---|---|
| `dental-medical` | Dental & Medical | Clinics, dental, oral surgery, healthcare, PHIPA/PIPEDA, imaging |
| `design-agencies` | Design & Marketing | Creative studios, design shops, marketing and communications agencies, Mac-default creative teams |
| `education` | Education | Charter and private schools (RIPEDA does not target public schools). Repair, networks, AASP work |
| `professional-services` | Professional Services | SaaS, accounting, consulting, legal-adjacent, professional firms |
| `mdm-security` | MDM & Security | Cross-industry technical content on device management, security, identity |
| `infrastructure` | Apple Infrastructure | Networks, servers, storage, DNS, VPN, the layer under devices |
| `ai-productivity` | AI & Productivity | Apple Intelligence, Apple Silicon, Shortcuts, AI rollout (cross-references getanhourback.com) |

There used to be a separate `marketing-agencies` vertical. It was merged into
`design-agencies` on 2026-08-21: it had a label and a description but never a
single article, so it rendered a filter tab that led straight to the empty
state, and the two audiences overlap almost completely for this content. The id
`design-agencies` was kept rather than minting a merged one, because it owns
/industries/design-agencies/ and is deep-linked as `#design-agencies`. Do not
re-add a marketing vertical without writing articles for it first.

---

## Output frontmatter spec

Every article uses this frontmatter shape. Required fields are marked.

```yaml
---
layout: insight                                           # required, always "insight"
title: "..."                                              # required, sentence case, no period, 50-60 chars
dek: "..."                                                # required, 1-2 sentences, expands on title, shown on page
seo_title: "... | RIPEDA Insights"                        # optional, only set when title alone is not SEO-optimal
description: "..."                                        # required, 150-160 chars, becomes the meta description
date: 2026-MM-DD                                          # required, ISO date of publication
tags:                                                     # required, 2-4 topic tags from the controlled vocabulary
  - Tag One
  - Tag Two
keywords: "phrase one, phrase two, phrase three"          # required, 5-10 comma-separated SEO phrases
image: /images/insights/[slug]-og.jpg                     # optional, per-article OG image; falls back to site default
reading_time: N                                           # required, integer minutes (calculate at ~200 wpm)
author: "RIPEDA"                                          # default RIPEDA; use "Roy Miguens" for technical-engineering or "Kevin Weir" for strategy pieces
tldr:                                                     # required, 4-6 bullet summary points
  - "..."
  - "..."
related:                                                  # required, 2-3 cross-links (recipe below)
  - title: "..."
    url: "/path/"
    context: "One-line description of what the reader gets from this link."

# Optional silent metadata (kept in frontmatter, NOT rendered on the page)
issue_number: 78                                          # only for newsletter conversions
original_date: "August 2025"                              # newsletter original publication month
---
```

`issue_number` and `original_date` are silent metadata. They no longer render anywhere on the page or in the PDF. They exist purely so the team can trace which newsletter a converted article came from. Keep them when converting newsletters. Omit them on greenfield articles.

`image` is optional. If set, it overrides the default OG card image (`/images/logo/ripeda-og-image.jpg`) for social shares and link previews. Worth setting once we start producing per-article OG cards. Until then, leave it out and the fallback applies.

---

## Three categorization layers - keep them distinct

Articles are categorized by THREE different mechanisms that serve different purposes. Don't conflate them.

| Layer | Where it lives | What it does | Audience |
|---|---|---|---|
| **Verticals** | `verticals:` (or `vertical:`) in `_data/insights.yml` | Filter tabs on the Insights hub | Human readers browsing |
| **Tags** | `tags:` in article frontmatter | Display tags on the article hero and hub cards | Human readers scanning |
| **Keywords** | `keywords:` in article frontmatter | SEO meta keywords, search-engine targeting, internal site search | Search engines and search-on-site |

A typical article: belongs to 1-2 verticals, has 2-4 tags, has 5-10 keywords.

---

## Tags vocabulary

Tags must come from this controlled list. Adding a new tag requires explicit Kevin approval (and appending it here). The point of a controlled vocabulary is consistency. "Networks" in one article and "Network" in another fragments the taxonomy.

### Topic tags (what the article is about)

`AppleCare`, `Apple Business Manager`, `Apple Intelligence`, `Apple Silicon`, `Backup`, `CBCT`, `Collaboration`, `Compliance`, `Data Recovery`, `Deployment`, `Encryption`, `File Sharing`, `Fortinet`, `Identity`, `iCloud`, `MDM`, `Networks`, `Operations`, `Password Management`, `Performance`, `PHIPA`, `PIPEDA`, `Procurement`, `Remote Support`, `Repair`, `Ruckus`, `Security`, `SSO`, `Storage`, `Wi-Fi`

### Angle tags (how the article approaches its topic)

`Apple Business`, `Architecture`, `Infrastructure`, `Lifecycle`, `Strategy`

### How many tags per article

2-4 tags is the right range. One topic tag and one angle tag at minimum. The first tag listed is the most important.

---

## SEO writing rules

The Insights blog needs to match the SEO patterns of the rest of the RIPEDA site. The site config (`_config.yml`) defines the global SEO settings, and `jekyll-seo-tag` + the `_layouts/insight.html` JSON-LD block do most of the heavy lifting. The skill's job is to feed those mechanisms the right inputs.

### Title

- **50-60 characters total.** Counting the brand suffix that jekyll-seo-tag appends (`| RIPEDA Consulting`).
- **Primary keyword in the first half** of the title where possible.
- **Sentence case**, not Title Case. "Why business networks need more than connectivity" not "Why Business Networks Need More Than Connectivity".
- **No period at the end.**
- Should make the reader want to click while accurately describing the article.

If `title` alone reads awkwardly as the meta title (e.g., the on-page title is poetic but not SEO-friendly), use `seo_title:` to override. Rare. Default to using only `title:`.

### Description

- **150-160 characters.** Becomes the `<meta name="description">` and the `og:description` and the snippet shown in Google search results.
- **Should include the primary keyword** in the first 100 characters.
- **Two sentences max.** First sentence establishes the topic, second sentence promises a takeaway.
- **No marketing fluff.** Concrete promise of what the article delivers.
- Re-use the page `dek` if it fits the SEO description format. Otherwise write a distinct version.

### Keywords

The `keywords:` field is a comma-separated string of 5-10 search phrases. Mix of head terms and long-tail. Pull from:

1. **Site-wide keywords** declared in `_config.yml` - examples: `Apple consulting Calgary`, `Mac support`, `IT services Calgary`, `Apple certified consultants`, `dental practice IT`, `education technology`, `marketing agency IT`, `office IT support`, `SaaS company IT`, `Apple Technical Partners`, `ACN`, `ATP`. Pick 2-3 that apply.
2. **Article-specific long-tail phrases.** Concrete, specific, search-realistic. Examples:
   - For a network infrastructure article: `business network infrastructure`, `Fortinet for business`, `Ruckus wireless deployment`, `enterprise network design Calgary`
   - For a dental clinic article: `dental practice Apple IT`, `PHIPA compliance Apple`, `dental imaging network`, `Apple MDM dental clinic`
   - For an Apple repair article: `Apple Authorized repair business`, `business Apple Care`, `Apple repair Calgary business`, `Apple device fleet management`

The goal is search realism. Phrases someone would actually type into Google. Avoid generic terms like "technology" or "business" on their own.

### Image

The OG image is the social-card preview image when a link to the article is shared on LinkedIn, X, Slack, etc. The site default (`/images/logo/ripeda-og-image.jpg`) works as a fallback but every shared article will look identical in previews.

Until per-article OG images are produced, leave `image:` out of the frontmatter and accept the fallback. When OG image generation is set up (eventually), the convention will be `/images/insights/[slug]-og.jpg`.

### Brand convention

The site title `RIPEDA Consulting` is appended automatically to every page title by jekyll-seo-tag. Do not include "RIPEDA" in `title:` unless it's grammatically essential. The brand attribution is handled by the SEO layer.

For `seo_title:` overrides, the convention is `[Article Title] | RIPEDA Insights` (note "Insights" not "Consulting" because the article is in the Insights collection specifically).

---

## How the layout consumes SEO frontmatter

You don't need to touch the layout, but knowing what it does helps the skill produce the right inputs.

`_layouts/insight.html` automatically emits:

- A complete BlogPosting JSON-LD schema using `title`, `description` (or `dek`), `date`, `author`, `image`, page URL, `tags` (as keywords array), `reading_time` (as `timeRequired`)
- Canonical URL meta tag
- Open Graph tags (`og:title`, `og:description`, `og:image`, `og:type=article`, `og:url`)
- Twitter card tags
- The print-friendly URL footer

`jekyll-seo-tag` (configured in `_config.yml`) automatically emits:

- `<title>` tag with site name appended
- `<meta name="description">`
- `<link rel="canonical">`
- Additional Open Graph and Twitter tags

The combined effect: if frontmatter is complete and correct, every article ships with rich, consistent, SEO-grade metadata. The skill's job is to fill those fields properly.

---

## Voice and style rules

Strict. No exceptions without explicit Kevin approval.

### Formatting rules

- **No em-dashes anywhere.** End the sentence and start a new one, or use a colon, or use parentheses.
- **No emojis anywhere.** Not in headings, not in body, not in callouts.
- **Canadian English throughout.** colour, center, organize, optimized, behavior, program.
- **Smart quotes** ("curly") in prose. Straight quotes (`"`) are acceptable inside code blocks.

### Banned phrases - AI tells

These phrases are tells that something was written by AI. Do not use any of them, in any rephrasing. If you find yourself reaching for one, rewrite the thought.

- "Here's what most people miss"
- "Here's the real story"
- "Here's the thing"
- "The truth is..."
- "What most people don't realize..."
- "This is not an X. This is a Y!" - the contrast-trope. Avoid setting up false dichotomies for rhetorical effect.
- "It's not just X, it's Y" - same trope, different syntax. Avoid.
- "leverage" (as a verb)
- "utilize" / "utilize" - use "use"
- "ensure seamless..." / "seamless experience"
- "dive into" (the verb-form AI filler; the noun "deep dive" is acceptable, especially as a RIPEDA service-tier label)
- "robust solution" / "robust platform"
- "unlock potential" / "unlock value"
- "in today's fast-paced..." / "in today's digital world"
- "at the end of the day"
- "best of breed"
- "synergy" / "synergize"
- "game-changer" / "game-changing"
- "cutting-edge" / "bleeding-edge"
- "world-class"
- "thought leader" / "thought leadership"

### Positive style direction

- **Professional, engineering-focused, authoritative.** Direct sentences. Active voice. Concrete numbers and named tools (Fortinet, Ruckus, SimpleMDM, Jamf, Mosyle, FileVault, Apple Business Manager, etc.) instead of "enterprise-grade solutions."
- **Plain English.** Say what you mean. Short paragraphs. Vary sentence length.
- **First person plural ("we") is fine, sparingly.** "We see this pattern in the field" works. "We at RIPEDA pride ourselves" does not.
- **Concrete over abstract.** "Past 30 staff" beats "as your business scales." "After three incidents in a quarter" beats "when reliability becomes an issue."
- **Edit out hype.** If a sentence could appear on any vendor's homepage, rewrite it.

### Acronyms and jargon

Public-facing articles must be readable by someone who knows the business problem but not the specific technology terminology. Treat the article like a first introduction to the topic, even when most of the audience is technical.

- **Spell out every acronym on first use** with the acronym in parentheses. Examples: "Mobile Device Management (MDM)", "single sign-on (SSO)", "Apple Authorized Service Provider (AASP)", "mean time to repair (MTTR)". Subsequent uses can use the acronym alone.
- **Define jargon terms briefly on first use.** Either inline ("Single sign-on, where one set of credentials unlocks the apps a user is authorized to use") or by rewriting to avoid the jargon entirely.
- **If the article centers on a single core concept** (an MDM article, an AASP article, a network infrastructure article), include a one-sentence definition near the top so a reader new to the topic isn't lost by the third paragraph.
- **Brand names do not need expansion.** Fortinet, Ruckus, Jamf, Mosyle, SimpleMDM, Kandji, Okta, Microsoft Entra ID, FileVault, Apple Business Manager, Time Machine. These are recognized brand or product names.
- **Universal acronyms do not need expansion.** IT, CFO, COO, VPN, OS, ROI, URL, API. When in doubt, expand.
- **Avoid stacking acronyms.** A sentence with three undefined acronyms in it reads as gatekeeping. Either expand them or rephrase.

If a draft contains an acronym you haven't expanded somewhere earlier in the article, expand it before declaring the article done.

### Citing stats, claims, and external references

A RIPEDA article gains credibility from real citations, not from the appearance of them. The rule is not "avoid citations." The rule is "only cite real things, and make the source visible to the reader." Any statistic, dollar figure, percentage, or external reference in an article needs to fall into one of four categories.

**1. RIPEDA's own field observation.** "A six-chair clinic typically has twelve to twenty iPads in service" is fine because it comes from our own client base. State the observation as observation, not as a study finding. "We see this pattern in the field" or "In our experience" are accurate framings. RIPEDA's expertise is the authority that lets us write the article in the first place; the writing should reflect that.

**2. A vendor-published price or specification.** Vendor pricing should be approximate, with a soft hedge: "Mosyle Business starts around five dollars per device per month" not "Mosyle Business costs $5.00 per device per month". Pricing changes. Validate against the vendor's current public pricing before publishing, and round.

**3. An Apple-published technical figure.** Throughput numbers, memory capacities, and chip specifications can be stated when they come from Apple's spec pages or developer documentation. Link to the source page when the specific number matters. Generalize when it does not.

**4. An external study or report with a real, citable source.** Cited research strengthens an article when it is genuine. Forrester's Total Economic Impact (TEI) studies of Mac in enterprise (commissioned by Apple), IBM's public data on its Mac@IBM program, and similar industry research from IDC, Gartner, or comparable firms are all legitimate sources RIPEDA uses regularly. Two acceptable formats:

  **Inline hyperlinked citation.** "A 2024 [Forrester TEI study](https://example.com/url-to-study) commissioned by Apple found that Mac users in enterprise environments generated fewer support tickets than PC users over a three-year window." The source is named, dated, and linked.

  **Footnote citation** (Jekyll's kramdown renderer supports Markdown footnotes natively). "Apple-fleet enterprises consistently report lower support costs than comparable PC fleets[^ibm]." Then at the bottom of the article: `[^ibm]: IBM, "Mac@IBM: Five Years of Insights," 2020.`

  Either format is fine. Pick one per article and stay consistent.

**What is not acceptable:**

- "Studies show that 73% of..." with no named or linked study
- "Research indicates..." with no source
- "The average company..." without saying which average and from where
- Quoted dollar amounts that look precise but are guesses (`$1,247.50`, `$12,890` when "around twelve thousand dollars" is the honest figure)
- Any statistic that originated in the model's training data and has not been re-verified against a current vendor, Apple, or industry source

AI-generated articles frequently fabricate plausible-sounding statistics. Treat any number that cannot be tied to a verified, named source as a fabrication and either find the source or remove the number.

**Preferred framings when a hard number is not available and a citation cannot be supplied:**

- "We see this pattern often" instead of "73% of firms experience this"
- "Roughly two thousand dollars a year" instead of "$2,000.00 per year"
- "A typical mid-sized clinic" instead of "the average clinic"
- "Most studios we work with" instead of "an industry survey found"

When a hard number genuinely matters and a real source exists, cite it. The validator's citation red-flag check fires on phrases like "studies show" precisely to remind the writer to confirm the citation is present, not to encourage the phrase's removal.

---

## Structure conventions

A spoke article follows this shape:

1. **Opening hook (2-4 sentences).** Concrete scenario or observation. Not a thesis statement. Start with a story or a sharp observation, not "In today's business world..."
2. **Frame the problem (1-2 paragraphs).** Why does this matter? What's the gap most readers don't see?
3. **The substance (the longest section).** Use one or both of these structural blocks where helpful:
   - **Comparison block** (`<div class="insight-compare">`) - for "X vs Y" framing. Two columns, one labeled, one marked `is-strong` for emphasis. Use when the article is about contrasting two approaches.
   - **Stat block** (`<div class="insight-stat">`) - for emphatic evidence or principles. Navy background, white text. Use sparingly. One per article maximum.
4. **What "good" looks like.** Concrete description of the right approach. Named tools, real numbers if available.
5. **When to think about this.** A practical inflection point. "Past 30 staff" or "After three incidents in a quarter." Helps the reader self-diagnose.
6. **Closing thought.** One sentence that lands the article. Often an inversion of the opening problem.

### Length target

- Spoke articles: **500-900 words** in the body (exclusive of frontmatter, TL;DR, related-reading block).
- 600-700 is the sweet spot.
- Longer than 1,000 means the topic might be a pillar candidate, not a spoke.

### TL;DR conventions

- 4-6 bullets.
- Each bullet 1-2 lines maximum.
- First bullet should anchor the main claim. Last bullet should be the takeaway action or principle.
- No em-dashes (apply the same rule as body).
- Periods at the end of each bullet. Sentence case.

### Inline HTML blocks available

The `insight` layout renders these custom blocks. Use them in the body when they earn their place. Don't force them into every article.

```html
<!-- Two-column comparison. Use is-strong on the column you want highlighted. -->
<div class="insight-compare">
  <div class="insight-compare-col">
    <h4>Title of weaker side</h4>
    <p>Setup sentence.</p>
    <ul>
      <li>Point</li>
    </ul>
    <p class="insight-compare-conclusion"><strong>Result:</strong> outcome of this approach.</p>
  </div>
  <div class="insight-compare-col is-strong">
    <h4>Title of stronger side</h4>
    <p>Setup sentence.</p>
    <ul>
      <li>Point</li>
    </ul>
    <p class="insight-compare-conclusion"><strong>Result:</strong> outcome of this approach.</p>
  </div>
</div>
```

```html
<!-- Navy stat / evidence block. White text. One per article max. -->
<div class="insight-stat">
  <p><strong>Label.</strong> The supporting evidence or principle.</p>
  <p><strong>Label.</strong> Another supporting point.</p>
</div>
```

Standard Markdown handles everything else: headings (`##` and `###`), paragraphs, lists, bold, italic, blockquotes, links.

---

## Linking a calculator

RIPEDA has two calculators. Link one whenever an article does cost arithmetic
the calculator does, or cites the research the calculator is built on.

| include id | Page | Use when |
|---|---|---|
| `downtime` | /calculators/it-downtime-cost/ | The article prices an outage, lost hours, or the cost of something being unavailable |
| `mac-vs-pc` | /calculators/mac-vs-pc-tco/ | The article discusses total cost of ownership, refresh cycles, or cites the IBM / Forrester Mac TCO figures |

Drop it in the body, at the point the arithmetic happens:

```liquid
{% include calculator-callout.html id="downtime" %}
{% include calculator-callout.html id="mac-vs-pc" note="Article-specific one-liner." %}
```

Pass `note` to phrase the invitation in the article's own terms — naming the
placeholder figures the reader just saw is what makes it land.

**Do not put a calculator in `related:`.** That block is capped at 2-3 entries
and must contain one `/services/` and one `/industries/` link, so a calculator
either trips the count check or displaces a required link. It also belongs
beside the arithmetic rather than in a footer list: the reader wants the tool
at the moment they see the method.

Placement is a judgment call, not a rule — an article that never talks about
money does not get one. As of 2026-08-21 three articles carry a callout:
clinic-downtime-cost, mac-local-ai-workstation, and mdm-beyond-enrollment.

---

## Related-reading recipe

Every article ends with 2-3 "Related reading" links. Standard recipe:

1. **One service page link.** Pick the most relevant of `/services/strategy-advisory/`, `/services/managed-apple-it/`, `/services/network-infrastructure/`, or `/services/apple-authorized-repair/`. This is the conversion path - it gets the reader from interested to engaged.
2. **One industry page link.** Pick the most relevant of `/industries/dental-medical/`, `/industries/design-agencies/`, `/industries/education/`, `/industries/professional-services/`. Should match (one of) the article's verticals.
3. **(Optional) One sibling insight link.** Another published article in `/resources/insights/` that genuinely extends the conversation. Skip if no good match.

Each related entry has:

```yaml
- title: "Display title of the linked page or article"
  url: "/path/"
  context: "One-line explanation of why a reader of THIS article would want to read THAT one."
```

The `context` line is mandatory. It earns the click. Generic "Learn more" is not acceptable.

---

## Workflow

When the skill is invoked:

1. **Confirm inputs.** Source content present? If converting a newsletter, locate the source file at `business-resources/newsletters/issue_NN_*.html`. If a topic-only request, ask for any source notes or constraints.
2. **Ask for vertical(s) if not provided.** Use the table above. Multiple verticals are allowed when justified. Wait for the answer before drafting.
3. **Read the source content fully.** Understand the claim, the audience, the evidence.
4. **Draft the title and dek.** The title should hint at the problem or contrast (often "Why...", "When...", or "X vs Y"). The dek expands in 1-2 sentences. Both written for SEO and for a human scanning the page.
5. **Draft the body.** Follow the structure conventions. Aim for the word target. Voice and style rules are non-negotiable.
6. **Draft the TL;DR.** 4-6 bullets. Last bullet is the takeaway.
7. **Pick related-reading links.** Service + industry + optional sibling.
8. **Pick a slug.** Short, hyphenated, SEO-friendly, no stop words if possible. Examples: `business-network-infrastructure`, `apple-repair-business-fleets`, `phipa-compliance-apple-clinics`.
9. **Write the article file** at `_insights/[slug].md`.
10. **Register the article entry** at the top of the matching vertical section in `_data/insights.yml`. Use single `vertical:` for one vertical, or `verticals: [a, b, c]` for multi-vertical. Always include `slug:` and `published: true`.
11. **Generate the OG image.** Run `node scripts/og-image-generator/build.js [slug]` to produce the article's social-preview image at `images/insights/[slug]-og.png`. The script reads the title and dek from the article frontmatter, looks up the vertical from `_data/insights.yml`, renders the branded card, and adds an `image:` field to the article frontmatter pointing at the generated PNG. The article must already be in `_data/insights.yml` before this step (step 10 must come first).
12. **Verify.** Run the quality checklist below.

### `_data/insights.yml` entry format

Single vertical:

```yaml
- title: "Display title (matches article title)"
  vertical: dental-medical
  read_time: 5
  date: "May 2026"
  slug: phipa-compliance-apple-clinics
  published: true
```

Multi-vertical:

```yaml
- title: "Display title (matches article title)"
  verticals: [dental-medical, professional-services]
  vertical: dental-medical                              # primary, used as fallback
  read_time: 5
  date: "May 2026"
  slug: phipa-compliance-apple-clinics
  published: true
```

The `date` field here uses display format ("May 2026") not ISO. The ISO date lives in the article's frontmatter.

---

## Quality checklist

Before declaring the article done, verify all of these.

### Content

- [ ] Body is 500-900 words
- [ ] TL;DR has 4-6 bullets
- [ ] Opening hook is concrete, not abstract
- [ ] Closing thought lands the article (not a generic CTA)
- [ ] Related-reading has at least one service link AND one industry link
- [ ] Each related link has a `context:` line that earns the click

### Voice

- [ ] No em-dashes anywhere (frontmatter or body)
- [ ] No emojis anywhere
- [ ] Canadian English throughout (colour, center, organize, optimized, behavior, program)
- [ ] No banned AI-speak phrases (see full list in Voice section)
- [ ] No "Here's what most people miss" / "Here's the real story" / "This is not X, this is Y" tropes
- [ ] No sentence that could appear on any vendor's homepage
- [ ] Every acronym is spelled out on first use, e.g. "Mobile Device Management (MDM)"
- [ ] If the article centers on a single concept, a brief definition appears near the top
- [ ] No undefined jargon stacking (e.g., a sentence with three acronyms)
- [ ] Every external statistic, percentage, or claim is paired with a named source (Forrester, IBM, IDC, etc.) and either an inline link or a footnote
- [ ] No fabricated statistics or unsourced "studies show" / "research indicates" phrases
- [ ] Vendor pricing is approximate and current; technical specs verified against the source

### Frontmatter completeness

- [ ] `layout: insight`
- [ ] `title` (50-60 chars, sentence case, no trailing period, primary keyword in first half)
- [ ] `dek` (1-2 sentences, on-page subtitle)
- [ ] `description` (150-160 chars, primary keyword in first 100 chars)
- [ ] `date` (ISO format `YYYY-MM-DD`)
- [ ] `tags` (2-4, ALL from the controlled vocabulary in this skill)
- [ ] `keywords` (5-10 comma-separated phrases, mix of site-wide + article-specific long-tail)
- [ ] `reading_time` (integer)
- [ ] `author` (RIPEDA, or named individual if appropriate)
- [ ] `tldr` (4-6 bullets, first anchors main claim, last is the takeaway)
- [ ] `related` (2-3 entries with title, url, context)
- [ ] `issue_number` and `original_date` included if newsletter conversion (silent metadata)

### Data file registration

- [ ] `_data/insights.yml` entry exists at top of matching vertical section
- [ ] Entry has `slug:` and `published: true`
- [ ] If multi-vertical, entry uses `verticals: [...]` array with `vertical:` fallback
- [ ] Title in data file matches title in article frontmatter exactly
- [ ] Slug in data file matches the filename
- [ ] Vertical(s) chosen are from the controlled list (id, not label)

### Verification

- [ ] Article file exists at `_insights/[slug].md`
- [ ] Tested by Kevin in browser at `/resources/insights/[slug]/`
- [ ] Tested that the article appears on the Insights hub under each declared vertical
- [ ] Tested that the share buttons produce sensible output (LinkedIn share dialog populated, mailto subject has "Fwd Article:" prefix, etc.)
- [ ] Tested PDF print preview (no broken layout)

---

## Notes for future evolution

- The two-card published states (a clickable `<a>` with "Published" badge, vs. a plain `<div>` placeholder) are rendered by `resources/insights.html`. The skill doesn't need to touch that file.
- The article layout `_layouts/insight.html` handles share buttons, PDF print, OG meta, JSON-LD schema, and the canonical URL footer. The skill doesn't need to touch that file either. Output the right frontmatter and the layout does the rest.
- If a new structural element becomes necessary (e.g., a quote block, a pull-quote, a third comparison column variant), add it to the layout first, document it here, then use it in articles.
- If the verticals taxonomy changes (e.g., a new "Repair & Lifecycle" vertical), update `_data/insights.yml`, `resources/insights.html` (verticals list), and the vertical table in this skill in lockstep.
- The banned-phrases list should grow as Kevin spots new AI tells in drafts. Each addition raises the bar.
