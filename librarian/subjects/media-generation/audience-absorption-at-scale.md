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

## 2026-10-31 - architecture review (review-and-apply pass)

First architecture-review record. Ford et al. CHI EA '17 was opened this time: 85 vs 169 unique lexical items per 50-message segment holds, but its 'small' chats are under 2,000 viewers and its 'massive' ones over 10,000, so the halving says nothing about the 3/30/300 bands. The 2026-10-21 entry's 'confirmed untouched' stands on the number and is narrowed on scope. Nematzadeh re-read and confirmed. The overlord tree was not reachable, so no application citation was re-opened.

<!-- architecture-review:v1 -->
```json
{
  "subject": "media-generation/audience-absorption-at-scale",
  "date": "2026-10-31",
  "baseline": "6e9ae5cbb",
  "digest": "sha256-b2:55e3a17cf46f7d7f",
  "disposition": "clarify",
  "coverage": "All 11 documents read in full (golden path, 6 techniques, 4 rust applications). Arithmetic and cross-document consistency checked. Two primary sources re-opened (Nematzadeh et al. 2019 full text; Ford et al. CHI EA '17 PDF). Not evaluated: the private tournament run data, the overlord tree at any commit (GitHub access refused), the Flores-Saviaga/Seering body. No verification date refreshed.",
  "counterexamples": [
    "A 300-viewer room with an unusually quiet crowd can hold fewer active chatters than a chatty 30-viewer room and wants the smaller room's mode; keying to viewers would pick the wrong one.",
    "A room filling up at the start of a show triggers a five-first-timers surge detector with no raid; a window keyed to it changed pre-raid picks in 7 of 16 replays.",
    "Suspending the first-contact boost alone moved raid-minute room picks from 28/90 to 29/89, because a never-picked bonus rewarded the same raiders.",
    "Ford et al.'s halving of distinct vocabulary compares chats under 2,000 viewers with chats over 10,000, so it does not show where a 30-viewer room turns into crowdspeak."
  ],
  "sources": [
    {
      "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC6837236/",
      "result": "Re-read. 'M initially increases, peaks at V* ≃ 40 messages every 5 min (about one message every 7.5 s)'; V counts messages per chunk with bots included; 'messages become shorter and more stereotypical, as evidenced by their higher text compressibility'; 1,275,396,751 messages in 927,247 streams, Twitch 2014. Supports size-tiered-picking-mode as written."
    },
    {
      "url": "https://www.artifex.org/~bonnie/CHI_twitch-final-2017.pdf",
      "result": "Read. 'There was an average of 85 unique lexical items per segment in massive chats, compared to 169 in small chats'; massive = over 10,000 concurrent viewers, small = under 2,000 (Hearthstone, 2016). Confirms 'roughly half' and shows the comparison sits far above this subject's bands."
    },
    {
      "source": "2021 press coverage of Twitch hate raids and phone/email verification (pcgamer, nbcnews via search)",
      "result": "Confirms bot-account hate raids and account-age chat gates; does not support 'accounts made days earlier, typically with machine-generated names'."
    },
    {
      "source": "Internal arithmetic across the four applications",
      "result": "All stated figures consistent (see per-document reasons)."
    }
  ],
  "documents": {
    "audience-absorption-at-scale.md": {
      "disposition": "clarify",
      "reason": "Sound mode-first argument; boundaries and failure modes hold. Changes: (a) the crowdspeak 'roughly half the distinct vocabulary per fifty messages' is Ford et al. CHI EA '17 (85 vs 169 unique lexical items per 50-message segment), measured between chats under 2,000 and over 10,000 concurrent viewers, far above this subject's 3/30/300 bands; say so. (b) 'from several times the messages' contradicts the inversion pilot, where high ranks spoke every beat and the lowest every other beat (twice, not several times). Still owed: (1) the golden path says the model-swap measurement ran 'about sixty simulated ten-minute streams per tier'; the application gives n=60 and n=59 judged runs and never states a stream length, so 'ten-minute' needs the tournament's run data. (2) 'a first message that is answered by name turns a lurker into a regular' is a causal claim with no cited measurement; the research only supports 65% of small-channel chatters appearing on a single day (Flores-Saviaga, Seering et al. 2020, body not re-read). Label it a design belief or cite a measurement."
    },
    "techniques/attention-share-cap.md": {
      "disposition": "clarify",
      "reason": "Procedure, relative long bound and parity target are sound and match the application (29% vs 48%, whale_window 720 beats x 5 s = 1 h). Internal inconsistency: the inversion section says high ranks 'speak every turn while newcomers speak every other' and then 'several times the messages'; every turn against every other turn is twice. Say twice."
    },
    "techniques/first-contact-exemptions.md": {
      "disposition": "clarify",
      "reason": "Bounded exemptions and the separate safety bypass are sound. Step 5 only suspends the first-contact boost during a raid, while the sibling raid-group-greeting (measured 2026-10-31: 98 of 108 raider picks carried the never-picked bonus) says every newness bonus must be suspended for raid arrivals; add the pointer. Still owed: 'the acknowledgement of a first message has the highest return in retention' has no cited measurement; scope it as a design belief or cite one."
    },
    "techniques/raid-group-greeting.md": {
      "disposition": "clarify",
      "reason": "Group greeting, wave-keep-one and the double-newness boundary are sound and consistent with both applications (28/90 -> 29/89, 6/52, 46 of 52, 7 of 16, 2 of 8). Internal inconsistency: step 1 says detect from a surge when no platform event exists, while the boundary section says a surge alone is not enough while the room is filling; step 1 should carry that caveat. Still owed: 'hostile raids run on accounts made days earlier, typically with machine-generated names' is unsourced; 2021 coverage of Twitch hate raids confirms bot accounts and account-age chat gates but not 'days earlier' or name shape (and the golden path says 'freshly made')."
    },
    "techniques/room-scaled-rate-caps.md": {
      "disposition": "keep",
      "reason": "Formula B x (S + 2 - A) checked: with B=6, S=5 it gives 36..12 for 1..5 and B at S+1, so it is monotone, steps one base per chatter and meets the base where the room stops being small, as stated. Address gating, drop logging and exemption hand-offs are consistent with the golden path."
    },
    "techniques/size-tiered-picking-mode.md": {
      "disposition": "clarify",
      "reason": "Nematzadeh et al. 2019 re-read: V is messages per 5-minute chunk (bots included), per-user activity M peaks at V* ~ 40 (one message per 7.5 s), messages shorten and compress with load, over 1.28 billion 2014 Twitch messages. The technique states it correctly. Changes: (a) 'around half that of a conversational room' is the Ford et al. comparison of sub-2,000 against over-10,000-viewer chats; scope it. Still owed: 'it is the only published measurement of it' is a universal negative nobody has checked; soften or support with a literature search."
    },
    "techniques/wave-collapse-to-crowd-voice.md": {
      "disposition": "keep",
      "reason": "Distinct-sender counting, share threshold, clean representative, exempt-message exclusion and deterministic quantifiers are coherent and consistent with the golden path and first-contact application (exact-copy-only joining)."
    },
    "applications/rust--attention-share-cap.md": {
      "disposition": "keep",
      "reason": "Internally consistent with the technique (share_max 2 of 5 beats, whale_window 720 x 5 s = 1 h, 29% vs 48%, 74->73 and 76->75). Deviations disclose the missing class aggregate. Citations not re-opened (repository not reachable this run); verified_on unchanged."
    },
    "applications/rust--first-contact-exemptions.md": {
      "disposition": "reverify",
      "reason": "Arms table and narrative agree with the note (26/31/34 of 92, 2/20 floor). Its header says commit 645bb06 'has not been pushed yet'; the later raid application cites 917629d as pushed, which suggests 645bb06 is now on origin, but the repository was not reachable this run (GitHub API 403), so push state and line citations need a read of the tree."
    },
    "applications/rust--raid-group-greeting.md": {
      "disposition": "keep",
      "reason": "Verified 2026-10-31; figures internally consistent (28/16 = 1.75 greetings per raid, 16 = 2 raid rooms x 8 seeds, 46 = 52 - 6) and match the technique's boundary section. Citations not re-opened this run."
    },
    "applications/rust--room-scaled-rate-caps.md": {
      "disposition": "keep",
      "reason": "Caps 36,30,24,18,12,6 match the technique's formula; two-of-five-beats at 5 s beats is about two per 25 s as stated; the doctrine-vs-code disagreement is disclosed as a deviation. Citations not re-opened this run."
    }
  }
}
```

The confident clarifies above were applied in the same pass; this second record is against the post-edit bytes.

<!-- architecture-review:v1 -->
```json
{
  "subject": "media-generation/audience-absorption-at-scale",
  "date": "2026-10-31",
  "baseline": "6e9ae5cbb",
  "digest": "sha256-b2:d4eff860e1d119cf",
  "disposition": "clarify",
  "coverage": "Second record of the same pass, after the confident clarifies were applied to five documents (golden path, attention-share-cap, first-contact-exemptions, raid-group-greeting, size-tiered-picking-mode). Sources, counterexamples and unapplied items as in the first 2026-10-31 record. No verification date refreshed; no application edited.",
  "counterexamples": [
    "Ford et al.'s halving of distinct vocabulary compares chats under 2,000 viewers with chats over 10,000, so it does not show where a 30-viewer room turns into crowdspeak.",
    "A room filling up at the start of a show triggers a surge detector with no raid."
  ],
  "sources": [
    {
      "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC6837236/",
      "result": "As in the first 2026-10-31 record."
    },
    {
      "url": "https://www.artifex.org/~bonnie/CHI_twitch-final-2017.pdf",
      "result": "As in the first 2026-10-31 record; basis of the applied scoping."
    }
  ],
  "documents": {
    "audience-absorption-at-scale.md": {
      "disposition": "clarify",
      "reason": "applied 2026-10-31: crowdspeak vocabulary now scoped to Ford et al.'s sub-2,000 vs over-10,000-viewer comparison; 'from several times the messages' -> 'from more messages'. Still owed: (1) the golden path says the model-swap measurement ran 'about sixty simulated ten-minute streams per tier'; the application gives n=60 and n=59 judged runs and never states a stream length, so 'ten-minute' needs the tournament's run data. (2) 'a first message that is answered by name turns a lurker into a regular' is a causal claim with no cited measurement; the research only supports 65% of small-channel chatters appearing on a single day (Flores-Saviaga, Seering et al. 2020, body not re-read). Label it a design belief or cite a measurement."
    },
    "techniques/attention-share-cap.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'from several times the messages' -> 'from twice the messages', matching the every-turn vs every-other-turn rates the same sentence states."
    },
    "techniques/first-contact-exemptions.md": {
      "disposition": "clarify",
      "reason": "applied 2026-10-31: step 5 now suspends every newness bonus for raid arrivals, pointing at raid-group-greeting. Still owed: 'the acknowledgement of a first message has the highest return in retention' has no cited measurement."
    },
    "techniques/raid-group-greeting.md": {
      "disposition": "clarify",
      "reason": "applied 2026-10-31: step 1 now says a surge alone is weak evidence while the room is still filling (see the boundary section). Still owed: 'accounts made days earlier, typically with machine-generated names' is unsourced and disagrees with the golden path's 'freshly made accounts'."
    },
    "techniques/room-scaled-rate-caps.md": {
      "disposition": "keep",
      "reason": "Formula B x (S + 2 - A) checked: with B=6, S=5 it gives 36..12 for 1..5 and B at S+1, so it is monotone, steps one base per chatter and meets the base where the room stops being small, as stated. Address gating, drop logging and exemption hand-offs are consistent with the golden path."
    },
    "techniques/size-tiered-picking-mode.md": {
      "disposition": "clarify",
      "reason": "applied 2026-10-31: the 'around half' vocabulary figure now names its source and its sub-2,000 vs over-10,000-viewer scope. Nematzadeh figures re-read and correct. Still owed: 'it is the only published measurement of it' is an unchecked universal negative."
    },
    "techniques/wave-collapse-to-crowd-voice.md": {
      "disposition": "keep",
      "reason": "Distinct-sender counting, share threshold, clean representative, exempt-message exclusion and deterministic quantifiers are coherent and consistent with the golden path and first-contact application (exact-copy-only joining)."
    },
    "applications/rust--attention-share-cap.md": {
      "disposition": "keep",
      "reason": "Internally consistent with the technique (share_max 2 of 5 beats, whale_window 720 x 5 s = 1 h, 29% vs 48%, 74->73 and 76->75). Deviations disclose the missing class aggregate. Citations not re-opened (repository not reachable this run); verified_on unchanged."
    },
    "applications/rust--first-contact-exemptions.md": {
      "disposition": "reverify",
      "reason": "Arms table and narrative agree with the note (26/31/34 of 92, 2/20 floor). Its header says commit 645bb06 'has not been pushed yet'; the later raid application cites 917629d as pushed, which suggests 645bb06 is now on origin, but the repository was not reachable this run (GitHub API 403), so push state and line citations need a read of the tree."
    },
    "applications/rust--raid-group-greeting.md": {
      "disposition": "keep",
      "reason": "Verified 2026-10-31; figures internally consistent (28/16 = 1.75 greetings per raid, 16 = 2 raid rooms x 8 seeds, 46 = 52 - 6) and match the technique's boundary section. Citations not re-opened this run."
    },
    "applications/rust--room-scaled-rate-caps.md": {
      "disposition": "keep",
      "reason": "Caps 36,30,24,18,12,6 match the technique's formula; two-of-five-beats at 5 s beats is about two per 25 s as stated; the doctrine-vs-code disagreement is disclosed as a deviation. Citations not re-opened this run."
    }
  }
}
```
