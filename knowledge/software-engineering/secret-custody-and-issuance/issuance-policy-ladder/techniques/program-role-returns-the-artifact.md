---
layer: technique
type: technique
subject: issuance-policy-ladder
technique: program-role-returns-the-artifact
status: forged
laws: [verdict-survives-boundary, failure-not-empty-success, gate-sees-target]
shared_with: []
use_when: [a role field request arrives that no static field can express, embedding an expression language in an issuer, deciding what a policy program is allowed to return, a program only selects role attributes]
---

# Program role returns the artifact

A static role vocabulary has a ceiling. A protocol adopts an extension the
fields cannot describe; a tenant needs a name derived from a claim by a rule
nobody anticipated; a login must be refused when two claims disagree in a
way no pair of fields can state. Each is one field away, and a vocabulary
that grows one field per request becomes a language with no grammar. This
technique is the design that admits the ceiling: a user-authored program as
its own role type, with a contract about what it returns.

## The rule

**When the static vocabulary cannot express a required rule, add a separate
role type whose policy is a sandboxed, non-Turing-complete program, and
require that program to return exactly one of: the finished artifact
template, the finished authorization object, a refusal string, or false -
because a program whose output is the final object owns the whole decision
and can be audited as one thing, whereas a program that returns adjustments
to a static role's fields inherits every ceiling of the vocabulary it was
meant to escape and adds a second evaluator whose interaction with the first
nobody can state.** The rejected design is the tempting one: keep the static
role, let a program "select" or "tweak" its attributes, and merge. It fails
twice. It fails on expressiveness, because the program can only say what the
fields can say. And it fails on auditability, because the artifact is now
the product of two policies with an unstated merge order, and the question
"why did this artifact carry this name" has two answers.

## The contract of the return

Four return shapes, and they are typed, not inferred. **The finished
template** is the artifact before signing, with every name, extension, bound
and directive already applied; the issuer signs what it is given after the
protocol checks below. **The finished authorization object** is the login's
result - the policies, the lifetime, the metadata, the binding - and the
token layer prices and persists it unchanged. **A refusal string** is a
denial with a reason the requester will see; it is the program's way of
saying "this request is understood and refused". **False** is a denial
without a reason, for the case where the reason would leak what the program
knows about other requesters. Everything else the program could produce - a
partial template, a bare attribute map, an error, nothing - is a program bug
and is treated as a refusal that names the program, never as an empty
success ([failure-not-empty-success](../../../_laws.md#failure-not-empty-success):
a program that returned nothing has not approved anything).

The refusal is a typed value that reaches the requester and the audit line
as the program's verdict ([verdict-survives-boundary](../../../_laws.md#verdict-survives-boundary)).
A design that collapses "the program said no" and "the program crashed" into
one generic error has lost the one distinction the operator needs to know
whether the program is working.

## Protocol checks run outside the program

**The checks that belong to the protocol - the signature on the request, the
chain from the presented identity to a trusted issuer, the proof of key
possession, the audience the token was minted for, the freshness of the
assertion - run in the issuer's own code before the program is invoked and
again over what the program returns, never inside the program, because the
program is operator-authored and an operator who can edit the program must
not be able to edit the protocol.** Before: the request is verified so that
the program sees only inputs the protocol vouches for - a claim set that was
signed, a request whose key possession was proved. After: the returned
template or authorization object is checked for the invariants the issuer
promises regardless of policy - the lifetime does not exceed the issuer's
own limit, the artifact carries the extensions the protocol requires, the
authorization object does not name a policy the tenant cannot grant. The
program is a stage between two fixed gates, and the gates see the real
input and the real output ([gate-sees-target](../../../_laws.md#gate-sees-target)),
not the program's account of either.

The naive reading hands the program the raw request and trusts its output,
on the argument that the operator wrote the program and is responsible for
it. The operator is responsible for policy; the operator is not a
cryptographer, and a program that must itself verify a signature will
eventually be written to skip it.

## Sandboxed, bounded, non-Turing-complete

The program runs in-process, because a webhook adds a network dependency and
a latency floor to every issuance, and an issuer that cannot issue when a
sidecar is down has acquired an availability dependency nobody priced. In
process means the program's language must be bounded by construction: no
unbounded loops, no recursion, a cost limit on evaluation, no access to
anything but the inputs the issuer hands it. The language is an expression
language, not a scripting language, and the temptation to build a bespoke
one is the second rejected design: a language nobody else has tooling for is
a language nobody can lint, test or review, and the operator is "solely on
the hook" for its correctness with no help.

## Definition-time and use-time

A program is compiled at role definition and refused if it does not compile;
this is the one reference that is validated hard at definition, because a
program that does not parse is wrong on the day it was written. It is
compiled against *every* input shape it can be invoked with - the issue
form that generates a key and the sign form that receives one, the login
and the renewal - because a program that type-checks against the shape its
author tested and fails against the other is discovered by the first
requester of the other shape, in production.

The issuer consumes the program's *output copies* and never the request it
was given: a returned key type, a returned issuer reference, a returned
lifetime are validated and then used, and the request's raw fields are not
consulted again after the program ran. A design that merges the program's
output back over the raw request re-admits every unsanitized field the
program chose not to mention. Its
*variables* - named sub-expressions the operator can compose, references to
issuer state - resolve at use like any other reference. The program's inputs
are a fixed, documented set; a program cannot ask the issuer for something
the issuer did not offer, which is what keeps the second gate's job finite.

## When not to apply it

Do not reach for a program when a field would do: every rule that fits the
static vocabulary belongs in the static role, where it is declarative,
auditable by query and comparable across roles. The program role is for the
rule that has no field, and the discipline is to notice when a program role
has been written for a rule that does have one. And do not let the program
role become the verbatim door: it shapes under the ordinary issuance
capability, and its output is still subject to the issuer's own limit and
the protocol's invariants.
