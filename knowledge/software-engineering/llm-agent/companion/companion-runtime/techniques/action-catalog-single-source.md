---
layer: technique
type: technique
subject: companion-runtime
technique: action-catalog-single-source
status: forged
laws: [one-authority-per-vocabulary, derivation-names-recomputation, one-validation-door, gate-sees-target]
shared_with: []
use_when: [a companion is gaining the ability to act and not only talk, the model emits an action kind nothing executes, a model-composed surface has no way back to a good state, the component that teaches the model does not share a process or a language with the one that executes, an accepted proposal must run against a catalog that has changed since it was made]
---

# One source for the action catalog

The moment a companion can do something, it has a vocabulary of things it may
do — and that vocabulary is a closed set with five natural consumers. The prompt
that teaches the model what it may emit. The validator that checks what came
back. The executor that performs it. The capability document a person reads to
learn what the companion can do. The surface that renders the result. Written
independently, they drift; the only question is which pair diverges first.

## The failure is asymmetry, and it is never a crash

Every symptom of a duplicated catalog is a mismatch between two of the five, and
each looks like a different bug to whoever meets it:

- The prompt teaches a kind the validator rejects. The model is blamed for
  hallucinating a capability it was taught by the system's own instructions.
- The validator accepts a kind no executor performs. The action validates,
  persists, and silently does nothing.
- The executor requires a field the prompt never mentions, so the field is
  absent, so the executor fails on input the validator called valid.
- The document lists kinds retired two releases ago, so the most authoritative
  description of the companion's abilities is the least accurate one.
- One surface renders a kind and another does not, so the same action looks
  broken depending on where the person is standing.

None of these produces an error at the point of divergence — the divergence is
between two files that never call each other. This is the
[one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)
law's most expensive costume, because the vocabulary here is what a fallible
model is being taught, and a teaching error is indistinguishable from a model
error at the surface.

## One declaration, four derivations

The catalog is a single table of kinds, each row carrying what all five consumers
need: the kind's identifier, its payload shape, whether it reads or mutates,
what approval it requires, a one-line description in the register a person reads,
and the executor it binds to. Everything else is generated from it or checked
against it:

- **The teaching text** is rendered from the table — the identifiers, their
  payload shapes and their descriptions — so a kind cannot exist in the prompt
  without existing in the catalog, and a new kind reaches the prompt by being
  added once.
- **The validator** iterates the table rather than restating it. Unknown kind:
  rejected by construction. Known kind: its payload checked against the shape the
  same row declares.
- **The executor binding** is exhaustive over the table. A kind with no executor
  must be a compile-time or startup-time failure, not a runtime shrug — this is
  the single highest-value property in the technique, because it converts the
  most common asymmetry into an error nobody can ship past.
- **The capability document** is generated. A hand-written one is a copy, and it
  is the copy nobody updates because it has no tests.

A generated artifact states how it is regenerated, and the check that it is
current runs where changes are gated
([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)).
Generation without that check is a copy with extra steps.

## Validation is symmetric or it is theatre

Two directions must agree, and systems routinely implement one. **Nothing enters
the system that the catalog does not describe** — the validator is the one door
between model output and any effect
([one-validation-door](../../../../_laws.md#one-validation-door)). And **nothing
the catalog describes is unimplemented** — every kind reachable by the prompt has
an executor, and that is asserted mechanically rather than believed.

Where a payload references anything that exists in the store — a target, a
destination, a piece of content — the reference is resolved against the store
before the action is bound, not after it is approved. A model-supplied identifier
is a guess until something looks it up, and an unresolvable one drops the
proposal rather than executing against whatever the identifier happens to hit.

## When the consumers do not share a process, the catalog travels as data

The five consumers are rarely five files in one program. The one that teaches the
model is often somewhere else entirely — another process, another language,
sometimes another deployment — because the model call and the application get
built with different tools by different people. The arrangement that suggests
itself is then two catalogs: one where the actions are implemented, and one
beside the prompt, kept in step by a comment. That is the five-copy failure with
a process boundary drawn through the middle of it, and the boundary makes it
worse rather than better — no compiler, no type checker and no test in either
tree can now see both copies at once.

The discipline that survives the crossing is to **ship the catalog as data on
every request and let the far side name nothing.** The teaching text is rendered
from the table that arrived; the validator that reads the model's output matches
against the table that arrived; neither file contains an action's identifier, so
neither can teach nor accept something the declaring side did not send. What was
a generation step inside one program becomes a serialization step across two, and
the property is unchanged: one declaration, and the consumers hold no vocabulary
of their own.

Two consequences follow, and both are correct behaviour rather than edges to be
worked around. A request that carries no catalog **teaches nothing and accepts
nothing** — the far side has no list to render and an empty table to match
against, so the model is never told it may act, and a fence emitted anyway is
rejected. That is the right default for a turn nobody asked to be actionable, and
it is safe by construction rather than by a flag somebody remembered to set. And
the catalog on the wire is *what was shipped this turn*, not what the far side
was built against, so adding an action needs no coordinated release of the other
side — which is precisely the coupling a duplicated catalog would have created.

The pin is a **set-equality assertion on the declaring side**: the identifiers the
table declares, the identifiers the wire form carries, the identifiers the
validator accepts, and the identifiers the executor resolves are the same set —
not a subset, not a sample. Pinning membership instead ("the catalog contains this
kind") stays green while a sixth kind is added to the executor and never taught.
And give the assertion one more line than feels necessary: **that the set is not
empty.** Set-equality over two empty derivations passes, and empty-against-empty
is the exact shape in which this family of guard reads green while reading nothing
([gate-sees-target](../../../../_laws.md#gate-sees-target)).

## Reads may proceed; mutations are proposed

The catalog carries the read/mutate distinction per kind because that is where
the distinction is actually known. A read the companion performs to answer a
question can proceed within whatever autonomy it has been granted. A mutation —
changing settings, sending something, deleting, spending — is a **proposal**: the
runtime binds it to a validated envelope and hands that envelope to the approval
gate, which owns the disclosure, the decision, the record and the resumption.
The property this technique guarantees for that gate is that the envelope it
displays and the envelope the executor runs are **the same object**, not two
renderings of one intent — otherwise the disclosure a person approved and the
action performed are related only by convention.

## A proposal outlives the reply, and may outlive the catalog

A proposed mutation waits for a person, and people answer on their own time. For
the length of that wait the proposal is a stored row and the catalog is code, and
code deploys. So the catalog is consulted **twice about one action**: once when
the model's output is turned into a proposal, and again at the moment somebody
accepts it. The second consultation is not belt-and-braces. The first validated
against a catalog that no longer necessarily exists, and it validated parameters
naming things — a record, a destination, a role — that were true when the
sentence was written and need not be now.

The approval subject owns the wait, the verdict, and running the approved thing
exactly once. What this technique adds is that the check at acceptance goes
through **the same validator, deriving from the same table**, rather than through
a second check the executor keeps privately. Two validators for one envelope is
the five-copy failure wearing a timestamp
([one-validation-door](../../../../_laws.md#one-validation-door)).

The case worth naming is the kind the catalog no longer carries, because the
instinct is to treat it as an error. It is not an error: it is a proposal that
outlived its vocabulary, and the honest resolution is to **retire it on the
person's behalf, with a stated reason**, rather than leave an accept affordance
that can only ever fail. The same holds for a stored payload that no longer
satisfies the shape its kind declares. A catalog that loses a kind is a normal
event; a queue filling with permanently unclickable rows is what happens when it
is treated as an exceptional one.

## Anything a model can compose, a person can reset

The catalog's most consequential extension is the class of action that lets a
model arrange a surface — a layout, a set of panels, a view assembled to suit a
moment. It is a genuinely good capability and it fails in a specific way: the
model produces a state that is valid, persisted, and worse than what was there,
and the person has no way back. They did not choose the previous arrangement and
cannot describe it, so "just ask it to change back" is not a path.

Two rules, and they are cheap next to the feature they protect. **A reset to a
known-good default is one action, always reachable, and never itself
model-composed.** And **the composition is a proposal like any other mutation**
until the product has evidence that the model's arrangements are reliably wanted.
A generative surface with no floor under it is the one place where an action
catalog's mistakes are both invisible to validation and permanent to the person
living with them.

## When not to do this

A companion with two or three actions that will not grow does not need a
generated catalog; a single table read by the validator and the executor is
already the whole technique, and the prompt can name them by hand. The cost
arrives with the fourth kind, or with the first kind added by somebody who did
not write the first three — which is the same moment, one release later.
