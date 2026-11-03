---
layer: technique
type: technique
subject: model-composed-workspace
technique: arrangement-memory
status: forged
laws: [silent-state-is-ungoverned, creation-names-reaper]
shared_with: []
use_when: [the model recomposes and throws away what the user pinned or sorted, approval of model-arranged screens falls over a long session, stale layout preferences leak into an unrelated task]
---

# Arrangement memory

The user pins the forecast. On the next turn the model recomposes the region from
scratch and the forecast is gone. The user pins it again, sorts the ledger by
amount, dismisses the alerts panel. The next turn restores the alerts and sorts by
date. By the fourth turn the user has stopped arranging anything, and by the end
of the session they have stopped reading the region.

That is the failure this technique exists for, and it has been measured. In one
session-long study of model-composed interfaces, approval of structure that the
model re-decided every turn started at about seven in ten in the first half of
the session and collapsed to one in three in the second; when the user's own
structural choices were persisted, approval started near three in four and held
near six in ten. A model that forgets the user's arrangement is not neutral; it
is teaching the user that arranging is pointless.

## Every arrangement act is an instruction

Treat what the user does to the region as speech:

- **Pin** - this view stays, in this slot, across recompositions.
- **Resize** - this view deserves this span.
- **Sort, group, filter** - this is how I want this data ordered or cut.
- **Dismiss** - do not show me this again for now.
- **Reorder** - this is the reading order I want.

Each becomes a **standing rule** that the next composition receives as an input
and must satisfy. It is not a preference the model may weigh; user beats model,
always. A pinned view survives recomposition even when the model's new plan has
no slot for it - the plan is fitted around the pin, not the other way round. A
dismissed view is not re-proposed within the rule's scope, however relevant the
model now thinks it is.

## Scoped to the task, expired at its boundary

The same study found the limit, and skipping it reproduces the failure from the
other side: persistence degraded alignment at sub-task transitions and when rules
accumulated beyond their relevance. A pin from reconciling last month's spending
is noise when the user moves on to planning a trip; a dismissed "upcoming bills"
panel is a hazard a week later.

So every rule is created with its **scope and its reaper**
([creation-names-reaper](../../../../_laws.md#creation-names-reaper)): the task it
belongs to, and the event that ends it. Reasonable boundaries, from most to least
explicit:

1. The user clears the region or says they are done.
2. The user starts a conversation thread for something else.
3. The user's request changes subject, as judged by the composer, *with the
   judgement shown*: "new topic - I've cleared the earlier pins" with an undo.
4. A long idle gap.

The third is the hard one and the one that matters, and no current method draws
the line reliably. The honest design names its heuristic, shows the expiry when it
fires, and makes it one action to keep the old rules. A silent expiry is as bad
as a silent persistence: in both cases the user's model of the screen and the
screen have diverged and nobody said so.

## Inspectable, or ungoverned

Rules the user cannot see are rules the user cannot correct
([silent-state-is-ungoverned](../../../../_laws.md#silent-state-is-ungoverned)).
The region therefore carries a small, readable list of what it is currently
honouring - "keeping: forecast pinned, ledger sorted by amount; hiding: alerts" -
with each item removable on its own. Two consequences follow:

- **The composer's input is the same list the user sees.** If the model is told
  something the list does not show, the screen is following instructions the user
  cannot inspect; if the list shows something the model is not told, it is a
  promise the screen does not keep.
- **Conflicts are surfaced, not resolved silently.** When the user asks for
  something a standing rule forbids - "show me the alerts" while alerts are
  dismissed - the newer explicit request wins, the rule is removed, and the
  removal is said.

## Storage and identity

A pinned view is pinned by **identity**, not by position or by title. The view's
identity is minted when it is first placed and carried through every
recomposition; matching "the forecast" by title fails the first time the model
retitles it, and matching by slot fails the first time a view is inserted above
it. Pins that should outlive a session (a user who always wants the forecast on
the board) are a different thing - a saved preference the user set deliberately,
in settings, not an inference from one session's clicks.

## Honouring a pin at commit time

A composition takes seconds, and the user keeps working while it runs. A pin set
after the prompt was built but before the answer lands is exactly the pin the
model was never told about. So the rules are applied twice: told to the model as
constraints when the prompt is built, and **enforced again when the composition
is committed** - reading the current rules and the current arrangement inside the
same transaction that stores the new composition, so a rule set while the model
was thinking still holds.

Enforcement is mechanical, not a second request to the model. A pinned view the
model left out is carried over **verbatim by identity, in its old place**; a fresh
view that only repeats a pinned one (the same kind, the same binding, the same
settings under a new identity) is removed, so honouring a pin never shows the same
thing twice. When the region's cap forces something out, unpinned views give way,
and what gave way is said.

## Decision rules

- **When the user acts on the region, write the rule before applying the next
  composition**, and enforce it at commit, so a recomposition already in flight
  cannot overwrite it.
- **When the model's plan conflicts with a pin, fit the plan around the pin**;
  if it cannot fit, say what was left out rather than evicting the pin.
- **When a rule's scope is ambiguous, scope it narrowly.** A rule that expires too
  early costs one re-pin; one that lingers costs the user's trust in every later
  composition.
- **When rules pile up past a handful, ask** whether the old ones still apply.
  Accumulation is the documented failure mode.

## When not to use this

- **One-shot compositions.** A region that answers one question and is cleared
  has no next composition to instruct.
- **A layout the user owns outright.** When the user arranges and the model only
  fills, the arrangement is the product's ordinary saved state, not a rule set
  the model must honour.
- **Shared or collaborative boards.** When several people arrange the same
  surface, whose pin wins is a permission question, and this technique's
  "user beats model" does not answer which user.
