---
layer: technique
type: technique
subject: adoption-measurement
technique: attribution-provenance-tiers
status: forged
laws: [count-carries-predicate, one-authority-per-vocabulary]
shared_with: []
use_when: [an adoption number is about to be displayed or exported, a signal source cannot be measured directly, deciding whether a seat or roster count may be reported as adoption]
---

# Attribution provenance tiers

## The concern

Adoption numbers arrive from sources of wildly different fidelity and render
identically. A count derived from observed acts and a count derived from a
purchase order both appear as an integer with a percentage beside it. Once
the two are in the same column, no reader — and no downstream consumer — can
recover which is which, and the weaker one silently acquires the authority of
the stronger. The tier is not metadata about the number; on this kind of
signal the tier frequently *is* the finding.

## The tiers

Grade every adoption signal into a closed, ordered set. Three tiers are
enough, and a fourth is a trap:

1. **Observed** — a specific actor performed a specific act on a specific
   artifact at a recorded time, and the record exists because the act
   happened. This is the only tier that supports a per-actor claim.
2. **Allocated** — a real, trustworthy aggregate divided among candidates by
   a stated rule: a team total spread across its members, an
   organization-wide figure apportioned by headcount or by weight. The total
   is measured; the distribution of it is arithmetic. An allocated signal
   supports population-level claims and never a claim about one member.
3. **Declared** — an assertion of use with no observation behind it: a seat
   assignment, an install, a roster entry, a self-report, an intake form
   answer. Declared signals are evidence of *intent or entitlement*, not
   behaviour. They may be reported. They may never be summed with observed
   counts into one figure.
4. **Fabricated** — a plausible value with no evidentiary source: a modelled
   estimate, a default rate, an external benchmark apportioned to your
   population. This tier does not exist. See the deletion rule below.

The tier vocabulary is defined in exactly one place and every producer and
renderer derives from it (`one-authority-per-vocabulary`). Two hand-kept
copies of a fidelity ladder is how a fifth tier appears in the pipeline and
never appears in the legend.

## The procedure

1. **Tag at the source.** The tier is assigned where the signal is
   constructed, by the code that knows how it was obtained — never inferred
   downstream from the shape of the value. A tier guessed at render time is a
   guess.
2. **Propagate through every derivation.** Any aggregate of mixed inputs
   carries the *lowest* tier present. Averaging one observed series with two
   allocated ones produces an allocated result; there is no rounding up.
3. **Refuse the mixed sum.** Signals from different tiers may sit beside each
   other in a report and may never be added into a single headline figure.
   If a single figure is demanded, publish the observed one and state the
   declared population separately as a ceiling.
4. **Render the tier wherever the number renders.** In tables, exports, API
   payloads and prose, not only in a footnote or a tooltip — a consumer
   reading the data never sees the footnote (`count-carries-predicate`).
5. **Record what the allocation rule was.** An allocated number without its
   divisor is a fabricated number with better manners.
6. **Prove the allocation basis is non-degenerate before entering the
   allocated branch.** Having an allocatable *record* and having an
   allocatable *quantity* are different facts, and conflating them produces
   the most convincing wrong output this technique can generate: a source
   that legitimately reports zero for the quantity you want, divided across
   the whole population, renders every unit at zero — connected-looking,
   confidently sourced, and entirely false. Test the quantity, not the
   connection.

## Decision rules

- If the signal cannot name the actor and the act, it is not observed —
  regardless of how precise the number looks.
- If you divided something to get it, it is allocated, and the per-member
  value is presentational only. Never let an allocated per-member value seed
  a per-person view, a ranking, or an eligibility test.
- If the only evidence is that someone *could* have used it, or *said* they
  used it, it is declared. Report it as coverage or entitlement, never as
  usage.
- If a consumer needs a tier your data cannot support, the answer is "not
  measured", not a downgrade of the question into a tier that can be faked.
- If you improve the *weight* an allocation divides by — swapping a
  self-declared marker for a grounded artifact-level one, say — the number
  gets better and the tier does not change. A sharper divisor is still a
  divisor. Tier upgrades come only from new observation.
- "Not measured" is not zero. An absent signal renders as absent, with the
  reason and a path to obtaining it; a zero in the same cell will be read as
  a measured absence of activity and quoted as one.

## The deletion rule

When a tier cannot be honestly populated, **remove it from the product**
rather than filling it with a plausible value and marking the result as
uncertain. Concealment strategies that feel responsible and are not:

- a lock icon or paywall over the fabricated value — the value is still
  computed and still leaves through every non-visual path;
- a greyed or blurred rendering — presentation, not data;
- a confidence flag beside it — flags are dropped by the second consumer
  downstream;
- a "sample" or "illustrative" label — labels do not survive a copy-paste
  into a slide.

The reason this is stricter than the general handling of uncertain numbers is
that a fabricated adoption figure is *load-bearing for a budget decision* and
sits in a report whose reader wants it to be high. Uncertainty markers are a
defence against confusion; they are no defence at all against motivated
reading. The absent row is the honest artifact, and it is also the one that
creates pressure to go and obtain the real signal.

Note the distinction from the corpus law that deleting an artifact does not
repair a defect: what is deleted here is the *fabricator*, not the evidence
of a problem. The gap it leaves must be visible — an explicit "not measured"
state, not a silently shorter list.

Deleting it is also not enough on its own, because the shape of the pipeline
remains and someone will refill it. Pin the property with a check: **the
output must not vary with an identifier that carries no evidence.** If a
value changes when a unit is renamed, it was derived from the name, and the
name is not a measurement. That check is cheap, it fails loudly if the
fabricator returns in a new costume, and it is the only durable guard once
the original author has moved on.

## When not to use this

- **Do not tier what has only one source.** If every signal in a report is
  observed and always will be, a tier column is noise. Introduce the ladder
  when the second source appears — and it will.
- **Do not use tiers as a quality score.** They grade provenance, not value.
  A declared roster is the correct and best available answer to "who is
  eligible"; it is only wrong when it is asked to answer "who used it".
- **Do not tier outcome metrics with this ladder.** Outcome evidence has its
  own honesty apparatus and its own subject; borrowing this vocabulary for it
  invites exactly the joining of ledgers this subject forbids.
