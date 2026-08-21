---
layer: technique
type: technique
subject: conversational-assessment-validation
technique: persona-by-behaviour-heatmap
status: forged
laws: [a-claim-carries-its-sample-and-its-basis, absence-of-evidence-is-not-evidence]
shared_with: []
use_when: [a validation run reports a headline pass rate and nothing else, deciding whether a failure is a policy defect or a persona artifact, presenting conversational validation results to people who must act on them]
---

# Persona-by-behaviour heatmap

A single pass rate over a behaviour cast destroys the finding. Eighty-seven
percent tells you nothing you can act on: it does not say whether the failures
are spread thinly across everything (a weak instrument) or concentrated in one
cell (a specific, fixable defect). The heatmap is the deliberate refusal to
aggregate — the run's primary output is a **matrix of personas against
behaviours**, each cell carrying its own outcome, and the headline rate is a
footnote beneath it.

The two axes are chosen because failures cluster along both, in different ways:

- **Along a behaviour column**, a failure means the *policy* has a hole. Every
  persona fails the score demand — the rule about verdicts is missing, misplaced
  or too weakly worded. This is the finding that changes the brief.
- **Along a persona row**, a failure means the instrument breaks for a *kind of
  person*. The near-silent candidate fails across most behaviours — the
  interviewer cannot handle low engagement, and the fairness consequence is
  immediate, because low engagement correlates with anxiety, with unfamiliarity
  with the format, and with interviewing in a second language. A row failure is
  usually a bigger problem than a column failure and is almost always discovered
  later, because rows are what averaging hides.
- **A single hot cell** — one persona, one behaviour — is either a genuine
  interaction (this instrument mishandles hostility *specifically from* a
  senior-sounding persona) or a case artifact. Distinguishing them is what the
  next section is for.

## Order the view by worst, and start with the margins

Two presentation choices decide whether anyone acts on the picture.

**Sort by worst reliability first, breaking ties toward the larger group.** A
matrix rendered in declaration order buries the finding under whatever behaviour
happened to be listed first; a matrix whose top row is the thing most broken,
weighted by how much of the cast it represents, needs no reading instructions at
all.

**Ship the margins before the cross.** A full persona-by-behaviour cross is the
right conceptual object, but every cell of it is thin, and a thin cell is a
coin-flip rendered as a diagnosis. The cheap and often sufficient first version
is the two **marginal** views — reliability and quality grouped by behaviour,
and grouped by persona attributes such as seniority — each cell of which has the
whole cast behind it. Those margins find the column and row failures, which is
most of the value. Build the cross when the margins stop explaining the
failures, and only with enough conversations per cell to mean something.

## Reading the matrix

The matrix is read in a fixed order, and the order matters because each read
answers a question the next one depends on.

1. **Any red on the reliability axis, anywhere?** That closes the release. Stop.
2. **Any full column red?** Policy hole. The brief is missing a rule or the rule
   is in the wrong place. Fix the instrument, not the case.
3. **Any full row red?** Population failure. Ask who that persona resembles in
   the real applicant pool before deciding severity.
4. **Diagonal or scattered red?** The instrument is generally weak; a targeted
   fix will not help and the honest read is that it is not ready.
5. **Isolated cells?** Read the transcripts. Half will be case artifacts.

## Separating a real cell from an artifact

The most expensive mistake with a matrix is treating every red cell as an
instrument defect. Three checks, in order:

- **Was the stimulus delivered?** If the simulated candidate never actually
  performed the behaviour, the cell is *not evaluable*, not a fail — and, more
  dangerously, the corresponding green cells elsewhere are not passes either
  ([absence-of-evidence-is-not-evidence](../../../_laws.md#absence-of-evidence-is-not-evidence)).
- **Does it reproduce?** Conversational runs are stochastic. A cell that is red
  once in three runs is a rate, not a fact, and should be reported as one.
- **Does it survive a persona swap?** Move the same behaviour to a neighbouring
  persona. If it stays red, it is a behaviour finding wearing a persona's
  clothes; if it clears, the interaction is real and worth naming.

## Carrying the sample

Every cell carries its conversation count, and cells below the floor render as
*insufficient* rather than as a colour
([a-claim-carries-its-sample-and-its-basis](../../../_laws.md#a-claim-carries-its-sample-and-its-basis)).
A matrix of one-conversation cells is a picture of run-to-run variance rendered
as if it were a diagnosis, and it will be believed, because matrices are
persuasive in a way tables of numbers are not. Where the budget cannot fill
every cell, thin *within* behaviours rather than dropping behaviours — a missing
column reads as white space, and white space reads as fine.

The unit is the conversation, not the turn. Cells counted in turns quote a
sample they do not have, since turns inside one conversation are conditioned on
each other.

## Procedure

1. **Fix the two axes from the behaviour bank** — personas down, behaviours
   across — and keep them stable across releases so matrices can be diffed.
2. **Run every cell to the same conversation count**, or record which cells were
   thinned.
3. **Colour each cell by its worst axis**, not its average: a cell with a
   reliability breach is red even if quality was excellent.
4. **Render the matrix before the summary**, and put the headline rate under it.
5. **Attach one transcript excerpt per red cell**, chosen by the failing turn.
6. **Diff against the previous release's matrix**, cell by cell — the diff is
   the regression signal, and a new red cell in an untouched area is the most
   valuable output the run produces.

## Decision rules

- **When the headline rate improves but a row goes red, the release regressed.**
  Population failures are never offset by aggregate gains.
- **When a column is red and a rule already exists for it, the problem is
  position or form, not content** — the rule is probably too far from the end of
  the brief, or it asks for an extra conversational move.
- **When a cell has fewer conversations than the floor, it is not a finding.**
  Say insufficient and mean it.
- **When the matrix is mostly white because cells were never run, report
  coverage as a number beside the rate.** An unrun cell is the failure mode this
  whole technique exists to prevent.
- **When two personas never differ anywhere in the matrix, merge them.** They
  are the same test wearing two names, and they inflate every denominator.

## When not to use it

A matrix needs both axes to be meaningful. Where personas are cosmetic — the
same behaviour with different names attached — the rows carry no information and
the matrix invites conclusions the design cannot support. It is also the wrong
presentation for a single-property regression check, where a diff of one number
against a baseline is clearer. And a heatmap is a diagnostic, never a claim
about a real population: colours over simulated candidates are colours over
somebody's imagination of candidates, and the report must say so wherever the
picture travels.
