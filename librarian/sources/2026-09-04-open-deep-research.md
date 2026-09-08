---
source: open_deep_research
kind: vendor repository (compact; design-bearing, not design-deep)
url: https://github.com/langchain-ai/open_deep_research
title: Open Deep Research
author: a model-framework vendor
commit: 1b7d2e80db9faa586165c60e09096dbbfd483a64
words: 1061 (landing page) / ~11,400 (in-tree prose + prompt artifacts) / 45 files, ~5,600 lines
extracted: 13
accepted: 5
declined: 0
leads: 1
already_covered: 4
untriaged: 0
dispatched: 0
applied: 5
shipped: 1
run_id: odr-2026-09-04
siblings: 1
---

# Open Deep Research - the design read that did NOT hand off, and why the count says so

**Class.** Vendor repository. Cloned and swept per Phase 2b; the landing page is
1,061 words of advertisement and none of the five landings came from it. The
yield was in the graph module, the prompt artifacts (3,343 words - the largest
single prose file in the tree), the utility module, the evaluation harness, and
the superseded legacy retrospective that explains what the current version
replaced.

**Expected yield, said before the table:** design decisions and prompt
artifacts, not claims. That held - every landing is a decision, none is a quote.

## Phase 2d routing count, written before extraction

**14 load-bearing decisions across 4 systems; 4 unmodelled.**

| System | Decisions | Unmodelled | HOME IF NEW |
| --- | --- | --- | --- |
| A. Research orchestration graph | 5 | 2 | agent-chaining -> revised to fleet-orchestration |
| B. Context economy under limits | 3 | 0 | - |
| C. Evaluation harness | 4 | 2 | eval-harness |
| D. Configuration and tenancy | 2 | 0 | - |

**No system reaches three, and no home-if-new cluster reaches three.** Neither
clause of the v2.2 trigger fires, so **no forge handoff** - correctly. This is a
compact practitioner account in repository form (45 files) with a real design
layer, not a system. Landing stayed in intake.

The one revision the count survived: the two orchestration candidates first
mapped to `agent-chaining`, whose golden path opens by distinguishing an
event-wired peer-to-peer chain from an orchestrator-driven pipeline. This
source's supervisor is neither - the topology is decided by a model, per turn.
Re-homed to `fleet-orchestration`, whose dispatcher/worker/brief/harvest model
fits exactly once the dispatcher is allowed to be a language model. That
re-homing is the run's most useful structural observation and is recorded in
both subject notes.

## Landed

1. **`parallel-dispatch`, amended** - *when the requester cannot survive the
   wait, refuse instead of queueing.* The technique's rule is "admit to cap,
   queue beyond it", which assumes a requester that persists across the wait. A
   dispatcher that is one model turn is not: promotion delivers a slot to
   nobody. The source refuses the overflow into the requester's own context with
   the cap stated, and the requester re-plans on the next turn. Discriminator
   added: whether the requester survives the wait, never the size of the
   overflow.
2. **`deliberation-as-an-elected-turn`** (new, `fleet-orchestration`) - a
   reflection tool with no side effect that the dispatcher elects, forbidden
   from being emitted in parallel with the action it reasons about. The
   non-parallel rule is the load-bearing half: tool calls in one batch are
   generated from one context, so a reflection emitted beside its delegations is
   a prediction sitting in the record where an assessment belongs. The election
   rate is a signal a mandatory step would destroy.
3. **`soft-budget-under-the-hard-cap`** (new, `fleet-orchestration`) - two
   limits per model-driven loop: an enforced cap that must never fire, and a
   smaller budget in the brief derived from it. Found as an **asymmetry inside
   one file**: the supervisor's brief interpolates its budget from the same
   field the machinery enforces; the sub-researcher's brief carries a literal
   against a configurable cap twice its size. Same release, same author, two
   conventions, only one of them tunable.
4. **`probe-the-decision-not-the-artifact`** (new, `eval-harness`) - when the
   artifact admits only a judge, look upstream for a decision with a small
   answer space and a gold label. **Kept because the source implements it
   badly**: its decision suite is labelled for the *first* supervisor fan-out
   and reads the *last*, and it runs the entire graph - researchers, compression
   and report generation - to observe a decision made in the first turn. Both
   failures leave the suite green, which is exactly what makes them worth
   writing down.
5. **`escape-hatch-usage-as-the-safety-metric`, amended** - the hatch the
   transform takes on the agent's behalf. The technique counts the model's
   elections; this summarizer returns the raw page (up to 50,000 characters) on
   timeout or any exception, logged at warning only. Invisible to the recovery
   rate, inverts the disclosure rule, and - the reason it is not bookkeeping -
   **a bounding stage's failure path is correlated with the input it was
   bounding**, so the fallback is largest exactly where the transform was most
   needed.

## Already covered (catches, recorded so nobody re-proposes them)

- **The brief collapses the conversation and the executor never sees it** (the
  supervisor's message list is overridden, not appended to). Modelled by
  `fleet-orchestration/brief-carries-the-session`, same forces.
- **Compression is the only payload crossing the sub-agent boundary, and it is
  explicitly not summarization** - stated four times in one prompt plus a
  separate message repeating it. Modelled by
  `agent-chaining/handoff-payload-contracts` and
  `fleet-orchestration/result-harvest`.
- **Five of six evaluator scores are a judge's 1-5 rescaled to look like a rate;
  only groundedness has a real denominator** (claims grounded over claims
  extracted). Covered by `count-carries-predicate` and `metric-role-contract`.
- **Auth stamps ownership on create and returns a filter on read**, with the
  store namespace asserted against the caller's identity. Modelled by
  `orchestration/tenant-scoped-agent-runtime`.

## Partial rows, promoting question executed (v2)

- **Groundedness is judged against the pre-compression evidence, not the
  writer's input.** Promoting question: does any eval-harness technique own the
  *choice of grounding corpus*? Answer, from `metric-role-contract` and
  `judge-stability`: no - but the decision is one paragraph and carries no
  mechanism the subject lacks. Not promoted; recorded here so a later run does
  not re-derive it.
- **Environment variables outrank per-request configuration**, unconditionally,
  for every field - so the entire per-user settings surface is silently inert
  for any field whose upper-cased name exists in the process environment, in a
  deployment whose auth layer scopes threads per user. Promoting question: does
  `settings/cross-source-precedence-chain` model a chain whose lower-priority
  source is a *per-tenant* surface? Answer: it models one binary booting against
  an operator file or an injected identity - a single-tenant frame. Real, and a
  genuine boundary, but one paragraph in another bundle and outside the
  operator's picks.

## Lead

**A disabled guard whose predicate is still called.** The delegation block's
error handler classifies the exception as a token-limit overflow and then
disjoins the result with a literal true, so the classifier is invoked, its
answer discarded, and *every* exception - including a bug in a sub-researcher -
silently ends the research phase and writes a report from partial notes. The
generalizable shape - a classifier whose result is unconditionally overridden at
the call site, leaving a correct-looking call as documentation of an intent the
code does not have - may belong beside
`codebase-stewardship/dead-code/configuration-union-proof`. **Return condition:
a second independent sighting of a live predicate short-circuited in place.**
One sighting is a bug; two are a rule.

## Corroboration

**Zero of three fetches spent.** Everything was corroborated corpus-internally
or against real code in an opened tree - this source's own clone and the applied
project's - which is what the class predicts for a practitioner codebase. The
eighth consecutive zero-fetch run for a source carrying its own primary
material.

## Applied

Five rows, one project (`pumper`), aimed there because the operator asked for
impact on its scraping and research surfaces rather than on whatever tree was
nearest. One `code` row shipped with a paired proof, two `task` rows with plans
committed in the project, one `simulation` that came back **not-better** at two
of three real sites, one `unapplied` with no seam anywhere in the fleet. Rows in
`librarian/applied.md`; seams in the project's own ledger.

**The strongest thing the apply pass produced was a refutation.** The
escape-hatch amendment predicted uncapped failure fallbacks; two of three
bounding stages in that tree already cap theirs below the trigger, and a third
states the amendment's own disclosure rule in its source comments and *refuses*
rather than truncating - which is stronger than what the amendment asks for.
Two of the five rows are independent convergence and are reported as
convergence, not as misses.

## Board

One sibling live throughout (`agentreach`, a different agent repository). No
contention on any of the five claimed subjects. Index and catalog regenerated
under the lock after the content landed.
