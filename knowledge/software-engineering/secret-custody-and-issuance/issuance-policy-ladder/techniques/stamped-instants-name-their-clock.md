---
layer: technique
type: technique
subject: issuance-policy-ladder
technique: stamped-instants-name-their-clock
status: forged
laws: [unknown-is-not-a-value, creation-names-reaper, verdict-survives-boundary]
shared_with: []
use_when: [a role pins a bound to an absolute timestamp, an issuer must mint before its time source is trustworthy, artifacts are minted ahead of demand and handed out later, deciding whether to end a credential with a deadline or with a revocation, a validity window is computed from the issuer's own clock]
applied: code
ab_verdict: better
---

# Stamped instants name their clock

Every rung of the ladder is a difference from *now*. The request asks for a
duration, the role caps a duration, the mount and the system cap durations,
and the issuing key's own limit is an instant the issuer compares against the
present. The role is evaluated at issue time against the state of the issuer
at issue time - and the clock is the one piece of that state nothing checks,
although it is the piece every other rung is measured from. This technique is
the rung the ladder does not have: what an issuer owes before it writes an
absolute instant into something that is about to leave.

## The rule

**When an issuer writes an absolute instant into an artifact - a not-before, a
not-after, a creation time that a reader will sort or partition by - it must
be able to warrant the clock that produced the instant at the moment it
produces it, and refuse to mint when it cannot, because the instant will be
read by parties who have no way to ask whether it was ever true.** A signature
over the instant does not help: sealing the whole statement stops the stamp
being *rewritten*, which is a different property from the stamp being
*correct*. A tamper-evident lie verifies.

The naive reading treats the clock as infrastructure - something the platform
provides, like memory - and therefore as something an issuance policy has no
business discussing. It fails on the two machines where minting matters most:
the one that has just booted and has not yet reached a time source, and the
one whose clock is about to be corrected out from under an artifact it already
minted. On both, the issuer is working, the role is valid, the ladder composes
cleanly, and every instant it writes is wrong.

## Three ways a stamp lies, and they need different answers

**It was never true.** An appliance with no battery-backed clock starts at a
fixed default and stays there until it can reach a time source. Mint a
self-signed certificate in that window and its not-before is a date years in
the past and its not-after is a rounding error away from it; a peer that
checks either one will refuse the artifact, and one that does not check will
accept a window nobody chose. The issuer knew it did not know the time and
published a definite instant anyway, which is exactly the conversion
[unknown-is-not-a-value](../../../_laws.md#unknown-is-not-a-value) forbids.

**It aged between minting and use.** An issuer that pre-mints - a buffer of
identifiers allocated ahead of demand so the allocator is off the request path
- writes the instant of *preparation* into an artifact handed out at some
later instant. The buffer is a good design and it stays good only while the
stock is younger than the tightest tolerance any reader of the stamp has: a
reader that derives a time partition from the identifier, or relies on the
stamp to order two artifacts, is broken by a stock that sat. **So a pre-minted
artifact carries an age bound, the stock past it is discarded rather than
issued, and the bound is derived from the tightest consumer of the stamp, not
from the size of the buffer.** An age bound chosen for the allocator's comfort
is a number with no reader behind it.

**The clock moved after it was written.** A stamped deadline is not a state;
it is a question re-asked against a clock at every later use, and a clock that
steps backwards answers it differently. Time-synchronisation corrections,
host migrations and cold boots all move a clock backwards, so an artifact the
issuer believes it has already ended can open doors again.

## Choose the remedy by whether the artifact is still reachable

The three lies have one discriminator between their remedies: **after this
artifact leaves, can the issuer still change it?**

- **It can** - the artifact is a row the issuer owns and re-reads on every use.
  Then a wrong instant is repairable, the issuer's obligation is a repair path
  and an operator who can see the stamp, and refusing to mint would be a
  larger outage than the defect. Say so in the design rather than leaving the
  repair to be discovered.
- **It cannot** - the artifact is carried away and presented to verifiers the
  issuer will never meet. Then a wrong instant is permanent for the artifact's
  whole life, revocation is slower than the abuse, and the issuer **refuses to
  mint until its clock is warranted**. A minting path that cannot refuse is
  not ready to be given a clock it cannot trust.

Between them sits the honest third option: **mint only bounds the issuer
itself enforces.** A relative window the issuer re-computes per request needs
no shared instant - but it requires the issuer to stay in the path, which is
exactly what an artifact that leaves does not allow. Naming this option is
what stops a design from pretending the first two are the same choice.

## An irreversible intent is never an instant

The sharpest case is the smallest. When an operator retires a credential *now*,
the tempting implementation is a stamped deadline equal to the present: one
field, one code path, the same mechanism as every other window, and durable
across restarts in a way a scheduled job is not. It is also the one deadline a
backward clock step always undoes, because *now* is the value any correction
moves past.

**When the intent is "this ends and does not resume", express it as a state no
clock can reopen - a revocation, a deletion, a flag the reader checks before it
checks any date - because an instant is re-evaluated and a state is not.** The
same rule covers a window that is already closed when it is computed: a
deadline clamped into the past is not a short window, it is a retirement, and
writing it as a date leaves it reversible. The choice is not deadline versus a
background task that might be lost; it is deadline versus a fact, and the fact
is available in every issuer that can already revoke.

This is also the honest reading of
[creation-names-reaper](../../../_laws.md#creation-names-reaper) for artifacts
whose reaper is a stamp: naming the reaper at creation is only as good as the
reaper, and a reaper that is a comparison against a movable clock has named a
condition, not a destroyer.

## Say which rung moved

A window narrowed by the clock's own uncertainty, by a pre-mint age bound, or
by a bound the requester did not set is still a narrowing the requester asked
about, and it travels with the artifact
([verdict-survives-boundary](../../../_laws.md#verdict-survives-boundary)). A
requester that asked for a week and received an hour, with only the resulting
date in the response, has been told the *value* and not the *reason*, and will
file the gap as a bug in the role rather than in the rung that produced it.
The rung that clamped names itself, including when the rung is "the issuer
could not warrant its clock and fell back to its shortest window".

## When not to use this

- **A bound nobody outside the minting process ever reads** is not a stamp, it
  is a local variable; the discipline begins at the first reader that cannot
  ask the issuer what it meant.
- **Measuring how long something took** is a different problem with a different
  answer: an elapsed time is a difference of two readings and belongs to the
  monotonic-interval discipline
  ([same-process-monotonic-intervals](../../../backend-platform/platform-observability/metric-surface-contract/techniques/same-process-monotonic-intervals.md)),
  which forbids the wall clock outright. An issued bound cannot take that
  advice, because it must name an instant two parties agree on, and that is
  precisely why the clock's truth has to be warranted instead of avoided.
- **Coarse artifacts far above the plausible clock error** - a window measured
  in years against a clock that can be wrong by minutes - survive an
  unwarranted stamp, and refusing to mint there costs more than it saves. Say
  which tolerance was assumed, because the next artifact minted by the same
  path may not be coarse.
