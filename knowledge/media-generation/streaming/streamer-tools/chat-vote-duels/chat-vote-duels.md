---
layer: golden-path
type: golden-path
subject: chat-vote-duels
status: forged
use_when: [building a head-to-head chat vote or a bracket of them for a human streamer, deciding what chat line counts as a ballot and what happens to every other line, choosing and announcing a tie rule before a duel opens, a tool panel and the on-stream overlay disagree about a count]
techniques:
  - ballot-grammar-one-per-viewer
  - ballot-status-taxonomy
  - deterministic-tie-break-said-aloud
  - core-owns-the-count
---

# Chat vote duels

A chat vote duel is the smallest unit of audience choice a streamer can run: two
contenders, one timed window, and a room that answers by typing. "This or that" for the
next game, a bracket of sixteen fan-submitted names narrowed one pairing at a time, a
best-of between two clips. The streamer is a person, not a generated host, and the tool
does the counting so that the person can do the show. The subject is **the instrument
that turns a stretch of chat into a result**: what line counts as a ballot, what becomes
of every line that does not, how a tie is settled, and which single authority holds the
count that the streamer's panel and the stream overlay both display.

It looks trivial, and that is why it fails in public. Counting "1" and "2" in chat for
sixty seconds is an afternoon's work, and the afternoon's version is wrong in five ways
the room notices. It counts a viewer who typed "1" nine times as nine votes. It counts a
message moderation removed a second later. It counts the line "1 is better than 2" for
both sides, or for whichever digit the parser met first. It shows the streamer one number
and the stream another because the panel tallied its own copy of chat while the overlay
read the server. And when the count lands level, it picks a winner by whatever the code
happened to do — the first key in a map, the option listed first — and nobody, including
the streamer, can say why. Each defect is small; any one of them, caught on air by a
viewer who screenshots both numbers, turns a game into an argument about whether the
streamer is rigging it.

So the subject holds one property above the rest:

> **Every viewer can predict the count from the rules, and every surface shows the same
> count.** The rules — what counts, once per viewer, inside the window, the tie rule —
> are fixed and stated before the window opens; the count is made once, by one authority,
> after moderation; and the panel and the overlay are two windows onto that one count.

## A ballot is a sentence in a small grammar

Chat is free text and a ballot is not. The instrument accepts a line as a ballot only
when it matches one of two positional grammars the room can learn from a one-line
instruction: **the whole line is a token**, or **the first word is a token** and the rest
of the line is commentary. The first-word form is the one rooms learn fastest — "start
your message with 1 or 2" — and it lets a viewer vote and talk in the same line; its
price is that "1 is worse than 2" is a vote for one, which is acceptable because the
rule that decided it is visible. What is never acceptable is searching for a token
anywhere in the line, because the moment the parser reads intent out of sentences it
starts disagreeing with the viewer about what they meant. A paid message whose platform
prefix precedes the vote is read past the prefix and counted once, like any other
ballot: paying to send a line changes how the line looks, never how much it counts.

The voter is the platform's stable account identifier, never the display name, which
viewers change and impersonators copy. One identity holds one ballot per window, and the
duel states which ballot stands when a viewer votes twice. **First ballot stands** makes
every counted ballot permanent, so each side's live total only ever rises — the race the
room watches never steps backward. **Latest ballot stands** lets the streamer argue the
room round, at the cost of totals that can fall mid-window. Either is honest when it is
stated; the displaced ballot is kept and labelled, never deleted. Before identity, the
same line delivered twice — once live, once again on a reconnect or a page read — is
collapsed by its message identifier, so a replay is never a second vote. A ballot's time
is the time recorded with the line, not a timestamp the viewer's client offers and not
the moment some process happened to read it, so that a recount from the record lands on
the same total. That grammar and its identity rule are
[ballot-grammar-one-per-viewer](./techniques/ballot-grammar-one-per-viewer.md).

## Every line gets a verdict, and the verdicts add up

The naive counter has two outcomes: counted, and silently dropped. The drop bucket is
where every dispute goes to die, because when a viewer says "I voted and it didn't
count", nobody can tell them why. The instrument instead gives every chat line it saw
during the window exactly one status from a closed list: **counted**; **replaced** by
the rule above; **outside the window**, early or late; **not a ballot**, because it did
not match the grammar; **ambiguous** and **unknown option**, where the grammar can name
two contenders or a contender not in this duel; **withheld by moderation**, because the
line was held or removed before the close, recorded with the side it would have counted
for; **ineligible**, where the duel restricts who may vote. The statuses are exhaustive
and mutually exclusive, so lines seen equals the sum of the buckets — a reconciliation
the tool can check on every close and display on demand. Keeping the side of withheld
ballots lets the streamer see at a glance whether moderation changed the outcome, which
is the first question anyone asks when a removed spam wave leaned one way.

The taxonomy earns its keep three ways. The streamer can answer the viewer who did not
count with the reason. The operator can see a grammar problem — a flood of "not a
ballot" lines that were plainly meant as votes — while the window is still open. And a
test can assert on statuses instead of on totals, which catches the bug where two errors
cancel and the total looks right. That is
[ballot-status-taxonomy](./techniques/ballot-status-taxonomy.md).

Moderation runs before counting, not beside it. A ballot is counted only from a line
the moderation layer has passed; a line that is held for review is withheld until it is
released, and a line released after the window closed is too late, like any other late
line. Counting first and subtracting removed lines later is the shape that produces a
count that goes down on air — the most suspicious thing a counter can do.

## A tie is decided by a rule the room heard first

Head-to-head votes land level more often than intuition says, especially in small rooms
and in the late rounds of a bracket when the contenders are both favourites. The tie
rule therefore cannot be an afterthought, and it cannot be hidden. It is chosen when the
duel is configured, it is deterministic — given the same ballots it always picks the same
side — and it is stated where the room can see it before the window opens: on the
overlay, in the streamer's opening line. Good rules are those a viewer can check from
what they watched: the higher seed advances, the side that reached the tied total first
wins, or a short sudden-death window runs between the two. A random draw is legitimate
only when it is itself verifiable; an unseeded coin flip inside the tool is a hidden
decision, however fair the code. When the rule decides a duel, the result says so — "tied
at 41, higher seed advances" — because a tie settled silently looks exactly like a count
that was nudged.

The same labelling covers the streamer's own hand. A human streamer may call a winner
against the count — the room voted for a clip that turned out to break the rules, the
pairing was a joke — and a tool that forbids it will be worked around. What the tool
owes the room is that a call is never dressed as a count: every result carries **how it
was decided** — chat chose, tie rule, streamer call — on the panel and on the overlay
alike, with the count recorded beside a call so the room can see what it overrode. That
is [deterministic-tie-break-said-aloud](./techniques/deterministic-tie-break-said-aloud.md).

## One authority counts; every surface shows its count

A streamer's tool has at least two faces for a duel: the control panel where the
streamer opens and closes windows, and the overlay the broadcasting software renders on
stream. If either face counts, they will disagree — different connection, different
moment of joining, different reconnect gap — and the disagreement will be visible
because the streamer is looking at one while the room watches the other. The rule is
structural: **one process owns the count**, consumes chat after moderation, applies the
grammar, keeps the status buckets and the tie rule, and publishes versioned snapshots;
the panel and the overlay only render snapshots, and both show the version or close time
they rendered so a mismatch is diagnosable rather than mysterious. The count itself is
best made as a pure function — the moderated record of chat plus the window's open
spans in, totals and statuses out — recomputed whole rather than incremented, so that a
restart, a pause or an audit reproduces it exactly. A pause closes a span, and chat
typed while the duel was paused, or during an earlier attempt at the same pairing, never
counts. The close is the authority's decision too: the window ends on its clock, the
final snapshot is frozen and marked final, and nothing — a late message, a reconnect
replaying history — changes a final result.

The same rule binds the tooling around the instrument. A local demonstration mode that
fakes a count for a setup screen is labelled as a demonstration on every surface, so it
is never mistaken for, or screenshotted as, a real result; a count that includes even
one generated ballot carries a simulated badge on every face for the same reason. And
the generator that produces test chat must share one ballot producer with the
rehearsal it feeds, proved against the authoritative parser, so that tests exercise the
grammar the room will actually type rather than a second, drifting idea of it — a
generator that wrote the option's name where the grammar wanted its number has produced
a full rehearsal of a duel that closed at nothing to nothing. That is
[core-owns-the-count](./techniques/core-owns-the-count.md).

## Duels in sequence: the bracket

A bracket is a sequence of duels where each result seeds the next pairing, and it
amplifies every defect above: a tie settled inconsistently in round one changes who
meets whom in round three. The bracket's own state — seeds, pairings, results — lives
with the counting authority, and each duel is opened from that state rather than retyped
by hand. Seeds matter beyond pairing, because "the higher seed advances" is the most
legible tie rule there is, and it only works if the seeding was public before the first
round. A bracket that has to be re-run because a window opened on the wrong pairing is
re-run on air and said aloud; a result is never edited after it was final.

## Boundaries

**Against [audience steering economies](../../live-show/audience-steering-economies/audience-steering-economies.md)**,
which designs the powers a live show's audience holds and what each viewer's voice
weighs: that subject owns why a vote exists and the promise that its result is enacted
([binding votes](../../live-show/audience-steering-economies/techniques/binding-votes.md)),
and how much standing multiplies a voice
([sub-linear vote weight](../../live-show/audience-steering-economies/techniques/sublinear-vote-weight.md)).
This subject owns the counting instrument a human streamer runs: what text is a ballot,
what happens to every other line, how a level count is settled, and where the count
lives. A duel is flat by default — one viewer, one vote — and if a streamer weights it,
the curve and its checks are the economy's, applied by this instrument at the close. The
rule: if the question is whether the room's choice should change the show and by how
much each voice counts, it is the economy; if it is whether this chat line was a vote and
what the total is, it is here. The economy's binding rests on this instrument, because a
result nobody can reproduce is a result nobody is bound by.

**Against [show segment format design](../../live-show/show-segment-format-design/show-segment-format-design.md)**,
which writes the rules of a recurring segment: a duel night or a bracket is a format,
and its premise, its states, its clock and its handover are designed there. This subject
is the instrument a format declares open inside one of its states. The rule: if the
question is when the duel runs, how long the show stays on it and what follows, it is
the format; if it is how the window counts while it is open, it is here.

## The failure modes of the naive reading

**Count the digit anywhere.** A parser that finds "2" inside "honestly 2 is worse" is
counting opinions it guessed at. Whole-line or first-word tokens only.

**One message, one vote.** The viewer who types fastest wins. One identity, one ballot,
under a stated rule for which one stands.

**The call dressed as a count.** A streamer override shown as "chat chose". Every result
names how it was decided.

**Count, then moderate.** A total that drops on air when a removed message is
subtracted. Moderation first; withheld lines are a status, not a correction.

**Two counters.** The panel counts its chat, the overlay counts its chat, and a viewer
screenshots both. One authority; every face renders its snapshot.

**The silent tie.** A level count resolved by map order or list order, discovered later
by a viewer who did the arithmetic. Deterministic rule, announced before, cited after.

**The demo that escaped.** A fake count from a setup screen shown on stream or clipped as
real. Demonstration output carries its label wherever it is drawn.

## Measuring the instrument

Measure what the room experiences, not what the code believes. The reconciliation on
every close — lines seen equals the sum of statuses — is a hard check per duel, and a
failure is a broken duel, not a rounding note. The share of lines in "not a ballot" that
were plainly attempts (a token with trailing punctuation the grammar did not declare, a
token glued to the next word) measures whether the grammar matches how the room types.
The share of results decided by a call rather than the count tells the streamer how often
the room is being overruled, which the room is already counting. Panel and overlay agreement is measured by comparing the snapshot version each
displayed at close; any final-state mismatch is a failure. Tie frequency per round tells
the streamer how often the stated rule will be heard and therefore how much it matters
that it is a rule the room accepts. A duel whose log was lost is recorded as unchecked,
never as clean ([unmeasured-is-not-pass](../../../_laws.md#unmeasured-is-not-pass)).
