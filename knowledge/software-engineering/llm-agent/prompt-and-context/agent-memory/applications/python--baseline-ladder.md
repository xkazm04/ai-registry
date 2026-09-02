---
layer: application
type: application
subject: agent-memory
technique: baseline-ladder
stack: python
status: forged
verified_on: 2026-09-02
verified_against: python@3.10
---

# A benchmark tree that holds its judge and its per-arm budget in code, and a README that reports neither (OpenViking)

The realization is the `benchmark/` directory of an agent context database whose README
leads with accuracy deltas — three agent harnesses rising from the 24-57% range to
the 80-83% range on a long-conversation memory benchmark, with input-token and latency
reductions beside them (`README.md:99-105`). The tree behind those numbers is the
evidence for the amendment this run landed: **the judge and the per-arm retrieval
budget travel with the rung, or the number does not travel.**

## Judge, in two versions, both lenient by default

- The retrieval-only harness grades with a prompt that marks an answer correct "if the
  generated answer includes AT LEAST ONE correct item", accepts dates within fourteen
  days and durations within half, and uses evidence "only to ACCEPT answers"
  (`benchmark/locomo/openviking/locomo_prompts.py:137, :146`). The strict variant is an
  opt-in flag (`benchmark/locomo/openviking/judge.py:236-240`). Adversarial questions
  (category 5) are skipped (`judge.py:160`).
- The agent-integration harnesses share a second judge instructed that an answer
  "touches on the same topic as the gold answer" counts as correct — the prompt says
  "be generous" (`benchmark/locomo/openclaw/judge.py:33, :55`; reused by the other
  integrations, `benchmark/locomo/claudecode/judge.py:4`).
- The answer prompt forbids abstention: "NEVER say 'not specified'… NEVER return an
  empty answer when relevant memories exist" (`locomo_prompts.py:55`).

Which judge produced the README's rows is not stated in the tree, and no result files,
per-arm counts or seeds are committed (`benchmark/locomo/claudecode/README.md:120-122`
defers historical iterations to an ignored directory).

## Budget, unequal across arms

The treatment arm recalls under a stated cap — six items, a score floor of 0.35, a
ten-thousand-token budget (`benchmark/locomo/claudecode/config/ov-qa.conf`) — while the
control arm is each harness's own native memory under whatever it does. The token
reduction therefore compares two budgets. In one harness the "native" arm did not run
the model it is named for: it ran a different provider's model through a compatible
endpoint (`benchmark/locomo/claudecode/README.md:24-30`).

## What the tree does right, and the technique should keep

The task-completion benchmark is the opposite shape. Its evidence cells are paired
same-seed runs (`seed = 300 + repeat_index`, eight repeats, temperature 0, same agent
and user model on both arms — `benchmark/tau2/llm/config/baseline.yaml:8, :13, :42-45`;
`benchmark/tau2/llm/scripts/run_eval.py:497, :540`), timed-out cells are excluded rather
than scored, and anything that is not a paired cell is labelled "diagnostic" so a
reproduction does not mistake it for evidence (`benchmark/tau2/llm/README.md:269-272,
:291-292`). It also pins a *patched* user simulator, because the official one treated
the user's confirmation as task completion before the backend write happened
(`tau2/llm/README.md:276-283`) — the technique's "same tasks, same consumer" applied to
the simulator that generates the tasks.

## What this realization cannot do

It cannot reproduce its own headline. The ladder's rungs 2 and 3 (whole history in
context; retrieval over the raw record) exist nowhere in the tree; the comparison is
rung 4 against each harness's native memory, under different budgets and an unstated
judge. A reader importing the README's verdict is importing an uncontrolled variable
— which is the technique's closing warning, instantiated.
