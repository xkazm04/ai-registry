---
layer: technique
type: technique
subject: hitl-approval
technique: fail-loud-classification-default
status: forged
laws: [failure-not-empty-success, count-carries-predicate, one-validation-door]
shared_with: []
use_when: [an item arrives whose payload will not parse, choosing the fall-through arm of a severity classifier, unreadable items resolving to the cheapest bucket]
---

# Fail-loud classification default

Everything that reaches a review queue is classified before it is queued: this
is a critical event, that one is routine. The classification is read out of the
item's payload, and payloads fail to read — truncated in transit, written by a
producer a version ahead of the consumer, hand-assembled by a script, mangled
by an encoding, or simply absent because an upstream field was renamed. The
classifier therefore needs a default, and **the direction of that default is
one of the highest-leverage single decisions in the whole mechanism.**

## The cheap default is the wrong one, and it is wrong in a specific way

The attractive default is the mildest bucket. It is attractive because it is
quiet: an item nobody can read is probably junk, junk should not wake anyone,
and a system that shouts about every malformed payload trains people to ignore
it. Every part of that reasoning is locally sensible, and the conclusion is
precisely inverted.

Compose it with a severity ladder — the instrument that answers what happens
when nobody responds in time — and the composition is lethal. Under any ladder
where the mildest severity auto-approves, a malformed payload belonging to a
genuinely critical event is classified as trivial, sits in the queue looking
trivial, reaches its short trivial deadline, and is **approved by the machine
with no human ever having seen it**. The item the system understood least
received the least scrutiny and the most automatic assent. That is the
mechanism's failure state reached by the shortest possible route, and it is
reached by a fall-through arm that somebody wrote in three seconds without
thinking of it as a policy decision at all.

Note where the damage comes from: not from the parse failing — parse failures
are ordinary — but from an unreadable item being **spelled the same way** as a
readable low-severity one
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)). Once
those two states share a representation, no downstream consumer can tell them
apart, and every one of them treats the first as the second.

## The rule

**An item whose classification cannot be determined takes the most severe
bucket, and carries an explicit marker saying it was defaulted and why.**

Both halves are required and they fail differently when dropped.

Without the **severity**, the item is waved through, as above. The severe
bucket is not a guess that the item is dangerous; it is the only assignment
whose worst case is bounded — an unreadable routine item at the top of the
queue costs an operator ten seconds of attention, and an unreadable critical
item at the bottom of the queue costs whatever that event was going to cost.
The asymmetry is not close.

Without the **marker**, the operator sees a critical row with nothing critical
in it, and cannot distinguish "this is genuinely urgent" from "we could not
read this". After the third one they downgrade the entire severity class in
their head, which is the fatigue failure arriving by a side door — and it is
worse than ordinary fatigue because the mechanism is now training the operator
to discount its most severe signal specifically. The marker is what keeps the
loud default honest: it says *this item is here because of a parse failure, not
because of its content*, and that sentence is the difference between a
prioritized queue and a queue whose top is full of noise.

The marker also has to be machine-readable, because it is the only way anyone
can ask how often this is happening. A rising count of defaulted items is a
producer/consumer version skew or a broken upstream, diagnosable in minutes if
the queue can be filtered by the marker and effectively undiagnosable if the
marker is only a phrase in a label. And when the count is quoted, it carries
its predicate ([count-carries-predicate](../../../../_laws.md#count-carries-predicate)):
"eleven critical items pending" and "eleven critical items pending, of which
nine are unparsed defaults" describe two entirely different mornings.

## Diagnose per field, and report all of them at once

The default is a safety net, not the response. The response is a validator at
the entry point — one door, so a new producer cannot arrive by a path that
skips it
([one-validation-door](../../../../_laws.md#one-validation-door)) — that reports
**every** field that failed, not the first. A boolean "invalid" throws away the
diagnosis and forces whoever holds the malformed payload to fix one field, run
again, discover the second field, and repeat; an aggregated per-field report
turns three round trips into one. This matters more here than in ordinary
validation because the party that must fix it is usually a different system,
often a different team, and the round trip is measured in days.

Preserve the partial parse, too. When the severity field is unreadable but the
target, the actor, and the timestamp all parsed cleanly, keep them: the loud
default applies to the field that failed, not to the whole item. Discarding the
readable context leaves the operator a top-severity row with nothing in it to
triage on, which is a strictly worse position than the parse failure itself put
them in. When *nothing* parsed, the best available body is the raw payload
itself — shown verbatim rather than replaced by an apology. It is the only
evidence anyone has about what actually arrived, and the person deciding what
to do about the item is better served by unreadable bytes than by a message
saying there were some.

## Absent and invalid are not the same defect

One refinement separates a loud default from a shouty one, and it turns on a
distinction worth making explicitly: **a field that is missing and a field that
is present but unreadable are different events.** For an item's own
classification they usually coincide — an item that never said how severe it
was told you exactly as little as one that said it incomprehensibly, and both
take the severe bucket with a marker. But for *configuration* read from stored
state — a ladder's rungs, a threshold, a policy override — absence is a
legitimate, expected condition meaning "not configured", and it resolves
silently to the documented default. A present-but-invalid value is somebody's
broken write, and it resolves to the same default *loudly*. Treating those two
identically costs you in whichever direction you collapse them: shout on
absence and every fresh installation reports a defect on first run; stay quiet
on invalidity and a corrupt stored policy degrades to defaults with nobody ever
learning that the configuration they set is not the configuration in force. The
rule that covers both: a value that was never provided defaults quietly, a
value that was provided and could not be understood defaults loudly, and the
gate's own behavior is identical in the two cases.

## The direction generalizes

Severity is the case with teeth, because it composes with a ladder that acts.
The direction is the same for every classification the mechanism makes on
uncertain input: an unrecognized action class is treated as the most gated one,
an unknown actor as the least trusted, an unresolvable target as external
rather than internal, an unparseable amount as above the ceiling rather than
below it. Each is the same trade — an unknown resolves *toward* the gate, never
away from it — and it is the subject's closed-by-default posture applied to
classification instead of to permissions. Where a default resolves away from
the gate, that direction should be a decision somebody made in writing, not the
shape the fall-through arm happened to take.

One caveat keeps the rule from eating the ladder. If a large fraction of items
are landing at the top by default, the severity ladder has stopped measuring
risk and started measuring the parser, and the fix is upstream — at the
producer, at the schema, at the version skew — not a quiet relaxation of the
default back toward the cheap bucket. The loud default is designed to make that
situation impossible to live with. That is the feature.
