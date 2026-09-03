---
layer: technique
type: technique
subject: issuance-policy-ladder
technique: require-one-constraint
status: forged
laws: [absent-guard-is-loud, unknown-is-not-a-value]
shared_with: []
use_when: [writing the validator for a role definition, a role with every list empty still issues, deciding what an omitted constraint field means, auditing which roles can issue to anyone]
---

# Require one constraint

A role exists to bound what a requester may be issued. A role that bounds
nothing is not a permissive role; it is the absence of a role wearing a role's
name, and the issuer that accepts it has made its most consequential decision
- issue anything to anyone who can reach this endpoint - by omission. This
technique is the definition-time rule that refuses it.

## The rule

**When a role is written or updated, count the constraints it binds -
principals or names, audiences, source networks, an identity binding, a
bound-claim set - and refuse the write if the count is zero, because a role
with zero constraints is indistinguishable from no policy and will be created
as a placeholder that nobody returns to.** The refusal is an error at
definition, not a warning: a warning on a role write is read once by the
operator who typed it and never by the operator who inherits it.

The naive reading treats each constraint field as optional and its absence as
"no restriction on this axis", which is individually reasonable and
collectively catastrophic: every axis unrestricted is the widest credential in
the system, reached by the shortest possible role definition. The failure is
quiet in exactly the way [absent-guard-is-loud](../../../_laws.md#absent-guard-is-loud)
forbids - the role works, tests pass against it, and the width is discovered
by whoever first asks what the role forbids.

## Which constraints count

Not every field is a constraint. A lifetime cap is a bound; a required
extension is a shaping directive; a reference to an issuing key is a
reference. None of these narrows *who* or *what* the artifact is for, so none
of them satisfies the count. The fields that count are those that answer
"which requesters, for which subjects": the allowed names or principals and
the rules for matching them (exact, subdomain, wildcard, glob); the audiences
the artifact may be presented to; the networks a login may come from; the
identity claim the artifact must be bound to; the set of claims a login must
carry with fixed values. One of these, non-empty, is the floor. A role with a
name list and nothing else is narrow enough to be a policy; a role with a
lifetime and nothing else is not.

Two shapes need naming because they defeat the count if left implicit. The
first is a constraint that is bound to a *self-referential* value - the
principal is "whatever the request says", the audience is "whatever the token
carries". That is not a constraint; the count treats it as empty. The second
is a constraint satisfied by a wildcard: a name list of `*`, a network of the
whole address space. These are constraints in form only, and the rule about
them belongs to the next technique - here they count, because they are
*visible*: an auditor searching for roles that issue to anyone finds the
wildcard, whereas an empty list is found only by someone who knows what empty
means.

## Empty is never "all"

Which is the second half of the rule. **When a constraint field is absent or
empty, it means nothing is allowed on that axis, never everything, unless the
schema states the inverse for that specific field and the statement is
adjacent to the field's definition.** A schema that reads empty as all has
built the widening into the data layer
([unknown-is-not-a-value](../../../_laws.md#unknown-is-not-a-value): an
unset list rendered as the most permissive setting). Where a role genuinely
needs "any" on one axis - a certificate role that accepts any subject name
because the names are validated elsewhere - the role says so with a flag
whose name contains the word, or with a wildcard entry, and the validator
counts that flag as a constraint the operator chose. A reader of the role
record sees the choice; a reader of an empty list sees nothing.

## The count runs again on the artifact

A constrained role can still produce an unconstrained artifact. A signed key
with an empty principal list is valid for every principal the verifier
accepts; a certificate with no subject and no alternative names is bound to
nothing; a login that carries no audience is presentable anywhere. The role
may have listed a dozen allowed principals, and a request that names none of
them passes the allowlist trivially - nothing was requested, so nothing was
refused. **So the count runs a second time at issue time, on the artifact
about to be signed: an artifact that binds nothing is refused, and a role
that wants to issue such artifacts says so with an explicit flag whose
description recommends against it.** The definition-time count guards the
role; the issue-time count guards the output, and the second is the one an
attacker reaches by sending less rather than more.

## Where the count runs

The count runs at the one door through which roles are written, on the
merged record after an update, not on the fields present in the update
request. A partial update that clears the only bound constraint must be
refused exactly as a creation with none would be, and the only way to see
that is to validate the record as it will be stored. A validator on the
request body alone passes an update that removes the last constraint, because
the request contains no constraint field to complain about.

For an existing role that predates the rule, the honest behaviour is to
refuse *issuance* against it with an error naming the rule, not to refuse
reads of it or to silently delete it. The operator finds out at the first
request, which is the earliest anyone can find out without a migration that
guesses what the role was for.

## When not to apply it

Do not apply the count to a role type whose whole purpose is unconstrained
issuance under a separate privilege - that door has no role, by design, and
the rule for it is the verbatim technique. Do not apply it to a role that
delegates its decision to a program: the program is the constraint, and the
count for that role type is whether a program is present and compiles.
