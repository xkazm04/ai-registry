---
layer: application
type: application
subject: platform-extension-release-ladder
technique: viewer-content-needs-identity-and-approval
stack: process
status: forged
verified_on: 2026-11-03
applied: simulation
ab_verdict: better
---

# Process: Castle Control's paid-currency rule against its own extension templates

Castle Control is a local-first desktop toolkit for Twitch streamers. Read at commit
`8ef2d8e` (unchanged on 2026-11-03). Its Twitch Extension is still not built: no
`apps/extension`, no `cc-ebs` crate. This is a design record, like the sibling
[allowlisted-test-stages application](./process--allowlisted-test-stages-before-review.md),
and it carries no `verified_against` because nothing here runs. Policy section numbers
below are from Twitch's Extensions Guidelines and Policies, read on 2026-11-03.

## What the plan says

The money rule is one table row with its source:
`docs/plan/01-analysis.md:214 "Bits never buy an entry, a ticket or a random outcome"`,
cited to "Extension policies 6.2.4 to 6.2.6". The citation is exact. 6.2.4 is loot boxes
decided by chance, 6.2.5 is an entry into a sweepstakes or contest (directly or through a
token), and 6.2.6 is wagering on outcomes beyond the user's control. The work package
repeats the rule as an acceptance line:
`docs/plan/03-implementation-plan.md:609 "Bits never buy an entry, a ticket or a random outcome."`

The viewer-content row holds all four conditions:
`docs/plan/01-analysis.md:215 "Twitch ID required, streamer approves or rejects, username shown, removal possible"`.
These map to 7.1 to 7.4. The acceptance drops the fourth condition, removal (recorded in
the sibling application).

The templates the Extension will draw are listed in the same work package. Among them:
`docs/plan/03-implementation-plan.md:600 "the hex map (the"` (the war-table template),
`docs/plan/03-implementation-plan.md:603 "the draw;"` and
`docs/plan/03-implementation-plan.md:604 "a contribution meter."`

## Simulation: three templates under the old and the new rule

The old rule was this technique as forged on 2026-11-02: money buys "looks,
acknowledgement and participation, never outcomes", and the catalogue named "a place in a
participation queue". The new rule is this technique as deepened on 2026-11-03: looks and
acknowledgement only, never the way in. The reference is section 6.2's own text.

| Case | Purchase | Old rule | New rule | 6.2 | The plan's line |
| --- | --- | --- | --- | --- | --- |
| The draw | paid entry into the draw | allows it as participation the extension defines | refuses it (the way in) | forbidden, 6.2.5 | refuses it |
| The war table | a paid move or a paid place in the queue to command a piece | allows it ("a place in a participation queue") | refuses it (the way in) | 6.2.1 forbids access to a pay-to-play game; whether paid priority counts is inference | silent, so it passes |
| The contribution meter | Bits fill a meter the stream draws | allows it (looks, acknowledgement) | allows it | not on the list | allows it |

The old rule was wrong on 2 of 3 cases. On the draw it contradicts the policy's text. On
the war table it allows what the policy most likely forbids. The new rule matches the
policy on all three, and the second match rests on reading 6.2.1. The plan's own line beats
the old technique on the draw and misses the war table, because it names entries and
tickets but not access to play.

**Falsifier.** An approved version that sells paid moves or paid queue places on a board
that is free to join would refute case 2. So would an answer from the platform that paid
priority is not pay-to-play. Either one turns the new rule's case-2 refusal into an
over-reach and reopens the queue as a purchase.

## Deviations recorded

- **The acceptance line misses access to play.** WP 4.1 should add "Bits never buy a move,
  a piece or a place in a queue to play", or the war table can ship a paid move that
  passes every acceptance line.
- **6.2.8 is not in the plan.** A purchase must be predefined by the extension, never
  named in free text by the streamer or a viewer. No template sells one yet. A
  streamer-named reward in the choice board would breach it.
- **6.2.2 is not in the plan either.** A purchase may not play a chosen track. That
  matters only if a template ever sells a song, and none does.

The fix belongs in Castle Control's plan. That tree is not a registered fleet project, so
this run records the deviation here and does not edit the tree.
