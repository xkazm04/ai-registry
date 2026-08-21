---
layer: technique
type: technique
subject: assessment-instrument-validation
technique: adversarial-persona-red-teaming
status: forged
laws: [say-only-what-the-record-holds, inference-must-look-like-inference, uncertainty-resolves-toward-the-candidate]
shared_with: []
use_when: [an assessment could be gamed by writing to the rubric, scoring relies on what a candidate says they did, deciding which checks in a pipeline are load-bearing]
---

# Adversarial persona red-teaming

Every assessment has two populations: people trying to do the work, and people
trying to score well. The second population is real, it is not small, and it is
not the same as dishonest — writing to the rubric is a rational response to
being graded. An instrument validated only against honest effort is validated
against half its inputs.

Red-teaming an instrument means putting deliberately adversarial submissions
through the real scoring path and asserting that they do not outrank honest
work. It is the half of the synthetic cast that finds the defects nobody
predicted, because rubric inspection cannot find them: a rubric that can be
gamed looks entirely reasonable on the page.

## The adversarial cast

Five personas recur; add the ones specific to your instrument.

- **The prompt-crafter.** Treats the brief as a specification for the grader.
  Mirrors its vocabulary, produces exactly the requested structure, names every
  named criterion, and engages minimally with the underlying problem. Tests
  whether the rubric rewards form.
- **The minimal-effort candidate.** Does the least that satisfies the letter of
  the brief. Not adversarial in intent, adversarial in effect: this persona
  establishes the honest floor that every gaming persona must be compared
  against, and a gamer scoring above it is a specific, quantified vulnerability.
- **The delegator.** Passes the task to an assistant and forwards the output
  largely unreviewed. Tests whether the instrument can distinguish a candidate
  from their tooling — and whether the answer it gives is one you can defend to
  the candidate, which is where the practice on assistance detection and
  fairness takes over.
- **The verifier.** The honest ceiling: does the work and checks it. Present in
  the adversarial run because the gaming personas are meaningless without a
  reference for what genuine strength looks like under the same conditions.
- **The gamer.** Fabricates process signals: reports steps not taken, checks not
  run, verification that did not happen. The most important persona in the cast
  and the one most often missing.

## The finding that generalises

Run a gamer through a layered scoring pipeline and the result is consistent
enough to design around: **under a layer that reads declared process signals,
the fabricator ties with honest mid-range candidates.** It reports everything
the honest strong candidate reports, because reporting is free. Only the layer
anchored in the artifact the candidate actually produced separates them, because
that layer reads something the fabricator would have had to do the work to
create.

Two design rules follow, and they are the reason this technique exists:

1. **Process signals are supporting evidence; artifact-anchored checks are
   load-bearing.** Weight accordingly. An instrument whose discriminating power
   lives in self-report has a ceiling equal to the candidate's writing ability.
2. **Never add a self-report question to fix a gaming vulnerability.** The
   instinct after finding the tie is to ask the candidate to confirm their
   process more specifically. The fabricator answers that too. The repair is
   always to move weight onto something the artifact can be checked for.

Telemetry does not escape the rule. Activity captured on the candidate's own
device — what was opened, when, in what order — is emitted by something the
candidate controls, and even a perfectly chained event log proves *when*
something happened, never that the thinking behind it was sincere. Behavioural
telemetry is a richer flavour of self-report, not a category above it.

## Plant known defects: the artifact-anchored discriminator that works

The strongest artifact-anchored check found in practice is deliberately simple:
**seed the supplied material with real, pre-verified defects and score whether
the submission addressed each one or carried it through.** The defects must be
genuine — actual flaws a practitioner would find and fix, verified before the
exercise ships — not planted tripwires, or the instrument measures puzzle-
spotting instead of work.

Planted defects survive fabrication in a way nothing else in the pipeline does.
A gamer can narrate any process; they cannot make a defect they never found
disappear from the artifact they submitted. The check is also cheap, fully
deterministic, independent of any judge, and legible to a candidate afterwards —
which matters, because the candidate is owed an explanation of what was measured.

One rule about the check's own defaults, and it is the failure that was actually
shipped: **a defect in material the submission never touched must read as
carried-through, not as addressed.** The tempting implementation asks "is the
flawed fragment still present in what they submitted?" — and a submission
containing only changed material trivially answers no, handing every unattempted
defect a free pass to whoever attempted least. The same rule has a sharper second
edge: when the submitted material does not *descend* from the seeded material —
a wholesale rewrite, or a same-named artifact produced from scratch — the
absence of the defect proves nothing either, and the honest status is a fifth
one, **unverifiable**, alongside addressed, called-out, carried-through and
not-graded. A check that mints "addressed" off a foreign base does more than
mis-score one submission: where that verdict is handed onward to a judge as
ground truth it can *invert the entire ranking*, because the judge is reasoning
from a fabricated fact about the artifact. A deterministic check that feeds a
downstream judge must be conservative in exactly this direction — it is not
scoring, it is testifying. **Poisoned ground truth is worse than no ground
truth**: a judge told that a defect was addressed weights that fact exactly as
instructed, and one corrupted mechanical verdict can move a fabricator above
every honest candidate. Absence of the fragment is not
evidence that it was fixed
([absence-of-evidence-is-not-evidence](../../../_laws.md#absence-of-evidence-is-not-evidence)).

The same asymmetry appears in what the instrument may then *say*. A fabricated
process report is not evidence of fabrication; it is an absence of corroboration.
The instrument records what the artifact holds and declines to conclude anything
about intent ([say-only-what-the-record-holds](../../../_laws.md#say-only-what-the-record-holds)) —
a mismatch between a claimed step and an artifact that shows no trace of it is a
finding for a human reviewer, marked as a discrepancy, never rendered as an
accusation
([inference-must-look-like-inference](../../../_laws.md#inference-must-look-like-inference)).

## Assert only sound invariants

The temptation, having built a rich adversarial cast, is to assert its full
ordering. Resist it. Whether the prompt-crafter should outrank the minimal-effort
candidate is a genuine question about what the role values, and encoding an
answer produces a suite that fails for reasons that are about your assumptions
rather than the instrument.

Assert the undeniable directions only:

- the verifier outranks the gamer;
- the gamer does not outrank the honest floor;
- a fabricated process report does not reach the top band;
- an unattempted submission does not outrank an attempted one.

Report everything else — the clusters, the ties, the one-rank inversions —
without asserting it. That reported band is where the design findings actually
appear, and a suite over-specified into constant redness gets muted before
anyone reads them.

## Procedure

1. **Write each adversarial persona as a strategy brief**, one behaviour per
   persona, and freeze the resulting submissions with the brief that produced
   them.
2. **Run them through the production scoring path**, capturing every layer's
   output separately — the whole point is to see *which* layer separates them.
3. **Compare each adversarial persona against the honest floor and the honest
   ceiling**, and require the margin the gate defines.
4. **Locate the separating layer.** If the only separation comes from a layer
   you were treating as supplementary, your weighting is inverted.
5. **On a tie, repair by adding an artifact-anchored check**, then re-run the
   whole cast — a repair aimed at one persona routinely breaks the ordering of
   another.
6. **Keep every persona a real candidate inspires.** The field's creativity is
   the best source of adversarial cases you will ever have.

## Decision rules

- **When the gamer ties the honest middle, treat it as a blocking defect, not a
  note.** It means the instrument's mid-band is unearned, and the mid-band is
  where most hiring decisions are actually made.
- **When only one layer separates the adversarial personas, that layer is the
  instrument.** Everything else is presentation. Fund it, test it, and never let
  a degraded run silently skip it.
- **When a repair only moves the gamer down without moving the honest personas,
  suspect you have keyed on a surface marker** of how the gaming submissions
  were written rather than on the absence of work.
- **When the delegator scores well, decide deliberately whether that is
  wrong.** For many roles it is not. The instrument should measure what the
  role requires, and that decision is a role decision, recorded, not a default
  buried in a rubric.
- **When an adversarial finding is severe, the honest response before the
  repair ships is to hold the instrument, not to warn reviewers about it.**
  Uncertainty at an adverse gate resolves toward the candidate
  ([uncertainty-resolves-toward-the-candidate](../../../_laws.md#uncertainty-resolves-toward-the-candidate)).

## When not to use it

Red-teaming has no purchase where nothing can be gamed — a proctored,
deterministic instrument with a single verifiable answer needs correctness tests
rather than adversarial personas. It is also not a fraud-detection programme:
the output is a statement about the *instrument's* susceptibility, and turning
it into a detector aimed at individuals is a different practice with different
fairness obligations, owned by the neighbouring subject on assistance detection.
And an adversarial cast built only from what your team can imagine is a floor,
not a bound; it never justifies a claim that the instrument cannot be gamed.
