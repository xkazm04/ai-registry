---
layer: technique
type: technique
subject: terminal-multiplexing
technique: capability-revalidation
status: forged
laws: [gate-sees-target, unknown-is-not-a-value]
shared_with: []
use_when: [the protocol worked at startup and stopped mid-session, a run hangs waiting for a marker that will never arrive, a user's own configuration swallows the command-start marker, deciding whether a capability probe is per session or per run]
---

# Capability revalidation

Detection succeeded. That is a true statement about one moment, and a host
that stores it as a session-lifetime fact has converted a measurement into a
belief. An injected integration is not a linked library: it lives inside a
process the user also configures, and everything about its continued presence
is contingent on decisions made after the host stopped looking.

This technique owns the second half of detection — the part that runs
forever. Its rule is short: **a capability probed once and trusted for the
life of the session is the failure mode**, and the cheapest correct probe is
the run itself.

## The ways a live protocol goes away

The marker that matters most is the one announcing that a command has begun,
because it is what promotes a run to the protocol tier and revokes the
heuristic's authority to end it. Three ordinary, non-exotic things stop that
marker from arriving on a session where detection previously succeeded:

- **The user's own configuration.** It loads after the integration, and it
  can reset the prompt, replace the hook chain, or disable the very
  behaviours the marker emission depends on. This is not a rare
  misconfiguration; it is the default arrangement, and
  [injected-hook-reconvergence](./injected-hook-reconvergence.md) owns the
  countermeasure.
- **A shell feature that rewrites the command line before it runs.** A
  history-substitution facility, an alias, or a correction prompt can alter
  or reject the submitted line, so the preamble that would have emitted the
  marker never executes — while the command itself may still run.
- **An error in what was submitted.** A parse failure or an abnormal exit
  from the hook chain can skip the emission and take the run's boundary with
  it, leaving output flowing under no protocol at all.

Note what these have in common: none of them is a failure of the *host*, none
produces an error the host can see, and all of them are invisible to a probe
that ran at startup. A detection result is a proxy for the shell's current
state, and it passes exactly when the proxy has diverged from the target
([gate-sees-target](../../../../_laws.md#gate-sees-target)).

## Revalidate per run, on the evidence the run itself produces

The correct probe is not a periodic health command. Sending one costs a
command per interval, pollutes the session's history, and still answers a
question about the previous moment. The run is a better instrument with
perfect timing: **every submitted command re-establishes the tier by whether
its own start marker arrives.**

The procedure per run:

1. Submit the command through the protocol path.
2. Wait a bounded window — short, and measured from the submission, not from
   the last byte — for the start marker belonging to *this* run.
3. If it arrives, the run is on the protocol tier and the terminator set is
   the closed one that
   [completion-authority-arbitration](./completion-authority-arbitration.md)
   defines.
4. If it does not, **demote this run** to the fallback tier and complete it
   under the heuristic's rules, which are correct there.

The window in step 2 is a real design parameter and it is not a timeout for
the command. It bounds only the gap between submission and acknowledgement,
which is a shell round trip rather than a workload, so it can be tight
without penalizing long commands — the command's own timeout is a separate,
caller-supplied bound.

## Demotion is per run, recorded, and reversible

Two asymmetries make this safe, and both are easy to get backwards.

**A missing marker demotes the run, not the session.** One command mangled by
a history-substitution rule says nothing about the next one, and a host that
un-arms the session on first failure loses the stronger tier permanently for
a transient cause. Equally, a successful run does not re-arm a session that
never armed: promotion still requires the readiness edge that
[readiness-edge-detection](./readiness-edge-detection.md) owns.

**A demoted run carries its demotion in the result.** It has no exit status
to report, because nothing produced one, and the absence must survive to the
caller rather than being filled in. A result that says "completed, status
zero" when the host was reading quiet output is unknown rendered as a
definite value at exactly the boundary where an optional status met a
non-optional field
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)) — and
it is worse than the heuristic tier's honest answer, because it is
indistinguishable from a real success.

## What must never happen: waiting forever on the stronger tier

The single most dangerous shape in this lane is a host that, having promoted
a session at detection, waits indefinitely for a completion marker that a
swallowed start marker guaranteed would never come. Every terminator in the
protocol set is a positive event; if the run never entered the protocol tier,
none of them can fire, and the run hangs with output arriving on screen and a
caller blocked behind it. The bounded acknowledgement window above exists
precisely to make that state unreachable: a run either has its start marker
within a shell round trip or it is not a protocol run, and there is no third
outcome to hang in.

The generalization is worth carrying out of this subject. When a system
promotes itself to a stronger evidence channel, the promotion must be
re-earned by the unit of work that depends on it, and the fallback must stay
armed for the whole life of the session rather than being torn down at the
moment the stronger channel first answers.
