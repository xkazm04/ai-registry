---
layer: technique
type: technique
subject: client-state
technique: rehydration-narrowing
status: forged
laws: [one-authority-per-vocabulary, gate-sees-target, one-validation-door]
shared_with: []
use_when: [a persisted mode arrives without the companions that bound it, deciding what a stored value is allowed to mean today, one corrupt key resets every preference the user set]
---

# Rehydration narrowing

Persisted state re-enters the application as **input**, not as memory. It
was written by a different version of the code, possibly under a
different policy, possibly by a different person at the keyboard, and
possibly not by the application at all.
[persistence-and-migration](./persistence-and-migration.md) owns the
contract that carries a payload from the shape it was written in to the
shape the code expects — the version stamp, the migration chain, the
allowlist, the write hygiene. This technique owns what happens *after*
the shape is right and *before* the value is allowed to mean anything:
which direction a doubtful value resolves in, and who has the authority
to call it legal.

## The direction rule

**A persisted value may narrow what the user sees. It must never
silently widen it.**

The asymmetry is about who can detect the error. A rehydration that
narrows too far is visible and self-correcting: the user sees fewer rows
than expected, notices the active filter, and clears it. A rehydration
that widens is invisible: the user is looking at a screen they believe is
filtered, and nothing on it says otherwise. Records the persisted intent
excluded are now present and presented as though they had passed the
filter, and every count, total and export computed over that view is
wrong in the same silent direction. Where the field is a scope rather
than a preference — which accounts, which team, which time window an
audit covers — a silent widening is not a display bug at all; it is a
disclosure of rows the user was not asking to see.

So whenever rehydration is uncertain, resolve toward the **narrower**
legal state. For a preference, that is the field's declared default,
because a preference's default is chosen to be its tightest member.
It is not the default where the default is the *widest* value — a time
window of "all time", a scope of "every account", a filter of "no
filter" — since there falling to the default is the widening itself.
For such a field the narrower legal state is the tightest member the
vocabulary admits (an empty selection, the smallest window), and the
surface then shows the unfiltered state as a stated fact rather than
letting it pass as the unremarkable one.

## Partial persistence is where widening comes from

The recurring shape is a field whose meaning depends on companions. A
range selector persists its mode but not the two bounds a custom mode
needs. A scope selector persists "specific accounts" without the
selection. A sort persists a column that the saved column set no longer
contains. Rehydrating the mode alone leaves the store in a mode with
nothing bounding it, and the natural implementation of "no bounds" is *no
restriction* — the widening, arriving through the front door, with every
individual step looking reasonable.

There are two ways out and only two:

- **Persist the whole tuple.** The mode and its companions are one value;
  they are stored together or not at all.
- **Coerce the dependent mode to the default** when its companions are
  absent. A stored mode that is not meaningful alone does not rehydrate
  alone.

What is not a way out is rehydrating the mode and relying on the surface
to prompt for the missing companions. Between hydration and the prompt
there is at least one render, and that render is the widened one — and if
the prompt is dismissed, it is permanent. The general rule behind both
exits: **a persisted field that is not independently meaningful is not
independently rehydratable.**

## The vocabulary validates itself

A persisted string naming one member of a closed set — a mode, a status,
a locale, a theme, a sort direction — is validated **against that
vocabulary**, not against a hand-written guard that lists the same
members a second time. The copy drifts on the first extension: a member
is added to the vocabulary, the guard is not on any path from the
vocabulary's definition, nothing fails at build time, and the new member
is thereafter rejected as corrupt on every rehydration — a bug that only
reproduces for the users who had already chosen it. Removal drifts the
other way: a member deleted from the vocabulary is still admitted by the
stale guard and reaches code that has no arm for it
([one-authority-per-vocabulary](../../../_laws.md#one-authority-per-vocabulary)).

Practically this means the closed set is declared once and exposed in a
form that is enumerable at run time, so the set the compiler checks
against and the set the validator tests membership in are the same
object. A member cannot then be added to one and missed by the other.

It also means the check is a **membership test on the value**, never a
declaration that the value has the right type. An assertion is a gate
over a proxy: it constrains what the compiler believes about a value it
never observed, and a persisted payload is the exact input the compiler
cannot see
([gate-sees-target](../../../_laws.md#gate-sees-target)). The stored
bytes are the target; only a run-time test observes them.

## Guard each field independently

Validate field by field, and let each failure take that field's own
default. The tempting alternative — validate the payload as a whole and
discard all of it if any part fails — converts one corrupt key into a
full reset of everything the user ever configured. That is a strictly
larger loss than the corruption caused, and it is most likely to fire
right after a migration bug, when the population holding a slightly odd
payload is at its largest.

Per-field guarding also gives the diagnostic its resolution. "One field
was reset to its default" and "your settings were lost" are different
facts; only the second deserves an alarm, and a whole-payload guard can
only ever report the second.

## Policy is consulted at hydration, not at write

A value that was legal when written may be illegal now: a language whose
feature flag has since been turned off, a view an entitlement no longer
covers, a workspace that was deleted, a theme dropped in a redesign. So
the rehydration path validates against the policy **currently in force**,
not against shape alone, and forces the default where current policy
forbids the stored value.

That check belongs in the rehydration path, where the value first becomes
live — not in the surfaces that later read it. A policy check per reader
is a policy check minus whichever reader is added next quarter
([one-validation-door](../../../_laws.md#one-validation-door)), and the
readers are the wrong place to discover that a stored preference is no
longer permitted.

## Illegal states are refused at the door, loudly

The store operation that sets a dependent mode **throws** when its
companions are missing, rather than accepting the call and holding an
inconsistent shape. Next to a technique whose whole thesis is failing
softly toward defaults this looks inconsistent, and the distinction is
where the value came from:

- **A persisted payload is untrusted input.** It fails soft — coerce,
  default, record, continue. There is no caller to fix, and refusing to
  start over a bad stored value is the worst outcome available, since the
  payload survives the restart the user will try.
- **A call from the application's own code is a programming error.** It
  fails hard — throw at the door, at the moment the illegal combination
  is requested, while the stack still names the caller. Accepting it
  means the inconsistency surfaces three screens away as a wrong number
  that nobody traces back.

The throw is for the state that is *structurally* impossible — a mode
without the companions its meaning requires. A well-formed value that
current policy merely forbids is a different case: the caller is not
incoherent, it is asking for something it is not allowed to have, and
the right answer is a refusal (a no-op, or a rejection carrying the
reason) rather than an exception. Keeping the two apart matters, because
a throw on a policy denial makes a feature flag able to crash a surface
that was legal yesterday.

It follows that the rehydration path may not use the throwing setter as
its entry point. It coerces first and constructs a legal state directly,
which is a second reason narrowing is decided in the rehydration path
rather than deep inside the store's operations.
