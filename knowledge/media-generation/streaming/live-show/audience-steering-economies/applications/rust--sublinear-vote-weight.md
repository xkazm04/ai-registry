---
layer: application
type: application
subject: audience-steering-economies
technique: sublinear-vote-weight
stack: rust
status: forged
verified_on: 2026-10-19
verified_against: rust@1.97.1
---

# A concave ladder from 1.0 to 2.4, honest about being a guess

*Read against Shadowrunr OS, github.com/xkazm04/shadowrunr @ 4025231, 2026-10-19. The
workspace pins its toolchain in `rust-toolchain.toml` (channel 1.97.1). No tournament
figure bears on vote weight directly: the simulator's ballots are not weighted by a
realistic rank mix, so the curve below is unmeasured on any audience.*

Shadowrunr's viewers hold one of six ranks, and a rank multiplies a viewer's vote. The
ladder lives in a data table the daemon loads at start, and it realizes most of the
technique — the shape, the ceiling, one voice per viewer, the tie rule, both numbers in
front of the host — while falling short on where the shape is enforced and on what the
ladder is climbed with.

## The curve

The table states its purpose in the technique's words:
`crates/shadowrunr-segments/data/ranks.toml:13 "Weights grow sub-linearly so a Dread Council vote never drowns out the room."`.
Weights run from `crates/shadowrunr-segments/data/ranks.toml:23 "weight = 1.0"` for the base
rank to `crates/shadowrunr-segments/data/ranks.toml:53 "weight = 2.4"` at the top, through
increments of 0.4, 0.3, 0.3, 0.2 and 0.2. The heaviest single voter counts for 2.4
newcomers: small, above one, a few rather than a crowd. Spend past the top rank buys no
further weight, which is the ceiling the technique asks for. **Confirmed.**

The test that ships with the table checks concavity on it —
`crates/shadowrunr-segments/src/ranks.rs:235 "Increments shrink or hold: sub-linear growth."`
— and the table labels its own numbers as proposals:
`crates/shadowrunr-segments/data/ranks.toml:3 "ASSUMPTIONS, NOT MEASURED."`, to be
recalibrated after the first real streams. That label is the technique's rule that first
weights say they are a guess. **Confirmed.**

## Where the shape is enforced

The loader is weaker than the test. It rejects a table only when weights are not positive
or fall (`crates/shadowrunr-segments/src/ranks.rs:128 "weights must be positive and non-decreasing; {:?} has {}"`),
and the daemon loads the table from a path when one exists
(`crates/shadowrunr-segments/src/ranks.rs:92 "pub fn load_or_builtin(path: &Path) -> Result<Self, SegmentError> {"`).
A retuned table with weights 1, 2, 4, 8 would load cleanly; the concavity test only guards
the table compiled into the binary. **Deviation**, and the source of an **upward lesson**:
the technique now says to enforce the curve where the table is loaded.

## The population check, and its hinge

Working the technique's two-thirds check against this table exposed a hinge the first draft
lacked. With a top weight of 2.4, a third of the voters at the top rank outweighs the other
two-thirds at weight one (one third at 2.4 is 0.8 of the electorate's newcomer-equivalents
against 0.67). The check holds on this show only because the top ranks are rare. The
research behind the simulator draws subscription tiers as
`docs/research/05-chat-patterns.md:196 "Sub tiers are drawn as Tier 1 84%, Prime 15%, Tier 2 or 3 1%"`,
and the top rank needs the highest tier held for a year or fifty gifted subscriptions
(`crates/shadowrunr-segments/data/ranks.toml:54 "min_gifted = 50"`), so a top-rank third of
a ballot is implausible today. It is a population fact, not a property of the curve, and the
technique now says so — an **upward lesson**: a top weight at or below two passes the check
for any population; above two it rests on the top staying rare.

## One voice, the tie, and both numbers

Each viewer holds one vote, the last one counting
(`crates/shadowrunr-segments/src/runtime.rs:73 "One vote per viewer; the last one counts."`).
Weight ties go to more voters, then to the earlier option
(`crates/shadowrunr-segments/src/runtime.rs:126 "Highest weight wins; ties go to more voters, then to the earlier option."`).
The host's view of a running ballot carries the weighted total and the head count side by
side (`crates/shadowrunr-segments/src/runtime.rs:111 "({} votes)"`), which lets it describe a
race in which the veterans outweigh the room. **Confirmed.** The earlier-option rule is a
reasonable pre-stated tiebreak, but it is stated in code, not to the room; the technique's
"announce the tie rule" is unmet.

Weight is taken at the moment of the vote
(`crates/shadowrunr-segments/src/runtime.rs:513 "let weight = self.config.ranks.vote_weight(rank);"`),
not at the close. On a ten-minute ballot the difference is negligible.

## What the ladder is climbed with

Rank is derived entirely from paid status. The table's own semantics name the inputs as
subscription tier, subscribed months and gifted subscriptions
(`crates/shadowrunr-segments/data/ranks.toml:10 "is the number of subscriptions the viewer has gifted to others."`),
and the base rank is defined as the non-subscriber
(`crates/shadowrunr-types/src/chat.rs:17 "is a non-subscriber who votes with"`).
A viewer who never pays never climbs, however long they stay. The weight curve itself is
sound; the standing it is a curve of is spend-only. **Deviation** against the golden path's
rule that the ladder must be climbable on participation alone, and it propagates to the
proposal gate: proposing opens at
`crates/shadowrunr-segments/data/ranks.toml:19 "propose_min_rank"` (the fourth rank), which needs
a year at the lowest paid tier, six months at the middle one, any time at the top, or five
gifted subscriptions. The character
bible's warm refusal, which "tells them how to climb", can only ever name a purchase.

## Since 4025231 (read 2026-10-21 at e143ccd)

The tie rule changed upstream in b1b5774 (2026-10-20). Equal weight still goes to more
voters. Options level on both are now a tie, which the host is told to break on air "and
say you are breaking it". The earlier-option rule is gone. That meets the technique's "the
host's choice announced as such", and it closes the "stated in code, not to the room" gap
above for the moment of the tie. The rule is still not stated before the ballot opens. The
weight table and the paid-only ladder did not change between the two commits. The
TypeScript overlays had copied the old rule and now read the runtime's rule; see
[typescript--visible-consequence-of-steering](./typescript--visible-consequence-of-steering.md).
