---
name: post-incident-review
version: 0.1.0
status: seed
domain: software_engineering
path: software_engineering/incident-response
---

# Post-incident review and prevention proposals

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** To the people an incident happened to, a review that produces no change is
indistinguishable from no review at all, and most of the actions written into these
documents are never done. The account itself usually fails first: written with the
answer already known, it reads as a clean line from detection to repair, which erases
the confusion that was the actual difficulty and leaves nothing anybody can learn from.

**Input.** A resolved incident with its timeline, what the responders were seeing at
each point rather than only what turned out to be true, and the causes recorded behind
earlier incidents.

**Core action.** Reconstruct what was known as it unfolded, including the wrong turns,
name the factors that had to combine for the incident to happen rather than reducing
them to one, and turn each action into a change a named person could make and that has
been filed where work is actually picked up.

**Output.** An account somebody who was there would recognise, a stated cause or a
stated unknown, actions that exist as work rather than as sentences, and a prevention
proposal where a cause has returned often enough that another review is the wrong
response.

## Activities

1. Write while responders are out of the fire and can still remember it *(observe)*
2. Rebuild what was known as it unfolded, including the wrong turns *(observe)*
3. Name the factors that combined, or state plainly that the cause is unknown *(decide)*
4. Check the cause against earlier incidents and decide whether it is recurring
*(decide)*
5. Turn each action into a change one named person could make *(act)*
6. Take the account to a person before it becomes the permanent record *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**Somebody who responded to the incident reads the account and recognises it.**

- The timeline records what responders believed and could see at each point, not only
  what turned out to be true, and the paths that led nowhere are in it rather than
  removed.
- The account names the several things that had to combine, with at most one of them
  labelled as the trigger for the benefit of readers who need a handle, and does not
  reduce the incident to a single cause for tidiness.
- A claim that something would have prevented the incident is either supported by
  evidence or stated as a smaller claim that is, since an unsupported one is the easiest
  sentence to write and the least useful.
- Where the cause is not known, that is the finding, along with what would establish it.

**What the review decided to do is in the same queue as everything else the team has
committed to.**

- Every action names one person rather than a team, a change that could be observed to
  have happened, and where it was filed.
- An action whose verb is to improve, review or consider is rewritten or dropped,
  because neither has an end state anybody can check.
- The next review of an incident with a related cause says what happened to the previous
  one's actions, so an action that was never done is visible rather than assumed.

**A cause that keeps coming back produces a proposal to end it rather than another
account of it.**

- An incident matching an earlier cause is linked to it, and the link is in the record
  rather than in somebody's memory.
- A cause that has returned past a threshold the adopter set produces a prevention
  proposal sized for a decision, instead of a further review.
- The account exists within days of the incident rather than weeks, since one written
  long afterwards is neither correctable by the people who were there nor read by
  anyone.

## Guidance

The only lasting product of an incident is what changed because of it, so an action with
no owner and no verifiable end is the review failing. Reconstruct what people knew at
the time, not what you know now: a clean account is a sign the confusion was edited out,
and the confusion was the lesson. Prefer a stated unknown to a plausible invented cause.
Where the same cause returns, stop reviewing it and propose the change that ends it.

## Where this is worth adopting

- A team that writes reviews faithfully and has a folder of them, where the same failure
  has now happened three times and each review recommended better monitoring.
- An operation whose reviews are written a month later by somebody who was not there,
  reconstructed from the ticket, and read by nobody who could correct them.
- The days after a serious incident, when the responders can still describe what they
  thought was happening and in two weeks will remember only what turned out to be true.
- A team under enough delivery pressure that prevention work never competes successfully
  with roadmap commitments, where the only thing that changes the outcome is the action
  being in the same queue rather than in a document.
- An incident whose cause was never actually established, where the pressure is to name
  something plausible so the review looks finished and the cost is that the real cause
  is still there.

## Connector types

`knowledge_base`, `productivity`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/).

## Recommended trigger

`self_paced`. Two different moments matter and neither is a fixed delay after
resolution. One is when a resolved incident has settled enough that the account will be
accurate and the people who were there can still correct it, which is a judgment about
them rather than a number of hours. The other is when the record shows a cause
recurring, which is not tied to any single incident at all.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Which severities deserve a written account, and whether that is decided by the worst
  the incident ever was rather than by what it was closed at, because tying it to the
  final severity creates a reason to lower one.
- Where an action has to be filed to become work here, since an action that lands only
  in the account is the single strongest predictor that it will not happen.
- How long this team needs before an account will be accurate, which is a property of
  how they work and sits between too soon to think and too late to remember.
- How many returns of a cause make it a pattern here, because that threshold is what
  stops the same review being written a fourth time.

## Dependencies

None.
