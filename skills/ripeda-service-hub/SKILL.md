---
name: ripeda-service-hub
description: Use this skill whenever Kevin or anyone at RIPEDA wants to create, draft, or revise a service hub page on the RIPEDA website. Triggers include any request to "write the Strategy Advisory hub", "draft the Managed Apple IT service page", "build out /services/[slug]/", "write a service hub for [slug]", or "refresh the service page for [slug]". A service hub is the comprehensive overview page at /services/[slug]/ that anchors a service line and pulls spoke articles into it. It is NOT a spoke article in the Insights blog and it is NOT an industry pillar. Do NOT use this skill for spoke articles (use ripeda-insight-article instead), for industry pillar pages (use ripeda-pillar-page instead), for the AI training site at getanhourback.com, or for case study pages.
---

# RIPEDA Service Hub Page Skill

This skill codifies the spec for writing a RIPEDA service hub page. Service hubs
live at `/services/[slug]/` and are the broad, authoritative overview of an entire
service line (Strategy Advisory, Managed Apple IT, Network Infrastructure, Apple
Authorized Repair).

A service hub is built on the **hub-and-spoke** content model. It ranks for service
head terms ("Apple consulting and strategy advisory", "managed Apple IT", "Apple
network infrastructure") and links DOWN to spoke articles in `_insights/` that
cover individual topics in depth. The spokes link back UP to the hub through their
`related:` frontmatter blocks. Together they signal topical authority to Google.

The companion skill `ripeda-insight-article` produces the spokes. Read its voice
rules, SEO patterns, banned-phrase list, and citation guidance - they all apply
equally to service hubs and are not duplicated here. This skill only covers what
differs from the spoke spec.

The sister skill `ripeda-pillar-page` produces industry pillar pages at
`/industries/[vertical]/`. Pillars and service hubs use parallel structures, but
they filter their related-insights grid by different fields (vertical vs service).

---

## What this skill produces

One change per run:

1. A Markdown file at `services/[slug].md` (or replaces the existing stub).
   Renders to `/services/[slug]/` via the `service-hub` layout.

There is NO separate data file registration for hubs. They are top-level service
pages, not collection items.

Spoke-to-hub assignment lives in `_data/insights.yml` via the `services: [slug]`
array on each spoke entry. Spokes that should appear under a hub's related grid
must list the hub's slug in their `services:` array.

---

## Inputs the skill needs

If any are missing, ASK before drafting:

- **The service slug.** One of: strategy-advisory, managed-apple-it,
  network-infrastructure, apple-authorized-repair. These are the four service
  lines RIPEDA offers and the only valid values.
- **Available case studies.** Named clients with permission to publish, anonymized
  client stories, or "no case studies yet, use placeholder language."
- **Engagement model.** Project, retainer, ongoing managed service, or hybrid.
  Each service line has a different default model and the hub should describe it
  honestly.
- **Which spokes already exist** for this service. Check `_data/insights.yml` for
  published entries whose `services:` array includes this hub's slug. The hub
  must reference each in a body section with an inline `Read more →` link. The
  validator enforces this.

---

## Critical pre-flight: align spoke services to the hub

Every spoke that the hub's body links to should have the hub's slug in its
`services:` array in `_data/insights.yml`. Otherwise the spoke shows up in the
hub's body but not in the auto-rendered "Related reading" grid at the bottom,
which makes the hub feel incomplete.

A spoke can belong to multiple service hubs. For example, a spoke about Apple
Business Manager could appear under both Strategy Advisory (the planning
conversation about ABM) and Managed Apple IT (the operational delivery of ABM).
The `services:` array allows both:

```yaml
services: [strategy-advisory, managed-apple-it]
```

Before drafting a hub, scan the body section topics. For each spoke the hub will
link to, verify the spoke's data-file entry already lists the hub's slug. If
not, fix the spoke entry first.

The validator (`validate-service-hub.py`) will warn if a hub's body links to
spokes that are not in the data file's published-and-services-matching list.

---

## Critical pre-flight: plan the hub before writing any spokes

The hub-and-spoke architecture only works when **the hub is planned first** and
the spokes are written to fill the topic sections it requires. Writing a pile of
spokes and trying to retrofit them into a hub produces either gaps (sections
with no deep content to link to) or a misshapen hub that meanders around
whatever the spokes happen to cover.

The correct sequence for a NEW hub where spokes do not yet exist:

1. **Plan the hub's outline first.** List the 5-7 topic sections this service
   line needs the hub to cover. Each section is a topic area, named concretely.
2. **Map each section to a spoke.** For each section, identify either the
   existing spoke that covers the topic in depth, OR the spoke that needs to be
   written.
3. **Write any missing spokes first**, using the `ripeda-insight-article` skill.
4. **Only after all referenced spokes exist** does the hub get written.

The Strategy Advisory hub is the first service hub being built, and it inherits
a substantial set of existing spokes (eleven at first launch). That coincidence
does NOT generalize to the other three service hubs, which will likely need
spokes written before their hubs can be authored.

When asked to write a hub for a service line, the FIRST output should be the
section plan and the spoke-mapping. Only after Kevin confirms the plan (and any
missing spokes have been authored) should the hub's body be drafted.

---

## Structure of a service hub page

Every service hub follows this structural shape. Sections in this exact order.
The `service-hub` layout (`_layouts/service-hub.html`) expects this structure.

### 1. Hero

- Service name in the H1: "Apple consulting and strategy advisory"
- Subheading (dek): 1-2 sentences naming the audience and the promise
- Trust badges visible near the hero: Apple Technical Partner, AASP, etc.
- Primary CTA button: "Talk to us about your environment"

### 2. Who this is for

- A short section (100-150 words) describing the buyer and the use case.
- Names roles concretely (Founder, Practice Manager, COO, IT Lead).
- Names sizes or stages concretely ("pre-Series A SaaS", "mid-sized clinic",
  "agencies of 20-80 staff").
- Sets up that the rest of the page is going to be useful by being specific.

### 3. The body sections (the substance of the hub)

Five to seven major sections, each covering one topic area within the service
line. Each section is roughly 150-250 words and ends with a `Read more →` link
to the relevant spoke article.

Example sections for the Strategy Advisory hub:

- The IT foundation for scaling SaaS (links to SaaS budget and Series A debt spokes)
- AI policy and adoption (links to AI policy spoke)
- Vendor consolidation and IT-vendor decisions (links to vendor switch spoke)
- Procurement strategy and device tier decisions (links to Mac Studio/mini and Apple Silicon spokes)
- Multi-location operations consistency (links to multi-location dental spoke)
- Network and infrastructure investment planning (links to school infrastructure spoke)
- Apple Authorized Partner relationships (links to Apple Technical Partner spoke)

The selection of sections is service-driven. For Managed Apple IT, you'd cover
device management, help desk, security operations, lifecycle. For Network
Infrastructure, you'd cover design, deployment, refresh, ongoing management.
For Apple Authorized Repair, you'd cover AASP scope, AppleCare math, fleet
logistics.

### 4. Case studies

One to three case study tiles, each 80-120 words. Named clients when permissions
allow, anonymized when not. Each tile follows the pattern: client context →
problem → what we did → outcome (with at least one concrete number).

Placeholder language is acceptable when case studies are not yet finalized:

> *"Case studies for this service are being prepared with client permission. In
> the meantime, ask us about [specific examples] when we talk."*

The validator will check that case studies (real OR placeholder) appear.

### 5. Why RIPEDA specifically

A short section (100-150 words) naming credentials and specific RIPEDA depth in
this service line. Apple Technical Partner since 2012, AASP, Fortinet, Ruckus,
DriveSavers, individual ACRT certifications, twelve-plus years of focused
practice in the service area. Do not turn it into marketing copy.

### 6. How an engagement works

A short section (100-150 words) describing the typical engagement flow for THIS
service. Each service line has a different shape:

- **Strategy Advisory.** Project-based or retainer. Discovery → strategy
  workshop → written deliverable → optional implementation handoff.
- **Managed Apple IT.** Ongoing. Discovery → migration → managed service with
  monthly per-seat pricing.
- **Network Infrastructure.** Project-based. Site survey → design → install →
  optional ongoing managed network service.
- **Apple Authorized Repair.** Continuous, per-device. Quote → approval →
  repair → return logistics.

### 7. Service grid

A grid of cards linking to the OTHER three RIPEDA service lines. The layout
renders this from a fixed list and automatically hides the card for the current
page.

### 8. Related insights

Tile-style links to spoke articles in `_insights/` that are relevant to this
service. Pulled automatically by the layout from `site.insights` filtered to
spokes whose `services` array includes the current hub's slug. The hub's
frontmatter just declares the service id and the layout does the work.

### 9. FAQ

5-8 service-specific questions with answers (50-100 words each). The layout
emits `FAQPage` JSON-LD schema for Google. Questions should answer what a buyer
would actually ask before booking a consultation:

- How do you scope a [service] engagement?
- What does a typical engagement timeline look like?
- Do you work with [specific industry / company size / situation]?
- How do you bill for [service]?
- What does ongoing relationship look like after the initial engagement?

### 10. Final CTA

One conversion ask. Calendar booking, phone, or contact form.

---

## Length target

**1,500 to 2,500 words** in the body, exclusive of FAQ and case studies.
Sweet spot: 1,800-2,000 words.

A hub shorter than 1,500 words usually reads as a stub. Longer than 2,500 reads
as a wall of text. The hub-and-spoke discipline keeps each topic section short
(~200 words) because the depth lives in the linked spokes.

---

## Voice and style rules

**Same rules as the spoke skill (`ripeda-insight-article`).** Do not duplicate.
Read its Voice section. Specifically:

- No em-dashes
- No emojis
- Canadian English
- No banned AI-speak phrases
- No AI tropes (including "X is not Y, X is Z" and "It's not just X, it's Y")
- All acronyms spelled out on first use
- Citation discipline: real sources only, with inline links or footnotes
- Concrete over abstract
- No sentence that could appear on any vendor's homepage

Service hub pages have one additional voice direction: **less editorial, more
service description.** A spoke is an article. A pillar is a destination. A
service hub is something between the two: it describes what RIPEDA does in a
service area while also being a topical hub readers can browse. The voice is
authoritative and specific to the service offering without being purely
marketing copy.

---

## Frontmatter spec

```yaml
---
layout: service-hub                                        # required
title: "Apple consulting and strategy advisory"            # required, exact service positioning
seo_title: "Apple Consulting and Strategy Advisory | RIPEDA Consulting"  # required for hubs
description: "..."                                         # required, 150-160 chars
permalink: /services/[slug]/                               # required, fixed by service slug
breadcrumb: true                                           # optional
date: 2026-MM-DD                                           # required
last_modified_at: 2026-MM-DD                               # optional, updates as hub is revised
service: strategy-advisory                                 # required, the service slug (used to filter related spokes)
keywords: "..."                                            # required, 5-10 head-term phrases
image: /images/services/[slug]-og.jpg                      # optional, OG image
hero:                                                      # required, hero block content
  eyebrow: "Service · Strategy Advisory"
  headline: "Apple consulting and strategy advisory"
  dek: "Two sentences expanding the headline and naming the audience."
  badges:                                                  # array of trust badges to show
    - "Apple Technical Partner since 2012"
    - "%YEARS_SINCE_2012% years of Apple-first business advisory"
  cta_label: "Talk to us about your environment"
  cta_url: "/#contact"
audience:                                                  # required
  who: "Founders, Operations Leads, and Practice Managers facing a specific Apple ecosystem decision."
  what: "Organizations who want a human partner for the decision, not a vendor product brochure."
faq:                                                       # required, 5-8 entries
  - q: "Question one?"
    a: "Answer one in 50-100 words."
  - q: "Question two?"
    a: "..."
---
```

Headings inside the body use `## Section title` for major sections and
`### Subsection` where needed. Body paragraphs are Markdown. The layout handles
all the chrome (hero, service grid, related insights, FAQ rendering, schema).

### Auto-updating year counts

The layout supports a `%YEARS_SINCE_YYYY%` placeholder that expands at build
time. The `_includes/expand-years.html` helper processes this in any badge
(`page.hero.badges`) or FAQ question/answer (`page.faq.q`, `page.faq.a`). For
body content (Markdown prose), use Liquid directly: `{{ site.time | date: "%Y"
| minus: 2012 }} years` renders as "14 years" in 2026 and rolls forward on each
site rebuild.

Use the placeholder in frontmatter strings. Use Liquid in body Markdown.

---

## Workflow

1. Confirm the service slug and engagement model.
2. Check `_data/insights.yml` for spokes whose `services:` array includes this
   hub's slug. List them. The hub must reference each in a body section with a
   `Read more →` link.
3. Confirm case study status: named, anonymized, or placeholder.
4. Draft hero (eyebrow, headline, dek, badges, CTA).
5. Draft "Who this is for" - audience description.
6. Draft body sections (5-7, each ~200 words, each linking to a spoke).
7. Draft case study tile(s).
8. Draft Why RIPEDA section.
9. Draft How an engagement works section.
10. Draft FAQ (5-8 questions).
11. Draft final CTA.
12. Write the file to `services/[slug].md` (replaces stub).
13. Run `python3 skills/ripeda-service-hub/validate-service-hub.py services/[slug].md`.
14. Fix what it flags.

---

## Quality checklist

The validator (`validate-service-hub.py`) automates most of these.

### Structure

- [ ] Frontmatter declares `layout: service-hub` and `service: ...`
- [ ] Hero block has eyebrow, headline, dek, badges, cta
- [ ] "Who this is for" section is present and concrete
- [ ] At least 5 body topic sections, each ~150-250 words
- [ ] Each topic section ends with a link to a spoke (`/resources/insights/...`)
- [ ] Every relevant published spoke for the service is referenced
- [ ] At least one case study tile (real, anonymized, or placeholder)
- [ ] "Why RIPEDA" credentials section is present
- [ ] "How an engagement works" section is present
- [ ] FAQ has 5-8 entries

### Length

- [ ] Body word count between 1,500 and 2,500

### Voice (same rules as spoke skill, apply rigorously)

- [ ] No em-dashes
- [ ] No emojis
- [ ] Canadian English
- [ ] No banned AI-speak phrases
- [ ] No AI tropes
- [ ] All acronyms spelled out on first use
- [ ] Every external statistic, percentage, or claim is paired with a named source
- [ ] No fabricated statistics or unsourced "studies show" / "research indicates"

### SEO

- [ ] Title 50-75 chars
- [ ] Description 150-160 chars
- [ ] Keywords 5-10 phrases, mix of head terms and service-line terms
- [ ] seo_title set explicitly

### Verification

- [ ] Page renders at `/services/[slug]/` and replaces the stub
- [ ] All spoke links resolve to published articles
- [ ] FAQ schema renders correctly (visible in page source as JSON-LD)
- [ ] Service grid renders with 3 cards (current service hidden)
- [ ] Related insights tiles appear based on services-array filter
- [ ] Mobile rendering tested
