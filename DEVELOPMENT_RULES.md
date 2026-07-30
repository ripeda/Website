# Website Redesign 2025 - Development Rules

*Last Updated: January 7, 2025*

## 🚫 STRICT PROHIBITIONS

### 1. NO EMOJIS
- **Absolutely forbidden** in all website content, code comments, or documentation
- **Alternative:** SF Symbols may be considered depending on final design direction
- **Enforcement:** All content must be reviewed for emoji usage before implementation

### 2. NO HOMEBREW
- **Career-ending violation** - Homebrew installation is strictly prohibited
- **Rationale:** Security and system integrity concerns
- **Alternative:** Use system package managers or official installers only

### 3. NO INSECURE DATA HANDLING
- **No unencrypted data transmission** - HTTPS everywhere
- **No exposed credentials** - All secrets in environment variables or secure vaults
- **No client-side sensitive data** - Server-side processing for all sensitive operations
- **No insecure form handling** - Proper validation, sanitization, and CSRF protection

---

## ✅ SECURITY REQUIREMENTS

### Data Transmission
- **HTTPS mandatory** for all communications
- **Form submissions** must use POST with proper validation
- **API calls** require authentication tokens
- **No sensitive data in URLs** or client-side storage

### Form Security
- **Input validation** on both client and server side
- **CSRF tokens** for all form submissions
- **Rate limiting** to prevent abuse
- **Sanitization** of all user inputs

### Jekyll Security Best Practices
- **No liquid injection** vulnerabilities in templates
- **Secure header configuration** in Jekyll/GitHub Pages
- **Content Security Policy** implementation where applicable
- **Dependency updates** for security patches

---

## 🎨 DESIGN STANDARDS

### Visual Elements
- **No emojis** - use SF Symbols or custom icons if needed
- **Professional aesthetic** - avoid "template" appearances
- **Consistent branding** - maintain RIPEDA visual identity
- **Clean, engineering-focused** design language

### User Experience
- **Mobile-first responsive** design
- **Accessibility compliance** (WCAG guidelines)
- **Fast loading times** - optimize all assets
- **Clear navigation** - maximum 2 clicks to any content

---

## 🛠️ TECHNICAL STANDARDS

### Jekyll Framework
- **Maintain existing structure** - use copied `_layouts`, `_includes`, `_sass`
- **Version consistency** - use `.ruby-version` file specification
- **Gemfile security** - only trusted gems, regular updates
- **Build process** - GitHub Pages compatible

### Development Environment
- **Ruby via rbenv** - no system Ruby modifications
- **Jekyll local testing** required before commits
- **Git workflow** - feature branches for all changes
- **Code review** required for all modifications

### Performance
- **Image optimization** - WebP format where supported
- **CSS/JS minification** - production builds only
- **Lazy loading** for non-critical assets
- **CDN usage** for external resources where appropriate

---

## 📋 QUALITY ASSURANCE

### Content Standards
- **No lorem ipsum** - all content must be real and reviewed
- **Professional tone** - engineering-focused, authoritative
- **SEO optimization** - meta tags, structured data, sitemap
- **Proofreading required** - no typos or grammatical errors

### Testing Requirements
- **Cross-browser compatibility** - Chrome, Firefox, Safari, Edge
- **Mobile device testing** - iOS and Android
- **Performance testing** - Lighthouse scores > 90
- **Accessibility testing** - screen reader compatibility

### Pre-Deployment Checklist
- [ ] No emojis present anywhere
- [ ] All forms use HTTPS and proper security
- [ ] No Homebrew dependencies
- [ ] Mobile responsive verified
- [ ] Performance optimized
- [ ] Security headers configured
- [ ] Content proofread and approved

---

## 🔧 DEVELOPMENT WORKFLOW

### Setup Process
1. **Use existing Ruby/Jekyll** installation (via rbenv)
2. **Copy framework files** from current website (already done)
3. **Install dependencies** via `bundle install`
4. **Start development** with `bundle exec jekyll serve`

### Git Management
- **Feature branches** for all changes
- **Descriptive commit messages**
- **Regular commits** - atomic changes only
- **Pull request reviews** before merging

### File Organization
- **Keep current website** as reference (`/Documents/GitHub/Website/`)
- **New development** in `/Documents/Ripeda Tickle Trunk/Website-Redesign-2025/`
- **Clear separation** between old and new codebases

---

## ⚠️ ENFORCEMENT

### Violations
- **Emoji usage:** Immediate content revision required
- **Homebrew installation:** Disciplinary action (career-ending)
- **Security vulnerabilities:** Code review and remediation required
- **Performance issues:** Optimization required before deployment

### Review Process
- **Code review** for all technical changes
- **Content review** for all copy and messaging
- **Security review** for all form and data handling
- **Final approval** required before production deployment

---

*These rules are non-negotiable and must be followed by all team members working on the website redesign project.*