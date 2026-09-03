---
layer: technique
type: technique
subject: issuance-policy-ladder
technique: float-references-resolve-at-use
status: forged
laws: [gate-sees-target, unknown-is-not-a-value]
shared_with: []
use_when: [a role names an issuing key or policy by reference, rotating the default issuer without touching roles, a role references something that does not exist yet, deciding whether a bad reference is a definition-time or issue-time error]
---

# Float references resolve at use

A role names things it does not own: the key that will sign, the policy set
a login will receive, the template an artifact will be built from. Each of
these is a reference, and a reference has two moments - the moment it is
written into the role and the moment it is followed to produce an artifact.
The design decision is which moment binds.

## The rule

**When a role carries a reference to another object the issuer holds, check
it at definition and warn if it does not resolve, then resolve it again at
every issuance and fail there if it does not, because the object behind the
reference is expected to change - an issuing key rotates, a default moves -
and binding at definition would freeze the role to whatever existed on the
day it was written.** The reference is a name, never a snapshot of the
referent, and the special name for "whatever is current" is a first-class
value that floats to the referent's current default.

The naive reading validates the reference hard at definition - refuse the
role write if the issuer does not exist - and then trusts the role forever,
either by storing the resolved object in the role or by never re-checking.
Two failures. Hard validation at definition makes ordering a constraint:
roles cannot be created before the issuer they name, so a declarative
bootstrap that writes roles and issuers in whatever order its author listed
them fails on an accident of sequence. And trusting the stored resolution
makes rotation a role migration: when the issuer rotates, every role that
snapshotted the old one keeps signing with it, or breaks, and either way the
operator must find and edit every role ([gate-sees-target](../../../_laws.md#gate-sees-target):
the gate checked a copy that has since diverged from the target).

## Warn at definition, error at use

The two moments carry different errors on purpose. A role written with a
reference that does not currently resolve is *probably* wrong and *possibly*
early - the issuer is about to be created, the policy is in the next request
of the bootstrap chain. So the write succeeds and the response carries a
warning naming the unresolved reference, which is the operator's cue to check
ordering. A request that arrives at a role whose reference does not resolve
is *certainly* wrong right now: there is nothing to sign with, and the only
correct outcome is a refusal that names the reference and the role. The
refusal is not "internal error" and not a silent fallback to some other
issuer - falling back is [unknown-is-not-a-value](../../../_laws.md#unknown-is-not-a-value)
in its most expensive form, an artifact signed by a key the operator did not
choose.

## The floating default

The reference value that means "the current default" is the reason the
technique exists. An operator rotating an issuing key wants to create the
new key, test it against a few roles, and then move the default - one write -
so that every role naming the default begins signing with the new key at its
next request, while roles that pinned a specific key keep it. This is only
possible if the default is a name resolved at use. The operator who wants the
opposite - a role that must never move - pins by the referent's stable
identifier, not by its display name, because display names are the axis
along which operators reorganise.

Both spellings are legitimate and they are different contracts, so the role
record must show which was written: a role that names the default is visibly
floating, a role that names an identifier is visibly pinned, and an auditor
can answer "which roles will move when I rotate" from the records alone.

A third source of the reference is the request itself: an endpoint shape in
which the caller names the issuing key in the path and the role in the
suffix, so that the role shapes the artifact and the caller chooses which
key signs it. This is resolve-at-use with the reference arriving late, and
it is safe for exactly one reason - the caller's permission to name that key
is a capability on that path, decided by the authorization gate before the
issuer runs. A request-supplied reference in the body, under a path whose
capability does not distinguish keys, is a request choosing its own signer.

## What is resolved, and what is checked after

Resolving a reference at use yields an object; the object may itself be
unfit for this request - an issuing key that has expired, a key that lacks
the usage the artifact needs, a policy that has been marked as removed. Those
are issue-time checks on the *referent*, run after resolution and before
signing, with the same refuse-and-name behaviour. Resolution answers "which
object"; fitness answers "may this object sign this artifact", and a design
that folds fitness into resolution ends up with a reference that resolves to
"the default, unless the default is unfit, in which case the next one",
which is the silent fallback again.

## When not to apply it

A reference whose referent is immutable by construction - a content-addressed
template, a versioned policy snapshot the role deliberately pins - carries no
float, and hard validation at definition is fine, because there is no later
state to diverge from. And a role type whose reference is to a program
resolves that program at use like any other reference, but the program's
*compilation* is checked hard at definition: a program that does not compile
is not "early", it is wrong, and no ordering will fix it.
