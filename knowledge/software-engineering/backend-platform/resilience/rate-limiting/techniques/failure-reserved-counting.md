---
layer: technique
type: technique
subject: rate-limiting
technique: failure-reserved-counting
status: forged
laws: [gate-sees-target, count-carries-predicate, one-validation-door]
shared_with: []
use_when: [limiting guesses at a password or verification code or recovery token, a login limit punishes a busy shared address for its successful requests, a burst of concurrent wrong guesses gets past a failed-attempt limit, a successful login resets the failed-attempt counter, an address over its own cap keeps locking other people's accounts, deciding whether trusted callers skip a limit that guards a secret, one limiter store serves several tenants and keys on an email or account id]
---

# Failure-reserved counting

Some limits exist to bound guessing: a password, a one-time code, a recovery
token, an invite secret. On those doors the harm is not the request, it is the
**wrong answer**. A correct answer costs the defender nothing, and a shared
address that sends a thousand correct logins an hour has guessed nothing. So
the counter's subject is the failed attempt
([metered-step-selection](./metered-step-selection.md) asked "which step";
here the answer is "which outcome", and
[gate-sees-target](../../../../_laws.md#gate-sees-target) is why: a counter
on arrivals fires when the door is busy, not when someone is guessing).

That creates a timing problem the arrival counter never had. The outcome is
known only after the handler runs, and a counter that increments after the
fact can be overrun: send fifty guesses at once, every one of them is checked
against a count of zero, and all fifty are evaluated before the first failure
is recorded. This is the textbook limit-overrun race, and on a secret-guarding
door it turns a limit of five into a limit of whatever the attacker's
connection can deliver in one window.

## Reserve on arrival, give back on success

The rule: **a failure-only limit takes its hit atomically when the request
arrives, and hands that one hit back when the request turns out not to have
failed.** Admission is the atomic increment-and-compare against the store, so
concurrency cannot overshoot: guess number L+1 is refused however the burst
was packed. The give-back runs on the success path, after the handler, and
returns exactly the hit this request took.

Two things it is not:

- **Not a reset on success.** The common shortcut, clearing the counter when
  a login succeeds, is a bypass. An attacker who owns any valid credential on
  the same key (their own account, behind the same address) interleaves one
  correct login every few guesses and the counter never reaches the
  threshold. A success may only undo its own reservation. Nothing a caller
  can do should clear a count someone else is running up.
- **Not "count failures afterwards".** A post-hoc increment is the race
  above. The reservation is what makes the number in the limit the number
  that is enforced.

Reservation is the price of deciding the outcome after admission. Where the
check is cheap and local, one comparison against a value held in memory,
the simpler form holds the same invariant: compare and count under one lock,
so parallel guesses cannot all read the same failure count. Reach for the
reservation when the verification runs outside the limiter's critical
section (a database lookup, a hash, a remote identity provider), which is the
usual case on a login door.

A request whose outcome is neither, a crash or a dropped connection, keeps
its hit. The window bounds the cost of that, and an attacker who can make
their guesses crash has found a different bug.

## A refusal by any limit gives back what it reserved

A guess-guarding door usually carries several limits at once: per account,
per address, per account-and-address. With reservation, every limit takes its
hit on arrival, so a request refused by one of them has already charged the
others. If those charges stay, an address that is over its own cap keeps
spending each targeted account's allowance with every refused request,
and the per-account limit becomes a lockout anyone can aim at anyone, from
an address the defence has already stopped.

So: **a request refused by any limit releases the failure hits the other
limits reserved for it.** A refused request was not an attempt; nothing was
checked. This is [limiter-topology](./limiter-topology.md)'s "evaluate all,
then commit all" in the form an atomic store allows. Where the check and the
increment must be one operation, you cannot evaluate first, so you reserve
everywhere and roll back everywhere on the first refusal. The invariant is
the same: a refused request has consumed nothing.

## Trusted to call is not trusted to guess

Server keys, privileged operators and internal jobs are commonly exempt from
limits, and for pacing limits that is right: they are doing legitimate work
at volume, and the limit protects capacity they are entitled to use. A limit
that is the only fence around a secret is different. A key that may call the
verification endpoint is not thereby entitled to the inbox or phone the code
was sent to, and a leaked server key with an exemption is an unlimited oracle.

So each limit declares which kind it is. **A pacing limit may honour the
exempt set; a secret-guarding limit counts everyone**, and the flag that
says so sits on the limit's declaration, beside its key, number and window,
not in the caller's identity check. limiter-topology's exempt set applies to
the first kind only.

## Key the account, then the tenant

The natural key for a failure limit is the target, an account id or the
identifier being logged in with, because that is what is being guessed.
Where one limiter store serves several tenants, an email or a user-chosen id
exists in many of them. Keyed bare, a caller in one tenant spends the count
of that address in every tenant, and the cross-tenant lockout is one request
loop away. **Key parts the caller chose, or that repeat across tenants, are
qualified by tenant; a key on the network address is not**, because the
address is the same caller wherever it calls
([key-design](./key-design.md)'s question, *can the caller change this?*, has
a second form here: *does this value mean the same thing in every tenant?*).

## When the store is down

A failure-only limit decides its direction in advance like any other
(limiter-topology § "When the shared state is unreachable"). Failing open is
the common choice for login, because refusing every login during a store
outage is an outage of its own, but it is then a declared choice with a
stated bound. On a door whose secret is short (a six-digit code), the bound
is the code's lifetime and the space it can be guessed in. If that bound is
not acceptable, the door fails closed and says so.

## Checking it

Five properties, each a short concurrent test against an in-memory store:

1. N concurrent wrong guesses against a failure limit of L: exactly L are
   evaluated, the rest refused, with no overshoot.
2. N correct requests leave the count at zero.
3. A request refused by the address limit leaves the account limit's count
   unchanged.
4. The same identifier in tenant B is unaffected by guesses in tenant A.
5. An exempt caller is still refused on a secret-guarding limit.

Property 2 alone is what most implementations test, and it is the one that a
reset-on-success shortcut also passes. Properties 1, 3 and 5 are the ones
that separate this technique from a counter with good intentions
([count-carries-predicate](../../../../_laws.md#count-carries-predicate): say
what the count counts, and test that it counts only that).

## Decision rules

- **Count the wrong answer, not the arrival,** on any door that bounds
  guessing.
- **Reserve atomically on arrival; give back one hit on success.** Never
  reset.
- **Any limit's refusal releases every other limit's reservation** for that
  request.
- **Pacing limits may exempt trusted callers; secret-guarding limits count
  everyone,** declared on the limit.
- **Qualify caller-chosen key parts by tenant** in a shared store; leave the
  address bare.
- **One declaration per door** ([one-validation-door](../../../../_laws.md#one-validation-door)):
  the door lists its limits as data, each with what it counts, so a reviewer
  reads the whole fence in one place.
