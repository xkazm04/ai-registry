---
layer: golden-path
type: golden-path
subject: priced-authority
status: forged
use_when: [designing the token or lease ledger of a server that issues authority, deciding whether a class of credential may skip persistence, handing a secret to a machine that has no credential yet, requiring a second person to approve a read without letting them see it]
techniques:
  - never-persisted-token-class
  - inline-auth-cannot-lease
  - secondary-index-before-primary
  - write-ahead-revocation-marker
  - single-use-cubbyhole-wrap
  - approver-not-requester
---

# Priced authority

A server that issues authority - a session token, a lease on a generated
credential, a capability to unwrap one response - is keeping a ledger, and
the ledger is what makes the authority revocable. This subject is the
issuer's side of that ledger: what it costs to write an entry, why the cost
is the feature, the single class of authority that is allowed to skip the
ledger and what it forfeits by doing so, the write order that keeps every
entry inside its revocation chain, and the one primitive - a single-use
token whose private store holds a response - that turns the same machinery
into secure introduction of a stranger and second-party approval of a read.

The principal-engineer stance is that **every unit of authority is a
persisted artifact, and its price is a storage write**. Not a signature the
server can verify statelessly, not a claim the holder carries and the
server trusts; a row, written before the authority is handed out, that the
server can find again by the token, by its accessor, by its parent, by the
path that created it. Everything the operator will one day need in an
incident - revoke this token, revoke everything this login produced, revoke
everything this mount ever issued - is a walk over those rows. A design
that avoids the write to make login cheap has not made authority cheaper;
it has made revocation impossible and deferred the bill to the day the
operator needs it most.

## The write is the feature

Login is one of the few requests an issuing server cannot scale by adding
readers: it creates state, and the state has to reach the store that every
replica reads. Three writes is a fair price for a session - the entry, the
accessor index that lets an operator refer to the token without holding it,
and the parent index that binds it into a tree - and each of those writes is
what a later operation reads. Revoke-by-accessor reads the second; revoke
the whole tree when a parent dies reads the third; revoke-by-prefix, the
break-glass move when a mount or an auth method is found compromised, reads
the creation path stored on every entry. Remove any one write and the
corresponding recovery move is gone, silently, until it is needed.

The naive reading is that the ledger is overhead and the fix is a
self-describing token: sign the claims, verify the signature, store
nothing. A self-describing token is exactly as revocable as the list the
server keeps of the ones it has disowned, which is the ledger again under
a different name, minus the indexes. Statelessness is not a property a
server gets to choose for authority it must be able to withdraw; it is a
property it can grant to authority it has decided never to withdraw - and
that decision, made explicitly, is the first technique.

## One class never persists, and it pays in capability

Some callers do not want a session. A pipeline job authenticates, reads two
values, and exits; a fleet of thousands of short-lived workers logs in once
each per minute. Charging each of them three writes buys a revocation
capability nobody will exercise, and the writes land on the same log every
replica must apply. The answer is not a cheaper session; it is a second
class of authority that is **never persisted**: the server encrypts the
token's own entry into the token value under a key only it holds, and
writes nothing. Validation is decryption. Expiry is a field inside the
ciphertext, enforced by comparison.

The class is honest about its price. Nothing that requires finding the
token later can exist for it: no renewal (there is no row to extend), no
child tokens (there is no parent to index under), no accessor (there is
nothing for it to point at), no private store, no revocation of one token.
A lease it creates is capped at the token's own remaining lifetime and
indexed under the nearest persisted ancestor, because that is the only
revocation chain such a lease can have. What it keeps is the fact that a
leaked value of this class buys an attacker exactly what its clock and its
policies allow and not one renewal more. The technique is
[never-persisted-token-class](./techniques/never-persisted-token-class.md).

The class also has a degenerate member: authority that is presented on the
request itself, authenticates that request, and is neither returned nor
stored. It is the cheapest authority the server issues - zero rows anywhere
- and it is safe only if the server refuses, mechanically, to let that
request create anything that would need a row. It has no clock to cap a
lease against and no ancestor to index one under, so a request that would
mint a lease under it has to be routed to the persisted path or revoked
and errored, because the alternative is a lease whose parent cannot be
found by any revocation chain. That refusal, and the bounded
amplification it accepts against unauthenticated endpoints, is
[inline-auth-cannot-lease](./techniques/inline-auth-cannot-lease.md).

## Write order is a security property

Once a token is persisted, the question is what happens if the server dies
between writes. The tempting order is primary record first, then indexes:
the token exists, and then it becomes findable. That order produces, on a
crash, a token that is valid and unreachable - not in its parent's list, so
revoking the parent leaves it alive; not under its accessor, so an operator
holding the accessor cannot kill it. The correct order is the reverse:
**write the secondary index before the primary record**. A crash then
leaves a pointer to nothing, which every lookup already tolerates, instead
of a record outside its revocation chain, which nothing tolerates. Stated
as a rule, the entry names its revoker before it exists
([creation-names-reaper](../../_laws.md#creation-names-reaper)). The
technique is [secondary-index-before-primary](./techniques/secondary-index-before-primary.md).

Revocation has the mirror problem. Revoking a token means revoking its
leases and its children, which is slow, deferred, and can fail halfway. If
the record is deleted first, a half-finished revocation leaves orphaned
leases with no parent to find them from; if it is deleted last, the token
keeps authenticating requests while its tree is being torn down, and a
second revocation started in that window re-enters the same teardown. The
answer is a **write-ahead revocation marker**: set a sentinel on the record
before the deferred work begins, so a lookup fails immediately, a second
revocation is refused as already in progress, and the record survives
exactly long enough to finish the job it is now only good for - deleted
last, as the commit of a teardown that can otherwise resume from it. That
is [write-ahead-revocation-marker](./techniques/write-ahead-revocation-marker.md).

## The single-use token is the primitive

Two problems in an issuing server look unrelated and have the same answer.
The first is secure introduction: a machine that has no credential yet
must receive its first one, through a channel - a provisioner, a job
scheduler, an orchestrator's environment - that logs, retries and can be
read by more parties than the recipient. The second is second-party
approval: a read that policy allows only when another person has agreed,
where the approver must be able to say yes without being able to see the
value, and where the requester must not be able to be their own second
party.

Both are solved by issuing an ordinary, persisted, **single-use token whose
private store holds a response**, and handing out the token instead of the
response. The token is unsigned on purpose. A signature would let the
recipient verify the token offline, and offline verification is exactly the
property an attacker who can redirect the recipient wants: whoever can
redirect you can also hand you the public key to verify against. So the
server, not the token, is the authority on validity, and the recipient
verifies by asking the server: an unauthenticated lookup returns the
token's creation path and creation time, so the recipient can confirm that
this token was minted by the request it expects before spending its one
use. A second unwrap fails, and a failed first unwrap is an incident, not a
retry. The technique, with the rejected signed design and the reason, is
[single-use-cubbyhole-wrap](./techniques/single-use-cubbyhole-wrap.md).

Second-party approval reuses it whole. The blocked request is not held in
memory and not granted by a temporary policy; it is parked, with its
approval state, in the metadata of a wrap token, and the token is returned
to the requester as the thing they may collect once approvals are in. The
approver acts on the token's accessor, which lets them approve; it does not
let them unwrap, which is the only way to read. The requester is refused
as an approver of their own request, one identity counts once no matter
how many times it approves, and the parked operation runs only when the
requester collects, under the authority they hold at that moment. That is
[approver-not-requester](./techniques/approver-not-requester.md).

## Boundaries

[authorization](../../security/authorization/authorization.md) owns who
may act: the tiers, the scopes, the chokepoint, and - in
[delegated-authority](../../security/authorization/techniques/delegated-authority.md) -
how an originating authority is carried across hops and narrowed at each
one. This subject owns what an authority *costs* and how it is *carried
as an artifact*: whether it is a row or a ciphertext, which indexes make
it revocable, in what order they are written, and how a response is
converted into a token that a stranger or a second party can hold. The
rule for a reader: a question whose answer is a policy decision (may this
caller, with this scope, do this) is theirs; a question whose answer is a
storage write, a write order, or a token shape (may this authority exist
without a row, what happens if the server crashes here, how does the
recipient know this token is genuine) is this subject's. Delegated
authority's chain is carried through this subject's tokens - a child token
is a hop, and it is narrowed by the neighbour's rules and persisted by
this one's.

[token-refresh-lifecycle](../../security/credential-vault/techniques/token-refresh-lifecycle.md)
in the credential vault is the consumer's side of a lease: when to renew,
how to survive a rotation, how to classify a failed refresh. This subject
is the issuer's ledger that the consumer is renewing against: what a
renewal reads, why a never-persisted token has no renewal to call, what
the consumer is told when the token it holds is mid-revocation. The rule:
if the code runs in the holder of the token, it is the vault's; if it runs
in the thing that minted it, it is this subject's. The two meet at the
wire, and the verdict crossing it - renewed, refused, being revoked - is
typed on both sides
([verdict-survives-boundary](../../_laws.md#verdict-survives-boundary)).

The issuer's side of a *lease on a generated credential* - creating the
remote object only after the lease can persist, revoking idempotently,
expiring the remote after the lease - is the sibling subject of dynamic
secret lifecycle, not this one; this subject stops at the token and lease
rows and their indexes. A lease's remote side effect is that subject's.

## The techniques

- [never-persisted-token-class](./techniques/never-persisted-token-class.md) -
  encrypt the entry into the token, store nothing, and forfeit renewal,
  children and accessor by construction.
- [inline-auth-cannot-lease](./techniques/inline-auth-cannot-lease.md) -
  authority carried on the request is never returned or stored; anything
  that would create a lease takes the persisted path or is revoked and
  errored; quota counts once and the amplification is stated.
- [secondary-index-before-primary](./techniques/secondary-index-before-primary.md) -
  the parent and accessor indexes are written before the record, so a
  crash leaves a dangling pointer and never an escaped token.
- [write-ahead-revocation-marker](./techniques/write-ahead-revocation-marker.md) -
  a sentinel on the record before deferred teardown, so lookups fail now
  and re-entrant revocation is refused.
- [single-use-cubbyhole-wrap](./techniques/single-use-cubbyhole-wrap.md) -
  an unsigned single-use token whose private store holds the response, an
  unauthenticated lookup for origin, and the server as the only authority
  on validity.
- [approver-not-requester](./techniques/approver-not-requester.md) -
  second-party approval parked in a wrap token's metadata; the requester
  may not approve, one approval per approver, approve but never read.
