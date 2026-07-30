#!/usr/bin/env python3
"""
RIPEDA Insight Article Validator

Runs the quality checklist from SKILL.md against an article file. Reports
PASS / WARN / FAIL for each check.

Usage:
  python3 skills/ripeda-insight-article/validate-article.py _insights/some-article.md
  python3 skills/ripeda-insight-article/validate-article.py --all

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


# Universal acronyms - exempt from expansion rule
UNIVERSAL_ACRONYMS = {
    "IT", "CFO", "COO", "CEO", "CTO", "CIO", "VPN", "OS", "ROI", "URL", "API",
    "PDF", "USB", "AI", "PC", "GB", "TB", "MB", "KB", "RAM", "SSD", "HDD", "ID",
    "USA", "UK", "EU",
}

# Brand and product names - exempt from expansion rule
BRAND_NAMES = {
    "Apple", "Fortinet", "Ruckus", "Jamf", "Mosyle", "SimpleMDM", "Kandji",
    "Okta", "FileVault", "Microsoft", "Entra", "Google", "Workspace", "AppleCare",
    "FortiGate", "Mac", "iPad", "iPhone", "iCloud", "macOS", "iOS", "iPadOS",
    "Forrester", "IBM", "DriveSavers", "AirDrop", "AirPlay", "TimeMachine",
    "OneDrive", "Excel", "Office", "Outlook", "Slack", "Zoom", "HaloPSA",
    "GitHub", "LinkedIn", "QNAP", "Synology", "Dropbox", "Stripe",
    # File formats and common technical terms in the design/IT domain
    "PSD", "PDF", "RAW", "TIFF", "PNG", "JPG", "JPEG", "MP4", "MOV", "DNG",
    # Acronyms common enough in our target verticals (per skill discretion)
    "NAS", "RMM", "RIPEDA", "AASP", "ACMT", "ACRT", "ACST", "ACTC",
    # Medical imaging - widely understood in dental/medical context
    "CT", "CBCT", "MRI",
}

# Controlled tag vocabulary - must match SKILL.md
TOPIC_TAGS = {
    "AppleCare", "Apple Business Manager", "Apple Intelligence", "Apple Silicon",
    "Backup", "CBCT", "Collaboration", "Compliance", "Data Recovery", "Deployment",
    "Encryption", "File Sharing", "Fortinet", "Identity", "iCloud", "MDM",
    "Networks", "Operations", "Password Management", "Performance", "PHIPA",
    "PIPEDA", "Procurement", "Remote Support", "Repair", "Ruckus", "Security",
    "SSO", "Storage", "Wi-Fi", "Apple Business",
}
ANGLE_TAGS = {"Architecture", "Infrastructure", "Lifecycle", "Strategy"}
VALID_TAGS = TOPIC_TAGS | ANGLE_TAGS

# Banned AI-speak phrases (lowercase, substring match)
BANNED_PHRASES = [
    "leverage", "utilize", "utilise", "seamless", "dive into",
    "robust solution", "robust platform", "unlock potential", "unlock value",
    "in today's fast-paced", "in today's digital", "at the end of the day",
    "best of breed", "synergy", "synergize", "game-changer", "game-changing",
    "cutting-edge", "bleeding-edge", "world-class", "thought leader",
    "thought leadership",
]

# AI rhetorical tropes
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

# Required frontmatter fields
REQUIRED_FRONTMATTER = [
    "layout", "title", "dek", "description", "date", "tags", "keywords",
    "reading_time", "author", "tldr", "related",
]


# ─── Colour output ───
def colour(text, code):
    if not sys.stdout.isatty():
        return text
    return f"\033[{code}m{text}\033[0m"


def green(text): return colour(text, "32")
def red(text): return colour(text, "31")
def yellow(text): return colour(text, "33")
def grey(text): return colour(text, "90")
def bold(text): return colour(text, "1")


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


def validate_article(article_path, repo_root=None):
    """Validate one article. Returns Result."""
    r = Result()
    article_path = Path(article_path).resolve()

    print(f"\n{bold('━' * 64)}")
    print(f"{bold(' ' + str(article_path.name))}")
    print(f"{bold('━' * 64)}")

    if not article_path.exists():
        r.fail(f"Article file not found: {article_path}")
        return r

    repo_root = repo_root or article_path.parent.parent
    insights_data = repo_root / "_data" / "insights.yml"

    raw = article_path.read_text()

    if not raw.startswith("---"):
        r.fail("No YAML frontmatter (file must start with ---)")
        return r

    try:
        _, fm_text, body = raw.split("---", 2)
    except ValueError:
        r.fail("Malformed frontmatter (missing closing ---)")
        return r

    try:
        fm = yaml.safe_load(fm_text)
    except yaml.YAMLError as e:
        r.fail(f"YAML parse error: {e}")
        return r

    # ─── Frontmatter completeness ───
    r.section("Frontmatter")
    missing = [f for f in REQUIRED_FRONTMATTER if f not in fm]
    if missing:
        r.fail(f"Missing required fields: {', '.join(missing)}")
    else:
        r.ok("All required fields present")

    if fm.get("layout") != "insight":
        r.fail(f"layout should be 'insight', got '{fm.get('layout')}'")

    title = fm.get("title") or ""
    title_len = len(title)
    if 30 <= title_len <= 75:
        r.ok(f"Title length {title_len} chars")
    else:
        r.warn(f"Title length {title_len} chars (target 50-60 with site title suffix)")

    if title.endswith("."):
        r.fail("Title ends with a period (should not)")

    desc = fm.get("description") or ""
    desc_len = len(desc)
    if 130 <= desc_len <= 170:
        r.ok(f"Description length {desc_len} chars")
    elif desc_len > 0:
        r.warn(f"Description length {desc_len} chars (target 150-160)")
    else:
        r.fail("Description is empty")

    # Tags
    tags = fm.get("tags") or []
    if not isinstance(tags, list):
        r.fail("tags must be a list")
    else:
        if not (2 <= len(tags) <= 4):
            r.warn(f"Tag count is {len(tags)} (target 2-4)")
        invalid = [t for t in tags if t not in VALID_TAGS]
        if invalid:
            r.fail(f"Tags not in controlled vocabulary: {', '.join(invalid)}")
        else:
            r.ok(f"Tags all in vocabulary ({len(tags)})")

    # Keywords
    keywords = fm.get("keywords") or ""
    if isinstance(keywords, list):
        kw_count = len(keywords)
    else:
        kw_count = len([k for k in keywords.split(",") if k.strip()])
    if 5 <= kw_count <= 10:
        r.ok(f"Keywords count {kw_count}")
    else:
        r.warn(f"Keywords count {kw_count} (target 5-10)")

    # TL;DR
    tldr = fm.get("tldr") or []
    if not isinstance(tldr, list):
        r.fail("tldr must be a list")
    elif 4 <= len(tldr) <= 6:
        r.ok(f"TL;DR has {len(tldr)} bullets")
    else:
        r.fail(f"TL;DR has {len(tldr)} bullets (target 4-6)")

    # Related links
    related = fm.get("related") or []
    if not isinstance(related, list):
        r.fail("related must be a list")
    else:
        if len(related) < 2:
            r.fail(f"Only {len(related)} related links (need 2-3)")
        elif len(related) > 3:
            r.warn(f"{len(related)} related links (target 2-3)")
        else:
            r.ok(f"{len(related)} related links")

        service_links = [x for x in related if "/services/" in x.get("url", "")]
        industry_links = [x for x in related if "/industries/" in x.get("url", "")]
        if service_links:
            r.ok("Has /services/ link")
        else:
            r.fail("No /services/ link in related-reading")
        if industry_links:
            r.ok("Has /industries/ link")
        else:
            r.fail("No /industries/ link in related-reading")

        for rel in related:
            if not rel.get("context"):
                r.fail(f"Related link missing 'context': {rel.get('url', '?')}")

    # ─── Content (body) ───
    r.section("Content")
    plain_body = re.sub(r'<[^>]+>', ' ', body)
    plain_body = re.sub(r'\{[^}]+\}', ' ', plain_body)
    words = plain_body.split()
    wc = len(words)
    if 500 <= wc <= 900:
        r.ok(f"Body word count {wc} (target 500-900)")
    elif wc < 500:
        r.warn(f"Body word count {wc} (under target 500)")
    else:
        r.warn(f"Body word count {wc} (over target 900 - might be pillar candidate)")

    # ─── Voice ───
    r.section("Voice")

    em_dashes = raw.count("—")
    if em_dashes == 0:
        r.ok("No em-dashes")
    else:
        r.fail(f"{em_dashes} em-dash(es) found")

    emoji_pattern = re.compile(r'[\U0001F300-\U0001FAFF\U00002600-\U000027BF]')
    emojis = emoji_pattern.findall(raw)
    if not emojis:
        r.ok("No emojis")
    else:
        r.fail(f"{len(emojis)} emoji(s) found")

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
    seen_acronyms = []
    for a in acronyms:
        if a not in seen_acronyms:
            seen_acronyms.append(a)
    unexpanded = []
    for a in seen_acronyms:
        if a in UNIVERSAL_ACRONYMS or a in BRAND_NAMES:
            continue
        # Pattern 1: "Expansion form (ACRONYM)" - the standard
        if re.search(rf'\([^)]*\b{re.escape(a)}\b[^)]*\)', body):
            continue
        # Pattern 2: "ACRONYM (expansion form)" - reverse but also valid
        if re.search(rf'\b{re.escape(a)}\b\s*\([^)]{{5,}}\)', body):
            continue
        unexpanded.append(a)
    if unexpanded:
        r.warn(f"Possibly unexpanded acronyms: {', '.join(unexpanded)}")
    else:
        r.ok("All non-universal acronyms appear expanded")

    # ─── Data file registration ───
    r.section("Data file registration")
    slug_from_file = article_path.stem
    if insights_data.exists():
        try:
            data = yaml.safe_load(insights_data.read_text())
            entry = next(
                (a for a in data.get("articles", []) if a.get("slug") == slug_from_file),
                None,
            )
            if not entry:
                r.fail(f"No data file entry with slug '{slug_from_file}'")
            else:
                r.ok(f"Data file entry exists ({entry.get('vertical') or entry.get('verticals')})")
                if entry.get("published"):
                    r.ok("published: true")
                else:
                    r.fail("Entry has published: false or missing")
                if entry.get("title") != title:
                    r.fail(
                        f"Title mismatch: data has '{entry.get('title')}', "
                        f"article has '{title}'"
                    )
                else:
                    r.ok("Title matches between article and data file")
                # Check verticals coverage
                verts = entry.get("verticals") or [entry.get("vertical")]
                if verts and any(verts):
                    r.ok(f"Vertical(s) declared: {verts}")
                else:
                    r.fail("No vertical(s) declared")
        except Exception as e:
            r.fail(f"Could not read data file: {e}")
    else:
        r.warn(f"Data file not found at {insights_data}")

    r.section("Summary")
    print(r.summary())
    return r


def main():
    parser = argparse.ArgumentParser(
        description="Validate RIPEDA Insight articles against SKILL.md spec",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument(
        "article", nargs="?",
        help="Path to article .md file"
    )
    parser.add_argument(
        "--all", action="store_true",
        help="Validate all articles in _insights/",
    )
    parser.add_argument(
        "--repo-root", default=None,
        help="Repo root (defaults to article's parent's parent, or cwd for --all)",
    )
    args = parser.parse_args()

    if args.all:
        repo_root = Path(args.repo_root) if args.repo_root else Path.cwd()
        insights_dir = repo_root / "_insights"
        if not insights_dir.exists():
            print(red(f"_insights/ not found in {repo_root}"))
            sys.exit(2)
        articles = sorted(insights_dir.glob("*.md"))
        if not articles:
            print(red("No articles found in _insights/"))
            sys.exit(2)
        results = [validate_article(a, repo_root) for a in articles]
        total_pass = sum(len(r.passes) for r in results)
        total_warn = sum(len(r.warns) for r in results)
        total_fail = sum(len(r.fails) for r in results)
        print(f"\n{bold('━' * 64)}")
        print(f"{bold(' Overall')}")
        print(f"{bold('━' * 64)}")
        print(f"  {green(f'{total_pass} pass')}  "
              f"{yellow(f'{total_warn} warn')}  "
              f"{red(f'{total_fail} fail')}  "
              f"across {len(results)} articles")
        sys.exit(0 if total_fail == 0 else 1)
    elif args.article:
        repo_root = Path(args.repo_root) if args.repo_root else None
        r = validate_article(args.article, repo_root)
        sys.exit(0 if r.all_clear() else 1)
    else:
        parser.print_help()
        sys.exit(2)


if __name__ == "__main__":
    main()
