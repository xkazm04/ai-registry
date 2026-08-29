# Lessons - explorer

Append-only reflection lane. One entry per run that taught something. Format:
`## <version used> - <YYYY-MM-DD> - <project>` followed by `- ` bullets.

## 1.0.0 - 2026-08-24 - ai-registry

- **Re-seated onto the lane's overlay contract (1.0.0 -> 1.1.0).** The body called itself "personas-specific", hardcoded `C:/Users/kazda/Documents/Obsidian/personas`, and Phase 0 `exit 1`-ed when that root was absent. On the second machine the same vault lives under a different user, so the sweep died before it picked an area. A daily-cadence skill that cannot start on the machine you are sitting at is not a daily skill.
- **The taxonomy was the deepest coupling, not the vault path.** The vault path is one line; `codebase-context.md` was woven through Q1's area menu, the Phase 2a resolver, the sampling strategy's entry points, the widening rule, and the coverage name set. All of it now resolves through `## Context sources` / `## Area menu` with `context-map.json` then `CLAUDE.md` as the fallback chain, and a missing source narrows the sweep instead of stopping it.
- **The i18n and design-token rules were personas law masquerading as method.** "13 other locales", `tokenLabel()`, `resolveErrorTranslated()`, `Design.md \u00a78`, the 10k-warning lint baseline: real, load-bearing, and true of exactly one repo. They moved to the overlay's `## Repo law` and `## Baseline exclusions`; the body keeps the *shape* of the rule (a string-adding item in a many-locale repo is not a paper cut) without naming anyone's files.
- **What stayed is the wander.** Ten items, the premise-verification gate, the per-category hunting lists, `passes.md` memory, the claim board, risk-ascending execution and the one-invocation stage-verify-commit discipline are method. Re-seating changed where the run gets its facts, not how it wanders.

## 1.2.0 - 2026-08-29 - kp

- **On a cold vault, Phase 2b has no signal — go looking for a neighbouring loop's ledger.**
  With `coverage.md` empty every context scores max staleness, the yield-density tie-breaker is
  undefined, and the rule falls through to "smallest file count", which is arbitrary. kp happened
  to carry a *different* skill's artifact — a reconstructed per-context coverage table from its
  scan-sweep — naming the three contexts that whole sweep left with zero fix commits. Picking from
  that list found four real bugs on the first try. Most repos that run one quality loop run
  several; their ledgers are the cheapest cold-start prior available, and Phase 2b currently does
  not think to look for one.
- **Reading the CONSUMER, not the anchor, is what kills a bad item.** Three candidates died at the
  premise gate this run, and none of them died at its own `file:line` — the arithmetic really did
  produce the wrong number, the delimiter really was fragile. They died one call site away: the
  component gated the figure out of the render, the SQL genuinely interpolated the exported
  constant. Phase 5's gate says re-read the anchor; the anchor is where a pattern-matched suspicion
  looks *most* convincing. The verification that pays is following the value to where a human sees
  it.
- **Diff a test's title against its assertions.** The run's highest-severity finding was sitting
  inside a passing test whose name stated the correct behaviour, whose assertion stated the
  opposite, and whose comment explained the discrepancy and moved on. A green suite had documented
  the bug for however long. Worth adding to the `quality` hunting list: a test title that
  contradicts its own assertion is a defect with a signpost on it.
- **When an area has a good idiom, the finding is usually "here is where it wasn't applied".** Two
  of four items were the same class — a printable delimiter or sentinel composing a key over
  values that arrive from outside the process (a URL param, free-text intake) — and in both cases
  the correct idiom already existed one file away. Cheap heuristic for a healthy area: find the
  module that solved a problem well, then grep for the places that solved it again by hand.
- **The knowledge-sync read slid to the end of the run.** Phase 1 puts the registry subject read
  before proposing; this run wandered straight into code and only resolved the governing subjects
  when it came time to file leads. Nothing was lost here, but the consult line then records a read
  that did not inform a single proposal — which is exactly the signal the registry is counting. The
  ordering needs to be load-bearing in the phase, not advisory.

## 1.2.0 - 2026-08-29 - ascent

- **The stage-verify-commit discipline was one-directional (1.2.0 -> 1.3.0).** The skill teaches how not to sweep a concurrent session's work into your commit, and says nothing about the inverse, which is what actually happened: a parallel skill ran a broad `git add` between an edit and its commit, absorbed the change into ITS commit, and the explorer's own `git commit -- <path>` then found nothing to commit and silently committed that session's staged work instead. Added step 5 — verify with `git log -1 -- <path>` that the change landed in YOUR commit, and if it did not, record the foreign sha rather than re-applying a fix that is already in the tree.
- **Prior-pass annotations are a "swept, move on" marker, and reading them first would save a third of the wander.** In a repo where earlier scans leave finding-numbered comments (`database-client-schema #1`, `data-retention 07-16 #2`), the annotated files produced ZERO surviving candidates and the un-annotated ones produced 9 of 10 items. Phase 4a picks files by size and entry-point status; a cheap grep for prior-finding markers would rank them better. Not applied — it needs a marker convention the method cannot assume, and `passes.md` plus prior sweeps already cover the explorer's own history. Worth trying as a Phase 4a hint if a second repo shows the same shape.
- **The highest-value finding came from cross-reading two files, and no category lens asks for that.** The run's one high-severity pair was a UI promising a behaviour its server resolver does not have; each file is internally consistent, and both had been read by earlier passes. The per-category hunting lists in 4b are all single-artifact questions. A ninth prompt — "what does this surface CLAIM the code below it does, and does the default agree?" — is where the defect lived. Recorded rather than applied: one observation is not yet a rule.
- **`standard:` earned its read exactly once in ten items.** Matching techniques on `use_when` before reading was right; the nine `standard: none` items were honestly none. The clause's cost is proportional to the read, so resist reading a golden path for a subject the item does not touch.

## 1.2.0 - 2026-08-29 - systedo-case

- **Third repo in one day where the premise gate killed items one call site away from
  their anchor.** kp recorded this; this run is the confirmation that should promote it
  from observation to rule. All THREE killed candidates were React state-lifetime
  suspicions — SLA countdowns and a per-project snippet library surviving a project
  switch, a countdown formatter printing `-2:-10` when negative, an analytics band whose
  writer was never called — and every one of them read as obviously true at its own
  `file:line`. Each died in a file the wander had not opened yet: a `template.tsx` that
  remounts everything beneath it, the branch that never reaches the formatter, the button
  that does call the writer. Phase 5 should say it outright: for any item whose claim is
  about LIFETIME, IDENTITY or REACHABILITY, the anchor is not evidence — the mounting
  parent and the caller are.
- **The gates fail for reasons that are not yours, and the method has no move for it.**
  Two of them in one run: `npm run lint` was red on a *committed* file from another
  loop's output directory, and the pre-commit `tsc` was red on a stale generated file
  (`.next/types/validator.ts` still naming routes deleted three commits earlier). Neither
  is a reason to stop, and both are exactly where `--no-verify` starts looking reasonable.
  What worked: lint the paths you touched (`npx eslint <paths>`) to get a clean signal on
  your own work, delete the stale *generated* artifact and let the build remake it, and
  never touch the foreign source. Phase 7's step 2 currently just says "run the gates" —
  it should name the three-way split: red because of your change (fix it), red because of
  a stale generated artifact (regenerate it), red because of someone else's file (report
  it, commit anyway, say so in the run record).
- **A cold vault plus a healthy area is where "surface exactly 10" is most dangerous.**
  The area had a real unit suite, honest comments, and a prior refactor commit — nothing
  was broken. What was there instead was one shape, four times: a capability the code
  documents and does not use. A `brand` parameter with a passing test and no caller; a
  default that was also the absent value; a "cs/en" label map with one column; an
  `aria-pressed` idiom applied in twelve places and missed in three. That is a genuinely
  productive lens for a healthy area and it is not in 4b's category lists: **grep for the
  repo's own idiom, then list where it was not applied** — and read `git log` on the
  anchor, because "added by <sha>, never wired" is the strongest evidence a dead
  capability can carry.

## 1.2.0 - 2026-08-29 - kp (run 2)

- **A recently-swept area is not swept — a recently-swept LENS is.** Phase 4d's dedupe (one
  `git log` over the area, drop what recent commits plausibly fixed) killed nothing here even
  though two dedicated passes had swept this exact code weeks earlier: their lenses were
  performance and accessibility, and the six findings were theming, i18n and parser
  correctness. The rule is right to check, but its framing invites reading recent activity as
  "covered". It is better read as a map of which lenses have ALREADY run — which is also the
  argument for recording lens coverage per area, not just visit dates.
- **When a file's comment cites a gate, open the gate.** The run's highest-severity finding
  was invisible from the file: a palette of raw hexes, under a comment explaining that
  importing the project's colour mirror "puts these under `design:check`". True, and
  irrelevant — that gate checks a literal against its LIGHT token and never scans for hex at
  all, and the mirror's constants are the light half by construction. The defect lived in the
  relationship between a file, a doc's claim, and an enforcement script; no amount of reading
  the file produces it. Worth naming in Phase 4b: **a comment that cites a gate is a
  hypothesis to verify, not evidence.**
- **Read the governing doc before forming the item, not after.** `docs/design/README.md`
  already stated the exact rule this finding broke and cited a prior sighting of it. The item
  was an unrecorded SECOND instance of a known trap — better framing, faster to reach, and it
  turned the doc update from boilerplate into "an anecdote is now a pattern". Same ordering
  mistake as the knowledge-sync read in run 1: the skill puts both reads early and both slid
  late.

### Redesign proposal (not applied)

Phase 7's stage-verify-commit step catches a foreign file in the index by comparing the
cached stat's FILE count to what you added. It should also compare the LINE count to the size
of the change: on a Windows checkout with `core.autocrlf`, editing through anything that
preserves working-tree bytes re-commits the whole file (measured: 861 insertions / 812
deletions for a 20-line edit), and the existing check passes cleanly because the file count is
right. Proposed wording for the same paragraph: *"If the insertion count is wildly larger than
your edit, the file's line endings were rewritten — normalize and re-stage before committing."*
Not applied off a single incident in one repo; recorded so a second sighting can promote it.

## 1.3.0 - 2026-08-29 - ascent (second sweep, same session)

- **The cross-layer claim is a lens, and it was missing (1.3.0 -> 1.4.0).** Phase 4b's per-category lists are all single-artifact questions, and in a mature codebase the best finding usually is not in an artifact — it is in what one layer CLAIMS about another, where each file is internally consistent and both have already been read by earlier passes. Two sweeps, two top findings of exactly this shape: a dialog promising destruction where the resolver redacts, and a write path missing the author gate its own read path enforces four lines above. Added as a lens that runs in every category, with the two greps that find it: a doc comment carrying a modal verb about a CONSUMER (unenforceable by construction), and a rule present on one path of a pair (reads/writes, POST/DELETE, barrel/deep-import, arming screen/receipt).
- **"Read the caller before changing a contract" was assumed and should be stated.** I made an idempotent DELETE 404 on no-match for symmetry with its POST, and only caught it by reading the client, which rolls its optimistic removal back on `!res.ok` — the "more correct" status would have restored a row the database does not have. The execution rules covered validation and repo law but never said to check what callers branch on. One grep, and the item is not done when the tests pass but when the callers still mean what they meant.
- **The prior-annotation heuristic is now two-for-two and still not promoted.** Files carrying finding-numbered comments from earlier passes yielded nothing in either sweep; files carrying none yielded 9/10 then 10/10. It remains repo-specific (it needs a convention the method cannot assume), so it stays in the consuming repo's overlay — but if a third project shows it, it is worth a Phase 4a ranking hint.
- **Watch the acceptance rate as a calibration signal, not a success metric.** Two runs, 20 items, 20 accepted. That is as consistent with a LOW bar and a generous user as with good calibration. The skill's drift signal only fires on 3+ runs of ZERO acceptance; there is no symmetric signal for "everything is always accepted", and there probably should be — a run where nothing is ever declined is not obviously distinguishable from padding.


## 1.4.0 -> 2.0.0 - 2026-08-29 - kp (design change)

- **The triage question had an answer rate of 100% and an information content of zero.** Across
  three consecutive sweeps of one codebase: 15 items surfaced, 15 accepted, 0 declined. The
  operator's own words: "the findings are incredibly useful and often I accept all of them."
  A gate that never rejects is not a safety mechanism, it is a round trip — and it was being
  paid three times per session, at the exact moment the run had the most context and the user
  the least.
- **But the split that works is not "small vs large" — it is "can the gates settle this".**
  Sizing the change was the *proxy*; the real property is whether finishing an item requires a
  judgement the repo's own verification cannot supply. That is why the effort band works at
  all: in the measured runs, both `m` items were the two that genuinely needed a human (a
  dual-theme palette redesign, and a change to a nine-site accessibility idiom), and every
  `xs`/`s` item was settled entirely by typecheck + test + lint + parity. So v2 auto-accepts
  `xs`/`s`, and adds the rule that falls out of the reasoning: **an item the gates cannot
  settle is `m` at minimum however small the diff.** A one-line change that needs a browser is
  not a small item; it is a question wearing a small item's clothes.
- **Moving a gate means the thing behind it has to hold.** Two properties were load-bearing
  before and are now structural: the Phase 5 premise gate (auto-accept changes who approves a
  VERIFIED finding — it must not become a licence to surface unverified ones) and one atomic
  gated commit per item (so an unwanted change reverts alone, by sha). Both are now stated as
  the reason the band is safe, so a future edit cannot weaken them without noticing what it is
  weakening.
- **Sizing became load-bearing, so the rubric had to get honest.** `effort` was previously a
  label a reader skimmed; it is now an approval decision. The rubric now says to size the WHOLE
  change — edit plus test plus locale parity plus doc-sync plus visual verification — and to
  round UP between buckets, because over-sizing costs one question and under-sizing costs an
  unasked-for change. A one-line edit that ships 28 catalog entries in four languages is not `xs`.
- **The calibration signal moved and the skill has to say so.** `passes.md` and the decline-reason
  loop were fed mainly by small rejected items; with only `m`/`l` declinable they now fill slowly,
  and "zero declines" stops meaning anything about calibration. The replacement signals are the
  SHORTFALL (how often a run stops short of 10) and, crucially, a user REVERTING an auto-accepted
  commit — which means the sizing rubric is running small, not that the finding was wrong.
- **What the run owes in exchange for not asking.** The summary now has to give a plain account
  of what was built on the user's behalf, with shas, and name whatever stayed unverified. A run
  that saves a round trip and spends it on opacity has made the trade backwards.
- **Major, not minor.** The method is unchanged — wander, verify, present, execute, remember —
  but the skill's contract with its operator is not: it now edits code without asking. A reader
  seeing `1.x -> 2.0` re-reads the skill, and that is exactly the intended reaction.
