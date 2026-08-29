---
source: youtube:USEk7F9GIZk
kind: second-hand survey (single-voice explainer of one paper, no build, no measurement)
url: https://www.youtube.com/watch?v=USEk7F9GIZk
title: "2 Loop Process for RSI: LLM and Harness"
author: Discover AI (channel)
words: 4198
extracted: 10
accepted: 0
declined: 0
leads: 2
already_covered: 6
untriaged: 1
dispatched: 1
fetches_spent: 0
---

# A paper explainer on LLM/harness co-evolution

Part of [[index]].

## The class, and the expected yield

A single voice restating a paper it names only as "the helix paper" from the
previous video, on a whiteboard, with no system built and nothing measured. The
class is reliable for *that the idea exists*; its framing is the only first-hand
content. Expected yield stated before triage: zero techniques, one amendment at
most via training-data convergence, leads for the paper itself. That is what
arrived. The video's error rate is unknowable from the video, so nothing was
authorized by it: the one finding was corroborated by two corpus-internal
siblings that already carry the same root, plus training data.

## Triage table (run unattended; #1 picked on impact, the rest routed by read)

| # | Lane | Shape | Eff | Title | Prior art | Impact | Read | Anchor |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | K | amendment | S | Harness workarounds lapse with the model they were built for | eval-harness/failure-attribution | corrects-claim (missing stage) | real gap | [00:21:22]-[00:22:37] "if you change the LLM, get rid of your harness" |
| 2 | K | technique | M | Verifier emits structured outcome labels, not a binary reward | eval-harness/failure-attribution (six owners) | none | likely catch | [00:10:38] |
| 3 | K | technique | M | Twin-strand harness ablation: change 1-3 slots, hold the rest | eval-harness/comparison-modes (matrix, cell identity) | none | likely catch | [00:07:17] |
| 4 | K | technique | S | Repeat K attempts before judging a stochastic system | eval-harness golden path ("pass/fail becomes a distribution") | none | likely catch | [00:09:48] |
| 5 | K | technique | S | Stop only on a passing test, never on the model saying done | agent-chaining/stop-reason-ledgers; machine-paced-delivery | none | likely catch | [00:05:32] |
| 6 | K | technique | S | Repair slightly malformed tool calls instead of rejecting | mcp-tools/tool-schema-design | none | likely catch | [00:05:05] |
| 7 | K | technique | M | Record the whole trajectory (messages, actions, results, file deltas) as evidence | fleet-orchestration/worker-trajectory-anatomy; tracing | none | likely catch | [00:04:38] |
| 8 | K | lead | - | Harness search is combinatorial construction, not gradient learning | - | new-law? | thin | [00:19:38] |
| 9 | K | lead | - | Fixed slot count ("96 runtime sockets") as a harness module contract | - | none | thin | [00:06:23] |
| 10 | K | currency | - | "Unnecessary tool calls" as an outcome dimension beside pass/fail | cost-metering | none | untriaged | [00:13:38] |

## Dispatched - verified, drafted, held (not written into the corpus)

### 1 - Harness workarounds lapse with the model they were built for

**Why held:** a parallel session had uncommitted edits in
`eval-harness/techniques/failure-attribution.md` (a new section, "The change is
an experiment, and it is designed before it is run"), an untracked technique
`discriminating-task-selection`, and a regenerated `index.json`, all live during
this run. Editing that file would either clobber or sweep their work into this
commit. The amendment is drafted in full in the appendix.

**Return condition:** when that session's `failure-attribution` change is in
`HEAD`, insert the appendix section before "A class with no owner is a product
decision" and add the `use_when` entry *a model upgrade landed and the harness
still carries the previous model's workarounds*. The parallel section's "the
model stays pinned while the harness moves" is the inverse case (harness under
investigation); this one is model moved, so the harness is re-ablated - they
compose and neither subsumes the other.

The strip test survives cleanly: no product remains, and the rule is "a
compensation built for one model version carries that version as its
retirement condition; on upgrade, re-ablate the compensation set as a matrix
cell rather than carry the previous winner forward, because a compensation can
become the failure".

Why it is real, and why an amendment rather than a technique: the subject
already states the **suite** side of this exactly (`unaided-baseline-screening`,
"the screen expires with the candidate") and never the harness side - the
asymmetry hunt again. And `hitl-approval/human-performed-steps` already carries
the general shape ("a compensating capability names what would retire it"), so
the corpus had both halves of the rule two subjects apart and nothing said them
where a red case gets its fix assigned. Written in the funnel's own terms so it
stays inside the file's voice.

Corroboration: zero fetches. Training-data convergence (vendor migration guides
routinely instruct removing forceful prompting written for earlier models;
over-prompted scaffolds measurably degrade on stronger models) plus two
corpus-internal siblings. The source was the occasion, not the authority.

## Already covered

- **2** - the six-owner funnel in `failure-attribution` is a richer outcome
  vocabulary than the source's list (resolved / target miss / regression /
  noisy patch / evaluator gap), and it already places *evaluator gap* upstream
  of the system (label, dataset).
- **3** - `comparison-modes` matrix mode: cell identity minted from every
  parameter, declared aggregation, N trials per cell. The source's "record the
  temperature, the environment, everything" is the cell-identity rule. The
  parallel session's pending section adds "one component per round".
- **4** - the golden path's "pass/fail becomes a distribution".
- **5** - `agent-chaining/stop-reason-ledgers` types the stop;
  `machine-paced-delivery` gates on verification, not on the worker's self-report.
- **6** - `mcp-tools/tool-schema-design` and `untrusted-result-handling`.
- **7** - `worker-trajectory-anatomy` (with measured shares) and the `tracing` subject.

## Leads

- **8 - Harness improvement is combinatorial, the model's is gradient-based; the
  two are different learners and must not share an update rule.** Plausibly
  law-shaped (provider-portable, clock-proof). **Second sighting already in the
  tree**: the parallel session's uncommitted `failure-attribution` section ends
  "the search over harness configurations is a search, not a gradient", from a
  different source. Two independent sources, one run apart. Return condition: a
  third, or a connected project that carries a harness module registry and a
  model version and has to decide what to re-run on upgrade. Do not write the
  law from a video.
- **9 - A fixed, standardised slot count for harness modules** (the paper's
  "96 runtime sockets"). Return condition: the paper itself, read - the video
  never names it beyond "the helix paper", and the count is meaningless
  without the paper's protocol.

## Untriaged

- **10** - unnecessary tool calls as an outcome dimension beside pass/fail
  ([00:13:38], "harness D solved it but used 40 unnecessary tool calls").
  Nobody verified this; `cost-metering` probably owns it. Recorded so it is not
  re-derived.

## Declines

None.

## Method notes

- First run of this class where the yield came from a hunt the class entry does
  not mention: a survey cannot carry a boundary of its own, but it can point at
  a symmetry the corpus states on one side only. Read the source's strongest
  sentence, then ask which of the corpus's completeness claims it mirrors.
- 0 of 3 fetches, ninth consecutive.

## Run conditions

A parallel session had uncommitted edits in `agent-memory`, `eval-harness`
(golden path, `eval-economics`, `failure-attribution`, a new technique) and
`index.json`/`catalog.json` throughout. All left untouched; this run committed
only its four librarian/skill files and did NOT regenerate index or catalog.

## Appendix - the drafted amendment, verbatim, for the return

## A fix at the pipeline or prompt layer names the model it was built for

Four of the six owners resolve to a change in the system, and three of those
changes — a stricter reminder, a retry that re-issues a malformed tool call, a
parser that repairs the model's near-miss output — are not corrections of a
defect in the harness. They are **compensations for a defect in the model**:
the harness grew a capability because the model that was measured lacked one.
A compensation is created state whose reason is a fact about one model
version, and the reason lapses when the version does.

This subject already says so about the other side of the instrument: a
scenario's discriminating power is a property of the scenario-*and*-candidate
pair, and a model upgrade can dissolve it without anyone touching the suite
([unaided-baseline-screening](./unaided-baseline-screening.md)). The harness
side is symmetric and had never been written down. After an upgrade, a
compensation is in one of three states, and only a run can tell which: it
still pays; it is dead weight (the model no longer produces the failure it
catches); or it is **now the failure** — an aggressive retry that resubmits
work the model completed, a repair that rewrites a tool call the model got
right, a reminder so insistent that a model which understood the goal now
argues with it. The third state is the one that hides, because attribution
funnels it to *pipeline* or *prompt* and the obvious response is to tune the
compensation rather than to ask whether it should exist.

Two disciplines, both cheap:

- **Write the model it was built against into the compensation**, at
  creation, in the shape the corpus already uses for any compensating
  capability: *this exists because model X did Y; when a model no longer
  does Y, delete it.* A retry ladder or a prompt template without that line
  is indistinguishable from a design decision six months later, which is how
  a workaround for a retired model becomes load-bearing.
- **Re-ablate on upgrade; do not carry forward.** The harness that ships with
  a new model is the *matrix* question from
  [comparison-modes](./comparison-modes.md) — model × compensation-set ×
  scenario, N trials per cell — not the previous winner with the model swapped
  in. Ablate the compensations as a set, not one at a time: the model's own
  change interacts with all of them, and a compensation that looks harmless
  alone can be the one whose removal lets the model's new capability show. A
  compensation the ablation cannot justify against the new model is deleted,
  not tuned, and the class it used to shrink is re-attributed from scratch,
  because its owner may have moved from *pipeline* to *nothing*.

The failure mode this guards against is symmetric with the suite's: a suite
that got easier reads as improvement, and a harness that got heavier reads as
robustness. Both are the instrument absorbing a change in the candidate and
reporting it as a change in the system.
