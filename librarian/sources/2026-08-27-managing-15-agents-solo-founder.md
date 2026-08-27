---
source: youtube
url: https://www.youtube.com/watch?v=zPfxlcVpFgs
title: "How I manage 15 AI agents 24/7 as a solo founder | Ryan Carson"
author: How I AI
kind: first-party practitioner dialogue (two accounts, compared - new sub-class)
mined_on: 2026-08-27
words: 8347
skill_version: 0.13.0
extracted: 12
picked: 1
accepted: 1
currency: 0
leads: 0
already_covered: 0
declined: 0
untriaged: 11
dispatched: 0
fetches_spent: 0
---

# Managing 15 agents as a solo founder, 2026-08-27 - the constraint the corpus named and never modelled

Two solo founders comparing their own agent-management systems on camera. The
operator picked exactly one row and it was the doctrine-altitude one, so this
note is short on breadth and long on one finding.

## The class, on first observation: the practitioner **dialogue**

The ledger carries the first-party practitioner account already. This source is
two of them in conversation, and the pairing is not merely "more of the same
class" - it changes where the yield sits.

A single first-party account is authoritative about what one person did and
weak about universality; the standing corrective is to land its claims as
decision rules with conditions attached. A dialogue supplies some of those
conditions for free, because **where two practitioners with the same job chose
opposite defaults, the boundary is already drawn.** They disagreed on where the
agent conversation should live (in the agent's own threads, for context
locality; in public chat, because that is what made background agents legible to
a company adopting them), and neither is wrong - the discriminator is the goal,
and it was visible without a single fetch.

This is the same property the research-model release has when a lab ships two
sibling instruction documents that contradict each other. **Diff the
practitioners, not just the transcript.** Where they converge instead of
disagreeing, that is the other signal: both independently and unprompted said
they deliberately *reduce* how much they ship, which is what carried the run.

Yield behaved as the class predicts: **0 of 3 fetches**, corroborated corpus-
internally and by training-data convergence. Length was again not the story -
8,347 words produced one finding because the operator picked one, not because
the source was thin.

## Accepted (1)

### Human verification capacity is the pipeline's second constraint

`software-engineering/engineering-process/continuous-integration/machine-paced-delivery`

- New technique `human-gate-capacity`.
- Golden path amended: the "two consequences follow" enumeration now names a
  third, a new section sits after `proposal-not-push`, and the `hitl-approval`
  boundary line now states which half each subject owns.

Anchor: *"I really don't ship more than I think the market wants... I don't get
multiples of quality off multiples of output"* [19:09], against 40 PRs/day from
one person [17:54].

**My triage read was too strong, and verification corrected it downward - which
is what made the finding worth writing.** I went in expecting "the corpus models
machine throughput and has missed that the human is the constraint."
`proposal-not-push` says it outright, in its own words: *at machine pace the
reviewer is the bottleneck.* The corpus knew.

What it does with that knowledge is the gap, and it is an **asymmetry, not an
omission**:

| | machine bottleneck | human bottleneck |
|---|---|---|
| named | yes | yes, in one line |
| measured | four measures, distributions, windows, denominators | not at all |
| demand-side levers | a whole section, four levers | none |
| remedy of last resort | buy capacity | *unavailable* |

Everything `proposal-not-push` does about the reviewer is per-item - one
concern, small enough to read, provenance marked, consistent shape. Those make
each verdict cheaper. **Nothing said how many verdicts there are.** So the
subject sizes its first server against machine-paced arrival and routes the
entire output into a second server whose rate was never written down.

The reusable form of this: **when a corpus states a constraint in prose in one
technique and models it thoroughly in another, the finding is the asymmetry
between them.** It is invisible from a slug map and from a summary; only Phase 6
step 1 - open the actual file - reaches it. Had I written the correction I
triaged, it would have been a phantom fix against a claim the corpus already
makes.

Two things the source supplied that the corpus could not have derived alone:

- **The overload signatures are opposite.** A machine queue past capacity
  stalls; a human gate past capacity *accelerates* - the changes get approved
  anyway, faster and less read. Rising throughput against an empty backlog is
  the failure, not the win. That let the technique separate a **stall** (dwell
  high, backlog old) from a **rubber stamp** (dwell low, backlog empty,
  post-merge repair rising), which share a queue and have opposite remedies.
- **The independence limit at the subject's own floor.** The golden path already
  claims this subject starts at one person. At one person the reviewer is also
  the dispatcher, so the gate reviews work it commissioned - a check, not an
  independent review. The source reached this from the other direction: a
  compliance control requiring *alternative* review was the reason one
  practitioner routed above-threshold changes to a second human at all [27:49].

Enumeration hunt paid again, and this is now four runs running: the golden path
opened with *"Two consequences follow, and the second one is the one that gets
missed."* An enumeration is a claim and it invites exactly one question. The
third consequence was the finding.

Corroborated by training-data convergence (a two-stage pipeline whose second
stage is human is bottleneck analysis with a well-known result - capacity added
anywhere but the constraint raises work-in-progress and not throughput; review
depth degrading with batch size is a long-standing measured result in the code
review literature) plus corpus-internal reasoning: the subject *already* applies
"reduce demand before buying capacity" to runners. The technique applies the
subject's own move to the server it forgot to model. No fetch needed.

Boundary stated in both directions: `hitl-approval`/`review-queues` owns whether
a *single* decision can be made well; `machine-paced-delivery` owns the *rate* at
which decisions are demanded. A perfect queue with an unsurvivable arrival rate
still launders blind approvals - which `review-queues` names as a hazard without
owning the cause.

## Untriaged (11)

**Nobody verified these.** The operator picked row 3 and only row 3; these
carry no judgment at all and are not declines. Recorded with anchors so a later
run does not re-derive them, and because cross-run convergence only exists if
past runs wrote down what they saw.

| # | Candidate | Claim in the source's terms | Home guess | Anchor |
|---|---|---|---|---|
| 1 | Risk-score a change to decide if a human is needed | PR scored on ~5 risk aspects (blast radius, security); low auto-approved and merged; medium/high routed to a named human because a compliance control requires alternative review | `llm-agent/orchestration/hitl-approval` | [26:57] |
| 2 | Bound the review loop; approve an artifact cheaper than the diff | Fresh review triggered on the PR, **at most two loops**, then a recorded narrated walkthrough with a red/green test list; the human approves the video, then it merges | `hitl-approval` | [28:14] |
| 4 | The concurrency ceiling is supervisory, not machine | 10-15 live threads bucketed into priority folders because a human tracks ~4-5 concurrent things; the human tracks buckets, not threads | `fleet-orchestration/parallel-dispatch` | [10:13] |
| 5 | A fleet sweep must reconcile against in-flight fixes | Per-customer sweep gathers activity + errors since the last sweep, ranks the top three, then checks each against open/merged PRs before reporting | `fleet-orchestration` | [16:37] |
| 6 | Unattended capacity buys defect work, never selection | "I run less overnight - bugs and triage"; "no frontier model has the intelligence to know what to ship"; automatic improvement loops "don't work with product" | `machine-paced-delivery` | [19:36] |
| 7 | Route local vs cloud by intervention need, not task size | Local wins for large front-end grinds needing a local browser and frequent steering, and for verification; cloud for everything else | `llm-agent/runtime-and-io/agent-cli-transport` | [24:20] |
| 8 | The recording *is* the authorship verification | Hiring on a full-screen recording of the candidate building a feature unsupervised, with no interview first; the same artifact becomes the ongoing management signal | `recruiting/assessment/llm-era-work-sample-design` | [40:15] |
| 9 | Agent-thread vs public-chat: the discriminator | One moves all multi-user interaction into the agent's threads for context locality; the other kept agents in public chat because that is what made them legible during company adoption | `fleet-orchestration` | [31:12] |
| 10 | A codebase-grounded agent is a general ops agent | The same background agent runs deal desk, quoting, ops docs and customer triage - "what would you do with somebody who both knew your codebase and could write code to solve anything in your business" | `llm-agent` | [23:00] |
| 11 | Split design-system work: tokens vs implementation | One tool decomposes an example or design file into reusable tokens; a coding agent then builds the technical design system and shared components; tokens pushed back into the design tool | `ui-surfaces` | [36:22] |
| 12 | Currency: solo-founder agent economics | One solo founder at $5k then $20k/month on a single cloud agent vendor; ~40 PRs/day; coding platforms generalizing into business agents | - | [09:48] |

Row 1 and row 2 are the mechanisms that would instantiate `human-gate-capacity`'s
third lever ("narrow what needs a verdict") and its second ("make each verdict
cheaper"). The technique names the levers generically and deliberately does
**not** assert either mechanism, because neither was verified. If a later run
picks them, they attach to that technique rather than competing with it - and
row 6 is the one that would raise it from technique to doctrine, because it says
what the freed capacity is *for*.

## Leads

None banked. Nothing here is real-but-unproven with a return condition; the
eleven above are unexamined, which is a different state and belongs in its own
table.
