# RIPEDA Website Redesign Strategy

*Positioning, information architecture, and content plan for the 2026 redesign and 2026 to 2027 growth direction*

*RIPEDA Consulting Corporation  |  May 2026  |  v1.0  |  Internal*

---

## Background

Everbrave delivered a 2026 and 2027 Growth Plan in May 2026 oriented around "Apple-first IT for schools and libraries." Subsequent strategic conversations have surfaced material divergence from that frame. RIPEDA's highest value clients are in dental and oral surgery practices and design agencies. The library client was exited in early May 2026. The strategic direction is to move up the value chain into advisory work, with managed IT as foundation rather than ceiling.

This document captures the resulting working strategy: positioning, target verticals, service architecture, information architecture for the website redesign, content migration approach, and outstanding decisions. It is intended as a working artifact that Kevin uses to make decisions and that Claude executes against.

---

## Strategic Position

### The Pivot

The market for tactical Apple managed IT is compressing from both sides. MDM platforms (Mosyle, Jamf, Kandji) reduce day-to-day complexity. AI assistants are absorbing first-tier troubleshooting. Margin will continue migrating toward the strategic decisions buyers want a human partner for: technology strategy, security posture, AI rollout, vendor consolidation, infrastructure planning.

RIPEDA's positioning shifts accordingly.

> **From:** Apple-first IT for schools and libraries.
>
> **To:** Apple Technical Partner for design-conscious, regulation-aware organizations. RIPEDA combines managed services with strategic advisory.

The phrase "Apple Technical Partner" is RIPEDA's actual Apple designation. It carries trust weight no marketing language can replicate. Lead with it.

### No Rename

Everbrave's "Second Byte IT" rename recommendation should be declined. Three reasons.

1. The strategic direction is to broaden beyond "IT", not anchor harder to it. A name with "IT" in it caps the brand at the level the strategy is trying to escape. RIPEDA's abstractness is a feature for a consultancy growing into strategy work.
2. Existing brand equity, SEO history, certifications, and client relationships have measurable cost to rebuild. The migration cost is not zero.
3. The Apple Technical Partner designation does the positioning work a new name was meant to do. Pair the existing name with a permanent descriptor and the "say what you do" gap closes.

Recommended descriptor lockup to use consistently across home page hero, email signatures, business cards, and meta descriptions:

> **Lockup:** RIPEDA. Apple Technical Partner. Strategy, Security, and Managed Services.

Other candidates worth A/B testing in copy:

- RIPEDA. Apple Technical Partner for design, dental, and education.
- RIPEDA. Technology partner for Apple-first organizations.

---

## Target Verticals

Four tiers based on revenue contribution, current case study depth, and search intent.

### Tier 1: Full pillar and spoke content

- **Dental and Medical.** Strongest revenue contribution, particularly oral maxillofacial surgery practices. Clear regulatory frame (PHIPA, PIPEDA, HIA where applicable). Existing case studies including Circle Medical. Technical specifics worth speaking to: digital imaging, CBCT, intraoral cameras, practice management software, secure remote access. Buyer personas: Practice Manager, Office Manager, occasional CFO or Owner-Dentist.
- **Design Agencies.** Strong network into the vertical via EvansHunt, Everbrave, and adjacent agencies. Apple-default culture, tech-aware buyers, strategic partner expectation. Existing case studies including Identity Ink. Technical specifics: creative team workflows, collaboration, storage, on-device AI for design, asset management. Buyer personas: COO or Studio Director, sometimes the agency Principal directly.

### Tier 2: Stub pillar with positioning and offer-specific content

- **Education (repair and network only).** Apple Education Reseller program declined RIPEDA. Public schools have become difficult procurement environments. Charter and private schools are the workable path. Three offers, no managed services pitch: (1) network infrastructure projects with a strong WiFi case study as the hero; (2) Apple Authorized Service Provider repair work for existing fleets; (3) project-based advisory engagements (no retainer). Sharp, narrow, defensible positioning.

### Tier 3: Light vertical page or rolled into Industries overview

- **Professional Services.** Catch-all for SaaS, accounting, consulting, legal-adjacent. Smaller contribution, more horizontal positioning. Does not justify a full pillar but should not be invisible. A single page that names sub-verticals and explains the approach.

### Out of scope

- **Libraries.** Client recently exited, not a target market.
- **Law firms.** Small contribution, no current focus.
- **K-12 public schools.** Procurement-constrained, Apple Education Reseller program declined.

---

## Service Architecture

Four core service lines. The advisory line is the strategic priority for 2026 and 2027.

### 1. Strategy Advisory (new, top priority)

The premium tier. Project- and retainer-based. Decision domains RIPEDA can credibly advise on:

- Technology strategy and vendor consolidation
- Security posture and incident response readiness
- MDM platform selection and identity / SSO architecture
- Infrastructure planning and lifecycle modeling
- Apple ecosystem decisions (Apple Business Manager, MDM, device fleet planning)

Engagement models to publish on the page, with starting-from pricing:

- Strategy sprint (90-day project)
- Quarterly advisory retainer
- Single-question deep dives

AI-specific advisory and training does not live on this page. It lives at getanhourback.com. Cross-link both directions.

### 2. Managed Apple IT (existing core)

The bread-and-butter recurring revenue. Per-seat pricing (Mac Seat, Network Seat) is already structured. Show starting-from pricing on the services page to give buyers a price signal without committing to flat numbers.

Sub-services worth their own anchor sections or pages:

- Device management and MDM
- Help desk and remote support
- Network engineering (Fortinet, Ruckus)
- Security and compliance
- Backup and disaster recovery
- Apple Business Manager setup and ongoing management

### 3. Network Infrastructure (productized projects)

The school WiFi case study becomes the hero asset. Productize the offering: network design, deployment, refresh, segmentation. Pull from the existing Engineering page and rename for clarity.

### 4. Apple Authorized Repair (client benefit, not public service)

RIPEDA holds AASP designation. Repair work is offered to existing clients only, not as a public walk-in service. Frame on the website accordingly: a value-add for managed clients, a credibility signal for prospects.

Do not make this a public SEO destination. It would attract walk-in traffic RIPEDA cannot serve.

---

## Information Architecture

Proposed top-level navigation. Maps to the Jekyll structure already in the redesign workspace.

```
Home
Services
   Strategy Advisory
   Managed Apple IT
   Network Infrastructure
   Apple Authorized Repair (client benefit page)
Industries
   Dental and Medical
   Design Agencies
   Education (Repair and Networks)
   Professional Services
Resources
   Insights (blog / newsletter archive)
   Calculators (Mac vs PC TCO, Downtime Cost)
   AI Training (link to getanhourback.com)
   FAQ
About
   Team
   Credentials (Apple Technical Partner, AASP, Fortinet, Ruckus)
Case Studies
Contact
```

### Changes from the current redesign navigation

- Add Industries as a top-level navigation item.
- Add Resources as a top-level navigation item. Currently a dropdown exists in the redesign but the content sits hidden under `/business-resources/`.
- Add Strategy Advisory as a service line.
- Rename Engineering to Network Infrastructure.
- Keep Case Studies prominent. Either top-level or under About.
- Drop Device as a Service as a separate top-level service. Fold into Managed Apple IT.

### Home Page Approach

Preserve the existing narrative scroll: "problems you face, our approach, end-to-end, case studies, contact us." It works for warm referral traffic. Add navigational off-ramps from each section into the deeper pages.

- End each home page section with a "Learn more" link to the relevant industry or service page.
- Keep calculators on the home page. They are conversion assets, already built.
- Lead the hero with the descriptor lockup, the Apple Technical Partner badge, and the testimonial strip.

### Industry Pillar Page Template

Each industry pillar should follow a consistent structure.

1. Hero with industry-specific value statement
2. Specific technical concerns RIPEDA understands for this industry
3. The case study, named where possible, anonymized otherwise
4. Spoke article tiles linking to related Resources content
5. Conversion CTA (free assessment, calculator, contact)

Target length: 1500 to 2000 words on each pillar. The hub-and-spoke SEO model requires depth.

### URL Reservation

Even before populating content, reserve the URL namespace so future SEO equity is not lost to URL churn.

```
/services/strategy-advisory
/services/managed-apple-it
/services/network-infrastructure
/services/apple-authorized-repair
/industries/dental-medical
/industries/design-agencies
/industries/education
/industries/professional-services
/resources/insights
/resources/insights/[article-slug]
/case-studies
/case-studies/[client-slug]
/about/credentials
```

---

## Content Migration Plan

The hidden `/business-resources/` directory contains existing newsletter content (issues 76 through 82) that should be republished as Resources content with light editing.

### Newsletter to Spoke Mapping

| Issue | Topic | Pillar Fit | Effort |
|-------|-------|------------|--------|
| 76 | iCloud Backup | Dental / Medical | Light edit |
| 77 | File Sharing | Design Agencies | Light edit |
| 78 | Networks | Education (WiFi case study) | Light edit, add CS link |
| 79 | Remote Support | All pillars | Light edit |
| 80 | MDM Focus | All pillars, especially Education | Light edit |
| 81 | Password Vaults | Dental / Medical, Professional Services | Light edit |
| 82 | Apple Repair | Dental / Medical, Education | Light edit |

> **Note:** The brand visual language in these newsletters is intentional. The magenta gradient is drawn from the original Apple logo. The issue numbers correspond to years for Apple as a company. Both should be preserved when adapting newsletters to the web format.

### Newsletter Archive Gap

Newsletters 1 through 75 exist somewhere but are not in the website redesign workspace. Locating these is worth doing. If only a third of them adapt cleanly, that adds roughly 25 spokes to the content library at minimal writing cost. Action item for Kevin: identify where the archive lives and assess.

### Non-Newsletter Resources Files

The `conversation_openers.html` and `discovery_questions.html` files are internal sales tools, not blog content. Keep them out of the public Resources section. Consider whether they become the basis of an internal sales playbook.

The `supabase_dashboard.html` is internal operations infrastructure, not content. Out of scope for this redesign.

### New Spoke Content Beyond Newsletters

Each Tier 1 pillar should aim for one anchor pillar plus four to eight spokes. Beyond republishing newsletters, write new spokes that target high-intent keywords.

**For Dental and Medical:**

- Apple IT compliance for dental clinics under PHIPA
- Replacing aging dental imaging infrastructure on Apple
- Why dental practices switch from PC to Mac

**For Design Agencies:**

- Apple Intelligence and creative team productivity
- Storage strategies for design teams on Mac
- Apple device lifecycle for creative agencies

**For Education:**

- Apple Authorized Repair for school fleets explained
- Designing reliable school WiFi: lessons from the field (the existing case study, expanded)

---

## Implementation Sequence

Phased to ship value early and validate the content model before broad investment.

### Phase 1: Foundation (now to next 30 days)

- Finalize this strategic document and decisions.
- Resolve open decisions listed below.
- Ship the home page redesign already in flight.
- Wire contact forms to HaloPSA (already on TODO, critical).
- Reserve URL namespace for new pages with stub content.
- Lift Roy's bio from getanhourback.com to `/about/team`.
- Update the AI Training URL in the Resources dropdown to https://getanhourback.com.

### Phase 2: First pillar and content surfacing (30 to 90 days)

- Build the Dental and Medical pillar page (highest-revenue vertical, strongest case studies).
- Republish newsletter issues 76 through 82 as Resources articles, lightly edited, with cross-links to relevant pillars.
- Build the Strategy Advisory service page with starting-from pricing.
- Build the Education pillar (repair and network only).
- Add advisory and AI training topics to the FAQ.

### Phase 3: Second pillar and measurement (90 to 180 days)

- Build the Design Agencies pillar page.
- Add second wave of pillar-specific spoke content (four to eight per Tier 1 pillar).
- Measure: organic landings, time on page, contact form submissions by URL.
- Adjust based on data.

### Phase 4: Maturity (180 to 365 days)

- Build out Tier 3 vertical pages (Professional Services).
- Productize the WiFi network refresh as a fixed-scope offering.
- Build advisory case studies from engagements completed in Phase 2 and Phase 3.
- Consider city pages for Edmonton and Lethbridge if measurement supports.

---

## Open Decisions

Decisions Kevin needs to call before further building. Each has a recommendation but final call rests with him.

1. **Strategy Advisory engagement structure and pricing.** What are the actual engagement models RIPEDA wants to offer (sprint, retainer, both), and what is the floor pricing to publish? Without this, the advisory page cannot ship.
2. **Apple Reseller distinction.** Confirm the exact framing for the Education page. RIPEDA holds Apple Authorized Reseller status per the FAQ but was declined the Apple Education Reseller designation. The Education page must be careful and accurate about what RIPEDA can and cannot do for schools.
3. **Newsletter archive location.** Where do issues 1 through 75 live? Triaging them would substantially accelerate the content library buildout.
4. **The "Claude Memory Bomb" TODO item.** What does this refer to? If it is planned AI integration on the website itself, it should be coordinated with this redesign strategy.
5. **Charter and private schools as a sub-segment.** The FAQ mentions charter schools specifically. Is this a real focus, a historical artifact, or worth elevating as a sub-segment within the Education page?
6. **Case study depth and permissions.** Which clients can be named in case studies versus anonymized? Pillar pages convert dramatically better with named clients, particularly for the Tier 1 verticals.
7. **Team page update scope.** The TODO calls for new photos and rewritten descriptions for all five team members. Roy's bio exists on getanhourback.com and can be lifted. The other four need fresh copy. Who writes them?

---

## On the Everbrave Growth Plan

The Everbrave deck contains several recommendations worth keeping and several worth pushing back on. For clarity going forward:

### Keep

- Hub-and-spoke content model (pillar pages with linked spokes)
- SEO foundations and keyword research
- HubSpot Sales Starter for CRM and lead tracking
- General principle of building conversion before scaling traffic
- Persona methodology, with new personas built for actual ICPs

### Discard or significantly modify

- "Second Byte IT" rename. Declined for reasons documented above.
- Schools and libraries persona focus. RIPEDA's actual ICP is dental, design, and selective education.
- Service-plus-city pages at scale. Calgary-focused for now, no premature expansion.
- Repair pages as public SEO destination. Keep repair as credibility, not public service.

### Verify before relying on

- Keyword overlap and traffic share findings in the deck were generated from an analysis whose source RIPEDA cannot reproduce. Some benchmark competitors are out-of-market (Toronto). Treat the directional point (RIPEDA has less indexed content than competitors) as correct. Treat absolute numbers with appropriate skepticism.

### Add

- AI training cross-promotion. The deck predates the getanhourback.com launch.
- Strategy Advisory as a service line. Not addressed in the deck.
- Dental and design agency personas. Replace school and library personas.
- Measurement baseline and 6- and 12-month KPIs.

Everbrave remains a valued partner. The pushback is healthy client behavior and does not change the relationship.

---

## Closing Notes

This document is a working artifact. Sections will move and decisions will resolve as work progresses. The next concrete deliverables Kevin can expect on request:

- Updated personas for the four target verticals
- Industry pillar page outlines and copy
- Strategy Advisory service page outline and copy
- Newsletter republishing template and edited drafts

---

*RIPEDA Consulting Corporation  |  May 2026  |  v1.0  |  Internal*
