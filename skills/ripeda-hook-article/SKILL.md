---
name: ripeda-hook-article
description: Use this skill whenever Kevin or anyone at RIPEDA wants to create, draft, or batch-write a short-form "hook" article for the RIPEDA Insights blog - the 2-3 minute quick reads, as distinct from the 4-6 minute spoke articles. Triggers include "write a hook article", "do a Top 5 piece on [X]", "draft some quick reads", "write the short version of [spoke]", "5 things to do after [situation]", "batch out a few hook articles", or any request framed as a numbered list, checklist, or single-question answer destined for /resources/insights/. Also use when converting an existing long spoke into its short companion piece. Do NOT use for full spoke articles (use ripeda-insight-article), pillar pages (ripeda-pillar-page), or service hubs (ripeda-service-hub).
---

# RIPEDA Hook Article Skill

Short-form companion to `ripeda-insight-article`. Same site, same collection, same voice, different unit of content.

A **spoke** is 500-900 words, answers "how should I think about this?", and supports a pillar page.
A **hook** is 350-700 words, answers "what do I do right now?", and supports a spoke.

Read `skills/ripeda-insight-article/SKILL.md` for the full voice, SEO, and frontmatter spec. This skill documents only what differs. Where the two conflict, this file wins for hook articles.

---

## Why hooks exist

As of August 2026 every published Insight is a spoke. There is no shallow end to the content library. Hooks fix three specific gaps:

1. **Long-tail search.** "What do I do when an employee leaves with a MacBook" is a real query. The spoke on hybrid fleet management does not rank for it because the spoke is about something broader.
2. **Shareability.** A 2-minute numbered list gets pasted into a Slack channel. A 6-minute strategy piece gets bookmarked and forgotten.
3. **Internal link equity.** Every hook points up to its parent spoke. Ten hooks feeding one spoke is a meaningful ranking signal that ten unconnected spokes are not.

If a draft does not serve at least one of those three, it should be a spoke instead.

---

## The two article types side by side

| | Spoke (`ripeda-insight-article`) | Hook (this skill) |
|---|---|---|
| Body length | 500-900 words | 350-700 words |
| `reading_time` | 4-6 | 2-3 |
| Question answered | "How should I think about this?" | "What do I do right now?" |
| Structure | Narrative, comparison blocks | Numbered list or checklist |
| Headline | Descriptive | Contains a number or a direct question |
| TL;DR bullets | 4-6 | 3-4 |
| Related links | Service + industry + optional sibling | Parent spoke + service (industry optional) |
| Verticals | 1-2 industry or topic verticals | Inherited from the parent spoke |
| `format` field | omitted | `format: hook` in `_data/insights.yml` |
| Written | One at a time | In batches of 4-6 |

---

## Verticals: inherit from the parent spoke

**A hook takes its parent spoke's `verticals` verbatim.** Not a subset, not a judgment call. If the parent is tagged `[mdm-security, dental-medical, education]`, so is the hook.

This is the whole rule, and it exists because the alternative was tried and rejected. There was once a `quick-reads` vertical. It was removed on 2026-08-21. **Do not reintroduce it.**

The reason: the filter row on `/resources/insights/` is single-select over industry verticals. A hook tagged `quick-reads` instead of an industry vanishes the moment a reader clicks "Education" — and the two-minute answer is precisely what that reader wants most. Length is not an industry, so it does not belong on an axis that means industry.

Length lives on its own axis instead: `format: hook` in the data file entry drives a "Quick read" pill on the card and a separate All / Quick reads / Deep dives toggle above the grid. That toggle ANDs with the industry tabs, so "Education + Quick reads" is a view a reader can actually reach.

**Standalone hooks.** If no spoke is a sensible parent, pick the one or two industry verticals the piece genuinely serves and lead `related` with a service page. Standalone is about the *parent link*, not about the tagging. `buying-a-used-mac-checklist` is the current example: no parent spoke, tagged `mdm-security` because Activation Lock and ABM enrollment are its actual subject.

---

## The seven hook patterns

Pick one deliberately. Mixing patterns inside a single article is the most common way a hook drifts back into being a bad spoke.

| Pattern | Shape | Example |
|---|---|---|
| **Post-event** | *N things to do after [event]* | "5 things to do with a Mac the day an employee leaves" |
| **Common mistakes** | *The N most common [X] mistakes* | "The 7 most common Apple Business Manager setup mistakes" |
| **Breakpoint** | *What breaks first when [scale event]* | "What breaks first when an agency hits 15 people" |
| **Pre-purchase** | *N questions to ask before [decision]* | "7 questions to ask an MSP before you sign" |
| **Fast comparison** | *[A] vs [B] in 60 seconds* | "Apple Business Manager vs Apple School Manager" |
| **Quick check** | *The N-minute [X] check* | "The 10-minute Mac security check" |
| **Real cost** | *What [X] actually costs* | "What a single lost laptop actually costs" |

### Pattern rules

- **The number in the headline must match the number of items in the body.** Obvious, and the single easiest thing to get wrong when editing down.
- **Odd numbers outperform even ones** for the post-event and mistakes patterns. 5 and 7 read as considered. 6 and 10 read as padded to a round figure.
- **Never invent an item to hit a number.** Change the number in the headline instead.
- **Fast comparison and real cost patterns** do not need a numbered body, but still need a hard structural spine (a table, or two named sides).

---

## Structure

```
[Hook opener: 2-3 sentences. The situation, stated concretely. No throat-clearing.]

[Optional single orienting sentence: why the order matters, or what most people get wrong.]

## 1. [Imperative verb phrase]

[2-4 sentences. What to do, why, and the specific consequence of skipping it.]

## 2. [Imperative verb phrase]

...

## If you only do one thing

[1-2 sentences. The highest-value item, restated. This is the shareable line.]
```

### Body rules

- **Every item is an `##` heading**, not a bold line inside a paragraph. The headings become the on-page anchors and get picked up as a featured snippet list.
- **Item headings are imperative and specific.** "Reclaim the Adobe license" beats "Software licenses." "Check Activation Lock before money changes hands" beats "Activation Lock."
- **2-4 sentences per item. Hard ceiling.** If an item needs five, it is a spoke section wearing a hook's clothes.
- **Order matters and should be defensible.** For post-event hooks, order by urgency. For mistakes hooks, order by frequency. Say so in the orienting sentence if it is not obvious.
- **Name real things.** FileVault, Activation Lock, ABM, the APNs certificate, Jamf, Mosyle. A hook that could have been written by someone who has never touched the tool is worthless.
- **No comparison blocks or stat blocks.** Those belong to spokes. A hook that needs a `insight-compare` block has outgrown the format. Exception: the fast-comparison pattern may use one `insight-compare` block and nothing else.
- **"If you only do one thing" is required** and is always the last heading. It is the line that gets quoted when someone shares the article.

---

## Frontmatter

Same shape as a spoke, with these differences:

```yaml
---
layout: insight                          # unchanged
title: "5 things to do with a Mac the day an employee leaves"
dek: "..."                               # 1 sentence for hooks, not 2
description: "..."                       # 150-160 chars, unchanged
date: 2026-MM-DD
tags:                                    # 2-3 for hooks (spokes use 2-4)
  - Lifecycle
  - Security
keywords: "..."                          # 5-8 phrases, weighted long-tail
reading_time: 2                          # 2 or 3, never 4+
author: "RIPEDA"
tldr:                                    # 3-4 bullets for hooks
  - "..."
related:                                 # parent spoke FIRST, then service
  - title: "Managing a hybrid office Mac fleet"
    url: "/resources/insights/hybrid-office-mac-fleet/"
    context: "The full picture on managing Macs across office, home, and client sites."
  - title: "Managed Apple IT"
    url: "/services/managed-apple-it/"
    context: "How offboarding fits into ongoing fleet management."
---
```

### Title rules for hooks

- **40-70 characters.** Slightly wider tolerance than spokes because the number and the situation both have to fit.
- **Lead with the number or the question.** "5 things to do..." not "What to do: 5 things..."
- **Sentence case, no trailing period.** Unchanged from spokes.
- **The situation goes in the title, not the dek.** Someone scanning a search results page decides on the title alone.

### Keywords for hooks

Weight harder toward long-tail than spokes do. A hook's entire value is ranking for the specific question. Include at least three phrases that read like something typed into a search bar in full:

- `what to do when an employee leaves with a company macbook`
- `how to check activation lock before buying a used mac`
- `apple business manager setup mistakes`

Two or three head terms (`Apple IT Calgary`, `Mac fleet management`) round it out.

### The parent link is mandatory

Every hook's `related` block starts with its parent spoke. That is the point of the format. If no published spoke is a sensible parent, either:

1. The hook is standalone. Tag it with the one or two industry verticals it genuinely serves, lead `related` with a service page instead, and note it in the draft so Kevin knows.
2. The spoke should be written first, and the hook queued behind it.

---

## Voice

Identical to `ripeda-insight-article`. The full banned-phrase list, the no-em-dash rule, Canadian English, and the no-emoji rule all apply without modification. Read that section of the spoke skill before drafting.

Two hook-specific additions to the banned list:

- **"Pro tip:"** and **"Bonus tip:"** - listicle filler. If it is worth saying, it is an item.
- **"And that's it!"** / **"Simple as that."** - false-breeziness. End on the substance.

One hook-specific style note: hooks are shorter, so the temptation is to compensate with punchiness. Resist it. The voice is the same engineering-calm as the spokes, just doing less. A hook that sounds like a different company wrote it defeats the purpose of having a content library.

---

## Draft mode vs publish mode

The skill runs in one of two modes. **Ask which one if it is not stated.**

### Draft mode (default for batches)

For review before anything touches the live site.

- Write to `hook-drafts/[slug].md` at the repo root. **Not** inside `_insights/`.
- Set `published: false` in frontmatter
- **Do not** touch `_data/insights.yml`

Drafts live outside the collection deliberately. A file inside `_insights/` is a member of the collection and Jekyll will generate a page for it whether or not anything links there, and whether or not `published: false` is set on a data-file entry that does not yet exist. Keeping drafts at the repo root means the only thing standing between a draft and the public site is an explicit move.

`hook-drafts` should be listed under `exclude:` in `_config.yml` so the directory is not copied into `_site`. Confirm that line exists before the first batch.

### Publish mode

Once Kevin approves a draft.

1. Move the file from `hook-drafts/[slug].md` to `_insights/[slug].md`
2. Remove `published: false` from frontmatter
3. Register in `_data/insights.yml` with `format: hook`:

```yaml
- title: "5 things to do with a Mac the day an employee leaves"
  verticals: [professional-services, design-agencies, mdm-security]
  vertical: professional-services
  read_time: 2
  format: hook
  date: "Aug 2026"
  services: [managed-apple-it]
  slug: mac-offboarding-checklist
  published: true
```

4. Run `validate-hook.py`

---

## Batch workflow

Hooks are written in batches. That is most of the economic argument for the format.

1. **Confirm the batch.** Which titles, from `hook-articles-brainstorm.md` or from Kevin directly.
2. **Confirm mode.** Draft or publish. Default to draft.
3. **Map parents.** For each title, name the parent spoke — it supplies the hook's verticals. Flag any that have no parent as standalone, and propose industry verticals for those.
4. **Check for overlap.** Two hooks in the same batch must not answer the same question from different angles. If they do, merge them.
5. **Assign patterns.** One of the seven, per article. Write it down before drafting.
6. **Draft.** All of them, then review as a set. Consistency across the batch matters more than perfecting any single one.
7. **Read them consecutively.** The most common batch failure is five articles that each open with the same sentence shape. Vary the openers deliberately.
8. **Validate.** Run `validate-hook.py` on the batch.

---

## Site wiring

Done on 2026-08-21, when the first 18 hooks were published. Recorded here so nobody redoes it or undoes it.

1. ~~Add the `quick-reads` vertical~~ — **rejected.** See "Verticals: inherit from the parent spoke" above. Length is not an industry.
2. **Format axis, not a tab.** `resources/insights.html` renders `format: hook` as a "Quick read" pill on the card, and carries an All / Quick reads / Deep dives toggle that ANDs with the industry tabs. Cards expose `data-format`; `render()` combines `verticalMatch && searchMatch && formatMatch`.
3. **Validator scoping.** `validate-article.py --all` skips anything registered `format: hook`; `validate-hook.py --all` scans `hook-drafts/` *and* published hooks in `_insights/`. Neither grades the other's articles. Keep that true if either script is edited.

### Still open

**Hook OG images.** There are 32 in `images/insights/`, one per spoke, and none for any hook. Hooks get shared more than spokes do, so the site-wide fallback card costs more here. A numbered template would cover all 18 cheaply.

---

## Quality checklist

Run in addition to the spoke checklist's voice and frontmatter sections.

### Format

- [ ] Body is 350-700 words
- [ ] `reading_time` is 2 or 3
- [ ] The number in the title matches the item count in the body
- [ ] Every item is an `##` heading, imperative and specific
- [ ] No item runs longer than 4 sentences
- [ ] "If you only do one thing" section is present and last
- [ ] Exactly one of the seven patterns is in use
- [ ] No `insight-compare` or `insight-stat` block (except one compare block in fast-comparison pattern)

### Linking

- [ ] `related` leads with the parent spoke, or is flagged standalone
- [ ] Parent spoke URL resolves to a published article in `_insights/`
- [ ] At least one `/services/` link present
- [ ] Every related entry has a `context:` line

### Categorization

- [ ] Verticals match the parent spoke exactly (or, for standalones, are real industry verticals)
- [ ] `format: hook` present in the data file entry (publish mode only)
- [ ] TL;DR has 3-4 bullets

### Batch-level

- [ ] No two hooks in the batch answer the same question
- [ ] Opening sentence shapes vary across the batch
- [ ] Read consecutively without the voice drifting

---

## Notes for future evolution

- If a hook consistently outranks its parent spoke, that is a signal the spoke's title is wrong, not that the hook is too good. Worth checking in Search Console after the first batch has been live a quarter.
- The `format: hook` flag is deliberately generic. If a third format appears later (a calculator page, a checklist download), it extends rather than needing a new mechanism.
- Hooks are the natural place to test OG image templates, since they get shared more. Whatever is learned there should feed back into spoke OG cards.
- The seven patterns are not sacred. If a new one earns its place through performance, add it here with an example.

---

*RIPEDA Consulting Corporation | Companion to ripeda-insight-article | v1.0*
