---
layer: technique
type: technique
subject: requirement-inflation-control
technique: must-have-soft-cap-and-forced-ranking
status: forged
laws: [every-decision-names-its-actor, uncertainty-resolves-toward-the-candidate]
shared_with: []
use_when: [a must-have list runs long, a requestor calls everything essential, tooling needs a threshold at which to object to a requirement list]
---

# The must-have soft cap and forced ranking

Two devices that work as one. The **cap** is a count past which a must-have
list stops being a decision; the **forced ranking** is what you do at the cap
instead of trimming. Neither works without the other: a cap with no ranking is
a recruiter deleting other people's requirements, and a ranking with no cap
never gets triggered.

## Why a count is a legitimate control

It looks crude to govern a qualitative list by counting it. It is not, for two
independent reasons.

**Classification degrades with length.** Asked to sort twenty items into must
and nice, people sort the first handful carefully and the remainder by mood.
Past roughly six the list stops discriminating: everything mentioned ends up
essential, which is the same information as nothing being essential. The cap
is a control on the *quality of the judgment*, not on the ambition of the
role.

**Conjunctive filters multiply.** Each must-have is an AND. Requestors reason
additively about a list that behaves multiplicatively, so the list feels
reasonable line by line and describes nobody as a whole. The count is the
cheapest available proxy for a pool cost the requestor cannot compute in their
head. Where an actual counterfactual pool measurement exists, use it — it is
strictly better evidence, and it belongs to the fillability-forecast practice.
The cap is what you have before that number exists, and it is available in the
room.

A third reason concerns who applies. A long requirement list is read by a
meaningful share of applicants as a rules document to be met in full, and by
others as a wish list to be cleared at half the bar — so a long list narrows
the pool *non-randomly*, along lines that correlate with confidence and
background rather than capability. The direction of that effect is well
attested in applicant self-selection surveys; the percentages usually quoted
alongside it trace back to an internal anecdote rather than a study, and a
practitioner should repeat the direction and not the number. The wording that
deters is the advertising lint's subject; the count is this one's.

## The numbers, and which is which

- **Roughly six** is the working target for a human-facing must-have list —
  the point past which classification quality visibly falls off.
- **Eight** is a reasonable hard threshold for tooling to object at: a
  linter, an intake agent or a review gate that flags a longer list. Set the
  automated threshold above the conversational target on purpose. A machine
  that objects at the same count as the coach objects constantly, and a
  control that fires on the median case is ignored within a week.

Neither number is sacred; the existence of a stated threshold is. Any team
that picks its own numbers and applies them consistently is doing this
correctly. A team that has no number at all is not.

## The forced-ranking move

At the cap, do not trim. Say what the list costs, then ask for an ordering:

> "That's eleven musts. Each one is an AND, so eleven of them describes
> someone who probably doesn't exist at this band. If you could only insist on
> three, which three?"

Then take the three, and record the rest as preferences.

The move works because **people who cannot classify can almost always
order**. Classification asks for an absolute judgment against an undefined
bar; ranking asks for a comparison, which is the judgment humans are actually
good at. And the demotions execute themselves: nobody has to assert that any
particular line was wrong, so nobody has to defend it. The requestor's
ordering *is* the demotion, in their voice, with their name on it — which is
what
[every-decision-names-its-actor](../../_laws.md#every-decision-names-its-actor)
requires of a decision this consequential. A recruiter's silent trim produces
a brief the requestor does not recognise and will override the first time a
candidate is rejected on a line they thought was in.

Ask for three, not for six. A request to cut to the cap gets negotiated down
to one item over the cap; a request for a top three gets an answer. The items
below the requested three are not discarded — they become graded preferences,
and if the requestor insists two of them are still musts, that is a fine
outcome: nine became five, and the five are examined.

## Decision rules

- **State the cost before asking for the cut.** The ranking question without
  the multiplication argument reads as an arbitrary quota. One sentence of
  mechanism is what makes it a trade-off rather than a rule imposed on them.
- **Never trim by position.** Dropping the last two items because they are
  last is the cap behaving as a truncation. Position in the list records the
  order they were mentioned, which correlates with recency of frustration, not
  with importance.
- **Count musts only.** A long nice-to-have list is not inflation; it filters
  nobody and carries genuine signal for sourcing and for tiebreaks. Capping it
  destroys information for no benefit.
- **Count graded requirements, not clauses.** "Five years of distributed
  systems in a regulated environment with on-call ownership" is three
  requirements wearing one sentence, and a cap that counts sentences is
  trivially evaded — usually without anyone intending to evade it.
- **A prose count and a list count measure different things, and both are
  legitimate.** Counting graded items measures decision quality. Counting
  obligation words — *must*, *required*, and their equivalents in whatever
  languages the posting is published in — across the advertisement's prose
  measures what an applicant experiences, which is what drives the
  self-selection effect. A published requisition can pass the first and fail
  the second, because obligations leak into responsibility sections and
  benefit paragraphs. Run both, and do not let one stand in for the other.
- **A list at the cap is not therefore healthy.** Six inherited requirements
  are six pieces of sediment. The cap is a ceiling on quantity; the outcome
  filter and the proxy audit are the controls on quality, and all three run.
- **An unrecognised or missing grade never counts as a must.** Where the cap
  is enforced by tooling over a graded list, an item whose grade is absent or
  off-taxonomy must fall to the non-filtering side, per
  [uncertainty-resolves-toward-the-candidate](../../_laws.md#uncertainty-resolves-toward-the-candidate).
  A grade nobody defined must not become a hard gate through a default.

## When not to use it

- **On a role with a genuine regulatory floor.** Where several licences,
  clearances and certifications are all legally mandated, the list is long
  because the law is long. Cap the *discretionary* requirements and record the
  mandated ones separately, with the authority that mandates each — otherwise
  the cap spends its whole budget on lines nobody may remove.
- **As a post-hoc edit of a published requisition.** Cutting the list after
  sourcing has begun changes what applicants were measured against mid-flight.
  Re-grade for the next round, and let anyone already in the process be judged
  against what they actually read.
- **Where the count is enforced silently.** A drafting system that quietly
  keeps the first six and drops the rest has performed the silent trim in
  software, at scale, with no author. If tooling cannot ask for a ranking, it
  flags and waits.
