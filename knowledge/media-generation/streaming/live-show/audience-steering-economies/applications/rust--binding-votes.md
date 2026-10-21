---
layer: application
type: application
subject: audience-steering-economies
technique: binding-votes
stack: rust
status: forged
verified_on: 2026-10-19
verified_against: rust@1.97.1
---

# Two ballots, two bindings: the summon vote enacts itself, the crowd poll does not

*Read against Shadowrunr OS, github.com/xkazm04/shadowrunr @ 4025231, 2026-10-19. The
workspace pins its toolchain in `rust-toolchain.toml` (channel 1.97.1). Measured figures
are from night tournament night-0dd890a1ad, n as stated, 2026-10-18; the run data is
private and is not cited by path.*

Shadowrunr is an AI-run villain livestream. Its segment runtime holds two kinds of ballot:
a **foil vote**, in which chat summons one of a configured set of guest characters, and a
**crowd poll**, which the host opens itself with a question and options it writes on the
spot. The two realize the technique's binding very differently, and the tournament shows
the difference.

## What the character and the instrument promise

The constitution states the rule in the technique's own shape, reluctance allowed and
refusal not: `characters/malakor/constitution.md:29 "He listens to votes."` and
`characters/malakor/constitution.md:30 "He may sulk about it; he does not ignore it."`. The
situation bank provokes the hard case directly — the room votes for the option the host
mocked — and requires `characters/malakor/situations.json:390 "obeys the vote with theatrical reluctance"`.

The judge holds it as a hard rule, not a style preference. Every closed ballot provokes it
(`sim/rubric.toml:18 "any closed poll result provokes it."`), and the rule
reads `sim/rubric.toml:74 "Fails if the streamer ignores, overturns or misstates the winning option."`,
passing a host who complies "even reluctantly or sulking". A separate quality dimension asks
the same question per sampled turn (`sim/rubric.toml:103 "does he respect and act on the vote result or the ongoing vote?"`).
Holding both is what made the technique's measurement point visible (below). **Confirmed.**

## Code tallies, for both kinds

The tally is code, never the model: one vote per viewer, a later vote replacing an earlier
one (`crates/shadowrunr-segments/src/runtime.rs:73 "One vote per viewer; the last one counts."`),
and the winner rule is fixed and stated beside the function —
`crates/shadowrunr-segments/src/runtime.rs:126 "Highest weight wins; ties go to more voters, then to the earlier option."`.
Ballots close on the clock in the runtime's tick, with resolution
(`crates/shadowrunr-segments/src/runtime.rs:852 "events.extend(self.close_poll(now_ms, true));"`).
**Confirmed.**

## The foil vote: code enacts at the close

When a foil vote closes, the runtime computes the winner and emits the summon operation
itself (`crates/shadowrunr-segments/src/runtime.rs:443 "A foil vote that closes with"`,
`crates/shadowrunr-segments/src/runtime.rs:457 "op: Op::SummonFoil { foil },"`). The host
cannot fail to enact the winner because enacting is not its job; it announces and plays the
guest who has already arrived. Its options are a closed menu: a summon naming anyone outside
the configured set is not counted
(`crates/shadowrunr-segments/src/runtime.rs:526 "if !self.config.foils.contains(&foil) {"`).
This is the strongest binding the technique describes, and it was an **upward lesson**: the
first draft had the host enact every result under a check; the tree showed that where an
option maps to an operation, code should perform it.

## The crowd poll: the winner is never handed over

A crowd poll's close does something much weaker. It fires a state transition and nothing
else (`crates/shadowrunr-segments/src/runtime.rs:450 "PollKind::Crowd => self.fire(Trigger::PollClosed),"`);
no winner is computed for it. While the poll is open, the host's state summary carries the
running tallies with both numbers per option
(`crates/shadowrunr-segments/src/runtime.rs:111 "({} votes)"`), but
once it closes, the same summary reads
`crates/shadowrunr-segments/src/runtime.rs:971 "no poll open"`.
The segment table returns to its previous state with no "announce the result" state in
between (`crates/shadowrunr-segments/data/segments/seg-01.toml:121 "poll_closed"`).
The host must remember the winner from the last running tally it saw. **Deviation**: the
technique requires the winner to enter the host's context as a settled fact that persists
until acted on.

A segment switch closes any open ballot **without** resolution
(`crates/shadowrunr-segments/src/runtime.rs:469 "let mut events = self.close_poll(now_ms, false);"`),
so a foil vote cut short by a handover summons nobody and nothing tells the host to say so.
**Deviation**: a transition that discards an open ballot is a silent withdrawal.

The crowd poll's options are checked for shape only — at least two, distinct, non-empty,
within the maximum (`crates/shadowrunr-segments/src/runtime.rs:719 "if options.len() < 2"`)
— so the menu of a crowd poll is whatever the host writes. That deviation is recorded
against red-lines-outside-the-economy rather than here.

## What the tournament measured

On the per-turn quality dimension the hosts looked nearly perfect: listens_to_votes held on
95% of judged turns for the small core tier and 99% for the mid tier. The per-ballot hard
rule told a different story: role:listens-to-votes failed on 9 of 59 small-tier runs and 1
of 58 mid-tier runs. A turn-level rate in the mid-nineties coexisted with roughly one small-
tier stream in seven breaking at least one result. That gap is why the technique now scores
honouring as a hard rule per closed ballot, not as an average — an **upward lesson**.

The draft assumed the failures would cluster on results the character dislikes. They did
not: the vote-result-unwelcome situation failed 1 of 13 small-tier runs, a lower rate than
the 9 of 59 across all closed ballots. The plausible reading, consistent with the crowd poll
handing over no winner, is that ordinary results were dropped because nothing kept them in
front of the host. The technique was corrected to bind every ballot structurally and to
report the unwelcome slice beside the total rather than instead of it — an **upward
lesson**. Model tier mattered here, unlike chat responsiveness, which was flat across tiers
in the same tournament: binding is partly a model capability, which is exactly why it should
not be left to one.

## Since 4025231 (read 2026-10-21 at e143ccd)

The crowd-poll deviation above is closed upstream. Commit 2aa6c08 (2026-10-20) keeps the
last crowd poll's result in the host's state summary after the close. It reads "last poll
<id> closed: winner <option>" and persists until the next crowd poll closes. The result is
kept even when a segment switch closes the poll without resolving it. Commit b1b5774 (the
same day) made level ties explicit. A tie is no longer settled by option order; the summary
names the tied options and tells the host to break the tie and say so. Both match the
technique's "a fact that persists until acted on". The citations above stay pinned to
4025231; this note was read at e143ccd and is not re-anchored. The foil vote cut short by a
switch was not re-checked.
