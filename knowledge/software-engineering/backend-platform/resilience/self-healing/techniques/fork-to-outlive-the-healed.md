---
layer: technique
type: technique
subject: self-healing
technique: fork-to-outlive-the-healed
status: forged
laws: [record-precedes-effect, verdict-survives-boundary, one-authority-per-vocabulary]
shared_with: []
use_when: [the healer and the healed share a process and a fate, an error handler must run after the work it was configured for has already died, deciding whether a recovery routine belongs inside or outside the thing it recovers, a supervisor's own failure path has never been exercised, output from nested self-invocations has become unreadable]
---

# Fork to outlive the healed

[healer-death-as-promotion](./healer-death-as-promotion.md) takes a
configuration as given: the healed component is mandatory, so the healer cannot
outlive it, and the only remaining move is to write the verdict before the exit.
That technique is correct, and its premise is worth interrogating rather than
inheriting, because for one large class of system the premise is **a
consequence of a design choice, not a property of the problem.**

The choice is executing the healed work in the healer's own process. Where the
work can be re-expressed as a child process, the shared fate dissolves: the
supervisor keeps running, the child dies, and the recovery routine executes in a
process that never entered the failing state. The healer outlives the healed
because it was never the same thing.

The signature of a system that has not made this choice is a recovery handler
whose own reliability depends on how the failure happened to arrive. A handler
registered for a work item's failure runs after a returned error and does not
run after a process abort, an out-of-memory kill, a stack exhaustion, or a
signal. Nobody wrote that distinction down; it fell out of the handler living in
the address space it was protecting. Under
[absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud) that is the
worst shape a guard can take — present in every diagram, absent for exactly the
failures severe enough to need it.

## The mechanism

The supervisor does not run the work. It constructs a **re-invocation of
itself** — the same binary, the same entry point, a flag set derived from the
current one — and runs that as a child. It then branches on the child's exit
status, and the recovery routine runs in the supervisor's own process, in a
state no failure of the child could have corrupted.

Three properties make this an implementable technique rather than a slogan.

**The flag set is the interface, and it is smaller than the state.** Everything
the child needs to do the work must be expressible in the invocation: the
selected work item, the verbosity, the configuration file, the profile, the
caller's own arguments. Anything the parent holds that cannot be serialized into
that invocation is not available to the child, and this is the technique's real
cost. It is also its discipline: a supervisor that cannot enumerate what its
child needs did not know what the work depended on. Treat the flag set as a
declared contract with one authority
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)),
constructed in one function, not assembled at each call site — because there
will be several call sites, and a divergence between them is a child that
behaves differently depending on which parent spawned it.

**The child must be told it is a child, and the recovery must be disabled in
it.** The invocation the parent builds carries an explicit *do not protect*
flag. Without it, the child constructs its own child, which constructs its own
child, and the first failure recurses until something external stops it. This
flag is not an optimization; it is the termination condition of the whole
construction, and it belongs in the same single function that builds the flag
set.

**The nesting depth is state, and it is carried out of band.** A counter in the
environment, incremented on entry, is the cheapest carrier: the child reads it,
knows it is not the top invocation, and can suppress the banner, the update
check, and every other once-per-run affordance that a naive nested run would
emit N times. The counter costs nothing and it pays for itself twice, because of
the next section.

## The depth counter is also the only readable output

Nested self-invocations interleave their output on one stream, and the result is
unreadable in a way that is easy to under-estimate until it happens: three
levels of the same tool, emitting the same message shapes, in an order that
reflects scheduling rather than structure. There is no cheap way to reconstruct
which invocation produced which line after the fact.

The fix is one field. **Stamp the depth counter into every emitted record**, as
a fixed prefix beside the component name, blank at the top level so the ordinary
single-level run looks exactly as it did before. Nothing else in the design
needs to change, and the counter already exists for the control-flow reason
above.

This is worth stating as a general rule for the shape: **a system that
re-invokes itself owes its reader the nesting level in every line it writes.**
The alternative is a structured field on every record, which is better and which
most systems in this shape do not have; the prefix is the version that works on
a plain text stream and costs one string.

## Ordering: the verdict still comes first

Forking does not retire the sibling technique's rule, it changes who obeys it.
The parent survives, so the parent can write the promotion after the child dies
— but the *child* is now the party that holds the specific verdict, and the
parent sees only an exit status. An exit status is a number, and a number is
prose ([verdict-survives-boundary](../../../../_laws.md#verdict-survives-boundary)):
the parent can branch on non-zero, and cannot tell an exhausted recovery ladder
from a configuration error from a signal.

So the child still writes its declared verdict before exiting, exactly as
[declared-verdict-over-inferred-wreckage](./declared-verdict-over-inferred-wreckage.md)
requires, and the parent reads it rather than inferring from the status. The
fork buys a surviving handler; it does not buy the handler any knowledge. A
system that forks and then classifies by exit code has moved the healer out of
the blast radius and left the diagnosis inside it.

## Where this is the wrong move

The fork is not free and three conditions disqualify it.

- **The work's state is larger than its invocation.** An in-memory index, an
  open connection pool, a warmed cache, a live subscription — if the child must
  rebuild it, the per-invocation cost may exceed what the protection is worth.
  The honest test is to price one re-invocation against the frequency of the
  failure being protected against.
- **The supervisor holds live accounting the work mutates as it runs.** This is
  the sharpest form of the previous point and it deserves its own name, because
  it is the one that inverts the argument rather than merely pricing it. A
  spend counter decremented as the work consumes budget, a quota, a rate
  allowance, a progress stream — state that is *shared and mutable*, not merely
  large. Moving the work into a child turns each of those into a protocol, and
  the protocol reintroduces exactly the window the fork was bought to close: a
  child that spends and then hard-aborts has consumed budget the parent never
  observed. In one address space the counter is updated before the spend
  returns, which is [record-precedes-effect](../../../../_laws.md#record-precedes-effect)
  satisfied for free. Across a process boundary it has to be re-earned with a
  write-ahead ledger the child appends to before acting — and until that ledger
  exists, forking makes the accounting *less* trustworthy while making the
  failure classification more trustworthy. Build the ledger first; then fork.
- **The work must not be repeated, and the boundary makes repetition invisible.**
  A child that dies after its side effect and before its report is
  indistinguishable, to the parent, from one that died before the side effect.
  This is [record-precedes-effect](../../../../_laws.md#record-precedes-effect)
  arriving at the process boundary: the child writes the record the parent will
  read *before* the effect, or the parent cannot safely do anything except
  report.
- **The recovery routine's own work is the thing that failed.** Forking protects
  the supervisor from the work; it does nothing when the failure is in the
  supervisor's configuration, its argument construction, or the environment both
  processes share. Those failures reproduce in the child on every attempt, and
  the fork converts them from one crash into a loop of crashes unless the *do
  not protect* flag is doing its job.

## The boundary is usually further in than the failure is

A layered system does not choose once. It has several places it could put the
process boundary, and the right one is rarely where the failure is most
*visible* — it is where the state crossing it is smallest.

The observed pattern, in a work runtime that hosts contributed work items and
also calls an external tool to do the expensive part: the runtime keeps the work
item in-process, because the item shares the runtime's budget counter, its
progress stream and its checkpointer; and it forks the external tool, because
everything crossing *that* boundary is a request and a response. Nobody wrote
that down as a policy. It fell out of where the mutable state lives, which is
the same rule stated above, arrived at by construction rather than by design.

Read a candidate system this way before proposing the fork: **enumerate the
boundaries, and for each one write what would have to cross it.** The boundary
whose list is a request and a response is the one to fork, and it may already be
forked. The boundary whose list contains a counter somebody decrements is the
one to leave alone, and the failure classification it cannot give you is a real
cost to be paid elsewhere — usually by making the reaper's inferred verdict
honest about being inferred
([declared-verdict-over-inferred-wreckage](./declared-verdict-over-inferred-wreckage.md)),
rather than by moving the boundary.

## Decision rules

- If the healer and the healed share a process **and** the work is expressible
  as an invocation of the same binary, fork; the shared fate was a choice.
- Before forking, enumerate the boundaries and what crosses each. Fork the one
  whose crossing is a request and a response; leave the one whose crossing
  includes state the work mutates.
- If the work cannot be expressed as an invocation, do not fork; obey
  [healer-death-as-promotion](./healer-death-as-promotion.md) and write the
  verdict before the exit.
- Build the child's flag set in exactly one function, and put the *do not
  protect* flag in it. Two call sites constructing it independently is the
  defect, not the risk.
- Carry the nesting depth in the environment, and stamp it into every emitted
  record. Blank at depth zero.
- Have the child declare its verdict in a machine-matchable record before
  exiting. The parent branches on the record, never on the exit code alone.
- Price the fork against the failure rate before adopting it. A protection that
  costs a process spawn per work item, for a failure seen twice a year, is not a
  protection, it is a tax.
