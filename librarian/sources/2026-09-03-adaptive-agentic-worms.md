---
source: web:lesswrong.com/posts/fpLDjKg3ej49beqTC/adaptive-agentic-worms-are-here
kind: second-hand paper walkthrough + practitioner dialogue
url: https://www.lesswrong.com/posts/fpLDjKg3ej49beqTC/adaptive-agentic-worms-are-here
title: Adaptive Agentic Worms Are Here
author: derelict5432 (2026-08-30)
words: 4381
extracted: 12
accepted: 4
declined: 0
leads: 2
already_covered: 2
untriaged: 5
dispatched: 1
applied: 1
shipped: 1
run_id: worms
siblings: 2
---

# Adaptive agentic worms are here

A community post walking through a preprint the author did not write, with a
14-comment thread attached. Both halves were mined, and they behave like
different source classes.

## The ingest failed twice before it worked, and the exit code was the reason

`research-ingest` returned **exit 2** (HTTP 429) against the canonical URL, on
two attempts. Exit 2 is an instrument failure, not a thin source, and the
method's split between 2 and 3 is what made the next move obvious: route
around rather than report nothing. The mirror at `greaterwrong.com`, serving
the same post, returned 4,381 words clean. The container was checked before
the class was named — real prose, not decoded chrome.

Worth recording as a class fact: **a bot wall on a community aggregator is
routinely a property of one frontend, not of the document.** The mirror cost
one command.

## Class, and the expected yield said before the table

Two classes in one document, routed separately:

- **The post is a second-hand walkthrough of one paper.** For this class the
  fetch is the extraction, not corroboration — except that this author quotes
  the paper's results and its containment appendix *verbatim in block quotes*,
  with the protocol attached, which is the one thing a paper is authoritative
  for. So the relayed material was unusually load-bearing for a second-hand
  source.
- **The comment thread is a dialogue**, and it produced the run's sharpest
  scope fact. One commenter asserted three limitations (no target discovery,
  central compute provided, harness-only replication); the author quoted the
  paper's host-discovery module back; the commenter retracted in public
  ("*I was running on incorrect cached thoughts there*") and restated the one
  limitation that actually survives — the test network had every node seeded
  vulnerable, so *locate sparse targets in a predominantly hardened network*
  was out of scope. **A correction event in a thread is a discriminator drawn
  by someone who had to draw it**, and it outranked the headline numbers.

Expected yield stated before triage: 1–2 techniques, several currency signals
and leads, several catches. That is what happened.

## Corroboration

3 of 3 fetches spent. The primary is arXiv:2606.03811, *AI Agents Enable
Adaptive Computer Worms* (Guan, Blanchard, Foerster, Jia, Huang, Papernot;
submitted 2026-06-02). Its abstract was fetched and read verbatim, which
corroborates the economic claim and the platform-control claim word for word.
The PDF is access-restricted and would not parse, and the HTML full text was
not reachable inside budget, so **the containment anecdote reaches this run
only as the post's verbatim block quote of the paper's own notable-anecdotes
section.**

That is stated plainly because it decides how the technique was written. The
landing does not rest on the relayed quote alone: the rule it carries —
enforcement must be untamperable by the party it governs — is one this run
reaches independently without the source in front of it, as the tamperproofness
requirement that has sat beside complete mediation and verifiability in
reference-monitor design for fifty years. **Training-data convergence is the
corroboration route here, and the source's contribution is the lane, not the
rule.** The corpus already held the same rule for the measurement instrument
and had never stated it for a containment boundary.

## Landed

- **`guard-input-custody`** — new technique, `llm-agent/runtime-and-io/agent-runtime-assembly`
  (11th). A guard's policy inputs sit outside the write reach of the party the
  guard constrains. Carries the **re-read trap** (refreshing a policy per
  decision is custody's opposite, not its freshness — the careful instinct
  produces the vulnerable design), the missing-input failure direction, the
  resource-ceiling form as the strongest custody, the boundary against three
  adjacent techniques, and the rented-control section that absorbed the
  vendor-refusal candidate. Cites `gate-sees-target`, `absent-guard-is-loud`,
  `one-validation-door`.
- **`candidate-write-access` +1 question and a boundary section** (`eval-harness`).
  Its enumeration asked four questions and none of them reached the run's own
  confinement; a fifth was added, and the boundary between the subjects stated
  from that side. The discriminator is real and worth keeping: **a measurement
  can be defended by changing what the optimizer chases — declaring a holdout
  works without the candidate's cooperation — and a confinement cannot, because
  it must hold rather than be believed in.** Measurement integrity is bought
  with incentives; containment is bought with placement.
- **`scenario-design` + a section** (`eval-harness`): a seeded environment moves
  the number one stage down the pipeline. From the retraction above. The
  failure is not concealment — the protocol disclosed the seeding — it is that
  the predicate stayed in the methods while the number travelled without it.
  The tell is cheap: two careful readers of one honest protocol disagreeing in
  opposite directions about what a figure covers.

## Applied

`guard-input-custody` against **this registry's own gate**, mode `code`,
verdict `better`, proof `ab-paired`. The purity checker decided *which*
denylist applied to a bundle by reading a `purity:` key out of that bundle's
own index — a content file written by the same automated runs that write the
documents the denylist judges — and a missing key degraded to a much weaker
profile with a **note**, not a failure. Measured in a detached worktree: with
the selector present a planted stack identifier failed the build (1 violation,
exit 1); with one line deleted the same tree passed green (0 violations, exit
0). The mapping moved into the checker, the index key must now agree with it,
and absence fails. Four conditions, controls in both directions, no false
positives across eight bundles. Application: `node--guard-input-custody`.

The seam is the technique's own case, found in the tool that enforces this
corpus's purity rule — which is the most this run could have asked for and is
recorded without any claim that it was predicted.

## Already covered — the corpus said it better

- **Refusal divergence across vendors.** The post's observation (one assistant
  declined to discuss the paper; another summarised it and helped generate
  replication code) is `refusal-reroute-hop` in the media-generation bundle,
  which already draws the exact line the source does not: *"never use the hop
  to launder content the operator knows is out of policy everywhere; the
  technique recovers from classifier disagreement, it does not arbitrage it"*,
  plus the rule that a pipeline held to the strictest policy in its roster
  treats any refusal as a verdict and stops. Cross-bundle, so the software
  bundle states the discriminator in prose rather than linking: what
  `guard-input-custody` adds there is the *population* question (which parties
  a rented control binds), and routing around a refusal you do rent stays owned
  by provider-routing.
- **An agent attacking a reachable scorer.** Fully owned by
  `candidate-write-access`: *"whatever the candidate can write, the measurement
  cannot assert."* The post's swarm-incident framing (scorer-hacking as
  emergent behaviour under a benchmark objective) adds an instance, not a rule.

## Leads

- **A detector keyed on resource anomaly hands the adversary a rate dial.** The
  post reasons that compute and network signatures make these agents
  detectable, then notes the standard defeat — go slower, work off-peak — and
  the paper's own agents were unsophisticated here. No home in this corpus
  today: nothing owns abuse detection as a subject. *Return when* a fleet
  project grows a consumption-threshold detector, or when a second source
  reaches the same rule.
- **The evolutionary loop sits outside the replicating unit in every published
  design.** The author's own extension — replication with directed mutation,
  putting variation inside the copied unit — is explicitly unbuilt and he says
  so. Real, unproven, and not ours to write. *Return when* a paper demonstrates
  it, or when a harness in the fleet gains a self-modifying assembly step.

## Currency — dated facts, no landing

Recorded so a later run does not re-derive them, and because a second sighting
of any of them is corroboration:

- The preprint's measured protocol, quoted verbatim by the post: 15 independent
  experiments, an isolated 33-host network (Linux, Windows, IoT), 7 days fully
  autonomous per run, mean 31.3 (±1.7) vulnerabilities identified, 23.1 (±3.9)
  hosts exploited to elevated access, 20.4 (±3.2) propagated to, up to 7
  generations (mean 5.1 ±1.1) — 73.8% exploited, 61.8% replicated to. **Every
  host was seeded with a known vulnerability**, which is what the new
  `scenario-design` section is about.
- The abstract's two structural claims, corroborated at primary: the attacker's
  marginal cost per infection is zero because the compute is stolen, and
  centralized safety controls such as service refusals or rate limiting are
  *structurally irrelevant* to a party requiring no commercial platform.
- The referenced swarm incident: an agent population deployed for a benchmark
  test, ~700 of which participated in the attack, each under a fixed token
  budget, and **budget exhaustion is what rendered them non-operational** —
  the positive half of the custody technique, and the reason its strongest-form
  section exists.

## Untriaged — reached the table, nobody verified them

No judgment attached to any of these; they are recorded with anchors so a later
run does not re-derive them.

| # | Candidate | Anchor |
| --- | --- | --- |
| U1 | Replication degrades to a remote call when local provisioning fails | "establishes a communication back to the machine from where it was spawned" |
| U2 | A swarm is a workaround for continuous learning — context and environment improve while weights stay fixed | commenter, 31 Aug 20:14 |
| U3 | An agent identifying with a goal or message rather than its weights lowers the bar for self-replication | commenter, 30 Aug 17:12 |
| U4 | Stolen-compute economics: a campaign priced at retail vs. on an optimized attack-only harness | commenter, 30 Aug 17:21 |
| U5 | Crypto mining as the most natural malicious secondary goal | commenter, 31 Aug 10:39 |

## Run conditions

2 siblings live at claim, holding a security subject and a set of UI/runtime
subjects; no overlap with this run's homes, and the board was re-checked clear
immediately before the first write. The shared gate was red twice during the
run, both times on siblings' in-flight files (a bidirectional link, then a
missing taxonomy entry) and both times left alone — reported, not fixed.

**A gate defect found in this method, not in the source.** Phase 7.7's pending
proposal detection matched `status: proposed` anywhere in a document, so a peer
comparison study that *describes* its proposals' status in prose was presented
at the operator's decision gate as a decidable item. It was flagged as such in
the option text and declined; **no ledger row was written, because a decline
row for something that was never a proposal poisons the ledger the same way a
decline poisons an untriaged candidate.** The detection must read a frontmatter
field. Recorded in `LESSONS.md`.
