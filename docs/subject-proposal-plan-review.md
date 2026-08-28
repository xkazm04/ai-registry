# Subject proposal — `plan-review`

**Status:** EXECUTED 2026-08-28, same session as the intake that raised it. Forged at
`knowledge/software-engineering/llm-agent/orchestration/plan-review/` — golden path,
five techniques, two `process` applications, gate-clean. See
[`librarian/subjects/software-engineering/plan-review.md`](../librarian/subjects/software-engineering/plan-review.md)
for how the five open questions resolved. Overrides worth noting here: technique 5
(`informational-fold-in`) was kept as a technique against the brief's "drop it if one
paragraph", because four of its rules are stated nowhere else in the corpus; and claim 2
("a single-agent self-review is refinement") was sharpened by the literature into a
priced, degraded rung rather than adopted as a slogan. This document is retained as the
record of what was dispatched. It is a forge input, not knowledge.
**Bundle:** `software-engineering`
**Category:** `llm-agent` → subcategory `orchestration`
**Resolved path:** `knowledge/software-engineering/llm-agent/orchestration/plan-review/`
**Raised by:** `/intake`, 2026-08-28, from
[`librarian/sources/2026-08-28-ai-literacy-superpowers-concepts.md`](../librarian/sources/2026-08-28-ai-literacy-superpowers-concepts.md)
**Engine:** `domain-knowledge-forge` — read [`forge-brief.md`](forge-brief.md) first; it is the contract.
**Override this brief where the tree argues otherwise, and say so in the report.**
Both workers dispatched on 2026-08-22 overrode their briefs, both were right, and both
explained why. A brief that reads as non-negotiable buys compliance with a mistake.

---

## Placement, verified against the authority

`taxonomy.json` is the authority, not a directory count. `llm-agent` is **nested** — it
holds five subcategories (`companion`, `evaluation-and-cost`, `orchestration`,
`prompt-and-context`, `runtime-and-io`) and no bare subjects — so a flat add at
category level is illegal and the subject must enter a subcategory.
`llm-agent.orchestration` currently holds **six** subjects — `agent-chaining`,
`fleet-orchestration`, `model-routing`, `hitl-approval`, `remediation-handoff`,
`proactive-nudges` — against a cap of ten. A seventh is legal and requires no
restructuring.

Link depths, stated so they are not derived wrongly (verified against
`hitl-approval/hitl-approval.md`, which resolves `../../../_laws.md`):

- from `plan-review/plan-review.md` → `../../../_laws.md`
- from `plan-review/techniques/<t>.md` → `../../../../_laws.md`
- to a sibling subject, e.g. `../hitl-approval/hitl-approval.md`
- to a sibling's technique, e.g. `../hitl-approval/techniques/decision-records.md`

Rejected placement: `prompt-and-context`. Two of the proposed techniques are prompt
mechanics (a posture boundary inside one agent file, a fresh-context challenge), but
the subject's *object* is the artifact a human reviews before committing to a plan,
which is a pipeline stage. `prompt-and-context`'s subjects own how context is
assembled, remembered and made safe; none of their boundary statements claim the
review of a plan. If the drafter finds `fresh-posture-self-challenge` sits more
naturally beside `prompt-assembly`, split it out and say so — the other four stay.

## Why this is XL and proposed rather than written

Four candidates from one source each looked like a standalone technique at extraction
— a routing rule between two review records, a slicing discipline that runs before any
plan exists, a rule about when premise-level objections must be raised, and a
self-challenge architecture with an escalation ladder. Mapped individually, each
landed near `hitl-approval` and none inside it. Read together they are **one missing
stage**: the corpus owns the pause (`hitl-approval` — trigger, durable pending state,
decision surface, decision record, continuation), the rate at which pauses are
demanded (`machine-paced-delivery/human-gate-capacity`), and what an agent may change
unilaterally (`proposal-not-push`). Nothing owns **what the human is shown at the plan
gate, in what order the questions are asked, and which questions are answered by a
separate reader rather than by the author**. `hitl-approval` states "the human decides
on the real thing — the actual content, not a summary produced by the gated party" and
stops; it never says what a plan's "real thing" is, because for a plan the content is
mostly what was *not* written down.

The source is a single first-party author (n=1) describing four agents it built to the
same shape. That is strong evidence for the shape of each technique and weak evidence
for universality — the wrong basis for writing a subject in-run, and exactly the right
input for a two-phase forge (expert draft, web hardening against the primaries below,
then reconciliation against a tree). Zero web fetches were spent this run; the
primaries are training-data-resident and listed for the drafter.

## The subject's stated job (draft the boundary from this)

> A plan an agent produced arrives at a human whole, coherent, and faster than the
> human can construct an alternative to it. Acceptance becomes the path of least
> resistance, and each acceptance weakens the next decision. `plan-review` owns the
> artifacts that make the plan gate a decision rather than a ratification: the slice
> the plan is allowed to be, the objections it must survive, the decisions it made
> without saying so, and the order those are put to a person — each produced by a
> reader that is not the author and cannot write its own verdict.

Three claims the golden path must make and defend:

1. **Coherence is the cognitive trap.** The cost of disagreeing with a proposal rises
   with its size and internal consistency, because disagreement means holding an
   alternative in working memory against a finished structure. The remedy is not "read
   more carefully"; it is to bound what arrives at the gate to a size at which a
   counterfactual can be held.
2. **A single-agent self-review is refinement, not review.** An agent asked to
   critique its own plan anchors on the plan. The only remedy is a separate reader
   with a different charter — and the charters are distinct enough (refuse
   coherence at the wrong scale / find what is wrong / find what was chosen silently)
   that bundling them into one reader softens each.
3. **The reader is read-only and the human writes the verdict.** Inherited from
   `hitl-approval` ("transition authority is separated from work authority", "a gate
   the gated party can open is a decoration") and `decision-records`; this subject
   must not re-mint it. What it adds is the *content* rule: each reader emits a record
   with `pending` dispositions, a dispatcher persists it, and the disposition can only
   be written by a person opening the file. Rationale is mandatory on every
   disposition of an objection — see the 2026-08-28 amendment to `decision-records`
   for why the reading inverts there.

## Proposed techniques

Names are proposals. Each must carry `use_when`, cite only laws that already have
anchors in `_laws.md`, and state a decision rule.

### 1. `silent-decision-surfacing`

A plan captures what was said and is poor at what was assumed. A separate read-only
reader maps the decisions the plan committed to without naming them — defaults
inherited from a framework or a training prior, alternatives never mentioned, known
patterns implemented unnamed, consequences accepted — and emits each material one as
a story with `pending` disposition.

Decision rules the technique must carry:

- **The routing rule between this record and the objection record** (technique 3),
  deterministic: a finding belongs here iff removing it would leave a decision
  unrecorded but no failure undetected; it belongs in the objection record iff
  removing it would leave a class of failures undetected; both → objection (failures
  dominate for routing); neither → dropped. Both readers apply it before emitting.
- **Selectivity is leverage, not severity**: five to eight stories ranked by what would
  compound if recorded, with a hard cap; a reader that pads to a count produces noise
  that masks signal.
- **Observer-written rationale is not an ADR.** An ADR is written by the decider about
  a choice they know they made and is absent exactly where the author did not notice
  the choice; a surfaced story requires no recognition from the author — it *is* the
  recognition. A plan can carry rich ADRs and still carry this debt.
- **Disposition set** `accepted` / `revisit` / `promoted`, and `promoted` is a routing
  signal into the project's instruction files (`agent-instruction-files` owns the
  file; this technique only says which stories qualify).
- **Aggregate reading**: which lens fires most (defaults dominating → conventions need
  work, not plans), which disposition clusters (`revisit` on unnamed patterns → the
  team implements patterns without naming them).

Primaries for hardening: Nygard, *Documenting Architecture Decisions* (2011); Henney,
pattern stories, POSA vol. 5 (2007); Storey, *From Technical Debt to Cognitive and
Intent Debt* (arXiv:2603.22106, 2026) for the debt vocabulary. The source's mechanism
is on its "Decision Archaeology" page.

### 2. `decision-sized-slicing`

Slice the task **before any plan exists**, into thin, end-to-end-complete pieces each
carrying one material decision, and gate the pipeline until a human has dispositioned
every slice. The technique's argument for why this is a separate stage and not a
narrower planner:

- **Sunk cost**: once a plan is written the framing is committed, and slicing it
  afterwards means unwinding choices already made against pushback that arrives
  against finished work.
- **Charter**: a planner's charter is to articulate a coherent design; a slicer's is
  to refuse coherence at the wrong scale. Bundled, the planner under-slices or the
  slicer over-specifies.

Rules to carry: a **lens priority** (decision-boundary primary — one slice per decision
whose alternative produces visibly different downstream work; acceptance-criterion
as fallback for tasks with criteria but no decision content; end-to-end as a filter
dropping internal-only milestones; independence as a modifier recording order;
inseparability as the terminal case). **Inseparability must argue, not assert** —
atomic migrations, credential rotations and security patches are named as
inseparable with a defended rationale, and the single slice still goes through the
gate. A **four-value disposition** (`accepted` / `merged` / `dropped` / `revised`),
because a binary collapses "fold this in" and "throw this away", and `revised` is the
push-back loop. Record what was *considered and rejected* as a slice boundary (file
boundaries, layers, commit boundaries) so the slicing is defensible.

Boundary: `human-gate-capacity` already says "send fewer changes" and
`proposal-not-push` already says "one concern, small enough to read". Both are about
what arrives at the *merge* gate. This technique is about what arrives at the *plan*
gate, before authorship — say so in prose, do not duplicate either. Primary: Cockburn,
Elephant Carpaccio (workshop, late 2000s).

### 3. `objection-before-artifacts`

A separate reader chartered to disagree raises the strongest evidence-grounded
objections to a plan **before any implementation artifact exists**, and again against
the change before integration. The timing is the technique: once tests and code exist,
a premise-level objection costs "throw away the tests and the implementation", and
both humans and agents are subject to that sunk-cost pressure.

Rules to carry: an objection **without a quotable anchor in the plan is inadmissible**
(the reader wins nothing by volume; a hollow list the human dismisses in two minutes
is the review failing); a closed category set (premise, design, threat, failure,
operational, cost); two modes with distinct charters (plan-time premises, change-time
risks); the **hard gate** — the pipeline does not advance while any disposition is
`pending`; and the cross-mode signal (change-time objection counts rising → plan-time
charter too loose). The disposition-distribution reading (mostly rejected with
rationale = healthy; critical mostly accepted = plans arrive underprepared; low
severity mostly deferred = charter tuned to the unimportant; consistently empty =
read a few side by side) **now lives in `hitl-approval/decision-records`** as the
2026-08-28 amendment — cite it, do not restate it. Primary: Popper on
falsifiability for the epistemic basis; the source's "Adversarial Review" page for the
mechanism and the Promotor Fidei history it opens with (which the strip test removes).

### 4. `fresh-posture-self-challenge`

When a second agent is too expensive for the capability's maturity, one agent file
carries two postures — construct, then challenge — separated by an **explicit
segment boundary** that re-frames the second as someone else's work ("you are now the
challenger; disagree where the evidence allows"). The boundary is the mechanism;
collapse it and the challenge degenerates into the drafting context arguing for its
draft.

Rules to carry: a fixed question set per element (boundary — one thing or two smeared;
evidence — does the citation support the description; confounders — what nearby thing
is not this; confidence — overclaiming; specificity — codebase-specific or textbook);
**retained challenge notes** on every element rather than a discarded critique, so a
downstream reader can see what was challenged and revised; a **reserved sentinel
string** for "challenge ran and surfaced nothing", because an empty list cannot be
told from "challenge never ran"
([failure-not-empty-success](../knowledge/software-engineering/_laws.md#failure-not-empty-success));
and the **escalation ladder with its observable trigger** — one-context self-review →
fresh-posture single agent → two-agent dispatch, escalating when the sentinel-only
ratio across real invocations says the middle rung degenerated to self-confirmation.
Honesty the technique must keep: with no invocation corpus the trigger is a manual
read of a handful of outputs, and the technique says so.

The drafter should check `judgment-guardbands/self-audit-budget` and
`game-production`'s "no gate self-certifies" (do not link across bundles; name the
discriminator in prose) before writing this one — the corpus may already hold the
"a model may say the evidence is wrong, on a budget" half.

### 5. `informational-fold-in` (optional — drop if it does not earn its place)

A derived number the plan gate would benefit from (a cost range, a count of pending
stories, a coverage figure) folds into an **existing** human gate as an informational
field — no new gate, no extra keypress, no verdict, no agent writing a disposition —
and an unavailable number degrades the field to "unavailable" while the gate proceeds
exactly as before. Corollary the source stated well: **durability tracks confidence** —
the least-grounded estimate (a ballpark from raw task text) is surfaced once and
persisted nowhere, so a low-confidence figure never acquires the authority of an
artifact a later reader mistakes for fact; and a forecast is never co-located with
captured actuals.

Boundary: `cost-metering/preflight-estimation` owns the estimate itself and already
holds the advisory / soft-gate / hard-gate hierarchy; this technique owns only *where
in the review flow* an advisory number lands and the rule that it may not become a
gate by accretion. If the drafter finds this is one paragraph, put it in the golden
path and drop the technique.

## Boundaries the subject must NOT absorb

- **`hitl-approval`** — the pause: trigger predicates, durable pending state, the
  decision surface, decision records, continuation, fatigue countermeasures, consent,
  unattended mode, the SLA ladder. `plan-review` produces artifacts *for* that
  surface; it does not own the surface.
- **`machine-paced-delivery`** — the rate at which verdicts are demanded and whether a
  person can meet it. `decision-sized-slicing` reduces what arrives at the *plan*
  gate; the merge-gate arrival rate is not this subject's.
- **`proposal-not-push`** — the classes of change an agent may not author. This
  subject reviews plans; it does not decide what may be delegated.
- **`agent-chaining`** — handoff payload contracts between stages. The records here
  ride those contracts; their shape is this subject's, their transport is not.
- **`remediation-handoff`** — findings packaged into work for a coding agent. That is
  after the plan; this is before it.
- **`eval-harness` / `judgment-guardbands`** — scoring. No technique here produces a
  number that ranks; every output is a record a person disposes.
- **`agent-instruction-files`** — where a `promoted` story lands. Route to it; do not
  describe the file.

## What none of the proposed techniques may do

- Score the human, persist a record of the human's state, or gate automatically. The
  source's own category rule for these readers is "informs, challenges, surfaces, or
  warns — never fixes, writes, merges, or decides", and it is enforced there by
  denying the reader any write tool. The corpus's version is `hitl-approval`'s
  authority separation; inherit it.
- Re-mint the emit / persist / dispose ordering as a technique. It is
  `hitl-approval`'s and is cited.
- Carry a product, harness or agent name into any upper-layer file. The source is
  made of them (`carpaccio`, `advocatus-diaboli`, `choice-cartographer`, `HARNESS.md`,
  the harness's own command names); none survive into `knowledge/`.

## Open questions the drafter decides, not discovers

1. **One subject or two?** Slicing (technique 2) runs *before* a plan exists; the
   other three run *on* a plan. The source treats them as one discipline because
   they share the reader shape and the human stance. If the tree says slicing is
   planning rather than review, split it toward a planning subject and say so.
2. **Hard gate vs soft gate placement.** The source blocks plan approval on pending
   *objections* (untriaged risk) and lets pending *stories* (captured decisions)
   through to a merge-time block. That is a placement rule keyed by what a pending
   item *is*. Does it belong here, or as an amendment to `hitl-approval`'s trigger
   predicates? Decide, and state the boundary in both notes if it lands here.
3. **One closed disposition vocabulary or three?** Objections (`accepted` / `rejected`
   / `deferred`), stories (`accepted` / `revisit` / `promoted`), slices (`accepted` /
   `merged` / `dropped` / `revised`). The source keeps three because the stances
   differ. `one-authority-per-vocabulary` argues for one table with the per-record
   subset declared. Decide.
4. **Does technique 4 belong to `prompt-and-context`?** See the rejected placement
   above.
5. **An application.** No connected tree was opened this run. Before writing the
   application layer, check the project bridge for any tree that runs a plan-approval
   step for agent work; the strongest application is likely negative — a pipeline that
   approves plans whole, with no slice, objection or story record, is the
   "coherence trap" instance and proves claim 1 by its shape.

## What the run already landed that this spec builds on

- `hitl-approval/techniques/decision-records.md` — amendment: when the gated artifact
  is an objection, the disposition-distribution reading inverts. Technique 3 cites it.
- `machine-paced-delivery/techniques/human-gate-capacity.md` — amendment: at the
  one-person floor the gate's measures are a record about a person; count, never
  score. Not this subject's, but the reader who dispositions these records is the
  same person, and the golden path should point at it once.
