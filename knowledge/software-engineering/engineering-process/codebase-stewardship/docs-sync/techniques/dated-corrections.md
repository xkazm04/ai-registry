---
layer: technique
type: technique
subject: docs-sync
technique: dated-corrections
status: forged
laws: [count-carries-predicate, deletion-is-not-repair]
shared_with: []
use_when: [a documented claim just proved false, a warning block outlived the defect it named, a dated correction turned out to be wrong]
---

# Dated corrections

When a documented claim is discovered false, there are three possible moves.
Delete the claim — which removes the information along with the error
([deletion-is-not-repair](../../../../_laws.md#deletion-is-not-repair): the next
author re-derives the same false belief from the same evidence and writes it
back). Silently rewrite it — which repairs the sentence and destroys the
record: downstream copies of the false claim become uncorrectable, and the
reader loses the ability to date anything else on the page. Or **correct it
in place, dated, with the measurement that earned the correction** — which
is this technique, and the exemplar repository's most valuable habit.

## The anatomy of a correction

A correction that will still be trusted in a year has five parts:

1. **The false claim, kept visible** — quoted, struck through, or restated:
   *"this line said X until [date]."* The false version is data: it tells
   the reader what other documents citing this one may still say, and warns
   the next author off re-deriving it.
2. **The date** — corrections without dates cannot be ordered, and a page
   with mixed-vintage claims and no dates forces the reader to distrust all
   of it equally.
3. **The measured truth, with its predicate**
   ([count-carries-predicate](../../../../_laws.md#count-carries-predicate)) —
   not "the real number is much lower" but "measured [date] at [ref]:
   0 errors, 1,135 warnings across 246 of 4,829 files," so the next reader
   can re-run the measurement instead of re-trusting the prose.
4. **The instrument** — how it was measured, because the diagnosis of the
   original error is usually *the instrument answered a different question
   than the one asked*, and naming the new instrument is what keeps the
   correction from repeating the mistake.
5. **The blast radius** — which downstream claims inherited the false value.
   The exemplar's sharpest case: a warning count stale by roughly 9× had
   been cited by five downstream documents as the *reason* for a design
   decision. The correction did two things silent rewriting cannot: it
   hunted the citations, and it re-derived the decision's justification on
   grounds that did not depend on the broken number — recording that **the
   conclusion survives on better grounds**, which is itself a finding.

## Retraction is a verb, never an absence

Everything above assumes the claim is *changed*. A claim can also be
**withdrawn** — it should not have been made, there is nothing to restate,
and the honest record says so. Withdrawal carries a failure mode that only
appears once claims are tracked as a set rather than as sentences, which is
where a machine-maintained corpus arrives quickly.

The set-level maintenance contract that tends to emerge is sound: the worker
receives the complete current claim set for a document and submits the
complete intended set. Unchanged claims keep their identity, revised claims
update in place, new claims are minted. One authoritative state per pass, no
orphans, no half-applied merges — this is the right shape, and the reason it
is worth naming is that it comes with one very attractive wrong detail.

The wrong detail is making **omission** the retraction signal: a claim absent
from the submitted set is treated as withdrawn. It is attractive because it
needs no vocabulary and no extra field, and it is wrong because it makes
*forgetting* and *deciding* produce byte-identical results. A worker that ran
out of context, mis-parsed the page, or simply summarised loosely deletes
established knowledge, and the record of the deletion is a gap — no date, no
reason, no author, nothing for the next reader to evaluate. That is precisely
the silent rewrite this technique opens by rejecting, relocated from the
sentence to the set, and it is
[deletion-is-not-repair](../../../../_laws.md#deletion-is-not-repair) at the
one site where the disappearance is unobservable by construction.

So retraction is stated. A submission carries its withdrawals explicitly, each
with a reason, and a claim that is simply missing is a **validation error the
runtime refuses** — not a signal it acts on. The cost is one field and one
check; what it buys is that every disappearance had an author.

### Omission is ambiguous; bind it to the safe reading

Refusing every omission is one resolution of the ambiguity, and it is the
expensive one: it forces the worker to re-declare the complete set on every
pass, which is exactly the round-tripping cost that makes claim-level freshness
unaffordable on a large corpus (see
[repair-rides-the-open-page](./repair-rides-the-open-page.md)). There is a
cheaper resolution that gives up nothing, and a machine-maintained corpus that
started with omission-as-retraction and then reversed it arrived at this shape:

- **Omission of a healthy claim retains it.** The default reading of silence is
  the non-destructive one. A worker that ran out of context, mis-parsed the
  page or summarised loosely now loses nothing — the claim keeps its identity
  and its evidence is re-resolved against current source.
- **Omission of a *flagged* claim is refused.** A claim already marked stale or
  unresolved is the one case where retaining silently is also wrong, because
  the retain path re-stamps evidence as current and would launder a known-broken
  claim into a fresh confirmation. These, and only these, must carry an explicit
  confirm, revise or withdraw.
- **Withdrawal is always an explicit token** — a named field carrying the ids
  being removed. Never inferred, never a side effect of absence.

The obligation set is therefore small, bounded, and — this is the load-bearing
part — **enumerated by the system, not by the worker**. The assignment states
how many claims the page holds and lists the flagged ones requiring a decision;
everything else the worker never sees and never repeats. A worker that needs
the full set to revise something healthy asks for it on demand, scoped to the
unit it currently owns. A sparse protocol is safe exactly when the set of
things you may not omit is computed by the thing that will check you.

### Destruction is idempotent; confirmation is strict

The two directions want opposite retry semantics, and a system that gives them
the same one is wrong in one of them. Persisting the reconciled set and
recording that the pass completed are separate writes, so a retry after the
first succeeded and the second failed is normal. On that retry the withdrawal
names an id that is already gone: strictness would fail a correct resubmission
forever. So **a withdrawal naming an absent id succeeds silently** — it is
delete-like, and the state it asks for is the state that holds. Confirmations
and revisions stay strict, because an unknown id there means the worker is
reasoning about a record that does not exist, which is a real error and not a
replay.

### The set may not empty itself

One more guard, and it is cheap: a pass that withdraws everything and
establishes nothing is refused. Not because emptying is never right, but
because the difference between *this document asserts nothing any more* and
*this worker lost its place* is invisible in the resulting artifact, and the
first is rare enough to be worth stating deliberately elsewhere. The check is
on the result, not the payload — withdrawals minus additions against the
retained set — so a legitimate wholesale rewrite still passes.

Note that a durability guard does not substitute for this, and the confusion
is common: a runtime that refuses to finish until the reconciled set is
persisted has proven the *write* completed. It has proven nothing about
whether the omission was *intended*. Durability and intent are different
properties, and only one of them can be established by the writer.

The diagnostic is a single question against the record: **why did this claim
disappear?** If the artifact cannot answer it — if the only evidence is that
something used to be there and now is not — omission is the retraction signal
in that system, whatever the design document says.

## Corrections of corrections are normal, not embarrassing

The exemplar contains a correction whose own measurement was wrong — a
search truncated by its own display limit reported three citation sites
where four existed, the tool answering a different question than asked and
the answer looking plausible — and the fix was a *second* dated correction
layered on the first, naming the failure mode. This is the practice working,
not failing: a correction is a claim like any other, held to the same
standard, correctable by the same ritual. A culture where amending a
correction is embarrassing is a culture that stops measuring after the first
amendment.

## Corrections expire: the resolved-marker discipline

The subtlest rot in a correction culture is the correction that outlives its
subject. The exemplar's measured case: a warning block describing a
defective catalog entry stood for four days *after* the entry was fixed —
"the stale artifact was this paragraph, which outlived by four days the
defect it named." Standing corrections and warning blocks therefore carry
**verification dates** ("verified still true [date]"), and a resolved
defect's marker is rewritten as a dated resolution — *what* was fixed,
*when*, *where verified* — not silently deleted, and not left standing as a
live warning. A warnings section is a claim about the present; it needs the
same freshness machinery as any other doc
(see [doc-rot-detection](./doc-rot-detection.md)).

## Why in place beats a changelog entry

The correction belongs at the exact site of the false claim because that
site is where the next reader would have absorbed it. A changelog entry or
errata page corrects readers who go looking for corrections — a population
of approximately zero. In-place correction also compounds into something no
clean document provides: a **calibration record**. A page carrying its own
correction history teaches the reader the local error rate, the
characteristic failure modes ("stale count," "grep answered a different
question," "measurement of the counter"), and the standing instruction the
exemplar distilled from them — *re-measure before citing*. A pristine page
with the same history scrubbed teaches unwarranted confidence.

## The interplay with enforcement

Dated corrections are the manual complement to the mechanical walls. The
enforcement hook collects debt the author knows about at change time; the
rot scan finds staleness by recency; dated corrections handle the third
class — claims discovered false by *use*, long after any change boundary,
usually by an agent or engineer acting on them and hitting reality. The
ritual's cheapness is load-bearing: correcting in place costs one paragraph,
so it happens in the same session as the discovery; anything heavier gets
deferred, and deferred corrections join the drift they were meant to fix.
