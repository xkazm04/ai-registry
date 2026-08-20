---
layer: technique
type: technique
subject: remediation-roadmaps
technique: invitational-framing
status: forged
laws: []
shared_with: []
use_when: [writing the title of a recommendation about someone's own work, an assessment reads as accusatory, deciding what a tool is allowed to tell a person to do]
---

# Invitational framing

The concern: an assessment has just told a person their work is deficient,
and the roadmap is where that judgment becomes instructions. The grammar of
those instructions decides whether the reader engages or defends. A plan that
issues orders about someone's own work — from a tool, with a number attached
— is answered with justification, not action, and an item nobody acts on has
a realized gain of zero however good its projection was. Wording is therefore
load-bearing, not polish, and it is specifiable as rules rather than left to
whoever writes the copy.

## The core rule: a title is an observation, never an imperative

The item's title names what is missing or thin. The body offers the move.

- Observation: "There is no recorded owner for the release step." "Only two
  of the six documented steps have a verification." "The intake process has
  no stated turnaround."
- Imperative (forbidden in titles): "Add an owner to the release step."
  "Verify the remaining four steps." "Publish a turnaround target."

The difference is not politeness. An observation is a *claim about the world*
that the reader can check, agree with, correct, or dismiss on their own
evidence — it hands them the judgment. An imperative asserts authority the
tool does not have, and invites the reader to litigate the authority instead
of the finding. When the observation is right, the move is usually obvious;
when the observation is wrong, the reader can say so, which is information
the plan wants.

The stance to hold across the whole artifact: the tool is a **companion to a
transition, not a boss**. It knows the rubric and the numbers; the reader
knows the constraints, the history, and the deadline. The artifact's job is
to put what the tool knows in front of the person who knows the rest.

## The strongest form: the action slot holds questions

There is a version of this that goes further than wording, and it is the one
worth reaching for when the reader knows their domain better than the
assessment does. Instead of a step list, the item carries **two or three open
questions** that lead the reader to the gap themselves: "if a change were
proposed tomorrow, what would catch a regression before it merged?" —
"which behaviors currently have nothing vouching for them?" The questions are
inputs to a judgment, not instructions to execute, and they work because the
reader answers them with knowledge the tool does not have.

This is not a softer step list with question marks. A question that has one
obvious intended answer is an imperative in costume and reads as
condescending. The test is whether a well-run team could answer it with
"we already do, here", and have that be a *useful, correct* outcome that
closes the item honestly. Where the move genuinely is mechanical and
unambiguous, a plain step is more respectful than a rhetorical question;
reserve the question form for gaps whose right resolution depends on context.

## Checkable constraints

Wording rules that survive contact with a team are the ones a review — human
or automated — can apply:

- **No title begins with a bare verb** in the imperative mood. This single
  check catches most violations and is trivially testable over a catalog.
- **No title contains "you should", "you must", "make sure", "don't forget",
  or "immediately".** These are the tells of a supervisory register.
- **No item shames.** Describe the gap, never the actor: "there is no test
  covering X", not "nobody tested X" and certainly not "this was neglected".
  The reader is frequently not the person who made the gap, and even when
  they are, blame buys nothing the observation does not.
- **No urgency the assessment cannot justify.** Severity is a computed field
  with a definition; adjectives that assert urgency without it are the
  wording equivalent of a fabricated number.
- **The title must not contradict its own body.** An observation is a factual
  claim, so it can be wrong in a specific, checkable way — titling an item
  "the checks run but do not block" while the body explains that the checks
  never run at all. This is the characteristic defect of items composed from
  templates or generated text, and it destroys more trust than clumsy tone
  does, because the reader now has evidence the instrument does not
  understand their situation.
- **The reader's agency appears in the verbs.** "Where this matters to you",
  "if this is the right season for it", "one way to close it". Not hedging
  the finding — hedging the *instruction*.

Because these are constraints on a fixed catalog rather than on free
generation, they can be enforced once, at review time, over a set of entries
that is small and enumerable. That is one of the strongest arguments for a
catalog: tone is a reviewable artifact rather than a per-run gamble.

## Declining is a first-class outcome

Framing that invites, over a mechanism that only accepts, is a lie with good
manners. The artifact must make "no" a real, supported, unpunished path:

- Every item can be dismissed, and dismissal is recorded as a legitimate
  state — not as an item left rotting in an unchosen pile.
- A dismissal may carry a reason, and the reason is *the most valuable
  feedback the roadmap produces*: it is how the catalog learns which entries
  are irrelevant, mis-scoped, or already handled.
- A dismissed item does not silently return, identical, on the next run. It
  either stays dismissed or returns with a visible acknowledgement that the
  reader saw it before, because an item that reappears unchanged after being
  declined tells the reader their input was discarded.
- Nothing in the score punishes declining. Ranking may deprioritize a
  dismissed area, but the composite is a measure of the work, not of
  compliance with the plan.

## Where invitation is the wrong register

Invitational framing has a boundary, and pretending otherwise is its own
dishonesty. Where a finding is a genuine floor violation — a safety, legal,
or correctness breach — softening it into an option misrepresents the stakes.
The resolution is not to switch to imperatives but to change the *category*:
such findings are surfaced as blocking conditions with their consequence
stated plainly ("this fails the stated minimum for X"), separate from the
invitational opportunity list. The reader still decides; they are simply told
what the decision costs, and the plainness is the respect.

## When not to use it

- **In machine-consumed payloads.** Once an item is accepted and packaged for
  an executing system, that system wants an unambiguous instruction. Carry
  both forms — the observational title for humans, an explicit action field
  for machines — rather than making a downstream parser infer a verb from
  polite prose.
- **When the reader has explicitly asked for directives.** An operator who
  says "just tell me what to do" has granted the authority; honor the
  request, and keep the observation available underneath so the finding
  remains checkable.
