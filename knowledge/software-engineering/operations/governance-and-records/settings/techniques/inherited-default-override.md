---
layer: technique
type: technique
subject: settings
technique: inherited-default-override
status: forged
laws: [unknown-is-not-a-value, derivation-names-recomputation, one-validation-door]
shared_with: []
use_when: [a preference whose default comes from the operating environment rather than from code, a user's stored choice stopped tracking a platform setting they expected it to follow, deciding whether a two-state control needs a third automatic option, a toggle that can never be returned to its inherited value once pressed, a key's sensible default depends on what was chosen for a sibling key, a validation error blames a value the user never set, deciding whether an agent-facing surface should offer defaults at all]
---

# Inherited-default override

Most keys in a settings store default to a constant: the read finds nothing,
the accessor returns the value the code declares, and that value is the same
on every machine forever ([typed-accessors](./typed-accessors.md)). A minority
of keys default to something else — a **live upstream source** the application
does not own and cannot predict. An environment-level appearance preference, a
platform locale, a reduced-motion or reduced-data flag, an organisation policy
a tenant inherits, a fleet-wide setting a single deployment may deviate from.

The distinction is not cosmetic and it is not the key's *kind*
([setting-kinds](./setting-kinds.md) classifies by blast radius, and an
inherited default appears in every one of those kinds). It is an orthogonal
axis, and it changes the meaning of all three store operations:

| | Constant default | Inherited default |
| --- | --- | --- |
| **Absent** | use the declared constant | **follow the source, continuously** |
| **A write** | set the value | **detach this key from the source** |
| **A delete** | revert to the constant | **re-attach to the source** |

Read that middle column again, because it is the whole technique: when the
default is inherited, **the stored value's presence carries meaning
independent of its content**. The row does not only say "the user wants the
dim variant"; it says "the user has stopped following the environment". A
store that models only the content loses the second fact, and loses it
silently — which is this subject's signature failure, arriving on the one axis
the subject otherwise does not model.

## Absent is a subscription, not a value

The first consequence is that an inherited-default key has no meaningful value
at rest. Absent here does not mean "unset, so substitute a constant"; it means
"resolve me against the source, now, and again whenever the source moves". The
resolved value is a **derivation of two inputs** — the stored override and the
live source — and it must be recomputed when either changes
([derivation-names-recomputation](../../../../_laws.md#derivation-names-recomputation)).

One function owns that resolution
([one-validation-door](../../../../_laws.md#one-validation-door)). The moment a
second call site reads the stored value directly and treats absent as a
constant, the key has two resolution semantics, and the divergence surfaces as
an intermittent bug on other people's machines.

Storing the resolved value "so the read is simpler" is the mistake
[setting-kinds](./setting-kinds.md) already refuses for derived limits — *store
the inputs, derive at read* — arriving in a regime where the answer differs in
one important way. There, the correct move is to store nothing at all. Here the
user **must** be able to detach, so a stored row is legitimate; what must never
be stored is a row written for any reason other than an explicit act of
detachment.

## Resolve where the source is visible — or defer, if the consumer can

A resolution that runs where the source cannot be read does not choose a
default; it **erases the subscription**. Rendering a surface for a future,
unknown reader and substituting a constant for "follow the source" converts an
inherited default into a fixed value for everyone, and the defect is invisible
to anyone whose own environment happens to match the constant.

So the resolution belongs at the point where both inputs exist. Where the
producer cannot see the source, the correct move is not a better constant but to
**emit the derivation rather than its result** — hand the consumer both the
stored override and the rule, and let it resolve.

That deferral carries one precondition, and it is easy to miss when repairing a
system with several resolution points: **defer only to a consumer that can
actually perform the resolution.** A producer that hands the derivation to
something built to receive a single resolved value has not moved the decision
closer to the source, it has broken the consumer. Where two resolution points
share one downstream shape, the consumers change first; a resolution point whose
callers cannot resolve is repaired last, not first.

## Write only on divergence

Which gives the write rule, and it is the half that implementations get wrong:

> **Store the value only when it differs from what the source currently
> resolves to. When the user's target equals the current source value, delete
> the row instead.**

A control that writes the target unconditionally is correct on the first press
and corrupt on the second. Press once in an environment resolving to the light
variant: the target is dark, dark differs from light, a row is written, the key
is detached — correct. Press again: the target is light, and an unconditional
write stores it. Visually nothing happened; the surface was light before and is
light now. Underneath, a key that was *following* the environment is now
**pinned to a value that merely coincides with it**, and the user has no
remaining gesture that returns them to following — the control only ever
alternates between two stored values from here on. The subscription is gone and
no feedback ever said so.

That is the two-state control's genuine defect, and it is worth separating from
the one usually blamed. The complaint is that a two-state control cannot express
a three-state model. It can. A two-state control expresses all three states
precisely, by showing the resolved value and the one alternative to it, because
**the state a user cannot see is the state they have no goal for**: somebody
whose surface already looks right does not reach for the control at all. What a
two-state control cannot survive is an unconditional write, which converts a
temporary adjustment into a permanent pin with no way out — a one-way door, and
an [unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)
laundering in which "following" is written down as a definite value
indistinguishable from a deliberate choice.

## Re-evaluate only at user interaction

The mirror-image error is more tempting, because it looks like hygiene. The
source changes; the stored override now happens to equal it; something notices
and tidies the row away.

**Never.** The comparison that decides whether to store or delete is evaluated
at exactly one moment — **when the user acts** — and at no other. Not on a
source-change event, not at boot, not by a reconciliation pass.

The reason is a population the tidying instinct never pictures: environments
that switch on a schedule. If the source oscillates on its own and the
application clears any override that momentarily matches it, then a user in
that environment **cannot pin anything**. Their deliberate choice survives
until the source swings through it and is then deleted by a background event
they did not cause and cannot see. The pin is not merely lost, it is
*unachievable* — and the more often they re-set it, the more reliably the
schedule eats it again.

So an override that coincides with the source is **kept**. It looks like an
untidy row. It is the record of a decision, and the coincidence is a fact about
the environment at one instant, not evidence about intent
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)). A value
that equals its source today and diverges tomorrow was never redundant; it was
waiting.

The general form, worth stating because it outlives this key type: **a recorded
decision may be revised only by the decider.** Any process that downgrades an
explicit choice to a default on the strength of an event the user did not
generate has substituted its own tidiness for their intent.

## What the control shows, and what it stores

The two are different, and keeping them different is what makes the surface
honest:

| Model state | Control displays | Row |
| --- | --- | --- |
| following the source | the currently resolved value | absent |
| detached | the resolved value, which is the stored one | present |

Pressing always targets *the opposite of what is currently resolved*; the
divergence rule then decides whether that target becomes a row or deletes one.
The user experiences one thing — "make it the other one" — and the store records
the correct one of two very different facts.

Two smaller obligations follow. The control's accessible name should say which
state it is about to produce, and where the distinction is affordable to
explain, that a return to the inherited value *is* a return — that difference is
invisible in the surface itself, so a label is the only place it can be stated.
And the resolution must survive a cold read: a surface that renders the constant
default first and corrects itself once the source has been queried has shipped a
visible flash of the wrong state, which reads to the user as the setting not
having been saved.

## When a third state is genuinely required

The two-state form is not universal, and three conditions each earn the extra
control state outright:

- **The setting lives among other settings.** A dedicated configuration surface
  is a different usage scenario: the user is already deciding about their future
  rather than fixing their present, immediate feedback is not the expectation,
  and there is room to say what the inherited value currently resolves to. Three
  states are right there. The ambient one-press control is what this technique
  governs.
- **The inherited value is not one of the alternatives.** The two-state form
  works because "follow the source" always resolves to one of the two values the
  control alternates between. Where the source contributes a *third* distinct
  behaviour rather than selecting between two, it is a real option and must be
  shown.
- **Detachment is consequential enough to demand ceremony.** For a ceiling or a
  policy value inherited from an organisation, "this deployment no longer
  follows the fleet" is exactly the fact an operator must state deliberately and
  an auditor must be able to read
  ([settings-audit-and-history](./settings-audit-and-history.md)). Silent
  detachment-by-adjustment is right for taste and wrong for governance — and the
  audit record for such a key logs the *transition*, attach or detach, not merely
  the new value.

## The third column: a default derived from sibling keys

The table at the top has two columns because the source of a default was
either a constant or the environment. There is a third source, and it is the
commonest one in any configuration assembled from several keys: **another key
in the same store**. The sensible default for a data-access layer depends on
which database was chosen; the default deployment target depends on the
runtime; whether a provisioning step is offered at all depends on whether
there is anything to provision. The default is a *function of the siblings*,
and it behaves like the inherited column with the source moved inside the
store:

| | Derived default |
| --- | --- |
| **Absent** | derive from the decided siblings, and re-derive whenever one of them changes |
| **A write** | detach this key from the derivation |
| **A delete** | re-attach |

Two differences from the inherited column follow from the source being inside
the store rather than outside it. The derivation is never a subscription to
the world, so "re-evaluate only at user interaction" holds without exception:
a sibling changes only because the user changed it, and re-deriving then is
the user's own act. And the derivation must be *recomputed*, never stored as
its result — the rule [setting-kinds](./setting-kinds.md) already states for
derived limits — because a stored result is indistinguishable from a decision
the moment a sibling moves. A resume path that replays a constant where the
first run derived a value has made exactly that substitution, and it changes
the user's decision on every continuation where the derivation and the
constant differ.

## Provenance travels with the value, or validation blames the user for a default

The consequence that earns the third column is what happens at the validation
door. A store with several keys has rules that name two of them — this access
layer does not work with that database, this deployment target needs that
runtime — and a rule that reads only the values cannot tell a decision from a
derivation. It then produces the error every user of such a tool has seen:
*your access layer is incompatible with your database*, when the user chose
the database and said nothing about the access layer at all. The tool derived
a value the user never saw and then blamed them for it. Under
[unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value) that is
a laundering: "not decided" reached the check wearing the shape of a decision.

Provenance cannot be recovered from the value. A decided value that happens
to equal the derived one collapses into "not decided" under any equality
test, and a store that infers "untouched" by comparing against defaults has
this defect built in. So the set of keys the user actually decided **travels
beside the values** through the one validation door
([one-validation-door](../../../../_laws.md#one-validation-door)), and the
rules read both:

> A rule fires only when every key it names was decided. When one of them was
> derived, the conflict is the derivation's error, not the user's: re-derive
> that key from the decided ones and say nothing.

A conflict between two decisions is reported against both, naming both. A
conflict between a decision and a derivation is repaired silently — the
derivation was wrong, and the user had no way to know. The one case that
still errors with a derived operand is the one where nothing can be derived: a
feature the user enabled that needs a secret nobody can invent. There the
message names the decided key as the cause and the derived one as the
consequence, in that order.

Two boundaries. A machine caller — an agent, a script, a remote surface —
should get **no derivation at all**: require every key explicit, and reject a
partial payload. A person at a prompt sees the derived value before committing
and can override it; a machine commits the payload it sent, and a derivation
it cannot see is a decision it did not make. The source that prompted this
section exposes one configuration through both a prompt and an agent-facing
surface, and the second removes every default on purpose. And a derived
default is not a *recommendation*: a recommendation is a constant the user is
shown and may take, and it belongs in the first column. The third column
exists only where the right value genuinely changes with the siblings.

## Boundary

A neighbouring subject reaches the same requirement from the rendering side and
prescribes a different remedy.
[preference-short-circuits-measurement](../../../../ui-surfaces/feedback-and-style/adaptive-fidelity-tiers/techniques/preference-short-circuits-measurement.md)
holds that a measured tier is a default for people who have not said what they
want, that every statement retires it, and that the control therefore needs a
genuine automatic value — a way back to the measured default — rather than
making the first use of the control a permanent exit from the adaptive system.
The requirement is right, and this technique supplies the mechanism that
satisfies it without spending a third control state: the way back is the
divergence rule, not a visible option. Where that subject's source is a
*measurement the application performs* rather than a setting it reads, one extra
caution applies — a measurement can be re-run and can return a different answer
for reasons having nothing to do with the environment, which disqualifies it
twice over as a trigger for re-evaluating an override.
