---
layer: technique
type: technique
subject: priced-authority
technique: approver-not-requester
status: forged
laws: [verdict-survives-boundary, identity-survives-reuse, one-validation-door, absent-guard-is-loud]
shared_with: []
use_when: [a read is allowed only with a second person's agreement, an approver must be able to approve without seeing the value, the requester must not be able to be their own approver, deciding where a blocked request waits and who can collect it]
stage: fleet
---

# Approver, not requester

Some reads are allowed by policy and still should not happen on one
person's say-so: a production root credential, a signing key, a customer's
data under a legal hold. Policy can express "needs a second party", but a
second party is a workflow - a request that blocks, a decision by someone
else, a collection by the original requester - and the workflow needs
somewhere to live that is not memory, a way to approve that is not a
temporary grant, and a rule about who may not be the second party.

## Where the blocked request lives

The request arrives, the policy check finds the second-party requirement,
and the server does not run the operation. It records the request - the
path, the caller, the operation, the approval requirements, the empty set
of approvals so far - and it needs a durable, revocable, self-expiring,
single-collection place to keep it. That place already exists: a wrap
token ([single-use-cubbyhole-wrap](./single-use-cubbyhole-wrap.md)). The
request is parked in the metadata of a wrap token, the token is returned
to the requester with the message that approval is required, and its
accessor is what the requester hands to the people who can approve.

Every property the workflow needs comes with the token. It expires, so an
unapproved request does not sit forever. It is single-use, so the response
can be collected once. It is revocable by accessor, so an approver who
changes their mind, or an operator who sees a request that should never
have been made, can kill it. It is a row, so a replica that takes over
mid-workflow finds the pending request where the ledger keeps everything
else. Holding the request in memory fails on the first failover; holding
it in a bespoke table re-invents the token store with fewer indexes.

## Approve, never read

An approver acts on the accessor. The accessor identifies the token
without being the token; it lets its holder inspect the request's
metadata - who asked for what, which approvals are in - and record an
approval against it. It does not let its holder unwrap, because unwrapping
requires the token itself, and the token is in the requester's hands.
That split is the technique: the approver can say yes and cannot see the
result. The requester can see the result and cannot say yes.

The operation does not run when the last approval lands. It runs when the
requester **collects**: the unwrap checks that the approvals satisfy the
requirement, then executes the parked request - under the *requester's*
authority, evaluated at that moment, not under the approver's and not
under any temporary policy granted to the requester for the purpose - and
returns the result through the consumed token. Executing at collection
rather than at approval is the same rule the neighbouring subject states
for any deferred work: capture at enqueue, check at execute. Between
approval and collection the requester's policy may have been narrowed or
their session revoked, and a response computed at approval time and
parked in the store would be a secret nobody is any longer entitled to,
waiting for its time to live. A temporary grant is the rejected design: it
widens the requester's policy for a window, everything else the requester
does in that window is widened too, and the audit line records a policy
change rather than an approval.

Approvals age. Each one is recorded with its time, and an approval older
than the requirement's window no longer counts toward the total, so a
request that gathered one approval on Monday and one on Friday against a
one-day window is still one approval short. The wrap token's own time to
live is set from the same window, so the parked request and the approvals
that would satisfy it expire together.

## The requester may not approve

An approver who can approve their own request has no second party. The
rule is checked by identity, not by name or by token: the identity that
created the request is refused as an approver of it, however many tokens
it holds and whatever groups it belongs to. A deployment that checks by
token misses the requester's second session; one that checks by group
membership alone lets a requester who is in the approving group approve
themselves. If a policy language offers a switch that permits
self-approval, the switch is off by default and turning it on is a loud,
reviewed choice, because a requirement with self-approval enabled is a
one-party workflow wearing a two-party name
([absent-guard-is-loud](../../../_laws.md#absent-guard-is-loud)).

The same identity check bounds the count. An approval is recorded against
the approver's identity, and a second approval by the same identity does
not increment the count - one approver is one approval, no matter how
many times they say yes or from how many sessions
([identity-survives-reuse](../../../_laws.md#identity-survives-reuse)).
Requirements are stated as "N distinct identities from group G", and the
count is over distinct identities. A requirement of two approvals that can
be met by one enthusiastic approver is a requirement of one.

## The state is typed at every hop

The request's state - pending, approved with N of M, satisfied, denied,
expired - is written in the token's metadata as a value the requester, the
approver and the operator all branch on
([verdict-survives-boundary](../../../_laws.md#verdict-survives-boundary)).
The requester polling for "is it ready" reads it; the approver's view of
"what has been approved" reads it; the audit line for each approval
carries it. A requester who receives only "not yet" cannot tell a request
awaiting its first approval from one awaiting its third, and the difference
decides who they go and ask.

Every transition goes through one door: the approval endpoint validates
the approver's identity against the requester's, against the requirement's
group, and against the approvals already recorded, and it is the only
writer of the approvals field
([one-validation-door](../../../_laws.md#one-validation-door)). The
requester's collection endpoint reads the state and refuses until it is
satisfied; it never writes approvals. An operator's revoke goes through
the token's ordinary revocation. Three writers with three copies of the
rule would disagree the first time the rule changed.

## Decision rule

When a read requires agreement from someone other than the reader, park
the request in a wrap token's metadata and return the token to the
requester, let approvers act only through the accessor, refuse the
requesting identity as an approver, count one approval per distinct
identity within the approval window, and run the operation under the
requester's own authority when the requester collects and the count is
met, because this gives the approver the power to permit
without the power to see, gives the requester the reverse, and keeps the
whole workflow inside the ledger's existing expiry, revocation and
failover.

The naive reading grants the requester a temporary policy when the
approver says yes. It fails on the second read: every other operation
that policy covers is now open for the window, the audit trail records a
grant and not a decision, and nothing ties the approval to the one
request it was given for.

## When not to use it

A requirement of *notification* rather than approval - someone must be
told, nobody must agree - is an audit rule, not this technique. And a
workflow whose approval takes days needs a token time to live of days,
which is a wrap held at rest for days; at that horizon the parked request
belongs in a system built for long-running approvals, and the wrap token
is the last step of it, minted when the decision is made.
