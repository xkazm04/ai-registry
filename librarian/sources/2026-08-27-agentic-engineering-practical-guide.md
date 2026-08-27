---
source: web (single article)
url: https://scottspence.com/posts/agentic-engineering-practical-guide
title: "Agentic engineering: a practical guide to reliable coding agents"
author: single practitioner (personal blog; describes their own agent harness)
kind: first-party practitioner account (guide-shaped, walkthrough-yielding)
mined_on: 2026-08-27
words: 2600
skill_version: 0.14.0
extracted: 15
picked: 2
accepted: 1
already_covered: 8
declined: 1
leads: 2
untriaged: 5
dispatched: 0
fetches_spent: 0
---

# Agentic engineering practical guide, 2026-08-27 - the flow the subject never enumerated

Run 33. A first-party practitioner account of one person's coding-agent
harness. The class prediction held exactly: the **recommendation** half was
almost entirely already covered by a mature `llm-agent` bundle, and the whole
yield sat in the section where the author lists what went *wrong* in four
weeks of real use. That is the release-walkthrough property showing up inside
a guide - a stated failure mode carries its own motivation, and a
recommendation does not.

Zero fetches. A first-party account corroborates corpus-internally or not at
all, and everything here resolved against files already in the tree.

## The finding, and why it was not the headline

The picked candidate's headline claim - *put the trust boundary where the
agent cannot edit it* - is **already owned**, and better: `hitl-approval`'s
golden path has a section called "The gate lives in the substrate, not the
prompt", anchored to `gate-sees-target`, with two corollaries the source does
not reach. Had the run stopped at the headline it would have produced a
duplicate.

What survived came from the **enumeration hunt**. The golden path opens by
declaring its own completeness - "the subject owns **two flows that are mirror
images of each other**" - then adds "A third flow: the human does the work".
Three flows, all of them gating an **action**. The source's measured failure
mode names a transition none of them covers: *"plans needed legitimate
amendments more often than I expected."* The machine's **terms** - its scope,
its route, its definition of done - are governed by nothing in the subject,
because they are assumed static from dispatch.

The subject had also **denied too much**. `gate-state-machines` states that
approval transitions are driven only by a human. Correct for verdicts; applied
to the whole harness record it forbids the very amendment lane 173 real
harnesses say is the normal case.

## Accepted (1)

1. **`fixed-policy-amendable-plan`** → `llm-agent/orchestration/hitl-approval`,
   as the subject's fourth flow. Split the executor's governed record by
   **write authority rather than by content**: the fixed tier (allowed paths,
   forbidden operations, validation commands, the stop-and-ask condition)
   lives outside the executor's working context and is read-only to it; the
   route inside that boundary is the executor's to revise, each revision
   recording the fact that made the previous plan wrong. The split then *is* a
   trigger predicate - inside the boundary, amend and continue with no gate;
   requiring the boundary to move, stop and escalate, and the executor may
   propose the new policy but never adopt it.
   Laws: `gate-sees-target` (the fixed tier), `silent-state-is-ungoverned` (an
   unrecorded amendment is exactly the private epistemic state that law names),
   `creation-names-reaper` (the amendment record expires with its task).
   Golden path gained the fourth-flow section and the techniques-list entry.

   Two of the source's other measured weaknesses folded in rather than
   becoming separate candidates: over-broad forbidden-command patterns (the
   fixed tier's cost is asymmetric and both directions are quiet - too broad
   and every task escalates, which reaches gate fatigue by the route that
   looks most responsible) and stale task state read by a later session as
   current policy. The third, "failed harnesses still needed a human to
   interpret the outcome", became the technique's "What this cannot do".

   The adoption numbers (28 Jun - 25 Jul 2026: 173 harnesses / 104 sessions /
   10 workspaces; 144 completed at least once; 155 with validation or review
   evidence; 133 enforcement blocks across 69 sessions) are cited into the
   technique as an **existence proof, not a distribution** - the class rule for
   a first-party account, stated in the document itself so a later reader
   cannot mistake n=1 for a rate.

## Declined (1)

2. **Decide whether to harness before harnessing** - the proportionality
   claim ("wrapping a spelling fix in a miniature software factory is
   ceremony, not rigour", plus the measured "low-risk tasks became slower when
   I routed them through the same ceremony"). **Already covered, and better.**
   `hitl-approval` has "When a gate is mandatory" with four named triggers
   (irreversibility, spend, external visibility, low confidence/first
   exposure), the explicit complement that actions which cannot change the
   world need no gate, "a correct gate map is mostly white space", and a whole
   gate-fatigue section whose first countermeasure is "tier by consequence".
   The source's version adds no mechanism the subject lacks.
   The one non-identical edge - the corpus prices over-gating as *human
   attention* depletion, the source measured it as *task latency* - is too
   thin to carry a technique, and landing it would have been padding. Recorded
   here so a later run does not re-propose it.

## Already covered (8) - catches, do not re-propose

3. **Repeated correction → promote it to a check** ("the more often I repeat a
   correction, the stronger the case for turning it into a check") and
   **make project knowledge executable** → `agent-instruction-files`
   /`enforcement-demotion`, which owns the sort ("could a program decide
   compliance? yes → demote") with `gate-sees-target` and `absent-guard-is-loud`.
4. **Prompting harder is not a durable control** → same technique; it is the
   premise `enforcement-demotion` opens on.
5. **Grade the repository state, not the agent's summary** (the booking-agent
   example: the transcript says booked, the outcome is whether the reservation
   exists) → `eval-harness`/`assertion-vs-judgment`.
6. **Context is retrieved, not loaded; a giant instruction file crowds out the
   task** → `prompt-assembly`/`context-reachability`, and `retrieval`.
7. **Progressive disclosure over exposing every available tool** → `mcp-tools`.
8. **Parallel agents only for genuinely parallel work; five agents on the same
   files is a coordination problem called scale** → `fleet-orchestration`
   /`parallel-dispatch`.
9. **Injection arrives via web page, issue, dependency README or tool
   response** → `prompt-safety`.
10. **Least access for the task; destructive or public actions behind a human
    approval boundary** → `hitl-approval` (the four mandatory-gate triggers)
    and `machine-paced-delivery`/`scoped-delivery-access-for-agents`.

## Leads (2)

- **The self-review failure is about shared context, not about rank.** The
  source: "the same mistaken assumption can survive planning, implementation
  and self-review if all three stages share the same context." The corpus
  models independent review (`review-queues`, `unaided-baseline-screening`)
  but the *mechanism* named here - that co-located context, not insufficient
  scrutiny, is what defeats self-review - may be a seam inside `eval-harness`
  rather than a hole. **Return when** a second independent source states the
  shared-context mechanism, or when a connected project runs a reviewer that
  shares the author's context and the failure is observable.
- **File-scoped diagnostics as the agent's working feedback channel, with the
  repository's full checks reserved for completion.** The source reports this
  changed their loop more than expected: the agent requests diagnostics on the
  changed file rather than running a project-wide check after every edit, and
  resolves symbols by definition/reference lookup instead of guessing.
  Neighbour is `machine-paced-delivery`/`agent-readable-build-outcomes`, which
  is about the *outcome* of a build rather than an incremental query surface
  during authorship. **Return when** a second source measures the loop
  difference, or when a connected project exposes an incremental diagnostic
  surface to an agent and the before/after is visible in the tree.

## Untriaged (5) - extracted, reached the table, nobody picked them

Recorded with anchors so a later run does not re-derive them. **Nobody
verified these; they carry no judgment.**

- *A failed enforcement is not self-describing* - "failed harnesses still
  needed a human to interpret the outcome". (Partially absorbed into the
  accepted technique's boundary section, but the general shape - a blocked
  action that cannot explain itself - was never checked against
  `agent-chaining`/`stop-reason-ledgers`.)
- *Stale task state confuses later sessions* - "stale task state made later
  sessions confusing". (Absorbed as the reaper paragraph; the standalone
  question of task-state lifecycle in `fleet-orchestration` was not opened.)
- *Over-broad forbidden-command patterns* - "some forbidden-command patterns
  were too broad". (Absorbed as the tuning section; not checked against
  `ci-execution-trust`/`injected-code-scope-ladder`, which may hold the
  opposite side of the same boundary.)
- *Run credential-dependent child processes without printing the environment
  into the conversation* - the author built a tool for exactly this. Neighbour
  `ci-execution-trust`/`secret-materialization-discipline` is CI-side; whether
  the local-agent side is the same rule or a discriminator was never checked.
- *Evidence at handoff as a harness requirement* - "require evidence at
  handoff". Neighbour `agent-chaining`/`handoff-payload-contracts`.

## Source class - third clean observation of the first-party account

The class row predicts "authoritative about what they did and measured,
weak about universality". This run adds a sharper operating note:

> **In a first-party account, read the failure list first and the
> recommendations last.** Every accepted word of this run came from the
> author's "they also exposed weaknesses" section; every recommendation in the
> guide was a catch. A recommendation is what the author believes; a stated
> failure is what their system did to them, and only the second one is
> reliably absent from a mature corpus - because the corpus was built from
> other people's recommendations too.

The guide shape is worth naming as a hazard: a guide *reads* as high-yield
(it is organised, confident and comprehensive) and is structurally
low-yield, because comprehensiveness over known ground is exactly what a
mature bundle already has. Length told us nothing again - 2,600 words, one
landing, and the landing came from roughly 90 words of it.
