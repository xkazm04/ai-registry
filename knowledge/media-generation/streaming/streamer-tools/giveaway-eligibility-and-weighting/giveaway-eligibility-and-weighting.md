---
layer: golden-path
type: golden-path
subject: giveaway-eligibility-and-weighting
status: forged
use_when: [deciding who may enter a giveaway a streamer runs on air, choosing whether and how entries are weighted by viewer activity, adding a paid, subscriber or loyalty path to a draw, limiting how often the same viewers or the same group can win]
techniques:
  - post-moderation-only-entry
  - concave-activity-weights
  - free-path-forces-equal-odds
  - cohort-caps-checked-after-derivation
  - clock-proof-cooldowns
---

# Giveaway eligibility and weighting

A giveaway a streamer runs on air has two halves. One half turns a fixed list of entries
into winners, and can be made provable to the last byte. The other half decides what that
list contains: who was allowed in, who was kept out, and how much each entry weighs. No
proof of the first half says anything about the second. A perfectly verifiable draw over a
list that admitted a bot farm, weighted subscribers triple and let last week's winner in
again is a perfectly verifiable unfair draw. This subject is the second half — **the rules
that build the entry list, fixed so that no constraint can be bypassed after the fact and
money never buys odds**.

> **Eligibility is decided by the same gates the room already trusts, weight grows more
> slowly than activity, and every rule is enforced at the point no later path can route
> around.** A rule that holds on the common path and leaks on the rare one is not a rule;
> it is a default.

The naive reading treats eligibility as a filter applied to a list and weighting as a
number attached to a name. Both framings fail in the same way: they put the rule at one
convenient point in the pipeline and trust every other path to pass through it. Live tools
grow paths — a manual add for the viewer whose message was eaten, an import from last
stream, a quick re-open when the streamer forgot to say the keyword, a paid shortcut a
sponsor asked for. Each new path that does not pass through the rule is a way around it,
and the way around is always found on the night the prize is large.

## Entry is a consequence of moderation, not of chat

The room already has one authority that decides which messages count: moderation. A
message the moderation layer held, shadowed or removed is a message the room never saw;
an entry it produced is an entry the room cannot account for. So an entry is created
only from a message that **passed** moderation, and the type that carries it into the
entry list can be constructed from nothing else — not from the raw chat event, not from a
held message later approved by a path that skipped the verdict, not from a name the
streamer typed. A viewer under restriction is not entered; a viewer whose message is held
for review is entered only if and when the review passes it. Entry is per **identity** —
the platform's stable account identifier — and repeated messages collapse to one entry,
because otherwise the cheapest way to raise your odds is to type more. And who a viewer
is (subscriber, moderator, follower, a loyalty tier) is read from the platform's verified
fields, never from anything they typed; when that read fails, the viewer gets the least
privileged answer, not the claimed one. One consequence surprises streamers: entry follows
the verdict **in force**, so while a moderation rule is only observing — recording what it
would have done without doing it — the messages it would have removed pass, and their
senders enter. That is consistent, since the room saw those messages, and it means a draw
is guarded only by the rules that are actually armed; the tool says so where the draw is
configured. That is
[post-moderation-only-entry](./techniques/post-moderation-only-entry.md).

## Weight grows more slowly than activity

Weighting by activity rewards the regulars who make a stream a community, and it is the
most popular reason streamers want weights at all. The curve is the decision. Weight that
grows linearly with messages, minutes watched or streams attended turns the draw into a
contest of who could idle longest, and a single dedicated account outweighs a raid of
newcomers. The curve that works is **concave and capped**: every unit of qualifying
activity adds less than the one before, and after a stated number of units adds nothing.
The design states one number out loud and keeps it in the rules: **how many newcomers it
takes to outweigh the heaviest entrant** — strictly outweigh, since a tie is not a win.
That number must be small, greater than one, and computed by the tool from the curve, not
estimated by the streamer. The newcomer's base weight is as much a part of the curve as
the increments: a base of one under a curve of shrinking steps still lets the top grow
with the square of the cap, while a base that rises with the cap keeps the ratio growing
only in proportion to it, so raising the cap cannot quietly make newcomers negligible. What counts as
activity must itself resist farming: count distinct windows of presence or distinct
qualifying actions per window, never raw message volume, and count only messages that
passed moderation, because the moderation gate on entry means nothing if the weight
behind the entry was earned by spam it removed. See
[concave-activity-weights](./techniques/concave-activity-weights.md).

## Money never adds weight, and a free path forces equal odds

Money and its proxies — paid subscriptions, gifted subscriptions, purchased currency,
donations, cheers — never add weight to an entry. This is the line that keeps a giveaway
from becoming a raffle sold to the room, and it holds whatever a sponsor or a platform
feature would make convenient. Paid status may still gate **who may enter** — a
subscribers-only giveaway is a perk, and common — but the moment entry is gated by
anything of value, a free path to the same draw must exist, and the free path's entrants
must hold **equal odds** with everyone else. The cleanest enforcement is structural: when
a draw has a free path, the tool sets every entry's weight to one, whatever curve was
chosen, and says on the configuration screen that the curve is now flat. The free path
admits everyone, including viewers outside the gated pool; a free path that only lets
non-members in at lower odds is a discounted ticket, not a free path. Activity weights and
a free alternative path are not combined by tuning; one switches the other off. And the
draw's **declared** settings — "subscribers only", "free entry at equal odds", the
statements a policy check and the on-stream rules read — are derived from the mechanism
that actually runs, never stored beside it as a second set of switches, because two
fields that should agree are two fields a different client can set apart. The obligations that make this a legal requirement in many places — prize,
chance and consideration — belong to the guardrails next door; this subject owns the
mechanism that makes the promise impossible to break by configuration. See
[free-path-forces-equal-odds](./techniques/free-path-forces-equal-odds.md).

## A cap is checked on the winners, not only on the list

Streamers want limits that are about the result: no more than one winner from the
moderator team, no more than half the winners from the top loyalty tier, at most one
prize per household or per linked account. The tempting enforcement is to shape the list
before the draw — drop some moderators, down-weight the tier. That enforces nothing: the
list was shaped, but whether the winners respect the cap depends on luck, and the shaping
itself is an invisible edit to the odds that no verifier can recover. The cap is
therefore **declared before the freeze**, written into the frozen rules, and **checked
against the derived winners**: when a pick would breach a cap, the pick is skipped and the
next pick from the same derivation is taken, by a rule the verifier can replay. A cap
stated as a share rounds **down** to a whole number of winners, because a cap that rounds
up allows more than it says. The final winner set is validated against every cap before it
can be recorded; a set that violates one cannot be stored, whichever path produced it.
That validation alone is not enough when the derivation does not know the caps: a breach
then surfaces only as a refused result, and on a draw that allows one attempt a refused
result is a void draw with an audience watching. Caps belong in the derivation's
specification or not in the draw.

Caps also invert the usual direction of failing safe. For a privilege — entry to a gated
pool, a bonus weight — missing evidence grants nothing, and that is correct. For a
**limit**, missing evidence restricts nothing: a cap on a cohort whose membership the tool
cannot read counts zero members and binds nobody, and the streamer believes a rule is in
force that is not. A cap whose cohort cannot be resolved from verified data refuses to
freeze, rather than freezing as decoration.
See [cohort-caps-checked-after-derivation](./techniques/cohort-caps-checked-after-derivation.md).

## Cooldowns that a clock cannot shorten

"Last week's winner sits this one out" is the most requested fairness rule after "no
bots", and the most quietly broken. A cooldown measured on the streamer's machine clock
ends early when the clock is wrong, when the machine moves time zones, when a laptop's
clock is set forward to test something and never set back. A cooldown measured as "the
winner's timestamp is in the past" never ends when the stored timestamp is in the
future. The rule is to measure cooldowns in units the operator cannot move — the count of
completed draws since the win, or a time taken from an authoritative source and stored
with the win — and to **fail closed**: a cooldown whose start cannot be read, or whose
start lies after now, is treated as still running. A cooldown is part of eligibility, so
it is checked at entry — where the viewer can be told — and again, authoritatively, at the
freeze, because a viewer who entered before winning another draw must not ride the first
check into this one. It is recorded in the frozen rules and never re-evaluated after the
randomness is known. The win history it reads comes only from the tool's own draw record,
never from a client that could supply a shorter one. See [clock-proof-cooldowns](./techniques/clock-proof-cooldowns.md).

## Every rule is fixed before the randomness and recorded with the list

Eligibility and weight are inputs to the draw, so they inherit the draw's order of
operations: they are decided, written down and frozen **before** the randomness exists.
A rule changed after the randomness is known is a choice of winner, whether or not anyone
meant it as one. The frozen record carries not just each entry's weight but the rules
that produced it — the curve, the cohort caps, the cooldown, whether a free path was
open — so that a viewer who did not win can see why their entry weighed what it weighed,
and a viewer who was excluded can see which rule excluded them. The tool's copy states
the same rules in plain words on the screen the streamer uses to set them; a rule a
streamer cannot read is one they cannot promise to the room. That publication has a
cost: a weight derived from activity is a disclosure about each viewer's activity, and
the streamer reviews the list before sharing it.

## The failure modes of the naive reading

**The side door.** A manual add, an import, a "re-open entries" that bypasses the
moderation verdict. Any constructor of an entry that does not demand a passed message is
the hole. Make the passed message the only constructor.

**Weight by loyalty that is really weight by money.** A loyalty tier fed by a currency the
platform sells, a "supporter" badge that is a paid subscription, bonus entries per cheer.
Trace every input to the weight back to its source; if money is anywhere in the chain, it
is out.

**The capped list.** Enforcing a winners' cap by shaping the list, then trusting luck to
respect it. Check the winners.

**The wall-clock cooldown.** A cooldown that ends when the machine's clock says so.

**The decorative cap.** A cohort cap configured over membership nobody can read, so it
counts nobody and the streamer announces a limit that does not exist.

**Two switches for one fact.** A policy flag that says "free entry, equal odds" and a
mechanism flag that decides it, set by different screens. Derive the first from the second.

**The generous retroactive add.** The viewer whose message was eaten asks to be added after
the draw was announced. It is kind, and it is a late edit to a frozen list. The answer is
the next draw.

**Rules that live only in the streamer's head.** "Subs get two entries" said once on air
and never written down is a rule the tool cannot enforce and the verifier cannot check.

## Boundaries

**Against [verifiable giveaway draws](../verifiable-giveaway-draws/verifiable-giveaway-draws.md)**, which turns a frozen list into provable
winners: that subject begins at the freeze and owns everything after it — the beacon, the
derivation, the single attempt, the verifier. This subject ends at the freeze and owns
everything that decides the list's contents: who entered, what each entry weighs, which
caps and cooldowns apply. The rule a reader uses to pick is whether the question is about
the list's contents (here) or about what happens to a list once it is fixed (there). The
seam has one shared clause: cohort caps are declared here and replayed by the derivation
there, so the skip rule must be written in the draw's byte-exact specification, not only
in this subject's prose.

**Against [audience steering economies](../../live-show/audience-steering-economies/audience-steering-economies.md)**, and in particular its
sub-linear vote weight: both subjects use a concave curve to keep a few heavy participants
from carrying the outcome, and the arithmetic is shared. The difference is what the weight
buys. A vote weight multiplies a voice in a choice the room makes together, and the
safeguard is that a clear majority still wins. A draw weight multiplies a chance at a prize
one viewer takes home, and the safeguard is that no entrant's odds are bought and no
newcomer's odds are negligible. The rule: if the weighted thing is a decision about the
show, it is steering; if it is a chance at a prize, it is here. A show that uses one rank
system for both must check both properties separately, because a curve gentle enough for
a ballot can still make a draw feel closed.

**Against [authority from metadata only](../../trust-and-evaluation/live-chat-moderation-and-anti-bait/techniques/authority-from-metadata-only.md)**, in live chat moderation: that technique
owns the rule that roles come from the platform's verified fields and never from text, and
the fail-toward-less-authority default. This subject applies it to eligibility — a
subscriber-only draw reads subscription from metadata — and adds the draw-specific half:
an eligibility read that fails excludes the viewer from a gated draw, and a missing
moderation verdict excludes the entry, whatever the viewer claims.

Whether the giveaway may lawfully run at all — prize, chance and consideration, thresholds
for registration, the platform's own rules — belongs to the legal guardrails subject. This
subject assumes the draw is allowed and makes its entry rules unbreakable.
