---
layer: golden-path
type: golden-path
subject: issuance-policy-ladder
status: forged
use_when: [designing a role that shapes a certificate or signed key or login, a role definition that binds nothing, a request asks for a longer validity than the role or issuer allows, static role fields cannot express a new protocol rule]
techniques:
  - require-one-constraint
  - explicit-forbid-beats-allow-any
  - float-references-resolve-at-use
  - bounds-as-modes
  - verbatim-is-a-separate-privilege
  - program-role-returns-the-artifact
---

# Issuance policy ladder

An issuer mints artifacts that carry authority into places the issuer will
never see again: a certificate a service presents to its peers, a signed
public key a host accepts at its door, a login that becomes a session. The
request that asks for one of these is untrusted by construction - the
requester wants the widest thing it can get - and the artifact, once minted,
cannot be un-minted before its own expiry without a revocation machinery that
is slower than the abuse. So between the request and the artifact stands a
**role**: a named, persisted policy that says what this class of requester may
be issued, and every request is shaped by it before anything is signed. This
subject is the design of that role - what it must bind, how its parts compose,
how its references resolve, how its bounds ladder, where the door for
unconstrained signing sits, and what happens when the role's static vocabulary
runs out.

The principal-engineer stance: **a role is a mould, not a filter.** A filter
lets a request through or refuses it; a mould takes a request's *intent* (a
name, a lifetime, a key) and produces the *finished* artifact the policy
permits - narrowing the lifetime to the ladder, adding the extensions the role
requires, dropping the ones it forbids, substituting a default where the
request was silent. The artifact that comes out is the intersection of what
was asked and what the role allows, and the request is never the ceiling of
anything. The consequence that decides most designs: the role is evaluated at
issue time, against the state of the issuer at issue time, and everything the
role stores is either a constraint or a reference to something that will be
looked up then.

## The four things a role holds, and only these

Everything a role can say reduces to four kinds of statement. **Constraints**
bound what the request may claim: the names or principals the artifact may
carry, the audiences it may address, the networks it may be used from, the
identity it must be bound to. **Bounds** cap the artifact's lifetime and
size - validity, key length, key type - and every bound is a mode, not a
number ([bounds-as-modes](./techniques/bounds-as-modes.md)). **Shaping
directives** add and remove parts the request did not ask about: required
extensions, forbidden usages, a fixed audience, a default lifetime.
**References** point at other objects the issuer holds - the issuing key,
a policy set, a template - and are resolved when the role is *used*, not when
it is *written* ([float-references-resolve-at-use](./techniques/float-references-resolve-at-use.md)).

Anything a role would want to say that fits none of these is a sign that the
static vocabulary is exhausted, and the answer to that is the last technique,
not a fifth kind of field.

## An empty role is a refusal, not a default

The naive reading of a role definition treats every field as optional and every
omission as "no restriction", because that is what a flexible schema looks
like. Under that reading a role with no principals, no audiences, no networks
and no binding is a valid role that issues *anything to anyone*, and the
operator who created it as a placeholder has shipped the widest credential in
the system without a single warning. The stance is the opposite: **a role
must bind at least one constraint or it is refused at definition**
([require-one-constraint](./techniques/require-one-constraint.md)). Where a
list genuinely means "any" - and there are such places - the role says so with
an explicit flag or a wildcard, visibly, so the audit question "which roles
could issue anything?" is a query over the flags and not a search for empty
lists. And an explicit forbid always beats an explicit allow-any: the
operator who wrote both meant the narrower one, and a composition rule that
lets the wide flag win has turned a deliberate exclusion into a no-op
([explicit-forbid-beats-allow-any](./techniques/explicit-forbid-beats-allow-any.md)).

## The ladder is stated once

A validity bound is decided by several parties: the request asks, the role
caps, the mount or tenant caps, the system caps, and the issuing key has a
lifetime of its own beyond which no artifact it signs should live. The naive
reading takes the smallest number. The stance is that each rung of the ladder
is a *mode* - permit the request's value, limit it to a ceiling, forbid the
request from setting it at all, or pin it to a timestamp - and the composition
of the rungs is written down once, in one place, with one answer to the
question "what happens at the issuer's own limit": permit, truncate or
error, chosen per issuer and declared. A ladder that lives in three handlers is three
ladders ([bounds-as-modes](./techniques/bounds-as-modes.md)).

## Two doors, not one door with a flag

Every issuer eventually needs to sign something no role can describe - an
intermediate for a subordinate authority, a certificate with an extension the
role vocabulary has never heard of, a migration from a previous issuer whose
artifacts must be reproduced exactly. The tempting design is a flag on the
role - "trust the request" - because the role is where issuance policy lives.
That flag is a privilege escalation waiting for a typo: a role is edited by
the people who administer roles, and a single field flip converts every holder
of that role into an unconstrained signer. So **unconstrained signing is a
separate endpoint with its own capability**, granted through the
authorization layer to a different and smaller set of principals, and never
reachable by editing a role
([verbatim-is-a-separate-privilege](./techniques/verbatim-is-a-separate-privilege.md)).
The same instinct governs any place a request is allowed to choose something
the role normally fixes: the request must *say* it is choosing, in a field
whose presence is auditable, because "the role allows any key type" must not
silently mean "whatever the request happened to contain".

## When the vocabulary runs out, the program returns the artifact

Static roles cannot express every rule. A protocol adopts a new extension; a
tenant needs a name derived from a claim by a rule nobody anticipated; a
login must be refused when two claims disagree in a way no field pair can
state. Each of these is one field away, and a role vocabulary that grows one
field per request becomes a language nobody can read. The stance is to admit
that the vocabulary has a ceiling and to put **a user-authored, sandboxed,
non-Turing-complete program** behind it - as a *separate role type*, not as
an escape hatch inside the static role - with one contract: **the program
returns the finished artifact template, or the finished authorization object,
or a refusal.** It does not return "the role attributes to use"; a program
that only tweaks the static role's fields inherits every ceiling of the
vocabulary it was meant to escape and adds a second evaluator on top. And the
program is never the whole gate: the checks that belong to the protocol - the
signature on the request, the chain to a trusted issuer, the proof of key
possession - run outside the program, before and after it, in code the
operator cannot edit ([program-role-returns-the-artifact](./techniques/program-role-returns-the-artifact.md)).

## Boundary with authorization

The [authorization](../../security/identity-and-access/authorization/authorization.md) subject
owns the question "may this caller perform this operation": the closed tier
vocabulary, the scope contracts and their intersection rule, and the
requirement each operation declares as data the gate reads
([declarative-requirements](../../security/identity-and-access/authorization/techniques/declarative-requirements.md),
[scope-design](../../security/identity-and-access/authorization/techniques/scope-design.md)).
That gate runs before any issuance handler is reached, and it decides whether
the caller may *ask* - may hit the issue endpoint, may hit the verbatim
endpoint, may edit a role at all. This subject begins where that decision has
already said yes: the caller is allowed to request, and the question is now
*what artifact* the request becomes. The rule for a reader choosing between
the two: if the answer is a yes or a no about an operation, it is
authorization; if the answer is a shaped object - a lifetime narrowed, a name
refused, an extension added - it is this subject. Authorization's scope
intersection and this subject's role intersection look alike and are
different objects: a scope bounds what an *operation* may touch; a role bounds
what an *artifact* may carry once it leaves. The verbatim door is the place
the two meet most visibly - a capability from authorization guards an
endpoint whose absence of a role is this subject's design.

## Boundary with the credential vault

The credential vault's [acquisition](../../security/identity-and-access/credential-vault/techniques/acquisition.md)
technique is the ladder of ways a credential gets *in* - a delegated grant, a
captured token, a foraged key, a guided paste - and the single validation door
through which every mode admits it. This subject is the mirror: the ladder of
ways a credential gets *minted out*, and the single role through which every
request is shaped. A reader with a credential in hand asking "how do I hold
this and prove it works" is in the vault; a reader with a request in hand
asking "what may I sign for this caller" is here. The two touch at exactly one
point - an artifact minted here may be acquired there - and neither owns the
other's rules: the vault does not shape what the issuer signs, and the issuer
does not validate what the vault stores.

## What is not this subject

The lifetime of the artifact *after* issuance - its lease, its revocation,
its renewal, the record that says it exists - belongs to the issuer's
lifecycle subject next door; a role decides what is minted, not how long the
ledger remembers it. The key hierarchy that signs the artifact is the seal
subject's. The pricing of the token a login produces is the priced-authority
subject's. A role names the issuing key and caps the artifact's lifetime by
the key's; it does not rotate the key.

## The techniques

- [require-one-constraint](./techniques/require-one-constraint.md) - a
  role that binds nothing is refused at definition, and "any" is a visible
  flag, never an empty list.
- [explicit-forbid-beats-allow-any](./techniques/explicit-forbid-beats-allow-any.md)
  - composition of a role's allow and forbid statements: the narrower wins,
  empty means all only where the schema says so, required extensions fail
  fast.
- [float-references-resolve-at-use](./techniques/float-references-resolve-at-use.md)
  - a reference in a role is validated softly at definition and resolved hard
  at issue time, so a default can move underneath it.
- [bounds-as-modes](./techniques/bounds-as-modes.md) - permit, limited,
  forbid, timestamp; the ladder from request to the issuer's own limit stated
  once; truncate-or-error declared per issuer.
- [verbatim-is-a-separate-privilege](./techniques/verbatim-is-a-separate-privilege.md)
  - unconstrained signing is its own endpoint under its own capability, and a
  request that chooses what the role leaves open must say so.
- [program-role-returns-the-artifact](./techniques/program-role-returns-the-artifact.md)
  - a sandboxed program as a separate role type that returns the finished
  artifact or a refusal, with protocol checks outside it.
