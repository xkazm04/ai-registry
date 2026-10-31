---
layer: application
type: application
subject: eval-harness
technique: candidate-write-access
stack: node
verified_on: 2026-10-31
verified_against: node@22
applied: experiment
ab_verdict: better
proof: ab-paired
---

# A contract suite whose graded artifact is a file the candidate writes

## The seam

A desktop agent-orchestration app keeps a deterministic eval lane
(`evals/agents/agent-specs.eval.test.ts`, run by the pre-push hook and by
CI) whose subject is the agent library itself: every `.claude/agents/*.md`
spec must declare frontmatter, an output-contract section, a discipline
section, and a word budget. Its own header states the claim plainly — *"an
underspecified agent = unreliable output; this catches drift in
milliseconds."*

The agents whose specs are graded are the agents that edit this repository.
So the graded artifact and the writable artifact are the same file, which is
the first surface the technique enumerates.

## The paired comparison

**Measurable:** the number of the suite's quality assertions that gate a
property the candidate cannot satisfy by editing the graded file.

Both arms were run against the six shipped assertions, transcribed verbatim
into a harness that touches no product code.

- **Arm A** — the real `athena-persona-auditor` spec, 2,414 bytes.
- **Arm B** — a vacuous spec, 110 bytes, containing every literal string the
  regexes hunt for (`name:`, `description:`, `tools:`, `## What to return`,
  `## Discipline`, `Cap your reply at 400 words.`) and no other content.

| Arm | Bytes | Assertions passed | Suite verdict |
| --- | --- | --- | --- |
| A — real spec | 2,414 | 6/6 | PASS |
| B — vacuous spec | 110 | 6/6 | PASS |

**Quality assertions surviving write access: 0 of 6.** A spec 95.4% smaller
than the real one, declaring nothing and disciplining nothing, scores
identically.

## What the tree says about the standard

Every one of the six assertions is a regex over a file the candidate writes,
and each is satisfied by inserting a literal string that changes no
behaviour. The word-budget check is the clearest: it matches the *sentence*
"Cap your reply at 400 words", not any property of what the agent emits. The
gate sees the target's spelling
([_laws: gate-sees-target_](../../../../_laws.md#gate-sees-target)).

This is not a defect anyone introduced. The suite is well-built for the job
it names in its own README — catching *drift* in specs written in good
faith, in milliseconds, with no model and no fixtures — and at that job it
works. What the write-access enumeration adds is the boundary: the suite is
a **drift detector, not a quality gate**, and the two are distinguishable
only once you ask what the candidate may write. The header sentence claims
the second.

The structural confirmation is that the project already built this control
elsewhere and did not generalize it. Its memory-reflection eval
(`scripts/memory/reflect-eval.mjs`) carries an explicit `no-live-mutation`
check asserting the memory set is byte-identical before and after a
proposal run — the *neighbour* surface, guarded by hand, correctly, because
that one was obvious. The instrument surface in the sibling lane went
unguarded because a regex over a markdown file does not look like a thing
the candidate can write. Both surfaces are the same rule; only one of them
announces itself.

## What this realization cannot do

The vacuous-spec arm is a demonstration of reachability, not a claim that
any agent has done this. Nothing in the repository's history suggests a spec
was ever gamed, and the specs on disk are substantive. The measurement says
the gate would not notice, not that anything slipped past it.

The harness also transcribes the six assertions rather than importing them,
because the shipped file is a Vitest module that scans a directory at import
time. A future assertion added to the suite is not automatically covered by
this comparison; re-running it means re-transcribing.

## The proposed change

Not committed — the project tree was read, not edited. The cheap correction
is to keep the six string checks as the drift detector they are, rename the
lane's claim accordingly, and add one assertion the candidate cannot satisfy
by editing the graded file: a *behavioural* budget check that measures a
recorded output against the declared cap, rather than matching the sentence
that declares it. That converts one of the six from spelling to target and
gives the lane a property worth the name.

Re-checked 2026-10-31 against the project tree at `61029d7ae0`: the suite is unchanged since
it was added on 2026-06-11. The header claim, the four per-spec `it` blocks
and the budget regex `cap[\s\S]{0,40}?\d{2,4}\s*words` read as described.
The pre-push `evals` job and the `no-live-mutation` check in
`reflect-eval.mjs` are both present. The real spec is 2,414 characters
(2,424 bytes) at that commit and at the measurement date, so Arm A stands.
The file also holds a golden-contract block outside the per-spec loop. It
requires four section names in this one spec, and it was not among the six
transcribed. It is a `toContain` over the same graded file, so including it
would add a seventh spelling check, not a target check, and the verdict
stands. `verified_against` now reads the tree's `.nvmrc` (22). The earlier
24 was not readable in the tree.
