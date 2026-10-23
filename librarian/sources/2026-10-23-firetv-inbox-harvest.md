---
source: librarian/inbox.md (firetv rows)
kind: batch
url: https://github.com/xkazm04/firetv
title: firetv inbox leads - Study Desk, Death Ride and the demo film, triaged at the project's retirement
author: firetv agent sessions (one project, one voice)
words: 60 rows
commit: 50b3ce54
extracted: 60
accepted: 6
declined: 1
leads: 4
already_covered: 11
untriaged: 36
applied: 6
shipped: 1
dispatched: 0
run_id: intake-firetv-inbox-1023
siblings: 0
---

# firetv inbox harvest - triage at retirement

**Class: channel corpus (one project, one voice), first-party, measured, n=1 per row.**
Expected yield said before the table: amendments and catches against mature subjects, no new
subjects; within-batch convergence is void because every row has one author. Corroboration
ran corpus-internally plus code read in the source tree: the public repository cloned at
`50b3ce54` (main), its parent commit for the removed game, and the film tooling, which is
**not on the remote** (only `main` and `archive/deathride-main` are) and was read read-only
from the last local checkout before its deletion. 0 of 3 web fetches.

The project left the fleet today, so Phase 7.5 had no firetv seam to test against. Every
landing was applied against a still-managed project where a seam existed, and filed
unapplied with a return condition where none did. The source tree implements every landed
technique; that is the evidence the techniques were written from, not an A/B.

Five triage workers read prior art in parallel and returned proposals. The director re-read
the tree evidence for every accepted row (RISK 0 is the director's read, not the worker's).

## Gate

Rule: auto-accept when GAIN - RISK >= 2 and GAIN >= COST. Every boundary amendment scores
GAIN 1, so an amendment clears only with convergence; that is why 36 well-evidenced rows are
banked rather than landed. Their drafts are below, written to the target file's voice and
purity-checked by the worker, so a later run lands each for the price of one re-read.

| row | subject (named) | outcome | target | G/R/C | read |
| --- | --- | --- | --- | --- | --- |
| 2+17 | test-harness | LANDED new technique | test-harness/assert-the-schedule-not-the-stopwatch | 2/0/2 | real gap |
| 24+25 | native-shell-integration | LANDED new technique | native-shell-integration/host-forwarded-key-contract | 2/0/2 | real gap |
| 39 | fire-tv-device-realities | LANDED new technique | fire-tv-device-realities/price-the-open-audio-stream | 2/0/2 | real gap |
| 41 | phone-controller-input-protocol | LANDED new technique | phone-controller-input-protocol/answer-the-open-ask-by-id | 2/0/2 | real gap |
| 49 | on-device-verification-harness | LANDED new technique | on-device-verification-harness/borrow-and-return-the-shared-device | 2/0/2 | real gap |
| 15 | subprocess-lifecycle | LANDED amendment (+1 fleet convergence: two managed trees already scope the strict mode) | subprocess-lifecycle/spawn-contract | 2/0/1 | real gap |
| 1 | media-playback | COVERED | realtime-events/subscription-lifecycle (cancelled continuation releases the late handle) | 0/0/1 | catch |
| 4 | test-harness | COVERED | sidecar-provisioning/capability-detection; spawn-contract (gate-sees-target) | 0/0/1 | catch |
| 13 | judgment-guardbands | COVERED | status-vocabulary/vocabulary-chain-integrity (derived containers total by construction); the tree's own fix is still a hand list | 0/0/1 | catch |
| 14 | subprocess-lifecycle | COVERED | subprocess-lifecycle/spawn-contract (spawn by absolute path); fleet already conforms twice | 0/0/1 | catch |
| 18 | test-harness | COVERED | supply-chain/secret-scanning-architecture (a stale exemption fails the run); quality-gates/waiver-names-its-finding | 0/0/1 | catch |
| 30 | render-submission-economy | COVERED | render-submission-economy/retain-what-did-not-change (count the retained buffer) | 0/0/1 | catch |
| 36 | perf-regression-gating | COVERED | metric-gates (gate on direction from a committed baseline); perf-regression-gating/host-independent-work-counts | 0/0/1 | catch |
| 37 | controller-latency-instrumentation | COVERED | perf-regression-gating/delivery-bar-at-the-display (the limit is the refresh period) | 0/0/1 | catch |
| 42 | lan-pairing-and-session-continuity | COVERED | fire-tv-device-realities/server-socket-portability-hedge | 0/0/1 | catch |
| 47 | app-shell | COVERED | short-form-cards-and-barks/television-read-budget (lines per unit) | 0/0/1 | catch |
| 58 | production-pipeline-phasing | COVERED | live-system-demo-film/retake-without-an-edit-session; video-assembly/music-spotting-against-picture | 0/0/1 | catch |
| 40 | lan-pairing-and-session-continuity | DECLINED | contradicts device-pairing/token-binding-and-transport: the secret rode a launch link's query string, which that technique forbids for a credential; the memory-only and remembered-address halves are already covered | - | wrong |
| 21 | realtime-events | LEAD | effect ordering in a sans-IO state machine's effect list | 1/0/1 | thin |
| 46 | release-pipeline | LEAD | the project switched its own per-PR re-proof off after it went red on every PR | -/2/1 | thin |
| 48 | packaging | LEAD | one instance; "what a reviewer actually tries" asserted, not measured | -/2/1 | thin |
| 60 | test-harness | LEAD | re-cut from raw clips is covered (retake-without-an-edit-session); retry-on-server-failure is one run; home is live-system-demo-film | -/2/1 | thin |

Banked (untriaged by the gate; prior art checked, tree evidence confirmed by the worker,
director did not re-read): rows 3, 5, 6, 7, 8, 9, 10, 11, 12, 16, 19, 20, 22, 23, 26, 27, 28,
29, 31, 32, 33, 34, 35, 38, 43, 44, 45, 50, 51, 52, 53, 54, 55, 56, 57, 59. Scores and targets
in the next table; `reconsider?` none (no prior decline matched).

## Untriaged - banked with drafts

Nobody verified these past the worker read. Each would land as a boundary amendment (GAIN 1)
unless marked new. A second independent source, or a director re-read plus fleet convergence,
is what promotes one.

| row | target (subject/technique) | shape | G/R/C | the missing case |
| --- | --- | --- | --- | --- |
| 3 | realtime-events/coalescing-and-batching | amendment | 1/0/1 | a latest-value transport is an undeclared last-write-wins coalescer; commands across it need an ordered queue |
| 5 | accessibility/keyboard-navigation-models | amendment | 1/0/1 | the shipped half: a styling attribute moves and nothing else; voice the lit stop through the shell's ONE announcer (the row's per-surface region would contradict live-region-architecture) |
| 6 | czech/typography-and-spacing | amendment | 1/0/1 | detectors scanning localized text for digits split decimal-comma and spaced-percent numbers; scan the locale-neutral print |
| 7 | status-vocabulary/vocabulary-evolution-checklist | amendment | 1/0/1 | a member derived at read time skips the storage steps but not the rendering ones |
| 8 | sidecar-provisioning/resolution-ladders | amendment | 1/1/1 | a found artifact that will RUN takes candidates only from the VCS's own checkout list, never a directory crawl (contested with supply-chain) |
| 9 | retry-backoff/error-classification-for-retry | amendment | 1/0/1 | a class named after its author is not a cause; classify each throw site |
| 10 | model-call-outcome-integrity/one-deadline-across-attempts | amendment | 1/0/1 | a caller-decided re-ask carries a continuation token (deadline end, next try number) |
| 11 | prompt-assembly/layered-composition | amendment | 1/0/1 | migration onto the assembler gated by a syntax walk that catches spread builders, as a shrink-only ratchet |
| 12 | agent-memory (new: recurrence-keyed-on-the-edit) | technique | 2/0/2 | recurrence of a stored correction is matched on the token-diff n-grams, not the corrected sentence. Held: the memory lane (triage against the measured ladder) was not run, and the row's counts are not in the tree |
| 16 | invariant-placement (new: review-set-is-the-acted-set) | technique | 2/1/2 | a capped review list derives from the post-exclusion acted set plus the excluded items (contested home) |
| 19 | observability-telemetry/rotation-and-retention | amendment | 1/1/1 | a failed inline rotation must never cost the append (row named cost-metering; contested) |
| 20 | client-state/persistence-and-migration | amendment | 1/1/1 | throttle whole-state persistence per producer (the periodic clock), write at once on everything else (row named embedded-db) |
| 22 | test-harness/unreached-decisions-pin-nothing | amendment | 1/0/1 | an overlay fixture key that names nothing scores the default; refuse unknown keys |
| 23 | device-pairing/admission-scoping | amendment | 1/0/1 | bound the frame size read before trust |
| 26 | accessibility/keyboard-navigation-models | amendment | 1/0/1 | script-created key events carry no default action, so forwarded-key screens must own focus in state |
| 27 | motion/performance-discipline | amendment | 1/1/1 | a filter or soft shadow on a promoted layer is per-frame offscreen work; bake shadows into the art |
| 28 | motion/performance-discipline | amendment | 1/1/1 | composite-only assumes the paint exists; a freshly mounted layer shows what lies beneath, so paint a cheap backdrop (row named render-mount-pipeline) |
| 29 | motion/performance-discipline | amendment | 1/1/1 | a static scale on a promoted layer rasters at full size; fit with a layout zoom, gated on a pixel comparison |
| 31 | motion/performance-discipline | amendment | 1/0/1 | declarative looping animations are orphan loops; rest them or drive them from one low-rate clock |
| 32 | motion/performance-discipline | amendment | 1/0/1 | the paint-only property class re-rasters the host layer; switch it instantly |
| 33 | motion/performance-discipline | amendment | 1/1/1 | animation-state getters force a style flush like geometry reads (row named render-mount-pipeline) |
| 34 | perf-regression-gating/delivery-bar-at-the-display | amendment | 1/1/1 | the host toolkit's jank verdict is a third clock for embedded-view frames (contested with perf-instrumentation) |
| 35 | perf-regression-gating/equivalence-before-the-saving | amendment | 1/1/1 | still every animation through the runtime's animation list before a pixel comparison; prove the setup with two captures of one build |
| 38 | on-device-verification-harness/meminfo-local-to-avoid-forced-gc | amendment | 1/0/1 | an in-process probe allocates in the measured heap; price one read first |
| 43 | judgment-guardbands/narrate-dont-rescore | amendment | 1/0/1 | prose can carry a checkable counter-verdict (a worked solution); re-check it and withhold on disagreement |
| 44 | quality-regression-gating (new: keyless-watch-over-committed-records) | technique | 2/1/2 | measure live on the machine with the engines, commit counts-only records, CI watches for missing, stale or alerting (contested with judge-calibration-and-drift) |
| 45 | eval-harness/certification-levels | amendment | 1/0/1 | derive the live surface from the bench's import graph; a change touching it carries a fresh record compared against the base's |
| 50 | fire-tv-device-realities (new: device-screen-recorder-contract) | technique | 2/1/2 | the device recorder's cap, change-only frames, graceful stop by its own pid, and black on a sleeping display |
| 51 | live-system-demo-film/retake-without-an-edit-session | amendment | 1/0/1 | second-device capture shares no clock: anchor each beat on its first visible frame change inside a host-clock prior window, log the residual |
| 52 | live-system-demo-film/retake-without-an-edit-session | amendment | 1/1/1 | a rehearsal rung on a stand-in surface before scarce device time (row named review-iteration-loops) |
| 53 | live-system-demo-film/recording-that-asserts-its-claims | amendment | 1/0/1 | a live answer opens its own window and must NOT already be on screen when it opens |
| 54 | live-system-demo-film/audio-first-beat-pacing | amendment | 1/1/1 | elide a model wait with a short dissolve, honest only while the film claims nothing about speed (row named video-assembly) |
| 55 | live-system-demo-film/recording-that-asserts-its-claims | amendment | 1/1/1 | record every beat first, assemble after; chained beats in one device hold (row named on-device-verification-harness) |
| 56 | video-assembly/multitrack-timeline-discipline | amendment | 1/0/1 | the encoder's frame quantization is a second time authority; cut by frame count, write edges from it, pad with the last frame |
| 57 | video-assembly/verify-cheapest-artifact-first | amendment | 1/1/1 | joins belong beside container, codec, duration and loudness: step every cut for bare-background blinks (row named review-iteration-loops) |
| 59 | live-system-demo-film/recording-that-asserts-its-claims | amendment | 1/1/1 | an assertion proves a result is on screen, not that it says what the line says; re-read live-output lines against the take twice (row named marketing) |

Clusters a later run should land as one edit: rows 27, 28, 29, 31, 32 and 33 all land in
motion/performance-discipline; rows 5 and 26 in one keyboard-navigation-models paragraph;
rows 51, 52, 53, 55 and 59 in two live-system-demo-film techniques. The motion cluster is six
measured boundary cases of one technique from one weak device. That is the nearest thing in
this batch to a cluster finding: the technique's "composite-only is free" premise holds for
layout cost and fails for raster cost on a weak compositor, four different ways.

None of the media rows is render-bound: they edit and assemble captured real footage; no
generator instruction changes.

## Apply (Phase 7.5)

| landing | project | mode | verdict | what was read |
| --- | --- | --- | --- | --- |
| spawn-contract amendment | gravitone | code | better | seam chosen because it could falsify (a scheduled night on the 5.1 host under the strict mode with an unscoped merge). Paired stub probe: A 0 lines logged / exit 1, B 3 lines / exit 3; floor: script parses with 0 errors and its print mode is unchanged. Latent: no night has run on this machine. Shipped local, not pushed |
| assert-the-schedule-not-the-stopwatch | none | simulation | unmeasurable | regex hunt over 10 node trees for elapsed-time bounds asserting concurrency found no seam. Return: when a managed suite proves parallelism or a timeout by a wall-time bound |
| host-forwarded-key-contract | none | simulation | unmeasurable | no managed project wraps a page for a remote-driven host. Return: when one does |
| price-the-open-audio-stream | none | simulation | unmeasurable | no managed project ships to a streaming stick; the standalone-headset game's tools hold no audio-path soak. Return: when a managed game soaks on a weak device with sound |
| answer-the-open-ask-by-id | none | simulation | unmeasurable | no managed project has a host-led companion. Return: when one does |
| borrow-and-return-the-shared-device | none | simulation | unmeasurable | the headset game's capture tools run on the desktop; no shared-device driver in the fleet. Return: when a managed project drives a shared device from more than one session |

## Corrected premises worth keeping

- Row 40's claim ("deliver the secret over the operator's own channel") read as safe and was
  not: the channel was a launch link with the secret in its query string, which outlives the
  call in shell history and the platform's activity log. The corpus already forbids it.
- Row 13's claim says "one table"; the tree's own fix is still a hand-kept list. The covering
  technique states the rule the tree did not follow.
- Row 46: the project turned its own per-PR re-proof off after it went red on every PR it ran
  on. A rule its author disabled is not a landing.

rescan_when: the repository is archived and receives no commits; re-read only if the film
branch is ever pushed (its capture tooling is the evidence for rows 49-60); or 8 weeks elapse
(2026-12-18).
