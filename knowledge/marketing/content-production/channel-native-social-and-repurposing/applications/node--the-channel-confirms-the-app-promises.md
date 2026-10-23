---
layer: application
type: application
subject: channel-native-social-and-repurposing
technique: the-channel-confirms-the-app-promises
stack: node
status: forged
verified_on: 2026-10-22
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# The channel confirms - the board reconciled, and the board's two other readers did not

Verified against the Czech-first marketing workspace at commit `9c28baeb`
(2026-10-22). The node version is witnessed by the tree's `engines` field (`24.x`) and
the CI pin (`24.14.0`). The technique was forged from this tree, so the tree conforms
where the technique was read off it. That made it a place to look for the readers the
technique was not read off.

## What the tree already did

The board's status vocabulary is the technique's five states. A pure function on
every board load derives each linked slot from the channel's post. An unlinked legacy
claim is downgraded to done. The withdrawn flag is persisted once and the dead link is
stripped. The write endpoint refuses an over-limit body, an unparseable time and a past
time beyond a two-minute skew. The scheduling activity row carries no publish taxonomy.
The channel's transient publishing claim is leased and swept to failed. Every one of
those rules held without a change.

## The seam, chosen to falsify "the channel's state is what every count reads"

The technique says the board derives its states from the channel on every load. The
tree has a second reader of the same board: a unified publishing calendar that merges
four schedulers into one week and feeds the weekly cadence cap. The cap refuses a post
at the write chokepoint. That reader took the stored board as it was and never
reconciled it. Its social leg lists the channel's own posts, and a slot handed to a
channel was listed again as a board slot. A caught outcome would show that the
technique's rule held only at the one reader it was written against, and it did.

A third reader turned up while I read the board's own page. On a failed social read
it reconciled against an empty list. Every linked slot then read as withdrawn, and the
one-shot cleanup persisted that. So one store hiccup stripped every live link for good.
The read was also capped at fifty posts, newest first, so an older handover dropped out
of the read and was withdrawn the same way.

## The change and the read

B makes two changes. The calendar reconciles the stored board against the same
channel read its social leg uses, and skips a slot whose linked post that read holds.
The reconciler treats a failed read (null) and a limit-full read (incomplete) as saying
nothing about an absent post, so the slot keeps what it stored. The board page passes
both through, and both readers share one read limit.

| Case, same fixture through both arms | A | B |
| --- | --- | --- |
| one handover, cap 2 for that channel and week | 2 calendar items, cadence count 2, the next real post refused | 1 item (the channel's), count 1 |
| stored `queued` slot whose post the channel published | slot `scheduled` beside post `published` | post `published` only |
| unlinked legacy `published` slot | calendar `published`, with no channel event | `sent` |
| linked post absent from a complete read | `scheduled` (still counted as in a channel) | `planned` |
| social read fails, or comes back limit-full | every absent link withdrawn and persisted | links kept, slot unchanged |

Five new unit tests fail on A and pass on B. One existing pin moved, in the direction
the technique predicts: an unlinked `queued` fixture slot now reads as `sent`, which is
what the board itself shows for it. Floor: typecheck, lint and the unit suite pass
(4,378 tests, plus the same four unrelated baseline failures as before the change).

## Structural facts the tree proves

1. A derive-on-load rule protects only the reader it is written into. The calendar was
   added later, read the persisted snapshot, and never inherited the rule. Snapshots
   are written by whatever the page derived at its last save, so a stored status is a
   past derivation, not the channel's state.
2. "Gone" is a claim about the channel, read off an absence. An absence from a failed
   or truncated read is not evidence. Withdrawal is the one derived state the board
   persists, so it is the one state where that mistake cannot be undone.
3. A handover is one promise. When two sources both describe it, exactly one of them
   may stand for it in any count, and the channel's is the one that can confirm.

## What it cannot do

It does not measure the live rate of either defect. No tenant data was read, so how
often a handover sits in a capped week, or a social read fails on a board load, is
unknown. The fix is a paired guard, not a measured gain in production. The master push
was blocked by the workspace's own pre-push gate, which was red on four unrelated tests.
The change waits on an origin branch for that gate to go green.
