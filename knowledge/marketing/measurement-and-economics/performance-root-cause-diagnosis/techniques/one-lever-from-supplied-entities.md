---
layer: technique
type: technique
subject: performance-root-cause-diagnosis
technique: one-lever-from-supplied-entities
status: forged
laws: [never-invent-proof, efficiency-is-not-profitability]
shared_with: []
use_when: [a diagnosis must end in an action, a model names campaigns or sources in its recommendation, a recommendation quotes a benchmark nobody supplied]
---

# One lever, from supplied entities

A diagnosis ends in one recommended action, concrete enough for a specialist to do
today, and everything it names - the campaign to pause, the destination for the
budget, the source to re-target, the ratio it cites - comes from the request. The
"one" is a discipline against the list that mentions everything and commits to
nothing; the "supplied" is a structural guarantee, not an instruction, that the action
cannot be about something that does not exist.

## One lever

Ask for the single most effective action, phrased as a thing to do: "pause this
campaign and move its budget to that one", "check the conversion tag, the import and
the account link before touching spend", "reduce the weaker network and add to the
stronger, re-read in a week". Not "consider optimising", not "review targeting", not a
ranked list of five. A list invites the owner to do the third one; a single action is
either done or refused, and both are outcomes the ledger can record. Where the
diagnosis is conversational rather than a card, the same rule lands as: the last
sentence is one concrete next step, or exactly what to measure so the question can be
answered - never a restatement of the finding.

**When a diagnosis returns its recommendation, require exactly one action that names
its subject and, where it moves money, its destination, because a recommendation the
owner can execute this afternoon is the only kind whose outcome can be scored.**

## Supplied entities, structurally

The request hands the model a bounded set of entities: the worst few campaigns, the
best few as destinations, the platforms, the one cohort, the one source and its
comparison peers. Each carries an id. The response's affected-entity list is
normalised back to the ids the request supplied:

- ids not in the set are **dropped**, never corrected to the nearest plausible one;
- duplicates collapse; the list is capped at the size the request offered;
- an **empty** list is legal - the diagnosis may be about the portfolio rather than a
  row - and it falls back to the deterministic subject set only when the model named
  nothing at all.

This is [never invent proof](../../../_laws.md#never-invent-proof) at the output
boundary, and it doubles as the last rung of an injection defence: the entity name is
the only free text in the prompt and it comes from an advertiser's console through a
connector, so a name that carries an instruction can steer the prose but cannot make
the response point at an entity the request never held. The containment is asserted
from the hostile side in a test, so it cannot be relaxed without a red one.

Where the lever needs a destination, the request offers candidates so the model can
name one with its numbers: "move it to this campaign at this return". A recommendation
that names its destination gets acted on; one that says "to better-performing
campaigns" gets nodded at.

## No external benchmarks

The prompt carries no industry standards, typical rates, or thresholds the data does
not contain. Every threshold in a recommendation is derived from the supplied numbers
with the derivation stated, or omitted. The agreed target is data; a remembered
benchmark is proof nobody gave, and it also transplants badly - a "typical" conversion
rate for one market and vertical is fiction in another. The same rule forbids the
lever from speaking of profit when only revenue was supplied: without a margin the
recommendation speaks of efficiency and says so
([efficiency is not profitability](../../../_laws.md#efficiency-is-not-profitability)).

## Decision rules

- When the model names an entity outside the request, drop it and log the drop; do
  not re-prompt for a better name, because the better name is also not in the request.
- When the cause is a measurement gap, the lever is to fix measurement and touch no
  spend; a lever that pauses on a gap has read the ladder backwards.
- When the cause is healthy, the lever is "hold, and consider a careful increase on
  the strongest performers while the target holds" - still one action, still named.
- When a lever moves money, it is a recommendation awaiting the reallocation subject's
  gate, never an executed change; the diagnosis proposes, the control plane simulates,
  guards and asks.
- When the diagnosis is for a cohort with a channel breakdown, the lever names the
  channel dragging the cohort down, not the whole cohort - a problem channel is not a
  problem cohort.
- When the deterministic floor writes the lever, it templates the sentence from the
  ranked subject and the best destination, so even the demo names real rows.

## When NOT to use

- When the honest answer is "not measurable yet". A lever forced onto a source with
  too few observations is a guess dressed as advice; the volume rung exists so the one
  action can be "collect more data", which is still an action.
- When the operator has asked for options rather than a verdict. A planning surface
  may list alternatives; a diagnosis may not.
- For anything that auto-applies. The lever is text for a person; the gate before
  money is another subject's and is never bypassed by a confident sentence.
