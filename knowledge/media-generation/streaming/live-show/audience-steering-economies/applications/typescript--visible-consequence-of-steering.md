---
layer: application
type: application
subject: audience-steering-economies
technique: visible-consequence-of-steering
stack: typescript
status: forged
verified_on: 2026-10-21
verified_against: typescript@6
applied: code
ab_verdict: better
---

# The screen is a second announcer: three renderers, three winners, one fixed

*Read against Shadowrunr OS, github.com/xkazm04/shadowrunr @ ad898bb, 2026-10-21. The
workspace pins TypeScript 6.0.3. The "before" figures are a probe run on e143ccd, the
commit the fix sits on; the fix is ad898bb.*

Shadowrunr's Rust runtime tallies every ballot and broadcasts the tallies as `vote` events.
Its TypeScript side draws them: a stage overlay (`packages/stage-kit`) and an On Air view in
the operator console (`apps/console`). The technique says every claim about a result is read
from the record. The host is not the only thing that makes such claims. A bar marked
**winner**, a hex tagged **DISPUTED** and a bar length are claims about the tally too, and
each renderer here had re-derived them by a rule of its own.

## What the runtime decides

The runtime's rule is stated beside its function:
`crates/shadowrunr-segments/src/runtime.rs:321 "Highest weight wins; equal weight goes to more voters. Options level on both are a tie,"`.
A level tie crowns nobody, and the host is told to break it on air. The hexmap's evidence
jury is a ballot of the same kind. One grade per viewer, carried at rank weight
(`crates/shadowrunr-segments/src/runtime.rs:1186 ".insert(viewer, (grade, weight));"`),
goes out as its own `vote` event
(`crates/shadowrunr-segments/src/runtime.rs:1200 "grade:{hex}"`).

## What the screens claimed, before

A probe drove the stage reducer on e143ccd with hand-built events (n = 5 cases, all
divergent):

- **A weight tie, broken by voters.** Option A had 2.4 weight from 1 voter and B had 2.4 from
  2. The runtime's winner is B. The stage panel marked **both** bars as winner, because it
  crowned every option at the top weight. The console's On Air view crowned **A**, because
  it took the first option at the maximum, which was the runtime's own rule before a
  2026-10-20 change made ties honest. The same tally gave three results.
- **The jury took the vote panel.** A `grade:HEX-03` tally arrived while a foil vote was on
  screen. The reducer treated it as a poll it had never seen open, made it the active poll
  and titled it "The minions are voting". The room's real ballot vanished behind it.
- **The jury counted messages, not viewers.** The hex's community grade was a raw count of
  `!grade` chat lines. One viewer typing `!grade SPC` three times outvoted two viewers.
  Without rank weight, a newcomer's DOC beat a top-rank CLM on screen while the runtime's
  jury said CLM. The DISPUTED tag compares that count with the host's grade, so it was
  making a public accusation from a count the runtime never kept.

## The fix

One function now mirrors the runtime's rule, and every screen reads it:
`packages/stage-kit/src/tallies.ts:35 "export function leaders(rows: readonly { option: string; weight: number; voters: number }[]): string[] {"`.
A bar carries
`packages/stage-kit/src/tallies.ts:25 "Level with another option on weight and voters: a tie the host breaks, no winner."`,
the panel crowns only a sole leader
(`packages/stage-kit/src/ui/VotePanel.tsx:41 "closed && b.leading && !b.tied"`),
and the console does the same
(`apps/console/src/pages/onair/view.ts:80 "The runtime's result, not a rule of our own: a level tie crowns nobody."`).
Jury tallies are routed away from the panel
(`packages/stage-kit/src/scene.ts:258 "A jury tally is not a poll: it feeds the hex's grade tally and never takes the panel."`).
Until the first jury tally arrives, chat grades stand in, one per viewer
(`packages/stage-kit/src/scene.ts:147 "[msg.viewer.id]: cmd.grade"`).

**Verdict: better, at mode `code`.** All five probe cases now match the runtime. Three
regression tests pin them, and the stage-kit (114), console On Air (40) and workspace
typecheck suites pass. The control is the same probe on e143ccd, where every case diverged.

## What is still open

- **A second copy of the weight table.** The overlay colours its rank bands, and draws its
  bars before the first authoritative tally, from weights copied by hand
  (`packages/stage-kit/src/lore.ts:8 "Vote weights from"`).
  The runtime loads its table from a file at start, so the first retune moves the bars
  on the way to a result the screen then contradicts. **Deviation.** The weights belong
  in the `vote` event, or in a generated module.
- **The split is not told.** The panel shows weight per option and the voter count only as
  a total. When the weighted and head-count winners differ, which the technique says is
  news, the screen cannot show it. **Deviation.**

The lesson goes upward. The technique's rule that every claim about a result is read from
the record now names the screen as well as the host, because a renderer that recomputes a
winner drops whichever rule its author did not copy.
