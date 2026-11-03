---
layer: application
type: application
subject: platform-extension-release-ladder
technique: allowlisted-test-stages-before-review
stack: process
status: forged
verified_on: 2026-11-03
---

# Process: Castle Control's Twitch Extension ladder (a design record, not built code)

Castle Control is a local-first desktop toolkit for Twitch streamers (giveaways, an AI
moderator, contribution visuals, and an "Extension studio" called the Map Room). Read at
commit `8ef2d8e` (2026-11-02). **The Extension itself is not built**: there is no
`apps/extension` and no `cc-ebs` crate in the tree, and the studio's own guide says so —
`docs/guide/map-room.md:6 "Test connection are **not built yet**"`. Everything below is a
planned release ladder recorded in the plan documents, plus the one piece that does exist:
a desktop room that shows the ladder and rehearses designs locally. This is a process
application; it carries no `verified_against` because nothing here runs.

## The constraints the plan designs around

The analysis records the platform facts that shape the whole subject in one table row:
`docs/plan/01-analysis.md:80 "All code is bundled and reviewed, with no `eval` or remote scripts"`,
continuing in the same cell with `"Every fetched or image host is allowlisted per version, and generic public hosts are banned"`,
`"Configuration is 5 KB per segment and 20 writes a minute. PubSub is 5 KB per message"` and
`"Review takes 8 to 14 days, and a rejection revokes the client ID for good"`. That is the
golden path's four facts — slow review, immutable reach, terminal rejection, a reviewer who
reads the code — written down before any code. The Extension is called out as the only
module that cannot be tested in full on day one:
`docs/plan/01-analysis.md:87 "The Extension runs in Local and Hosted Test for allowlisted accounts, without review."`

## Design as data (confirmed in the design record)

`docs/plan/01-analysis.md:152 "A new design is a data change, so it needs no review."` and,
importantly, a design has its own ladder too:
`docs/plan/01-analysis.md:156 "Each design moves through local test, hosted test and released."`
The work package makes the data-only property an acceptance check rather than an intention:
`docs/plan/03-implementation-plan.md:606 "a static check proves the bundle has no `eval`, no `new Function` and no remote script;"`
and `docs/plan/03-implementation-plan.md:607 "every template renders from data alone;"`.
One renderer serves both hosts —
`docs/plan/01-analysis.md:144 "The same bundle runs inside the Extension."` — which is
why this subject defers package rules to on-stream overlay delivery.

## The broadcast budget (confirmed, with an upward lesson)

`docs/plan/01-analysis.md:191 "State goes out as coalesced snapshots of at most 5 KB, sent at most once a second."`
The same paragraph records that Twitch's own documentation disagrees on the limit (100 a
minute in one place, one a second elsewhere), and the risk table resolves it the way the
technique now says: design to the stricter figure, measure on the real rung —
`docs/plan/01-analysis.md:232 "Coalesced snapshots, at most one a second; measure in Hosted Test"`.
The hosted service's acceptance tests the coalescer offline at an input rate far above the
budget: `docs/plan/03-implementation-plan.md:623 "a load test at 100 updates a second per channel emits at most one broadcast per second;"`.
That test is about input rate, not audience size; an audience-scale load run on the hosted
rung is not planned anywhere (a gap against the technique's load rung).

## The ladder and who may climb it

The repo law: `CLAUDE.md:24 "An Extension build reaches only allowlisted accounts until the owner approves submission."`
(repeated at `docs/plan/03-implementation-plan.md:169 "An Extension build reaches only allowlisted accounts"`). Submission is an owner act, and at
present it is not authorised at all: the operator standup of 2026-10-25 scoped the Map Room
milestone to the test rungs —
`docs/plan/03-implementation-plan.md:78 "M4 builds for local test and Hosted Test with allowlisted accounts only, with no"`
— and the work package spells out that this `docs/plan/03-implementation-plan.md:587 "does not authorize public release or submission."`

The ladder is named in the product's own vocabulary:
`docs/plan/03-implementation-plan.md:632 "the test ladder (sand table, then muster, then proclaimed);"`
(local test, Hosted Test, released). The desktop room that exists shows the higher rungs as
requirements, not controls — `docs/guide/map-room.md:19 "**Proclaimed** remain locked; their buttons inspect requirements rather than"`,
and in the room's README, `apps/desktop/src/rooms/studio/README.md:302 "locked requirement inspectors, never stage transitions."`
This became an upward lesson in the technique: a ladder tool shows the next rung as a list
of what it needs, never as a promote button.

Before any rung, the room rehearses a design by deterministic simulation:
`apps/desktop/src/rooms/studio/README.md:488 "will my board make a good round at 30"`
(viewer count 10–1000, seeded, replayable), while the platform rungs stay locked. This is
the second upward lesson, folded into data-driven-shell: a design that skips platform
review is rehearsed by the team instead.

## Viewer content and money

`docs/plan/01-analysis.md:214 "Bits never buy an entry, a ticket or a random outcome"` and
`docs/plan/01-analysis.md:215 "Twitch ID required, streamer approves or rejects, username shown, removal possible"`.
The automated operator is held to the same approval rule:
`docs/plan/03-implementation-plan.md:638 "the AI operator can only propose, never act, unless the streamer sets it to drive."`

## Deviations recorded

- **Removal dropped from the acceptance.** The analysis lists four section-7 conditions
  (line 215, above), but the work package's acceptance names three —
  `docs/plan/03-implementation-plan.md:608 "a Twitch ID is required, the streamer approves it, and the username is shown;"` —
  with no "removal possible". The technique keeps all four; the acceptance should gain the
  fourth before WP 4.1 is built.
- **The premise check was dropped and the plan still claims it.** The analysis' mitigation
  for the largest risk is `docs/plan/01-analysis.md:225 "Ask Twitch Extensions support before building. Submit a minimal shell first."`
  The standup removed it — `docs/plan/03-implementation-plan.md:77 "WP 4.0 is dropped: no email to Twitch."` —
  yet the risk register still reads `docs/plan/03-implementation-plan.md:1398 "WP 4.0 asks before any build."`
  Building to the test rungs without the answer is defensible, since nothing is submitted;
  submitting without either the answer or a minimal-shell first submission is what the
  technique forbids.
- **The monetisation citation is exact; the rule is short.** *Corrected 2026-11-03: this
  line said the citation might be stale.* Line 214's "Extension policies 6.2.4 to 6.2.6"
  matches the guidelines as re-read: 6.2.4 is chance items, 6.2.5 contest entry and 6.2.6
  wagering. The rule leaves out 6.2.1 (access to a pay-to-play game) and 6.2.8 (items not
  predefined by the extension). The three-template simulation that shows why the first
  one matters is in
  [the viewer-content application](./process--viewer-content-needs-identity-and-approval.md).
- **No audience-scale load rung.** See the broadcast section.
- **The cadence sits at the rate, not under it.** "At most once a second" (line 191, and
  WP 4.2) equals the per-channel refill that developers measured (100 points, refilling 1
  a second; twitchdev/issues 612, 2022). A steady sender at that cadence has no headroom,
  and one retry or one second broadcaster drains the burst. The technique asks for an
  interval under the rate. The offline coalescer test should assert the chosen interval,
  not the platform's ceiling.
- **The host rule is stricter than the policy, which is harmless.** Line 80's "generic
  public hosts are banned" is broader than guideline 2.13, which accepts a public hosted
  domain that carries a unique identifier. The plan's single own host meets both.
