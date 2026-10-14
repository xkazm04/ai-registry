---
layer: application
type: application
subject: bulk-adverse-action-governance
technique: cohort-drift-forces-a-fresh-review
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@24
applied: simulation
ab_verdict: better
---

# Drift handling in a server-side screening wave: five of six rules held, one refusal is bare

A TypeScript applicant-tracking app realizes most of this technique already. The
citations below are pinned to one commit of that app, read on 2026-10-14. The seam was
chosen to falsify: if the app's drift handling were complete, the technique would add
nothing here.

## What the tree already does

- **Detection by re-derivation.** The commit recomputes the reject set from the live
  cohort and verifies the echoed token against it (`app/_lib/screen-wave.ts:283`); no
  mutation listener exists.
- **Boundary drift rides the signature.** The policy version string carries the family
  override, holdout rate and reviewer exclusions (`screen-wave.ts:216-269`), and the
  token hashes it (`app/_lib/screen-wave-approval.ts:37-44`), so a changed rule is
  refused even if the set is identical.
- **Time expiry.** A 15-minute window with a clock-skew guard
  (`screen-wave-approval.ts:25`, `:132-133`).
- **Spend once.** An in-process ledger refuses a replay (`screen-wave-approval.ts:81-103`).
- **Per-row compare-and-swap.** A member whose stage moved mid-wave is skipped, nothing
  sealed, no letter sent, and reported with its own outcome code
  (`screen-wave.ts:507-520`, `:585-595`, code `staleSkipped`).

## The gap the simulation found

The refusal does not name the delta. Mismatch returns one fixed sentence, "The candidate
set changed since it was previewed" (`screen-wave.ts:289-290`), and the wire vocabulary
has one `mismatch` code for membership, score, boundary and status drift alike
(`app/_lib/screen-wave-contract.ts:185`). The token is a hash, and the commit does not
echo the previewed id list, so the server cannot say who moved.

Three real shapes, walked under the bare refusal (A) and a named delta (B):

1. **A late score lands for a previously unscored candidate.** A: recruiter sees
   "changed", re-previews, finds one new row among forty, cannot tell it from noise.
   B: the refusal says one newly in, was unscored at preview. Predicted: faster, more
   careful re-review.
2. **A teammate edits the family override.** The set may be identical in size. A: the
   same sentence, so the recruiter assumes a refresh glitch. B: "configuration changed"
   is stated, which is the one case the technique says always re-reviews.
3. **A candidate is advanced by hand between preview and commit.** A: refused and
   re-previewed, correct but opaque. B: named as no longer in the set.

Falsifier: if re-approval time after a `mismatch` were already near the first-review
time, naming the delta would add nothing. No such measurement exists in the tree.

## Task, sized

Carry the previewed id list in the approval (the commit already echoes a spare list),
diff it against the re-derived set in `screen-wave.ts` at the mismatch branch, extend
the 409 body with `added`, `removed` and `configChanged`, and render them in the
re-preview. About 5 files, 120-180 lines. Measurable: re-preview-to-recommit time after
a `mismatch`. Floor: no change to any approval refusal reason or to the spend ledger.

## Return condition

When a reviewer-time measure exists for post-refusal re-approval, or when a second
project grows a bulk adverse path.
