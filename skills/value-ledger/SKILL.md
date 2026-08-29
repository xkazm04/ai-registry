---
name: value-ledger
description: Model a product's value per user journey from its UAT Characters - time and money saved against the LLM-less way, risk avoided (mis-hires, wrong decisions, compliance exposure), and segment gates - normalized to a reference journey so the output ranks work by user value instead of by what a code scan found. Sits UPSTREAM of code-derived KPIs - a KPI worth adopting is one derived from a journey's modeled value - and gives an owner (human or agent) a value ledger to move. Scores a backlog item or finding by which journey's reachability, with-app cost or risk it moves. Modeled figures promote to measured when a real tenant walks the journey. Invoke with /value-ledger [init|run|score|promote|status] [args].
version: 0.1.0
category: workflow
memory: project
argument-hint: "init|run|score|promote|status [args]"
tags: value, kpi, journeys, characters, prioritization, roadmap, agent-motivation
---

# Value ledger - what a journey is worth, from the user's side

A code scan can propose KPIs, but it can only measure what the code already does. A
KPI derived from the code is a proxy of a proxy, and on a product with no production
users nothing can ever validate it. What predicts whether anyone pays is the USER's
economics: what the job costs them without the product, what it costs with it, how
often they do it, whether they can actually reach the surface - and what goes wrong
when the job is done badly.

This skill turns the Characters a `/uat` overlay already holds into that model. Every
Character declares the LLM-less time for their job as a number and a with-app
threshold ("if it takes longer than reading three CVs myself, I abandon it"). Those
declarations are the inputs; the ledger is the output; the ranking is the point.

Say it once per run: **a value you cannot model you cannot prioritize - and a
modeled value is a modeled value, never a forecast.**

## The model

Two axes plus a gate. All three are separate columns; none is ever folded into
another.

```
value(journey, Character) = time_money_saved + risk_avoided        [per period]

time_money_saved = frequency x reachability x (cost_without - cost_with)
                   cost = minutes at the Character's loaded rate (+ direct money)

risk_avoided     = frequency x reachability x (P_bad_without - P_bad_with) x cost_of_bad
                   e.g. a mis-hire at ~30% of first-year salary; a rejected offer's
                   restart; an indefensible decision's challenge cost

gate             = binary per segment: can this buyer buy at all without it?
                   (a sealed decision record for a regulated buyer, SOC 2 for
                   enterprise procurement). Contributes 0 to the number; decides
                   whether the segment is reachable. NEVER priced as a fine.
```

Why two axes and not one - measured on the reference repo (kp, 2026-08-29): the
time-only model ranked the three seed journeys correctly but priced every one of
the product's own differentiators (defensible reasoning, sealed decisions, structured
interviewing) at zero, because they save no minutes. It pointed at building the
competitor's sourcing pool - the one thing the product's teardown said not to build.
The risk axis quadrupled the structured-interview journey and put it within a
quarter of the top. Same order, different shape, opposite roadmap.

**Grain of salt is part of the format.** Currency lives only in the overlay's
assumptions, where it can be argued. The ledger's output is NORMALIZED to a reference
journey = 100, with a confidence per row. A reader who sees "77" reasons about
priority; a reader who sees "EUR 890/month" reasons about a forecast nobody made.

## Where UX and code quality land

They are not a third axis. They are derivatives of the two.

- **UX moves reachability and the with-app cost.** Each Character's adoption
  threshold IS the UX model. A UX finding is scored by which journey's reachability
  or with-app minutes it moves, and by how much - a confusing flow that pushes a
  hiring manager past their 15-minute threshold moves that journey's value to zero,
  which is enormous; a layout defect on a surface no Character reaches on a phone
  moves nothing.
- **Code quality moves variance, not value.** A quality item is worth
  `sum(journeys it protects) x P(regression it prevents) x value at risk while
  broken`. Most quality work scores low on this model, and that is correct: it tells
  you WHERE quality investment pays and sizes it to what it protects. Cheap hygiene
  does not need this justification; expensive quality work does.
- **A new journey scores nothing until it has a Character.** That is discipline, not
  a gap: writing the Character is the first design step of any new bet, and a bet
  that cannot produce one is a bet with no user.

## Inputs (all from the repo, none invented)

| Input | Source |
| --- | --- |
| Characters, with `Motivation - time saved` (LLM-less baseline, with-app threshold) and a `Surface binding` | `<uat>/characters/*.md` |
| Journeys, with definition of done and the Characters they serve | `<uat>/journeys/*.md` |
| Reachability | the latest `/uat` run's L1/L2 verdicts per journey; `unreachable` findings; nav/entitlement gating |
| Volumes, rates, cost-of-bad, probability deltas | the overlay's `assumptions.md` - OPERATOR-OWNED, never silently defaulted |
| Competitor journeys (optional) | a teardown doc naming the competitor's capability per journey |

If a Character lacks a numeric baseline, the run says so and scores that row
`unmodeled` rather than inventing a minute count.

## Procedure

`init` - create `<uat>/value/` with `assumptions.md` (a filled template of every
number the model needs, each with a one-line rationale and a `source:` - literature,
the Character's research, or "operator estimate"), and an empty `ledger.md`. Ask the
operator for the numbers the Characters do not carry: volumes per period, loaded rates,
cost of a bad outcome, baseline bad-outcome rate. Do not proceed on defaults.

`run [journeys...]` - for each journey, for each Character it serves:

1. Read the Character's LLM-less baseline and with-app threshold. Model the with-app
   cost honestly - the Character's TARGET is what they want, the modeled figure is what
   the current product plausibly delivers; say which you used.
2. Take reachability from the latest `/uat` verdict: L2-verified ~0.9, L1-pass ~0.8,
   L1-conditional ~0.6, L1-fail or a missing fixture ~0.3. State the source.
3. Compute `time_money_saved`.
4. Compute `risk_avoided` from the assumptions: which bad outcome this journey
   affects, the probability delta it plausibly buys, the cost. Cite the basis
   (structured interviews vs unstructured; reasoned screening vs skim).
5. Mark any `gate` the journey satisfies, per segment.
6. Sum per journey, note the dominant axis, assign `confidence` (high / medium / low)
   from how many inputs were Character-declared vs operator-estimated.
7. If a competitor teardown exists, walk the SAME Character through the competitor's
   journey and record the delta per axis - not as a number, as a direction and a
   reason ("they win the sourcer's hours; we win the recruiter's defensibility").

Then normalize: the reference journey (overlay-named, default the highest) = 100.
Write `ledger.md`: one row per journey with `time · risk · gate · reachability ·
normalized · confidence · state (modeled|measured) · dominant axis`, and a per-Character
breakdown below it. Append the run to `runs/<date>.md` with every intermediate figure,
so the next run can diff against it.

`score <item>` - a backlog item, finding, or feature proposal. Answer three questions
and nothing else: which journey(s) it touches; what it moves - `delta_reachability`,
`delta_with_app_cost`, `delta_risk` - and by roughly how much; what that is worth in
normalized units. A UX item usually moves the first two; a quality item is scored as
protection (journeys x P(regression) x value at risk). An item that touches no journey
scores 0 and says so - that is the result, not a failure of the skill.

`promote <journey>` - a real tenant has walked the journey. Replace the modeled
`cost_with` and reachability with the measured ones, keep the modeled figure beside
them, set `state: measured`. The first production tenant does not validate the KPIs;
it validates the MODEL, one journey at a time, and the gap between modeled and measured
is the calibration signal for every other row.

`status` - the ledger, the date of its last run, which rows are measured, which
Characters are unmodeled, and the assumptions' last edit.

## Relationship to code-derived KPIs and to agent owners

This skill sits UPSTREAM of `/project-populate`'s KPI lanes and of any KPI-value
simulator (Personas' `kpi-sim` lane simulates the VALUES of already-adopted KPIs; it
does not decide which KPIs deserve adopting). A KPI worth adopting is one DERIVED from
a journey row here - "minutes saved on jd-to-shortlist per recruiter-week", "mis-hire
rate on roles that went through structured prep" - so that by construction a KPI is
something a customer would recognize as worth paying for. Feed the derived KPIs into
the adoption lane; do not let the adoption lane propose KPIs from the code alone.

For an owner - human or agent - holding a role over the product, the ledger IS the
value ledger their motivation contract reads: "which journey's value can I move this
cycle?" is an objective a product owner would recognize, where "which scan-proposed
KPI can I move?" was not. A human and an agent owner of the same seat are scored on
the same journey-value deltas, which is what makes a blended-population rubric honest.

## Output format

`ledger.md` (the current truth):

```
| journey | time | risk | gate | reach | value | conf | state | dominant |
|---|---|---|---|---|---|---|---|---|
| jd-to-shortlist | 65 | 35 | - | 0.7 | 100 | medium | modeled | time |
| interview-schedule-prep | 19 | 58 | - | 0.6 | 77 | medium-low | modeled | risk |
| cv-analysis-jobfit | 12 | 31 | sealed-record (regulated) | 0.9 | 43 | high | modeled | risk |
```

Units in `time` and `risk` are normalized too (reference journey's total = 100), so
the two axes are comparable at a glance and no currency appears. The assumptions file
is where the euros live.

## Project overlay

`.claude/value-ledger/config.md` in the consuming repo:

| Key | Default | Meaning |
| --- | --- | --- |
| `uatRoot` | `uat/` | Where Characters and journeys live |
| `valueRoot` | `uat/value/` | Where `assumptions.md`, `ledger.md`, `runs/` live |
| `referenceJourney` | highest-value | The row normalized to 100 |
| `period` | `month` | The period every figure is per |
| `competitorTeardown` | none | A doc to walk the competitor half against |

The skill runs on the defaults; the assumptions file is the one thing it will not
default, because those numbers are the operator's claim, not the model's.

---

<!-- clause: skill-reflection v2 - stamped by scripts/apply-skill-clauses.mjs from docs/skill-clauses/skill-reflection.md; edit the template, then re-stamp -->
## Skill Reflection

After the run's real work is done, reflect - autonomously, without asking the user. Be honest about volume: most runs produce NOTHING beyond lane 1. An empty reflection is a valid result; a forced lesson is pollution. Calibration: nothing (common) / one line (sometimes) / a lesson entry (occasionally) / a redesign proposal (rare).

**Lane 1 - PROJECT learnings** (what the next session in THIS repo needs). Repo-specific rules go to this skill's overlay in the consuming repo - a dated one-liner under `## Skill improvement log` in `.claude/value-ledger/config.md`, or in the overlay/vault location this skill's `## Project overlay` section names (create the heading on first use). When the repo carries a `.personas/` directory, also write via the MEMORY BLOCK contract if this prompt carries one, else append node lines to `.personas/memory-outbox.jsonl` per that contract. Never into this file: a project's bytes in a shared method are exactly what made the fleet's copies diverge.

**Lane 2 - METHOD learnings** (what would improve THIS SKILL for every project):
1. If nothing generalizes beyond this repo, stop here.
2. Append to `LESSONS.md` in this skill's directory: `## <version-used> - <YYYY-MM-DD> - <project-name>` followed by `- ` bullets (create the file with a `# Lessons - value-ledger` heading if absent). Record the version the run USED, not a bump target. Wrap a bullet in a `### Redesign proposal` sub-block when it argues for a redesign you are NOT applying now. A lesson alone needs no version bump.
3. Edit `SKILL.md` only together with a version bump, and bump only with an applied edit: patch for wording, minor for a step/prompt refinement, major for a methodic redesign. Update the `version:` frontmatter. Never edit inside a stamped `<!-- clause: ... -->` block: that text is shared by every skill in the lane and is changed in the registry's `docs/skill-clauses/` and re-stamped with `node <registry>/scripts/apply-skill-clauses.mjs`.
4. Where the edit lands: THE SKILL DIRECTORY IS A LINK INTO THE REGISTRY. `.claude/skills/value-ledger` in a consuming repo is a symlink to `<registry>/skills/value-ledger` (registry root = `registry.local` in `.ai/manifest.yaml`, default `../ai-registry`; `$AI_REGISTRY_DIR` wins). Editing it edits the one file every project runs, so there is nothing to propagate. Commit it IN THE REGISTRY checkout as a standalone commit containing only this skill's files: run `node <registry>/scripts/check-skills.mjs --since HEAD` first (shape + version discipline must pass), then `git -C <registry> add skills/value-ledger` and `git -C <registry> commit -m "skill(value-ledger): v<new> - <one-line reason>"`. Never stage the link from the project side.
5. NEVER copy this skill to `~/.claude/skills/value-ledger/` or into another repo, and never "propagate" by copying. A copy in the personal tier shadows the lane for every project on the machine and freezes the method at that day's bytes with no version to compare (measured 2026-08-29: 11 such copies, all unversioned, all stale). If `.claude/skills/value-ledger` is a real directory instead of a link, the fix is `node <registry>/scripts/link-registry.mjs`, not a copy in either direction.

**Lane 3 - DOMAIN knowledge** is a different artifact from a lesson: a lesson improves this METHOD, a lead proposes knowledge for a bundle. Skills that carry a `## Knowledge sync` section file leads there; a skill without one files none.
<!-- /clause: skill-reflection -->
