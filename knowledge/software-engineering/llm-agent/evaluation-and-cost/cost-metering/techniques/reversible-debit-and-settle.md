---
layer: technique
type: technique
subject: cost-metering
technique: reversible-debit-and-settle
status: forged
laws: [creation-names-reaper, identity-survives-reuse]
shared_with: []
use_when: [debiting a caller's balance before the provider call rather than after, a cancelled request billed for work it never received, a retry of a refunded request running the paid call for free, refunding only the undelivered portion of a multi-part job]
---

# Reversible debit and settle

A prepaid product cannot meter after the fact. If the caller must be able to
*afford* the call before it runs — a token wallet, a credit balance, a hard
per-caller ceiling with no invoice behind it — then the debit happens first
and the work happens second, and the debit is therefore a claim about work
that has not been done yet. Every such claim is provisional, and the
provisional claim is only as good as the mechanism that reverses it.

[budget-enforcement](./budget-enforcement.md) owns the enumeration:
which outcomes owe a reversal, and the rule that the set is written at the
charge site rather than discovered at each early return. This technique owns
what the reversal *is* — a handle with a lifecycle, an amount that is not
known until reversal time, and an identity that has to survive its own
undoing. The three are separable failures and each one has been paid for in
production money.

## The debit hands back its own undo

The charge returns a handle bound to the exact ledger identity it just wrote,
not instructions for reassembling one. A caller that has to remember the
account, the amount, and the reference in order to refund will eventually
refund the wrong one of the three, and the refund that reaches the wrong
reference is indistinguishable from no refund at all until reconciliation.
This is [creation names its reaper](../../../../_laws.md#creation-names-reaper)
with money in it: the site that takes the debit is the only site that holds
every fact the reversal needs, so the reversal is manufactured there and
passed out as a closure over those facts.

The handle's contract is stated where the handle is granted, because it is
not the contract a reader assumes. Reversals dedupe on the reference, which
means they are idempotent in the direction people test — calling twice with
the same intent is safe — and **at-most-once with the first amount final** in
the direction people do not: a partial reversal followed by a full one
silently swallows the remainder, because the second write finds the reference
already present and returns success without adding anything. The naive
reading, "refunds are idempotent, so an extra one cannot hurt", is exactly
backwards for escalating intent. The rule is to compute the final figure and
issue it in one call, and to say so at the grant site rather than in a
changelog.

## Arm on cancellation, disarm on settle

The window that swallows money is not the one people guard. A caller wraps
the work in a catch block that reverses on failure, and that catch block
covers everything *inside* it — but between a successful charge and the first
line of the work there is a gap where the request can be abandoned and the
catch block never runs at all. On a streamed response the gap is wide and
routine: the charge completes, the response object is constructed, the
consumer closes the tab, and the stream's producer is never started. The
charge landed; nothing was produced; nobody is left to refund it.

So the reversal is **armed at the charge**, off the request's own
cancellation signal, and not by the code that does the work. Arming closes
the gap in both directions — cancellation before the work starts and
cancellation during it reach the same once-guarded reversal, so a later
catch-block reversal is a safe no-op rather than a competing write.

Arming introduces the mirror bug, and it is the quieter one: a reversal that
stays armed after the work has been delivered refunds work the payer
received. A late cancellation — a tab closed after the result was already
rendered and saved — should cost the caller nothing, and with a live armed
listener it costs them the whole charge. The disarm is therefore explicit and
named: **settle**, called on the success path once the work is both delivered
and durably recorded.

The ordering of those two is a decision, not a detail. Persist and then
settle, and a crash in between reverses a charge for work the payer keeps —
the product loses the money. Settle and then persist, and a crash in between
bills for work that was lost — the payer loses the money. Neither window can
be eliminated without a transaction spanning two systems that do not share
one, so the rule is to pick the direction whose failure favours the payer,
apply it uniformly, and state it. Persist-then-settle is the ordinary answer.

One entry condition deserves its own branch. If the request is *already*
cancelled at the moment the charge returns, the reversal is issued
**awaited** — not fired into the background, because a connection or process
teardown drops an unawaited credit — and the paid work is not started at all.
That outcome is neither a success nor a server error, and it gets its own
machine-readable status, per
[a verdict survives its boundary](../../../../_laws.md#verdict-survives-boundary):
"the client left before we began" is a fact a caller's own metrics need to
distinguish from a failure it caused.

## The refundable amount is read at reversal time

For a single call the reversal is the whole charge. For anything that
delivers in parts — a multi-section generation, a batch, a run that persists
as it goes — the refundable amount depends on how far it got, and how far it
got is not known when the handle is created. A fixed amount captured at
charge time is wrong in both directions: refund everything and the payer
keeps delivered work for free, refund nothing and they are billed for work
that never arrived.

The handle therefore takes the amount as a **live read** rather than a value
— a thunk evaluated at the moment of reversal, over counters the work path
updates as it completes each part. Absent one, the reversal is the full
charge, which is the safe default for the single-part case.

The arithmetic carries one non-obvious rule. Compute the **kept** portion and
derive the refund as the residual, rather than rounding the refund directly.
Rounding the refund lets the kept charge drift upward by up to a unit at some
boundaries, and it drifts in the direction that favours the seller — which is
precisely the direction that will be found by a customer and not by a test.
Flooring the kept portion and returning `charge − kept` makes the rounding
deterministically favour the payer and guarantees the two halves sum to the
charge exactly.

## A reversed identity must not free-pass the retry

This is the failure the whole technique exists to name, and it is invisible
until somebody notices a paid feature running for free.

A charge is made idempotent by a reference: a retry carrying the same
reference finds the debit already recorded and returns success without
debiting again. That is correct while the attempt is **open** — two
concurrent duplicates of one request should collapse to one debit. It becomes
a hole the moment the attempt is **closed**, meaning the debit and its paired
reversal have both landed. From then on every retry with that reference
dedupes against a debit whose money was already given back, so the caller
gets `ok` with no debit and the paid work runs, and it will keep running free
for as long as the reference is stable. Any caller deriving its reference
deterministically — from a record id rather than a fresh identifier — is in
this state permanently after its first failure-and-refund.

Closing it takes four things together:

- **The reversal's identity is derivable from the debit's** by one shared
  convention, owned in one place that both the writer and every storage
  driver read. Without that derivation the ledger cannot tell a closed
  attempt from an open one — it would have to guess which credit pairs with
  which debit.
- **The store reports which kind of dedupe it just did.** A dedupe against an
  open debit is a silent, correct collapse. A dedupe against a closed one is
  a distinct signal returned to the charge site, not a log line.
- **The charge walks to a fresh attempt identity** on that signal —
  `<reference>:r2`, `:r3` — retrying until it either lands a real debit or
  dedupes against an open attempt. Each attempt's reversal identity follows
  its own attempt identity, so refund idempotency stays per-attempt and a
  refund of attempt two cannot close attempt three.
- **The walk is bounded**, falling back to a unique identity after a handful
  of steps. Past that point the request is in a pathological retry storm, and
  trading the concurrency collapse (a unique reference can never dedupe) for
  guaranteed termination is the right trade — but it is a trade, so the bound
  is a named constant with the reasoning attached.

The general shape is
[identity survives reuse](../../../../_laws.md#identity-survives-reuse) applied
to a key whose *operation completed and then reversed*: the reference still
identifies something real, and what it identifies is finished, so reuse of it
must mint a new attempt rather than inherit the old one's verdict.

A companion rule falls out of the same place: **namespace the reference by
operation**. Two different paid operations handed the same caller-supplied
request id would otherwise dedupe each other, and the second one — a
different, possibly more expensive operation — would return success with no
debit at all. The reference is `<operation>:<request id>`, so a collision
across operations is impossible by construction rather than by the caller
being careful.

## When not to reach for this

The reversible debit is the answer to *prepayment*, not to metering. Where
the caller is invoiced afterwards and the ceiling is a launch gate, the
ordinary shape is simpler and better: meter after the call per
[usage-ledgers](./usage-ledgers.md), gate before it per
[budget-enforcement](./budget-enforcement.md), and accept the one-call
overshoot that technique already declares. Adding a reversal lifecycle there
buys nothing, because there is no balance sitting wrongly low in the
meantime.

Even under prepayment, the arming half is over-engineering for work that is a
single synchronous call the caller awaits — a try/finally reversal covers
every path, because there is no window in which the caller's own code fails
to run. Arming earns its keep exactly where the response is streamed,
deferred, or discardable by a consumer the server cannot observe. Take the
handle and the closed-attempt walk always; take the arming when the work
outlives the function that charged for it.

## Smells

- A refund function taking an account and an amount as parameters, called
  from several places that each reconstruct the reference.
- Reversal documented as "idempotent" with no statement of what happens to
  the second call's *amount*.
- A cancellation path that fires a reversal without awaiting it, on the way
  out of a request that is already tearing down.
- A partial refund computed by rounding the refund rather than flooring the
  kept portion.
- One armed abort listener and no named disarm — or a disarm called before
  the work is durably recorded.
- A stable, deterministic charge reference with no notion of attempts: the
  first refunded failure makes that operation free forever.
- A ledger whose dedupe path returns a bare "already charged" with no
  open-versus-closed distinction — the information exists at the only place
  that can see it, and is thrown away there.
- A charge reference built from a caller-supplied id with no operation
  prefix.
