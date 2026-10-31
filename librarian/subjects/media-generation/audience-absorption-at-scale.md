---
subject: audience-absorption-at-scale
domain: media-generation
last_touched: 2026-10-31
dry_streak: 0
---

# audience-absorption-at-scale

First note. Forged 2026-10-19 (4964363f) from Shadowrunr OS, the overlord
checkout. Both applications read that one tree, so the scan ranked it
"single stack (rust)".

## State

6 techniques, 4 applications (rust x4, overlord; latest @ 917629d). Depth rung L2:
the techniques rest on the tree's own picker plus the tree's sourced chat
research. `check-currency --volatile` finds no platform-set quantities.
Every number the subject states is a self-measured or self-designed figure.

## 2026-10-21 - /deepen, single-stack dispatch (Curator)

- **Widen: no second stack exists.** Searched every checkout under the fleet
  root, one repo at a time, for live-chat seams (chatters, raider, superchat,
  twitch chat). The only allocator is overlord's Rust brain. Overlord's
  TypeScript side (`packages/stage-kit`: ChatLane, chatMemory, tallies) only
  displays chat. It holds transcript memory, a chat lane and rank-banded poll
  bars, which belong to audience-steering-economies. Nothing there decides
  attention, and writing a TS application would be fabrication. The finding
  stays open with a return condition (below).
- **Counter-evidence (web, read verbatim from the primary).**
  - The golden path stated the chatting share as observation: a third at 3
    viewers, under a tenth at 300. Overlord's own research
    (`docs/research/05-chat-patterns.md`, TL;DR 1) calls every
    `chatting_share` "an assumption bounded by weak evidence". Corrected: the
    shares now read as estimates and as a calibration input, with the reason
    (chat logs record only posters).
  - Nematzadeh et al. 2019 (R. Soc. Open Sci., PMC6837236, arXiv 1610.06497),
    read verbatim: per-user activity "peaks at V* ≃ 40 messages every 5 min
    (about one message every 7.5 s) and then decreases". Compressibility
    rises and messages shorten with load. `size-tiered-picking-mode` gained
    this as the one published anchor for the aggregate boundary. It is
    framed as an order of magnitude, and the "derive for the show" rule
    stands.
  - Confirmed untouched: crowdspeak at "around half" the distinct vocabulary.
    The source research cites Ford et al. CHI EA '17 at 85 vs 169 lexical
    items per 50 messages; that is the research's figure, and the CHI PDF
    was not re-opened. "A first message ignored is very often the last" is
    consistent with the 65% one-day-only small-channel chatters the research
    cites from Flores-Saviaga, Seering et al. 2020. The abstract was opened;
    the 65% sits in the body and was not re-read.
- No blind training-data lane ran, no convergence was claimed, and no
  technique was added. No rule flipped (the anchor adds a measurement and
  keeps the derive-it rule), so no `applied.md` row is owed.

## Impact

None. No fleet project's registry map joins this subject. All 21 projects'
maps were read by grep, and `build-registry-map --check` listed no stale
verdict against it. Maps were not regenerated: overlord's and
systedo-case's carry a sibling's uncommitted rebuild, and this landing
moves no pair.

**Instrument gap, banked.** Overlord's `brain-composition-memory` context
holds `crates/shadowrunr-brain/src/picker.rs`, the source of four of this
subject's six techniques. Its map pairs live-chat-moderation-and-anti-bait
but not this subject. The matcher misses the subject's own origin tree.
Return: the next map-matcher pass, or a `/conform` on overlord that judges
the picker.

## 2026-10-22 - /intake apply first-contact-exemptions (Curator)

First application of first-contact-exemptions. Mode `code`, verdict
`better`, run `intake-apply-fce-1022`. Steps 1-4 already conformed in the
tree. Step 5, suppressing the boost during a raid, was missing: the tree
detected a raid but only used the flag to expire the queued bit. The seam
was chosen to falsify that step. A paired offline replay over the
simulator's raid room (8 seeds, 92 raid-beat slots) gave these room picks:
26 as the tree was, 31 with single raiders unboosted, 34 with only the
largest wave boosted. The last arm shipped (overlord 645bb06, local main,
not pushed). The floor held: ungreeted raid episodes 2/20 in every arm, and
non-raid beats were unchanged.

The middle arm is the finding. The raid ritual arrives as several phrases,
and each phrase collapses into its own wave, so the slot taken from single
raiders went to a second wave of the same raid. raid-group-greeting step 3
now says to keep the boost on one wave. The single-stack ranking still
holds: no second fleet tree runs a chat picker.

## 2026-10-31 - /intake apply raid-group-greeting (Curator)

The application document for raid-group-greeting. Mode `code`, verdict
`not-better`, run `intake-apply-raid-greeting-1031`. The seam is step 4,
which says raiders stay a group for about a minute. The tree's pick context
marks a raid per beat, while its greeting already tracks a raid spread over
20 s. The seam was chosen to falsify: a longer raid flag might not give the
room anything back. It did not. A full-brain replay ran with the scripted
engine over raid rooms of 300 and 40 viewers and a raid-free room of 30,
8 seeds each. Holding the flag for 60 s moved room picks in the raid's
first minute from 28/90 to 29/89 (300) and left 6/52 unchanged (40). It
also changed picks before the raid in 7/16 runs and in 2/8 raid-free runs.
Not shipped. The replay test shipped (overlord 917629d, pushed).

The tags are the finding. 98 of 108 raider picks carried the picker's
never-picked bonus and 63 carried first_contact. A picker rewards newness
twice, and the step only named one reward. The technique now has a
section on both boundaries: suspend every newness bonus for raid arrivals,
and key the window to a raid event rather than to a surge.

## Open leads

- **Second stack.** Return: a fleet project grows a chat allocator in
  another runtime (a TS overlay that starts choosing, or a second show).
  Until then "single stack (rust)" is a true statement about the fleet, not
  a gap this skill can close.
- **Small-room chatting share.** Return: a first-party count of chatters per
  viewer at under 30 viewers (overlord's own recorded shows would do). Then
  the golden path can state a measured ratio.
- **Raid versus fill surge.** The tree calls five first-timers in one beat
  a raid, and it has no platform raid event. raid-group-greeting says a
  room filling up is not a raid and should be greeted one by one, and this
  run did not separate the two cases. Return: a platform adapter that
  carries the raid event, or a sandbox recording with a labelled raid.
  2026-10-31 measured half of it: a 60 s window keyed to the 20 s surge
  tracker changed pre-raid picks in 7/16 replays and raid-free picks in 2/8.
- **Raid tier without the novelty bonus.** Return: re-run
  `raid_window_replay` with `novel` suppressed for raid arrivals and the
  window keyed to `raid_named`. Better needs the room's first-minute share
  to rise and zero pre-raid or raid-free changes.
