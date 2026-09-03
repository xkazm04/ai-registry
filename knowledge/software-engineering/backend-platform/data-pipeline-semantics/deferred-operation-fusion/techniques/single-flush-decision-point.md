---
layer: technique
type: technique
subject: deferred-operation-fusion
technique: single-flush-decision-point
status: forged
laws: [one-validation-door, absent-guard-is-loud]
shared_with: []
use_when: [deciding where the materialize-now check lives, an operation saw stale values and nothing raised, adding a new operation class to a pipeline that defers]
---

# Single flush decision point

The question "must the pending entries be applied before this operation runs" has one
answer per operation, and it is asked in one function that the executor calls before
every operation. The function reads the operation's declared properties — is it
capable of deferring, does it require current values, has it been told to run eagerly
— and the pipeline's mode, and it either drains the pending list into the datum or
lets the operation append. No operation asks the question itself.

## Why one place

The alternative is the one every first implementation reaches for: each operation
checks its own input on entry, notices pending entries, and applies them. This is
wrong for a reason that is structural rather than stylistic. A datum with pending
entries is a well-formed array; nothing about it is invalid, and every operation
that reads it without checking will run to completion and return a well-formed array
with values computed from the wrong frame. The failure has no signal. A test that
compares against an eager run will catch it — for the operations that have such a
test — but the operation that was added last quarter, by someone who did not know
the protocol, has no test and no check and produces wrong output at full confidence.

Centralizing the decision converts that class of defect from *forgot to check* into
*declared nothing*, and declaring nothing has a safe default. An operation that
inherits no lazy capability is a plain operation, and the predicate treats a plain
operation as one that needs real input: it flushes. The new author does not have to
know the protocol exists to be protected by it
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud) — the guard
engages on its own, and opting out of it is the thing that takes an explicit act).
This is [one-validation-door](../../../../_laws.md#one-validation-door) applied to
execution: every path that runs an operation over a datum passes through the same
predicate, and the set of such paths is enumerable.

## The predicate

Written out, the rule is short. Flush before the operation unless *all* of the
following hold: the operation is of a kind that can defer; the operation does not
declare that it reads current values; and the operation is, for this run, actually
lazy — its own flag says so and the pipeline mode has not overridden it to eager.
Any one of those failing means the pending list is drained first. The predicate is
then applied a second time at the end of the pipeline, unconditionally, because
a datum leaving the pipeline must be materialized regardless of what the last
operation declared.

Three consequences follow from the shape of that rule. First, laziness is opt-in at
the operation, and the operation that does not opt in cannot be made lazy by the
pipeline — there is no override that turns a plain operation into a deferring one,
because there is nothing for it to defer. Second, the pipeline *can* turn a lazy
operation eager, and that direction is safe: an eager run of a deferrable operation
is simply the standard path. Third, the "reads current values" property is consulted
here and nowhere else; an operation that reads values does not itself flush, it
declares, and the predicate flushes for it, so the flush happens *before* the
operation is entered and the operation's body can assume current data throughout.

## What the predicate must not do

It must not inspect the pending list's contents to decide. Whether the pending list
is empty is not a property of the operation, and a predicate that skips the check on
an empty list is fine — but a predicate that looks at what the entries *are* and
decides some of them can be left pending has moved fusion policy into the flush
decision. Compatibility between entries is decided at flush time by the accumulator
([compatibility-break-resample](./compatibility-break-resample.md)); the flush
decision decides only whether a flush happens.

It must not read an undeclared property as a declaration. The "reads current values"
property has three states an implementation can present — true, false, and never
implemented — and a predicate that negates the third into "does not read values" has
laundered an unknown into the permissive answer. The base class every deferring
operation inherits sets the property to false explicitly; an interface that only
documents it, and a predicate that treats a missing answer as false, together make
the one operation that forgot the property the one that runs lazily on stale input.

Because the mistake the predicate prevents is silent, the predicate is also the
natural place to make the decision visible: log, at a level an operator can enable,
which branch was taken for which operation — applied or accumulated — so that a
suspect output can be traced to the flush sequence that produced it without
re-running the chain under a debugger.

It must not be bypassed by a fast path. A pipeline that offers a direct "apply this
one operation" entry point which skips the predicate has a correctness story that
holds only for callers who use the slow path, and the fast path is what the
convenience wrapper written next month will use. Every call that runs an operation
against a datum that might carry pending entries goes through the door.

## The silent-mistake property, stated plainly

The reason this technique carries the weight it does is that the mistake it prevents
is silent. Most execution-order errors produce an exception, a shape mismatch, a
type error; this one produces a plausible array. A pipeline that gets the predicate
wrong in one branch ships models trained on misaligned inputs and discovers it, if
ever, in the evaluation numbers. Concentrating the decision in one function means
there is exactly one place to be wrong, one place to test, and one place for the
oracle to exercise with every operation class in the system.

## When not to use it

If no operation in the pipeline can defer, there is no pending list and no predicate;
do not install the door speculatively. The technique pays from the first deferrable
operation onward, and its cost — one function and one property on each operation —
is paid then.
