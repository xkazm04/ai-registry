---
layer: technique
type: technique
subject: pipeline-aging-and-attention-triage
technique: per-stage-aging-thresholds-not-one-global-cut
status: forged
laws: [meaning-does-not-live-in-a-label, a-candidates-process-never-stalls-on-your-constraints]
shared_with: []
use_when: [choosing staleness thresholds, a badge fires on every row, a board rename broke an alert]
---

# Per-stage aging thresholds, not one global cut

A single workspace-wide staleness threshold is the default implementation and
it is wrong in both directions at once. The worked contrast is the whole
argument: **ten days in an offer stage is a stall; ten days at intake is
normal.** One number cannot be both, so a global cut either screams on the
high-volume front of the funnel — training everybody to ignore the badge — or
stays quiet through the expensive late stages where silence costs an offer.

The rule: **every stage role carries its own threshold, and the thresholds are
published as a table, not scattered through the code that reads them.**

## Threshold by role, never by name

Thresholds key off the stable stage-role vocabulary — entry, screening,
interview, offer, terminal — supplied by the stage-modelling discipline, never
off a stage's display string. This is not a stylistic preference; it is
[meaning does not live in a label](../../../_laws.md#meaning-does-not-live-in-a-label).
A team renames a column on a Tuesday afternoon. If the aging rule matched on
the old name, it now matches nothing, or matches the wrong column, and there is
no error anywhere — the badge simply stops appearing, or appears on the wrong
rows, with full visual confidence. Hardcoded stage-name literals are the single
most reliable way to ship a triage surface that silently degrades to noise.

Practical consequences:

- A stage with no role mapping gets **no threshold**, not the global default.
  An unmapped stage is an unknown, and an unknown is not a licence to guess a
  number (see badges-degrade-rather-than-error).
- Custom stages a team invents inherit their role's threshold automatically,
  which is the point: adopting the vocabulary once buys correct aging forever.
- Two boards using different words for the same role get the same threshold,
  and the workspace summary stays comparable.

### The role lookup needs the board in scope

Keying by role is a statement about the *table*. It is only realised if the
**resolver can see the board being rendered**. Where the stage axis is editable
— a team composes its own columns — a stage identifier alone does not determine
a role, so a resolver whose inputs are the stage and the overrides has no way to
answer the role question, and it will answer the name question instead. Make the
axis a parameter of the resolution, passed by every caller from the board it is
rendering, rather than an ambient default that quietly resolves to the shipped
columns.

The failure this closes is hard to see, and that is what makes it expensive.
The shipped columns keep firing correctly, because theirs are the identifiers
the name-keyed table was built from. Only the columns a team *added* degrade,
silently and uniformly, to whatever the fallback cut is. The board looks alive,
the counts look plausible, and the teams who customised their funnel — the ones
most likely to believe the tool fits their process — are the ones flying blind.
Nothing on screen admits the change, because nothing failed.

One tell is worth checking on the same pass: a threshold editor that iterates
the *published* vocabulary rather than the board's own columns will offer inputs
for columns nobody renders, and none for the columns that are there. Two
surfaces derived from two different answers to "what are this board's stages?"
is the same defect showing twice.

## Shape of the table

The defaults want to be *legible*, so a recruiting lead can argue with them.
Publish them in one place, in days, ordered by role, with a one-line reason per
row. The shape that survives contact with real funnels:

| Role | Threshold | Why |
| --- | --- | --- |
| Entry / new arrivals | longest | high volume, batch triage is legitimate, most entries here are genuinely untouched by design |
| Screening | medium | a person has begun work; a week of nothing means it was dropped |
| Interview | shorter | scheduling is in flight and coordination decays fast |
| Work the candidate owes | at least as long as the step before it | the wait is their unpaid evening work, not your silence — see below |
| Offer | shortest | every day of silence measurably costs acceptance, and the candidate is almost certainly holding another process open |
| Terminal | none | see terminal-stages-never-age |

Absolute numbers depend on the funnel's volume and the market, and should be
stated with the reasoning that produced them rather than presented as
universal. What does not vary is the **ordering**: thresholds shorten
monotonically as the candidate invests more. The reason is not that late stages
are more valuable to you. It is that the candidate's cost of your silence rises
with every step they take toward you.

That reasoning also names the ordering's one principled exception: the stage
where **the next move is theirs**. A take-home, a case study, a portfolio they
were asked to assemble — the clock there is not measuring your silence, it is
measuring their unpaid evening work. A threshold set on the interview cadence
fires before a working person has had a weekend, and what it produces is a nudge
that reads as pressure applied to labour you are not paying for. Such a stage
takes a threshold at least as long as the step before it, derived from the size
of the work you asked for rather than from the stage's position in the funnel.

The test is not the stage's name but its direction: **who owes the next action?**
Where it is you, the ordering holds and the badge is a stall alarm. Where it is
the candidate, the count is a courtesy timer, and what it should prompt is a
check that they have everything they need — not an alert that they are late.

## Deriving a threshold honestly

Two defensible derivations, and one that is not:

1. **From the promise.** Ask what the team told the candidate, or would be
   willing to tell them: "you will hear within a week after an interview". The
   threshold is the promise, minus a working day so a human can act before it
   breaks. This derivation is the best one because it makes the threshold
   arguable in plain language.
2. **From observed distribution.** Take the stage's own historical dwell and
   set the threshold near the upper end of *healthy* completions — not the
   median, which flags half the board. Guard this with the sample discipline
   the funnel-metrics discipline owns; a stage with thirty observations does
   not have a distribution.
3. **Not from alert volume.** Tuning the number until the board looks calm is
   the failure this technique exists to prevent. If the alerts are unbearable,
   the pipeline is unbearable; the number is reporting correctly.

## Internal blockers do not pause the clock

A headcount freeze, a hiring manager on leave, an approval stuck in finance —
these are real, and none of them stop the count.
[A candidate's process never stalls on your constraints](../../../_laws.md#a-candidates-process-never-stalls-on-your-constraints):
the wait is happening to the candidate whether or not your reason is good. If a
team genuinely needs a hold, the honest mechanism is an explicit, attributed,
time-boxed hold state that the candidate is told about — not a threshold
quietly extended, and not a badge suppressed. A suppression with no expiry is
how an entry disappears for a quarter.

## Decision rules

- When a stage's role is known and its threshold is exceeded, mark the entry
  aging — do not act on it.
- When a stage's role is unknown, render no aging state at all.
- Resolve a threshold against the axis the entry's own board renders. A
  resolver that cannot name the board cannot name the role, and will silently
  fall back to matching the name.
- When a team asks for a longer threshold on a specific board, give them a
  documented per-board override rather than moving the default (see
  overridable-defaults-with-a-server-side-approximation).
- When the same role's threshold differs across two boards for no stated
  reason, that is drift, not configuration; reconcile it.

## When not to use this

- **Not for measurement.** If the question is "how long does screening take
  for this cohort", thresholds are the wrong instrument entirely; that is a
  distribution question with a sample requirement, owned by funnel metrics.
- **Not for stages with no waiting semantics.** A holding column a team uses
  for talent-pool warehousing is not a stage anybody is waiting in; give it a
  role that does not age rather than an enormous threshold.
- **Not as an SLA the candidate is shown.** A threshold is your internal
  trigger to look. Publishing it externally converts an operational nudge into
  a commitment you will miss on your worst week, which is worse than the
  vaguer promise you can actually keep.
