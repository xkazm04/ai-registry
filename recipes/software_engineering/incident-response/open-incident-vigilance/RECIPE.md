---
name: open-incident-vigilance
version: 0.2.0
status: seed
domain: software_engineering
path: software_engineering/incident-response
---

# Open incident vigilance and escalation

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** Incidents are rarely abandoned deliberately; they go quiet. The mechanism
meant to catch that is usually the thing that hides it, because acknowledging an
incident stops the escalation, and an acknowledgement is a promise to work on it that
the system accepts as proof. So a serious incident acknowledged at three in the morning
by somebody who then went back to sleep looks handled, and a trivial one stays open
forever because nothing ever asks whether it is over.

**Input.** The open set, with each incident's severity, when it was last genuinely
updated, what it committed to next, whether somebody has acknowledged it, and what has
already been sent about it.

**Core action.** Decide from the board itself which incidents have passed the update
they committed to, treating an acknowledgement as buying a bounded amount of quiet
rather than an unlimited amount, and escalate towards a different person with more
consequence rather than repeating a nudge that has already been ignored.

**Output.** An open set where nothing serious is quietly abandoned, escalations that
reached somebody new rather than the same person again, minor items closed with the
reason they went away, and a record of which promised updates were actually made.

## Activities

1. Read the open set with each incident's last real update and what it promised
*(observe)*
2. Decide which have passed the update they committed to *(decide)*
3. Escalate towards a different person with more consequence, not the same nudge again
*(act)*
4. Close a minor item that has genuinely gone away, with that reason recorded *(act)*
5. Take a resolution to a person for confirmation rather than inferring it *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**Somebody saying they have it does not stop the watch indefinitely.**

- An acknowledged incident with no update since the acknowledgement returns to being
  escalatable after a stated period, rather than staying quiet because it was
  acknowledged.
- When the watch resumes on an incident whose responsibility has since moved to somebody
  else, it reaches whoever holds it now as well as whoever acknowledged it.
- An acknowledgement and an update are counted as different things, because one is a
  promise and only the other is evidence of work.

**Whether an incident is stale is a fact anyone can read off the board, not an
impression somebody forms.**

- Every open incident carries when its next update is due, set by its severity, and is
  stale the moment that time passes whatever its status says.
- An update is expected and made even when there is nothing new, because an update
  saying nothing has changed and naming the next one is information and silence is not.
- A late incident is recorded as still moving or as stuck rather than as merely late,
  because the two are indistinguishable from outside the work and one of them wants a
  longer window while the other wants a different person on it.
- The share of promised updates that arrived inside their window is recorded, so a
  commitment nobody keeps is visible as that rather than as a busy period.
- A period the watch did not cover, after a restart or an outage of its own, is caught
  and sent with the real delay stated rather than sent as though it were on time.

**Each step of an escalation is different from the last, and nothing is closed on the
watch's own say so.**

- A second escalation reaches a different person or carries a different consequence,
  never the same message to the same person, since a repeated identical nudge carries no
  new information and is learned away.
- The ladder is stated in advance, so what the next rung is can be read rather than
  improvised during the incident.
- Resolution always waits on a person confirming closure, and an incident that merely
  stopped being discussed is reported as gone quiet rather than as resolved.
- A minor item closed for having genuinely gone away carries that as its recorded
  reason, so the close is distinguishable from a resolution.

## Guidance

The failure this work exists to catch is silence, and the commonest way to miss it is to
accept an acknowledgement as an answer. Treat it as buying a bounded amount of quiet.
Staleness is a comparison against what the incident promised, not against elapsed time,
which is why a long well handled incident should not be chased and a short abandoned one
should. Escalate towards somebody new; the same nudge twice is a nudge that has stopped
working.

## Where this is worth adopting

- A small on-call rotation where one person acknowledges everything reflexively, which
  currently silences the only mechanism that would notice they are asleep.
- A board that has accumulated a dozen minor incidents nobody will ever close, so the
  count is meaningless and the two that matter are not visible in it.
- A responder who has learned to ignore the reminder channel because it sends the same
  sentence about the same open incident every fifteen minutes.
- An operation that promises customers updates during an outage, where the promise is
  currently kept when somebody remembers and the record of whether it was kept does not
  exist.
- The restart after the watch itself was down for two hours, when the honest thing is to
  send the missed escalations late and labelled, and the tempting thing is to start from
  now.

## Connector types

`messaging`, `notifications`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it. No connector-specific knowledge has been written for this
recipe yet.

## Recommended trigger

`self_paced`. Decide when to look from the state of the board itself. A serious incident
with no update needs attention far sooner than a minor one, and an empty board needs
none at all, so a fixed sweep spends the same effort on both and still arrives late for
the one that mattered. The next thing worth checking is derivable from the earliest
update any open incident has committed to.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- How often an incident of each severity should be updated here, because that commitment
  is the only threshold the work rests on and it is a property of the team rather than a
  default.
- How long an acknowledgement holds before the watch resumes, since making it unlimited
  recreates the failure this recipe exists for and making it too short trains people to
  ignore the escalation.
- Who each rung of the escalation reaches, since escalation that grows in force has to
  grow towards specific people and stops meaning anything if it reaches the same one.
- What counts as a minor item that may be closed for going quiet, because that judgment
  differs sharply between operations and getting it wrong closes something real.

## Dependencies

None.
