---
layer: golden-path
type: golden-path
subject: platform-extension-release-ladder
status: forged
use_when: [planning an interactive viewer extension that runs inside the streaming platform's player, deciding what may change without a new platform review, designing the broadcast path from a backend to every viewer's extension, preparing a version for platform review or a deliberate release]
techniques:
  - data-driven-shell
  - bundled-static-code-only
  - per-version-host-allowlist
  - coalesced-broadcast-with-load-test
  - allowlisted-test-stages-before-review
  - viewer-content-needs-identity-and-approval
---

# Platform extension release ladder

Some streamer tools do not stop at the broadcast picture. They put an interactive surface
inside the streaming platform's own player — a panel under the stream, a component over
the video, a sheet on the mobile app — where every viewer can see it, click it and vote
through it without leaving the page. The platform calls this an extension, and it changes
almost every assumption a web team brings to it. The code does not run on the team's
servers or in the streamer's broadcasting software. It runs in a sandboxed frame in every
viewer's browser, served from the platform's content network, and the platform reads each
version before anyone outside an allowlist may load it.

This subject is the craft of shipping such a thing. It rests on one sentence:

> **Design travels as data, code travels as a reviewed version, and reach is earned one
> rung at a time.** What the streamer or the team wants to change week to week is data
> the shell reads; what the shell can do is fixed in a bundle the platform reviewed; and
> who can see it widens only by a deliberate step after the previous rung has been
> passed on accounts the team owns.

## Why the ladder is not a deploy pipeline

A team used to continuous delivery reads the platform's version states — local test,
hosted test, review, approved, released — as a slow staging environment and plans to
iterate through it. That reading fails on four facts about the ladder, and each fact
reshapes the build.

**Review is measured in weeks, and resubmission starts the clock again.** A typical
review is one to two weeks, longer over holidays, and withdrawing a version to fix
something puts it at the back of the queue. A fix that needs a code change is therefore
a fortnight away at best. Whatever the team expects to tune during the season — copy,
colours, layout, the options of a vote, which feature is switched on for which channel —
must be tunable without a new version, or it will not be tuned.

**A released version is immutable.** It can be replaced, never edited, and replacing it
upgrades every install at once. There is no gradual rollout to a share of channels and no
quiet hotfix. The only staged exposure the platform offers is the allowlist of test
accounts on the rungs below review, so that allowlist is the canary, and it is spent
before review, not after.

**Rejection can be terminal.** A version can come back with requested changes, which is
routine. An extension can also be rejected outright, and a rejected extension's
client identity is revoked: everything bound to that identity — the backend's signing
secret, the configuration, the install base — is gone with it. A team that submits to
find out what the reviewers think is gambling the identity, not one version.

**The reviewer reads the code.** The platform requires front-end code it can read, every
asset inside the uploaded bundle, every outside address the front end will touch declared
for that version, and no way for the shipped code to become different code at runtime.
Those are not obstacles to route around; they are the definition of what a version is. A
version is a promise about behaviour the reviewer can check, and the build is designed so
the promise is true.

## The shape: a fixed shell, a document, a backend that coalesces

The architecture that survives the ladder has three parts.

1. **A shell that renders a design document.** The reviewed code is a renderer for a
   small, versioned, schema-checked document: which components show, in what order, with
   what copy and what tokens of colour and type, and which features are on. The document
   lives in the platform's configuration storage or on the team's own backend, and the
   shell treats it as untrusted data — it validates it, ignores what it does not know,
   and falls back to a built-in design when the document is missing or invalid. The
   document can rearrange and re-skin what the shell can draw; it cannot teach the shell
   to draw anything new. That is [data-driven-shell](./techniques/data-driven-shell.md).
2. **A bundle that is all the code there will ever be.** Every script, stylesheet, font
   and image the front end uses ships inside the reviewed bundle, readable, with
   third-party libraries kept as separate files so the reviewer can see what is whose. No
   evaluation of strings as code, no script fetched from anywhere, no template engine that
   compiles at runtime. That is
   [bundled-static-code-only](./techniques/bundled-static-code-only.md).
3. **A backend reached only at declared addresses, broadcasting coalesced state.** The
   front end may fetch only from the hosts listed for its version, so the backend has a
   stable address chosen before the first submission, and a new host means a new version.
   That is [per-version-host-allowlist](./techniques/per-version-host-allowlist.md). Live
   state reaches viewers through the platform's per-channel broadcast, which accepts only
   small messages at a low rate and delivers each one to every viewer at once, so the
   backend coalesces events into whole snapshots on a fixed cadence and the whole path is
   load-tested at the audience size the team expects before review. That is
   [coalesced-broadcast-with-load-test](./techniques/coalesced-broadcast-with-load-test.md).

Moving design into data moves its review into the team. A design document reaches every
viewer the moment it is published and no platform reviewer reads it, so a design climbs a
shorter ladder of its own — previewed locally, run for the allowlisted accounts,
published by a decision — and a design that shapes play is rehearsed by deterministic
simulation at the expected audience sizes before any viewer meets it.

The failure mode to design out is the clever shell: a "configurable" front end whose
document can carry a script snippet, a remote URL to load, or an expression language rich
enough to compute. The reviewer will see it, and if they do not, the next one will. A
document powerful enough to change behaviour is code that skipped review, and an
extension caught shipping unreviewed behaviour risks the identity, not the version.

## The rungs, and what each one proves

Below the first rung sits a question. When the whole extension rests on a reading of
platform policy nobody at the platform has confirmed — that a shell interpreting design
data is acceptable at all, that per-streamer branding may live in that data — the premise
is confirmed before the product is built on it, by asking or by submitting a minimal
shell that exercises the premise and nothing else. A premise first tested by the full
product's review is a premise tested with the identity as the stake.

The ladder has more rungs than the platform's states, because the platform's states say
who can *see* a version and the team needs to know what each rung has *proved*.

The **local test** rung serves assets from the team's own development host to the
allowlisted test accounts on the team's own channel. It proves the shell renders, the
document validates, and the backend handshake works — on the team's machine, against the
team's backend, with one viewer. The **hosted test** rung serves the uploaded bundle
from the platform's network to the same allowlist. It is the first rung that proves the
bundle is complete: a missing asset, an undeclared host, a path that only resolved on the
development server all fail here, and nowhere earlier. The team's own **load rung** runs
beside hosted test: simulated viewers at the target audience size receive the broadcast,
fetch from the backend, and the team measures what the backend and the broadcast budget
can carry. Only when those rungs have passed on owned accounts does the version go to
**review**, with a review channel that is live, configured and usable without error,
because a reviewer who cannot make the extension work rejects it.

Submission itself is an owner's act. A version that has passed every lower rung still
reaches only the allowlist until the owner decides to submit it, and a tool that tracks
the ladder shows the higher rungs as lists of what they require, never as buttons that
promote.

**Approved** is not released. The platform permits release at any time after approval,
and that freedom is the point: release is a deliberate act by the owner, on a date chosen
for the streamer's schedule, with the backend ready to serve both versions. Release
upgrades every install at once, but a viewer who already loaded the page keeps running
the old version until they reload, so for a while the backend hears from both. A team that releases on approval because the button is there has
let the review queue set its launch date.

The per-rung acceptance lists and the allowlist discipline are
[allowlisted-test-stages-before-review](./techniques/allowlisted-test-stages-before-review.md).

## Viewers' content and viewers' money

An extension sits in the viewer's own player, so it can collect what an overlay never
could: viewer-submitted text and images, and viewer purchases in the platform's paid
currency. Both are governed by platform rules that encode a sound practice and that the
build must satisfy structurally.

Content a viewer submits is published only after the viewer has shared their platform
identity with the extension, only with that identity's name shown beside it, only after
the streamer could review it and chose to approve it, and it stays removable by the
streamer afterwards. Anonymity, auto-publication and permanence are each a reason to
reject the version, and each is also the reason a streamer's panel ends up displaying
something the streamer never saw. That is
[viewer-content-needs-identity-and-approval](./techniques/viewer-content-needs-identity-and-approval.md).

Paid currency inside an extension may buy acknowledgement and looks from a catalogue the
extension itself defines. The platform's list of what it may not buy is longer than the
gambling rules a team expects, and most of it is about the way in. Money may not buy
access to a game, an entry into a draw or contest (directly or through a token it buys),
an item chosen by chance, a wager on an outcome the viewer does not control, a chosen
track, an item or experience the streamer or viewer names in free text rather than picks
from the extension's own list, or a voice channel. Participation is therefore not on the
catalogue. A paid priority place in a queue to play is the way in for whoever it moves
ahead, so it stays off unless the platform confirms otherwise.

The outcome of a vote and extra weight in a decision are missing from that list. The show
forbids them: the steering economy's rule is that money changes how the show looks and
who is thanked, never what the room decides. The extension is where the platform's
reviewer starts enforcing its own list, and the show's rule still sits on top of it.

## Decision rules

- **When a change is requested**, ask first whether the document can express it. If it
  can, ship it as data the same day. If it cannot, it is a new version and a review cycle;
  batch it with every other code change in sight.
- **When the shell gains a feature**, make it switchable from the document and default it
  off, so the reviewed version can ship before the feature is wanted.
- **When the front end needs a new outside address**, it is a new version. Choose backend
  hosts before the first submission and keep them stable.
- **When state changes faster than the broadcast budget**, coalesce; never queue events
  behind the budget and never let viewers poll the backend to make up the difference.
- **When a version is ready**, it has passed hosted test and the load rung on owned
  accounts; submit then, not to discover what the reviewer thinks.
- **When a version is approved**, release on the owner's chosen date, not on approval,
  with a backend that still answers the version it replaces.
- **When viewers can pay**, the catalogue holds looks and thanks. Anything that lets a
  viewer in, to play or to a draw, is off it, and so is anything chance or free text
  decides.
- **When viewers can submit anything**, identity first, streamer approval before
  publication, the author's name shown, removal always available.

## The failure modes of the naive reading

**Iterate in review.** Submitting, reading the feedback, fixing and resubmitting spends a
fortnight per loop and risks the identity on each one. Review is a gate the version is
expected to pass, not a source of feedback.

**Remote config that is really remote code.** A document carrying markup, script or URLs
to load is the most tempting shortcut and the most dangerous; it passes the first review
by accident and fails the next one on purpose.

**One event, one broadcast.** Forwarding each vote or click to every viewer exhausts the
broadcast budget within seconds of a busy moment, and the backlog delivers a stale
picture late. The broadcast carries the state, not the events.

**Released means safe to iterate.** A released version cannot be patched; a defect in it
stays live until a new version clears review. That is why the switch to turn a feature
off lives in the document, not in the code.

**Widen the allowlist to find testers.** The test rungs may run on a live channel,
because only allowlisted accounts see an unreviewed version there. The allowlist is what
keeps that true; every account added to it is a viewer receiving unreviewed code, and
adding a partner's community to it is a release without review.

**Trust the friendlier figure.** The platform's own documents do not always agree on its
limits. Design to the stricter one and measure on the hosted test rung, where the real
budget applies.

## Boundaries

**Against [on-stream overlay delivery](../on-stream-overlay-delivery/on-stream-overlay-delivery.md)**,
which serves pages the streamer's broadcasting software renders into the video: an
overlay is composited into the broadcast picture on the streamer's machine, is served by
the tool, needs no platform review and can be changed whenever the tool changes; an
extension runs in each viewer's player, is served by the platform, and changes only by
climbing this ladder. Both share the discipline of read-only, aggregate, whole-snapshot
data, and that discipline is owned there. A tool may run one renderer in both hosts, so
that a design package drawn in the broadcast is drawn the same way in the player; the
package rules then hold once, in delivery, and this subject adds only what the second
host's review and broadcast budget demand. The rule: if the surface is part of the video
every viewer receives, it is overlay delivery; if it is a component of the platform's
page that each viewer's browser runs, it is here.

**Against [audience steering economies](../../live-show/audience-steering-economies/audience-steering-economies.md)**,
which designs the powers the audience holds — votes, ranks, proposals, tributes — and how
much each viewer's power weighs: that subject decides what a vote is and what it binds;
this one decides how a vote surface ships inside the platform's player and what the
platform's review will and will not accept around it. The rule: if the question is what
the room may decide, it is steering; if it is how the deciding surface reaches viewers
and survives review, it is here.

**Against [red lines outside the economy](../../live-show/audience-steering-economies/techniques/red-lines-outside-the-economy.md)**,
which keeps the show's red lines off every menu so no rank, vote or gift reaches them:
the extension inherits that menu unchanged and adds the platform's own monetisation
rules as an external floor. Neither replaces the other. A purchase the platform would
allow can still be off the show's menu, and a menu item the show allows can still be a
purchase the platform forbids; the extension ships only what both permit.
