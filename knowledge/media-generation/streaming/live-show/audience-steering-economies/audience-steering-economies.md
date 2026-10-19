---
layer: golden-path
type: golden-path
subject: audience-steering-economies
status: forged
use_when: [designing votes, ranks, proposals or gift acknowledgements for a live show, deciding how much a high-rank or high-spend viewer may steer, diagnosing a room that has stopped voting or a host that ignores results, checking whether any audience power can reach the show's red lines]
techniques:
  - sublinear-vote-weight
  - rank-gated-proposals-with-climb-path
  - binding-votes
  - visible-consequence-of-steering
  - gift-as-in-world-tribute
  - red-lines-outside-the-economy
---

# Audience steering economies

A live show whose audience can only watch is a broadcast. A live show whose audience can
change what happens next — pick the next bit, nominate a target, choose between two
endings, pay tribute and be seen paying it — is a game the room plays with the host, and
the room comes back to play it. The audience steering economy is **the set of powers the
audience holds over the show and the currency in which those powers are earned**: ranks
that measure standing, vote weights that turn standing into influence, proposals that let
trusted viewers author the choices, and gifts that let viewers spend on the show and be
thanked for it.

Every design decision in the subject is held to three properties at once:

> **Steering is real, visible, and bounded.** Real: a result the room wins changes the
> show. Visible: the room can see that it did, and who did it. Bounded: influence grows
> more slowly than standing or spend, and nothing anyone earns or buys reaches the show's
> red lines or its core.

Each property is easy alone and the three fight each other. A show that makes steering
real without bounding it hands the show to whoever spends most. A show that bounds it by
quietly ignoring results it dislikes has made it unreal, and the room notices within a
night. A show that makes it real and bounded but invisible — the result is enacted three
minutes later with no reference to the vote — has spent the trust and bought none of the
engagement. The craft is holding all three.

## Standing is a ladder, and the ladder must be climbable

A rank system is a promise: participate and you will matter more. It earns its keep when
the climb is visible and reachable, and it rots when the top is a closed club. Two
currencies feed standing on a healthy show — **participation** (time present, messages
the host answered, votes cast, streams attended) and **spend** — and the ladder must be
climbable on participation alone, because a ladder that only money climbs teaches the
non-paying majority that the economy is not for them, and they are the room. Spend may
accelerate the climb; it may not be the only staircase. A ladder derived entirely from
paid status is the common shortcut, because the platform hands those numbers over for
free and participation has to be counted by the show itself; it is a shortcut that turns
every "here is how to climb" into "here is what to buy".

What the ladder gates is powers, and the powers are graded by how much trust they need. A
vote is a selection among options someone else vetted, so everyone gets one. A proposal
is authorship — free text that may become an option the whole room sees — so it is gated
to viewers who have shown they are here in good faith. The gate is always paired with the
way through it: a low-rank viewer who tries to propose is told warmly what rank proposing
needs and how to reach it, which turns a refusal into the first rung. That is
[rank-gated-proposals-with-climb-path](./techniques/rank-gated-proposals-with-climb-path.md).

## Influence grows sub-linearly

Rank buys vote weight, and the curve is the most consequential number in the economy. A
linear curve — or worse, weight proportional to spend — makes the top handful of voters a
majority of every ballot, and the room learns that voting is a spectator sport played by
whales. A flat curve makes standing worthless. The curve that works is **concave**: each
rank is worth more than the last, by less than the last, so the highest rank counts for a
few newcomers and never for a crowd. The test is a ratio, not a feeling: state how many
newcomer votes it takes to outvote the single heaviest voter, keep that number small but
greater than one, and check that the top ranks together cannot carry a ballot against a
clear majority of the room. One viewer gets one vote per ballot; weight multiplies a
voice, it never duplicates it. Ties go to the side with more voters, because a tie in
weight with a gap in heads means the heavier voters are the minority. The curve and its
checks are [sublinear-vote-weight](./techniques/sublinear-vote-weight.md).

## When you ask, you obey

A vote is a contract the host signs by calling it. The fastest way to destroy a steering
economy is to overturn a result — openly, by declaring it void, or quietly, by enacting
something adjacent and hoping nobody checks. Once is enough for the room to stop voting.
So the host only puts options on the ballot that the show can and will execute, states the
closing time and the tie rule before voting opens, and when the result lands, **announces
it accurately and enacts it**. A host with a personality may perform reluctance — a villain
can sulk, a deadpan host can sigh — and the performance is part of the fun, provided it
ends in compliance. The intuitive worry is the result the host's character dislikes, and a
generative host does sometimes argue that one away. But hosts also drop and misstate
perfectly ordinary results — a closed ballot is one fact among many in a crowded context —
so the cure is structural and covers every ballot. The tally is computed by code; where the
winning option is a show operation, code performs it at the close and the host only
announces and plays it; otherwise the winner is handed to the host as a fact that persists
until acted on, and whether the host enacted it is checked. That is
[binding-votes](./techniques/binding-votes.md).

## A result nobody sees is a result nobody won

Steering pays only when the room can draw the line from its choice to the change. The
consequence must land soon — within the same segment, ideally within the minute — and it
must be **attributed**: "you chose the trap door, so the trap door it is", with the margin
when the margin is the story. Attribution names the room or the proposer, never a guessed
individual: a host that thanks the wrong viewer for a winning proposal has told the real
author their contribution was invisible, and told everyone else the host is not watching.
Every claim the host makes about a vote — who won, by how much, whose idea it was — is
read from the tally, not composed from impression. The show also remembers: a later
callback to "the night you chose the trap door" turns a single result into a running
history the room owns. That is
[visible-consequence-of-steering](./techniques/visible-consequence-of-steering.md).

## Gifts are tribute inside the fiction

Viewers who spend on a show are buying, overwhelmingly, the moment of being seen spending.
A show that treats gifts as a transaction — a list of names read in a flat voice — wastes
the one moment the viewer paid for; a show that treats gifts as purchased control sells
something it must not sell. The design that works translates the gift into the show's own
world: an offering to the host's character, a contribution to the in-show cause, a coin
thrown on stage, acknowledged in voice, in character, attributed correctly. The scale of
the acknowledgement grows with the gift, sub-linearly and with a ceiling, because a gift
that buys a minute of airtime per unit of currency converts the show into an auction for
the host's attention. A gift that is gifted onward — one viewer buying standing for
others — credits the giver and welcomes the receivers, both by name where the room is
small enough for names. Every gift receives its acknowledgement even when the giver has
used up their share of the host's attention — the caps bound the airtime around a tribute,
never the tribute — and the names come from the platform's record of the gift, not from a
chat line claiming one. Gifts may raise standing and may trigger a celebration; they never
purchase content outside the allowlist, a persona break, or the host's guilt. That is
[gift-as-in-world-tribute](./techniques/gift-as-in-world-tribute.md).

## The red lines are not on the menu

Every steering power operates over a **closed menu**: the set of things in the show the
audience is allowed to change. Which segment runs next, which of two premises plays out,
which nominated target the host addresses, how the host's tone is dialled within its
range. The red lines — what the show never does, in any tone, under any vote — and the
host's core identity are not items on that menu at a high price. They are not on the menu.
That distinction is the whole safety argument of the subject: a ballot that offers only
allowlisted options cannot elect a red line, a proposal that must clear moderation and the
red-line screen before it becomes an option cannot smuggle one in, and a gift whose only
effect is acknowledgement and standing cannot buy one. Because unacceptable options never
reach the ballot, binding votes can be absolute. On the rare occasion something slips
through — a proposal that became harmful through events after it was accepted — the host
withdraws it openly and in character, says the option was struck, and runs the rest of the
ballot; it never silently fails to enact a winner. That is
[red-lines-outside-the-economy](./techniques/red-lines-outside-the-economy.md).

## The failure modes of the naive reading

**Weight by spend.** The most intuitive design and the most corrosive: the top spender
becomes the electorate. Spend may feed standing; standing feeds weight through a concave
curve; spend never feeds weight directly.

**Gate everything.** A show that reserves every power for its top ranks has an audience of
spectators and a cast of a dozen. Votes are for everyone; only authorship is gated.

**Ask, then decide anyway.** A host who calls a vote as theatre and picks the outcome they
wanted has made every future vote a lie. If the host wants an outcome, the host chooses it
without a ballot.

**Steer something invisible.** Votes on parameters the room cannot perceive — a hidden
difficulty, a background setting — feel identical to no vote at all. Steer what the room
will see change.

**Let the economy price the core.** "Ten thousand gifts and the host says anything" is the
design that ends shows. No price reaches a red line, and no climb unlocks one.

**Read names from memory.** The host's model of who said what is a summary, and summaries
misattribute. Credits come from the record.

## Measuring the economy

The economy is healthy when the room uses it, and the useful figures are measured on the
room. Turnout per ballot as a share of active chatters, and how it trends across a stream
and across streams — falling turnout is the first symptom of a vote that was overturned or
ignored. The distribution of winning weight: the share of ballots in which the head-count
winner and the weighted winner differ, which should be rare and should be told when it
happens. Time from a ballot closing to its consequence on screen. The share of viewers who
climb a rank by participation alone. And, for a generative host, whether every closed
ballot was announced correctly and enacted — scored as a hard rule per ballot, not as an
average over the host's turns, because a turn-level rate in the mid-nineties can hide a
broken result on a meaningful share of streams, and the broken result is the one the room
remembers. Report the results the character disliked as their own slice beside it.

## Boundaries

**Against [audience absorption at scale](../audience-absorption-at-scale/audience-absorption-at-scale.md)**, which allocates the host's attention across the
chat: absorption owns *who is answered and how often*, including the cap that keeps the
biggest gifters and the highest ranks from monopolising the host's voice. This subject owns
*what the audience's powers are and how much each viewer's power weighs* — vote weight,
the proposal gate, what a gift buys. The rule: if the question is whether a viewer's message
gets spoken to, it is absorption; if it is whether a viewer's choice changes the show, it
is here. A gift's acknowledgement sits on the seam, and the split is clean: the shape and
scale of the in-world tribute is designed here, and its claim on airtime is capped there.

**Against human-in-the-loop approval**, the discipline of pausing a machine for a person's
decision at a consequence boundary: when the owner of the show approves a plan or issues a
directive, that is an operator decision with authority over the system, and it lives there.
Audience steering is not approval. Viewers hold no authority over the system; they hold
powers inside a menu the owner defined, and nothing a viewer does is a consent or a review.
The rule: if the decider is accountable for the show, it is approval; if the decider is a
member of the audience, it is steering, and the owner's directives sit above the economy,
never inside it.

**Against [live safety rails](../../trust-and-evaluation/live-safety-rails/live-safety-rails.md)**, which defend the audience, and real people outside it, from
the show: the rails are the checks that keep the host from harming anyone, and they run on
every path whatever the economy says. This subject owns the economic design that keeps
those lines off the menu in the first place — the allowlist, the proposal screen, the
rule that gifts buy acknowledgement and never content. The rule: if the question is what
the host must never do, it is the rails; if it is how the economy is shaped so that no
power can ask for it, it is here. Neither replaces the other: a well-shaped economy still
runs behind the rails, and the rails are never asked to stop a vote the menu should not have
offered.

No money mechanics are in scope. How a platform charges, settles or refunds a gift is
billing; this subject begins once the gift has arrived as a signal and asks only what the
show does with it.
