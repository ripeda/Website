#!/usr/bin/env python3
"""
RIPEDA Hook Article Validator

Runs the quality checklist from skills/ripeda-hook-article/SKILL.md against a
hook article. Reports PASS / WARN / FAIL for each check.

Hooks are the short-form (350-700 word, 2-3 min) companions to spoke articles.
This validator is deliberately stricter than validate-article.py about
structure (item counts, heading style, the closing section) and looser about
length and related-link composition.

Usage:
  python3 skills/ripeda-hook-article/validate-hook.py hook-drafts/some-hook.md
  python3 skills/ripeda-hook-article/validate-hook.py --all
  python3 skills/ripeda-hook-article/validate-hook.py --all --batch

  --batch adds cross-article checks (duplicate openers, repeated questions).

Exit code: 0 on all-pass, 1 if any FAIL.
"""

import sys
import re
import argparse
from pathlib import Path
from collections import Counter

try:
    import yaml
except ImportError:
    print("ERROR: pyyaml required. Install with: pip install pyyaml")
    sys.exit(2)


# Inherited from validate-article.py - keep in sync
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

# Hook-specific additions - listicle filler and false breeziness
HOOK_BANNED = [
    "pro tip:",
    "bonus tip:",
    "and that's it!",
    "simple as that",
    "there you have it",
]

CITATION_RED_FLAGS = [
    "studies show", "studies have shown", "research shows",
    "research indicates", "research suggests", "according to a study",
    "according to research", "a recent study", "industry surveys",
    "industry research", "experts agree", "experts say",
    "the average company", "the average firm", "the average business",
]

REQUIRED_FRONTMATTER = [
    "layout", "title", "dek", "description", "date", "tags", "keywords",
    "reading_time", "author", "tldr", "related",
]

# Number words that can carry the count in a title
NUMBER_WORDS = {
    "one": 1, "two": 2, "three": 3, "four": 4, "five": 5, "six": 6,
    "seven": 7, "eight": 8, "nine": 9, "ten": 10, "eleven": 11, "twelve": 12,
}

CLOSING_HEADING = "if you only do one thing"

VALID_VERTICALS = {
    "dental-medical", "design-agencies", "education", "professional-services",
    "mdm-security", "infrastructure", "ai-productivity",
}
# NOTE: "marketing-agencies" was merged into "design-agencies" (label
# "Design & Marketing") on 2026-08-21 - it never carried an article.
# NOTE: "quick-reads" was removed on 2026-08-21. Length is a format, not an
# industry, and a hook tagged quick-reads disappeared from every industry tab.
# Hooks now inherit their parent spoke's verticals; format: hook carries length.


# ─── Colour output ───
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
    def __init__(self, name=""):
        self.name = name
        self.passes, self.warns, self.fails = [], [], []
        self.opener = ""
        self.title = ""

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
        return "  " + "  ".join([
            green(f"{len(self.passes)} pass"),
            yellow(f"{len(self.warns)} warn"),
            red(f"{len(self.fails)} fail"),
        ])

    def all_clear(self):
        return len(self.fails) == 0


# Units that follow a number which is NOT an item count.
# "in 60 seconds", "when an agency hits 15 people", "one hour of downtime".
NON_COUNT_UNITS = (
    r'seconds?|minutes?|hours?|days?|weeks?|months?|years?|'
    r'people|staff|employees?|users?|seats?|devices?|macs?|ipads?|'
    r'gb|tb|mb|am|pm|percent|dollars?|k\b'
)


def title_number(title):
    """
    Extract the item count promised by the title, if any. Returns int or None.

    Only a leading number counts. "5 things to do..." promises five items.
    "Apple Business Manager vs Apple School Manager in 60 seconds" and
    "What breaks first when an agency hits 15 people" promise nothing, and a
    naive search would read 60 and 15 as item counts.
    """
    # Strip any number that is immediately followed by a non-count unit
    cleaned = re.sub(
        rf'\b(\d{{1,3}}|{"|".join(NUMBER_WORDS)})\s+(?:{NON_COUNT_UNITS})\b',
        ' ', title, flags=re.IGNORECASE)
    # Strip clock times ("8:45") and ranges ("13-14B")
    cleaned = re.sub(r'\b\d{1,2}:\d{2}\b|\b\d+\s*-\s*\d+\w*\b', ' ', cleaned)

    # The count, when present, sits in the first three words of the title
    head = " ".join(cleaned.split()[:3])
    m = re.search(r'\b(\d{1,2})\b', head)
    if m:
        return int(m.group(1))
    for word, val in NUMBER_WORDS.items():
        if re.search(rf'\b{word}\b', head, re.IGNORECASE):
            return val
    return None


def validate_hook(path, repo_root=None, quiet=False):
    r = Result(Path(path).name)
    path = Path(path).resolve()

    if not quiet:
        print(f"\n{bold('━' * 64)}")
        print(f"{bold(' ' + path.name)}")
        print(f"{bold('━' * 64)}")

    if not path.exists():
        r.fail(f"File not found: {path}")
        return r

    # Repo root: handle both _insights/ and _insights/_hook-drafts/
    if repo_root is None:
        repo_root = path.parent.parent
        if path.parent.name == "hook-drafts":
            repo_root = path.parent.parent
    insights_data = Path(repo_root) / "_data" / "insights.yml"

    raw = path.read_text()
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

    is_draft = fm.get("published") is False
    r.title = fm.get("title") or ""

    # ─── Frontmatter ───
    r.section("Frontmatter")
    missing = [f for f in REQUIRED_FRONTMATTER if f not in fm]
    if missing:
        r.fail(f"Missing required fields: {', '.join(missing)}")
    else:
        r.ok("All required fields present")

    if fm.get("layout") != "insight":
        r.fail(f"layout should be 'insight', got '{fm.get('layout')}'")

    title = r.title
    if 40 <= len(title) <= 70:
        r.ok(f"Title length {len(title)} chars")
    else:
        r.warn(f"Title length {len(title)} chars (hook target 40-70)")

    if title.endswith("."):
        r.fail("Title ends with a period (should not)")

    rt = fm.get("reading_time")
    if rt in (2, 3):
        r.ok(f"reading_time {rt}")
    else:
        r.fail(f"reading_time is {rt} (hooks must be 2 or 3; 4+ means this is a spoke)")

    desc = fm.get("description") or ""
    if 130 <= len(desc) <= 170:
        r.ok(f"Description length {len(desc)} chars")
    elif desc:
        r.warn(f"Description length {len(desc)} chars (target 150-160)")
    else:
        r.fail("Description is empty")

    tags = fm.get("tags") or []
    if not isinstance(tags, list):
        r.fail("tags must be a list")
    elif 2 <= len(tags) <= 3:
        r.ok(f"Tag count {len(tags)}")
    else:
        r.warn(f"Tag count {len(tags)} (hook target 2-3)")

    kw = fm.get("keywords") or ""
    kw_list = kw if isinstance(kw, list) else [k.strip() for k in kw.split(",") if k.strip()]
    if 5 <= len(kw_list) <= 8:
        r.ok(f"Keywords count {len(kw_list)}")
    else:
        r.warn(f"Keywords count {len(kw_list)} (hook target 5-8)")

    # Hooks need genuine long-tail: at least 3 phrases of 4+ words
    longtail = [k for k in kw_list if len(k.split()) >= 4]
    if len(longtail) >= 3:
        r.ok(f"{len(longtail)} long-tail keyword phrases (4+ words)")
    else:
        r.warn(f"Only {len(longtail)} long-tail phrases (hooks need 3+ full-question phrases)")

    tldr = fm.get("tldr") or []
    if not isinstance(tldr, list):
        r.fail("tldr must be a list")
    elif 3 <= len(tldr) <= 4:
        r.ok(f"TL;DR has {len(tldr)} bullets")
    else:
        r.fail(f"TL;DR has {len(tldr)} bullets (hook target 3-4)")

    # ─── Structure ───
    r.section("Structure")

    headings = re.findall(r'^##\s+(.+?)\s*$', body, re.MULTILINE)
    closing = [h for h in headings if h.strip().lower().rstrip(".").startswith(CLOSING_HEADING)]
    items = [h for h in headings if h not in closing]

    if closing:
        r.ok("'If you only do one thing' section present")
        if headings and headings[-1] not in closing:
            r.fail("'If you only do one thing' is present but not the last section")
    else:
        r.fail("Missing required 'If you only do one thing' closing section")

    promised = title_number(title)
    if promised is None:
        r.warn("No number in title (fine for comparison/cost patterns, check intentional)")
    elif promised == len(items):
        r.ok(f"Title promises {promised} items, body has {len(items)}")
    else:
        r.fail(f"Title promises {promised} items but body has {len(items)} '##' sections")

    if items and all(re.match(r'^\d+\.', h.strip()) for h in items):
        r.ok("Item headings are numbered")
    elif items:
        unnumbered = [h for h in items if not re.match(r'^\d+\.', h.strip())]
        r.warn(f"{len(unnumbered)} item heading(s) not numbered (fine for non-list patterns)")

    # Per-item sentence ceiling
    sections = re.split(r'^##\s+.+?$', body, flags=re.MULTILINE)[1:]
    overlong = []
    for h, sec in zip(headings, sections):
        if h in closing:
            continue
        # Markdown table rows are structure, not prose. Strip them before
        # counting, or any sizing table reads as a dozen run-on sentences.
        plain = "\n".join(ln for ln in sec.splitlines()
                          if not ln.strip().startswith("|"))
        plain = re.sub(r'<[^>]+>', ' ', plain)
        sentences = [s for s in re.split(r'(?<=[.!?])\s+', plain.strip()) if len(s.split()) > 2]
        if len(sentences) > 4:
            overlong.append(f"{h.strip()[:40]} ({len(sentences)})")
    if overlong:
        r.fail(f"Item(s) over the 4-sentence ceiling: {'; '.join(overlong)}")
    elif items:
        r.ok("All items within the 4-sentence ceiling")

    # Blocks that belong to spokes
    if 'class="insight-stat"' in body:
        r.fail("insight-stat block present (spoke-only element)")
    compare_count = body.count('class="insight-compare"')
    if compare_count > 1:
        r.fail(f"{compare_count} insight-compare blocks (max 1, comparison pattern only)")
    elif compare_count == 1:
        r.warn("insight-compare block present (only valid for the fast-comparison pattern)")
    else:
        r.ok("No spoke-only structural blocks")

    # ─── Content ───
    r.section("Content")
    plain_body = re.sub(r'<[^>]+>', ' ', body)
    plain_body = re.sub(r'\{[^}]+\}', ' ', plain_body)
    wc = len(plain_body.split())
    if 350 <= wc <= 700:
        r.ok(f"Body word count {wc} (target 350-700)")
    elif wc < 350:
        r.warn(f"Body word count {wc} (under target 350)")
    else:
        r.fail(f"Body word count {wc} (over 700 - this is drifting into spoke territory)")

    # Capture opener for batch-level comparison
    first_para = next((p.strip() for p in plain_body.strip().split("\n\n") if p.strip()), "")
    r.opener = " ".join(first_para.split()[:6]).lower()

    # ─── Voice ───
    r.section("Voice")

    em = raw.count("—")
    if em == 0:
        r.ok("No em-dashes")
    else:
        r.fail(f"{em} em-dash(es) found")

    emoji_pattern = re.compile(r'[\U0001F300-\U0001FAFF\U00002600-\U000027BF]')
    emojis = emoji_pattern.findall(raw)
    if emojis:
        r.fail(f"{len(emojis)} emoji(s) found")
    else:
        r.ok("No emojis")

    bl = body.lower()
    hits = [p for p in BANNED_PHRASES if p in bl]
    if hits:
        r.fail(f"Banned AI-speak: {', '.join(hits)}")
    else:
        r.ok("No banned AI-speak phrases")

    tropes = [t for t in BANNED_TROPES if t in bl]
    if tropes:
        r.fail(f"AI tropes: {', '.join(tropes)}")
    else:
        r.ok("No AI tropes")

    hook_hits = [p for p in HOOK_BANNED if p in bl]
    if hook_hits:
        r.fail(f"Listicle filler: {', '.join(hook_hits)}")
    else:
        r.ok("No listicle filler")

    cites = [c for c in CITATION_RED_FLAGS if c in bl]
    if cites:
        r.warn(f"Citation red flag(s) - verify a named source follows: {', '.join(cites)}")
    else:
        r.ok("No unverified-citation phrases")

    # ─── Linking ───
    r.section("Linking")
    related = fm.get("related") or []
    if not isinstance(related, list) or not related:
        r.fail("related must be a non-empty list")
    else:
        if not (2 <= len(related) <= 3):
            r.warn(f"{len(related)} related links (target 2-3)")

        first_url = related[0].get("url", "")
        if first_url.startswith("/resources/insights/"):
            r.ok("Leads with a parent spoke link")
            slug = first_url.rstrip("/").split("/")[-1]
            parent = Path(repo_root) / "_insights" / f"{slug}.md"
            if parent.exists():
                r.ok(f"Parent spoke exists: {slug}")
            else:
                r.fail(f"Parent spoke not found in _insights/: {slug}")
        elif first_url.startswith("/services/"):
            r.warn("Leads with a service link (acceptable only for standalone hooks)")
        else:
            r.fail(f"First related link is neither a spoke nor a service page: {first_url}")

        if any("/services/" in x.get("url", "") for x in related):
            r.ok("Has /services/ link")
        else:
            r.fail("No /services/ link in related-reading")

        for rel in related:
            if not rel.get("context"):
                r.fail(f"Related link missing 'context': {rel.get('url', '?')}")

    # ─── Registration ───
    r.section("Registration")
    slug = path.stem
    if is_draft:
        r.ok("Draft mode (published: false) - data file registration not expected")
        if path.parent.name != "hook-drafts":
            r.warn("Draft is not in hook-drafts/ (a draft inside _insights/ will build and deploy)")
    elif insights_data.exists():
        try:
            data = yaml.safe_load(insights_data.read_text())
            entry = next((a for a in data.get("articles", []) if a.get("slug") == slug), None)
            if not entry:
                r.fail(f"No data file entry with slug '{slug}'")
            else:
                r.ok("Data file entry exists")
                if entry.get("format") == "hook":
                    r.ok("format: hook present")
                else:
                    r.fail("Data file entry missing 'format: hook'")
                if entry.get("title") != title:
                    r.fail(f"Title mismatch: data '{entry.get('title')}' vs article '{title}'")
                else:
                    r.ok("Title matches data file")
                if entry.get("read_time") != rt:
                    r.warn(f"read_time mismatch: data {entry.get('read_time')} vs article {rt}")
                verts = entry.get("verticals") or [entry.get("vertical")]
                verts = [v for v in verts if v]
                bad = [v for v in verts if v not in VALID_VERTICALS]
                if bad:
                    r.fail(f"Unknown vertical(s): {', '.join(bad)}")
                elif verts:
                    r.ok(f"Vertical(s): {', '.join(verts)}")
                else:
                    r.fail("No vertical(s) declared")
            # quick-reads was retired on 2026-08-21; flag any reappearance
            if entry and "quick-reads" in (entry.get("verticals") or [entry.get("vertical")]):
                r.fail("Uses the retired 'quick-reads' vertical - inherit the parent spoke's verticals instead")
        except Exception as e:
            r.fail(f"Could not read data file: {e}")
    else:
        r.warn(f"Data file not found at {insights_data}")

    r.section("Summary")
    print(r.summary())
    return r


def batch_checks(results):
    print(f"\n{bold('━' * 64)}")
    print(f"{bold(' Batch-level checks')}")
    print(f"{bold('━' * 64)}")

    openers = Counter(r.opener for r in results if r.opener)
    dupes = [o for o, n in openers.items() if n > 1]
    if dupes:
        print(f"  {yellow('WARN')}  Repeated opening phrasing across batch: "
              f"{'; '.join(repr(d) for d in dupes)}")
    else:
        print(f"  {green('PASS')}  Opening sentence shapes vary across the batch")

    # Near-duplicate titles: 3+ shared significant words
    stop = {"the", "a", "an", "to", "do", "with", "for", "of", "and", "in",
            "on", "you", "your", "after", "before", "when", "what", "things"}
    sig = []
    for r in results:
        sig.append((r.name, {w.lower().strip(".,") for w in r.title.split()
                            if w.lower() not in stop and len(w) > 2}))
    overlaps = []
    for i in range(len(sig)):
        for j in range(i + 1, len(sig)):
            shared = sig[i][1] & sig[j][1]
            if len(shared) >= 3:
                overlaps.append(f"{sig[i][0]} / {sig[j][0]} ({', '.join(sorted(shared))})")
    if overlaps:
        print(f"  {yellow('WARN')}  Possible overlapping topics: {'; '.join(overlaps)}")
    else:
        print(f"  {green('PASS')}  No two hooks appear to answer the same question")


def main():
    p = argparse.ArgumentParser(
        description="Validate RIPEDA hook articles against the hook SKILL.md spec")
    p.add_argument("article", nargs="?", help="Path to a hook .md file")
    p.add_argument("--all", action="store_true",
                   help="Validate every hook in hook-drafts/")
    p.add_argument("--batch", action="store_true",
                   help="Add cross-article batch checks (implies --all)")
    p.add_argument("--repo-root", default=None)
    args = p.parse_args()

    if args.all or args.batch:
        root = Path(args.repo_root) if args.repo_root else Path.cwd()
        # Unpublished drafts still sit in hook-drafts/. Published hooks have been
        # moved into _insights/ alongside the spokes, where the only thing marking
        # them as hooks is `format: hook` in _data/insights.yml. Scan both, or
        # --all silently stops covering every hook the moment one is published.
        targets = sorted((root / "hook-drafts").glob("*.md"))
        data_file = root / "_data" / "insights.yml"
        if data_file.exists():
            try:
                entries = yaml.safe_load(data_file.read_text(encoding="utf-8")) or {}
                for e in (entries.get("articles") or []):
                    if e.get("format") == "hook" and e.get("slug"):
                        pub = root / "_insights" / f"{e['slug']}.md"
                        if pub.exists():
                            targets.append(pub)
            except Exception:
                pass
        targets = sorted(set(targets))
        if not targets:
            print(red(f"No hooks found in {root}/hook-drafts/ or registered in _data/insights.yml"))
            sys.exit(2)
        results = [validate_hook(t, root) for t in targets]
        if args.batch:
            batch_checks(results)
        tp = sum(len(r.passes) for r in results)
        tw = sum(len(r.warns) for r in results)
        tf = sum(len(r.fails) for r in results)
        print(f"\n{bold('━' * 64)}")
        print(f"{bold(' Overall')}")
        print(f"{bold('━' * 64)}")
        print(f"  {green(f'{tp} pass')}  {yellow(f'{tw} warn')}  "
              f"{red(f'{tf} fail')}  across {len(results)} hooks")
        sys.exit(0 if tf == 0 else 1)
    elif args.article:
        r = validate_hook(args.article, Path(args.repo_root) if args.repo_root else None)
        sys.exit(0 if r.all_clear() else 1)
    else:
        p.print_help()
        sys.exit(2)


if __name__ == "__main__":
    main()
