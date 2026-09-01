---
source: youtube:rPWCYB62wvI
kind: first-party practitioner account (doctrine talk - a framework the speaker developed; no system, no artifact, no measurement)
url: https://www.youtube.com/watch?v=rPWCYB62wvI
title: "Agentic Engineering Operating Level: WHERE to FOCUS your AGENTS?"
author: IndyDevDan (channel; 15+ yr engineer, sells a course on the subject)
mined_on: 2026-08-31
words: 7937
skill_version: 1.4.0
extracted: 14
picked: 3
accepted: 2
declined: 0
already_covered: 2
leads: 2
untriaged: 7
dispatched: 0
applied: 2
shipped: 0
fetches_spent: 0
run_id: intake-rpwcyb
siblings: 5
---

# A doctrine talk that strips perfectly and corroborates not at all

Part of [[index]].

## The class reading, which is the reusable half

A first-party practitioner account by the taxonomy, but the sub-shape matters more
than the row: this is a **doctrine talk**. The speaker presents a framework he
developed over a career, and in 7,937 words there is **no system walkthrough, no
artifact, no number and no n=1**. The last third is a course pitch.

That inverts the intake economics this method is tuned for. A news roundup is made
of proper nouns and dies on the strip test; the corroboration budget is spent on
the few claims that survive it. **This source strips almost perfectly** - the
operating-level ladder is proper-noun-free by construction, and so are its decision
rules - **and corroborates almost not at all**, because nothing in it was ever
measured. Everything survived the cheap filter and nearly everything died at the
expensive one.

Worth carrying as a class note: **for a doctrine talk, run corroboration first and
the strip test second.** The strip test does no triage work here, and running it
first spends attention ranking candidates the corroboration table was always going
to refuse.

Expected yield was stated before the table as 1-2 amendments, several catches, no
new subjects. That is what it produced.

## Board

5 siblings live at Phase 0, holding `optional-dependency-degradation`,
`supply-chain`, `agent-cli-transport`, `quality-gates`, `measurement-honesty`,
`dead-code`, `test-harness`, `test-input-generation` and `codebase-scanning`. None
held a subject this run named. One near-collision worth recording anyway: a sibling
landed `react--oracle-before-gate` earlier the same day against the review-queue
seam this run opened first. Moving to a different seam in the same technique was the
right call and cheap, because the sibling's file was already in `HEAD` - the
duplication was visible before any drafting.

## Accepted

### 1. Descend an altitude - the fourth resolution [00:23:52]

**Landed** as an amendment inside
`llm-agent/orchestration/hitl-approval/techniques/oracle-before-gate`, plus the
one-line golden-path summary that enumerates the same resolutions.

The technique declared its own completeness - *"There are three honest resolutions
and the gate is not among them"*: build the oracle, narrow the task, withhold the
delegation. An enumeration invites exactly one question, and the source's vaguer
rule (*"if you cannot delineate good outcomes and bad outcomes, you got to go
down"*) supplied a candidate fourth.

It survived because the technique's **own examples** refuse to narrow. A refactor
plausible on every line, split six ways, is six refactors plausible on every line;
a configuration change whose effect appears three environments away is not repaired
by a smaller configuration change; a translation into a language the reviewer does
not speak does not become checkable at one string. Four for four, narrowing
produces *more* unverifiable items. Descending changes the artifact class instead
of its size, and an oracle appears - the signature diff, the schema, the citation
span, the placeholder parity.

So the distinction landed as the amendment's spine: **narrowing keeps the artifact
class and reduces its scope; descending keeps the scope and changes the artifact
class.** With the failure that follows from confusing them - narrowing an item that
is opaque *in kind* multiplies the `no-oracle` count while every queue metric
improves, which is the armed gate's dishonest arithmetic arriving by the other road.
And with the constraint that makes descending honest: state what the lower verdict
does not cover, because a verdict inherited upward is the rubber stamp again with
evidence attached to the wrong claim.

**The source authorized none of this.** It located the move and named it badly; the
finding is written from the corpus's own examples read against its own enumeration.

### 2. The model owner holds two causes and one response [00:26:50]

**Landed** as an amendment inside
`llm-agent/evaluation-and-cost/eval-harness/techniques/failure-attribution`.

The source's claim: *"Out of distribution isn't just what the model doesn't know.
It's also things you have to actively fight against."* It then declines to give
examples, which makes the claim unfalsifiable as delivered - and its prescribed
repair (go down and teach it, "increase the distribution") is **wrong for the half
it just discovered**, since a trained constraint is exactly what teaching does not
move.

The finding was written against the corpus instead. `failure-attribution` also
declares its own completeness - *"Every failing case is owned by exactly one of
these"* - and its **Model** row prescribes *a different model, or an accepted
limit*. That is written as if the residual had one cause. It has two: absent
capability, whose failure is **graded** (tracks difficulty, moves on examples), and
a trained constraint, whose failure is **sharp** (same boundary at every difficulty,
no movement on examples). A stronger model is right for the first and a wasted
re-baseline against the second, because the constraint travels with the training
rather than the ceiling.

The file already held the same shape one step away - its pre-run row exists because
the funnel *under*-attributes and prescribes the most expensive available response
for a class no model can fix. This is the mirror: the attribution is **correct** and
the prescription still wrong. The amendment names the direction the misreading takes
- a class that does not move under stricter instruction reads as a *prompt* failure,
so the cases go back up the funnel and accrete a compensation that no upgrade
retires, because it was never a defect.

Corroboration: **training-data convergence**, stated honestly. That frontier models
carry trained behavioural dispositions stable under prompting and distinct from
capability is reached without this source in front of me, and the graded/sharp tell
is checkable in any harness. Zero fetches spent.

## A catch, and why it is the good kind

The source is **contradicted on both accepted rows and located both of them anyway.**
On the first it gave a direction with no mechanism; on the second it gave a mechanism
that is backwards. Four prior runs said a source that implements a good idea badly is
worth more than one that implements it well, and this run is the cleanest instance
the ledger has: neither finding could have been written from the source, and neither
would have been looked for without it.

## Already covered

- **A gate needs a fitness function; if you cannot separate good outcomes from bad,
  do not proceed** [00:23:52 lead-in] - `oracle-before-gate` says it with far more
  precision (consequence and verifiability as independent axes, the four-cell table,
  `no-oracle` as a recorded token). The source's version is the same claim without
  the second axis named.
- **A plan is a prompt scaled up** [00:16:40] - `plan-review` owns the payload
  question and states the boundary better; `prompt-assembly` owns the assembly half.

## Untriaged - extracted, reached the table, nobody verified

Recorded with anchors so a later run does not re-derive them. **No judgment attaches
to any of these**; the operator picked 1, 2 and 6, and these were not among them.

| # | Claim | Anchor | Read at triage |
| --- | --- | --- | --- |
| 1 | Name the operating altitude before pointing an agent - a ~17-level ladder in 5 bands (line/block/function/type/class - file/module/directory - db/table/script/CLI - application/repo/plan/docs - agent/workflow/factory), with leverage and control trading monotonically along it | [00:01:18] | real gap, unauthorizable at technique altitude - see the lead below |
| 3 | Capability is the **range** you can move through, not the ceiling you reach; retain bidirectional movement | [00:09:28] | partial |
| 4 | Leverage is gated on prior descent - "you cannot scale something you do not understand" | [00:09:03] | thin (slogan; the operational version is accepted row 2) |
| 5 | Three occurrences is the automation trigger; escalate skill -> reusable agent -> workflow, and only for cost and scale | [00:21:19] | partial - a concrete number with no measurement behind it |
| 7 | The schema is the one altitude you may not delegate on a long-lived product - "a lot of the product is the data" | [00:18:46] | likely catch |
| 11 | Generated interfaces converge on a recognizable house style; when differentiation matters, descend | [00:24:17] | partial - unmeasured, and the interesting half (that the signature is *detectable*) is an assertion |
| 12 | Operating range is per-**domain**, not per-person: switching domains resets it regardless of engineering skill | [00:20:28] | partial |

Rows 8, 9, 13 and 14 (types as the low-water mark; media-rich plans and docs;
"levels beyond the factory - dark factory, RSI"; "any engineer writing lines by hand
is cooked") were unmeasured assertions with no protocol, and are recorded here only
so nobody re-derives them.

## Leads

- **The operating-altitude ladder as a subject.** Row 1 verified as a **real seam,
  not a hole**: the corpus partitions this ground three ways and states each boundary
  explicitly - `hitl-approval` owns the gate, `plan-review` owns *"what does the
  person read when it stops **at a plan**"* and explicitly declines what may be
  delegated, `machine-paced-delivery` owns the rate, and `proposal-not-push` owns
  which *classes of change* need a human author. All four key on consequence or on a
  given artifact. **Nothing owns the choice of artifact class itself** - the stage
  before all of them. The part this run could authorize landed inside the
  `oracle-before-gate` amendment, because altitude is what decides which oracles
  exist. The rest stays a lead: a doctrine talk with n=0 cannot author a subject, and
  writing one from it would be this method's named anti-pattern. **Return condition:
  a second independent source reaching the altitude framing, or a managed project
  whose tree shows the decision being made somewhere.** Two sightings promote it to a
  spec.
- **Trained constraint as a first-class routing input.** `model-routing`'s
  `capability-floors` insists a floor is a measurement rather than a fear, and its
  whole vocabulary is capability - can and cannot. The amendment landed the
  diagnostic half in `failure-attribution`; whether a *router* should carry a
  will-not floor beside its cannot floor is a separate question this run did not
  open. **Return condition: a project whose roster shows a class of work being
  re-routed after a refusal rather than after a capability miss.**

## Apply

Two amendments landed, two rows owed, two written - see [[../applied]].

- `oracle-before-gate` -> **personas**, mode `experiment`, verdict **better**. The
  descend move is already implemented there and the *stating* half is not; both arms
  ran over 13 real catalogs.
- `failure-attribution` -> **tracklight**, mode `simulation`, verdict **better**.
  Highest reachable mode: the eval store's schema can express the graded/sharp split
  and holds no scored rows, so there is nothing to count. Three real cases from the
  tree decided it.

Ship 0 for both: the triage answer named no project, and Phase 8 requires the
operator to confirm before a project tree is touched. Nothing in either tree was
modified; both arms were read-only.

## Instrument note

`research-map` was near-useless on this source, and the reason is worth recording.
The candidates are all doctrine, so their terms are abstractions - "altitude",
"leverage", "control" - and the index matches slugs. Every call returned semantically
unrelated hits with high scores (`ui-controls` for "leverage control tradeoff";
`nonprofit-verification` for "verification ability"). The homes were found by reading
four subjects' **stated boundary paragraphs**, which is what this corpus writes them
for. For a doctrine source, the map locates the neighbourhood at best; the boundary
statements do the work.
