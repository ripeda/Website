# Website Redesign 2026 / 2027 - TODO List

*Last Updated: June 12, 2026*

## Priority Items (Must / Should Do Before Launch)

### 1. Contact Workflow Redesign (HaloPSA direct, no N8N)
- [ ] **Replace Capsule webhook with HaloPSA lead creation** - form in `_includes/webform.html` currently posts to `https://internal-n8n.ripeda.com/webhook/capsule-leads`
- [ ] **Eliminate N8N entirely** - goal is form -> HaloPSA with no middleware. HaloPSA's REST API can create tickets/opportunities directly, but a static site cannot hold the API credentials, so a thin server-side receiver is still required (e.g. a single Cloudflare Worker / Azure Function). That receiver replaces N8N and does: reCAPTCHA token verification, input validation/sanitization, then HaloPSA API call
- [ ] **Sanitize/clean all form data before it enters HaloPSA** (injection protection - see Misc note)
- [ ] **Verify reCAPTCHA server-side** - client-side token alone proves nothing; the receiver must call Google's siteverify. Note: reCAPTCHA currently fails on localhost because the site key is domain-locked to ripeda.com - retest after launch
- [ ] **Rate-limit the receiver endpoint** so it can't be spammed directly
- [ ] Decommission `internal-n8n.ripeda.com` webhook + DNS record once cut over
- [ ] Test form submission workflow end-to-end
- [ ] Ensure HTTPS compliance for all form handling
- **Status:** Pending
- **Priority:** Critical (largest remaining piece of real work)

### 2. Hosting and Security Headers Decision
- [ ] Decide where the site lives in production: GitHub Pages + Cloudflare in front, Cloudflare Pages, or Netlify
- [ ] GitHub Pages does not support custom response headers (CSP, X-Frame-Options, HSTS, etc.). Choice above determines how headers get set
- [ ] Add SRI (`integrity` + `crossorigin`) attributes to CDN scripts (Bootstrap, three.js) after hosting decision
- **Status:** Pending
- **Priority:** High (affects launch checklist)

### 3. Live Examples / Case Studies in Solutions Section
- [ ] Add 2 more live examples to the solutions section
- [ ] Source real client case studies (waiting on Roy for client permissions)
- [ ] Ensure examples follow voice/tone guidelines
- **Status:** Pending - awaiting Roy
- **Priority:** Medium

### 4. Content QA Pass
- [ ] Typo and grammar review across all new content (hubs, pillars, spokes, homepage, credentials)
- [ ] Verify no emojis anywhere (per DEVELOPMENT_RULES.md)
- [ ] RIPEDA in all caps audit
- [ ] Verify mobile responsive design across new sections
- [ ] Test accessibility compliance
- **Status:** Pending
- **Priority:** Medium

### 5. Performance and Cross-Browser
- [ ] Run Lighthouse performance audit (homepage, hub, pillar, spoke)
- [ ] Optimize image loading (WebP format where supported)
- [ ] Review and optimize Globe performance (if still needed)
- [ ] Test cross-browser compatibility (Safari, Chrome, Firefox, iOS Safari)
- **Status:** Pending
- **Priority:** Medium

### 6. Repoint /device-as-a-service/ redirect
- [ ] The redirect from `/device-as-a-service/` is currently in `services/managed-apple-it.md` front matter. Repoint to the new DaaS hub at `/services/device-as-a-service/`
- **Status:** Pending
- **Priority:** Medium (cleanup after DaaS hub launch)

### 7. Drive Savers Logo Link
- [ ] Make Drive Savers logo in partner strip clickable
- [ ] Link should open in new tab with appropriate external link indicators
- **Status:** Pending
- **Priority:** Low

### 8. AI Training in SEO and FAQ
- [ ] Adjust SEO to include "AI Training"
- [ ] Adjust FAQs to include AI Training
- **Status:** Pending
- **Priority:** Low

### 9. Privacy-First Analytics (Future)
- [ ] Add Plausible (or equivalent) for Insights engagement tracking
- [ ] Add outbound-click event tracking on contact CTAs
- [ ] Update privacy policy
- **Status:** Pending - not urgent (~$108/yr, half-day setup)
- **Priority:** Low

### 10. GitHub Branch and Issue Setup
- [ ] Create branch structure for the redesign push
- [ ] Set up GitHub Issues to track post-launch work
- **Status:** Pending
- **Priority:** Low (helps with post-launch tracking)

---

## Completed Since March 30, 2026

### Content Architecture
- [x] Built 4 industry pillars: Dental and Medical, Design Agencies, Education, Professional Services
- [x] Built 5 service hubs: Strategy Advisory, Managed Apple IT, Network Infrastructure, Apple Authorized Repair, Device as a Service
- [x] Wrote 31 spoke articles across the pillars with bidirectional hub-spoke linking
- [x] Built Insights blog architecture: collection, layout, share row, PDF print, full SEO/schema
- [x] Built ripeda-insight-article, ripeda-pillar-page, and ripeda-service-hub Claude skills with validators
- [x] Built Credentials page at `/about/credentials/` (replaced stub with full content)

### Homepage
- [x] Removed entire lifecycle section (5 stages with "Video coming soon" placeholders)
- [x] Moved Repair video to Apple Authorized Repair hub, Managed Macs video to Managed Apple IT hub
- [x] Added "Who We Serve" section linking to the four industry pillars
- [x] Added Insights teaser section pulling 3 most recent published articles
- [x] Rerouted hero CTA to "Talk to us about your environment" / `#contact`
- [x] Unified contact form language with Strategy Advisory hub

### Team Section
- [x] Updated team photos with new professional shots
- [x] Updated team member descriptions

### Infrastructure and Site-Wide
- [x] Added geo-SEO line to sub-footer (`_data/seo.yml` + `_includes/sub-footer.html`) - "Serving Alberta businesses in Calgary, Edmonton, Red Deer, Lethbridge..."
- [x] AI Training URL points to https://getanhourback.com in `_data/menus.yml` (main nav and footer)
- [x] DaaS in services nav at `/services/device-as-a-service/`
- [x] Built OG image generator (Puppeteer + base64-embedded logo) for per-article social cards
- [x] Made year-since-2012 references dynamic via Liquid expression
- [x] Updated ACMT to ACRT credential references site-wide

### Security and Cleanup
- [x] Removed business-resources section (store-code login, Supabase dashboard, log-access.js) - June 10
- [x] Fixed robots.txt rendering as HTML and advertising hidden paths - June 10
- [x] Stopped node_modules and internal docs shipping in `_site` - June 10

### Items Made Moot
- ~~Keynote Videos for #Lifecycle Section~~ - Section removed entirely; videos moved to service hubs

---

## Notes

- **Globe Issues:** Already resolved (as of March 30, 2026)
- **External Link Icons:** Implemented with Unicode ↗ symbol
- **Jekyll Server:** Runs on localhost:4000 during development

---

## Development Rules Reminders

- **NO EMOJIS** in content (SF Symbols only if needed)
- **NO HOMEBREW** installations
- **HTTPS EVERYWHERE** for data transmission
- **Professional tone** - engineering-focused, authoritative
- All changes require testing before deployment

---

*File Location: `/Users/kevinweir/Documents/Ripeda Tickle Trunk/Website-Redesign-2026-2027/TODO.md`*