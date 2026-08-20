---
layer: application
type: application
subject: remediation-handoff
technique: single-artifact-prompt-construction
stack: process
status: forged
verified_on: 2026-08-20
---

# The fix prompt — one document per repository, built as a pure function

`src/lib/org/followups.ts:105-145` (`buildFixPrompt`) is the technique
realized as a deterministic text builder. Its signature is
`(items, ctx: { org, generatedAt, scanNote? }) => string` — no I/O, no model
call, no clock of its own. The module header states the design in one line:
*"pick a batch → get ONE prompt → paste it into the local tool → let the next
scan of that branch tell Ascent what got done"*
(`src/lib/org/followups.ts:1-26`).

## The five parts, in the source's order

- **Header** (`:112`): `# Ascent follow-ups — <org> — N items across R
  repositories`. The count is stated with what it counts.
- **Framing** (`:114-118`): *"These are gaps an Ascent maturity scan found in
  the repositories below. Each item states the gap as the scan saw it, why it
  matters … Resolve what you can, in small verifiable changes; skip anything
  that does not apply and say why."* Note the deliberate epistemic hedge —
  "as the scan saw it" — which is the technique's rule that the artifact must
  not present an assessor's reading as ground truth.
- **Rules block** (`:119-125`): work one repository at a time on a branch and
  read the repo's own guidance first (`CLAUDE.md` / `AGENTS.md` /
  `CONTRIBUTING`); prefer the smallest change that closes the gap for real;
  *"Do not edit files only to satisfy a scanner"*; end with a per-id summary
  of resolved / skipped / needs a human.
- **The return contract** (`:122`), inside the rules block rather than in a
  footnote: *"In EVERY commit that resolves an item, add a trailer line
  `Ascent-Resolves: <id>` (several ids: comma-separated)."* The key is
  interpolated from `FOLLOWUP_TRAILER` (`:32`), the same constant
  `parseResolvedIds` (`:51-53`) builds its regex from — one authority for the
  vocabulary, writer and reader both derived from it.
- **Per-repository sections** (`:127-142`): repos sorted by summed
  `projectedPoints` (`sumPts`, `:147`), items within a repo by impact then
  effort (`IMPACT_ORDER`, `:103`). Each item emits title, `` id: `<id>` ``,
  dimension, impact, effort, `+N pts`, "Why it matters", and an "Explore
  first" list.

## Where the repo confirms the standard

- **Verbatim identifiers.** The id is emitted in a code span exactly as
  persisted (`:135`); nothing prettifies it, which is what makes the
  round-trip through the commit message an exact match.
- **The assessor's own words.** `rationale` and `explore` are copied from the
  scan's stored recommendation; the module header says *"Grounded in the
  scan's own words; no new prose"* (`:13`). This is what keeps the
  title-based restatement check in `isRestated` (`:82-84`) comparable across
  runs.
- **Honest resolution semantics.** Only default-branch scans persist, so
  *"resolution happens when the fix lands — the honest semantics: resolved =
  merged and rescanned. The prompt says so"*
  (`docs/features/org-followups/README.md`).
- **Placement of the contract.** The README records a real correction
  (2026-08-19): the hand-off contract used to sit in the tab's header
  paragraph, which *"every visit had to scroll past to reach the table"*, and
  was moved *"where it is acted on: inside `FollowupsPromptModal`, on the
  prompt you are about to paste into an agent."* Contract text belongs at the
  point of action, not on the browsing surface.

## Where the repo is honest about falling short

`docs/features/org-followups/README.md:112-122` keeps a **known-gaps ledger**,
and the second entry is this technique's admitted limitation stated plainly:
*"The prompt is Ascent's words, not the repo's. It carries the scan's
rationale and explore questions, not file paths or evidence excerpts; the
agent is told to read the repo's own guidance first. Grounding it in the
dimension's stored evidence is the obvious next step."* The standard is not
lowered by this — a grounded artifact is better — but publishing the gap next
to the design is the craft the technique asks for: the "Explore first" list is
explicitly the cheap substitute for evidence the prompt does not carry.

The first entry names the complementary hole: *"A fix that lands without a
trailer and leaves the dimension's wording similar enough to restate keeps the
row handed off until the user resolves it by hand. The prompt asks for the
trailer for exactly this reason."*
