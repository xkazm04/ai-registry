---
layer: technique
type: technique
subject: companion-runtime
technique: metered-llm-seam
status: forged
laws: [one-validation-door, unknown-is-not-a-value, gate-sees-target]
shared_with: []
use_when: [adding a background or reactive model call to a companion, a spend dashboard cannot explain an invoice, deciding where model access lives in a companion runtime]
---

# The metered model seam

A companion reaches a model for several different reasons, and only one of them
has a human watching. That is the entire argument for making model access a
single function with a required argument, rather than a client anyone may
construct.

## One entry point, and the leg kind is not optional

Every model call in the runtime — the conversational turn, the maintenance pass,
the unbidden reaction, the one-shot micro-call that names a thread — goes through
one function. The function requires the caller to state which **leg** this is.
Not a defaulted parameter, not a field on an options object with a sensible
fallback: a required argument, so that a call cannot be written without the
statement being made.

The requirement is doing real work. The leg kind is simultaneously the routing
input (which model tier and how much deliberation this class of work deserves),
the budget scope (what this class may spend), the attribution axis on the ledger
row, and the visibility class. Make it optional and it will default to the
interactive value, because that is what the first caller was; every background
leg written afterwards inherits a default nobody chose, and the first evidence is
a bill that no per-feature breakdown can decompose — the rows are all there and
they all say the same thing.

The set of legs is small, closed, and named for the *situation* rather than for
the caller: a human is waiting; nobody is waiting and the work was scheduled by
pressure; nobody is waiting and the work was triggered by an event; a mechanical
transformation with a tight cap. A leg named after the feature that added it
("the summary leg") is a set that grows without bound and cannot carry policy.

This is the [one-validation-door](../../../../_laws.md#one-validation-door)
shape applied to spend rather than to writes, and it exists for the same reason:
enumerating call sites is a task that succeeds every time it is performed and
fails on the site added afterwards. The budget subject can only enforce what it
can see; a chokepoint is what makes seeing the whole surface a structural
property rather than a review outcome
([gate-sees-target](../../../../_laws.md#gate-sees-target)).

## The seam is also where the non-money concerns attach

Once every leg passes one door, that door is the only place several other
disciplines have to be implemented, and each of them is otherwise re-implemented
per caller with slightly different mistakes:

- **Attribution context** — which companion, which conversation, which cycle,
  which action — captured from live context at the call, because it cannot be
  reconstructed afterwards.
- **The safety envelope** for untrusted text going into the request, so no leg
  can assemble a prompt that skips fencing.
- **Timeout and cancellation**, propagated from the caller's own lifetime, so an
  abandoned turn does not leave a leg running.
- **The failure taxonomy** the caller branches on: refused, unreachable, rate
  limited, malformed, timed out. A leg that returns a string for every failure
  forces every caller to guess.

## One parser reads every response

Usage is reported differently by different vendors, differently between streaming
and non-streaming modes of the same vendor, and differently again when a call
involved cached input or multiple internal rounds. If each leg reads usage for
itself, the usage extraction in the leg somebody wrote last week is the one that
returns nothing, and it will be the leg that runs a thousand times a day
unattended.

So the seam owns one parser, and every leg's response passes through it. The
parser's job is narrow: produce a usage record, or produce an explicit *usage
unavailable* with the reason. Its correctness is worth pinning with fixtures per
response shape, because it is the single point where a vendor's format change
turns into silently missing spend for the whole product at once — a
concentration that is a feature when the parser is tested and a catastrophe when
it is not.

## Unknown cost is a value the system carries

Some legs will not yield usage: a stream that dropped, a provider that omitted
the block, a failure after the request was accepted. The row is still written,
and the cost field holds **unknown** — a state the storage can represent, the
rollups can count, and every surface must render as unknown
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).

The two shortcuts are equally wrong and fail in opposite directions. Writing zero
makes the calls the system understands least look free, and they are
disproportionately the expensive ones — the retries, the long-running background
passes, the streams that broke halfway. Dropping the row makes the leg disappear
entirely, so the enumeration that the chokepoint was built to guarantee is
quietly incomplete again. Carrying unknown keeps both facts: the call happened,
and we cannot say what it cost. A dashboard that shows "unknown: 9%" is telling
the truth; the same system with a zero default shows a confident total that is
wrong by an unknown amount.

The share of unknown rows is itself a monitored number, because it only moves for
reasons that matter: a vendor changed a shape, a leg started failing after
acceptance, a new transport bypassed the parser.

## The row records the call, not the caller's satisfaction

One row per invocation, and the row's verdict is the *provider's*. A leg whose
request completed normally but whose reply the caller could not use — a malformed
payload, an empty result, a parse that failed — still records exactly one
successful call, because that call was made and will be billed. The caller's
disappointment is a separate fact, recorded where the caller's outcomes are
recorded.

Collapsing the two is a common and expensive mistake in both directions. Mark the
row failed because the parse failed and the failure rate becomes a measure of the
product's parsing, not of the provider's reliability — and the two need different
responses. Skip the row because "the leg did not really work" and the most
wasteful calls in the system, the ones that spent money and returned nothing
usable, are the ones the ledger never sees.

## What this technique does not own

Prices, the ledger's schema, ceilings, and the arithmetic of a billing period
belong to the cost subject, which is written to be used by any metered dependency
and not just a companion. This technique owns only the runtime property that
makes those rules applicable: **there is one place to apply them, no leg exists
outside it, and every leg has declared what kind of work it is.**

## When not to do this

A companion with exactly one model call — a chat turn and nothing else — has a
chokepoint by construction and gains nothing from the ceremony. The technique
becomes necessary at the second leg, and specifically at the first leg with no
human watching it, which is the one that will run most often and be noticed
least.
