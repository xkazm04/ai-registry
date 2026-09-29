---
layer: golden-path
type: golden-path
subject: pipeline-stage-modelling
status: forged
use_when: [designing or editing a hiring board's stages, writing a rule or metric that depends on where a candidate is, letting a team rename or reorder its own pipeline, removing or merging a stage]
techniques:
  - stage-role-vocabulary-not-stage-names
  - entry-and-terminal-role-requirements
  - screening-gate-index
  - retired-stage-tombstones-and-migration
  - off-axis-candidate-recovery
  - one-sentence-meaning-per-stage
---

# Pipeline stage modelling

A hiring pipeline looks like the simplest object in the whole domain: an
ordered list of columns with names on them. It is not. It is the coordinate
system that every other part of a hiring system quietly resolves against —
which moves are legal, which candidate is waiting on whom, what an automated
screen is allowed to do, what "advanced past screening" means in a fairness
report, which rows a benchmark may compare. The moment you let a team edit
that list — and every team wants to, because their process is theirs — you
have made the coordinate system user-generated content.

The whole subject is one discipline: **separate the axis a team edits from
the axis the product reasons over.** A stage is two things wearing one badge.
Its *label* is a display string: renameable, translatable, reorderable, the
team's to own absolutely. Its *role* is a member of a small closed vocabulary
the product defines and the team merely assigns. Every rule, gate, metric and
message keys off the role. Nothing — not one line of logic, not one report —
keys off the label. This is the sharpest instance in the whole bundle of
[meaning does not live in a label](../../_laws.md#meaning-does-not-live-in-a-label),
and the general lesson generalizes far past boards: any user-editable
taxonomy that logic reads needs a stable half, or the users are editing your
logic.

## What a stage actually is

A stage on a well-modelled board carries six properties, and only the first
belongs to the team alone:

1. **A label** — free text, in the team's language, sized for a column
   header. Consumed only by human eyes.
2. **A role** — one value from the closed vocabulary. Consumed by everything
   else.
3. **A stable identity** distinct from the label, so a rename touches no
   stored row. The identity need not be pretty and need not be minted: if
   today's stage names are already what is stored everywhere, *freezing them
   as identifiers* and adding an editable label beside them buys the entire
   property with no data migration. Minting fresh slugs for elegance forces
   a rewrite of every candidate row, every history event and every external
   field mapping for zero behavioural gain.
4. **A position** — its index in this team's ordering. Positions are relative
   and team-local; they are never a semantic constant.
5. **One sentence of meaning** — what a candidate sitting here is actually
   waiting for, authored once and shown wherever the label alone would be
   ambiguous.
6. **A lifecycle state** — live, or retired-with-history. A stage that has
   ever held a candidate cannot simply cease to exist.

A pipeline that stores only (1) and (4) is the naive model, and it is the one
almost every system starts with, because for the first year there is exactly
one board and its column really is called what everyone calls it.

## One decision point, one stage: a stage is a place a person can stand

Before any of the machinery, one structural rule decides whether an axis is
modellable at all. **A candidate is always standing on exactly one stage, and a
stage ends in one decision about whether they go on.** The tempting alternative
— one interview column that contains two or three rounds, each of which can end
the process, configured behind it — is a common way a board stops describing
reality. Where is a candidate who finished round one and passed? Nowhere the
board can draw. The configuration exists, the interface cannot render it, and
every dwell, conversion and aging figure over that column averages people in
incomparable states.

Three rounds with a pass or fail between them means three stages. If a team
wants an automated round, then a scored pass, then a human panel, that is three
columns they add, name and order — the same gesture they already use for
everything else, and it produces a board a candidate can genuinely occupy. This
is also the argument that settles the `scoring` question below: any activity a
candidate waits through deserves a column, and hiding it behind another
column's configuration is how it becomes invisible.

The rule is about decisions, not about activities, and an earlier statement of
it ("exactly one activity") was wider than the evidence. Shipped systems put
several interviews in one stage, and the practitioner guidance found draws the
line at the decision point: an onsite of several interviews is one stage when
they all happen whatever any one of them says, and a stage that hides a
pass-through between a recruiter call, a manager call and a team call is three.
Two independent readings reached the same boundary, one from training alone
(rounds as children of a gate, with their own timestamps) and one from the
vendors' documents. So: the interviews inside a parallel loop are children of the
stage and may carry their own timestamps and scorecards; a round that can end
the candidate's process before the next begins is a stage. No source measured what
the stacked column does to dwell or conversion, so the harm above is argued, not
measured.

## The closed role vocabulary

Seven roles carry the semantic load of a hiring funnel:

| Role | What a candidate here is waiting for | Product meaning |
| --- | --- | --- |
| **entry** | Nothing yet — they have arrived | The one place a new applicant lands; the head of the axis |
| **screening** | A first-pass judgment on their evidence | A filtering step, before anyone has given the candidate a real look |
| **homework** | A work-sample the system set and will evaluate | Product-run generation and evaluation, before the gate but not a screening step |
| **scoring** | A produced assessment to be ratified | A distinct thing the system *does* and a human *approves* |
| **interview** | A conversation with a person | Human evaluation in progress |
| **offer** | A decision about terms | Approval here *extends* an offer; it does not conclude the hire |
| **terminal** | Nothing — their process is over | Hired, and where closure is a stage rather than a status (below) rejected and withdrawn: absorbing, and refuses onward moves |

Plus one escape hatch, **custom**, for the stage a team genuinely needs and
the vocabulary does not model — a client-approval step, a security clearance
wait, a portfolio review a particular studio runs. A custom stage
participates in **ordering and nothing else**. It is never a gate boundary,
never terminal, never counted as screening, never a place an automated action
fires. It exists so that a team's real process fits on their board without
their improvisation leaking into anyone's semantics.

The vocabulary is closed, not frozen, and the test for adding a member is the
one that made `scoring` a role: the product does distinct work there, someone
ratifies it, and a candidate genuinely waits. A work-sample step passes all
three, which is how **homework** earned its place rather than living as a
`custom` column: the system generates the assignment on entry, sends it and
evaluates what comes back. It also shows what a new role costs. It sits before
the screening gate, yet nothing triages evidence there, so "before the gate" and
"a screening stage" stop being the same set (see
[screening-gate-index](./techniques/screening-gate-index.md)). Every consumer
that enumerated roles owes a decision for the new one, which the closed
vocabulary makes visible at authoring time and an open one would not.

Two design decisions inside that table are worth defending explicitly,
because both are frequently argued the other way.

**Why `scoring` is a role and not a property of `interview`.** The tempting
model treats "assessment produced" as a flag on an interview stage. Three
things make it a stage in its own right. It is a distinct thing the product
*does* — generating, scoring, or transcribing an assessment is work with its
own success and failure. It is a distinct thing a human *ratifies* — someone
reads the output and decides whether it stands, which is a decision with an
actor. And a candidate genuinely *waits* there, sometimes for days, which
means it has dwell, it can stall, and a person can be forgotten in it. Any
step with its own work, its own approval, and its own queue is a stage.

**Why `terminal` is one role and not three.** Hired, rejected and withdrawn
differ enormously for reporting and for the candidate, and a well-built board
stores that distinction — but as an *outcome* on the terminal stage, not as
three roles. The behaviour the vocabulary governs is identical for all three:
no onward move, no aging, no automated action, excluded from every in-flight
count. Split them into roles and every consumer must enumerate all three —
so the day a fourth outcome appears, every such rule is silently wrong.

**Where a closure lives is a modelling choice, and it moves every rule that
reads a position.** The table above puts a concluded process on the terminal
stage. The other shape in shipped use keeps closure as a *status beside the
stage*: a rejected or withdrawn candidate keeps the stage they were rejected
from, and only the success end (or nothing at all) is a stage. Neither is
wrong; they lose and oblige different things.

- *Closure as a terminal stage* loses *where* the process ended unless the
  outcome records a rejected-from stage, and it makes "past the gate" need the
  outcome resolved before the position
  ([screening-gate-index](./techniques/screening-gate-index.md)).
- *Closure as a status* keeps the last stage for free, so position alone is the
  honest answer for a rejected candidate. It obliges the opposite: every
  in-flight count, aging clock and automated action must filter on status, or
  a candidate who was rejected is counted as still waiting in a screening
  column; and every rate over *who entered* must include closed candidates by
  their kept stage, or the people the filter removed drop out of the
  denominator and the rate flatters the process.

Pick one per board and write it down. The failure is a system that has both a
status and a terminal move and consumers that each assume the other one.
Both shapes ship: the applicant-tracking systems read keep a lifecycle status
beside the stage (rejected, withdrawn, hired), and one types `Archived` as a stage.

Closure is not one bucket either way. A rejection is a non-selection and stays in
the denominator of every step it followed; a voluntary withdrawal is treated by at
least the US selection-procedure guidelines as ending the person's standing as an
applicant from that moment, so it leaves the denominator of the steps after it. A
board that stores both as "closed" cannot compute a rate under a regime that
distinguishes them. Store the outcome (rejected, withdrawn, hired) and the stage
they closed from, and let the rate name which population it used.

## The three consumers, and why they need different things

An axis is read by three populations with incompatible needs, and most stage
bugs are one population served the other's view.

- **Recruiters** need labels, order, and the sentence of meaning — nothing
  else, and they should be free to change all of it.
- **Rules** — legal moves, automated screening permissions, offer approval,
  notification copy — need the role and only the role. A rule that reads a
  label is not a rule; it is a coincidence waiting for a rename.
- **Measures** — fairness rates, conversion, cross-team benchmarks — need the
  role *and the position*, because "past the screening gate" is a comparison
  against a boundary that sits at a different index on every board.

The failure has a signature: a rule or metric answers a *different question*
after a purely cosmetic edit, and nothing errors. A fairness rate defined as
"reached the stage named a certain thing" measures a different population the
day that column is renamed; a move menu that hides one named stage starts
offering an illegal move the day a board is translated; a benchmark indexed
off a name compares one team's third column to another's fifth. No exception
is thrown. The number simply becomes a lie with a chart under it.

## The axis is a schema, and edits to it are migrations

Once you accept that logic reads the axis, the axis stops being configuration
and becomes a schema — with everything that implies:

- **Adding** is safe, provided the role is assigned at creation. A stage with
  no role is not a smaller stage; it is an unresolvable one, refused at write
  time rather than defaulted — a default role is a quiet guess about a team's
  process, wrong exactly where that process is unusual.
- **Reordering** preserves the role constraints: entry first, terminal last,
  and a role-derived gate moves with them rather than being pinned to an
  index someone hardcoded.
- **Renaming** is free and total. If any behaviour changes when a label
  changes, the model is broken, and the fix is the reader, never the rename.
- **Removing** is a migration in the ordinary database sense: the occupants
  go somewhere a human chose before the axis is rewritten, and the historical
  record keeps resolving afterwards. Nobody is stranded silently — not the
  candidate who was in that column, and not the audit row naming it. "Keeps
  resolving" has to reach the measures and not only the labels, and the
  migration has to be the only door: a second endpoint that accepts an axis with
  a column missing turns the guarantee into a convention.

Treating an axis edit as a migration is what makes "rename, split or reorder
your board freely" an honest promise rather than a reckless one.

## Comparability across teams is a role problem, not a normalization problem

The instinct when comparing pipelines across teams is to map everyone onto a
canonical funnel. Resist it. One team's "Onsite" is another team's
"Interview"; one runs two screening stages and another runs none. Forcing
those onto a shared axis produces rates over populations that never existed.

The rule: **every row is judged against its own team's axis first**, and only
role-level aggregates cross the boundary. "Fraction who cleared this team's
screening gate" is comparable across teams because the gate is defined by role
on each board independently. "Fraction who reached column three" is not
comparable and never was.

Read precisely, this does not refuse a shared spine. Every shipped system that
reports across pipelines keeps one, small and stable (three to six buckets in the
ones read), above each team's own stages, and the role vocabulary here is that
spine. What is refused is the spine defined by *position or name*, which is
what a product falls back on when it has no roles and asks its users to keep stage
names and order consistent by convention. The spine may be coarser than the seven
roles for a given report; it may not be looser than the roles about which stage
belongs to it.

## Stale references and candidates off the axis

An editable axis will be referenced by things that do not know it changed: a
saved filter, a bookmarked view, a link mailed last month, an integration
writing stages by identifier. The honest behaviour is never silence and never
a redirect that pretends. Show what was asked for, say plainly that it is not
on this board, offer the way back. The same discipline covers candidates found
sitting in a retired or unresolvable stage: surfaced as needing placement, not
hidden because a query filtered on live stages. A person invisible to their
own recruiter because of a configuration edit is the exact stall
[a candidate's process never stalls on your constraints](../../_laws.md#a-candidates-process-never-stalls-on-your-constraints)
forbids.

## What the stage model does not own

**Aging, staleness and attention.** How long is too long in a given stage,
which cards a recruiter is shown first, what earns an alert — those are a
neighbouring discipline's, and it keys its thresholds off the roles defined
here. The seam is clean: this subject says *what a stage means and which
role it plays*; the aging-and-attention discipline says *when time spent in
that role becomes a problem worth surfacing*. If you find yourself putting a
day count in the role vocabulary, you have crossed the seam. Two placements
are on the right side of it: the default cadence per role lives in the aging
discipline's own table, keyed by role, and a team's own cadence may ride on its
stage as an optional field that the aging clock reads before the role default.
The stage says how long the team tolerates; only the aging discipline says what
that means.

**Conversion bases and denominators.** What counts as an entry into a stage,
which cohort a rate is computed over, how skips and backward moves are
handled — the funnel-measurement discipline's, resting on the identity this
subject provides.

**Whether a candidate should advance.** Selection, scoring and fairness
gating are their own disciplines. This subject only guarantees that when they
say "past screening", every board agrees on what that means.

## Failure modes this standard exists to prevent

- **The string comparison.** A rule, filter or metric matching a display
  name. It works until the first rename, then answers a different question
  forever, with no error.
- **The hardcoded index.** "Screening is column two" — true on the board it
  was written against, false on the next team that adds a stage.
- **The default role.** Assigning an unroled stage a plausible role instead
  of refusing it: an invisible guess, wrong exactly where a team's process is
  unusual
  ([absence of evidence is not evidence](../../_laws.md#absence-of-evidence-is-not-evidence)).
- **The custom stage with powers.** The escape hatch acting as a gate or a
  terminal, so a team's private step changes what their fairness numbers
  count.
- **The orphaning delete.** Removing a column and leaving candidates, audit
  rows or links pointing at nothing — usually discovered by a candidate
  disappearing from the board.
- **Terminal as a waypoint.** A board that lets candidates be moved into or
  out of a concluded state by hand, so every terminal count is provisional
  and every hire is a claim nobody's acceptance backs.
- **The stacked column.** Several rounds configured behind one stage, so a
  candidate between them is standing somewhere the board cannot draw.
- **The fold into column one.** An unresolvable stage quietly rendered at the
  head of the funnel. Defensible while the axis was a constant — visible and
  slightly wrong beat invisible — and the worst available option the moment
  teams can remove columns, because a dozen candidates reappearing at the top
  is indistinguishable from a mass reset, with nothing on screen saying what
  happened.
- **The one-sentence gap.** A column whose meaning lives only in the head of
  the person who created it, so two recruiters use it for two different
  things and the metric over it means neither.
- **Cross-team normalization by position.** Comparing column three to column
  three and calling it a benchmark.
- **The gate as the whole screening set.** Treating every column before the gate
  as a screening stage. A homework, scoring, custom or early offer column can sit
  before the first interview and nothing there triages evidence; the set an
  automated screen may act in is the entry and screening roles *intersected* with
  the gate. Executed in one shipped implementation, the wider set offered the
  screen at a custom column, and a permission table that read the default axis let
  a screening-role column *behind* a human interview move a candidate on while the
  same table made the screen inert on every renamed board.
- **The tombstone that resolves a label and nothing else.** A retired stage kept
  for display while every measure treats a row standing on it as unresolvable: a
  candidate rejected after an interview, on an Interview column since removed,
  counts as never having advanced.
- **Closed, but as one bucket.** Rejected and withdrawn stored as the same
  outcome, so no rate can follow a regime that counts them differently.

## The techniques

- [stage-role-vocabulary-not-stage-names](./techniques/stage-role-vocabulary-not-stage-names.md)
  — the closed role set, why it is closed, and how to resolve every rule
  through it.
- [entry-and-terminal-role-requirements](./techniques/entry-and-terminal-role-requirements.md)
  — the well-formedness invariants an axis must satisfy, and what enforces
  them at edit time.
- [screening-gate-index](./techniques/screening-gate-index.md) — deriving the
  gate boundary from roles so "cleared screening" survives any board edit.
- [retired-stage-tombstones-and-migration](./techniques/retired-stage-tombstones-and-migration.md)
  — removing a column without stranding a person, a record or a link.
- [off-axis-candidate-recovery](./techniques/off-axis-candidate-recovery.md)
  — what to do with a reference to a stage this board does not have.
- [one-sentence-meaning-per-stage](./techniques/one-sentence-meaning-per-stage.md)
  — the authored sentence that makes a column's meaning legible to
  recruiters, candidates and the next person to edit the axis.
