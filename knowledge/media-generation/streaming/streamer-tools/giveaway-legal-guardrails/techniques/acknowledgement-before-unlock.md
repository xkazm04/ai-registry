---
layer: technique
type: technique
subject: giveaway-legal-guardrails
technique: acknowledgement-before-unlock
status: forged
laws: [refusal-is-a-state]
shared_with: []
use_when: [a giveaway warning needs the streamer's confirmation before the draw can be sealed, designing what an acknowledgement records and when it expires, auditing who accepted which giveaway risk]
---

# Acknowledgement before unlock

When a draw is held on a warning, the only thing that releases it is an **acknowledgement**:
the streamer reads the specific risk this draw carries and confirms it, and the confirmation
is recorded. The technique governs what the streamer sees, what is stored, and when the
acknowledgement stops covering the draw. Product design practice, not legal advice: an
acknowledgement records a decision; it does not make the decision correct.

## Specific, not generic

The acknowledgement text names this draw's findings in this draw's values: "The prize is
valued at 6,000. Some places require a filing above 5,000 (source, date). Confirm the filing
is done, or exclude those places." A generic "I understand giveaways may be regulated" says
nothing the streamer can act on and records nothing anyone can audit. One acknowledgement per
finding, not one for the screen: a streamer who confirmed the value warning has not thereby
confirmed the contested-gate warning beside it.

Where the acknowledgement asserts a fact — a filing was made, places were excluded — ask for
the fact itself (a reference, the excluded places), so the record holds something more than
a click.

## What is recorded

For each acknowledgement: the finding's rule identifier, the exact wording shown, the
configuration it covered (a digest of the draw's settings, or the fields that triggered the
finding with their values), who confirmed it, and when. The record lives with the draw's own
audit trail and survives the draw, because the point of it is the question asked months later
— "did the streamer know this prize crossed the line?" — and the answer must be the text they
saw, not the text the product shows today.

Three properties of the write keep the record honest. **Audit before effect:** the
acknowledgement is appended durably before the hold is released, and a failed append
releases nothing — an unlock whose audit line was lost is an unlock nobody can account for.
**No stockpiling:** acknowledging a finding this draw does not currently carry is refused, so
a streamer cannot pre-accept risks for a configuration they have not built yet. **No
duplicates:** repeating an acknowledgement already on record is a no-op that writes nothing,
so the trail counts decisions, not clicks.

**A risk acknowledged is not a fact confirmed.** "I accept that this draw carries this risk"
and "the filing has been made" are different statements with different follow-ups, and they
use different verbs. A finding that is cleared by a fact — a registration, an exclusion — is
refused by the general acknowledge action and accepts only its own confirmation.

## When it expires

An acknowledgement unlocks one draw in one configuration. It is invalidated when:

- a field that triggered the finding changes (prize value, entry routes, eligible places);
- the finding's wording or threshold changes in a product update before the draw is sealed;
- the draw is duplicated as a new draw — a copied draw copies the configuration, never the
  acknowledgements.

It is never stored as a channel-wide preference, never defaulted to on, and never offered as
"don't ask again". A draw that runs every week with the same over-threshold prize asks every
week; if that is too much friction, the honest fixes are a lower prize or an eligibility
exclusion that removes the finding, not a remembered click.

## An acknowledged warning is still a warning

Acknowledging releases the hold; it does not reclassify the draw. The draw record, the
streamer's history and any exported proof show *passed with acknowledged warnings*, distinct
from *passed*. A tool that turned acknowledged findings green would have built a launderer.
Blocks are not acknowledgeable at all: the state is shown, with its reasons, and only a
configuration change moves it — the refusal is a state on the draw, per
[refusal-is-a-state](../../../../_laws.md#refusal-is-a-state).

## Sequence

1. The draw is configured; the risk screen classifies it.
2. Each warning shows its acknowledgement control; the seal action stays unavailable, with
   the count of open findings shown beside it.
3. The streamer confirms each, supplying any asked-for fact.
4. On seal, the tool re-runs the classifier and compares each acknowledgement's covered
   configuration with the current one; any mismatch returns the draw to step 2.
5. The sealed record carries the acknowledgements.

## Decision rules

- **When a finding can be removed by a configuration change**, show that change beside the
  acknowledgement; prefer that the streamer removes the risk over accepting it.
- **When more than one person can operate the tool**, record which person acknowledged.
- **When acknowledgements are being clicked through in seconds**, measure it and narrow the
  warning, rather than adding a countdown that trains the same reflex more slowly.

## When not to use it

Never for a block. Never for a draw with no prize. Never as a one-time onboarding consent
standing in for per-draw findings.
