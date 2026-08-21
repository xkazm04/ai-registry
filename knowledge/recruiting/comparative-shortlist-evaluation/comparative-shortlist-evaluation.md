---
layer: golden-path
type: golden-path
subject: comparative-shortlist-evaluation
status: forged
use_when: [comparing shortlisted candidates side by side, building a ranked slate or a compare view, deciding whether a lead is real, writing a recommendation from a group evaluation]
techniques:
  - minimum-cohort-before-a-comparative-claim
  - confidence-band-lead-separation
  - cross-scheme-weight-robustness
  - role-relevant-exclusive-differentiators
  - refuse-a-cross-currency-comparison
  - robustness-status-taxonomy
---

# Comparative shortlist evaluation

At the end of screening somebody asks the only question the whole pipeline was
built for: *which of these people?* A comparative evaluation answers it by
putting the shortlist side by side — scores, strengths, gaps, a recommendation.
It is the highest-leverage surface in a hiring system and the one most likely to
lie, because a comparison is trivially easy to produce and a *justified*
comparison is not.

The distinction that carries this subject: **an ordering is always available; a
lead is a claim.** Any set of numbers can be sorted. Sorting never fails, never
warns, and never runs out of confidence. So a system that computes scores and
sorts them will happily crown a winner over a field of three people whose
evidence is so thin that the numbers are barely distinguishable from noise — and
it will render that crown in exactly the same typography it uses when one
candidate is genuinely two standard deviations ahead. The recruiter cannot tell
the two situations apart, because the surface did not tell them apart.

Everything below is machinery for keeping those two situations visibly
different.

## The four questions a compare surface must answer before it names a leader

1. **Is there a cohort at all?** A comparative claim over one candidate is not a
   weak comparison, it is a category error. See
   [minimum-cohort-before-a-comparative-claim](techniques/minimum-cohort-before-a-comparative-claim.md).
2. **Is the gap bigger than the uncertainty?** Two point estimates differ; that
   is arithmetic. Whether the *people* differ is a question about the width of
   the evidence behind each number. See
   [confidence-band-lead-separation](techniques/confidence-band-lead-separation.md).
3. **Does the order survive a different opinion about what matters?** A ranking
   is a function of weights nobody in the room formally agreed to. See
   [cross-scheme-weight-robustness](techniques/cross-scheme-weight-robustness.md)
   and, for how to report the answer honestly,
   [robustness-status-taxonomy](techniques/robustness-status-taxonomy.md).
4. **Can it say anything a total cannot?** The useful output of a comparison is
   not the delta between two totals; it is what each person brings that no rival
   brings and the role actually needs. See
   [role-relevant-exclusive-differentiators](techniques/role-relevant-exclusive-differentiators.md).

And one question that must be answered *before* any of them: which dimensions
are even commensurable. Some fields look comparable and are not, and the correct
handling is not a careful caveat but withholding the field from the comparer
entirely — see
[refuse-a-cross-currency-comparison](techniques/refuse-a-cross-currency-comparison.md).

## The point estimate lies about its own precision

Every scoring engine worth using already knows how uncertain each candidate's
score is. It knows the résumé was two pages and the other was ten; it knows one
person had a structured interview and the other has only a self-assessment; it
knows which competencies were never reached. That knowledge is usually computed —
as a coverage figure, an evidence-tier count, a completeness ratio — and then
discarded at the moment of ranking, because ranking takes one number per row.

A band is only half the instrument. Each thing that widened it must record a
named, recruiter-readable reason — *fewer than three skills listed*, *education
level unknown*, *misses three must-haves* — because a bare numeric range gets read
as a statement about the person rather than about the record, and nobody can act
on a width. Drivers are also what makes the band falsifiable: a recruiter who
sees the reason can supply the missing evidence and narrow it.

The result of discarding all this is the characteristic defect of this subject:
**a two-point gap
between two wide bands is presented exactly like a twenty-point gap between two
tight ones.** The crown, the ordering, the recommendation sentence and the sealed
record are all identical in the two cases. Nothing in the artifact records that
one of them was a coin flip.

The fix is smaller than it looks, and the shape of the fix is the load-bearing
insight of the whole subject:

> **Do not re-rank on uncertainty. Change what the ranking is allowed to say.**

Re-ranking is the tempting move — penalize the wide band, demote the uncertain
candidate, produce a "risk-adjusted" order. It is wrong twice over. It punishes
candidates for the *system's* evidence gaps, which are usually artifacts of which
documents a person happened to upload or which interview slot they got, and it
destroys the one honest thing the surface had: the score order actually computed
from the actually-recorded evidence. Uncertainty-adjusted ranks also compound
badly, because the adjustment is itself uncertain.

So the honest order stays exactly as scored. What changes is the *claim
vocabulary* wrapped around it. The lead is qualified, not moved. A surface that
can say "first, and the gap clears the uncertainty" and "first, but the gap is
inside the noise" with the same underlying order has solved this problem; one
that quietly reshuffles rows has replaced a visible error with an invisible one.

## Two floors, and they are not the same number

Comparative work sits next to fairness work, and their sample floors get
conflated constantly, in both directions and with opposite damage.

- The **head-to-head floor** is small — two. Two candidates is genuinely enough
  to say "A ranks above B under this rubric," because the claim is ordinal and
  about these two specific people. Raising this floor to a statistical threshold
  blocks the most common real hiring situation there is: a final pair.
- The **statistical floor** for a selection-rate ratio, an adverse-impact test or
  any group-level proportion is much larger, because a proportion over five
  people is not stable enough to support a claim about a group. Lowering *this*
  floor to two produces a fairness metric that swings wildly and gets quoted in a
  meeting.

Keep them as separate named constants with separate justifications written down
next to them, and never let one be reused for the other because the numbers
happened to be close in some release. A single shared floor is guaranteed to be
wrong for one of the two uses.
[A claim carries its sample and its basis](../_laws.md#a-claim-carries-its-sample-and-its-basis)
applies to both — it just resolves to different numbers.

## Weights are somebody's opinion, and the test for that has a trap

A weighted total is a value judgment: technical depth counts this much,
communication counts that much. Different people in the same hiring loop hold
different weightings, and the difference is legitimate, not error. So the useful
robustness question is not "is the score right" but "**does the order hold under
someone else's weighting?**" A candidate who stays on top under the hiring
manager's yardstick, the team lead's yardstick and the rubric's default is
robustly strong. A candidate who is on top only under the yardstick most
flattering to their own profile is an artifact of the weighting.

The trap sits one level down and it is subtle enough that many implementations
ship it: **if every scheme in the test is identical, the test is a no-op.** Rank
the same candidates under the same weights three times and the order is unchanged
by construction. "Order unchanged" is then a mathematical certainty that carries
zero information — and reporting it as "robust" is manufacturing a confidence
claim out of nothing. This is why robustness needs a *status* rather than a
boolean: the honest answer to "did the perturbation change the order?" when there
was no perturbation is "the test did not run," and no schema with only
true/false can express it.

## What a comparison is allowed to conclude, and who concludes it

The machine may order, band, flag separation, surface exclusive strengths and
recommend. It does not advance and it does not reject:
[no adverse outcome is solely automated](../_laws.md#no-adverse-outcome-is-solely-automated)
governs the compare surface as much as the screening gate, and a compare view is
in fact where the pressure to violate it is highest, because the interface is one
click from an action and the recommendation reads like a decision.

Two seams to neighbouring practice, named rather than duplicated here:

- **Committee and eligibility-list regimes** — works councils, public-sector
  competitions, statutory panels, any process where a ranked list has legal
  standing or where the machine may never seal a winner at all — belong to the
  collective and statutory hiring governance practice. That practice constrains
  *whether* a comparison may be sealed and by whom; this one governs how the
  comparison is computed and phrased once it is permitted. If your regime forbids
  a machine-sealed leader, you still want everything in this subject, minus the
  crown.
- **Model plumbing** — routing, retries, degradation, cost and judge scaffolding —
  belongs to the general observability practice. What stays here is the hiring
  half: what a prompt comparing two people may not be handed, what a degraded
  comparison means for the candidates in flight, and why the verdict vocabulary
  is closed.

## The naive readings, and what each one costs

**"Just show the ranking."** Ships the two-point-versus-twenty-point defect
described above. The recruiter reads rank order as evidence order and never learns
otherwise.

**"Break the tie so the list looks decisive."** Tie-breaking by candidate
identifier, by application time, by alphabetical order, or by whichever row the
sort happened to touch last, is arbitrary selection wearing the costume of
analysis. At an irreversible cutoff,
[uncertainty resolves toward the candidate](../_laws.md#uncertainty-resolves-toward-the-candidate):
the tie is reported as a tie and the whole tied group is preserved for human
judgment.

**"Ask the model who is best."** A comparison prompt that receives raw profiles
and is asked for a winner will always produce one, fluently, with reasons. The
reasons are post-hoc: the model has no access to the cohort floor, no notion of
band width, and no way to know which fields were incommensurable. Comparative
claims are computed by deterministic machinery and *then* narrated; a model that
is asked to narrate must be handed the separation status, not asked to infer it.

**"Normalize the scores so the chart has spread."** Rescaling a cluster of near-
identical scores to fill an axis converts noise into visible distance. Every
comparative visual must preserve the real gap on a fixed scale, and a compressed
cluster should look compressed.

**"Compare against the ideal candidate."** A shortlist comparison is between the
people who actually applied. Introducing a synthetic reference profile makes
every real candidate a deficit, and the deficits are unfalsifiable because the
reference never had to prove anything.

**"They said thirteen years, so they beat the one who said ten."** Self-reported
quantities on both sides of a comparison are not comparable to measured ones on
either side, and
[inference must look like inference](../_laws.md#inference-must-look-like-inference)
applies with extra force here, because side-by-side layout implies commensurability
by geometry alone. If one column's figure came from a document and the other's from
a demonstration, the surface says so in both columns or compares neither.

## The comparison is bound to the pool it compared

A comparative verdict is meaningful only over the exact set it ranked. Add a
candidate, remove one, or re-run after a late application lands, and the previous
verdict is not stale — it is *about something else*. Second place in a field of
four and second place in a field of seven are different facts.

So the sealed record fingerprints the candidate set, and a changed pool produces
a new evaluation rather than a cache miss on the old one. The fingerprint is
order-independent — reordering the same people is the same comparison — and
carries the set size alongside the digest so two differently-sized sets cannot
collide into one another.

The identity is wider than the pool, and this is the part most systems miss: it
must also fold the **governance regime** the comparison ran under. Switching a
role from an ordinary shortlist to a committee or statutory mode changes what the
machine is permitted to conclude, so a request under the new mode that reuses an
in-flight run from the old one is handed a verdict computed under rules that no
longer apply — typically an auto-sealed leader in a regime that forbids one. The
identity of a comparison is the role, the pool *and* the rules.

This is the compare-surface reading of
[a verdict is bound to what it judged](../_laws.md#a-verdict-is-bound-to-what-it-judged),
and it is also a straightforward correctness property: caching keyed on the role
and the rubric but not on the cohort will serve a comparison of people who are no
longer the ones being compared.

Seal, alongside the order: the cohort size, the separation status, the robustness
status, the weighting scheme actually applied, and the fields deliberately
withheld as incommensurable. A recruiter re-reading the record six months later
in a challenge needs to reconstruct not just who won, but how much the system
claimed to know when it said so. Anything the record does not hold, the summary
does not say —
[say only what the record holds](../_laws.md#say-only-what-the-record-holds).
