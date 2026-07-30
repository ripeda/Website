#!/usr/bin/env python3
"""
RIPEDA Industry Pillar Page Validator

Runs the quality checklist from skills/ripeda-pillar-page/SKILL.md against a
pillar page file. Reports PASS / WARN / FAIL for each check.

Pillars are different from spokes:
- Longer (1500-2500 words target)
- No TL;DR (the page IS the summary)
- Structural sections expected (audience, body, services, FAQ, CTA)
- FAQ block required with schema.org markup
- Must link to every published spoke whose verticals include the pillar's vertical
- Different schema type (WebPage + FAQPage, not BlogPosting)

Usage:
  python3 skills/ripeda-pillar-page/validate-pillar.py industries/dental-medical.md

Exit code: 0 on all-pass, 1 if any FAIL.
"""

import sys
import re
import argparse
from pathlib import Path

try:
    import yaml
except ImportError:
    print("ERROR: pyyaml required. Install with: pip install pyyaml")
    sys.exit(2)

# Shared exempt lists - keep in sync with the spoke validator
UNIVERSAL_ACRONYMS = {
    "IT", "CFO", "COO", "CEO", "CTO", "CIO", "VPN", "OS", "ROI", "URL", "API",
    "PDF", "USB", "AI", "PC", "GB", "TB", "MB", "KB", "RAM", "SSD", "HDD", "ID",
    "USA", "UK", "EU",
}

BRAND_NAMES = {
    "Apple", "Fortinet", "Ruckus", "Jamf", "Mosyle", "SimpleMDM", "Kandji",
    "Okta", "FileVault", "Microsoft", "Entra", "Google", "Workspace", "AppleCare",
    "FortiGate", "Mac", "iPad", "iPhone", "iCloud", "macOS", "iOS", "iPadOS",
    "Forrester", "IBM", "DriveSavers", "AirDrop", "AirPlay", "TimeMachine",
    "OneDrive", "Excel", "Office", "Outlook", "Slack", "Zoom", "HaloPSA",
    "GitHub", "LinkedIn", "QNAP", "Synology", "Dropbox", "Stripe",
    "PSD", "PDF", "RAW", "TIFF", "PNG", "JPG", "JPEG", "MP4", "MOV", "DNG",
    "NAS", "RMM", "AASP", "ACMT", "ACRT", "ACST", "ACTC", "RIPEDA",
    "Dentrix", "Tracker", "AbelDent", "Curve", "OpenDental",
    # Medical imaging - widely understood in dental/medical context
    "CT", "CBCT", "MRI",
}

BANNED_PHRASES = [
    "leverage", "utilize", "utilise", "seamless", "dive into",
    "robust solution", "robust platform", "unlock potential", "unlock value",
    "in today's fast-paced", "in today's digital", "at the end of the day",
    "best of breed", "synergy", "synergize", "game-changer", "game-changing",
    "cutting-edge", "bleeding-edge", "world-class", "thought leader",
    "thought leadership",
]

BANNED_TROPES = [
    "here's what most people miss",
    "here's the real story",
    "here's the thing,",
    "the truth is,",
    "what most people don't realize",
    "what most people don't realise",
    "it's not just",
]

# Citation red flags - phrases that often introduce a fabricated or unverifiable
# stat. WARN-level. Legitimate uses are possible if a named source follows in the
# same sentence, but the author should manually verify.
CITATION_RED_FLAGS = [
    "studies show",
    "studies have shown",
    "research shows",
    "research indicates",
    "research suggests",
    "according to a study",
    "according to research",
    "a recent study",
    "industry surveys",
    "industry research",
    "experts agree",
    "experts say",
    "the average company",
    "the average firm",
    "the average business",
]

# Required pillar frontmatter
REQUIRED_FRONTMATTER = [
    "layout", "title", "description", "permalink", "date", "vertical",
    "keywords", "hero", "audience", "faq",
]

VALID_VERTICALS = {
    "dental-medical", "design-agencies", "education", "professional-services"
}


# ─── Colour ───
def colour(text, code):
    if not sys.stdout.isatty():
        return text
    return f"\033[{code}m{text}\033[0m"


def green(t): return colour(t, "32")
def red(t): return colour(t, "31")
def yellow(t): return colour(t, "33")
def grey(t): return colour(t, "90")
def bold(t): return colour(t, "1")


class Result:
    def __init__(self):
        self.passes = []
        self.warns = []
        self.fails = []

    def ok(self, msg):
        self.passes.append(msg)
        print(f"  {green('PASS')}  {msg}")

    def warn(self, msg):
        self.warns.append(msg)
        print(f"  {yellow('WARN')}  {msg}")

    def fail(self, msg):
        self.fails.append(msg)
        print(f"  {red('FAIL')}  {msg}")

    def section(self, label):
        print(f"\n  {grey(label)}")

    def summary(self):
        parts = [
            green(f"{len(self.passes)} pass"),
            yellow(f"{len(self.warns)} warn"),
            red(f"{len(self.fails)} fail"),
        ]
        return "  " + "  ".join(parts)

    def all_clear(self):
        return len(self.fails) == 0


def validate_pillar(pillar_path, repo_root=None):
    """Validate a pillar page. Returns Result."""
    r = Result()
    pillar_path = Path(pillar_path).resolve()

    print(f"\n{bold('━' * 64)}")
    print(f"{bold(' ' + str(pillar_path.name))}")
    print(f"{bold('━' * 64)}")

    if not pillar_path.exists():
        r.fail(f"Pillar file not found: {pillar_path}")
        return r

    repo_root = repo_root or pillar_path.parent.parent
    insights_dir = repo_root / "_insights"

    raw = pillar_path.read_text()

    if not raw.startswith("---"):
        r.fail("No YAML frontmatter")
        return r

    try:
        _, fm_text, body = raw.split("---", 2)
    except ValueError:
        r.fail("Malformed frontmatter")
        return r

    try:
        fm = yaml.safe_load(fm_text)
    except yaml.YAMLError as e:
        r.fail(f"YAML parse error: {e}")
        return r

    # ─── Frontmatter ───
    r.section("Frontmatter")
    missing = [f for f in REQUIRED_FRONTMATTER if f not in fm]
    if missing:
        r.fail(f"Missing required fields: {', '.join(missing)}")
    else:
        r.ok("All required fields present")

    if fm.get("layout") != "pillar":
        r.fail(f"layout should be 'pillar', got '{fm.get('layout')}'")
    else:
        r.ok("layout: pillar")

    vertical = fm.get("vertical")
    if vertical in VALID_VERTICALS:
        r.ok(f"Vertical: {vertical}")
    else:
        r.fail(f"vertical must be one of {sorted(VALID_VERTICALS)}, got '{vertical}'")

    title = fm.get("title") or ""
    if 30 <= len(title) <= 75:
        r.ok(f"Title length {len(title)} chars")
    else:
        r.warn(f"Title length {len(title)} chars (target 50-60)")

    desc = fm.get("description") or ""
    if 130 <= len(desc) <= 170:
        r.ok(f"Description length {len(desc)} chars")
    elif desc:
        r.warn(f"Description length {len(desc)} chars (target 150-160)")
    else:
        r.fail("Description is empty")

    keywords = fm.get("keywords") or ""
    if isinstance(keywords, list):
        kw_count = len(keywords)
    else:
        kw_count = len([k for k in keywords.split(",") if k.strip()])
    if 5 <= kw_count <= 10:
        r.ok(f"Keywords count {kw_count}")
    else:
        r.warn(f"Keywords count {kw_count} (target 5-10)")

    permalink = fm.get("permalink") or ""
    expected_permalink = f"/industries/{vertical}/" if vertical else None
    if expected_permalink and permalink != expected_permalink:
        r.warn(f"Permalink is {permalink}, expected {expected_permalink}")
    elif permalink:
        r.ok(f"Permalink: {permalink}")

    # ─── Hero block ───
    r.section("Hero block")
    hero = fm.get("hero") or {}
    for key in ["headline", "dek", "cta_label"]:
        if hero.get(key):
            r.ok(f"hero.{key} present")
        else:
            r.fail(f"hero.{key} missing")
    if hero.get("badges") and len(hero["badges"]) >= 2:
        r.ok(f"hero.badges has {len(hero['badges'])} trust badges")
    else:
        r.warn("hero.badges should have at least 2 trust badges")

    # ─── Audience ───
    r.section("Audience block")
    audience = fm.get("audience") or {}
    if audience.get("who"):
        r.ok("audience.who present")
    else:
        r.fail("audience.who missing (Who this is for)")

    # ─── FAQ ───
    r.section("FAQ block")
    faq = fm.get("faq") or []
    if 5 <= len(faq) <= 8:
        r.ok(f"FAQ has {len(faq)} questions")
    elif len(faq) > 0:
        r.warn(f"FAQ has {len(faq)} questions (target 5-8)")
    else:
        r.fail("No FAQ entries")

    for i, item in enumerate(faq):
        if not item.get("q") or not item.get("a"):
            r.fail(f"FAQ item {i+1} missing q or a")
        elif len(item["a"]) < 50:
            r.warn(f"FAQ answer {i+1} is very short ({len(item['a'])} chars)")

    # ─── Body content ───
    r.section("Body content")
    plain_body = re.sub(r'<[^>]+>', ' ', body)
    plain_body = re.sub(r'\{[^}]+\}', ' ', plain_body)
    words = plain_body.split()
    wc = len(words)
    if 1500 <= wc <= 2500:
        r.ok(f"Body word count {wc} (target 1500-2500)")
    elif wc < 1500:
        r.warn(f"Body word count {wc} (under target 1500 - pillar may read as stub)")
    else:
        r.warn(f"Body word count {wc} (over target 2500 - may read as wall of text)")

    # Section count - H2 headings in body
    h2_count = len(re.findall(r'^##\s+', body, re.MULTILINE))
    if h2_count >= 5:
        r.ok(f"{h2_count} body sections (## headings)")
    else:
        r.warn(f"Only {h2_count} body sections (target 5-7)")

    # Read more / spoke links
    spoke_links = re.findall(r'/resources/insights/[a-z0-9-]+/', body)
    unique_spokes = set(spoke_links)
    if len(unique_spokes) >= 3:
        r.ok(f"Links to {len(unique_spokes)} unique spoke articles")
    elif len(unique_spokes) >= 1:
        r.warn(f"Links to only {len(unique_spokes)} spoke article(s) (target 5+)")
    else:
        r.fail("No links to spoke articles in /resources/insights/")

    # Validate spoke links resolve
    if insights_dir.exists():
        for link in unique_spokes:
            slug = link.rstrip("/").rsplit("/", 1)[-1]
            spoke_file = insights_dir / f"{slug}.md"
            if not spoke_file.exists():
                r.fail(f"Spoke link {link} does not resolve to {spoke_file.name}")

    # Check that available spokes for this vertical are referenced
    if insights_dir.exists() and vertical:
        unreferenced_spokes = []
        for spoke_md in insights_dir.glob("*.md"):
            spoke_raw = spoke_md.read_text()
            try:
                _, sfm, _ = spoke_raw.split("---", 2)
                sfm_parsed = yaml.safe_load(sfm)
            except Exception:
                continue
            # Check if this pillar's vertical is in the spoke's verticals
            # We can't easily check from the spoke alone - need to consult data file
        # Pull from data file
        data_file = repo_root / "_data" / "insights.yml"
        if data_file.exists():
            data = yaml.safe_load(data_file.read_text())
            relevant_published_slugs = []
            for entry in data.get("articles", []):
                if not entry.get("published"):
                    continue
                entry_verticals = entry.get("verticals") or [entry.get("vertical")]
                if vertical in entry_verticals:
                    relevant_published_slugs.append(entry.get("slug"))
            referenced_slugs = {link.rstrip("/").rsplit("/", 1)[-1] for link in unique_spokes}
            unreferenced = [s for s in relevant_published_slugs if s not in referenced_slugs]
            if unreferenced:
                r.warn(f"Published spokes for this vertical not referenced: {', '.join(unreferenced)}")
            else:
                r.ok("All published spokes for this vertical are referenced")

    # Case study check (text indicator)
    case_indicators = ["pillar-case", "case-study", "Case study", "case study"]
    if any(ind.lower() in body.lower() for ind in case_indicators):
        r.ok("Case study tile or mention present")
    else:
        r.warn("No case study tile or mention detected")

    # ─── Voice ───
    r.section("Voice")

    em_dashes = raw.count("—")
    if em_dashes == 0:
        r.ok("No em-dashes")
    else:
        r.fail(f"{em_dashes} em-dash(es)")

    emoji_pattern = re.compile(r'[\U0001F300-\U0001FAFF\U00002600-\U000027BF]')
    emojis = emoji_pattern.findall(raw)
    if not emojis:
        r.ok("No emojis")
    else:
        r.fail(f"{len(emojis)} emoji(s)")

    body_lower = body.lower()
    banned_hits = [p for p in BANNED_PHRASES if p in body_lower]
    if banned_hits:
        r.fail(f"Banned AI-speak: {', '.join(banned_hits)}")
    else:
        r.ok("No banned AI-speak phrases")

    trope_hits = [t for t in BANNED_TROPES if t in body_lower]
    if trope_hits:
        r.fail(f"AI tropes: {', '.join(trope_hits)}")
    else:
        r.ok("No AI tropes")

    citation_hits = [c for c in CITATION_RED_FLAGS if c in body_lower]
    if citation_hits:
        r.warn(f"Citation red flag(s) - verify a named source follows: {', '.join(citation_hits)}")
    else:
        r.ok("No unverified-citation phrases")

    # Acronym expansion
    acronyms = re.findall(r'\b([A-Z]{2,}(?:[A-Z0-9]+)?)\b', body)
    seen = []
    for a in acronyms:
        if a not in seen:
            seen.append(a)
    unexpanded = []
    for a in seen:
        if a in UNIVERSAL_ACRONYMS or a in BRAND_NAMES:
            continue
        if re.search(rf'\([^)]*\b{re.escape(a)}\b[^)]*\)', body):
            continue
        if re.search(rf'\b{re.escape(a)}\b\s*\([^)]{{5,}}\)', body):
            continue
        unexpanded.append(a)
    if unexpanded:
        r.warn(f"Possibly unexpanded acronyms: {', '.join(unexpanded)}")
    else:
        r.ok("All non-universal acronyms appear expanded")

    r.section("Summary")
    print(r.summary())
    return r


def main():
    parser = argparse.ArgumentParser(description="Validate RIPEDA industry pillar pages")
    parser.add_argument("pillar", nargs="?", help="Path to pillar .md file")
    parser.add_argument("--all", action="store_true",
                        help="Validate all pillars in industries/")
    parser.add_argument("--repo-root", default=None)
    args = parser.parse_args()

    if args.all:
        repo_root = Path(args.repo_root) if args.repo_root else Path.cwd()
        ind_dir = repo_root / "industries"
        pillars = sorted(ind_dir.glob("*.md"))
        if not pillars:
            print(red("No pillars found in industries/"))
            sys.exit(2)
        results = [validate_pillar(p, repo_root) for p in pillars]
        total_pass = sum(len(r.passes) for r in results)
        total_warn = sum(len(r.warns) for r in results)
        total_fail = sum(len(r.fails) for r in results)
        print(f"\n{bold('━' * 64)}")
        print(f"{bold(' Overall')}")
        print(f"{bold('━' * 64)}")
        print(f"  {green(f'{total_pass} pass')}  "
              f"{yellow(f'{total_warn} warn')}  "
              f"{red(f'{total_fail} fail')}  "
              f"across {len(results)} pillars")
        sys.exit(0 if total_fail == 0 else 1)
    elif args.pillar:
        repo_root = Path(args.repo_root) if args.repo_root else None
        r = validate_pillar(args.pillar, repo_root)
        sys.exit(0 if r.all_clear() else 1)
    else:
        parser.print_help()
        sys.exit(2)


if __name__ == "__main__":
    main()
