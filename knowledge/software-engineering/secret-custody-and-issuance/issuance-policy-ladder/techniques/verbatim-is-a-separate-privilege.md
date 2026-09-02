---
layer: technique
type: technique
subject: issuance-policy-ladder
technique: verbatim-is-a-separate-privilege
status: forged
laws: [absent-guard-is-loud, verdict-survives-boundary]
shared_with: []
use_when: [an operator asks for a role that trusts the request as-is, signing an intermediate or migrating from a previous issuer, a role allows any key type and the request supplies one, deciding where unconstrained signing lives in the capability table]
---

# Verbatim is a separate privilege

Every issuer eventually needs to sign something no role can describe: a
subordinate authority's certificate, an artifact with an extension the
vocabulary does not know, a migration that must reproduce a previous
issuer's output exactly. The demand is legitimate and the design that meets
it decides how many principals in the system can sign anything.

## The rule

**When unconstrained signing is needed, expose it as its own endpoint,
guarded by its own capability in the authorization layer's vocabulary, with
no role in the path - never as a flag on a role - because a role is edited by
role administrators under role-editing privileges, and a flag that says
"trust the request" converts a role edit into a grant of unconstrained
signing to every holder of that role.** The set of principals that may edit
roles is large and changes with staffing; the set that may sign verbatim is
small and changes with ceremony. A flag collapses the two sets into the
larger one.

The naive reading puts the flag on the role because the role is where
issuance policy lives, and adds a note in the role documentation that the
flag is dangerous. The failure mode is the ordinary one for optional guards
([absent-guard-is-loud](../../../_laws.md#absent-guard-is-loud)): the flag is
set on a role during an incident to unblock a migration, the role is never
narrowed back, and a year later the role with the widest privilege in the
system is the one named after a team that no longer exists. A separate
endpoint cannot decay this way, because the grant is in the capability table
where the authorization audit already looks.

## What the verbatim door still checks

Unconstrained does not mean unchecked; it means *unshaped by a role*. The
verbatim door still runs every check that belongs to the protocol rather
than to policy: the request is well-formed, the key possession proof
verifies, the issuing key resolves and is fit to sign, and the bounds ladder's
last rung - the issuer's own limit - still applies with its declared
truncate-or-error behaviour. What the door skips is the role's shaping: name
allowlists, required and forbidden extensions, the role's lifetime mode. A
verbatim door that also skips the protocol checks is not an issuer, it is a
signing oracle, and the difference is whether an artifact that verifies
nowhere can come out of it.

A verbatim door may still accept a role, and the distinction is what the
role is *for*: a role named on the verbatim path supplies bounds and
directives - a lifetime, a ceiling, a not-before offset, whether the artifact
is stored or leased - and never constraints. The door builds its own
allow-everything constraint set and copies only the bound fields from the
named role, so a role administrator can tune how long a verbatim artifact
lives but cannot, by editing any role, make the verbatim door narrower or
wider on names. Bounds ladder even here; shaping by role does not.

The door also records more, not less. An artifact signed verbatim carries no
role name to attribute it to, so the audit line must carry the principal and
the capability that authorised the signing, and the artifact's own record
must mark it as verbatim-issued so that a later sweep of "what did we sign
that no role would have permitted" is a query.

## The request must say what it chooses

The same instinct governs a smaller case inside ordinary roles. A role may
leave a choice open - any key type, any of several signature algorithms - and
the request then chooses. **When a role leaves a choice to the request, the
request must state its choice in a field whose presence is recorded, and the
issuer refuses a request that is silent, because "the role allows any" must
never silently mean "whatever the request happened to contain".** A request
that carries a key of type T under a role that allows any type is not
thereby choosing T; it must say "key type T" alongside, and the issuer
checks that the two agree. The reason is auditability: the record of what was
chosen must exist separately from the artifact, so that an artifact with an
unexpected key type can be traced to a request that asked for it and not to a
request that carried it by accident. The verdict about what the role left
open and what the request filled in survives into the record
([verdict-survives-boundary](../../../_laws.md#verdict-survives-boundary)).

The naive reading infers the choice from the request's payload - the key is
of type T, so the requester chose T - and it is wrong in the case that
matters: a requester with a mis-generated key under a role that allows any
type gets an artifact it did not intend, and nobody can tell from the record
whether that was a choice or a bug.

## Where the capability lives

The capability for the verbatim door is a scope in the authorization
subject's owned vocabulary, granted at the same tier as the most sensitive
operations the issuer has (key generation, issuer deletion), and never
implied by any role-editing or ordinary-issuance capability. A capability
that is implied by another is a flag by a different route.

## When not to apply it

A system with one operator and one issuer can put the verbatim door behind
the same credential as everything else; the separation pays when the
role-editing population and the signing-ceremony population diverge, which
happens at the first team boundary. And a program role is not a verbatim
door: it shapes the artifact by a program instead of by fields, but the
program is still policy, still runs under the ordinary issuance capability,
and still sits inside the protocol checks.
