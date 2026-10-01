---
layer: application
type: application
subject: remediation-handoff
technique: single-artifact-prompt-construction
stack: process
status: forged
verified_on: 2026-10-01
verified_against: node@24
---

# The fix prompt — one document per repository, built as a pure function

`src/lib/org/followups.ts` (`buildFixPrompt`) is the technique
realized as a deterministic text builder. Its signature is
`(items, ctx: { org, generatedAt, scanNote?, commitPolicy?, verifyCommand?, … }) => string` — no I/O, no model
call, no clock of its own. The module header states the design in one line:
*"pick a batch → get ONE prompt → paste it into the local tool → let the next
scan of that branch tell Ascent what got done"*
(`src/lib/org/followups.ts`).

## The five parts, in the source's order

- **Header** : `# Ascent follow-ups — <org> — N items across R
  repositories`. The count is stated with what it counts.
- **Framing** : *"These are gaps an Ascent maturity scan found in
  the repositories below. Each item states the gap as the scan saw it, why it
  matters … Resolve what you can, in small verifiable changes; skip anything
  that does not apply and say why."* Note the deliberate epistemic hedge —
  "as the scan saw it" — which is the technique's rule that the artifact must
  not present an assessor's reading as ground truth.
- **Rules block** : work one repository at a time on a branch and
  read the repo's own guidance first (`CLAUDE.md` / `AGENTS.md` /
  `CONTRIBUTING`); prefer the smallest change that closes the gap for real;
  *"Do not edit files only to satisfy a scanner"*; end with a per-id summary
  of resolved / skipped / needs a human.
- **The return contract**, inside the rules block rather than in a
  footnote: *"In EVERY commit that resolves an item, add a trailer line
  `Ascent-Resolves: <id>` (several ids: comma-separated)."* The key is
  interpolated from `FOLLOWUP_TRAILER`, the same constant
  `parseResolvedIds` builds its regex from — one authority for the
  vocabulary, writer and reader both derived from it.
- **Per-repository sections** : repos sorted by summed
  `projectedPoints`, items within a repo by impact then
  effort (`IMPACT_ORDER`). Each item emits title, `` id: `<id>` ``,
  dimension, impact, effort, `+N pts`, "Why it matters", and an "Explore
  first" list.

## Where the repo confirms the standard

- **Verbatim identifiers.** The id is emitted in a code span exactly as
  persisted; nothing prettifies it, which is what makes the
  round-trip through the commit message an exact match.
- **The assessor's own words.** `rationale` and `explore` are copied from the
  scan's stored recommendation; the module header says *"Grounded in the
  scan's own words; no new prose"*. This is what keeps the
  title-based restatement check in `isRestated` comparable across
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

The feature README keeps a **Known gaps** ledger, and its first entry is the
technique's admitted limitation: a fix that lands without a trailer and
leaves the dimension's wording similar enough to restate keeps the row handed
off until a human resolves it. The prompt asks for the trailer for exactly this
reason.

The gap this application used to record as open - *"the prompt is Ascent's
words, not the repo's; grounding it in stored evidence is the obvious next
step"* - is now closed for one path only. The loop-lane brief (`commitPolicy:
"lane"`) appends the last scan's stored evidence and gaps for the batch's
dimensions, plus the organization's own standard, while the human paste prompt
is byte-identical to what it was. The two artifacts therefore differ by
executor, and the technique's determinism rule holds per path, not across them.

## Drift since 2026-08-20 (re-read 2026-10-01)

The builder grew three rules the technique should expect any long-lived
artifact to acquire:

- **A capability rule**, lane path only. The lane agent has file edits and no
  shell or network; the measured failure was not giving up but doing something
  *adjacent* and calling the item resolved (a weekly workflow that would pin
  the actions, filed as resolving the pinning). The brief now says an item
  needing a missing capability is skipped, never replaced.
- **A verification promise that is only printed when true.** The brief states
  a net (the repository's own check, or the narrower one standing in for it)
  only when a baseline was established; otherwise it prints a neutral note.
  Telling an agent its mistakes will be caught when they will not is the one
  lie that makes the artifact dangerous.
- **Repository-authored text is neutralized** before it is quoted into the
  prompt, the same treatment every foreign fragment gets.
