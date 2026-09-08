---
name: motion-and-appellate-brief-drafting
version: 0.1.0
status: seed
domain: legal_compliance
path: legal_compliance/litigation
---

# Litigation motion and appellate brief drafting

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** The filing that loses is rarely the badly written one. It is the persuasive
one built on a theory the record cannot carry: its best fact is an allegation no witness
will testify to, its lead case is distinguishable on the single fact this matter has,
and none of that is visible until the response arrives. The second failure is quieter
still, because it leaves no artifact at all: an argument not raised at this stage is
gone, and a point never made reads afterwards as a choice somebody made rather than as
the oversight it was.

**Input.** The record as it actually exists, pleadings, transcripts, exhibits and
discovery responses, the procedural posture and the standard of review that governs a
filing in it, the authority binding in this forum and its current standing, and what has
already been argued, conceded or waived in the matter.

**Core action.** Decide which of the available theories the record can carry under the
standard that governs this posture, and frame it so the relief asked for follows from
facts already in front of the court rather than from facts counsel believes, choosing
authority for whether it binds this court on these facts rather than for how well it
reads.

**Output.** A filed motion, memorandum or brief that asks for relief a court can grant
on the record before it, rests every factual assertion on something already in that
record or names what must be added to get it there, confronts the strongest contrary
authority instead of leaving it for the response, and preserves the issues that must be
raised now to survive later, alongside a note of the theories considered and set aside
with the reason each was.

## Activities

1. Read the record as it stands and separate what is established from what is asserted
*(observe)*
2. Fix the procedural posture and the standard the filing has to meet *(observe)*
3. Choose the theories this record can carry and set aside the ones it cannot *(decide)*
4. Select authority for whether it binds this court on these facts, and check it is
still good law *(decide)*
5. Draft so the relief follows from the record and the strongest answer is met head on
*(act)*
6. Raise every issue that has to be raised now to remain reviewable later *(act)*
7. File within the forum's rules on form, length and time *(deliver)*
8. Record the theories considered and why each was left out, for whoever picks the
matter up next *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**Every proposition the filing needs is either in the record already or is named as
something that has to be put there first.**

- Each factual assertion carries a citation to the specific part of the record that
  supports it, and a proposition with no such support is written as a gap to fill, by
  declaration, stipulation or further discovery, rather than argued around.
- The standard the filing must meet is stated and the argument is written to that
  standard, so a submission judged on whether a dispute of fact exists is not written as
  though it were judged on which account is more convincing.
- The strongest authority and the strongest reading of the record against the client are
  addressed in the filing rather than left for the response to introduce.
- A brief reused from another matter is re rested on this record before it is filed,
  because language that survived one posture is exactly what carries an argument written
  to the wrong standard into a new forum.

**An issue that is not in the filing is absent because somebody decided it should be,
and the decision is on the record.**

- Issues that must be raised at this stage to remain available later are raised, or are
  recorded as deliberately not pursued with the reason and who decided.
- A theory dropped for tactical reasons is written down as dropped rather than allowed
  to disappear, so the next person on the matter can tell a considered omission from an
  oversight.
- An objection or argument already resolved in the matter is not carried forward from an
  earlier draft as though it were still live.
- A filing made under time pressure that could not cover everything says which issues
  were left, rather than presenting a partial set as the complete one.

**Nothing is cited that has stopped being good law or was never binding here in the
first place.**

- Every cited authority is checked for subsequent history, and one that has been
  reversed, superseded or limited is either dropped or cited with what happened to it.
- Persuasive authority is labelled as persuasive rather than presented in the same voice
  as binding authority from this forum.
- A proposition with no support in this jurisdiction is framed as an argument for
  extending the law, with the reasons a court might, rather than asserted as settled.
- A quotation is checked against the source text and its context, since a phrase lifted
  from a case that decided the opposite point is the error that damages credibility for
  the rest of the filing.

## Guidance

Start from the record, not from the theory you like. The question is what these facts,
as they can actually be proved right now, will carry under the standard this posture
imposes, and a theory the record cannot reach is a gap to fill or a theory to drop.
Choose authority for whether it binds this court on these facts. Write the other side's
best argument before you write around it, and raise what has to be raised now, because
the point you leave out today is not available later.

## Where this is worth adopting

- A matter where an adverse ruling has just landed and the useful question is not
  whether it was wrong but which parts of it the record actually preserves for review.
- A practice reusing a brief bank across forums, where the language travels well and the
  standard of review does not, so an argument written for one posture is filed into
  another.
- A case whose strongest story is one the client tells convincingly and no exhibit
  supports, which is precisely the theory that survives internal review and fails on the
  papers.
- A dispositive motion drafted under a court set deadline that leaves time for two
  arguments and not five, where the choice of which to make is the entire filing.
- A handover between the trial and appellate stages, where whoever writes the appeal has
  to work out from the file which omissions were tactics and which were nobody noticing.

## Connector types

`research`, `knowledge_base`, `documentation`, `storage`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it. No connector-specific knowledge has been written for this
recipe yet.

## Recommended trigger

`event`. The work is set in motion by something that happened in the matter: a motion
served, a ruling entered, a notice of appeal filed. The clock is imposed by the forum
from that moment, and it is short enough that a scheduled pass would either arrive after
it started or wake on the many days when no case is at that point. Nothing here is
periodic, and nothing here is at the drafter's own pace.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- The forums this practice appears in, with their rules on form, length and timing,
  because a filing rejected for form is indistinguishable from one never made.
- How the practice verifies that authority is still good, since the recipe cannot assume
  any particular citator and an unverified citation is a claim about the law with
  nothing behind it.
- Which brief bank and prior filings are available and what standard each was written
  to, because reuse is where an argument silently changes posture.
- Who signs the filing and what they expect to review before signing, since the judgment
  about which theories to advance belongs to the person whose name is on it.
- How the client weighs advancing weaker arguments in the alternative, which is a matter
  of appetite and cost rather than of craft, and cannot be defaulted.

## Dependencies

None.
