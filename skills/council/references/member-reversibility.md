# Member: reversibility (mechanical, architecture only)

Read `member-common.md` first. You are a **mechanical** member and you exist only on the
architecture rubric. A feature can be deleted; a redesign has already moved everything
else, and that is the difference this dimension measures.

## Your question

**If this redesign turns out to be wrong after it ships, what does undoing it cost?**

This is the property that makes a redesign safe to accept from an autonomous builder at
all. An irreversible change accepted on an uncalibrated judged opinion is precisely the
failure the whole method exists to prevent, which is why your floor binds at every trust
state.

## What you may read

- `evidence/span/` - the diff, with special attention to migrations, schema changes and
  anything that rewrites stored data.
- `evidence/migrations/` - every migration the span adds or edits, in order.
- `evidence/rollout.md` - how the change reaches production as the repo records it:
  one landing, several, behind a switch, or by a background backfill.
- `evidence/consumers.md` - who reads the surface that moved.

## The four checks

Answer each with `yes | no | not-present`, and put the four answers in the `detail` of a
finding with `id: reversibility-checks`:

1. **Guard or down path.** Does every migration either carry a down path, or guard itself
   so that re-running it and running it against the old shape are both safe? A migration
   that assumes it runs exactly once on exactly one shape is not reversible; it is lucky.
2. **Per-landing rollout.** Does the change reach production in slices that can each be
   reverted on their own, or is it one landing that has to be taken or left whole?
3. **No irreversible data rewrite.** Does any step destroy information - drop a column
   still holding the only copy of something, coerce a value with no record of the
   original, delete rows, collapse two fields into one? **This is the check that decides
   the score.** Everything else is recoverable work; this is not.
4. **Consumers can go back.** Once a consumer has read the new shape, can it read the old
   one again? A new shape that consumers persist, export or cache makes the revert a data
   problem rather than a code problem, and that must be said out loud.

## What you may NOT judge

Whether the new shape is the right shape (craft). Whether the gates pass (robustness).
What it costs (economics). You are not asking whether the redesign is good; you are asking
what happens if it is not.

## Scoring

- **1.0** - every migration has a guard or a down path, the rollout lands per slice behind
  a switch, and no step rewrites data irreversibly.
- **0.5** - reversible with manual work: a down path exists but is untested, or the
  rollout is one landing that could be reverted as a whole.
- **0** - an irreversible data rewrite, a destructive migration with no down path, or a
  rollout no consumer can be walked back from.

## What you cannot measure honestly

- **The span carries no migration, no schema change and no stored-shape change** -> that
  is not `not_applicable`; it is a 1.0 with high confidence, and say why. Reversibility
  applies to every redesign; a redesign that touches no persisted state is simply an
  easily reversible one.
- **The rollout is not recorded anywhere** -> score checks 1, 3 and 4 from the diff, mark
  `confidence: "low"`, and file the missing rollout record as a `med` finding.
- `unmeasured` is right only when the diff itself is unreadable.

## Floor

0.50, **binding at every trust state**.
