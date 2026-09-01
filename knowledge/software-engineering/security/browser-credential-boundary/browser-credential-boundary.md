---
layer: golden-path
type: golden-path
subject: browser-credential-boundary
status: forged
use_when: [wiring a browser client directly to a hosted data store, deciding whether a key may ship in the bundle, hardening a data store whose grants are already public, adding a privileged upstream a browser must not reach directly, a destination address arrives inside data your server will fetch]
techniques:
  - public-vs-server-env-split
  - broker-proxy-attaches-secret
  - outbound-fetch-destination-validation
  - opaque-upstream-errors
  - aggregate-view-not-base-table
  - omit-the-column-not-the-value
  - default-deny-plus-defaulted-owner
---

# The browser credential boundary

Every dependency a web application talks to forces one decision before any
other: **does the browser hold a credential for it at all?** Not "is the
credential protected", not "is the endpoint authenticated" — does the shipped
bundle, which any visitor can read, contain a value that opens that dependency.
The answer is per dependency, it is binary, and the two answers put the
enforcement point in completely different places. Everything else in this
subject follows from which answer a given dependency got.

The decision is forced because there is no third option. A value that reaches
code running in a browser is public: it sits in the bundle, in the network tab,
in a service worker's cache, in whatever archive crawled the site last week.
Minification does not hide it, an environment variable does not hide it, and a
build step that inlines it is not a vault — it is a printing press. The only
honest question is whether you *meant* it to be public.

## Regime one: the browser holds the credential, and the schema is the API

When a browser talks straight to a hosted data store, it carries a key that
names a role — conventionally an anonymous one — and every request it makes
arrives at the store as that role. This is a legitimate architecture and it is
not weakened by the key being public, because the key was never a secret; it is
a **role selector**, not a proof of anything. What it *is* — and what teams
discover late and expensively — is this:

> Under regime one, the database schema is the public API. Every grant that
> role holds is an unauthenticated endpoint, reachable by anyone with the
> address of your application.

Not "reachable by your application's UI". Reachable by a script someone runs
after reading your bundle. The table you added last week for an internal
dashboard, with a default grant nobody looked at, is now a public read
endpoint that returns every row. Nothing in your code is involved in that
request; your routing, your components, your gating are all bypassed, because
the request never touches them.

This is where the naive reading fails, and it fails in a specific and
recognizable order. First: *"the key is public but nobody knows it."* Second,
after that is pointed out: *"we authenticate our users, so the data is fine."*
Authentication answers who is asking; the store's policy engine decides what
that identity may read, and if no policy engine is switched on, the answer is
everything. Third, on discovery of a leak: *"rotate the key."* There is nothing
to rotate — the key did exactly what it was published to do. The remedy is
never key hygiene. **The remedy is always the grant matrix and the policies
behind it.**

So the enforcement point under regime one is **not your code**. It is the data
store's own policy engine, and your application is one client of it among
however many the internet chooses to write. Two consequences that reshape the
work:

- **Coverage is a property of the catalog, not of the review.** "Which tables
  can the anonymous role read" is a question with an exact answer that the
  store itself can be asked. Any belief about that answer which was not
  obtained by asking is a guess ([gate-sees-target](../../_laws.md#gate-sees-target)).
- **Refusal is silent.** A row-level policy that denies a read does not raise;
  it returns nothing. Denied and genuinely-empty are the same bytes on the
  wire, so a policy suite that only asserts "the legitimate caller still sees
  its rows" passes identically against a table with no protection at all
  ([failure-not-empty-success](../../_laws.md#failure-not-empty-success)).

## Regime two: the browser must not hold it, so a broker attaches it

The other answer applies to every dependency whose credential grants powers you
are not willing to publish: a privileged upstream service, an inference
provider you pay per call, an administrative role on your own store that skips
policy evaluation entirely. For these the browser holds **only its own session
token** — a proof of who the user is, scoped to your application, revocable —
and nothing else. All calls to the dependency go through **one same-origin
route** on your own server, which attaches the secret at the last moment.

The broker is not a proxy for convenience. It is the boundary itself, and three
properties make it one rather than a hole with a URL. It **allowlists what it
forwards**: request headers, methods, and path shapes are enumerated, because a
route that relays whatever the caller sends has handed the caller the upstream
directly, with your credential attached for their trouble. It **authenticates
its own callers** before it spends the credential, since a same-origin route is
as reachable as the bundle that calls it. And it **speaks a closed error
vocabulary** that never names the upstream — not its hostname, not its status
text, not its error body — because a broker that faithfully relays upstream
failures has published a map of your topology to anyone willing to send a
malformed request.

Moving the call to the server buys the secrecy and hands back a liability, and
it is the one most brokers miss: **the server's reach is larger than the
browser's.** Loopback, the private network the deployment sits in, sibling
services that never authenticate because only siblings could call them, the
link-local address a hosting fabric answers identity questions on — the browser
could reach none of those, and the process now making the call reaches all of
them. Network position is a credential too, an unnamed one attached to every
outbound request by virtue of where the process runs. It is spent whenever
something other than your configuration chooses the address: a link inside a
dependency's response, a callback target a tenant registered, an address a
generated answer names as the next thing to read. Those are data, not
addresses, and the validation they need is not the string check anyone would
write — it is the resolved address, bound to the actual connection, re-judged
on every redirect hop. That is
[outbound-fetch-destination-validation](./techniques/outbound-fetch-destination-validation.md).

The two regimes coexist in one application, and this is the normal case, not a
transitional state. A store with row-level policies runs in regime one, a
privileged orchestration service in regime two, and the boundary between them
is a naming convention strict enough that nobody has to remember which is
which — that is [public-vs-server-env-split](./techniques/public-vs-server-env-split.md),
and it is deliberately the first technique because a value that quietly changes
side is how regime two decays into regime one without anyone deciding.

## Under regime one, structure beats filtering

Once the schema is the API, the design instinct that transfers from ordinary
application code — *fetch the row, then filter what you return* — is the wrong
one. There is no "then". The caller composes their own query. What protects a
column is not the code that omits it but the absence of a grant that reaches
it, and three moves follow:

**Publish the aggregate, not the rows it came from.** A feature that needs
counts does not need the identifier-bearing rows those counts were computed
from. Serve the counts through a view that evaluates with the **caller's** own
identity rather than its author's, and revoke the browser-facing grant on the
base table underneath. A view that runs as its definer is a policy bypass with
a friendly name — the store's gate then evaluates against the wrong principal,
which is exactly the case the gate existed for. That is
[aggregate-view-not-base-table](./techniques/aggregate-view-not-base-table.md).

**A secret with no column cannot leak.** The strongest exclusion is structural:
if the shape the anonymous role can reach has no column for the sensitive
value, no policy edit, no forgotten predicate, and no future contributor's
"just add the field to the select" can put it on the wire. Filtering is a
promise maintained by everyone who ever touches the query; omission is a
property of the shape ([omit-the-column-not-the-value](./techniques/omit-the-column-not-the-value.md)).

**Default-deny, and let the identity supply itself.** Policies switched on with
zero policies written is a table nobody can read — the correct starting state,
and the one to leave in place for tables the browser has no business touching.
Where the browser must write, the owner column is **defaulted from the
authenticated identity** rather than sent by the client, so the writer never
transmits a value the policy then has to check against itself. The client
cannot forge what it does not send. That, plus the
insert/update/select interactions that make a policy set behave differently
from how it reads, is
[default-deny-plus-defaulted-owner](./techniques/default-deny-plus-defaulted-owner.md).

## Hardening an existing surface has a precondition and an order

Almost nobody designs this boundary first. The usual shape is a working
application, a public key that has been public for a year, and a hardening pass
that must land without an outage — which makes ordering the load-bearing part
of the work, not a detail of it.

The rule: **provision the replacement path before revoking the old one.** A
revocation applied while some server-side caller is still reaching the store
through the browser's public role is not a hardening; it is an outage with a
security narrative attached. So the sequence is: give the server-side path its
own privileged credential, verify it works, *then* revoke, and state the
precondition in the migration itself where the person running it will see it.
A hardening script that does not name what must be true before it runs will be
run before it is true.

The same discipline applies to what you deliberately do **not** change. A
public, non-sensitive table left readable on purpose is a decision, and an
unrecorded decision is indistinguishable from an oversight — the next audit
either re-litigates it or "fixes" it into an outage. Write the non-action down
next to the actions, with its reason. This costs one comment and closes a
recurring argument permanently.

## Where this subject ends and its neighbours begin

The **credential vault** ([credential-vault](../credential-vault/credential-vault.md))
owns what happens to a secret the *server* already holds: sealing it, brokering
its use, rotating it, retiring it. Its brokered door and this subject's broker
route are the same shape of mechanism, and the vault's treatment of destination
binding, scope intersection and audit is the deeper one — go there once you
have a server-side secret to look after. This subject sits one step earlier, at
the decision that produces or prevents that secret: whether the browser holds a
credential at all, and if it does, what the store must enforce because your
code no longer can. The rule for picking: if the question is *how do we custody
and apply this secret*, it is the vault; if the question is *should this value
be in the bundle, and what is exposed because it is*, it is here.

**Authorization** ([authorization](../authorization/authorization.md)) owns the
gate inside your own application — a chokepoint before dispatch, privilege
tiers, declared requirements, a decision your code makes and can audit. This
subject covers the case where **the enforcement point is not your code at
all**: the caller never reaches your dispatcher, and the policy engine that
decides is the data store's. Everything authorization says about default-deny
and about refusal being informative holds here and holds harder; what does not
transfer is the assumption that there is a handler to put a guard in. Pick by
asking who evaluates the rule. If it is code you deploy, that is authorization.
If it is a policy attached to a table, evaluated for a request your application
never saw, it is here.

**Sync and replication** ([sync-replication](../../backend-platform/data-layer/sync-replication/sync-replication.md))
owns the projection that leaves one store for another — what a replicated
record may carry across a boundary you control on both sides. Its allowlist
discipline and this subject's structural omission are the same instinct applied
to different boundaries: theirs is a stream between two systems you operate,
ours is a grant against an anonymous caller you never meet. When the recipient
is a replica, read them; when the recipient is anyone with a browser, read
this.

## What is not this subject

- **Authenticating the user.** Establishing identity in the browser — session
  tokens, refresh, sign-in flows — is upstream of everything here. This subject
  starts once an identity exists and asks what it may reach.
- **Transport security and origin policy.** Certificates, cross-origin rules,
  and content-security headers are a different membrane on the same wire; they
  do not make a published key private, and their absence does not make a
  default-denied table readable.
- **Server-side secret custody.** Once the value is out of the browser and in
  the broker, its storage, rotation and audit belong to the vault.
- **Query-level abuse control.** Rate limits, quotas and cost ceilings on a
  public role answer *how much*; this subject answers *whether at all*. They
  share a surface and not a decision.

## The techniques

- [public-vs-server-env-split](./techniques/public-vs-server-env-split.md) — a
  naming convention that makes "this value ships in the bundle" impossible to
  miss, the build-time inlining that makes it true, and the migration path for
  a value that changes side.
- [broker-proxy-attaches-secret](./techniques/broker-proxy-attaches-secret.md)
  — one same-origin route that attaches the credential server-side, allowlists
  what it forwards, and authenticates its own callers.
- [outbound-fetch-destination-validation](./techniques/outbound-fetch-destination-validation.md)
  — treating an address that arrived as data as attacker-controlled: scheme
  allowlist, judgement on the resolved address rather than the string, the
  verdict bound to the connection, and every redirect hop re-judged.
- [opaque-upstream-errors](./techniques/opaque-upstream-errors.md) — a closed
  error vocabulary mapped onto status codes, so callers can branch without
  learning your topology and no upstream detail crosses the boundary.
- [aggregate-view-not-base-table](./techniques/aggregate-view-not-base-table.md)
  — publishing a computed aggregate through a caller-evaluated view while the
  identifier-bearing table underneath loses its grant.
- [omit-the-column-not-the-value](./techniques/omit-the-column-not-the-value.md)
  — structural exclusion over filtering: a projection with no column for a
  secret cannot carry one, and it survives the next careless policy edit.
- [default-deny-plus-defaulted-owner](./techniques/default-deny-plus-defaulted-owner.md)
  — policies on, zero anonymous policies, and an owner column defaulted from
  the authenticated identity so the writer never sends what the policy checks.
