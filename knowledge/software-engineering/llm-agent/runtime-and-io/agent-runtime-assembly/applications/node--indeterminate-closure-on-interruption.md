---
layer: application
type: application
subject: agent-runtime-assembly
technique: indeterminate-closure-on-interruption
stack: node
verified_on: 2026-09-04
verified_against: node@22.19.0
applied: simulation
ab_verdict: better
---

# A harness that carries the partial into the unknown result

An open-source agent toolkit whose durable harness is specified normatively
in a 27,820-word document beside the code. The version witness is the
repository's own declaration, not a guess: the root manifest pins
`engines.node` to `>=22.19.0` and every continuous-integration lane runs
node 22, so `node@22.19.0` is the floor the tree actually builds against.
The harness package was read at its published version 0.84.4.

This tree is where the technique's re-issue exemption was found to be too
wide. It is recorded as an application rather than a correction of the tree,
because the tree is right and the registry's clause was the thing that moved.

## What the tree does at the seam

Recovery is driven from one durable value per operation, and the branch
that matters is the one for an interrupted model generation. The harness
does not re-issue it. It reads the frames it committed while the response
was streaming, reduces them into the partial the user had already seen, and
commits that partial **as a synthetic error response under the identifiers
the request reserved before it was sent** — then lets ordinary retry
classification decide whether a fresh attempt follows, under fresh
identifiers and counted as a later numbered attempt.

The synthetic response carries an explicit warning with three clauses: the
request was interrupted, the content above is the latest committed partial
and newer live output may be missing, and the outcome at the provider is
unknown. Any tool calls inside that partial never execute, and the
response-transformation hook never runs, because there is no trustworthy
complete result to transform.

Two guards stop the stored partial from becoming a claim of completion. The
frames are declared observation and are stated never to establish provider
completion or to suppress unknown-outcome recovery — a stream that ended
without its terminating event and a stream killed mid-flight leave the same
bytes. And every settlement, whether real, recovered or cancelled, deletes
its frame list in the same transaction that writes the result, so no reader
can ever see a settled response and a live-looking partial for it at once.

- `packages/agent/docs/harness.md` §4.5, the orphaned-restart-point table,
  row "assistant generation effect_pending"
- `packages/agent/docs/harness.md` §9.1, invariants 31 and 32
- `packages/agent/docs/tool-durability.md`, "Problem" and "Goals"

## The A/B, and why the mode is simulation

No arm was runnable here: this is a read of somebody else's tree, and the
effect is a recovery path that only a killed process reaches. Three real
cases were walked from the tree's own documents instead.

**A — the technique as it stood.** A model request is side-effect-free, so
re-issue it and close the old call as interrupted.

**B — the tree's rule.** Close the old call carrying its committed partial;
retry afterwards under the ordinary policy.

1. *Streaming answer, killed at 80% of the response.* A discards content the
   user watched arrive and produces a second, divergent answer to a question
   that appears once in the record. B keeps the prefix, marks it unknown,
   and retries beside it. B is better, and the difference is visible to the
   user, not just to the record.
2. *Request killed after the provider accepted it, before any frame.* A and
   B write the same thing. Neither is better; both are honest.
3. *Long generation killed twice in a restart loop.* A re-issues twice and
   bills twice while recording zero cost for the interrupted attempts. B
   records each attempt's reserved usage row and hands the escalation cap
   the restart count it needs. B is better, and it is better for the reason
   the technique's own later section already argues about restart counters.

**Verdict: better**, on two of three cases and neutral on the third.

**What would falsify it.** A runtime that commits no partial while streaming
has nothing to carry, and case 1 collapses into case 2 — there B is not
better, only equal, and the amendment's third bullet correctly does not
apply. A runtime whose provider does not bill interrupted requests would
also void case 3; none of the tree's supported providers is claimed to work
that way, and the registry's own spend subject says the opposite.

## What this realization cannot do

The tree proves the *record* is exact. It does not and cannot prove the
spend reconciliation, because it commits a usage row at request time and
never re-reads the provider's own accounting to confirm the interrupted
request was billed as reserved. The reserved row is an estimate that
survives the crash, which is strictly better than a zero — but an
application that wanted to verify the amendment's cost clause end to end
would need a provider invoice beside the ledger, and no tree in reach has
one.
