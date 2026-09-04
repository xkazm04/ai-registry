---
name: research
version: 1.9.1
description: Extract actionable improvements for a project from external sources (video, blog, article, raw text). Scores ideas against the codebase, buckets into Code / Template / Credential, and persists findings to an Obsidian memory vault.
argument-hint: "[source or question]"
category: ai-native
memory: vault
---
# Research

Extract actionable improvements for the repository you are standing in from any external source (YouTube video, blog post, article, raw text). Score ideas against the codebase, bucket them, and either route a catalog idea to the repo's own catalog command or persist code-improvement findings to an Obsidian memory vault.

The method is **repo-agnostic**: it scores against whatever context source the repo has, and keeps a vault for long-term memory and self-improvement. Everything one repository is lives in the overlay below, each key with a default, so a repo that carries no overlay still gets a full run.

## Project overlay

Everything project-specific lives in ONE overlay the run reads in Phase 0: **`.claude/research/config.md` in the consuming repo** (tracked, so it travels with the clone and survives the vault, which is not version-controlled). **The run works with no overlay at all** — every key below has a default — but say so in the Phase 0 opening line when defaults are in force, and never paste one repo's overlay into this file.

Overlay shape: YAML frontmatter for scalars, markdown `##` sections for lists and prose. Keys (default in brackets):

```yaml
---
product: "<product name>"             # note headers, relevance framing  [the repo directory name]
stack: "<one-line stack description>" # what an idea has to fit  [detected from package.json / Cargo.toml / manifest, else "unknown"]
vault: ["<abs obsidian root>", ...]   # candidate roots, first existing wins  [<repo>/.research]
vault_subdir: ""                      # namespace inside the vault; "" = the root itself  [""]
context_map: context-map.json         # machine-readable file->context authority for scoring  [context-map.json if present, else none]
active_runs_ledger: ""                # path of a live-sessions ledger if the repo keeps one  [none; git status only]
active_runs_script: ""                # repo script that registers/checks ledger entries  [none; edit the ledger by hand, in one bash invocation]
locale_count: 1                       # sizing multiplier for string-adding findings  [1]
---
```

| Section | What it carries | Default when absent |
|---|---|---|
| `## Context sources` | the documents Phase 1 reads for scoring, in order, each with one line on what it is for (feature map, architecture digest, catalogs, project rules) | `context-map.json` if present, else `CLAUDE.md` (then `AGENTS.md`); a missing source is **noted, never fatal** |
| `## Feature docs` | where per-area product reference lives and how areas map to it, for Phase 6 Step 3a | none — go straight to grep |
| `## Buckets` | which buckets are live here beyond Code, what each one's catalog is, and the command that adds to it | Code only; a catalog bucket appears only if the overlay declares one |
| `## Gates` | the validation an executed finding must pass; the repo's single composite gate if it has one | detect from `package.json` scripts (`check`/`typecheck`, `lint`, `test`) and the toolchain (`cargo check` when `Cargo.toml` exists, `npx tsc --noEmit` when a tsconfig does); prefer a composite `check` script over a hand-rolled pair, and say what you detected |
| `## Repo law` | conventions an executed finding must honor: i18n contract (which locale files a new string lands in, by which pipeline), design tokens, voice for user-facing copy, error handling | "read the repo's CLAUDE.md/AGENTS.md first; reuse before building" |
| `## Domain notes` | the engine facts a scorer must know to not be wrong: what the product *is*, catalog-vs-runtime denominators, core-vs-plugin routing rules, settled architectural verdicts | none — derive what you can from the context sources and mark scores unverified until Phase 6 reads code |
| `## Release log` | the release-notes surface Phase 12 writes to: config file, content directory, locale set, key shape | Phase 12 is **skipped**, and says so |
| `## Vetoes` | settled or retired things never to re-suggest | memory only |

## Input

Ask the user, in this order:

1. **"What is the source? Paste a YouTube URL, an article URL, or raw text."**
2. **"Any focus hint? (`code` / `templates` / `credentials` / `all`) — defaults to `all`."**

Wait for both answers before proceeding. Do NOT ask anything else upfront — further questions only if a phase requires clarification.

---

## Constants

- **Codebase reference files** — whatever the overlay's `## Context sources` names, in its order. With no overlay, resolve in this order and use what exists:
  - `context-map.json` (repo root, or the overlay's `context_map`) — the machine-readable feature map: contexts, file paths, keywords. The scoring surface.
  - `CLAUDE.md` (then `AGENTS.md`, then `.claude/CLAUDE.md`) — project rules and conventions.
  - Any architecture digest or catalog inventory the overlay maps in. A catalog source is loaded only when a catalog bucket is in scope.
  - A missing source is **noted in the opening line, never fatal.** With none at all, score from the repo's own top-level structure and say every score is provisional until Phase 6.
- **Feature reference docs** — whatever the overlay's `## Feature docs` declares: where per-area product reference lives, and how an area maps to its doc. Use these on demand in Phase 6 when the feature map's keywords / file lists are too coarse to anchor a finding precisely; the doc's "primary user flows / backend command surface / data model / known gaps" sections often surface the exact attachment point faster than a wide grep. With no such section, go straight to grep.
- **Obsidian vault** — resolved at Phase 0 (`$VAULT/<vault_subdir>/`; the default subdir is the vault root):
  - `Research/` — one note per run
  - `Lessons/` — self-reflection notes
  - `Patterns/user-preferences.md` — distilled rules across runs
  - `00 - Index.md` — vault entry point
- **Catalog locations** — whatever the overlay's `## Buckets` declares for each live catalog bucket.

---

## Phase 0: Read the overlay, resolve and bootstrap the vault

Read `.claude/research/config.md` if it exists (§ Project overlay). Resolve `VAULT` = the first `vault` candidate that exists; if none does, fall back to `<repo>/.research/` — the same schema, still an Obsidian-openable folder — and **create it**. A missing vault is never a reason to abort:

```bash
VAULT=""
for c in "${VAULT_CANDIDATES[@]}"; do [ -d "$c" ] && { VAULT="$c"; break; }; done
[ -n "$VAULT" ] || { VAULT="$PWD/.research"; mkdir -p "$VAULT"; echo "No configured vault found - using fallback $VAULT"; }
```

Open with one line saying which vault won and whether an overlay was found. Git-ignore a fallback vault if a concurrent agent shares the branch.

Then, if `$VAULT/00 - Index.md` does not exist, create the structure:

```
$VAULT/
  00 - Index.md
  Research/
  Lessons/
  Patterns/
    user-preferences.md
```

`00 - Index.md` content:
```markdown
# {product} Memory Vault

Long-term memory for the `/research` skill and other work on this repository.

## Folders
- [[Research/]] - one note per `/research` run, source + extracted ideas + triage decisions
- [[Lessons/]] - self-reflection notes from each `/research` run (what was rejected and why)
- [[Patterns/]] - distilled rules across runs ([[Patterns/user-preferences|user preferences]])

## Conventions
- Research notes: `YYYY-MM-DD-{slug}.md` with frontmatter (source, date, accepted, rejected)
- Lessons notes: `YYYY-MM-DD-research.md` - append-only, one block per run
- Patterns are upgraded from Lessons after a rule has been observed 3+ times
```

`Patterns/user-preferences.md` content:
```markdown
# User Preferences (distilled from /research runs)

> Rules upgraded from `Lessons/` after 3+ observations. Loaded by `/research` Phase 1.

_No patterns yet. Will be populated as runs accumulate._
```

---

## Phase 1: Load Context & Memory

### 1a. Determine which reference files to load

Based on the focus hint, load this set:

| Focus | Sources loaded |
|---|---|
| `code` | the feature map + the architecture digest |
| a catalog bucket | the above + that bucket's catalog inventory |
| `all` (default) | everything `## Context sources` names |

The feature map and the architecture digest carry the run; a catalog inventory is loaded only when a catalog bucket is in scope.

### 1b. Report which sources exist

Report which resolved sources exist and which do not, in one line. **Nothing here stops the run** — a missing source narrows scoring, and saying so is the honest opening. If the repo has a command that regenerates one and the overlay names it, offer it as a next step rather than blocking. A focus hint that needs an absent catalog degrades to `code` — say so rather than failing.

### 1c. Read and absorb the loaded sources

Read each loaded source in full. Together they describe:
- the **feature map** — *where* code lives (contexts, file paths, keywords)
- the **architecture digest** — *how the engine works* (the product's central mechanism, schema, stack, conventions)
- a **catalog inventory** — *what already exists*, with its coverage gaps

**Find the product's central mechanism and hold it.** Every codebase has one fact that decides half the relevance calls — what the thing actually *is* under the surface. The overlay's `## Domain notes` should state it; if it does not, extract it from the architecture digest and say what you concluded. A source about the technology that mechanism is built on is **highly relevant to this codebase**, not out of scope, and a run that misses this drops its best findings as off-topic.

### 1d. Check snapshot freshness

If the feature map carries generation metadata (a commit count, a generated-at date), compare it to `git rev-list --count HEAD` and today. If commits have advanced by >200 OR the snapshot is >30 days old, warn but continue:
```
Warning: the feature map may be stale ({N} commits / {D} days since it was generated).
Consider regenerating it after this session.
```

Check a catalog inventory the same way if one was loaded; warn similarly if >30 days old — catalogs churn faster than a structural map.

### 1e. Load memory

Read in order:
1. `$VAULT/Patterns/user-preferences.md`
2. `$VAULT/Architect/strong-patterns.md` (if present — `/architect` writes it into the same vault) — these are the canonical shapes the codebase already does well. When a code-bucket finding's attachment point matches a strong pattern, prefer "extend the existing strong pattern" over "build something new" in Phase 6/7. Cite the strong pattern in the per-idea detail under an `Aligns with:` line.
3. The 3 most recent files in `$VAULT/Lessons/` (sorted by filename, descending)
4. The overlay's `## Vetoes` — settled or retired things never to re-suggest.

These inform extraction priorities and what to deprioritize.

---

## Phase 1.5: Register in the Active-Runs Ledger

**Skip this phase entirely unless the overlay names an `active_runs_ledger`.** With no ledger declared, `git status` is the whole coordination surface: note foreign uncommitted work, never sweep it into your commits, and go to Phase 2.

Where a repo does keep one, multiple CLI sessions work in parallel on the same checkout and branch, and the ledger is their coordination surface. Touch it twice: once here at session start, once in Phase 13. Format conventions live at the top of the ledger file itself.

### 1.5a. Read the ledger and check for conflicts

Read the ledger. Scan the `## Active` section. For each entry:

- **Live conflict:** entry status is `started` AND timestamp is **less than 2 hours old** AND any of its declared `Paths` overlaps your planned scope.
- **Overlap rule:** a planned path is a prefix of an active path, an active path is a prefix of a planned path, OR the two are equal.
- **Stale (`started` >2h ago):** mention to the user in your next text update; do NOT silently rewrite the other session's entry.

Your **planned scope** for `/research` is approximately:
- `$VAULT/Lessons/{date}-research.md` (always — shared-by-date file, but the Edit-not-Write rule already handles concurrent writers)
- `$VAULT/Research/{date}-{slug}.md` (always — per-run slug, no collision risk)
- The directories of accepted findings' file anchors (varies by finding)
- For Phase 12: whatever the overlay's `## Release log` names, if that phase will run
- The ledger itself (always — coordination surface, expected overlap)

You don't know all final paths until Phase 6/8. The Phase 1.5 declaration should be a conservative best guess based on the source type and focus hint; update later via Edit if scope changes materially in Phase 6.

### 1.5b. Conflict resolution

If a live conflict exists (overlap on something other than the ledger itself), ask the user:

```
Active session conflict detected:

  [<their-timestamp>] <their-skill> - <their-slug>
  Paths: <their-paths>
  Overlap with your plan: <overlapping-path(s)>

Options:
  1. Abort this run.
  2. Coordinate manually - you'll resolve before continuing.
  3. Proceed with awareness - both runs in flight, you accept the merge risk.
```

Honor the user's pick. Default behavior on no answer: ask once more, then proceed-with-awareness rather than aborting silently.

Overlap on the ledger alone is **expected** — it's the coordination surface. Do not flag that as a conflict.

### 1.5c. Append your entry under `## Active`

**If the overlay names an `active_runs_script`, run it rather than hand-editing** — such a
script picks the authoritative `## Active` section, stamps the time, formats the entry,
refuses a duplicate slug, excludes the ledger from its own overlap check and already
ignores entries past the staleness window, so you re-implement none of those rules by
hand. Its `register` subcommand writes the entry; its `check` subcommand IS the Phase 1.5a
conflict check, and its exit code is the answer.

With no script, edit the ledger by hand — **read + append in a SINGLE bash invocation**.
Parallel sessions rewrite the file between an Edit-tool read and its write, so a
multi-step edit loses entries.

The `<slug>` should match the one you'll use in Phase 9's Research note path (kebab-case
from the source title, <=40 chars).

---

## Phase 2: Source Ingestion

Detect source type from the user's first answer:

### 2a. YouTube URL
Patterns: `youtube.com/watch?v=`, `youtu.be/`, `youtube.com/shorts/`

Check `yt-dlp` is installed:
```bash
yt-dlp --version
```

If missing, abort with:
```
yt-dlp is not installed. Install it with one of:
  - winget install yt-dlp
  - pip install yt-dlp
  - Download from https://github.com/yt-dlp/yt-dlp/releases
Then re-run /research.
```

Otherwise, extract auto-generated subtitles:
```bash
mkdir -p .research-cache
yt-dlp \
  --skip-download \
  --write-auto-sub \
  --sub-lang en \
  --sub-format vtt \
  --output ".research-cache/%(id)s.%(ext)s" \
  "<url>"
```

Parse the resulting `.vtt` file:
- Strip WEBVTT header
- Strip cue settings and styling
- Collapse consecutive duplicate lines (auto-subs repeat heavily)
- Keep timestamps in `[HH:MM:SS]` format every ~30 seconds for citation

If no `.vtt` was produced (some videos have transcripts disabled), report the issue and ask the user to paste the transcript manually or provide an alternative source.

**Cleanup (MANDATORY, scoped to THIS run's video id):** as soon as the cleaned text is in working memory, delete the cache files this run created. Do this before Phase 3 starts — not at the end of the run, where a mid-run failure or context exhaustion would leave strays.

```bash
# Replace <id> with the actual video id used in --output above. Glob covers
# both the .vtt and any .clean.txt / .cleaned.txt sibling some scripts emit.
rm -f .research-cache/<id>.* 2>/dev/null
```

Rules for the cleanup:
- **Scope strictly to this run's id.** Never sweep `.research-cache/*` blindly — that races with any parallel research run on the same machine and could delete another run's working files.
- **Idempotent on failure.** If the rm fails (locked file, etc.), log it as a `cache_cleanup_skipped` note in the Lessons block but continue — leaving cache is not a run-blocking error.
- **Verify in Phase 11.** The final summary's "Files updated" block should include `Cache: cleaned` (or list the residue path if cleanup failed) so the user has a one-line signal that this run did not pollute `.research-cache/`.
- **`.research-cache/` is gitignored** (see repo `.gitignore`). Stragglers from old or interrupted runs no longer surface in `git status`, but they DO accumulate on disk — `/research` runs are the only legitimate cleaner. Don't rely on git status to remind you.

### 2b. Other URL
Use `WebFetch` with a prompt asking for the article body, stripped of nav/footer/ads.

**A landing page is not the source.** When the URL is the front door of a multi-page site —
a specification, a docs set, a standard, a product's documentation tree — the overview page
is a marketing summary and the substance lives one level down (`/specification`, `/docs`,
`/reference`, `/schema`). Fetch the substantive subpage(s) BEFORE applying the thinness
check below, or a rich source gets rejected as thin. Run 2026-08-13 (agent-plugins.org) hit
this: the overview returned ~250 words of positioning, while `/specification` carried the
entire normative contract that produced both shipped findings. Budget the same way as
Phase 2.5 — two or three focused fetches, not a crawl. A 404 on a guessed subpath is cheap;
guess from the overview's own links rather than from convention.

**An aggregator listing is not the source either — and the word floor will NOT catch it.**
Distinct trap from the landing page above. Directory and marketplace sites that index
artifacts hosted elsewhere (skills.sh, plugin/skill registries, awesome-lists, package
pages, "SKILL.md viewers") render a *rewritten summary* of the artifact, often behind a
"Show more" toggle that WebFetch cannot expand. What comes back is fluent, adequately
long, and sails past the <300-word check — while being a paraphrase of the thing you were
asked to evaluate. Every finding downstream would then be scored against prose the author
never wrote.

**When the source URL is an aggregator listing for a git-hosted artifact, resolve it to
the repository before Phase 3.** The listing names the owner/repo; find the real path with
one call rather than guessing:

```bash
gh api repos/<owner>/<repo>/git/trees/main?recursive=1 --jq '.tree[].path' | grep -i <artifact-slug>
gh api repos/<owner>/<repo>/contents/<path> --jq '.content' | base64 -d > .research-cache/<slug>.md
```

Guessing the path costs a 404 (run 2026-08-13 assumed `skills/<name>/SKILL.md`; the file
was at `plugins/business-analytics/skills/<name>/SKILL.md`). The tree listing is one call
and is never wrong. **Fetch every file the artifact splits itself across** — that run's
SKILL.md was 770 words and pointed at a `references/details.md` carrying another 1,241,
including all three layout patterns and every worked example.

Tells that a page is a listing rather than the artifact: an installs/stars counter, a
"Repository:" field, a security-audit badge, a `<slug>` in the URL path that looks like
`<owner>/<repo>/<artifact>`, or fetched text that describes the content in the third
person ("The skill covers…", "the full content appears truncated"). Treat any of those as
a hard signal to go to the repo. `.research-cache` cleanup (Phase 2a) applies to files
fetched this way too.

### 2c. Raw text
Use as-is.

**Sanity check:** if the resulting text is <300 words **after** the subpage pass above,
report it's too thin to harvest meaningful ideas and stop.

> **Source-type agnosticism confirmed.** Runs 1-5 used YouTube videos (Phase 2a); run 6 used a blog article (Phase 2b WebFetch). Both paths produced the same downstream shape — same frontmatter, same Phase 6 rules, same output formats. The skill is source-type agnostic; do not special-case downstream phases based on whether the source came from 2a, 2b, or 2c.

---

## Phase 2.5: Web Augmentation (technique/tooling lookup)

YouTube transcripts (and many talks/articles) name a tool or technique without explaining how it actually works. A speaker says "we use Sieve for the video step", "we agentic-RAG the docs", "we route through OpenRouter" and moves on — leaving the cleaned text technique-shaped without enough depth for a clean Phase 6 evidence pass. This phase fills that gap with a **bounded** web round.

### 2.5a. Decide whether to run

Run web augmentation when **all** of these hold:
- The cleaned source text references at least one **named tool, framework, model, library, protocol, technique, or workflow pattern** that is non-obvious from the transcript alone
- A correct Phase 6 evidence pass would benefit from knowing how that thing actually works (API shape, key concepts, integration points, current pricing/auth model)
- The reference is not already deeply documented inside the codebase or in the architecture digest

**Skip the phase** when the source is fully self-contained (e.g. a philosophical article, a product launch where the post itself IS the spec, or raw text the user already curated for the run). Don't run web augmentation on every source — it costs tool calls and can drift into rabbit-holes.

### 2.5b. Build the lookup list

From the cleaned text, list the candidate names — typically 1-5 items. For each, record:
- `name` — exact spelling as it appears in the source
- `kind` — `tool` | `framework` | `model` | `library` | `protocol` | `technique` | `workflow_pattern`
- `why_useful` — one line on how a deeper definition would change Phase 6 framing

Drop items that are:
- Already in a loaded catalog inventory (Phase 1c will have loaded it for the relevant focus) — those are catalog hits, not augmentation candidates
- Generic primitives (`HTTP`, `JSON`, `webhook`) — no augmentation value
- Brand names of commodities the speaker only name-drops without using (`AWS`, `npm`, etc.)

### 2.5c. Run the lookup (bounded)

For each surviving candidate, prefer one focused query over many shallow ones. Cap at **3 web calls total** for the phase — this is augmentation, not full research.

- **First** try `WebSearch` with `<name> <kind> <year>` (e.g. `Sieve video API 2026`). One query is usually enough to surface the canonical product page or docs URL.
- **Then** `WebFetch` the single most authoritative result (vendor docs, RFC, GitHub README) with a prompt like: *"Extract the core concept, API surface, auth model, and how it would integrate with a desktop AI agent app. Skip marketing copy."*
- If the candidate is a YouTube creator's house technique (no canonical doc page), search for `<creator name> <technique>` and pick the best blog-post or follow-up video transcript.

Stop early once the technique is understood. Do NOT fetch every result.

### 2.5d. Capture the augmentation note

For each looked-up item, write a 2-4 sentence note in working memory:
- **What it is** (one sentence)
- **How it works at a high level** (one sentence — the load-bearing technical fact)
- **Integration shape** (one sentence on auth model / API surface / boundary of responsibility)
- **Why it matters for this product** (one sentence — which bucket does it suggest?)

These notes are scratch — they feed Phase 3 (better extracted-idea quality), Phase 5 (better bucket assignment, especially separating "credential candidate" from "library to wrap"), and Phase 6 (better grep terms — knowing the protocol name lets you grep for the right thing).

### 2.5e. Write the cited URLs into the Research note

In Phase 9, the Research note frontmatter gets a new optional list:
```yaml
web_augmentations:
  - { name: "Sieve", url: "https://www.sievedata.com/...", kind: "tool" }
```
This makes the augmentation traceable on future re-reads and prevents re-fetching on Phase 3 cross-checks of `descoped-reopenable.md`.

### 2.5f. Anti-patterns

- **Don't run augmentation to validate the speaker's claims.** That's `/research`'s next phase (Phase 6 evidence against the codebase). The web round is for technique definition, not opinion-checking.
- **Don't quote the augmentation source as a Phase 7 source anchor.** The source anchor still belongs to the original transcript/article — augmentation only sharpens framing.
- **Don't escalate a web-augmentation discovery into a finding on its own.** If WebSearch surfaces "this product also has a credential-relevant API the speaker didn't mention", that's a candidate idea for the original source's surface area, not a new source. Add it as an extracted idea in Phase 3 with `source_anchor: "(web augmentation, not in transcript)"`.

---

## Phase 3: Raw Idea Extraction

From the source text, extract 5-15 distinct ideas. Each idea must be:
- A concrete technique, pattern, tool, or recommendation (not opinions or filler)
- Grounded in a specific quote or timestamp from the source
- Standalone enough to be evaluated independently

### Compare mode — read the source as a checklist to FAIL, not a menu to shop

When the invocation frames the run as a comparison against an existing module
("compare X with our implementation of Y", "does this skill help our design",
"what does this have that we don't") — usually with an explicit *don't adopt it*
— the default generative reading produces almost nothing. Against a mature
module, "what could we take from this?" returns ideas already built, and the run
drifts toward padding the finding count with things the catch table would have
covered.

**Invert the question. Go principle by principle through the source and ask
"which of these do we FAIL?"** Extraction is then per-principle rather than
per-idea: every Do/Don't, every checklist item, every troubleshooting entry
becomes one candidate whose verdict is `catch` (we honor it, cite where),
`fail` (a real finding), or `n/a` (different domain — say so, don't score it).

Two things fall out of this that the generative reading misses:

- **The findings come from the source's least glamorous material.** Run
  2026-08-13 (kpi-dashboard-design vs the KPI module) drew both accepted
  findings from a one-word checklist bullet ("Time-bound") and an ASCII layout
  diagram — while the source's SQL, its dashboards and its Streamlit code, the
  parts that *look* like the substance, were entirely inapplicable. A generative
  reading gravitates to the code blocks and finds nothing.
- **The catch table IS the deliverable, and must be stated as such up front.**
  That run closed 2 findings against 13 catches (~1:6, catch-dominant even by
  the listicle row's standard). Leading with "your module is ahead of this
  source on 13 of 15 points, and here are the 2 it isn't" is the honest answer
  to what was actually asked. Do not bury it under the findings.

Where the source's advice is *worse* than what the repo already does, say so
and keep the repo's shape — an outside checklist is not automatically the
higher authority. That run declined the source's "cap the dashboard at 5-7
KPIs" in favor of surfacing the ranking the schema already stored, because a
cap hides KPIs while a ranking does not. Record the reasoning; a future run
re-reading the same source should not have to re-litigate it.

For each idea, capture:
- `title` — short imperative phrase (<60 chars)
- `summary` — 1-2 sentences
- `source_anchor` — quote (≤20 words) or `[HH:MM:SS]` for video sources
- `tentative_bucket` — your initial guess: `code` / `template` / `credential` / `unclear`

Apply memory-informed filtering: if `Patterns/user-preferences.md` says "user rejects migration ideas" or similar, deprioritize matching ideas (still extract, but mark `low_priority: true`).

**Also check `Patterns/descoped-reopenable.md`** (if it exists) for findings that were previously descoped but may now be viable due to changed ecosystem conditions. If any apply to the current source, surface them explicitly in Phase 7 as "previously descoped, reconsider?" items alongside the new findings.

### Source-type yield calibration

Different source types produce different finding profiles. **A "low" finding count is not a failure mode if it matches the source type's expected yield.** Don't force extraction past the natural limit just to hit a number.

| Source type | Expected yield | Typical pattern |
|---|---|---|
| **Technical interview / engineering talk** | **densest** — 3-5 strong findings with concrete file anchors | Run 3 (Codex/Bolin): 3 accepted findings + 1 security escalation. Interviews with engineers on specific systems often reveal architectural critiques that map directly to codebase gaps. |
| **Feature walkthrough / dev-focused demo** | dense — 3-4 findings with mix of code + template ideas | Run 1 (A2A Gateway): 4 accepted findings. Run 2 (Everything is a CLI): 4 accepted findings. Demos that show a specific workflow tend to produce at least one clear architectural finding. |
| **Product demo / competitor walkthrough** | **low + many catches** — 1-3 real findings, 5-10 "already existed" catches | Run 4 (Paperclip): 2 findings, **8 already-existed catches**. Product demos of competing systems are high signal for the host-first rule because every feature demonstrated is potentially "do we have this already?". Expect the catch count to exceed the finding count. |
| **Philosophical / forward-looking article or video** | low — 1-2 findings, mostly discovery-brief territory | Run 5 (Karpathy LLM Wiki): 2 accepted findings + 7 already-existed (the skill's own prior iteration had already implemented the core insight). Philosophical sources often produce narrow deltas against existing implementations. |
| **Product launch article** | low-medium — 1-3 findings including at least one scaffolding-shaped finding | Run 6 (Claude Managed Agents): 2 findings, one of which became a theoretical scaffolding handoff (Option C). Launch articles frequently describe gated/preview features that fit Option C. |
| **Specification / standard / RFC** | **medium findings + many catches**, and the findings are unusually *actionable* | Run 2026-08-13 (Agent Plugins 1.0.0): 4 findings / 6 catches, 2 shipped same-session. A mature codebase has usually built a spec's **features** (those become catches) and skipped one of its **invariants** — so **read the MUST/SHOULD/MAY table before the feature tour.** The prize on this source type is a constraint the repo never checked, not a capability it lacks. Distinct from a product-launch article: a spec has no roadmap to defer to, so nothing lands in Option C. |
| **Best-practices listicle** ("N rules for X") | **low findings + many catches**, ~1:3 | Run 2026-08-12 (12 Rules for Claude.md): 4 findings, **11 already-existed catches**. A listicle enumerates a canonical checklist, so against a mature repo most items resolve to catches and the value is the confirmation table plus two or three genuine deltas. Do NOT stretch for parity with the list's length — a 12-rule video is not a 12-finding run. Watch for the item the repo deliberately does the *opposite* of; that is a catch with a reason, not a gap (here: "always ask clarifying questions" versus a headless engine's act-autonomously directives). |
| **Blog post / raw text** | varies widely | Phase 2b and 2c work the same as 2a downstream; the yield depends on content density, not transport. |

**If the finding count feels low, check the source type first.** If the source is a product demo and you have 7+ catches, that's a successful run, not a failed one. Surface the catch count prominently in Phase 7 as the primary metric for low-finding runs.

---

## Phase 4: Relevance Filter

For each idea, score relevance against the feature map:

- **High** — keywords clearly match a context group's keywords/description; specific files/entry points are obvious anchors
- **Medium** — partial keyword overlap or description similarity, no clear file anchor
- **Low / drop** — no plausible attachment point in any context group

**Drop all `Low` ideas.** Don't waste user attention on out-of-scope material.

**Scoring honesty — evidence caps the score.** Phase 4 scores are provisional keyword matches; they become final only after Phase 6. A finding may carry `Relevance: High` into Phase 7 **only if** Phase 6 actually read or grepped the anchor file(s) in this session and the finding cites the resulting `file_path:line` evidence. "Sounds applicable" without a code read caps the score at `Medium` and the Evidence line must say `unverified — keyword match only`. Never present an unverified finding as High just because the source is compelling — the catalog-vs-runtime misframe below (2026-04-08) came exactly from scoring on vibes instead of code.

If the focus hint was `code` / `templates` / `credentials`, drop ideas that don't match the chosen bucket (after Phase 5 reclassification).

---

## Phase 5: Bucket Classification

Re-evaluate each surviving idea and assign a final bucket. An idea may belong to **multiple** buckets — that's fine, present it once but flag all applicable buckets.

**Bucket A — Code Improvement — is always live.** The catalog buckets below exist only where the overlay's `## Buckets` declares them; in a repo that declares none, every idea is Code or it is dropped, and the run says so once rather than hunting for catalogs that do not exist.

### Bucket A — Code Improvement
The idea suggests a change to existing code in this repo. Examples:
- "Add request retry with exponential backoff"
- "Memoize this expensive computation"
- "Use IntersectionObserver instead of scroll listeners"

Required output: target file(s), function/component name if known, evidence the gap exists.

### Bucket B — New catalog entry (a repo that ships a catalog of workflows/templates)
The idea describes a new unit of work that fits the catalog's schema. Indicators:
- Mentions external services orchestration
- Has clear trigger → action → notification flow
- Could replace a manual repetitive process

Required output: entry name, services involved, primary trigger, similar entries already in the catalog the overlay names (and why this isn't a duplicate).

### Bucket C — New integration / credential (a repo that ships a connector catalog)
The idea references an external service whose connector isn't in the connector catalog the overlay names. Indicators:
- A specific tool/SaaS named that the product doesn't yet integrate
- The integration would unlock ideas in Bucket B

Required output: service name, auth type if known, why the product needs it.

If an idea is a `B + C` combo (a new entry that requires a not-yet-existing connector), present it once, flag both buckets, and note that the connector must be added first.

---

## Phase 6: Evidence Gathering

For each surviving idea, gather concrete evidence to make the user's triage easy. Budget your tool calls — don't go deeper than necessary.

### Code bucket

**Step 1 — Host infrastructure first.** Before searching for the specific feature, grep for the *category of host infrastructure* the idea would attach to. Examples:
- HTTP endpoint idea? `Grep "axum|HttpServer|Router::new"` to find existing HTTP server modules
- Background job idea? `Grep "tokio::spawn|JoinHandle|Worker"` to find existing job runners
- Auth/middleware idea? `Grep "middleware|tower_http|from_fn"` to find existing middleware patterns
- New table idea? Grep the migrations for a `CREATE TABLE` on the related concept
- New flag / invocation idea? Grep where the product builds its subprocess or client arguments

This catches existing-but-undocumented surface area in one grep. **A single discovery here typically reframes 2-4 findings at once** — what looked like "build new infrastructure" becomes "add routes to existing router" / "add column to existing table". Reframing changes both effort estimates and file anchors, so do it before deeper greps.

**Step 1b — Catalog vs runtime check.** Before scoring any finding about "tool surface", "prompt size", "integration count", or a similar quantitative architectural critique, verify the **catalog count is not the per-execution count**. A catalog of N things almost never means N things reach any single execution: entries get bound a few at a time, one per run, or conditionally by mode. The overlay's `## Domain notes` should state the real denominators; where it does not, find them in code before scoring. A measured instance of the trap: a critique of "87 connectors of tool surface" in a product where each unit binds **0-3** — the true denominator was 0-3, and the finding evaporated.

If the finding's premise depends on catalog count = runtime count, **the finding is wrong** — drop it or reframe before presenting.

**Step 1c — Core vs plugin routing.** Before deciding the file anchor for a code finding, check whether it belongs in the **core engine** or in a **plugin / extension / feature module**. A general-purpose core plus domain-specific plugins is a common shape, and putting a domain feature in the core is the routing error that makes a good finding land wrong. The overlay's `## Domain notes` should state the routing rule and where each side lives. The portable test: ask "would a user who never touches this domain benefit?" If no → plugin, not core.

**Step 2 — Then search for the specific feature.** Now grep for the actual thing the idea proposes (function name, env var, flag, table name).

**Step 3 — Read the anchor file.** `Read` the most relevant file(s) — limit to ~100 lines. Identify the exact `file_path:line_number` where the change would land. **For host-infrastructure verification, read enough to confirm the public API (~30 lines), not the implementation (~500 lines)** — token efficiency matters.

**Step 3a — Consult the feature docs when the context map is too coarse.** A generated feature map is intentionally shallow — it gives keyword groups and file lists, not flow descriptions. When a finding lands inside an area the overlay's `## Feature docs` maps, open that doc before doing wider greps: it names the entry point, the primary user flows, the backend command surface and the known gaps, and frequently the exact attachment point is one sentence in it, which reduces or skips the grep round. Where the repo keeps such docs in sync with source by hook or by review, treat them as current — do not infer staleness without a `git log` check. With no `## Feature docs`, go straight to grep.

When the finding spans multiple feature areas (e.g. an execution-runtime change that surfaces in Overview), read both relevant docs — the framing in one is rarely sufficient for cross-area work.

**Step 3b — If the finding adds a cap, budget, limit, or guard, find the existing one first.** Grep for a cap already applied to the *same material* (`budget`, `MAX_`, `LIMIT`, `truncate`, `pack_`) before choosing a mechanism. Two distinct failures this catches: (a) the cap already exists one layer down and the finding is void; (b) the cap exists but made the **opposite** design decision, so your implementation would be locally reasonable and globally inconsistent. Run 2026-08-12 hit (b) — a per-entry *truncation* with an announce-the-cut marker was written and reverted after reading `pack_by_budget`, which **skips** over-budget entries on the documented grounds that "a partial memory is worse than none". Reusing the existing packer made the change smaller and removed a duplicated constant instead of adding a competing one. Truncate-vs-skip, drop-oldest-vs-drop-lowest-ranked, and fail-vs-degrade are all decisions a codebase may have already made once.

**Step 4 — Drop if redundant.** If the gap doesn't actually exist (the codebase already does this), drop the idea.

**Step 4b — Read backgrounded tool output even when you re-ran it scoped.** A grep that times out and gets backgrounded is usually slow *because it covered more ground*. Re-run it scoped to stay unblocked, but read the original when it lands: on run 2026-08-12 the wide version contained one reference the scoped re-run had missed, which turned a single-module finding into a documented three-instance pattern and then into a shipped-template consequence. A superseded background result is not redundant.

**Step 4c — A capped grep proves presence, never absence.** Any claim of the form
"the codebase does not have X" must come from an **uncapped** search — no `head -N`, no
`| head`, no `head_limit` — or from a count (`grep -c`, `output_mode: "count"`). Ripgrep
and grep emit in path order, not relevance order, so a cap silently truncates exactly the
file whose name matches your concept: on run 2026-08-17 a `head -8` over a backend source
tree reported "no tray icon" because `tray.rs` sorted *after* eight `commands/**` matches
on the word "s**tray**". The run then told the user a subsystem was missing when it was
present, with the same confidence as its load-bearing claims.

This is the mirror of Step 4b and is easy to miss right after obeying it: that run read
its backgrounded wide grep to corroborate one absence claim, then made a second absence
claim one tool call later from a capped result without routing it through the same
discipline. Presence claims are safe to cap — one hit is one hit. Absence claims are not.
Before writing "zero hits" into Phase 7, re-run uncapped.

**Step 5 — Grounding check (per finding, before Phase 7).** Every code finding that will be presented as `High` must carry at least one `file_path:line` citation produced by a Read or Grep **in this session** — the line that proves the gap exists (or the host surface the change attaches to). If you can't produce that citation within budget, downgrade to `Medium` + `unverified` per the Phase 4 scoring-honesty rule; don't fabricate an anchor from the context map's file list.

**Security escalation rule:** When a grep against a file that exposes an HTTP, IPC, webhook, or external surface — **OR** that spawns a privileged subprocess (e.g. with `--dangerously-skip-permissions`) — returns **zero hits for auth/sandbox patterns** (`api_key|Authorization|Bearer|require_auth|middleware|sandbox|seatbelt|seccomp|landlock`), do NOT drop the finding as "no existing pattern". Instead, **escalate it to severity `CRITICAL` and re-label it as a security gap, not a feature add.** Open HTTP/IPC surfaces and unsandboxed privileged spawn sites are findings even when the user didn't ask about security — the source may not even mention security, but the codebase reality does.

**i18n impact check:** When a code finding touches user-facing surfaces, note whether it introduces new strings. If yes, mark it `i18n: required` and add an effort note naming the repo law's actual contract — which catalog the string lands in, which pipeline fills the other locales, and that all `locale_count` locales move in the same change. This puts the i18n cost in front of the implementing session upfront, not as a surprise mid-execution. In a repo with `locale_count: 1` the note is one line and cheap; in a 14-locale repo it can be the whole cost of the finding. Where the repo law names a token-label or translated-error helper, say that raw tokens and raw error strings must go through it.

### Bucket B (catalog entry)
- **First** scan the loaded catalog inventory for duplicates (faster than walking the filesystem)
- If a similar entry exists by id/scope/services, drop the idea — note "duplicate of {id}"
- If unsure, `Read` the closest existing catalog entry (1 file max, at the path the overlay's `## Buckets` gives) to confirm
- **Boost priority** if the idea's category is marked **sparse** in the inventory's coverage analysis
- For ideas requiring an integration NOT in the catalog, mark them **combo** (B + C, C first)

### Bucket C (integration / credential)
- **First** scan the loaded connector inventory for the service name
- If found, drop the idea — note "already exists as {name}"
- If not found, **boost priority** if the connector category is sparse
- Also verify the auth type is supported (compare against the auth distribution in Coverage Analysis)

---

## Phase 7: Present Findings

Print a single summary table followed by numbered detail blocks. **Before printing, run cluster detection (below) so the user can see natural bundles instead of a flat list.**

### Cluster detection

Before presenting, scan the surviving findings for clusters that should ship together:

- **Same file anchor** — multiple findings touching the same file (e.g. all 4 land in `engine/management_api.rs`) usually want a shared PR. Note the cluster.
- **Dependency edges** — finding B mentions a field/table/module that finding A would create. Note `depends on [N]`.
- **Security pairing** — an auth finding paired with an exposure/visibility finding. Neither makes sense alone (auth without exposure flag = every key sees everything; exposure flag without auth = anyone reaches public stuff). Always present these as a forced pair.
- **Protocol pairing** — a protocol-shape endpoint paired with a self-describing metadata endpoint (the metadata endpoint is the prerequisite). Always present these as a natural pair.

For each cluster, add a one-line note to the relevant findings: `Cluster: ships with [N, M] — recommended order: M → N`. This makes the user's triage decision a cluster decision, not a per-row one.

### Summary table

```
#  Bucket       Title                                          Relevance  File / Service
─  ───────────  ─────────────────────────────────────────────  ─────────  ──────────────────
1  code         Add retry with backoff to API proxy            High       {path}/api_proxy.rs
2  bucket-b     Daily standup digest from GitHub PRs           High       (new catalog entry)
3  bucket-c     Add Linear connector                           Medium     (new integration)
4  code+b       Webhook deduplication via idempotency keys     High       {path}/webhooks.rs
...
```

### Per-idea detail

For each row:
```
[N] {title}
    Bucket(s):    {bucket(s)}
    Source:       "{quote}" or [HH:MM:SS]
    Summary:      {2-3 sentences}
    Evidence:     {file_path:line actually read/grepped this session for code; similar templates for templates; or "unverified - keyword match only" (caps relevance at Medium)}
    Recommended:  {the catalog command the overlay names, with its argument | edit {file}}
    Why it fits:  {which context group from the feature map it maps to}
    Aligns with:  {strong-pattern wikilink + canonical example, if any - else omit line}
```

---

## Phase 8: User Triage

Ask the user:
```
Which findings should I action? Reply with numbers (e.g., "1, 3, 4"),
"all", "none", or "ask" for a guided walkthrough.
```

For each accepted finding:

### Code bucket

**IN-SESSION EXECUTION IS THE DEFAULT.** Set on 2026-04-17 after observing the morning-handoff → evening-amendment → next-session-execution fragmentation pattern. Split sessions fragment the work: a handoff written at the end of session N accumulates amendments in session N+1 and finally gets executed in session N+2 — each hand-off is a place where context is lost, scope drifts, and on 2026-04-11 one such hand-off resulted in an entire session's code being wiped during a merge. **Execute in the same session that produced the findings, validate, and commit atomically per task.** This keeps the discovery → decision → implementation arc inside one context window where corrections are cheap.

**When in-session execution is NOT possible** (pick the fallback shape):

- **Context is critically tight** and the remaining budget cannot accommodate the edits + validation + commits.
- **Work is genuinely exploratory or multi-day** — requires specs that don't exist yet, external approvals, research into unknown systems.
- **Dependency is unavailable** — whitelist-gated API, preview product, credentials the dev team can't obtain (Option C territory).
- **User explicitly requests planning-only** — "prepare a plan, I'll execute later".

Do NOT fall back to a handoff because the work feels large. "Large" is a signal to break into smaller atomic commits, not to defer. Cross-language work (two toolchains plus strings plus a migration in one run) is still in-session-executable as long as validation passes per-task.

**Option A — Single isolated finding → execute + commit + optional todo (NEW DEFAULT)**
For one code finding with a clear `file_path:line` anchor, apply the edit, run the overlay's `## Gates` for what it touched, and commit with a `research:` prefix. Offer a follow-up todo only if the finding surfaces adjacent cleanup out of scope for this PR, and only through a todo mechanism the repo actually has. Do NOT write the finding to the vault as a "noted but not implemented" item — that is the old default and it fragments the record.

**Option B — Clustered findings → in-session execution with atomic commits (NEW DEFAULT for 2+ findings)**
For 2+ clustered code findings:

1. **Present the full task plan inline** (same shape as the old handoff structure below) before executing, so the user sees what is about to happen.
2. **Execute in the recommended ship order** (risk-ascending: trivial constants first, complex cross-file work last).
3. **After each task, run the relevant validation** — the overlay's `## Gates`, keyed by what the task touched; with no overlay, the detected typecheck / lint / test / compile commands, and print what you detected.
   **Prefer the repo's own composite gate over a hand-rolled pair.** Where a repo ships one `check` script chaining many gates, run it: a hand-rolled `typecheck`+`lint` pair silently skips the gates in between, and the skipped one is usually the one most likely to fail a diff that compiles.
4. **Commit atomically per task** with `research: <short task title>` prefix, Co-Authored-By footer, and a body that explains the why.
5. **If validation fails for a task**, fix the issue inline before moving to the next task. Do NOT stack failing commits. Do NOT use `--no-verify` or `--amend`.
6. **If a task genuinely cannot be completed in-session** (e.g., hits a real blocker), commit the completed tasks, then write a handoff for the remainder — do not discard the completed work.

The inline task plan should include:

- **Why this matters** — one-paragraph context (what problem, what infrastructure already exists)
- **Goal** — numbered list of the bundled findings as deliverables
- **Non-goals** — explicit "do NOT do these" list (deferred findings, scope creep traps, layers not to touch). Even in-session execution benefits from explicit non-goals; they keep the execution focused.
- **Dependency graph & order** — which tasks ship together, which depend on which
- **Per-task spec** — for each task: file path & line anchor, schema/migration SQL, struct definitions, function signatures, acceptance criteria
- **Cross-cutting concerns** — convention compliance (point at the overlay's `## Repo law` and the repo's rules file), security defaults, backward-compat constraints, tests to add. **If any task touches user-facing surfaces, the repo law's UI and i18n contracts are part of the task spec, not an afterthought**: which locale catalog a string lands in, which pipeline fills the rest, which helpers status tokens and error messages must go through, and the repo's own typography/contrast rules.

Record the commit SHAs in the Research note frontmatter (`commits: [<sha1>, <sha2>, ...]`) and in the Phase 11 final summary. The Research note replaces the handoff file as the canonical per-run artifact.

**Option B-Design — Design-then-execute (when shape requires exploration)**
Pick this when the user replies to Phase 8 with phrases like "propose approaches", "design first", "what are the options", "scan and propose", "three different approaches", or otherwise signals that the finding's shape is ambiguous and needs exploration before code lands. The shape is: explore → user picks → write a concrete design doc → **immediately execute** against it in the same session.

Steps:
1. **Scan once more.** Run a focused round of codebase evidence gathering beyond Phase 6 to ground the approaches in concrete file anchors. Do not skip this — without it, the approaches read as generic and the user cannot distinguish them.
2. **Present 2-3 approaches** with tradeoff tables (✅ benefits / ⚠️ risks per approach) and effort estimates. Each approach must name actual file paths and existing infrastructure it would attach to or extend. Generic approaches that could apply to any codebase are a smell — the source-grounded option is the one the user picks.
3. **Wait for the user's pick.** Do NOT proceed to design-doc writing on speculation; the user may refine the framing or merge approaches.
4. **Write a co-located `DESIGN.md`** next to where the code will land, not in a planning directory. The co-location matters: a future session reading the code finds the design rationale next to it. If the location is genuinely ambiguous (multi-area changes), put it in the repo's planning directory if it has one, else in `$VAULT/Research/`.
5. **Continue IMMEDIATELY to in-session execution** against the design. Do NOT stop at the design doc and ask for approval. The user already approved the approach in step 3; the design doc is the implementation contract, not a second decision gate.
6. **Treat the design doc as a working artifact.** If implementation reveals a constraint that invalidates part of the design (e.g., the proposed schema conflicts with an existing index), AMEND the design doc inline and continue with the new shape. Don't pause for re-approval on minor adjustments — only pause if the change is structural enough that the user would have picked a different approach.
7. **Atomic commits per PR step in the design's rollout plan.** A 5-PR rollout = 5 atomic commits. Validation runs per commit, same gates and same rules as Option B.

**Why this is its own option, not just a variant of B:** A regular Option B finding has a clear `file_path:line` anchor where the change lands. A B-Design finding starts with no clear anchor — the work is partly figuring out what to build. The exploration step is non-trivial (3+ tool calls of codebase scan), and writing the design doc is real work (typically ~1-2 KLOC of markdown). Wrapping it in a labeled option lets future runs reuse the pattern without re-discovering it.

**Anti-pattern:** writing a design doc and stopping there ("design ready for review"). That fragments the work across sessions and re-introduces the merge-loss risk Phase 13 was designed to prevent. The 2026-04-17 split-session lesson applies here too — the design exploration and the implementation belong in one context window.

**When this option does NOT apply:** if the user accepts a finding with a clear file anchor without asking for approaches, just run Option A or B. Don't volunteer an exploration round when none is needed.

**Option B2 — Implementation-ready handoff plan (FALLBACK when in-session execution is impractical)**
This was the old Option B default. It is now a fallback. Use ONLY when one of the "when in-session execution is NOT possible" conditions above is met. When written, use the structure from Option B above (Why this matters, Goal, Non-goals, Dependency graph, Per-task spec, Cross-cutting concerns, Final acceptance checklist, What to do if you get stuck, Out of band) and save it to the repo's planning directory as `{YYYY-MM-DD}-{slug}.md`; with no such directory, `$VAULT/Research/{YYYY-MM-DD}-{slug}-handoff.md`.

The handoff plan must be **self-contained** — readable without the conversation that produced it. The implementing CLI will not have access to this skill's context.

Record the handoff path in the Research note frontmatter (`handoff: <path>`) and in the Phase 11 final summary.

**Do NOT default to Option B2.** Every time a handoff is written instead of executed, there is a risk the work never lands or lands fragmented across multiple sessions. The 2026-04-17 same-day morning-handoff → evening-amendment cycle is the canonical cautionary tale — the same findings took two research sessions and a third execution session to fully land when a single session would have sufficed.

**Option C — Theoretical scaffolding handoff (gated/preview/whitelist-dependent features)**
Same structure as Option B, BUT with a much stricter non-goals section. Use this when the accepted finding depends on an external dependency that isn't available yet: whitelist-gated APIs, preview products, unreleased SDKs, features behind a private beta.

Distinguishing characteristics vs. Option B:
- **Non-goals section explicitly forbids any real integration attempts.** Example phrasing: *"Do NOT make any HTTP calls to {external host}. Not in tests, not in examples, not in commented-out code."* and *"Do NOT hardcode endpoint URLs before the API is publicly documented."*
- **Implementation style is scaffolding only:** stub structs/traits, settings keys with no defaults, `Err(AppError::NotImplemented(...))` returns, variant added to enums with dispatch points returning NotImplemented. The compile passes; no runtime behavior is exercised.
- **Every stub point gets a `TODO({feature-name}-{reason})` marker** (e.g., `TODO(managed-agents-whitelist)`) so a future CLI session can grep for all the breadcrumbs and finish the work when access is granted.
- **Tests only cover the deterministic stub path** (assert `NotImplemented` is returned). No integration tests; no fixtures that imply real API shape.
- **Out-of-band section lists "what to do when access is granted"** as a concrete checklist: grep for the TODO marker, flesh out stub methods, add UI surface, update docs.
- **Small Cargo.toml / deps additions are allowed only if** the dependencies are already present for other reasons. Do NOT add new dependencies that only the stub would use.

When to pick Option C over B:
- The source mentions a product in public beta / research preview / whitelist gate
- The API spec isn't publicly documented
- Authentication credentials for the external system aren't available to the dev team
- The user explicitly says "prepare theoretically" or "scaffold for future"

Run 6 (2026-04-08, Claude Managed Agents) produced the first handoff in this shape. It's a real category — codify it.

**Option D — Just record, no further action (escape hatch only)**
For findings the user wants to think about without acting on yet, write them into the Research note only. No todo, no handoff. The Research note serves as a future search target. This is the escape hatch, not a default — prefer B or C for any finding concrete enough to have a file anchor.

**Discovery briefs — de-prioritized.**
Earlier iterations offered a "discovery brief" shape for findings that needed architectural analysis before implementation. Run 2 wrote one; run 3's candidate was descoped; run 6's candidate was converted into a theoretical-scaffolding handoff (Option C) instead. Pattern: users prefer concrete plans (even stubs) over pure analysis documents. **Do NOT propose a discovery brief as a first-class option.** If a finding seems to need one, first ask whether it can be expressed as Option C (scaffolding) — that captures the architectural intent in compilable code. Only write a discovery brief as a last resort when there's genuinely nothing code-shaped to scaffold (e.g. a pure product-direction question). If written, place it beside the handoffs.

### Template bucket
Auto-invoke the catalog command the overlay's `## Buckets` names for B, with a pre-filled description derived from the finding's title + summary + recommended services. Pass the description as the first user message so the user doesn't have to retype it.

### Credential bucket
Auto-invoke the command the overlay names for C, with the service name pre-filled.

### Combo bucket
If both B and C are flagged, run C's command first, then B's. Confirm with the user before chaining.

For each declined finding (in the user's reply or by omission), record the number for Phase 10.

---

## Phase 9: Persist to Obsidian Research Note

Write `$VAULT/Research/{YYYY-MM-DD}-{slug}.md`.

Where `{slug}` is derived from the source: video title, article title, or first 4 words of raw text. kebab-case, max 40 chars.

### 9a. Duplicate defense (before writing)

The vault has dozens of prior Research notes; the same idea often arrives via multiple sources (e.g. two videos covering the same Claude Code release). Before writing, **Grep the vault's `Research/` and `Lessons/` folders for each surviving idea's key terms** (tool name, technique name, distinctive phrase — 1 grep with alternation is enough). For each hit, skim the matching note's frontmatter/headings:

- **Same idea, previously accepted/actioned** → do NOT re-present it as new. Record it in this run's note as a one-liner under `## Prior art` with a wikilink (`covered in [[2026-04-15-claude-code-routines]] — accepted, no delta`) and count it with the `already_existed` catches in Phase 11.
- **Same idea, previously declined/descoped** → surface the prior decision in Phase 7 ("previously declined in [[note]] because X — reconsider?") instead of presenting it fresh. (Phase 3's `descoped-reopenable.md` check covers the tracked subset; this grep catches the untracked rest.)
- **Related but with a real delta** → keep the finding, and add the wikilink under `## Cross-references` naming the delta.

Ideally run this check before Phase 7 (so the presentation is already deduplicated); at the latest, run it here before the note is written. Never write two vault notes that restate the same idea without linking each other.

Frontmatter + body:
```markdown
---
date: 2026-04-07
source_type: youtube|article|text
source_url: <url or "pasted">
source_title: "<video/article title>"
focus: all|code|templates|credentials
total_extracted: 12
total_after_relevance: 7
accepted: [1, 3, 4]
declined: [2, 5, 6, 7]
buckets: { code: 4, template: 2, credential: 1 }
web_augmentations:        # Phase 2.5 - omit if phase did not run
  - { name: "ToolName", url: "https://...", kind: "tool" }
---

# {Source title}

**Source:** [{title}]({url})
**Run:** {timestamp}

## Summary
{2-3 sentence overview of what this source covered}

## Extracted Ideas

### [1] {title}  ✅ accepted -> {action taken}
**Bucket:** code
**Source anchor:** "{quote}" / [HH:MM:SS]
**Evidence:** `src/foo/bar.ts:42`
**Notes:** {anything from triage}

### [2] {title}  ❌ declined
**Bucket:** template
**Source anchor:** ...
**Evidence:** ...
**Decline reason:** _to be filled in Phase 10_

...

## Cross-references
- Related patterns: [[Patterns/user-preferences]]
- Prior runs touching same area: {wikilinks to other Research notes if any}
```

---

## Phase 10: Self-Reflection (the learning loop)

This phase makes the skill smarter over time. Do not skip it.

### 10a. Ask why

For declined findings, ask the user **once**, in a single batched question:
```
Help me improve. For these declined items, why did you skip them?

  [2] {title}
  [5] {title}
  [6] {title}
  [7] {title}

You can answer per-item ("2: too vague, 5: already planned") or with a
single reason that covers all of them. Type "skip" to move on.
```

If the user types `skip`, jump to 10c.

### 10b. Append to Lessons

Write/append to `$VAULT/Lessons/{YYYY-MM-DD}-research.md` (Edit-append, never Write-replace — shared-by-date file, see the 2026-04-14 iteration-log entry).

**Write it LATE, and re-read before the Phase 11 summary.** Following the Edit-append rule
protects other sessions from you; it does not protect you from them. On 2026-08-13 a
concurrent session `Write`-replaced this file mid-run and erased a block that had been
correctly Edit-appended minutes earlier. Recovery was only possible because the loss
surfaced in the same turn and the content was still in context. Two mitigations, both
cheap: (a) write this block as late in the run as it can go, so the exposure window is
short; (b) before printing the Phase 11 summary, re-read the Lessons file and confirm your
block is still present — restore it by Edit-append (never Write, which would repeat the
offense in the other direction) if it is gone.
```markdown
## Run: {timestamp} - {source title}

Source: {url}
Accepted: [1, 3, 4]
Declined: [2, 5, 6, 7]

### Decline reasons
- [2] {reason}
- [5] {reason}
- [6] {reason}
- [7] {reason}

### Self-reflection
- What I extracted that resonated: {pattern}
- What I extracted that didn't: {pattern}
- Tools I should use more / less next time: {observation}
```

The "Self-reflection" block is your own assessment — not the user's — written as a brief note about what worked in this run vs. what didn't.

### 10c. Update Research note

Backfill the Research note from Phase 9 with the decline reasons.

### 10d. Pattern promotion check

Read all files in `Lessons/` and look for repeated decline reasons:
- If the same reason (or close synonym) has appeared in **3+** runs, propose adding it to `Patterns/user-preferences.md`.
- Show the proposed pattern to the user and ask: "I've seen this 3+ times — promote to permanent rule?"
- If yes, append to `Patterns/user-preferences.md` as a new bullet with date and source-run links.

### 10e. Architecture-digest update check

Did this run discover a **structural fact about the codebase** that future runs would need to know? Examples:
- A misreading the user corrected (e.g. catalog vs runtime distinction)
- A plugin or module the skill didn't know existed (e.g. a separate cloud client, a dev-tools plugin)
- An architectural boundary that determines where findings should be routed (e.g. framework vs plugin)
- A security model invariant that affects threat assessment

If yes, **edit the architecture digest** (the overlay's first `## Context sources` entry; with no overlay, the repo's rules file) with the new fact. Tag the addition with the run date and source so the iteration log can reference it. Prefer a hand-curated file no generator rewrites — an edit to a regenerated file is erased on the next scan; if the only available target IS regenerated, put the fact in the overlay's `## Domain notes` instead, where it is durable.

If no, skip this step.

This step exists because runs 2 and 3 both discovered structural facts the skill needed but didn't have. The pattern: a finding gets misframed, the user corrects, the correction is broader than just "this run was wrong" — it's a fact every future run needs to know. Capturing it durably prevents the same misframe in run N+1.

### 10f. Descoped-but-reopenable tracking

For each finding that was descoped (not declined, not accepted — descoped because of an external blocker like a hard technical problem, a missing dependency, or an unavailable product), record it in `$VAULT/Patterns/descoped-reopenable.md`. This is a separate file from `Patterns/user-preferences.md` — user preferences are permanent rules; descoped-reopenable entries are conditional waits.

File format (create if missing):

```markdown
# Descoped-But-Reopenable Findings

Findings that were descoped due to an external blocker but may become viable
later when the blocker clears. Phase 3 of future runs reads this file and
surfaces any matching items as "previously descoped, reconsider?" candidates.

## Entries

### {YYYY-MM-DD} - {finding title}
- **Source run:** {research note wikilink, e.g. [[2026-04-08-paperclip-hire-agents]]}
- **Original descope reason:** {verbatim quote from the user or self-assessment}
- **Blocker:** {what needs to change for this to become viable}
- **Reconsider trigger:** {concrete signal to watch for - e.g. "vendor ships X feature", "this product adds Y capability", "OSS project Z hits 1.0"}
- **Related findings:** {wikilinks to any related Research notes}
```

**When to add an entry:** if during Phase 8 the user descopes a finding AND the decline reason names a specific external blocker (not "no business need" or "too niche" — those are permanent rejections). The trigger for adding an entry is a phrase like *"come back when..."*, *"we can't do this until..."*, *"the platform doesn't support this yet..."*, or a technical problem the user explicitly acknowledges as unsolved.

**When NOT to add:** descopes based on priority ("not now"), scope ("too big"), or permanent preference ("we don't like this pattern"). Those belong in Lessons or user-preferences.

**Example from run 4 / run 6:** Paperclip run 4 surfaced "maximizer mode" (run-until-done semantics) which was descoped because of the goal-verification problem. Run 6 (Claude Managed Agents) observed that Anthropic solved the same problem externally. A properly-tracked descoped-reopenable entry from run 4 would have flagged this in run 6's Phase 3 automatically. **Write the entry now even if the blocker never clears — the cost of an unused entry is small; the cost of missing a reopen opportunity is a silently-missed finding.**

**Cross-check on future runs (Phase 3):** when reading `descoped-reopenable.md`, check each entry's "Reconsider trigger" against the current source. If the source describes a solution to the blocker, surface the entry in Phase 7 as a revived candidate next to the new findings.

**Cleanup:** when a descoped-reopenable entry is eventually accepted and actioned in a future run, remove it from the file (or move it to a "resolved" section at the bottom with the run date and handoff path). Don't let the file grow indefinitely.

---

## Phase 11: Final Summary

Print:
```
Research run complete.

  Source:       {title} ({source_type})
  Extracted:    {N} ideas
  After filter: {M} relevant
  Accepted:     {K} ({list})
  Declined:     {L} ({list})

  Already existed:  {A} (caught by host-first rule - see list)
  Descoped-reopenable: {D} (tracked in Patterns/descoped-reopenable.md)

  Actions taken:
    - bucket-B command invoked: {N} times ({names})
    - bucket-C command invoked: {N} times ({names})
    - Implementation plan handoffs written: {N} ({paths})
    - Theoretical scaffolding handoffs written: {N} ({paths})
    - /gsd:add-todo invoked: {N} times
    - Findings logged for later: {N} (in Obsidian Research note only)

  Already-existed catches:
    {for each catch, one line: "{candidate title} -> already at {file:line}"}
    {if none: "none"}

  Files updated:
    + $VAULT/Research/{date}-{slug}.md
    + $VAULT/Lessons/{date}-research.md
    {if handoff plan written:}
    + {handoff path}
    {if pattern promoted:}
    ~ $VAULT/Patterns/user-preferences.md
    {if descoped-reopenable entry added:}
    ~ $VAULT/Patterns/descoped-reopenable.md
    {if the architecture digest was updated in Phase 10e:}
    ~ {digest path}

  Source-type yield:  {expected vs actual for this source type - see Phase 3 calibration table}
  Snapshot freshness: {fresh | stale by N commits - consider /refresh-context}
  Cache:              {cleaned | n/a (Phase 2b/c source) | residue at .research-cache/<id>.* - see Lessons cache_cleanup_skipped note}
  Commit: {filled in by Phase 13 - short SHA + subject, or skip reason}
```

**Surface `already_existed` prominently when the finding count is low.** A product demo run that extracts 2 findings + 8 catches is a high-yield run — frame it that way. Do not let the user read "only 2 findings" as a failure when the real output is "8 existing features confirmed + 2 real gaps found".

---

## Phase 12: Release Log Update ("What's New") — optional

**Skip this phase entirely unless the overlay declares a `## Release log`** — say
"no release log configured, skipping Phase 12" once and move on. The section names
the surface: a structural config file, a content directory, the locale set, and the
key shape items live under. Also skip if zero findings were accepted in Phase 8 —
there is nothing to log.

Where a repo has one, this is what makes the work visible to future-you, to other
contributors opening the app, and — most importantly — to **the actual users**, who
read these strings as news, not engineering logs.

**Critical rule before you start writing anything:** the release log is
**user-facing news**, NOT an internal changelog. The repo law's voice rules for
user-facing copy apply to every word you write here. If you find yourself typing a
file path, a struct name, an env var, or a planning-doc reference, you have already
failed — go back and rewrite as impact + benefit.

### 12a. Read the release config

Read the structural config file the overlay names. Identify:
- `config.active` — the version that the in-app view opens by default
- the matching release object inside `config.releases`
- how many items it already contains
- the highest existing item id in that release (for ID generation)

If the file is missing or unparseable, warn (`release log not found, skipping
Phase 12`) and stop. Do **not** create the file from scratch — its existence
is a project-level decision, not the skill's call.

### 12b. Locate the content folder

Read the directory listing of the content directory the overlay names. It should
hold one file per locale the overlay lists, plus whatever accessor the surface
uses. Read the English file to learn the namespace shape — the overlay's key
shape says where items live and which keys each carries (typically `title` and
`description`).

If any declared locale file is missing, warn loudly:
```
Locale file for {lang} is missing - refusing to write a partial set.
A view that loads copy by direct property access crashes on a missing key.
Restore the file or skip Phase 12.
```

### 12c. Ask the user

Print:
```
Add accepted findings to the release log?
Active release: {version} - currently {N} item(s).

Reply with numbers from the accepted list (e.g., "1, 3"), "all", or "none".
```

Use the **same numbering** as the Phase 7 summary table so the user does not
have to re-translate. Only accepted findings are eligible — declined ones are
implicitly excluded.

If the user replies `none` (or empty), skip to Phase 12g (still confirm
"unchanged" in the summary).

### 12d. Build structural items for the config file

For each chosen finding, build the structural metadata only:

```json
{
  "id": "{next-numeric-id}",
  "type": "{inferred type}",
  "status": "completed",
  "added_at": "{today YYYY-MM-DD}"
}
```

**No `title`, `description`, `summary`, `label`, or `source` fields.** Those
are user-facing strings that live in the locale files, not in the config. The
config is structural metadata only — versions, types, statuses, dates, ids.

**Type inference rules** (in order — first match wins):
1. Finding was escalated to severity `CRITICAL` by the Phase 6 security
   escalation rule → `"security"`
2. Finding's bucket is `code` AND title/summary clearly describes a bug fix
   (keywords: "fix", "bug", "regression", "incorrect", "leak") → `"fix"`
3. Finding introduces a backwards-incompatible change (keywords: "breaking",
   "remove", "rename", "drop column") → `"breaking"`
4. Finding adds documentation only → `"docs"`
5. Otherwise → `"feature"`

**Item ID convention**: simple incrementing strings — find the highest
existing numeric id in `release.items` (`"1", "2", "3", ...`) and increment.
If no items exist yet, start at `"1"`. The id is what links the JSON
structural entry to its i18n content.

Append the new items to the **end** of `release.items` so they appear last
within their type group in the UI (the changelog view groups by type but
keeps within-type ordering stable).

### 12e. Build user-facing content for the i18n files

For each chosen finding, draft a `{ title, description }` pair in **English**
following the user-facing-news voice:

- **Title (≤ 8 words):** lead with the user benefit. Imperative or noun
  phrase, NOT a technical summary. Examples:
  - ❌ "Add Bearer token middleware to /api routes"
  - ✅ "Safer access for the desktop app"
  - ❌ "Implement A2A JSON-RPC handler"
  - ✅ "Open your agents to other AI tools"
- **Description (1-3 short sentences):** explain what the user can now do
  and why they would care. NO file paths, NO module names, NO version-bump
  details, NO planning-doc references, NO implementation jargon. Examples:
  - ❌ "Adds external_api_keys table, Bearer token middleware on the
       management HTTP API, gateway_exposure column on the agent table..."
  - ✅ "Your agents can now talk to other AI tools through a shared protocol.
       Pick exactly which agents you want to share, and protect them with
       access keys you control — your private agents stay private by
       default."

**The translation test:** read your draft and ask "would a non-developer
who has never seen the codebase understand this and care about it?". If the
answer is no, rewrite.

### 12f. Write content to EVERY declared locale file

This is the repo law's i18n contract: every key in the English file must exist
in every other locale file. Skipping any file breaks the UI for that language
at runtime.

For each new item, for each declared locale file:

1. Read the file.
2. Locate the items object for the active version, at the key shape the overlay
   gives. (If the release itself is new, you also need to add its entry with a
   `label`, a `summary`, and an empty items object. Use the version string as the
   default label, and a one-line summary.)
3. Append the new item id with the English `title` + `description` pair you
   drafted in 12e.
4. For non-English locale files, ALSO ensure the file has a top-of-file
   `TODO(i18n-{lang}): translate from English placeholders` marker in that
   file's own comment syntax. If the marker is already there, leave it. If it's
   missing, add it.
5. Write the file back, preserving the file's existing indentation and field
   ordering.

**Do not attempt to translate the strings yourself.** Write English
everywhere. The TODO marker is the signal that human translation is pending.

**Validate before writing:** after building the new content for every locale
file in memory, double-check that:
- Every file gets the same set of new keys
- The id exists in the config AND in every locale file's items map
- No locale file has been skipped

### 12g. Write the config back

Write the updated config with:
- The file's existing indentation
- Trailing newline
- Field ordering inside each item (`id, type, status, priority, sort_order,
  added_at`) for diff-friendliness

### 12h. Confirm

Confirm with a one-line print:
```
Release log updated: {N} item(s) added to {version}.
  - {config file} (structural)
  - {L} locale files (English content + TODO markers preserved)
```

If the user replied `none`, print:
```
Release log unchanged.
```

### 12i. Add to the Phase 11 summary footer

Append a `Release log:` line to the existing Phase 11 printout (re-print
the summary so it stays canonical):

```
  Release log: {N} item(s) added to {version} (en + {L-1} locale placeholders)
                | unchanged
```

---

## Phase 13: Atomic Commit (MANDATORY — prevents merge loss)

**Why this phase exists**: On 2026-04-11, a merge without recovery options wiped out an entire research session's worth of code — Task Runner depth presets, DevProject monitoring fields, event registry entries, TaskOutputPanel markdown toggle, and more. The fixes had to be manually recreated from the conversation transcript because no commit had captured them. **Never again.** Each research run commits its own output at the end, so git is the recovery mechanism when anything else fails.

This phase runs at the very end of a research session after Phases 10–12 have completed. It is **non-negotiable** except in the two explicit skip conditions below.

### 13a. Determine if there are changes to commit

Run `git status --porcelain` to see uncommitted changes. If the output is **empty**, skip Phase 13 entirely and print `No changes to commit.` in the final summary. This covers the "accepted: none" branch where nothing was actioned.

### 13b. Review what will be committed

Run `git status` and `git diff --stat` to see the full set of changes. The user will see this output as part of the skill flow. **Look for unexpected files** — anything outside the expected scope should raise a warning:

- **Expected scope for a research run:**
  - Any files touched by accepted Phase 8 findings (if the user chose Option B/C and the implementation already happened in the same session, or if the user told the skill to "implement right away")
  - The handoff path (if a handoff was written)
  - The release-log config + every declared locale file (if Phase 12 ran)
  - A vault that lives **outside the repo** should NOT appear in git status; a fallback vault inside the repo should be git-ignored, and if it shows up in `git status` say so
- **Unexpected files that warrant a pause:**
  - Dependency directories, build output, caches
  - `.env`, `credentials.json`, anything that looks like secrets
  - Files from feature areas completely unrelated to any accepted finding (suggests stale edits from a different session)

If unexpected files are present, **print them to the user and ask** whether to include them in the commit or leave them uncommitted. Don't auto-include anything suspicious.

### 13c. Stage only the in-scope files

Use **explicit `git add <path>` per file**, NOT `git add -A` or `git add .`. This avoids accidentally staging secrets or unrelated drift. Build the file list from:

1. The handoff path (if Phase 8 Option B/C ran)
2. The files edited by an in-session implementation (if the user said "implement right away")
3. The release-log config + every declared locale file (if Phase 12 ran)
4. Any new files created during the run

**A file that was already dirty before you touched it is not yours to `git add`.** In a checkout
shared with other sessions, the files a research run most often needs — a changelog, a census
`rules.json`, a feature doc — are exactly the ones a sibling is mid-edit in, and `git add <path>`
stages the *whole working file*, sweeping their hunks under your message. The isolated index protects
you from their `git add`; it does nothing for a file both of you edit. Run 2026-08-25 hit this on
three files in three commits and used this shape each time, inside the single-invocation ritual:

```bash
git show HEAD:<path> > base          # the committed version
# re-apply ONLY your change to `base` programmatically - a JSON push, a string
# replace, a line splice - the same edit you made to the working copy
BLOB=$(git hash-object -w mine)
GIT_INDEX_FILE="$IDX" git update-index --cacheinfo "100644,$BLOB,<path>"
```

The working copy keeps both edits for the sibling's own commit; yours carries exactly your hunk.
Keep the edit as a small script so it can run twice (working copy now, HEAD copy at commit time),
and assert the anchor matches exactly once. Verify afterwards with `git diff --stat -- <path>`: only
the sibling's lines should still be pending.

### 13d. Write the commit message

Use this exact template via HEREDOC so multi-line formatting is preserved:

```bash
git commit -m "$(cat <<'EOF'
research: {short-title-of-source}

Source: {url-or-pasted}
Accepted: {N} finding(s) ({comma-separated-titles})

{optional 1-2 line summary of what was implemented or handed off}

{if handoff written:}
Handoff: {handoff path}

{if a catalog command ran:}
Catalog: {command} {names}

{if Phase 12 ran:}
Release log: {N} item(s) added to {version}

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
EOF
)"
```

**Rules for the commit message:**
- First line prefix **must be `research:`** — this identifies research-run commits in `git log` and makes them easy to filter
- Short title = the source video/article title trimmed to ≤50 chars, lowercased
- **Never include file paths** in the commit body — those are in `git diff`; the message is about *why*
- **Never use `--no-verify`** — let pre-commit hooks run. If a hook fails, fix the issue, re-stage, and create a NEW commit (never `--amend`)
- **Never skip signing** — the Co-Authored-By line is required

### 13e. Handle commit failure

If the commit fails (pre-commit hook rejection, lint errors introduced by an in-session implementation, etc.):

1. Print the failure reason to the user
2. Do NOT retry with `--no-verify`
3. If the failure is fixable (e.g., TypeScript error in a file the skill wrote), **fix it inline** and create a new commit with the same message
4. If the failure is NOT fixable in the current session (e.g., hook requires manual intervention), print:
   ```
   ⚠️ Commit failed. Changes are staged but NOT committed.
   Research outputs are safe in the vault, but code changes
   are vulnerable to merge loss until you commit manually.
   Run: git commit --message "research: <title>"
   ```
5. Still write the Research note — never sacrifice the learning loop because of a commit failure

### 13f. Skip conditions

Phase 13 has exactly **two** skip conditions. Everything else is non-negotiable.

**Skip 1 — No changes:** Phase 13a found an empty `git status --porcelain`. Nothing to commit. Print `No changes to commit.` and move on.

**Skip 2 — User explicitly opts out:** The user typed one of `--no-commit`, `no commit`, or `skip commit` in the original `/research` invocation OR as a response to Phase 8 triage. In this case, print:
```
⚠️ Skipping commit per user request.
Changes are uncommitted and vulnerable to merge loss until you commit manually.
```

**NOT a skip condition:** "I'll commit manually later." Do not take the user's word for this — the whole point of Phase 13 is to make the commit happen in-session before context is lost. If the user expresses this preference, gently remind them that "later" turned into "lost work" on 2026-04-11, and ask again whether to commit now.

### 13g. Update the Phase 11 summary

Append a `Commit:` line to the final printout (re-print the summary so it stays canonical):

```
  Commit: {short-sha} - research: {short-title}
           | skipped (no changes)
           | skipped (user opted out)
           | ⚠️ commit failed - see above
```

This gives the user one line to verify the whole run is safely captured in git before they close the session.

### 13h. Deregister from the Active-Runs Ledger

Run the script — it finds your entry, rewrites its status and moves it under
`## Recently completed` in one call:

```bash
{active_runs_script} complete --slug <slug> --status "completed (commit: <short-sha>)"
```

`--status` is one of:

- `completed (commit: <short-sha>)` — Phase 13 successfully committed.
- `aborted (skip 1: no changes)` — Phase 13a found no changes.
- `aborted (skip 2: user opted out)` — Phase 13f skip 2 fired.
- `aborted (commit failed — see Phase 13e)` — commit failed and was not recovered in this session.

If your edit to the ledger happens AFTER Phase 13's commit, that's fine — the ledger update lands as an uncommitted file in the working tree, ready to be committed by the next session that ships work. (This avoids a chicken-and-egg of "needing to commit the deregister before the commit it references exists".)

A ledger script's `doctor` subcommand, where the repo has one, reports structural damage — duplicate `## Active`
sections, entries past the 14-day window, and runs still marked `started` that nobody
closed. It only reports; trimming stays a human call, because other sessions are reading
this file live.

If your run aborted before reaching Phase 13 (e.g., the user terminated mid-run), your `## Active` entry stays — the next session reads it as stale (>2h old) and surfaces it to its user. That's the recovery path; don't try to write a deregister from a half-finished state.

---

## Error Handling

| Failure | Response |
|---|---|
| No context source resolves | Continue. Say the run is scoring provisionally from the repo's own structure, and that Phase 6 evidence is the only real score. |
| `yt-dlp` missing | Stop with install instructions. |
| YouTube has no auto-subs | Ask for manual transcript paste or alternate source. |
| `WebFetch` returns paywall / 403 | Ask user to paste the article text. |
| Source text <300 words | Report insufficient content. Stop. |
| Fewer than 2 ideas survive Phase 4 | Report "no relevant ideas found in this source for this project." Still write a stub Research note so the source isn't re-harvested. |
| Obsidian vault path missing | Run Phase 0 bootstrap, don't fail. |
| A catalog command invocation fails | Report which one, save its description into the Research note as "deferred", continue. |
| The release-log config is missing or unparseable | Print `release log not found, skipping Phase 12` and stop the phase. Do NOT auto-create the file. |
| Phase 13 commit fails (pre-commit hook, lint, etc.) | Try to fix inline and re-commit. If unfixable, print the warning from Phase 13e and leave changes staged. Never use `--no-verify`. |
| Phase 13 detects unexpected files in `git status` | Ask the user before staging. Never auto-include suspicious paths (`node_modules/`, `.env`, `target/`, etc.). |

---

## Safety Rules

- **Never auto-edit source code outside an accepted finding.** Everything else goes to the Research note for human review.
- **Never** invoke a catalog command without explicit user acceptance in Phase 8.
- **Never** skip Phase 10 unless the user typed `skip` — the learning loop is the whole point.
- The Obsidian vault is the source of truth for memory between runs. Do not duplicate this data into other locations.
- **Phase 12 is the only place** the skill writes to the release-log config or its locale files. Never touch them from any other phase. Never write items the user did not explicitly accept in Phase 8 → Phase 12c.
- **Never hardcode a user-facing string into a component** where the repo law routes strings through a locale catalog: every such string lands in every locale in the same change. If a Phase 8 handoff plan would touch user-facing code, its "Cross-cutting concerns" section MUST instruct the implementing session to follow that contract (English first, then placeholders + TODO markers in the rest).
- **Never put technical jargon in user-facing copy.** Release notes are news, not engineering logs. Apply the repo law's voice rules in Phase 12e *before* writing anything.
- **Phase 13 is mandatory.** Every research run ends with a commit unless there are no changes OR the user explicitly opted out. "I'll commit manually later" is not a valid skip reason — on 2026-04-11 "later" became "lost work from a bad merge". Git is the recovery mechanism.
- **Phase 13 stages files explicitly.** Never `git add -A` / `git add .` — always `git add <path>` per file to avoid sweeping up secrets or drift from other sessions.
- **Phase 13 never bypasses hooks.** No `--no-verify`, no `--no-gpg-sign`. If a pre-commit hook fails, fix the underlying issue and create a new commit.
- **Phase 2a cache cleanup is mandatory.** The `.research-cache/<id>.*` files are per-run scratch; delete them as soon as the cleaned text is in working memory (see Phase 2a). Do NOT defer to end-of-run — a mid-run failure leaves them behind. Scope the `rm` strictly to this run's id; never sweep the whole directory blindly (collides with parallel runs). Phase 11 must report `Cache: cleaned` (or the residue path) so the user has a verification signal. The 2026-05-01 maintenance commit hardening this rule was prompted by ~20 stray cache files accumulating across prior runs that all silently skipped this step.

---

## Skill Iteration Log

Moved to **[`ITERATION-LOG.md`](./ITERATION-LOG.md)** (sibling file, same directory).
It records *why* each non-obvious rule exists — read it before deleting a rule that
looks redundant, and append to it when Phase 10 produces a new one. It is not loaded
with this file; open it on demand.
---

<!-- clause: knowledge-sync v1 - stamped by scripts/apply-skill-clauses.mjs from docs/skill-clauses/knowledge-sync.md; edit the template, then re-stamp -->
## Knowledge sync

This skill proposes and executes backlog items. Every item it proposes is judged against the standard this repo subscribes to, so a run moves the codebase toward the registry's golden paths and sends back what it learned - not toward a private notion of "better" that the next skill will undo.

**Subscription** - read once at the start of the run; degrade honestly, never invent a standard:
- `.ai/manifest.yaml` -> `registry.local` (default `../ai-registry`; `$AI_REGISTRY_DIR` wins) and `knowledge.domains` (the bundles this repo consumes - `software-engineering` for code, plus whatever else it declares). No registry declared -> skip this section and say `registry: none` in the run header.
- `.ai/registry-map.json` - the join between this repo's contexts and the bundle's subjects, with a per-pair state (`unknown` / `conformant` / `deviation` / `not-applicable`) that `/conform` fills in over time. Missing while `context-map.json` exists -> build it once, `node <registry>/scripts/build-registry-map.mjs --project <slug>`, and commit it: the map is the repo's subscription to the paths, and it is how a path improved for another project reaches this one. Missing both -> resolve through `<registry>/knowledge/<domain>/index.json` and say `registry: declared, unmapped`.
- The always-on rules `.claude/rules/ai-registry-*.md` carry the subject map. They orient; they do not replace the read below.

**Read before you propose.** For each context in scope, take its subjects from the map and read the golden path (`subjects[<slug>].file`, verbatim from the index - never a path built from a slug; bundles are nested) plus the techniques whose `use_when` matches what you are about to decide. Then every backlog item you emit names the technique it serves or violates - `standard: <subject>/<technique>` - or `standard: none` when nothing governs it. A pair the map already marks `deviation` is a pre-approved item with its fix described; a pair marked `conformant` is a regression guard on anything you change there. A deviation is a finding: never lower the standard to fit the code, and never present a technique's number as a rule - the technique carries the rule, the application carries the measurement.

**Log the read** - one line per context, append-only, gitignored, to `.ai/consults.jsonl`: `{"ts":"<ISO>","bundle":"<domain>","subjects":["<slug>"],"techniques":["<slug>"],"deviations":<n>}`, where `deviations` counts the items this run raised that a technique explicitly names. Bare slugs, never paths. The registry's `signals-collect.mjs` folds these into `signals/` as counts only; it is the only way the corpus learns which paths are load-bearing and which are decoration.

**Send back what a LANDED fix taught.** When a change you made and verified generalizes past this repo - a rule that would transplant to an unrelated team, a case where a technique's rule broke against real code, or a place this repo does it BETTER than the golden path - append one line to `.ai/registry-leads.jsonl`: `{"ts":"<ISO>","bundle":"<domain>","nearest":"<subject-slug or null>","kind":"technique|application|subject","claim":"<when X, do Y, because Z - one sentence>","because":"<what this run measured or broke and fixed>","confidence":"low|medium|high","from":"research@<version>"}`. Earned only: it came from code you changed, not from a fix you proposed. A lead ORIGINATES a finding and never authorizes one - nothing here edits a bundle; the registry's `leads-collect.mjs` -> `librarian/inbox.md` -> `/intake` decides what survives. Say in the report that you filed one, and say plainly when you filed none. Verdicts on a pair's state belong to `/conform`: close by naming the contexts you touched so it can re-judge them.
<!-- /clause: knowledge-sync -->

<!-- clause: skill-reflection v2 - stamped by scripts/apply-skill-clauses.mjs from docs/skill-clauses/skill-reflection.md; edit the template, then re-stamp -->
## Skill Reflection

After the run's real work is done, reflect - autonomously, without asking the user. Be honest about volume: most runs produce NOTHING beyond lane 1. An empty reflection is a valid result; a forced lesson is pollution. Calibration: nothing (common) / one line (sometimes) / a lesson entry (occasionally) / a redesign proposal (rare).

**Lane 1 - PROJECT learnings** (what the next session in THIS repo needs). Repo-specific rules go to this skill's overlay in the consuming repo - a dated one-liner under `## Skill improvement log` in `.claude/research/config.md`, or in the overlay/vault location this skill's `## Project overlay` section names (create the heading on first use). When the repo carries a `.personas/` directory, also write via the MEMORY BLOCK contract if this prompt carries one, else append node lines to `.personas/memory-outbox.jsonl` per that contract. Never into this file: a project's bytes in a shared method are exactly what made the fleet's copies diverge.

**Lane 2 - METHOD learnings** (what would improve THIS SKILL for every project):
1. If nothing generalizes beyond this repo, stop here.
2. Append to `LESSONS.md` in this skill's directory: `## <version-used> - <YYYY-MM-DD> - <project-name>` followed by `- ` bullets (create the file with a `# Lessons - research` heading if absent). Record the version the run USED, not a bump target. Wrap a bullet in a `### Redesign proposal` sub-block when it argues for a redesign you are NOT applying now. A lesson alone needs no version bump.
3. Edit `SKILL.md` only together with a version bump, and bump only with an applied edit: patch for wording, minor for a step/prompt refinement, major for a methodic redesign. Update the `version:` frontmatter. Never edit inside a stamped `<!-- clause: ... -->` block: that text is shared by every skill in the lane and is changed in the registry's `docs/skill-clauses/` and re-stamped with `node <registry>/scripts/apply-skill-clauses.mjs`.
4. Where the edit lands: THE SKILL DIRECTORY IS A LINK INTO THE REGISTRY. `.claude/skills/research` in a consuming repo is a symlink to `<registry>/skills/research` (registry root = `registry.local` in `.ai/manifest.yaml`, default `../ai-registry`; `$AI_REGISTRY_DIR` wins). Editing it edits the one file every project runs, so there is nothing to propagate. Commit it IN THE REGISTRY checkout as a standalone commit containing only this skill's files: run `node <registry>/scripts/check-skills.mjs --since HEAD` first (shape + version discipline must pass), then `git -C <registry> add skills/research` and `git -C <registry> commit -m "skill(research): v<new> - <one-line reason>"`. Never stage the link from the project side.
5. NEVER copy this skill to `~/.claude/skills/research/` or into another repo, and never "propagate" by copying. A copy in the personal tier shadows the lane for every project on the machine and freezes the method at that day's bytes with no version to compare (measured 2026-08-29: 11 such copies, all unversioned, all stale). If `.claude/skills/research` is a real directory instead of a link, the fix is `node <registry>/scripts/link-registry.mjs`, not a copy in either direction.

**Lane 3 - DOMAIN knowledge** is a different artifact from a lesson: a lesson improves this METHOD, a lead proposes knowledge for a bundle. Skills that carry a `## Knowledge sync` section file leads there; a skill without one files none.
<!-- /clause: skill-reflection -->
