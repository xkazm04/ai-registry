---
layer: golden-path
type: golden-path
subject: verifiable-giveaway-draws
status: forged
use_when: [building a giveaway or raffle a streamer runs on air, choosing where a draw's randomness comes from, deciding what a viewer must be able to recompute after a draw, handling a failed or disputed draw without a reroll]
techniques:
  - freeze-and-announce-before-randomness
  - public-beacon-round-after-margin
  - trust-anchor-outside-the-proof
  - unbiased-weighted-sampling
  - single-attempt-no-reroll
  - independent-verifier-parity
---

# Verifiable giveaway draws

A streamer giving away a prize on air is asking the room to believe that the name on the
plate was not chosen. Every viewer who did not win has a reason to doubt it, and the
streamer has no way to prove a negative by sounding sincere. A **verifiable draw** removes
the need for belief: the draw publishes everything a sceptical viewer needs to recompute
the winners on their own machine, and it is built so that the streamer never held a
moment at which they could have chosen a different outcome. The subject is the craft of
those two properties and of the order of operations that delivers them.

> **Recomputable and ungrindable, both.** Recomputable: anyone holding the published
> record gets the same winners, byte for byte. Ungrindable: no party — the streamer, the
> tool, the server — ever saw the randomness while it could still change the inputs, pick
> the round, or decide whether to keep the result.

The two are routinely confused, and the confusion is the subject's central failure. A
deterministic algorithm seeded by a value the streamer typed is perfectly recomputable
and proves nothing: the streamer could have tried a thousand seeds before going live and
typed the one that picked their friend. A spinning wheel animation is neither — it is a
picture of randomness, rendered by the same machine that knows the answer. A screenshot
of a third-party random-number page proves that a page once showed a number, not that it
was the first number, nor that the list it was applied to is the list the room saw.
Every naive design fails the same way: somewhere there is a point after the randomness
was knowable and before the result was fixed, and whoever stood at that point could
choose.

## The order of operations is the proof

The draw is a sequence, and its integrity is a property of the sequence rather than of
any single step. **Freeze** the entry list — names, weights, canonical order — and
compute a digest over its exact bytes. **Announce** that digest together with the
identifier of a randomness value that does not yet exist. **Wait** until it exists.
**Fetch** it, **verify** it, **derive** the winners deterministically from the frozen list
and the verified value, and **publish** the full record. Every input the operator controls
is fixed and public before the randomness is born; the randomness is fixed and public
before anyone could act on it. Reorder any two steps and a choice point reappears: an
entry list frozen after the value is known can be edited to favour a name; a value chosen
after the list is known can be shopped for. That ordering is
[freeze-and-announce-before-randomness](./techniques/freeze-and-announce-before-randomness.md).

The announcement must be public in a way the operator cannot later revise — said on
stream, posted in chat, rendered on the overlay — because a commitment nobody saw is a
commitment the operator could have made after the fact. This is also the proof's one
external dependency, and it is worth saying plainly: a published record, however complete,
cannot show on its own that its digest was announced on time, nor that no earlier attempt
was discarded. An operator who rewrites both the record and its digest produces a
consistent forgery. Only the witnessed announcement — the stream's own recording, the chat
log — breaks the tie, so the tool keeps it with the record and the verifier tells the
viewer to compare against it.

Best of all, the round is not *named* at the announcement but *derived* from it: commit the
freeze time and the margin inside the digested bytes, and define the round as the first one
scheduled strictly after that time plus margin. The verifier then recomputes the round
itself, and a record that points at any other round fails a check rather than a judgement.

## Randomness nobody in the room can predict or steer

The randomness comes from a **public randomness beacon**: a service that publishes a new
value at fixed intervals, each value a threshold signature produced jointly by
independent parties over the round number, so that no single party can predict or bias a
future round and anyone can check a past one against the network's public key. The
alternatives each fail one of the two properties. A value the operator generates is
unverifiable by construction. Commit-and-reveal between the operator and the viewers has
a last-revealer problem: whoever reveals last sees everything else and may decline to
reveal, which is a veto, and a veto is a choice. A tool may still offer an operator
commit-and-reveal as a fallback for when no beacon is reachable, and it is honest to do so
on one condition: the weaker source carries a permanent label — *operator-controlled* —
from the moment it is chosen through the verifier's verdict to the plate on stream, and no
amount of successful verification ever upgrades it to the beacon's wording. A value derived from some public feed the
operator does not control — a market price, a sports score — is usually low-entropy,
coarsely timed and ambiguous about which reading counts.

Which round is the second half of the decision. Rounds are scheduled on a public clock,
so the draw names a round whose publication time lies **strictly after** the announcement
is visible, with margin for clock skew between machines, for the announcement's own
latency to the viewer, and for the beacon's publication jitter. A round chosen too close
is one the operator might already have seen; a round chosen far ahead makes the room wait
through dead air. That trade is
[public-beacon-round-after-margin](./techniques/public-beacon-round-after-margin.md).

## A signature checked against the key it came with checks nothing

The beacon value is only as good as the check of its signature, and the check is only as
good as the public key it uses. A verifier that fetches the beacon's public key from the
same endpoint that served the signature has verified that the endpoint is consistent with
itself, which an impostor endpoint also is. The network's public key — and the identifier
of the chain it belongs to — is the **trust anchor**, and it must arrive by a separate path
the attacker does not also control: compiled into the verifier, pinned in its published
source, printed in the draw rules before the draw. A record that carries its own key is
recomputable but not authenticated, and the verifier must say exactly that rather than
pass it. This is the subject's application of
[unmeasured-is-not-pass](../../../_laws.md#unmeasured-is-not-pass): "the winners follow from
this value" and "this value is the beacon's" are two different checks, and a verifier that
performed only the first reports the second as unverified, never as green. See
[trust-anchor-outside-the-proof](./techniques/trust-anchor-outside-the-proof.md).

## Turning a random value into winners, without bias

The derivation is where honest systems quietly cheat by accident. Reducing a random word
to an index with a remainder favours the low indices whenever the list length does not
divide the word's range; for a few hundred entries over sixty-four bits the bias is tiny,
and a verifiable draw still may not have it, because "tiny" is a claim the verifier cannot
recompute and a reviewer will find. The derivation draws words from a domain-separated
expansion of the beacon value — a hash over the value, a purpose tag and a counter — and
rejects words at or above the largest multiple of the target range. Weighted entries are
sampled **without replacement** over a cumulative sum in a canonical order, removing each
winner before the next pick. Every one of those choices — byte encoding, order, tag,
counter increment, rejection limit — is part of a written, byte-exact specification,
because two implementations that agree on the idea and differ on a byte produce different
winners and each looks correct alone. Entrants are identified by the platform's stable
account identifier, never a display name, because a display name can change between freeze
and claim and two entrants can share one. And whatever animates the result on stream
consumes the verified winners and nothing else: an animation with its own random-number
call, or any setter that accepts a winner, is a second authority over the outcome, however
decorative it was meant to be. See
[unbiased-weighted-sampling](./techniques/unbiased-weighted-sampling.md).

## One draw, one attempt

A draw that can be run again is a draw whose operator chooses among outcomes, however
rarely they exercise the choice. The attempt is therefore **consumed at announcement**,
not at success. If the beacon is unreachable, the round is still the round: the draw waits
or is visibly abandoned, and an abandoned draw stays on the record next to any successor.
Asking for the result twice returns the stored result, never a second sample; asking too
early is refused without consuming anything.
If a winner turns out ineligible or does not claim, the replacement follows a rule written
before the draw — the next pick from the same derivation — not a fresh run. And an
announcement made after the named round was already published is refused, because by then
the operator could have seen it. See
[single-attempt-no-reroll](./techniques/single-attempt-no-reroll.md).

## A proof the operator wrote is checked by a verifier somebody else could write

The verifier a viewer runs must not be the code that drew. A verifier that imports the
drawing library inherits its bugs as agreement. The standard is a second implementation,
written from the specification alone, that a viewer can run without the streamer's server
— in a browser page that works offline, or a small published program — kept in lockstep
with the drawing code by shared test vectors that include tampered records with their
expected failure reasons. Parity is a test that runs on every change, not a launch-day
check. See [independent-verifier-parity](./techniques/independent-verifier-parity.md).

## What the proof establishes, and what it does not

The record proves that **these winners follow from this frozen list and this beacon round
under this algorithm**, and that the round was named before it existed. It does not prove
that the list is honest: that every entrant was a real, distinct, eligible viewer, that
nobody was quietly left out, that the weights were the advertised weights. It does not
prove the prize is delivered, nor that the giveaway was lawful to run. A tool that shows a
verified badge must say, in the same place, what the badge covers — overclaiming the proof
is the subject's version of [output-never-outruns-evidence](../../../_laws.md#output-never-outruns-evidence),
and it is the claim a hostile viewer will test first. The list's honesty is defended
elsewhere, by fixing eligibility before the freeze and publishing the list in a form each
entrant can find themselves in. That publication has a cost the tool must surface rather
than hide: a complete record exposes every entrant's identifier and weight, so the operator
reviews it before sharing it, and the weights of a draw that counts activity are themselves
a disclosure about each viewer.

## Boundaries with the neighbours

This subject begins at the frozen list and ends at the published record. **Who may enter
and what each entry weighs** — moderation before entry, activity-based weights, the rule
that money never buys odds, cohort caps — belongs to
giveaway-eligibility-and-weighting; the rule a reader uses to pick is whether the question
is about the list's contents (theirs) or about what happens to a list once it is fixed
(ours). **Whether the draw may run at all** — prize, chance and consideration, registration
thresholds, platform disclaimers — belongs to giveaway-legal-guardrails, which gates the
draw before freeze and is silent about how winners are derived. And the **result plate on
stream** is governed by summary-rendered-from-the-run in live-system-demo-film: the winners
shown are reduced from the draw record, never typed; this subject owns the record that
reduction reads, and owns the requirement that the plate state what the proof covers.

## Failure modes of the naive reading

The recurring failures are worth naming because each looks reasonable in isolation. The
**typed seed**: recomputable, ungrindable only if you trust the typist. The **wheel**: a
rendering of the answer, presented as the process that found it. The **retry on error**:
an honest-looking recovery path that is, structurally, a reroll button. The **self-signed
record**: a beacon value whose key travelled with it. The **modulo pick**: biased by an
amount nobody measured. The **shared verifier**: two views of one bug agreeing with each
other. The **late freeze**: an entry list closed after the round was out, usually because
someone asked to be added and it seemed kind. Each is caught by the same question asked
at each step: at this moment, could anyone who already knows the randomness still change
what it will select?
