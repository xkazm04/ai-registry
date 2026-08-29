---
layer: technique
type: technique
subject: evidence-bound-visuals
technique: figure-must-cite-a-fact
status: forged
laws: [output-never-outruns-evidence, unmeasured-is-not-pass]
shared_with: []
use_when: [validating scene or frame specs, putting any number or dated label on screen, building the text layer of a compositor]
---

# Figure must cite a fact

Every checkable element that reaches the screen — a number, a dated label, a
plotted value, a named quantity — carries a reference to the fact record
that sourced it, and the reference must resolve against the actual research
corpus for this piece. No reference, no render. This is the binding that
makes "every figure on screen is traceable" a property of the system rather
than a hope about the workflow.

## Why the bare number is worse than no number

A screen figure is read as a checked figure — that is what putting a number
on screen *means* to a viewer. So an unbound figure is not a smaller claim;
it is the same claim with nobody behind it. And it is corrosive beyond
itself: once one number on screen is unowned, every number's chain of
custody is in doubt, because they are visually identical. The gate exists to
keep the population pure, which is why it admits no exceptions for
"obviously fine" figures. Obviously-fine is exactly the grade of figure that
drifts: a model paraphrasing the script rounds a number, updates a year,
merges two adjacent figures — each individually plausible, none sourced.

## The procedure

1. **Type the text layer by role.** Distinguish at minimum: figures
   (assert a quantity), labels (name a thing), captions (carry a sentence),
   and kickers (frame the moment). The fact-reference obligation attaches
   by role — figures always, labels when they date or quantify, captions
   and kickers usually never. Without roles, the gate must either check
   everything (false rejections on every caption) or nothing.
2. **Bind by identifier, not by content.** The element carries the fact
   record's id. Binding by restating the value invites the exact drift the
   gate exists to catch — the restatement becomes a second, unchecked copy.
3. **Validate in two steps, both rejecting.** A figure with no fact id is
   rejected outright. A fact id that does not resolve in this piece's
   corpus is *also* rejected — a citation to a fact that is not there is a
   fabricated citation, the failure in its most convincing costume. The
   second check is the one naive implementations skip, and it is the one
   that catches a generator inventing plausible-looking ids.
4. **Enforce in a validator, not a prompt.** Ask a generator to cite facts
   and it will comply most of the time; the gate exists for the other
   times. The rule lives in deterministic parsing code that throws, so a
   violation cannot reach the compositor at all. Prompt-side instruction is
   still worth writing — it raises the pass rate — but it is persuasion,
   not enforcement, and the system's guarantee comes from the rejecting
   side.
5. **Reject per unit, not per batch.** When a direction pass produces many
   scenes in one expensive call, collect violations and reject only the
   offending scenes. Failing the whole batch on the first bad figure
   discards every good scene alongside it and charges the full cost again
   to find out whether the defect was a fluke. Nothing about per-unit
   collection is more forgiving — a bad scene is still dead — it just stops
   taking its siblings with it.

## When the author is a person, the gate is a count

The procedure above assumes an author that can be thrown at: a generator whose
output is refused before it reaches the compositor, and re-run at the cost of a
call. A second author breaks the assumption — a person typing into a field the
surface has already bound to a fact record. There is nothing to reject there:
the binding is structural, the value is chosen by hand, and refusing the entry
destroys a draft rather than a violation. The obligation is unchanged; its
instrument moves. Carry a standing count of bound against unbound over the
piece's checkable elements, surface it where the author is working, and let it
gate the *step's* reported state rather than the keystroke — a step holding
unbound figures is not complete and says so, in the same place the author reads
everything else about that step. A throw guards a pipeline; a count guards a
person, and only the second survives an author who can simply stop typing.

## Decision rules

- When an element asserts a quantity, it is a figure and must cite —
  regardless of what role the generator labeled it with. Role-laundering
  (calling a number a "caption" to slip the gate) is checked by inspecting
  the value, not trusting the label.
- When the script itself contains a number the corpus lacks, the fix is
  upstream: the number enters the corpus with a source and a grade, or it
  leaves the script. The visual layer never becomes the place where
  unsourced numbers get legitimized because rejecting them there is
  inconvenient.
- When a fact exists but is graded too weak to draw, this gate passes and
  [precision-limit-propagation](./precision-limit-propagation.md) decides the
  rendering. The two are deliberately separate: one asks "is it owned?",
  the other "how hard may it be stated?".

## When not to use it

Do not extend the citation obligation to atmosphere, metaphor, or
composition — elements a viewer cannot check against a fact carry no
reference, and forcing one manufactures fake provenance, which is worse
than none. And do not apply it to purely internal drafts no viewer will
see; the gate guards the published surface, and paying its friction on
throwaway sketches teaches the team to route around it.
