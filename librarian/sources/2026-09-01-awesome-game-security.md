---
source: github:gmh5225/awesome-game-security
kind: reference-index (hybrid — wrapped in an LLM-maintained curation pipeline read as a practitioner build in repo form)
url: https://github.com/gmh5225/awesome-game-security
title: awesome-game-security
author: gmh5225 (curator) + an agent pipeline (Cursor SDK) for descriptions, translations, archives, discovery and a compiled wiki
commit: 36d01f8d4f41f529d57bd6e1b644c9e407b50cf5 (2026-09-01)
words: 30,704 README (landing page) / ~381,000 in-tree markdown (wiki overviews alone: 205,000) / 10,851 lines of scripts + workflows / 34,045 words of agent skills
refs_found: 4,058          # every unique URL across all markdown, normalized
refs_distinct: 4,017       # in README; 3,871 code-host repos, 129 other hosts, 41 more elsewhere in the tree
refs_ranked: 41            # at README-SECTION granularity, not per reference — see "Why no waves"
refs_read: 0
waves: 0
refs_untriaged: 4,017
fetches: 0
extracted: 12
accepted: 1
applied: 1
shipped: 1
declined: 0
leads: 4
already_covered: 4
untriaged: 6
dispatched: 0
run_id: intake-game-security
siblings: 2 live at claim (an intake on a vendor repository holding docs-sync, test-harness, error-handling, agent-memory; a librarian inbox-triage), 3 by landing; none on quality-gates
rescan_condition: when `wiki/log.md` carries its first `lint` or `skill-sync` entry (the starved modes finally ran), or when `scripts/update-wiki-cli.py` gains a check that reads a page's length, or 2026-12-01 — whichever first
---

# awesome-game-security — the list is a bibliography; the pipeline around it is the source

## Class, and the yield said out loud

Two halves with opposite reliability. The **README is a reference index** in the
purest form this method has met: 30,704 words, 4,017 unique links, 3,871 of them
repositories, a one-line annotation per row, 41 sections whose two largest ("Cheat"
2,792, "Anti Cheat" 727) are the curator's stated boundary — offence and defence in one
list. It authorises nothing about itself except that boundary. The **rest of the tree
is a practitioner build**: ten Python instruments and nine workflows that discover
repositories (two independent LLM passes plus a script gate), fork-and-flatten every
listed repository into `archive/`, summarise the first 200 KB of each flattened archive
into a description, translate it, and compile a wiki from the descriptions on a 30-minute
cron. That half is first-party and executable, and it was swept as Phase 2b says: the
operating document (`wiki/AGENTS.md`), the instruments (`scripts/*.py`), the measurement
(the wiki's own `log.md` and `.state.json`), the config (workflows), and the README last.

Expected yield stated before triage: from the index itself, one boundary finding and a
lead; from the pipeline half, one or two amendments to gate or vault subjects, because
the corpus already holds the compiled-wiki pattern from a vendor repository mined twice
(2026-08-27, 2026-09-01) and this tree's contribution would be where that pattern is
*measured* rather than described. That is what landed: **one amendment, applied and
shipped; four catches, four leads, six untriaged.**

## Why no waves

The reference-wave lane exists to stop sampling an index by title. It was not run here,
and the reason is recorded so the next pass does not re-derive it. Every domain term the
index carries — `anti-cheat`, `obfuscation`, `reverse engineering`, `kernel driver`,
`bibliography` — returns a **total empty** on concept vocabulary (not product names, so
not the purity gate), and the game-production bundle's seven categories hold no security
subject at all. Under the lane's own weights, every one of 3,871 references scores
`new-subject`, the weight the method says to distrust hardest, with no subject holding
attention points to rank against. A wave would have returned eight `new-subject`
proposals for one subject that is `XL` by construction (a new **category**, per the
taxonomy's placement rule, not a subject beside existing ones). The honest product is
the ranked list at the granularity the corpus can actually rank — the section — and a
lead with a return condition. **Reading 4,017 references to conclude the same sentence
eight times is not breadth; it is the 1.5% failure with a larger budget.**

### The ranked list, section granularity (all unread)

| rank | README section | links | class mix | corpus home | why here |
| --- | --- | --- | --- | --- | --- |
| 1 | Anti Cheat > Detection:* (DMA, AI aimbot, screenshot, page protection) | ~703 | repository, some first-party | none — `new-subject` | the defensive half; the one a game-production consumer would need first; a connected project's achievement pipeline already carries a server-authority "anti-cheat" step |
| 2 | Windows Security Features / Some Tricks (Ring0) | ~141 | repository, primary vendor docs in skills | none | attestation, VBS/HVCI, kernel callbacks — platform primaries the skills cite |
| 3 | Game Engine / Game Develop (SDK dumpers, object models) | ~371 | repository | `engine-integration` neighbourhood | the only band with an adjacent home; read when the engine subjects need internals |
| 4 | Game Network | 29 | repository | none | server authority — the seam the lead names |
| 5 | Cheat (offence) | ~2,792 | repository | none | the offensive half; do not mine into a bundle — see boundary |
| 6 | Mobile Security / emulators / consoles | ~60 | repository | none | out of every managed project's platform |
| 7 | Skills for AI Agents | 6 + 13 primaries | first-party + primary | `agent-instruction-files` | the skills are the curator's own synthesis and cite platform primaries; a re-scan target |
| — | NeverC & NeverD (top of README) | 2 | vendor | — | a sponsored insertion above the list; part of the boundary finding |

## The one finding the index carries: the boundary

The curator's boundary is **offence and defence as one field**, 4:1 by count, plus the
platform layer under both and a sponsored compiler at the top. Ours draws no
game-security boundary at all: game-production's categories are canon, balance,
content, assets, engine integration, craft judgment and governance. The gap is real and
it is a lead, not a landing — a subject whose only corroboration would be this
bibliography's own annotations. Recorded once, here.

## The pipeline half: what the tree measured

The tree records its own failure modes in the artifacts it maintains, which is what makes
this half worth more than the README:

- **`wiki/log.md`: 3,950 `ingest` entries, 1 `bootstrap`, 0 `lint`, 1 `skill-sync`**
  in nine days. The orchestrator's `auto` mode is "ingest if pending else lint"; discovery
  admits 5 never-tracked descriptions per scan against ~7,000 untracked, so `pending` is
  never empty and lint — the only mode whose prompt flags contradictions — has never run.
  Ten empty `---` separators open the log: runs that wrote a separator and no entry.
- **Wikilink integrity is near-perfect anyway**: 3,739 targets, 5 missing (one because
  its filename exceeds the platform path limit), 0 index orphans, 1 dead index entry —
  because every ingest prompt also owns `index.md`. The invariant lint alone guarded
  (contradiction flagging) has zero instances across 3,663 entity pages in a domain made
  of contradictions.
- **The growth**: `AGENTS.md` says "prefer 1–3 screenfuls; split if a page grows past
  ~200 lines". The ingest prompt says "patch at most 2 related overview pages with a short
  cite" and "≤8 wiki files". Overviews: game-hacking 2,728 lines / 65,138 words;
  reverse-engineering 1,352; anti-cheat 1,114; windows-kernel 813; game-engine 731. Only
  dma-attack (153) and overview (162) are under the cap. Index summary lines for
  overviews run to 138 words. No script reads a page's length; the ≤8-file cap is prose
  too (the allow-list check `discard_disallowed` filters paths, not counts).
- **The link checker** treats only 404/451 as dead and everything else (403/429/5xx,
  timeout) as alive, because its action is irreversible — rewrite the citation to the
  curator's own fork; 734 README links already point there. Its schedule is commented
  out; it runs on manual dispatch only.
- **The discovery gate** is a script that admits only `approved ⊆ shortlist ⊆
  candidates`, requires every candidate to appear in an outcome list, checks duplicates
  against HEAD rather than the post-edit tree, and strips any README line the second
  agent added beyond its approved set.
- **The state file** keeps `source_hashes` unbounded, `ingested` as a 500-entry ring,
  and `failed_retry` as an 8-entry ring; an agent exit 0 with no edits marks a source
  consumed until its hash changes.

## Candidates

| # | title | strip | prior art (opened) | read | outcome |
| --- | --- | --- | --- | --- | --- |
| 1 | An artifact cap enforced at the edit reads as compliance | survives | `quality-gates/prose-rule-drift` (full) — owns "rule written, never mechanised" and "instrument nobody invokes", not the converse where a per-edit check produces a true green for the wrong rule | real gap | **content — amendment** "An artifact rule enforced at the edit reads as compliance"; corroborated by the tree's measurement above (13.6x over cap after ~3,950 capped ingests) and by convergence in a connected project (below). Applied `code`/`better`, shipped. |
| 2 | Maintenance behind a never-empty queue never runs | survives | `embedded-db/quiet-window-maintenance` (full) | likely catch → **catch** | § "Defer politely, but not forever" already says deferral needs a policy "or quiet-window maintenance degrades into no maintenance", prescribes a hard bound stated as harm, and names the exact tell: "a maintenance log that only records successes cannot distinguish a healthy store from a scheduler that has been deferring for a month." The source is that sentence measured: 0 lint entries beside 3,950 ingests. `admission-queue/priority-and-fairness` covers the one-origin-owns-the-line half. Recorded as the technique's strongest instance. |
| 3 | Only a confirmed negative may trigger an irreversible link repair | survives | `health-checks/three-state-outcomes` (full) | likely catch → **catch** | "unverifiable → verified" is named as a collapse that is "defensible for gating and poisonous for counting"; the checker collapses it for gating exactly as licensed and counts nothing. The fork-at-admission half (every listed repo mirrored so death has a prepared replacement) is not a technique the corpus holds — lead 3. |
| 4 | Two-pass agent review with a script set-inclusion gate against HEAD | survives | `quality-gates/self-reported-gate-inputs`, `diff-comparison/pair-and-baseline-selection` (use_when only) | partial | **untriaged** — the "diff against the pre-edit baseline, never the working tree, so the agent's additions are exactly the diff" rule may already sit in diff-comparison; not opened. Anchor: `scripts/discover-repos-cli.py` "IMPORTANT: duplicate check must use HEAD, not the post-edit working tree". |
| 5 | A summary of a prefix is a claim about the prefix | survives | `test-harness/gate-scope-is-not-report-scope` (landed by a sibling today) | partial | **untriaged** — description generation reads 200 KB of a flattened archive and writes 3–5 sentences about "the project"; the sibling's technique is about the same scope/report split. Anchor: `generate-descriptions-cli.py` `ARCHIVE_READ_BYTES = 200_000`. |
| 6 | Exit-0-with-no-edits marks a source consumed | survives | `docs-sync/earned-verification-state` (sibling holds the subject) | partial | **untriaged** — anchor: `update-wiki-cli.py` mode_ingest "Mark ingested only on success: agent OK (even if no edits)". Not opened; docs-sync is held by a live sibling. |
| 7 | Bounded failure memory, unbounded success memory | survives | `agent-memory/decay-and-forgetting` (sibling holds) | thin | **untriaged** — `failed_retry[-8:]` drops the oldest failure silently; `source_hashes` never forgets. Fold into 6 if picked. |
| 8 | Curator boundary: offence + defence as one field | n/a | game-production taxonomy (no security category) | real gap, XL | **lead 1** |
| 9 | Skill ⇄ wiki bidirectional derivation with a per-run line cap | survives | `markdown-vault/mirror-indexes` § "Direction is the contract" (full) | likely catch → **catch** | two-way sync needs a base and three-way comparison; the tree has neither and instead caps the back-edge at ~30 lines/run and "only when the wiki has higher confidence". The cap-not-base shape is candidate 1 again from the other side. |
| 10 | Recursion guard forces explicit workflow dispatch | nothing | — | none | **untriaged** — a CI-platform fact; no home unless a fleet project chains workflows. Anchor: `auto-archive-on-push.yml` header comment. |
| 11 | Provenance frontmatter on every page (`sources`, `confidence`) | survives | `engine-pitfall-corpus/provenance-on-every-entry` (not opened) | likely catch | **untriaged** — recorded, not verified. |
| 12 | A resolvable citation to a derived artifact is verifiable and empty | survives | `knowledge-registry/verification-is-contributed` (full), civic `citation-required-per-claim` (full, cross-bundle — cannot link) | partial | **untriaged** — the wiki cites `wiki/sources/descriptions/*.md`, a projection of a generated summary of a prefix of a flattened clone; the tree's own research-rigor skill says "verify every citation resolves" and every one would. `verification-is-contributed` gives resolved/moved/gone and says nothing about *what tier* a resolved pointer lands on; the civic bundle holds the tier rule and cannot be linked. A software-engineering amendment candidate; not corroborated in-run. |

## Convergence that made candidate 1 land

The source supplied the shape; a connected project supplied the second instance without
being looked for. Its instruction file caps each session's append to a shared memory
file at two lines and the file at ~200, in one paragraph. A probe over the file's 59
commits found the append cap obeyed by every commit since the file crossed 200 on
2026-08-19 (26 of 26) and the artifact over cap at every one of them; one commit in the
whole history deleted a line, and it was a correction. Calibration before the arms were
read: a sibling project's backlog with a ~300-line split rule reported clean (188), the
source's own overview reported over (2,728), and the memory file's seeding commits
(+18..+42, before the rule) tripped the per-edit arm. Verdict `better`; shipped as an
artifact-reading check with the document's own prune remedy adjacent, wired at the end
of the project's per-CLI gate, plus one prune to exactly the cap. Application
`next--prose-rule-drift`. The pruned lines were the disposable kind the document names;
none of the durable kinds.

## Leads

1. **A game-security subject — new category in game-production.** Return when a
   managed project ships server-authoritative multiplayer or an anti-cheat surface
   beyond the one achievement-validation step that exists today, or when a second
   independent source (not a bibliography) states the defensive rules. The section
   ranking above is the wave plan; rank 1 first.
2. **A citation-tier rule in software-engineering** (candidate 12). Return when a
   second source shows a verifiable citation chain that never reaches an authority, or
   when the registry's own citation checker (lead 3) exists and needs to say what tier
   it resolved to.
3. **Archive at admission, and a citation liveness checker for this registry.** The
   registry's applications and source notes cite external URLs and nothing checks them;
   `scripts/` holds no liveness instrument. The source's checker carries the rule set
   worth porting (confirmed-dead only on 404/451; unknown is not dead; the repair is a
   rename to a mirror taken at admission). Return when the first application citation is
   found `gone` by hand, or when `verification-is-contributed` gets its instrument.
4. **Self-fed demand is not a quiet gauge** — possible one-paragraph amendment to
   `quiet-window-maintenance`: when the work competing with maintenance is the
   maintainer's own backlog, quiet never comes by construction and the gate must be a
   share, not a window. Return on a second instance in a batch pipeline rather than a
   user-facing store.

## Method notes

- `research-ingest` on this URL would have returned a 30,704-word advertisement for a
  381,000-word tree; the sweep order in Phase 2b put the yield in the operating document
  and the log, exactly as predicted, and the README last.
- The clone needed a blobless sparse checkout: a plain `--depth 1` pulled 864 MB of
  flattened archives in two minutes and did not finish. Recorded for the class: a
  reference index that also mirrors its references is a code repository by weight.
- 0 of 3 fetches. Seventeenth consecutive zero-fetch run on a source carrying its own
  primary material.
