---
layer: technique
type: technique
subject: scale-investment-timing
technique: migration-reason-audit
status: forged
laws: [count-carries-predicate]
shared_with: []
use_when: [a platform or infrastructure migration is proposed on growth grounds, deciding whether a proposed rewrite is buying capacity or something else, a migration's justification changes each time it is questioned]
---

# Audit a migration for its stated reasons

When a platform migration is proposed, **write down every reason offered, exactly as
offered, before analysing any of them.** Then sort the list into two columns: reasons
that name a measured constraint, and everything else. A proposal whose first column is
empty is buying something other than capacity, and the audit's job is to find out
what.

## Do the enumeration before the analysis, and in the proposers' words

The order matters more than it looks. A reason list assembled *after* the analysis
begins is a list of the reasons that survived the analysis, which is a different and
much less useful artefact — the weak ones are quietly dropped and the exercise
confirms whatever the room already believed.

Capture the reasons as given, including the vague ones, the ones stated in a corridor
and the ones that sound embarrassing written down. That last category is where the
information is.

**The strongest signal this technique produces is stability under questioning.** Ask
for the reasons again a week later, or from a different member of the team. A real
constraint produces the same list twice, because it is a fact about the system. A list
that reshuffles — throughput on Monday, developer experience on Wednesday, hiring by
Friday, each offered with equal conviction — is a decision that has already been made
searching for a justification that will hold. Nothing in the individual reasons
reveals this; only the comparison does.

## The two columns

**A measured constraint** names a number, an axis, and where the current platform
fails to meet it — the same three parts a stated ceiling has, per
[ceiling-as-deadline-not-trigger](./ceiling-as-deadline-not-trigger.md). "We are at
eighty percent of what this can do on the binding axis and the projection crosses it
in two quarters" is a measured constraint. "It will not scale" is not; it is a
prediction with no predicate, and per
[count-carries-predicate](../../../../_laws.md#count-carries-predicate) a claim about
capacity that carries no measurement will be reused for whatever the reader needs it
to mean.

**Everything else** goes in the second column, which routinely contains:

- the platform is what larger organisations in this space use
- the team wants experience with it
- it is where the ecosystem is going
- deployment would be faster or more modern
- the current setup is unpleasant to work with

## The second column is not a disqualification

This is the part that determines whether the technique gets used or resented, and
stating it as a purity test is how it becomes the latter. **Several second-column
reasons are entirely legitimate and can carry a migration on their own:**

- **Hiring.** If a platform's practitioner pool is shrinking, every future role is
  harder to fill and every departure is more expensive. That is a real constraint with
  no performance component whatsoever.
- **End of life.** A platform losing security support has a deadline that has nothing
  to do with load.
- **Vendor or platform concentration risk.** A dependency whose commercial terms or
  continued existence is uncertain is a business risk being managed.
- **Operational familiarity.** A team that genuinely knows one platform's failure
  modes and not another's will operate the familiar one more safely, and that can
  outweigh a modest technical advantage on the other side.
- **The unpleasantness itself**, when it is severe enough to be measurable in
  retention or in delivery speed — at which point it stops being taste and becomes a
  cost with a number.

What the audit demands is that the reason be **stated**, not that it be technical. An
unstated reason cannot be weighed against its cost, cannot be checked later against
what actually happened, and — this is the practical damage — cannot be satisfied more
cheaply. A team that wants experience with a technology can often get it in a
contained way for a fraction of the cost of migrating a production system to it. That
option only becomes visible once the reason is on the page.

## Weigh it against the whole cost, which is larger than the migration

The cost side of the ledger is where these decisions are most reliably wrong, because
the figure people estimate is the migration project and the figure they pay includes
several things that never appear in the plan:

- **The delivery freeze.** For the duration, the team ships the migration instead of
  the product, and the opportunity cost of that is usually the largest single item.
- **The permanent operational surface.** A more capable platform is generally a larger
  one to operate, and that cost is paid every month afterwards — which makes it an
  input to
  [size-the-system-to-its-maintainers](./size-the-system-to-its-maintainers.md), not a
  one-off.
- **The reset of accumulated operating knowledge.** This is the item that is almost
  never counted and is frequently the most expensive. A mature platform is safe in a
  given organisation partly because the team has already hit its failure modes,
  written the runbooks, tuned the alerts and learned which symptom means what. A new
  platform sets that to zero regardless of its technical merits, and the first year is
  spent re-learning it under production conditions.
- **Retraining and the competence dip**, during which incidents take longer and
  changes are less safe.

State these as a range rather than a point, and state who bears each. The range is
not a courtesy: measured over large samples of information-system projects, the mean
cost overrun is modest — about a quarter — while roughly one project in six runs
several times over budget and most of a year over schedule, and the distribution
behind that has been shown to follow a power law rather than a bell. A point estimate
therefore describes the typical migration accurately and the ruinous one not at all.
The upper end of the range is the tail, not the mean plus a margin, and the question to
put beside it is what the team does if this migration is the one in six. A migration
that still looks correct with all four written down is a migration worth doing, and the
audit has strengthened it rather than blocked it — which is the outcome to aim for,
because a technique that only ever says no gets routed around.

## What the audit produces

Not a verdict. A **written reason list with costs beside it**, kept with the decision
record, in whatever form the team already keeps such things. Its value is largely
retrospective: two years later it is the only artefact that says why this happened,
and it is the thing that makes the next migration proposal cheaper to evaluate,
because the last one's estimates can be compared against what it actually cost.

## When not to apply it

**When the migration is forced.** A platform being shut down, a compliance obligation,
or an acquisition integration is a requirement. Enumerate the reasons anyway for the
record — it takes minutes and the cost estimate is still useful — but do not run the
sort as though the decision were open.

**When the change is small and reversible.** This technique is sized for platform
migrations: things that consume a team for a quarter or more and cannot be undone
cheaply. Applying it to an ordinary library upgrade is ceremony, and ceremony applied
to small decisions is how a useful check gets abandoned for the large ones.

**Do not use it to relitigate a migration already underway.** Once a migration is
partly done, the decision facing the team is different — finish, stop, or run both —
and it is dominated by what has already been converted rather than by the original
reasons. The audit is a technique for the decision point, and running it late mostly
produces recrimination.
