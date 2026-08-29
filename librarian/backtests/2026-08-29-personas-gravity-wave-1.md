---
date: 2026-08-29
kind: backtest wave
projects: [personas, gravity]
workers: 15 (opus)
pairs_judged: 150
technique_verdicts: { conformant: 193, deviation: 364, not-applicable: 503, unknown: 37 }
registry_proposals: 64
---

# Backtest wave 1 - personas and gravity, 72 subjects

The first execution of the apply/backtest debt named in [[../applied]]. Fifteen Opus
workers ran the `/conform` method (standard first, code second, per-technique verdicts)
over every strong-confidence unjudged pair in two managed projects' registry maps, each
writing one verdict file; `scripts/merge-conform-runs.mjs` folded them into the maps and
into a per-project `conform-detail.json` that carries the technique-level detail. Both
maps were committed in their projects with a pathspec. This note is the public-safe
half: slugs, counts and verdicts, never a project's paths.

## Funnel

| Project | Pairs judged | Pair states | Technique verdicts |
| --- | --- | --- | --- |
| personas | 142 of 791 (66 subjects) | 7 conformant / 113 deviation / 21 n-a / 1 unknown | 171 C / 344 D / 479 N-A / 37 U |
| gravity | 8 of 40 (6 subjects) | 1 conformant / 7 deviation | 22 C / 20 D / 24 N-A |

**Read the pair states carefully.** A pair is `deviation` when one applicable technique
of six-to-ten is unrealized, so 113/142 says nothing about how much of the standard the
repo carries; the technique row does: 171 conformant against 344 deviation with 479
not-applicable. Several workers reported textbook realizations beside the deviations,
and several noted subjects that were forged from these very repositories - those
verdicts are closer to self-assessment than backtest and are flagged in the detail.

## What this proves about the corpus (the part that is not a project backlog)

1. **The matcher pairs on vocabulary, not on precondition.** Twelve or more pairs across
   both projects were lexical resonance - the credential vault matched `markdown-vault`
   on the word *vault*, a template wizard matched `adoption-measurement` on a directory
   name, a triage deck matched `conversation-orchestration` on *chips/options*, a
   quality-gate harness matched `eval-harness` on *harness*. Every worker that hit one
   proposed the same fix: gate the pairing on the golden path's stated precondition
   before scoring vocabulary. That is a `build-registry-map` change, and the highest-
   value follow-up this wave produced.
2. **Map rows go stale silently.** At least 30 listed paths no longer exist across the
   two maps; two contexts are entirely dead. The builder should verify path existence
   and mark rows stale rather than emit them - a worker cannot tell deleted from
   renamed-and-still-governed.
3. **Contradicted enumerations, again.** Where a technique states an absolute (*nothing
   raises a kind's volume*; *the mirror is not a query surface*; *mark cues as times,
   not scene references*), a real tree supplied the bounded counter-case the technique
   did not consider. Sixty-four proposals below; the ones of this shape are amendments
   waiting for an `/intake apply` row.

## Technique verdicts by subject (sorted by deviations)

| Subject | Projects | C | D | N-A | U |
| --- | --- | --- | --- | --- | --- |
| companion-runtime | personas | 16 | 17 | 14 | 2 |
| prompt-assembly | personas | 2 | 16 | 4 | 0 |
| templates-scaffolding | personas | 8 | 16 | 24 | 0 |
| credential-vault | personas | 13 | 14 | 19 | 2 |
| fleet-orchestration | personas | 6 | 13 | 74 | 3 |
| motion | personas | 10 | 12 | 7 | 1 |
| sql-console | personas | 6 | 9 | 2 | 1 |
| draft-editing | personas | 1 | 9 | 2 | 0 |
| companion-identity | personas | 6 | 8 | 14 | 0 |
| multi-project | personas | 3 | 7 | 8 | 0 |
| i18n | personas | 3 | 7 | 5 | 3 |
| analytics-time-windows | personas | 1 | 7 | 4 | 0 |
| hitl-approval | personas | 4 | 6 | 10 | 2 |
| entity-lifecycle | personas | 0 | 6 | 0 | 0 |
| markdown-vault | personas | 6 | 6 | 35 | 1 |
| accessibility | personas | 0 | 6 | 0 | 0 |
| webhook-ingestion | personas | 0 | 6 | 0 | 0 |
| conversation-orchestration | personas | 12 | 6 | 20 | 2 |
| docs-sync | personas | 3 | 6 | 2 | 0 |
| mcp-tools | personas | 9 | 6 | 24 | 1 |
| triage-queues | personas | 4 | 6 | 1 | 1 |
| web-scraping | personas | 0 | 6 | 1 | 0 |
| health-checks | personas | 0 | 6 | 0 | 0 |
| proactive-nudges | personas | 0 | 6 | 6 | 0 |
| usage-analytics | personas | 0 | 6 | 0 | 0 |
| content-research-grounding | gravity | 1 | 6 | 0 | 0 |
| voice-io | personas | 0 | 5 | 24 | 1 |
| design-tokens | personas | 1 | 5 | 0 | 0 |
| p2p-networking | personas | 5 | 5 | 6 | 2 |
| time-travel-replay | personas | 1 | 5 | 0 | 0 |
| agent-memory | personas | 3 | 5 | 12 | 0 |
| data-viz | personas | 0 | 5 | 1 | 0 |
| embedded-preview | personas | 1 | 5 | 0 | 0 |
| media-playback | personas | 3 | 5 | 4 | 0 |
| pipeline-dag | personas | 1 | 5 | 0 | 0 |
| versioning-snapshots | personas | 0 | 5 | 1 | 0 |
| long-form-reading-surface | personas | 1 | 5 | 4 | 0 |
| trace-rollup-and-attribution | personas | 1 | 5 | 5 | 1 |
| canvas-graph | personas | 0 | 5 | 1 | 6 |
| connector-catalog | personas | 4 | 5 | 15 | 0 |
| eval-harness | personas | 5 | 4 | 23 | 1 |
| sync-replication | personas | 2 | 4 | 0 | 0 |
| guided-tours | personas | 4 | 4 | 4 | 0 |
| client-state | personas | 3 | 4 | 2 | 1 |
| codebase-scanning | personas | 0 | 4 | 4 | 1 |
| session-resume | personas | 1 | 4 | 1 | 0 |
| realtime-events | personas | 0 | 4 | 2 | 0 |
| evidence-bound-visuals | gravity | 1 | 4 | 3 | 0 |
| import-normalization | personas | 2 | 3 | 0 | 1 |
| diff-comparison | personas | 2 | 3 | 1 | 0 |
| search | personas | 0 | 3 | 3 | 0 |
| terminal-multiplexing | personas | 2 | 3 | 0 | 2 |
| app-shell | personas | 1 | 3 | 2 | 0 |
| review-iteration-loops | gravity | 6 | 3 | 7 | 0 |
| frame-direction | gravity | 3 | 3 | 0 | 0 |
| quality-gates | personas | 5 | 2 | 3 | 1 |
| self-healing | personas | 1 | 2 | 3 | 0 |
| breach-alerting-and-attribution | personas | 0 | 2 | 5 | 0 |
| deployment-contract | personas | 2 | 2 | 6 | 0 |
| model-routing | personas | 2 | 2 | 16 | 0 |
| settings | personas | 0 | 2 | 4 | 0 |
| form | personas | 0 | 2 | 3 | 0 |
| video-assembly | gravity | 8 | 2 | 8 | 0 |
| image-prompt-composition | gravity | 3 | 2 | 6 | 0 |
| test-harness | personas | 2 | 1 | 7 | 0 |
| async-ui-states | personas | 0 | 1 | 4 | 1 |
| scheduling | personas | 3 | 1 | 2 | 0 |
| agent-chaining | personas | 0 | 1 | 5 | 0 |
| llm-call-telemetry-model | personas | 0 | 0 | 6 | 0 |
| codegen | personas | 0 | 0 | 6 | 0 |
| operator-surfaces-for-llm-spend | personas | 0 | 0 | 6 | 0 |
| adoption-measurement | personas | 0 | 0 | 12 | 0 |

## Registry proposals (64, path-stripped; the anchors live in each project's conform-detail)

- **fleet-orchestration** (personas): durable-fleet-state's 'the mirror is not a query surface' rule is stated absolutely, but this repo has a legitimate second reader: a harvest that must survive an orchestrator restart can only account a roster from the durable copy, because the in-memory registry forgot the sessions that ended before the crash. Worth a paragraph on the one sanctioned second reader (post-hoc run accounting) and the freshness contract i
- **fleet-orchestration** (personas): heterogeneous-model-panels splits the world into cross-family panels and same-weights sampling runs, and this repo sits in a third place the technique does not name: seats that are one provider's tiers (haiku/sonnet/opus) driven by materially different role prompts. That is not cross-family concordance, but it is also not variants of the same weights sampled N times. A sentence on where role-diverse, same-provider pa
- **fleet-orchestration** (personas): Coverage question, technique-shaped resonance: the matcher paired this context on the vocabulary 'session / phase / awaiting-input / resume', all of which appear, while the subject's stated precondition (a fleet) fails outright. The context is a staged single-conversation design wizard, better governed by wizard-flows plus the single-session lifecycle sibling; routing by precondition rather than vocabulary would have
- **fleet-orchestration** (personas): Coverage question: these widgets are a decision/observability surface, not fleet machinery. [code] encodes a real standard ('failures go to a queue a human can review, not a silent log; at least one success metric tracked') and DecisionsPanelWidget is a review-queue projection - so hitl-approval (review-queues) and an observability-plan subject govern this context, not fleet-orchestration.
- **fleet-orchestration** (personas): Coverage question, likely a corpus hole: [code] draws exactly the distinction the corpus values - `cached` (healthy reuse) vs `stale` (a rescue because the network failed) vs `unavailable` (no cache and no network), so a degraded read is never spelled like a healthy one, and [code] keeps a schema-valid-but-empty live payload from blanking the view. That is a content-delivery-degradation subject worth a forge lead; fl
- **eval-harness** (personas): Corrected pairing, and it matters: [code] is governed by quality-gates, which the matcher never proposed (it paired on the word 'harness'). Judged against quality-gates the context carries a severe deviation on severity-by-construction and gate-liveness: every custom audit gate's command ends in `| wc -l` , so the pipeline's exit status is wc's and is always 0; runGate returns passed:true whenever execSync d
- **eval-harness** (personas): Upward lesson for policy-projection (quality-gates) with a real anchor: [code] clamps a bar's visual width to 100% while printing the true number, with the reason written next to it ('Bars can exceed 100... clamp the visual width but show the true number'). That is the display-cap-is-not-a-data-cap rule realized as a two-line habit rather than as a postmortem, and it belongs in the application layer as a positive cit
- **eval-harness** (personas): Two notes. (1) The brief's path [code] no longer exists - the map row is stale for this context. (2) judge-stability says 'the judge is pinned (model, version, parameters, rubric, exemplars)'; this repo pins deliberately and still fails, because the pin points at a semantic alias (DEFAULT_BALANCED -> SONNET_CURRENT) that a routine model-roster bump moves. Worth one explicit line: a pin must be to a concrete dated ide
- **quality-gates** (personas): blocking-by-input-determinism reads as if the gated subject is always a code tree, and prescribes 'split the invocation so the deterministic half blocks'. This context is the case the rule does not cover: the gated act is ARMING a live integration against real credentials and a public webhook, so a verdict that never touched the third party is exactly the false green the gate exists to prevent ([code] settles this ex
- **voice-io** (personas): Coverage question, not a standard defect: the matcher routed by vocabulary ('voice', 'synthesize') rather than by the golden path's precondition (a product that listens and speaks). This pair should be dropped from the map; build_session is governed by prompt-assembly, which is separately paired here.
- **voice-io** (personas): Coverage question plus a stale brief: the pairing is vocabulary resonance on the persona 'voice' block, and the brief lists [code], which does not exist on disk — the map row's paths should be regenerated.
- **llm-call-telemetry-model** (personas): Coverage question: the matcher routed on the credential vocabulary ('api key') that server-owned-fields uses for its writing-credential stamp, not on the golden path's precondition (a receiving schema for LLM call events arriving over an untrusted channel). The right governing subject for this context is a credential/API-key management subject; this pair should be dropped rather than judged.
- **sync-replication** (personas): Upward proposal for topology-declaration: its three shapes (one-way mirror, hub and spoke, peer merge) do not name the shape this repo is actually in — N spokes belonging to one principal, converging on a hub that orders nothing (a PostgREST upsert). It reads as a one-way mirror per device and behaves as a hub with no adjudication, which is why the conflict policy went undeclared here. The technique could name that f
- **multi-project** (personas): passive-signal-ingestion says a watch attempt ends in one of three verdicts but does not say where the verdict is stored when the watcher is a stateless poll function. Personas' shape — a poll returning Result<Vec<Event>> plus a subscription row — makes 'could-not-observe' need a durable column on the subscription AND a rule that the freshness watermark must not advance on a failed pass. The second half (a failed obs
- **multi-project** (personas): per-project-tabs-and-state says a tab strip is one kind or the other by design. Personas has BOTH shapes in one product — a workbench strip (Studio) and a grouping strip whose tab is a SET of projects (dev-tools WorkspaceTabs) — and the second is not a row of navigation buttons: it persists an identity-keyed active group with a stale-id guard and scopes bulk actions to the group so a select-all cannot reach outside i
- **guided-tours** (personas): The map pairs this subject with a context that bundles `sub_learning` (genuinely guided-tours) with `sub_releases` (HomeReleases / roadmapItems / useLiveRoadmap — a release-roadmap surface the subject does not govern at all). Half this context's listed paths are outside the subject's precondition; the roadmap half looks like a coverage hole (a roadmap/changelog-surface subject) rather than a match.
- **design-tokens** (personas): density-and-scale-axes warns that a whole-surface pixel filter escapes the token layer. This repo is a measured field case worth citing in the application layer: the filter forced a compensation vocabulary — an exempt-token list, a `brightness-lock` utility, and a hardcoded list of Tailwind class prefixes to counter-filter — which is the exact 'growing dialect' signature the enforcement technique predicts, arriving t
- **client-state** (personas): This context is a test directory, and it surfaced something the subject does not currently say: several of these techniques are testable as behaviours, and the repo proves it — the shared failure-transition function is pinned, the restart round-trip and the IPC-unavailable fallback, and the reset hatch is exercised in every beforeEach. status-fsms, persistence-and-migration and singleton-lifecycle would each be stron
- **diff-comparison** (personas): Two of this context's listed paths do not exist in the repo — [code] and [code] — while the files that actually carry this subject ([code] and [code]) are not listed; the context's path set has drifted and the pair is only evaluable through the libs/ entries. Separately, diff-honesty's 'the vocabulary matches the alignment' clause is confirmed here in its strongest form: the alignment is not merely weak but provably 
- **motion** (personas): taste-budgets writes the entrance cap as a pure attention budget, and it has no vocabulary for a stagger adopted to protect the frame budget rather than to decorate. [code] spreads the MOUNTING of already-fetched rows so a large table does not insert every row on one frame — the 2000ms window is a concurrency control that performance-discipline's 'unbounded concurrency' clause arguably asks for, and the entrance cap 
- **motion** (personas): Upward lesson for reduced-motion-mechanics. The technique's liveness rule stops at 'subscribe, and where the platform's own reader does not subscribe, wrap it' — which is the right shape for a React consumer but leaves a scripted frame engine one rung short. [code] and :89-92 record the failure the subscribe rule does not catch: the preference was sampled at target-set time, so turning it on mid-flight left the curre
- **markdown-vault** (personas): Matcher miss, not a corpus hole: five contexts under [code] are the CREDENTIAL vault, and the registry already holds the subject that governs them — [code], which p2p-networking's golden path links by name as the custody boundary secrets live behind. markdown-vault matched on the bare word 'vault'. Route on the subject's precondition (is the store a directory of markdown records?) before its vocabulary
- **p2p-networking** (personas): Upward note, not a correction: the whole p2p subsystem compiles behind a cargo feature exactly as the golden path's capability-flag economics prescribe, and [code] renders a first-class 'this build was compiled without the p2p feature' state. The technique layer says to gate the subsystem but does not say the UI owes the flag an honest empty state; that is a real practice worth folding into capability-feature-gating'
- **time-travel-replay** (personas): timeline-derivation names a stated failure for records too damaged to parse, but not for the far commoner case this repo is in: a record that parses perfectly and simply contains no per-item timing (here, a log blob plus a duration and a total cost). That record cannot support a timeline, yet the honest-looking move — apportion and play — is exactly what shipped, and it defeats gap disclosure, dead-air compression an
- **breach-alerting-and-attribution** (personas): The subject's own builder-vs-operator seam predicts most of this row, and the matcher did not use it. Four of seven techniques are structurally not-applicable here for one shared reason — the audience is a single local operator with full read access, not a broadcast channel with unknowable membership — while the two that transfer (scoped-dedup-keys' level-not-edge cooldown, top-contributor-attribution's 'answer the n
- **codegen** (personas): This pairing is a lexical false positive and should be dropped: the matcher hit 'trigger' (trigger-wiring), 'commit' (commit-vs-derive-policy's settle commits), and the constants file's template 'registry' (task-registry-design), while the subject's actual precondition — committed source derived from other committed source by a registered generator — fails outright. Two corrections are owed. (1) codegen DOES govern t
- **agent-memory** (personas): Upward lesson for consolidation's 'the measure follows the question' section: the standard frames the min-normalized (directional) measure as belonging to duplicate-and-correction detection, but [code] found a sharper split — min-normalized topic overlap drives contradiction and supersedence while union-normalized similarity drives duplicate — and, more importantly, that CHECK ORDER is load-bearing in a way the stand
- **agent-memory** (personas): Map accuracy, not a standard problem: four paths the brief lists do not exist on disk — [code], [code], [code], and (in the markdown-vault brief) [code]. The panel's real entry points are [code] and [code]; [code] and [code] carry most of what the brief expected under the listed names, and MemoryProvenance in particular is where this context's strongest conformance evidence lives. The context path lists need regenera
- **credential-vault** (personas): The four acquisition ladder rungs are all present here (grant flow, Playwright tool capture, foraging, guided negotiation) — a rare complete set worth an application-layer citation for acquisition.
- **credential-vault** (personas): Routing question for the registry: this pairing looks like vocabulary resonance ('credential' appears as credentialEventsList) rather than governance. Route by the golden path's precondition — retention of a foreign secret — and this context belongs to an event-trigger / scheduling subject instead. Also note the map row lists [code], which does not exist on disk.
- **credential-vault** (personas): Upward lesson for health-probing: this repo carries a correct three-state vocabulary on the wire (HealthcheckResult.state, BulkHealthcheckSummary.unverifiable) and still loses it three separate times — in a catch block, in a persisted boolean column, and in a store slice's declared return type. The technique names the display surfaces as the place the vocabulary drifts; the measured loss point here is the *persistenc
- **analytics-time-windows** (personas): Upward lesson worth an application citation: [code] and :286-364 model a past scheduled slot as projected / past-success / past-failure / past-unknown and refuse to colour a slot from the trigger's overall health — 'never a fabricated outcome'. That is failure-not-empty-success applied to a calendar surface more crisply than any current technique states it, and matchPastSlotsToRuns' half-gap tolerance cap is a reusab
- **terminal-multiplexing** (personas): Upward lesson for keystroke-injection: [code] is the best statement of the typed-versus-pasted rule I have seen in code — it routes clipboard input through term.paste() so bracketed paste is emitted only when the child enabled it, and strips a trailing newline only when the child did not. Worth an application citation. It also sharpens the technique's boundary: the defect is not only 'automation concatenates command+
- **data-viz** (personas): Upward note for metric-identity: [code] is a working instance of the technique's 'registry of declared variants' — three success-rate ids each naming source, window and derivation, resolved by one function. It also demonstrates the failure the technique should call out explicitly: a variant registry that omits unit, precision and polarity does not stop those three from forking, and polarity in particular immediately 
- **media-playback** (personas): playback-clock's fan-out section names three consumer cadences but not the failure mode this repo produced twice: the subscription API itself is the leak. One raw subscribe(cb) makes subscribe(setState) typecheck, and a correct clock still grew an un-throttled consumer beside a hand-throttled one . Proposed addition: the clock owner ships the coarse cadence as a first-class verb (subscribeThrottled(hz, cb) alongside 
- **deployment-contract** (personas): COVERAGE (corpus hole, plus technique-shaped resonance): every technique in this subject presupposes that the repository is the thing being deployed. This context is a repository whose PRODUCT deploys third-party artifacts on a user's behalf, at runtime, per user — and it reproduces the subject's exact failure shapes (an unverified artifact serving live traffic, configuration with no declared home, no version to roll
- **operator-surfaces-for-llm-spend** (personas): COVERAGE (matcher miss, not a hole): the pairing was almost certainly produced by the word 'glyph' — the context is `glyph-persona-card` and the subject owns `glyph-encoded-business-thresholds`, but one glyph is a severity index over money and the other a decorative capability sigil. The subject that actually governs this context is software-engineering/ui-surfaces/feedback-and-style/status-vocabulary (techniques voc
- **draft-editing** (personas): The map's sampled paths for this context are the twelve component files, but every load-bearing realization of this subject lives in the sibling `libs/` and `hooks/` directories . A context whose paths sample only the view layer will read as unimplemented for any subject whose machinery sits one directory over.
- **draft-editing** (personas): Route this context to `form`, not `draft-editing`. The subject's own boundary section says a form is 'the one-shot cousin: compose a valid mutation, submit it once, leave', and that a draft editor's defining lifecycle is continuous partial saves with a publish gate rather than a submit button. This surface composes once and submits once . The matcher paired it on the literal directory name `draft-editor`; routing by 
- **accessibility** (personas): Two upward data points worth an application-layer entry rather than a correction. [code] implements the drain queue AND the keyed-remount defeat of platform deduplication in one provider — the technique prescribes both but shows neither. And [code] realizes 'the product's own setting layered over the platform's, feeding the same single signal' by projecting the in-app toggle as `<html data-motion="reduce">` and obser
- **long-form-reading-surface** (personas): Both of these contexts are mis-routed, and the golden path says so itself: 'The frame around whole routes — primary navigation, section vocabulary, the never-unmounting host and its services — belongs to app-shell.' `shared-chrome` IS that frame and `shared-components-layout` is its primitive set; neither renders a document. This is the technique-shaped resonance the conform method describes — two techniques (fixed-c
- **codebase-scanning** (personas): Wall 3 of the golden path — 'Location down to the line, plus the matched content itself, quoted' — over-fits to text-pattern sensors and has no formulation for the threshold-over-telemetry sensor this pipeline is built from. Six of its nine emitters (LLM cost pinpoints, Sentry issue rates, dormant skills, doc rot, disputed memories, KPI attention) produce findings of the form 'this measured number crossed its thresho
- **webhook-ingestion** (personas): The technique pairs 'record everything, verbatim' with 'redact at write time' but never says what replay replays once redaction has run, and this repo fell straight into the gap: it redacted the whole body and thereby voided its own replay door without anything failing. Proposal: state that redaction is field-scoped within the payload, never whole-body, precisely because a wholesale redaction silently converts the de
- **conversation-orchestration** (personas): Coverage question of the 'technique-shaped resonance' kind the conform method names. This context realizes ONE technique's doctrine better than the standard states it: [code] registers its 1-9 digit handling with the app keyboard authority using exclusive:true, and its comment at :486-492 argues that exclusivity, not mere priority, is the guarantee. two-surface-doctrine and model-proposed-quick-replies both require r
- **conversation-orchestration** (personas): Coverage question about the context row rather than the standard: five of this context's twelve paths (twin-cycle-features, drive-cycle-features, artist-smoke, discord-twin-1-setup, discord-twin-2-replier) test the Twin plugin, Drive, Media Studio and Discord polling and have nothing to do with the companion, so the row bundles unrelated E2E specs under a companion-shaped name. It should be split before any future ve
- **conversation-orchestration** (personas): Two upward lessons worth an application file, both with anchors. (1) two-surface-doctrine's ambient-decision section should name the arbitration rule this repo discovered: [code] makes a passive announcement yield while a decision is pending, and [code] encodes the complementary-condition contract as a test ORACLE reporting decisionSurface as orb, chat, or none - with 'none' defined as the regression the doctrine mus
- **canvas-graph** (personas): Not a standard question but a map-health one, and it recurs: this context row names twelve vanished paths, and the docs-sync context row names a thirteenth , as do three paths in execution-detail-inspector . The map builder should verify path existence at generation time and mark a row whose paths have largely disappeared as stale rather than emitting it for judgement; a worker cannot distinguish 'the feature was del
- **canvas-graph** (personas): canvas-graph's golden path names the read-only-renderer off-ramp ('if nobody ever drags a node you need a renderer, and layout becomes a pure function') but then hands off to six techniques all written for the editor case, so a renderer-shaped context has to re-derive which clauses still bind. Add a stage: read-only-renderer precondition marker stating explicitly what survives it - layout determinism including tie-br
- **scheduling** (personas): schedule-observability names four surfaces but is written entirely from the decider's side: it never states that the run and non-fire ledgers must be QUERYABLE by the display layer, which is where this pair actually fails. The engine here writes rich non-fire reasons (schedule.skipped.overlap with reason previous_run_active, stuck_reclaimed, budget/window declines) yet the read contract this UI is given (list_recent_
- **docs-sync** (personas): doc-rot-detection's verdict vocabulary should gain 'broken' as a fourth rung ranked ABOVE stale and unverifiable, not folded into stale as a mere dead-references signal. This implementation's measured argument ([code], test 889-924): a doc whose every reference has been renamed away couples to nothing, so it lands in the unverifiable population and nobody looks - the content signal is the ONLY verdict available for e
- **adoption-measurement** (personas): This pairing is a vocabulary collision, not a coverage hole. The matcher scored `adoption-measurement` against a context whose directory is literally named `adoption/` but whose subject is a template-instantiation wizard. Routing by the golden path's precondition — 'you are measuring other people's behaviour, observed at second hand, across a stated eligible population' — rejects it immediately, where routing by the 
- **adoption-measurement** (personas): Same vocabulary collision as the sibling context b88ef121 — see that row's proposal.
- **companion-identity** (personas): Coverage question, not a standard defect: the matcher paired this context to companion-identity on the word 'companion' in its path. Routing by precondition instead, the subject that governs it is an attention/inbox-normalization subject the corpus may not hold — a closed item vocabulary with per-source adapters, a severity lowering ([code] normalizeSeverity), and a needs-me rollup . Two technique-shaped resonances w
- **model-routing** (personas): effort-calibration and policy-governance both assume the routing table is the system's own calibrated artifact. BYOM is a different animal: an operator-authored policy over which providers their own installation may use. The standard's demand that every entry cite its measurement is right for the vendor's class table and unenforceable for a user's allow-list. Suggest the golden path distinguish the calibrated class→t
- **model-routing** (personas): Coverage question — the matcher missed the right subject on vocabulary. This context is governed by agent-chaining, not model-routing: [code] is a graph-to-wiring translation (a drawn link becomes a backend `chain` trigger), [code] is run-conditions' closed trigger-mode vocabulary, and [code]s payload_forward is the handoff payload contract. Judged against agent-chaining a real backlog appears, so the pair is worth a
- **agent-chaining** (personas): Upward lesson worth an application entry rather than a correction: the technique predicts that a mature stop vocabulary grows a second, machinery-side family, and this repo landed six of the exact reasons it names — publish_failed (event publish failed after the edge was claimed), cas_lost (a concurrent evaluator won the race), quarantined (a repeatedly-failing edge), malformed_config (a guard's stored configuration 
- **connector-catalog** (personas): The audience/licensing bridge here is the technique's blessed transitional form realized exactly - [code] reads the row's own metadata.audiences first, falls back to the static table, unions both, and documents the migration direction in place, consumed. catalog-as-data describes this shape as 'observed working in the field'; it is worth citing with this file:line in the application layer.
- **proactive-nudges** (personas): efficacy-feedback states 'Nothing raises a kind's volume' without qualification. This repo implements a bounded counter-case worth considering: [code] moves a per-kind cap by at most +/-1, requires >=5 engaged+dismissed samples over 30 days, clamps to base+2, and sits under an unchanged global ceiling - so total contact cannot rise, only its mix. The technique's real target is escalation on ignore (louder because unr
- **proactive-nudges** (personas): Coverage question, and a routing one rather than a hole. This pair looks like a technique-shaped resonance: the matcher joined on the word 'trigger', but proactive-nudges owns machine-initiated contact while this context is user-authored automation. Its real governors look like alerting (threshold rules and their lifecycle), scheduling/cooldown-and-debounce (rate limits, active hours), and hitl-approval (the auto / d
- **settings** (personas): Coverage question. Four of six techniques fail their precondition because the subject owns the durable key-value settings store while this context is credential management that merely lives under features/settings/. The match reads as directory-vocabulary rather than precondition: the material here is governed by credential-vault, and only the two surface-shaped techniques (settings-audit-and-history, save-experience
- **evidence-bound-visuals** (gravity): figure-must-cite-a-fact is written entirely against a generator that forgets; this repo's second author is a human typing into a bound field , where a rejecting validator has nothing to reject and the honest instrument is a standing count that gates a step's reported state . The technique could name that second path and say the gate for it is a measured, surfaced count rather than a throw — currently the repo looks n
- **video-assembly** (gravity): music-spotting-against-picture step 2 says to mark cue in/out as times on the master clock and explicitly not as scene references; derived-turn-markers, in the same subject, says a typed time is an impression wearing a number. This repo resolves the conflict in the second technique's favour — cues are spotted as scene ids and their spans derived ([code], :189-216) — which buys automatic re-derivation on retime at the
- **review-iteration-loops** (gravity): Upward lesson rather than a defect: refusal-as-valid-outcome's refuse-before-apply ordering has no account of a guard that knows its own band is narrower than the rule it enforces. This repo's answer is that a blocking verdict does not disable the accept button — it makes the click a two-step deliberate act and stamps a permanent override receipt on the version, visible wherever that version is named . That keeps the
- **image-prompt-composition** (gravity): Not a defect in the standard — a mapping question. image-prompt-composition governs the prompt COMPILER, and in this repo that is [code] (self-described as 'the one compiler', with restatement, assigned colour roles and the welded no-text clause), [code] and [code] — not [code] Eight of eleven techniques have no subject in the mapped paths, and the match looks like vocabulary overlap (prompt / negativePrompt 

## What happens next

- **Apply lane.** Every technique deviation is a seam with a default policy - the input
  `/intake apply` needs. The per-project `conform-detail.json` is the backlog; the
  first rows in [[../applied]] should come from the deviations a worker ranked most
  consequential.
- **Proposal triage.** The 64 proposals are leads at the corpus, not landings; each
  needs the source-independent corroboration the intake skill requires before it
  amends a technique. Batch them by subject.
- **Map builder.** Precondition gating and path-existence checks, then regenerate both
  maps and re-run only the rows that changed (`--stale`).
