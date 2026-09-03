---
source: github:Chatterino/chatterino2
kind: repository - vendor repository with the vendor slot held by a community project (a desktop chat client over hosted chat and emote services: ~140k lines of C++ over a cross-platform UI toolkit, 32,550 words of in-tree markdown of which the changelog is 18,514, 31,327 words of doc comment; the landing page contributed nothing)
url: https://github.com/Chatterino/chatterino2
title: "Chatterino 2 - a chat client for a live-streaming service"
author: Chatterino (community project)
commit: fda51f0d3a4a5cd15f099b951b796e299d566e9e
words: 499 landing / 32,550 in-tree markdown (14,036 outside the changelog) / 31,327 doc-comment words; the operating documents are code, and 11 of 13 design entries anchor in code
method: 2.3.2 (round 6 of the 2.x series). Every worker ran on Fable, not Opus - three consecutive Opus dispatches returned 529 overloaded before any wrote a byte, and the front half was run as a fork. Two session rate limits then killed eight worker attempts mid-flight; every landing survived because the workers wrote each file the moment it was drafted, which the re-dispatch briefs asked for.
extracted: 27 (19 design rows, 8 claim/craft rows) over a design record of 13 written + 7 folded entries in 6 systems
accepted: 9 techniques + 6 amendments (5 boundary cases from the source, 1 from a not-better apply row) + 11 source-tree applications + 6 fleet applications
declined: 0
leads: 5
already_covered: 8
untriaged: 8
dispatched: 1 front-half fork + 5 landing workers (re-dispatched once) + 1 remainder worker + 1 project worker
applied: 14 owed (9 techniques + 5 source amendments); 6 rows written (1 code better, 1 experiment unmeasurable, 4 simulation: 3 better, 1 not-better); 8 unapplied with return conditions
shipped: 6 project commits in 2 projects (personas 5 incl. one merge, pof 1); nothing pushed
routing_count: per system NONE A2 / B2 / C0 / D2 / E1 / F1 (whole tree 8 of 20); HOME-IF-NEW max 2 (chat-transcript, realtime-events, settings); existing-home triple C=3 in untrusted-extension-host -> technique triple, no forge
handoff: none (stayed in intake; neither v2.2 clause fired)
directions: 1 proposed (personas, a restore surface over its store backups), 2 not proposed with reasons; gate=skipped (unattended)
run_id: intake-chatterino2
siblings: 2 at claim (a fleet-ship run and a repository run, both quiet on subjects); a third sibling's untracked subject folder under engineering-assessment was leaving the bundle gate red with a missing technique link at commit time - not this run's, named here so the next reader knows why the index was left uncommitted
rescan_when: "the source ships an enumeration test for its sandbox globals (the drift between its published allowlist and what it opens is recorded in the sandbox application); or a second client of a per-connection-limited duplex protocol splits by direction (L1); or a second maintained project publishes an AI-contribution policy (L2)"
---

# Chatterino 2 (vendor repository, community-held) - round 6 on 2.3.2

**Class read at Phase 2 (front half, confirmed):** vendor repository, community-held,
through the *no-rules-page* branch of the class rule (2026-09-02): there is no "things we
learned running this" document, the operating documents are the code, and the yield
ratio came out 11:2 code to prose. Doc-comment words (31,327) exceed non-changelog
markdown (14,036), so the doc comments and the per-module READMEs were swept as the docs
tier and the README last. Expected yield said before the tables: design-rich,
subject-poor, no forge - techniques and amendments inside subjects the corpus already
has, one technique triple, few claims. Delivered exactly that shape. Fetches: 0.

**Round-6 declared focus, applied.** (1) *Ask the ship-scope question to cover Phase 7.6.*
The run was unattended, so no question was asked; the standing authorization for fleet
writes (2026-08-26) covered both the apply lane and the direction proposal, and this note
records which trees were written (personas, pof) so the gap the focus named - a direction
found at 7.6 that an answer at Phase 5 made unreachable - could not occur. (2) *Directions
waiting at Phase 1:* 1, with five ledger rows written the same day, so the one-per-project
cap did not engage. (3) The per-system count and the source-tree application rule held;
*Opus for every worker phase* did not, for the reason in `method:` above, and the depth
of the landings did not visibly suffer - the scorecard row says so and the next round
should check it.

## Design record (Phase 2d) - summary

Thirteen entries in six systems (companion `2026-09-03-chatterino2.design-read.md`, which
carries the full record, the sweep log, every anchor and the peer check). System A, the
message pipeline: freeze the model, cache the layout per view (A1); a filtered view is
itself a channel (A2); a re-entry budget under deliberately synchronous dispatch (A3);
cursorless catch-up sized from elapsed time and rate (A4). System B, connections: the
duplex transport split by direction (B1, demoted to a lead - the tree carries the
mechanism, not the forces); an egress bucket below the published ceiling (B2); a
capacity-packed subscription pool with a per-topic state machine (B3); traffic as the
pulse and a late tick skipped (B4). System C, the in-process extension boundary: sandbox
by library subtraction (C1); safe mode registers everything and runs nothing (C2); uniform
non-fatal callbacks with abandoned closures (C3). System D, user-authored rule engines:
the filter language typed at parse time (D1); an applied-defaults ledger instead of a
version chain (D3). System E, operating the client: rotating config backups with a
restore surface (E1); the restart flag outside the store (E2); nightly builds refuse
in-app update (E3). System F, discipline: approval snapshots behind a compile-time
switch a CI job asserts off (F1); marker-region codegen (F3); a hash-pinned external
linter with a review bot (F4).

Both routing counts were written before the decision: no system reaches three NONE, no
home-if-new is shared by three, and system C's three entries all have the same
*existing* home - the subject the corpus gained two days earlier from a different source.
Under v2.2 that is a technique triple inside that subject, not a forge. The director
took the recommendation.

## What landed

**Techniques (9).** `untrusted-extension-host`: `capability-subtraction-sandbox`,
`safe-mode-registration`. `chat-transcript`: `immutable-model-cached-layout`,
`virtual-filtered-channel`. `realtime-events`: `capacity-packed-subscription-pool`.
`settings`: `applied-defaults-ledger`, `config-backup-and-restore`. `search`:
`typed-filter-language`. `test-harness`: `approval-snapshots-with-guarded-update`.

**Amendments (6).** Boundary cases inside `per-callback-failure-policy` (C3),
`subscription-lifecycle` (A3), `live-prepend` (A4), `liveness-and-heartbeats` (B4),
`crash-capture` (E2); and a sixth written from a not-better apply row - a boundary in
`applied-defaults-ledger` stating that a store whose migrations are idempotent replays
over structure already owns the property and should keep the replay.

**Source-tree applications (11, stack `cpp`, new to the corpus).** One per technique
above, plus catches for `algorithm-selection` (B2), `updater-chain` (E3),
`generated-file-hygiene` (F3) and `enforcement-binding` (F4). The negative findings the
workers recorded are the half worth reading: the published sandbox allowlist omits two
libraries the runtime actually opens and no test enumerates the globals; safe mode has no
automated test; the two halves of the subscription-pool technique live in two different
pools that never meet, with a literal TODO where the capacity check should be; the egress
bucket can never say no; a catch-up that returns exactly its cap is silent about
truncation; the layout invalidation stamp is app-wide rather than per view.

**Corrections to the front half, from the landing workers.** The A4 negative finding as
briefed ("a failed load is silent") was wrong: the shared error handler posts a system
row; what the tree omits is the *truncation* case, and the amendment says that instead.
`verified_against` for a C++ tree is `cpp@23` by the gate's own regex, with the product
version and toolkit requirement in the first paragraph. `cpp` was added to the bundle's
stack list by the director.

## Applied (Phase 7.5) and shipped (Phase 8)

| Technique or amendment | Project | Mode | Verdict | Where |
| --- | --- | --- | --- | --- |
| `liveness-and-heartbeats` amendment (late tick) | personas | code | better, ab-paired | the cloud health monitor hook: A entered reconnect on one late failure, B re-probes once; 2/3 fail on A, 3/3 pass on B, control intact; merged after a green gate |
| `approval-snapshots-with-guarded-update` | pof | experiment | unmeasurable | 17 of 17 snapshot commits also changed source, no gate sees a snapshot change; instrument named |
| `config-backup-and-restore` | personas | simulation | better | three cases from the tree, including its own admission of "no in-product restore path"; a direction proposal carries the build |
| `applied-defaults-ledger` | personas | simulation | **not-better** | idempotent replays over structure already own the property; the technique gained the boundary |
| `per-callback-failure-policy` amendment | personas | simulation | better | observers are non-fatal by signature; the mute is not owed until observers can emit |
| `crash-capture` amendment | personas | simulation | better | the crash discriminator is a file beside the store, as the amendment says; no restart policy exists to test |

Eight rows are unapplied with return conditions in `librarian/applied.md`: the two
sandbox techniques (no fleet project loads third-party code in-process), the subscription
pool (no fleet project multiplexes capped push connections), the two transcript techniques
(no fleet transcript paints its own rows), the typed filter language (no fleet
user-authored filter language), and the A3 and A4 amendments (no synchronous transforming
dispatch, no cursorless catch-up seam found).

## Directions (Phase 7.6)

**Proposed (1).** personas - a restore surface over the store backups the tree already
rotates. The forces are the project's own: local-first, one operator, one copy; the
tree admits the absence in a migration comment. Written into the project's directions
folder and committed; status proposed; the gate was skipped because the run was
unattended.

**Not proposed (2).** personas safe-mode boot: the falsifier fired - the runner's
extension surface is in-tree compiled code registered at startup, so no operator-supplied
code can break boot and the forces do not apply. personas late-tick rule: applied as a
code change instead (above), which is the coverage lane, not a direction.

## Leads (return conditions in the design read, section 7)

L1 split a per-connection-limited duplex transport by direction (one fetch of the
provider's rate-limit guide would settle it). L2 gate AI-assisted contributions on a
human track record (one project's policy; needs a second). L3 a truncated catch-up
should be stated (folded into the A4 amendment as the rule; return if upstream adds a
marker). L4 safe mode as a generic desktop boot mode (landed as a technique; the fleet
seam is still absent). L5 identity-scoped connection eviction (the source's own TODO).

## Already covered (8) and untriaged (8)

Listed with their covering files and anchors in the design read, sections 7. Nothing
was declined; the untriaged rows are unverified, never judged.

## Reflection pointers

The scorecard row and the lessons entry for this run are in the skill's own files. The
two method observations: a worker that writes each file as it is drafted loses nothing
to a mid-flight kill, and this should be the brief's default rather than a re-dispatch
instruction; and the not-better simulation produced the run's sharpest technique
boundary, which is the apply lane doing what the corroboration table cannot.
