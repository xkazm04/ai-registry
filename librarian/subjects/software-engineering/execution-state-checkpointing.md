---
subject: execution-state-checkpointing
domain: software-engineering
last_touched: 2026-09-04
dry_streak: 0
---

# execution-state-checkpointing

## 2026-09-04 - forged by intake `exo` v2.5.0 ([[2026-09-04-exo]], run intake-exo)

**Born from a routing count that fired on one system, not the repository.** The
design read of a self-modifying agent harness produced 33 entries over four
systems; three of them had one or two decisions the corpus did not model and
stayed in intake as amendments. The sandbox/checkpoint system had **four**, which
is the mechanical trigger, so that system alone was handed off. Placement was
verified against `taxonomy.json` before the dispatch, not after: `llm-agent/
runtime-and-io` is at 10 of 10 and would have been rejected by the gate, while
`backend-platform/work-execution` had room at 7.

**The centre is validity, and that is what the neighbours do not own.**
`versioning-snapshots` owns declaring a capture's *scope*; `atomic-file-publish`
owns the publication step; `liveness-proof-reclaim` owns reclaiming a dead
holder's resource; `checkpoint-restore` owns a human's document undo. None models
the question this subject exists for: **captured runtime state is only meaningful
under the runtime that captured it, so a restore must refuse rather than
degrade.** A backup is restored into a world that has moved on; a checkpoint is
resumed into a world that must be bit-compatible, and the two have opposite
failure postures.

**Four techniques**, forged by one worker against the spec and the neighbours:
`runtime-bound-checkpoint`, `restore-semantics-belong-to-the-format`,
`resume-mints-a-duplicate`, `the-record-outlives-the-rewind`. Two source-tree
applications (rust, process). Gate clean; purity grep over the source's own
vocabulary returns nothing.

**The worker overrode the spec three times and was right each time**, which is
what the brief asked for:

- It **rejected** `declared-consumable-formats` as a standalone technique and
  folded it into `restore-semantics-belong-to-the-format`, arguing that the
  identifier-is-the-contract stance and the declare-and-validate-before-dispatch
  procedure are two halves of one mechanism - the first has no procedure, the
  second no justification.
- It **dropped** `cost-invariant-refusal` entirely, on the test that a technique
  belongs to a subject only if its decision rule needs that subject's context.
  That rule ("when a cheap primitive is load-bearing rather than optimising, its
  absence is a hard failure at first use") is fully actionable with no
  checkpointing context, so it belongs in `resilience`, beside the argument it
  inverts. **Owed:** a separate dispatch against
  `resilience/optional-dependency-degradation`, where it inverts the fallback
  ladder and `fallback-retirement-condition`.
- It **added** `resume-mints-a-duplicate`, which the spec did not propose: a
  document restored twice is two documents, but a machine resumed twice is two
  machines that both believe they are the original, sharing PRNG pools, session
  tokens and boot identity until something reseeds them. This is the force that
  most sharply separates execution-state checkpointing from every neighbouring
  snapshot concept, it converges strongly outside the source, and
  `identity-survives-reuse` is the law the capture inverts. The director verified
  the citation behind it before accepting.

Net four techniques against the spec's proposed five, with two removed and one
added - which is the shape a good forge report has.

**Apply: all four unapplied, with return conditions.** No fleet project captures
and resumes a live execution environment, and none has a second reset axis, so
`the-record-outlives-the-rewind`'s state matrix collapses to a single column and
its force does not exist yet. The nearest plausible arm is the appliance lane for
`resume-mints-a-duplicate`: a shipped image that boots on two customer sites
shares whatever identity was baked into it.

**Evidence base is n=1** and the golden path says so rather than implying a
survey. The subject should be re-read against a second system before its
techniques are treated as settled - a container orchestrator's checkpoint support
or a VM migration path would be the natural counterparts.
