---
name: ripeda-pillar-page
description: Use this skill whenever Kevin or anyone at RIPEDA wants to create, draft, or revise a top-level industry pillar page on the RIPEDA website. Triggers include any request to "write the Dental and Medical pillar", "draft the Design Agencies industry page", "build out /industries/[vertical]/", "write a pillar article for [vertical]", or "refresh the industry page for [vertical]". A pillar is the comprehensive 30,000-foot industry overview page at /industries/[vertical]/. It is NOT a spoke article in the Insights blog. Do NOT use this skill for spoke articles (use ripeda-insight-article instead), for service pages, for the AI training site at getanhourback.com, or for case study pages.
---

# RIPEDA Industry Pillar Page Skill

This skill codifies the spec for writing a RIPEDA industry pillar page. Pillar pages
live at `/industries/[vertical]/` and are the broad, authoritative overview of an entire
industry vertical (Dental & Medical, Design Agencies, Education, Professional Services).

A pillar is built on the **hub-and-spoke** content model. It ranks for industry head
terms ("Apple IT for dental practices") and links DOWN to spoke articles in
`_insights/` that cover individual topics in depth. The spokes link back UP to the pillar.
Together they signal topical authority to Google.

The companion skill `ripeda-insight-article` produces the spokes. Read its voice rules,
SEO patterns, and banned-phrase list - they all apply equally to pillars and are not
duplicated here. This skill only covers what differs from the spoke spec.

---

## What this skill produces

One change per run:

1. A Markdown file at `industries/[vertical].md` (or replaces the existing stub).
   Renders to `/industries/[vertical]/` via the `pillar` layout.

There is NO separate data file registration for pillars. They are top-level pages,
not collection items.

---

## Inputs the skill needs

If any are missing, ASK before drafting:

- **The vertical.** One of: dental-medical, design-agencies, education, professional-services.
  (Marketing-agencies and the topic verticals like mdm-security, infrastructure, ai-productivity
  are spoke-only categories and do not get pillar pages.)
- **Available case studies.** Named clients with permission to publish, anonymized client
  stories, or "no case studies yet, use placeholder language."
- **Tier (Tier 1 vs Tier 2 vs Tier 3).** Tier 1 verticals (Dental, Design) get the full
  comprehensive pillar treatment. Tier 2 (Education) gets a narrower scoped pillar.
  Tier 3 (Professional Services) gets a horizontal overview pillar.
- **Which spokes already exist** for this vertical. Check `_insights/` for relevant
  published articles. The pillar must link to all of them. The skill enforces this in
  the validator.

## Critical pre-flight: align spoke verticals to the pillar

Every spoke that the pillar's body links to should have the pillar's vertical in its
`verticals:` list in `_data/insights.yml`. Otherwise the spoke shows up in the pillar's
body but not in the "Related reading" grid at the bottom, which makes the pillar feel
incomplete.

For horizontal-topic spokes (Networks, MDM, Remote Support, Passwords, Backup) that
apply across every industry, the correct vertical assignment is usually ALL four
industry verticals plus their primary topic vertical:

```yaml
verticals: [mdm-security, dental-medical, design-agencies, education, professional-services]
```

Before drafting a pillar, scan the body section topics. For each spoke the pillar will
link to, verify the spoke's data-file entry already lists the pillar's vertical. If
not, fix the spoke entry first.

The pillar validator (`validate-pillar.py`) will warn if a pillar's body links to
spokes that are not in the data file's published-and-verticals-matching list.

---

## Critical pre-flight: plan the pillar before writing any spokes

The hub-and-spoke architecture only works when **the pillar is planned first** and the
spokes are written to fill the topic sections it requires. Writing a pile of spokes and
trying to retrofit them into a pillar produces either gaps (sections with no deep
content to link to) or a misshapen pillar that meanders around whatever the spokes
happen to cover.

The correct sequence for a NEW pillar where spokes do not yet exist:

1. **Plan the pillar's outline first.** List the 5-7 topic sections this industry needs
   the pillar to cover. Each section is a topic area, named concretely.
2. **Map each section to a spoke.** For each section, identify either the existing spoke
   that covers the topic in depth, OR the spoke that needs to be written.
3. **Write any missing spokes first**, using the `ripeda-insight-article` skill.
4. **Only after all referenced spokes exist** does the pillar get written.

The one exception is when converting an existing set of horizontal business-IT spokes
(MDM, networks, backup, repair, identity, remote support) into a first-pass pillar for
a vertical where those topics happen to apply. The Dental & Medical pillar fit this case
because the seven converted newsletters happened to cover six of its needed sections.
That coincidence does NOT generalise to other pillars.

When asked to write a pillar for a vertical, the FIRST output should be the section
plan and the spoke-mapping. Only after Kevin confirms the plan (and any missing spokes
have been authored) should the pillar's body be drafted.

---

## Structure of a pillar page

Every pillar follows this structural shape. Sections in this exact order. The pillar
layout (`_layouts/pillar.html`) expects this structure.

### 1. Hero

- Industry name in the H1: "Apple IT for dental and oral surgery practices"
- Subheading (dek): 1-2 sentences naming the audience and the promise
- Trust badges visible near the hero: Apple Technical Partner, AASP, Fortinet, Ruckus
- Primary CTA button: "Talk to us about your practice"

### 2. Who this is for

- A short section (100-150 words) describing the buyer and the use case.
- Names roles concretely (Practice Manager, COO, Network Lead, etc.).
- Names sizes concretely ("clinics with 5+ chairs", "agencies of 20-80 staff").
- Sets up that the rest of the page is going to be useful by being specific.

### 3. The body sections (the substance of the pillar)

Five to seven major sections, each covering one topic area. Each section is roughly
150-250 words and ends with a "Read more →" link to the relevant spoke article.

Example sections for the Dental & Medical pillar:

- Clinical fleet management (links to MDM beyond enrollment)
- Network reliability when imaging cannot wait (links to business networks spoke)
- Backup and PHIPA compliance (links to business backup spoke)
- Apple Authorized Repair for clinical Macs (links to repair spoke)
- Password management and clinical access (links to passwords spoke)
- Remote support when staff cannot bring a device in (links to remote management spoke)

The selection of sections is industry-driven. For Design Agencies, you'd cover creative
file sharing, asset management, AI for design, device lifecycle. For Education, you'd
cover network refreshes, repair programs, advisory engagements (the narrow positioning).

### 4. The industry-specific stack

A section (150-200 words) naming the specific tools, software, equipment, regulations,
or workflows that define this vertical. For dental: practice management software
(Dentrix, Open Dental, Tracker), imaging (CBCT, intraoral cameras, sensors), PHIPA
and PIPEDA. For design: Creative Cloud, NAS storage, video review, asset libraries.
This is where the pillar earns its credibility with a buyer who knows their industry.

### 5. Case studies

One to three case study tiles, each 80-120 words. Named clients when permissions
allow, anonymized when not. Each tile follows the pattern: client context → problem
→ what we did → outcome (with at least one concrete number).

Placeholder language is acceptable when case studies are not yet finalized:

> *"Case studies for this industry are being prepared with client permission. In
> the meantime, ask us about [specific examples by industry] when we talk."*

The validator will check that case studies (real OR placeholder) appear.

### 6. Why RIPEDA specifically

A short section (100-150 words) naming credentials. Apple Technical Partner since 2012,
Apple Authorized Service Provider, Fortinet authorization, Ruckus partner, individual
ACRT certifications, named team experience in the vertical. This is the trust block.
Do not turn it into marketing copy.

### 7. How an engagement works

A short section (100-150 words) describing the typical engagement flow.
Discovery → migration/setup → ongoing managed service, or Discovery → project →
handoff for project-based work.

### 8. Service grid

A 2x2 or 4-up grid of cards linking to:
- /services/managed-apple-it/
- /services/strategy-advisory/
- /services/network-infrastructure/
- /services/apple-authorized-repair/

The layout renders this from a fixed list - no need to author it per pillar.

### 9. Related insights

Tile-style links to spoke articles in `_insights/` that are relevant to this vertical.
Pulled automatically by the layout from `site.insights` filtered to articles whose
`verticals` include the current pillar's vertical. The pillar's frontmatter just
declares the vertical and the layout does the work.

### 10. FAQ

5-8 industry-specific questions with answers (50-100 words each). The layout emits
`FAQPage` JSON-LD schema for Google. Questions should answer what a buyer would
actually ask before booking a consultation:

- How quickly can you get our clinic onboarded?
- Do you work with our practice management software?
- What does ongoing support actually look like day-to-day?
- Are you familiar with [industry-specific software]?
- How do you handle [industry compliance requirement]?

### 11. Final CTA

One conversion ask. Calendar booking, phone, or contact form.

---

## Length target

**1,500 to 2,500 words** in the body, exclusive of FAQ and case studies.
Sweet spot: 1,800-2,000 words.

A pillar shorter than 1,500 words usually reads as a stub. Longer than 2,500 reads
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
- Concrete over abstract
- No sentence that could appear on any vendor's homepage

Pillar pages have one additional voice direction: **less editorial, more reference.**
A spoke is an article. A pillar is a destination. The voice is slightly more measured,
slightly less story-shaped, because the reader is often scanning sections rather
than reading start-to-finish.

---

## Frontmatter spec

```yaml
---
layout: pillar                                            # required
title: "Apple IT for [vertical]"                          # required, exact industry positioning
seo_title: "Apple IT for [Vertical] | RIPEDA Consulting"  # required for pillars
description: "..."                                        # required, 150-160 chars
permalink: /industries/[slug]/                            # required, fixed by vertical
breadcrumb: true                                          # optional
date: 2026-MM-DD                                          # required
last_modified_at: 2026-MM-DD                              # optional, updates as pillar is revised
vertical: dental-medical                                  # required, the vertical id (used to filter related spokes)
keywords: "..."                                           # required, 5-10 head-term phrases
image: /images/industries/[vertical]-og.jpg               # optional, OG image
hero:                                                     # required, hero block content
  eyebrow: "Industry · Dental & Medical"
  headline: "Apple IT for dental and oral surgery practices"
  dek: "Two sentences expanding the headline and naming the audience."
  badges:                                                 # array of trust badges to show
    - "Apple Technical Partner since 2012"
    - "Apple Authorized Service Provider"
  cta_label: "Talk to us about your practice"
  cta_url: "/#contact"
audience:                                                 # required
  who: "Practice Managers, owner-dentists, and office leads at clinics with 5+ chairs."
  what: "Clinics that depend on Apple devices for clinical workflows and patient-facing work."
faq:                                                      # required, 5-8 entries
  - q: "Question one?"
    a: "Answer one in 50-100 words."
  - q: "Question two?"
    a: "..."
---
```

Headings inside the body use `## Section title` for major sections and `### Subsection`
where needed. Body paragraphs are Markdown. The layout handles all the chrome
(hero, service grid, related insights, FAQ rendering, schema).

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

1. Confirm the vertical and tier.
2. Check `_insights/` for spokes whose `verticals` include this pillar's vertical.
   List them. The pillar must reference each in a body section with a `Read more →` link.
3. Confirm case study status: named, anonymized, or placeholder.
4. Draft hero (eyebrow, headline, dek, badges, CTA).
5. Draft "Who this is for" - audience description.
6. Draft body sections (5-7, each ~200 words, each linking to a spoke).
7. Draft industry-specific stack section - the credibility block.
8. Draft case study tile(s).
9. Draft Why RIPEDA section.
10. Draft How an engagement works section.
11. Draft FAQ (5-8 questions).
12. Draft final CTA.
13. Write the file to `industries/[slug].md` (replaces stub).
14. Run `python3 skills/ripeda-pillar-page/validate-pillar.py industries/[slug].md`.
15. Fix what it flags.

---

## Quality checklist

The validator (`validate-pillar.py`) automates most of these.

### Structure

- [ ] Frontmatter declares `layout: pillar` and `vertical: ...`
- [ ] Hero block has eyebrow, headline, dek, badges, cta
- [ ] "Who this is for" section is present and concrete
- [ ] At least 5 body topic sections, each ~150-250 words
- [ ] Each topic section ends with a link to a spoke (`/resources/insights/...`)
- [ ] Every relevant published spoke for the vertical is referenced
- [ ] Industry-specific stack section names concrete tools/software/regulations
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

### SEO

- [ ] Title 50-60 chars
- [ ] Description 150-160 chars
- [ ] Keywords 5-10 phrases, mix of head terms and verticals
- [ ] seo_title set explicitly

### Verification

- [ ] Page renders at `/industries/[slug]/` and replaces the stub
- [ ] All spoke links resolve to published articles
- [ ] FAQ schema renders correctly (visible in page source as JSON-LD)
- [ ] Service grid renders with 4 cards
- [ ] Related insights tiles appear based on vertical filter
- [ ] Mobile rendering tested
