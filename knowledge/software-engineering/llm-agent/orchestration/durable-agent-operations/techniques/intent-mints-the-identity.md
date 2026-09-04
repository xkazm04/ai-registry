---
layer: technique
type: technique
subject: durable-agent-operations
technique: intent-mints-the-identity
status: forged
laws: [record-precedes-effect, identity-survives-reuse]
shared_with: []
use_when: [a crash mid-provider-call leaves an unknown outcome, recovery cannot tell whether a tool ran, a recovered transcript gains an extra record every restart, an interrupted generation is billed as free]
---

# Intent mints the identity

An agent operation contains effects the runtime cannot observe atomically: a
provider request that may have been received, billed and partly answered; a
tool call that may have written a file, sent a message, or done nothing. For
each of them there is a window in which the runtime has acted and does not know
the result. This technique brackets that window with **two commits** — an
intent before the effect and a settlement after it — and, crucially, mints at
the intent the identities the output will occupy.

## The two commits

**Intent**, committed before the effect starts: *this operation is about to
perform effect X; its output will use identities R and U; here is the policy
captured for it.* The state after this commit says the effect is pending.

**Settlement**, committed after the effect returns: the complete output, its
spend row, and the next state, atomically, in one transaction. Either all of it
is durable or none of it is.

This is [record-precedes-effect](../../../../_laws.md#record-precedes-effect)
in its ordinary form, with the ordinary consequence: if the intent cannot be
written, the effect does not happen. What is less ordinary is what the intent
records. A record that only says "about to do something" is a flag; a record
that says "about to do something, and here are the identities its output will
occupy" is a reservation, and the difference decides whether replay is safe.

## What the intent buys that a position cannot

Without an intent, a crash before the effect and a crash during the effect
leave the same durable observation: *still at step N*. Recovery must then
choose a policy for both cases at once, and both available choices are wrong
for one of them — re-run and you repeat a side effect that already happened,
or fail and you discard work that succeeded.

With an intent, the two are different durable states. Before the intent commits,
the state is the previous ordinary one and recovery reruns the ordinary
procedure as if nothing had happened, because nothing had. After it, the state
says the effect is pending, and recovery applies a policy declared *for an
unknown outcome*, which is a different and much more honest thing than a retry
policy.

**The four durable crash positions** are the same for every repeat-sensitive
effect, and a design should be able to point at each:

| Crash point | What the durable state says | What recovery does |
| --- | --- | --- |
| before the intent commits | the previous ordinary state | run the ordinary procedure as if nothing happened |
| after intent, before the effect was admitted | pending | apply the unknown-outcome policy |
| during or after the effect, before settlement | pending | the same policy — the two are indistinguishable |
| after settlement | output, spend, next state | continue; never settle again |

Rows two and three being indistinguishable is **the point, not a defect**. The
runtime genuinely cannot tell them apart, and a design that claims it can has
inserted an inference between two commits — exactly the absent-value inference
the total-restart-point discipline forbids. The correct response is to make the
policy for "pending, owner gone" explicit per effect class, and to say in the
record that the outcome is unknown rather than guessing. What that closure must
say, and why writing *failed* is a lie the runtime has not earned, belongs to
the neighbouring indeterminate-closure discipline; this technique only
guarantees the state from which that closure can be computed.

## The identity half

Because the output's identities were minted at the intent, a recovery that has
to write a synthetic settlement writes it **into the slot the real settlement
would have used**. The record does not grow: recover twice and the transcript is
the same length and shape as recovering once, because the second recovery finds
the identity already occupied and the state already advanced.

This is [identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)
applied one step earlier than usual. The law is normally read at creation of an
entity; here the entity does not exist yet and the identity is minted anyway, on
the strength of a declaration that it is *about* to. That earliness is what buys
replay safety, and it comes with an invariant worth enforcing: **a reserved
identity may exist only holding the content its intent named.** A reserved slot
that gets filled by an unrelated record, or that a second attempt re-mints under
a fresh identity, has given up the property the reservation existed for.

A retry after a *settled* failure is a different attempt and takes fresh
identities — the failed response is durable history, and overwriting it would
erase the evidence of the attempt and its cost. The reservation is per attempt,
not per logical effect.

## The metering corollary

The spend row belongs to the intent's reservation, not to the settlement's
success. A provider that began work and was interrupted has consumed units and
will bill them, and a design that writes the usage row only on a clean
settlement books every killed generation as **free**. That is not a rounding
error: interrupted calls concentrate exactly where a system is under pressure,
which is where the ceiling matters. The obligation is to reserve the spend
identity at intent and to commit a row for the attempt — with units marked
unknown rather than zero where the provider never reported them. The ledger's
own shape, its per-class split, and the unknown-versus-zero rule are
[usage-ledgers](../../../evaluation-and-cost/cost-metering/techniques/usage-ledgers.md)',
and are not restated here.

## The honest non-goal

This does not make arbitrary external effects exactly-once. Nothing at this
layer can: the effect is on the other side of a boundary the runtime does not
control, and a crash at the wrong microsecond is indistinguishable from a
network loss whatever is written locally. What the two commits deliver is
narrower and worth more than a false promise:

- the **record** is exact — one settlement per attempt, in a reserved slot, no
  duplicates and no growth under replay;
- the **recovery decision is explicit** — a declared policy for an unknown
  outcome rather than an implicit re-run;
- the **cost is attributed** even when the outcome is not.

Say this out loud in the design. A durable-execution layer that lets its users
believe effects are exactly-once will have users who stop declaring which of
their tools are safe to re-run, and that declaration is the thing actually
carrying the safety.

## Boundary against a step position with a per-step re-run declaration

The neighbouring job discipline solves the same family of problem with one
commit and a cursor: make the step's effects durable first, then advance the
position, and accept that a crash between the two re-runs the last step. Its
safety burden lands on **at-least-once per step**, which each step declares how
to absorb — naturally idempotent, keyed, marker-guarded, or honestly not.

That is correct and it is not this. The discriminators:

- **Where the burden lands.** There, on per-step re-run safety. Here, on a
  declared policy for an unknown outcome, which may be "re-run" but may equally
  be "synthesize an interrupted result and let the model decide".
- **Whether the output's identity must survive the replay.** A step that
  re-runs and overwrites by key does not care what its result is called. An
  agent operation's outputs *are* transcript records with identities that other
  records reference, so a replay that mints a new one corrupts the record even
  when the effect was harmless.
- **How many outcomes one unit has.** A step has one. A single agent turn has a
  provider outcome and then a batch of tool outcomes settling concurrently,
  which no single cursor orders.

Where none of those three apply — a linear pipeline of keyed effects with no
identity in its output — the cursor is the simpler design and should be
preferred. Two commits per effect is real cost.

## Decision rules

- Bracket every effect whose repetition is unsafe or whose outcome is
  unobservable in two commits: intent before, settlement after.
- Mint at intent every identity the output will occupy, including the spend
  row's. Never mint an output identity at settlement.
- Commit output, spend and next state in one transaction. A settlement that
  lands in pieces reintroduces the window it exists to close.
- Refuse the effect when the intent cannot be committed.
- Declare, per effect class, the policy for "pending and the owner is gone" —
  and accept that "before the effect" and "during the effect" are one state.
- Keep the reservation per attempt: a retry after a settled failure takes fresh
  identities and leaves the failed attempt durable.
- Reserve and commit the spend row for an interrupted attempt, with unknown
  units expressed as unknown.
- Write the non-goal down where tool authors will read it, so the re-run
  declarations keep being made.

## When not to use it

An effect that is free to repeat and whose output has no identity anyone
references — a pure read, a recomputation, an overwrite by key — does not need
an intent. Re-issue it after an interruption and close the old attempt; the
second commit is pure overhead. The technique earns its cost at the first effect
that is either irreversible or whose result other records point at, and in an
agent runtime that is the first real tool call.
