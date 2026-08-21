---
layer: technique
type: technique
subject: candidate-outreach-and-halt-rules
technique: halt-state-scoped-per-role-not-per-person
status: forged
laws: [every-decision-names-its-actor, uncertainty-resolves-toward-the-candidate]
shared_with: []
use_when: [choosing the grain of the outreach state, a candidate is being sequenced for two roles at once, someone said no to one job and heard about another]
---

# Halt state scoped per role, not per person

## The concern

A halt has to be attached to something. The choice looks like a schema detail and
is in fact the policy: it decides what a person's "no" means.

**Per person** is the strong reading. One reply, one refusal, and this
organisation stops sequencing this human entirely until somebody decides
otherwise. It is the safest for the recipient and the crudest for the process: a
candidate who declined a junior role two years ago never hears about the senior
one they would have taken, and the organisation cannot tell the difference
between "not this job" and "not you, ever".

**Per candidate-and-role** is the finer reading, and the more common
implementation. A halt stops one approach about one opening. It lets a genuinely
different opportunity through, and it lets a person tell you no about a role
without being erased from your world.

Neither is free, and this technique's real content is that the choice is
**deliberate, stated, and defended in the interface**, because both directions
have consequences and they run opposite ways.

## The two directions of the consequence

**Choosing the per-role scope buys precision and owes aggregate control.** Three
recruiters working three requisitions each clear their own halt and each start
their own sequence, and a person who said no once receives nine messages over a
quarter, every one of them individually compliant. Nothing in the per-role state
can see that, because the harm lives at the person and the state lives at the
pair. If you choose this scope, you owe a **person-level volume ceiling** sitting
above it, and a person-level suppression that outranks it absolutely.

**Choosing the per-person scope buys safety and owes a re-approach path.**
Otherwise the halt is a life sentence written by an automated system, which is
its own failure — a person's single "not right now" silently becomes permanent
exclusion, and nobody ever revisits it because nothing surfaces it. If you choose
this scope, you owe an explicit, human, recorded re-approach decision and a
visible reason the person is suppressed.

## Procedure

1. **State the scope once, in the schema, with a comment saying what it costs.**
   A grain chosen implicitly by whichever key was handy is a policy nobody
   decided ([every consequential decision names its actor](../../../_laws.md#every-decision-names-its-actor)
   applies to design decisions with candidate consequences, not only to runtime
   ones).
2. **Keep every scope-sensitive field at the same grain.** The reply timestamp,
   the manual halt timestamp, the send counter and the last-send time must all
   sit at the pairing the halt sits at. A counter at a wider grain than its halt
   will report contact the halt does not cover, and vice versa.
3. **Layer, do not choose only.** Put the fine-grained operational state at
   person-and-role, and put an absolute person-level suppression *above* it in
   the gate chain — consent withdrawal, a do-not-contact request, an ex-employee
   restriction. Fine state cannot override coarse suppression.
4. **Enforce a person-level volume ceiling** across all roles, all sequences and
   all recruiters, over a rolling window. This is the control that makes the
   per-role scope survivable and the one most systems never build.
5. **Show the recruiter the person's full outreach history** at the moment they
   start a sequence, not just this role's. The interface is where a per-role
   scope is redeemed: a human who can see three prior approaches will not send a
   fourth.
6. **On a cross-role approach after a halt, require a reason.** Not a
   confirmation dialog — a recorded justification for why this opening is
   genuinely different.

## Decision rules

- **When the person declined the organisation rather than the role, escalate the
  halt to person scope.** "Please don't contact me again" is not role-scoped
  however it arrived, and a per-role halt that quietly narrows it is a
  misreading with legal weight.
- **When the reply's scope is ambiguous, take the wider one.** Suppress more
  ([uncertainty resolves toward the candidate](../../../_laws.md#uncertainty-resolves-toward-the-candidate)).
- **When the same person exists as several records, the person-level layer must
  resolve across them**, or the coarse suppression is finer than the fine state
  and the layering is inverted.
- **When a role is re-opened, re-run the gates rather than reusing the old
  sequence state.** A reposted requisition is a new approach to the same human,
  and treating it as a continuation smuggles a fresh touch budget past every
  ceiling.
- **When a per-role halt is more than a year old, it is evidence about a job that
  no longer exists.** Let a human decide whether it still binds; do not let a
  scheduler decide by expiry.

## When not to use this

- **Single-requisition or very small operations** may run person-scoped halts and
  lose nothing, because the aggregate and the pairing are nearly the same thing.
  The layering only pays when several sequences can address one person.
- **Do not use the per-role scope for consent.** Consent, withdrawal and erasure
  live at the person and only at the person; scoping them per role is the
  identity bug this technique's coarse layer exists to prevent.
- **Do not add scope dimensions beyond these two.** Per-role-per-recruiter or
  per-campaign halts multiply the number of independent permissions to write to
  one human, which is exactly the harm.
