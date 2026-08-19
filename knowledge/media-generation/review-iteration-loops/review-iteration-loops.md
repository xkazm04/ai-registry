---
layer: golden-path
type: golden-path
subject: review-iteration-loops
status: forged
use_when: [turning creator notes on generated work into a revision, designing the feedback surface of a generation pipeline, deciding whether to edit or regenerate after review, keeping quality gates and attribution honest across revisions]
techniques:
  - edit-plan-over-regeneration
  - note-taxonomy-focus-scope-order
  - refusal-as-valid-outcome
  - scope-vs-preference-signals
  - attribution-share-accounting
  - follow-up-that-can-kill-a-fact
---

# Review iteration loops

A review iteration loop is what happens after a human has looked at generated
work and said something about it. The naive reading treats this as another
generation call with extra context: feed the feedback back in, get a new
version out, repeat until happy. That reading destroys more value per cycle
than it creates, and the destruction is invisible because each new version
looks, in isolation, fine — often better. What it silently discards is
everything the review *established*: the beats the creator approved, the
verifications computed against them, the attribution numbers drawn from them,
and the creator's own mental model of what the piece now contains. The
principal reading is the opposite: once work has been reviewed, feedback is
answered with **the smallest set of edits that addresses the notes, and
nothing else changes** — because a reviewed artifact is not raw output any
more; it is a ledger of decisions, and every untouched line is a decision
being kept.

## Review capital, and how regeneration burns it

The first review a creator performs converts a candidate into something with
standing. From that point, three kinds of capital accumulate against the
specific version they read:

- **Approval capital.** Every beat the creator did not object to is tacitly
  approved. A regenerated version replaces approved material with new
  material the creator has never seen, so the review must restart from zero —
  and worse, the creator does not *know* it must restart, because the new
  version arrives framed as "your notes, addressed".
- **Verification capital.** Craft gates, constraint checks, and honesty
  ledgers are computed against particular beats. When the beats change, every
  one of those verdicts is void — a "verified" badge over regenerated content
  is a claim about a version that no longer exists. A revision loop that does
  not re-gate after every applied change is displaying stale certificates.
- **Accounting capital.** Attribution — which evidence each beat rests on,
  how much of the runtime each source earned — is a per-beat ledger. A
  rewrite from scratch orphans it entirely; the numbers on screen keep
  rendering and stop being true.

This is why "the new version is better" is not a defense. The creator asked
for a rebalance; a rewrite answers a question nobody asked, and it charges
the review, the gates, and the accounting as the price. The discipline that
protects all three is [edit-plan-over-regeneration](techniques/edit-plan-over-regeneration.md):
the revision engine's output is a *list of operations*, not a new artifact,
and the burden of proof runs against every operation in the list.

## Feedback is typed, and the types carry precedence

Free-text feedback is where revision loops go to drift. A creator writing
"this section feels long" might mean shorten it, cut it, or move it — and a
model will pick one, confidently. The fix is a small closed vocabulary of
note kinds, each mapping to a preferred minimal operation
([note-taxonomy-focus-scope-order](techniques/note-taxonomy-focus-scope-order.md)):
more weight, less weight, remove entirely, reposition, and an explicit
escape hatch for genuine free text. The taxonomy is not bureaucracy — it is
what lets the engine prefer a retiming over a rewrite, a rewrite over a cut,
and a cut-plus-repair over a restructure, because each note kind names the
*smallest* operation that could satisfy it.

Notes are also not all the same rank. A note is a preference expressed today;
a scope decision — this material is in, that material is out — is a
structural commitment made earlier, on a surface built for it. When they
collide, the scope decision wins, and the note is refused with directions to
the surface where the decision actually lives
([scope-vs-preference-signals](techniques/scope-vs-preference-signals.md)).
A loop where a casual note can silently overturn a deliberate scoping
decision has two authorities with opposite answers and no complaint — the
worst governance shape there is, because each surface believes it is being
honored.

## Refusal is an output, not a failure

Some notes cannot be honored: they ask for material the evidence base cannot
support, or for the removal of something the format requires, or for weight
on something the creator themselves descoped. The engine's answer to such a
note is a **refusal with a reason** — a first-class output alongside the
edits, per the bundle law that refusal is a state, not an error
([refusal-as-valid-outcome](techniques/refusal-as-valid-outcome.md)). The
same discipline covers the quieter cases: renders considered and left alone
are listed as explicitly unchanged (so "untouched" is distinguishable from
"forgotten"), and two notes that contradict each other are surfaced with a
named winner rather than resolved silently. A creator who learns that some
notes vanish without trace stops trusting the ones that were applied.

The ordering matters as much as the verdict: a plan that violates a rule is
**refused before it is applied**, never applied and flagged afterwards. A
guard that fires after the damage is a complaint; the whole difference
between a guard and a complaint is which side of the apply it sits on.

## The ledger must survive the edit

Every beat of a reviewed artifact declares which evidence it rests on, and
the loop's honesty depends on that declaration surviving revision intact.
Two disciplines keep it true. First, shares: a beat resting on three sources
splits its duration across them, so attributed time sums to the runtime it
came from — crediting the full duration to each source inflates the ledger
by the overlap factor, and because baseline and candidate inflate alike, the
error hides in the delta precisely where decisions are made
([attribution-share-accounting](techniques/attribution-share-accounting.md)).
Second, amendment over re-derivation: an edit that rewrites a beat starts
from the attribution the beat arrived with and changes only what the new
text changed. Re-deriving attribution from memory on every edit is how the
ledger drifts away from the script one plausible guess at a time.

## The loop must be able to subtract

A review loop that can only add — more detail, more confirmation, more
material — is structurally dishonest, because review sometimes discovers
that the *evidence* was wrong, not the rendering of it. Follow-up
interrogation of the evidence base is part of the loop, and its outcome
vocabulary must include killing a fact, downgrading it, and coming back
empty-handed — not just confirming and deepening
([follow-up-that-can-kill-a-fact](techniques/follow-up-that-can-kill-a-fact.md)).
A killed fact then propagates *forward* through the same edit machinery:
beats resting on it need edits or cuts, gates need re-running, and the
attribution ledger records the exclusion with its reason. Review that can
strengthen a claim but never retract one converges on confidence, not truth.

## Failure modes this standard exists to prevent

- **The helpful rewrite** — regeneration wearing an edit's clothes; the tell
  is an edit list longer than the notes that prompted it.
- **Stale certificates** — "verified" verdicts surviving the death of the
  version they verified.
- **The silent loser** — two contradicting notes, one applied, the creator
  never told which.
- **The polite bypass** — a note quietly doing what a governance surface
  explicitly forbids.
- **Inflated ledgers** — attribution that double-counts shared beats and
  reports phantom overruns symmetrically enough to hide them.
- **Confirmation-only research** — a follow-up channel with no verb for
  "this fact is dead".
- **Vanishing consideration** — untouched work indistinguishable from
  unconsidered work.

## The techniques

- [edit-plan-over-regeneration](techniques/edit-plan-over-regeneration.md) —
  the revision engine emits operations, not artifacts; smallest set that
  answers the notes; everything else byte-identical.
- [note-taxonomy-focus-scope-order](techniques/note-taxonomy-focus-scope-order.md) —
  a closed vocabulary of note kinds, each mapped to its minimal operation.
- [refusal-as-valid-outcome](techniques/refusal-as-valid-outcome.md) —
  refusals with reasons, explicit unchanged lists, surfaced conflicts,
  refuse-before-apply ordering.
- [scope-vs-preference-signals](techniques/scope-vs-preference-signals.md) —
  scope decisions outrank notes; collisions route back to the scoping
  surface instead of around it.
- [attribution-share-accounting](techniques/attribution-share-accounting.md) —
  shared beats split their time; attributed seconds sum to runtime; edits
  amend the ledger rather than re-derive it.
- [follow-up-that-can-kill-a-fact](techniques/follow-up-that-can-kill-a-fact.md) —
  an interrogation queue whose outcomes include kill, downgrade, resolve,
  and unanswered — and whose results propagate through the edit machinery.
