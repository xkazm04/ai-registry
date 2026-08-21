---
layer: technique
type: technique
subject: comparative-shortlist-evaluation
technique: robustness-status-taxonomy
status: forged
laws: [absence-of-evidence-is-not-evidence, a-claim-carries-its-sample-and-its-basis, inference-must-look-like-inference]
shared_with: []
use_when: [reporting whether a ranking survived a robustness test, designing the verdict vocabulary for a compare surface, replacing a boolean robustness flag]
---

# Robustness status taxonomy

A robustness check has more than two outcomes, and every outcome a boolean cannot
express is one that gets rendered as the flattering one. This technique fixes the
vocabulary: five closed statuses, each with a distinct epistemic meaning, each
with its own sentence.

The taxonomy is the deliverable. Any two-value flag on this surface — `robust:
true | false`, `stable: yes | no` — is a defect, because at least three of the
five real outcomes below are *not* findings about the candidates at all, and
collapsing them into `false` is as wrong as collapsing them into `true`.

## The five statuses

**`assessed`** — the schemes genuinely varied and the test actually exercised the
order. This is the only status under which a robustness *finding* exists, in
either direction: the order held, or it did not, and either way the claim is
supported. Report alongside it how many schemes were tested and what varied
between them.

**`not_varied`** — the test ran, but every scheme was identical, so "the order
did not change" was guaranteed before it started. The test was a no-op and proved
nothing. This status is explicitly and permanently **not** robust: it is the
single most important distinction in the taxonomy, because a no-op produces the
most reassuring-looking output at the moment the system knows least. Copy for
this state names the reason — uniform weights, no perturbation applied — rather
than reporting an outcome.

**`unavailable`** — a robustness assessment was expected and applicable, but the
ranker produced nothing: it errored, timed out, returned an empty result, or was
skipped by a degraded path. The honest sentence is "could not assess." It is not
"unchanged," it is not "robust," and it is emphatically not silence, because
silence next to a confident leader reads as endorsement —
[absence of evidence is not evidence](../../../../_laws.md#absence-of-evidence-is-not-evidence).

This status must also absorb a check whose *output* is unreadable, not only one
that failed to produce output. A robustness result is typically a set of parallel
collections — labels, schemes, per-scheme scores, a square matrix, a ranking —
that a consumer indexes in lockstep. If it is persisted once and re-read later, it
will eventually be re-read malformed: a truncated write, an upstream shape change,
a hand-edited record. Validate the shape before trusting it, and treat a
misaligned result exactly like a missing one, because **an unreadable check is not
a check**. The alternative is worse than a wrong status: an unguarded index into a
malformed result takes the whole comparison surface down — including the control
that would have re-run the check and replaced the bad record. Degrading to "could
not assess" keeps the repair path reachable.

**`not_applicable`** — no ranker applies to this evaluation at all: the score is
unweighted, single-dimension, or produced by machinery with no weighting to
perturb. Nothing failed. The distinction from `unavailable` is the whole point —
one says the instrument broke, the other says there was no instrument to run —
and conflating them either raises false alarms or hides real ones. Under this
status, no robustness claim is made in either direction.

**`insufficient_sample`** — the cohort is below the head-to-head floor. No
robustness is claimed *and no leader is crowned*: this status suppresses the
crown too, because robustness of a one-candidate order is meaningless in a way
that would be actively misleading if the crown survived it. It carries the cohort
size —
[a claim carries its sample and its basis](../../../../_laws.md#a-claim-carries-its-sample-and-its-basis).

## Why five and not three

The three that are commonly missing are `not_varied`, `not_applicable` and
`unavailable`, and each has a distinct downstream consequence:

- `not_varied` is a **configuration defect**. Somebody's weights never got set,
  or a default overwrote them. It should generate an operational signal, not just
  a UI state, because a system silently running vacuous robustness tests will do
  so for months.
- `unavailable` is a **reliability signal**. Repeated occurrences mean the ranker
  is failing, which is a fix, not a caveat.
- `not_applicable` is **steady state** for a whole class of evaluations and must
  never generate either signal.

Merge any two of them and one team's alarm becomes another team's background
noise. That is how an honest instrument decays into a decorative one.

## Procedure

1. **Define the statuses as a closed set** in one place, with the epistemology
   written next to each value rather than in a design document. The comment
   explaining why `not_varied` is not robust is load-bearing code, and it is the
   first thing a future refactor will delete if it is not there.
2. **Compute the status before the copy**, from the evaluation's actual state:
   cohort size first, applicability second, availability third, variance fourth,
   outcome last. The order matters — a cohort of one that also had uniform weights
   is `insufficient_sample`, because the more fundamental refusal wins.
3. **Reject unrecognised values.** An unknown status must not default to a pass.
   It resolves to the most conservative state the surface has, in line with
   [uncertainty resolving toward the candidate](../../../../_laws.md#uncertainty-resolves-toward-the-candidate).
4. **Give each status its own sentence**, written once, so no two statuses can
   share phrasing through a template fallback.
5. **Seal the status with the verdict**, so the record says how much the system
   claimed to know, not just what it concluded.

## Decision rules

- When the status is anything other than `assessed`, no robustness claim appears
  in any summary, recommendation or exported document — including generated prose.
  A narrating model receives the status as an input and is forbidden from
  inferring it; a model handed raw ranks will invent robustness language every
  time, and inference must be visible as inference:
  [inference must look like inference](../../../../_laws.md#inference-must-look-like-inference).
- When the status is `insufficient_sample`, suppress the leader as well. This
  status is the one that reaches outside its own field.
- When a surface can only render two states, render `assessed` and *everything
  else*, with the "else" copy saying not assessed — never the reverse, and never
  by mapping the other four onto `false`.
- When the status changes between a preview and a commit, the preview is stale
  and must be re-derived rather than trusted; a comparison is bound to the pool
  and the schemes it ran over.

## When not to use it

Do not stretch this vocabulary onto the separation question. Separation has its
own three states and different semantics; a single merged status field for "how
confident is this comparison" collapses two independent failure modes — thin
evidence and weighting sensitivity — into one word, and a candidate can be
strongly separated but weighting-fragile, or robust across every scheme but
indistinguishable on evidence.

Do not add a sixth status for degrees of robustness. Strength of agreement is a
number reported *within* `assessed` — how many schemes agreed, which one flipped
— not another enum value. The taxonomy answers "did we test, and could we," and
keeping it to that is what makes it enforceable.
