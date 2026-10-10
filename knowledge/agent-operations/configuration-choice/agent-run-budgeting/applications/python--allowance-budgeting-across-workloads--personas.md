---
layer: application
type: application
subject: agent-run-budgeting
technique: allowance-budgeting-across-workloads
stack: python
status: forged
verified_on: 2026-10-10
refresh_by: 2027-01-10
verified_against: python@3.12
applied: code
ab_verdict: better
proof: ab-paired
---

# Python: a seat split nobody recorded, and the consumer the budget did not name

The realization is the memory benchmark in the desktop agent app (personas,
`evals/memory-year/`), a dependency-light Python harness. It replays one fabricated year
against any memory design and grades the design's answers. Every model call it makes goes
through one wrapper around the operator's subscription CLI, so all of its workloads draw on
one windowed seat: the unaided screen, the consumer answering probes, the judge, and the
design's own write path. The operator's interactive session uses the same seat. The tree
pins no interpreter version. The witness for `verified_against` is the interpreter both
arms ran on, 3.12.1. The arms were read at personas commit `4edef99760` (the change, pushed
2026-10-10) and its parent `7ab13ef686` (arm A).

## What the harness already did right

Judging is inline. Each worker answers a probe and grades it in the same call, so a run
that stops on a refused seat leaves no answered-but-unscored inventory. Every kept answer
carries its verdict. The default judge is pinned by name and effort, which is the condition
the technique sets for inline judging over a long queue:

- `evals/memory-year/memory_year/run.py:192` "def answer_one(item):"
- `evals/memory-year/memory_year/run.py:201` "v, note = judge_value(p, text, jllm)"
- `evals/memory-year/memory_year/llm.py:40` "DEFAULT_JUDGE = "

Judging is deterministic first. A model judge runs only when a reply is long or names the
gold beside a superseded value, or when a form rule cannot be checked by pattern:

- `evals/memory-year/memory_year/judge.py:114` "def needs_extraction(probe: Probe, answer: str) -> bool:"

## The seam

The run header recorded the consumer client's totals and the design's write cost. Three
things were wrong with that as a plan of the seat:

- The screen shares the consumer's client, so its draw was folded into "consumer".
- A cache hit added its stored tokens back to the totals. The header read as what the run
  would cost from cold, not what it drew.
- The judge had its own client and counters, and nothing wrote them down. Concurrency was
  not recorded either.

The old totals line is still there for compatibility:

- `evals/memory-year/memory_year/run.py:217` "llm.cache_hits,"
- `evals/memory-year/memory_year/llm.py:155` "self.cache_hits += 1; self.calls += 1"

Arm B counts what the CLI served, apart from replays. It splits the screen off at the point
it finishes, and it writes one record per workload plus the concurrency the run drew at.
The report prints the split as one line. A re-judge records its own draw, because a
deferred scoring pass draws on the seat too.

- `evals/memory-year/memory_year/llm.py:198` "self.drawn_calls += 1"
- `evals/memory-year/memory_year/run.py:143` "screen_draw = drawn(llm)"
- `evals/memory-year/memory_year/run.py:221` "drawn(llm, screen_draw)"
- `evals/memory-year/memory_year/run.py:389` "= drawn(jllm)   # a deferred scoring pass draws on the seat too"

## Proof

**Target:** served tokens attributed to exactly one named workload. **Floor:** verdicts
unchanged.

A new model-free check generates a small world and replaces the CLI with a fake that
answers each model with a known usage. The seat's served tokens are then known exactly.
Both arms ran on the same world under a fixed hash seed:

| | seat served | header attributes | difference |
| --- | --- | --- | --- |
| A | 10,152 | 17,280, all as "consumer" | +7,128 replays counted as draw; 312 judge tokens attributed to nothing |
| B | 10,152 | screening 7,440 + answering 2,400 + judging 312 + writing 0 | 0 |

The floor held. The verdict hash was identical across arms, and the reports re-rendered for
all 16 stored runs of the published scenario were byte-identical (49,055 bytes in both
arms). The refusal-classification check still passes.

The seam was chosen to test the claim most likely to fail here: that scoring is the budget
to reserve. The judge was replayed offline over those 16 stored runs through a stub that
counts what it would send, with no model call:

- The judge made 2 to 144 calls per run of 194 probes, at most 0.4% of a run's recorded
  tokens.
- The design's own write path drew between 0 and 26 million recorded tokens per run. On the
  designs that write, that was 58-87% of the run's recorded draw.

The shares are of recorded totals, which include cache replays, so they size the cold cost
of each workload rather than one night's draw.

## What the tree's shape says

The technique's four-way budget names producing, scoring, operating and slack. In a
benchmark of systems, producing is two workloads with different owners. The agent answering
is held still across arms. The system under test does its own model work at write time, and
that cost is the arm, so it differs by arm by two orders of magnitude. A window that closes
mid-ladder closes on the expensive arm and leaves the cheap arms complete, and that biases
the ladder. With a deterministic-first judge, reserving the scoring budget costs almost
nothing. The reservation that matters is the one that lets the most expensive arm finish.

Building the check exposed a second defect. Its verdict hash moved between two runs of the
same arm. The world generator iterated a set of strings in hash order, and each probe draws
from the shared random generator, so the probe set changed with the process's hash seed.
Four processes gave four probe sets for one seed, and none matched the saved published
scenario. The published probe set can be read from its saved file but never regenerated.
The fix sorts the keys (`450dc69fac`), and its proof is recorded against the benchmark
subject.

- `evals/memory-year/memory_year/world.py:399` "for key in sorted(keys):"

## What this realization cannot do

- It records the split and does not enforce it. No workload reserves or caps anything yet,
  and the CLI exposes no remaining-allowance reading to plan against.
- The writing workload is whatever the design reports, and some designs add their own
  cache replays back. An external design reports through its own process, which the
  harness cannot audit.
- The operator's interactive session is a fifth draw on the same seat, and the harness
  cannot see it at all.
