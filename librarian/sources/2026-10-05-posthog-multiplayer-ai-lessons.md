---
source: web:newsletter.posthog.com/p/were-building-multiplayer-ai-heres
kind: first-party practitioner account (vendor product team's dogfooding notes)
url: https://newsletter.posthog.com/p/were-building-multiplayer-ai-heres
title: "We're building multiplayer AI. Here's what we've learned so far"
author: Jina Yoon (PostHog)
words: 2269
extracted: 13
accepted: 1
declined: 0
leads: 4
already_covered: 5
untriaged: 5
applied: 1
shipped: 1
dispatched: 0
run_id: intake-1005-phmp
siblings: 1
---

# A planning bullet has no hedge to keep

Intake 2.15.0, run 2026-10-05. A source originates a finding. It never
authorizes one. The web ingest returned 2,269 words of real prose: a dated
post with byline, three numbered lessons, footnote and comments. The
container check passed. One live sibling at claim: `apply-fgad-1005`
(source `apply:format-generations-are-declared`), holding no subject. It
was building in a personas worktree during Phase 8, which is why the
personas build lock was contended.

**Class and expected yield, said before the table.** A vendor product team
writing about its own product in development, with dogfooding numbers.
That makes it a **first-party practitioner account**: authoritative about
what they built and measured, n=1 about what works in general. The class
predicts most rows as catches, a lead or two, and at most one decision rule
with its conditions attached. The fetch budget does not bind, because
corroboration is corpus-internal and the fleet seam does the rest. The
result fit the prediction: one technique, five catches, four leads, five
untriaged, **0 of 3 fetches**.

The source sits at the corpus's top-ranked subject. `librarian-scan` puts
`agent-memory` first (56). The source's context layer is a nightly agent
pass writing a version-controlled wiki, which is the shape of the
measured ladder's top arm ("agentic extraction over a versioned store").
The run entered the memory lane and read `references/memory-lane.md`
before Phase 3.

## Declared focus

The last scorecard focus (2026-10-05, cinematic-commercial-one-pass) is
render-bound: declare the frame region before the first render. **It does
not apply.** Nothing here generates pictures. The focus before it (mixar)
does apply, and this run followed it: at Phase 5 the fleet `file:line` arm A
would run beside was written down
(`src-tauri/src/companion/brain/sleep_cycle/prompts.rs:65`, the COMPRESS
rules in personas). The probe ran against that line **before the technique
was drafted**, and the probe changed what the technique says (below).

## Triage

| # | Lane | Shape | Eff | Title | Prior art | Impact | G/R/C | Read | Exp. apply | Decision |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | K | technique | M | A consolidation pass admits only what its container says was decided | `agent-memory/memory-governance` (author axis only), `pending-beliefs-live-apart` (interactive lane), `prompt-assembly/compression-hardens-deferred-decisions` (same direction, instruction layer, excludes fact layers) | new-technique | 4/1/2 | real gap | experiment at personas `sleep_cycle/prompts.rs:65` | **accept** -> landed, applied, shipped |
| 2 | K | technique | S | A hand-written shared context file goes unmaintained (64 started, 14 edited, 90 days) | `agent-instruction-files/write-back-sink-class` (hand-maintained sinks), `docs-sync` | none | - | likely catch | - | already covered; the number is one vendor's dogfood, kept here as a datum |
| 3 | K | technique | S | Write the source-of-truth wiki in present tense, as current state | `docs-sync`, `machine-authored-documentation` | none | 1/2/1 | likely catch | - | untriaged (scored, below threshold; not opened) |
| 4 | M | technique | S | Nightly agent pass into a version-controlled Markdown wiki | `agent-memory/consolidation` (batched), memory-year ladder top arm | none | - | likely catch | - | already covered: the ladder prices this shape at 0.92 and the highest write cost |
| 5 | K | technique | S | Teammates' agents diverge when their definitions differ | `agent-instruction-files/single-source-topology` | none | - | likely catch | - | untriaged (slug match only, not opened) |
| 6 | K | technique | S | Do not let others steer a live agent session; collaborate before and after it | none owns it | new-technique | 1/2/1 | thin | - | **lead** |
| 7 | K | technique | S | Attach the agent's reasoning to the change for review | `machine-paced-delivery/proposal-not-push` ("with the reasoning attached") | none | - | likely catch | - | already covered |
| 8 | K | technique | S | Hand teammates a curated artifact, not the session | `fleet-orchestration/brief-carries-the-session` (fork versus fresh brief) | none | - | likely catch | - | already covered |
| 9 | X | lead | S | Ask a shared space's goal (metric, target, interval, deadline) at creation | none | none | - | thin | - | **lead** |
| 10 | K | technique | S | Sessions start private and are promoted to shared | `agent-memory/scope-before-similarity` (private scratch beside shared), `cross-context-promotion` | none | - | likely catch | - | already covered |
| 11 | K | technique | M | Confirm a precision-first positive with a blind second draw; a split drops it, with no tiebreak | `judgment-guardbands` ("all-or-nothing has no tie-break", for keep-N, not for confirmation draws) | new-technique | 2/2/2 | partial | - | untriaged (promoting read done; still one line of prose) |
| 12 | - | currency | S | Multi-human agent coding surfaces shipped (transcripts beside diffs, an agent commit trailer) | no application dates on them | none | - | thin | - | untriaged: no clock to move |
| 13 | K | technique | S | Chat flattens rich state into text and the agent re-inflates it | none | none | - | thin | - | untriaged |

`auto=1/2/0 fp=0`. Three upper-layer rows reached the score (1, 3, 11).
Row 1 cleared it. Row 1 survived Phase 6, so no false positive. Leads ran
under the corroboration table.

**Row 1 score.** GAIN 3 (new technique in the scan's top subject), +1
convergence: `compression-hardens-deferred-decisions` was forged
independently from a different source and finds the same direction (an open
item collapses to the committed branch), but it explicitly scopes fact
layers out. RISK 1: the mechanism rested on the source plus the
convergence, and the seam was confirmed by opening the tree. No rewrite:
the technique is a new file plus one golden-path list line. COST M.

## Row 1: the probe moved the technique

Arm A was the personas COMPRESS prompt as shipped (`prompts.rs` at
`787fd2bd`), rebuilt outside the app with the same text and fence. It ran
headless on the routed model at medium effort, three draws per arm. The
fixtures were invented.

- **The obvious form was refuted at this seam.** Two fixtures held explicit
  hedges in the sentence ("not sure, just an idea", "nothing's decided"),
  plus two "considered X, chose Y" items. The as-shipped arm hardened
  **0 of 30**. A sentence-level rule (arm B) had nothing to fix.
- **The real failure is the container.** A third fixture pasted four
  planning-session bullets with no hedge. Arms A and B both hardened
  **12 of 12**, at 0.85-0.9, and eleven values wrote in a "decided" the
  evidence never said. In the same sentence-carried form, a draft change
  and a merged change came through correctly in every arm.
- **A container rule fixes it.** Arm D (the container rule alone) hardened
  **0 of 12**, and arm C (both rules) also 0 of 12. The floor held: settled
  items 7/7 and 9/9, against 20/21 and 9/9 for A. Side effect: open items
  now come out as status-carrying facts, about 3.8 to 7.5 facts per pass on
  the hedged fixtures (n=1 for D).
- **A lexical post-check is a backup, not the rule.** Flagging a "decided"
  claim whose cited episode has no decision word caught 23 of 24
  hardenings. It missed the plain future tense.

So the technique landed as **the container carries the decision status**,
not as "ideas are not decisions". The source's own design (read only what
was shipped, merged or decided) is decision rule 1, admitting by a
lifecycle field in code. The measurement is rule 2, for containers that
have no field.

Landed:
`knowledge/software-engineering/llm-agent/prompt-and-context/agent-memory/techniques/container-carries-decision-status.md`,
plus the golden path's `techniques:` line and list entry, plus
`applications/rust--container-carries-decision-status.md` (`applied:
experiment`, `ab_verdict: better`, `proof: ab-paired`). check-anchors:
5 of 5 held against the personas tree. The purity grep against the
source's vocabulary returned zero, with a positive control matching in the
application.

## Leads

- **Row 6, nobody wants teammates steering their live agent session.**
  Collaboration happens before the code (plans, artifacts) and after it
  (review), not during. The source calls it "early data" from one team, and
  the engineer's quote is a hypothesis. **Return condition:** a second
  first-party measurement of shared live sessions, or a fleet project that
  ships co-steering and records whether anyone uses it.
- **Row 9, ask a shared space's goal at creation.** The goal is a metric, a
  target, an interval and a deadline, and smart defaults come later. It is
  a product idea, with no measurement yet. **Return condition:** the
  source's follow-up reporting whether the captured goals changed anything,
  or a fleet project that creates team spaces (personas `teams/sub_goals`
  is the nearest).
- **Law candidate: summarizing collapses an open status to the committed
  branch.** This is the second run to reach the root, after
  `compression-hardens-deferred-decisions` on the instruction layer and
  this run on the fact layer. **Return condition:** a third independent
  sighting in a different layer (a handoff summary, a commit message
  generator, a meeting-minutes pass). Then propose it as a law with these
  two techniques cited.
- **Memory lane: a store serving several people.** The source's whole
  premise is shared context across teammates. The ladder's open question
  "no arm has been measured on a store that must serve two users with
  different preferences" stays open, because the source reports no
  measurement. **Return condition:** a multi-principal scenario in
  memory-year, or a source with a measured multi-user store.

## Already covered

Rows 2, 4, 7, 8 and 10, with the subject each resolved to in the triage
table. Row 2's number (64 people started a hand-written shared context
file in 90 days and 14 ever edited it) is kept as a datum. It is the
measured form of what `write-back-sink-class` says about hand-maintained
sinks.

## Untriaged (nobody verified these)

- **Row 3**: "written in present-tense since the context layer's job is to
  describe the current state". The likely home, `docs-sync`, was not
  opened.
- **Row 5**: "two teammates attend the same meeting but write down slightly
  different definitions of a goal metric". Matched on slug only.
- **Row 11**: "a monitor yes under verify-positives stands only when a
  blind second draw agrees; one dissent drops it and no third draw breaks
  the tie". The promoting read found `judgment-guardbands` states the
  tie-break-free shape for keep-N rules only. It is still one quoted line
  from a decision log. A primary would promote it (screening literature on
  confirmatory testing).
- **Row 12**: transcripts beside diffs, an agent commit trailer, a
  chat-tagged agent. Shipped surfaces, with no application dating them.
- **Row 13**: "translate rich information into flat text, only to be
  transformed back".

## Apply and ship

`applied: 1` (experiment, better). `shipped: 1`: personas
**50371454f** on `master`, rule 2c in
`src-tauri/src/companion/brain/sleep_cycle/prompts.rs`, not pushed. The
seam was chosen to falsify, and it refuted the per-sentence form of the
finding (see above). Not done: the manual consolidation pass
(`consolidation.rs:1179`) has its own rules block and did not get the rule.
It is unmeasured and named in the application. **Directions:** n/a (an
essay, no design record). **Routing count:** n/a (not a repository).

## Cleanup

The scratch directory `intake-1005-phmp` held the ingest, the prompt
builder, 28 model outputs and the cargo log. It was deleted by run id. The
ingest's transcript and metadata files were deleted by source slug.
