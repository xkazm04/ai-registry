# Log — software-engineering bundle

Audit trail (OKF reserved file). Public-safe by rule.

## 2026-08-20 — Ascent wave: the assessment seam joins the builder-side bundle

Source: a maturity-assessment product read at `6a5a5f68` — an app whose *use case*
is software engineering (it scores how deeply a team has adopted agent-driven
development) and whose *implementation* is software engineering. Both payloads were
extracted in one wave.

Scale: 5 read-only scouts over 49 contexts (100% covered, infra triaged in one line
each), then 18 subject-forgers and 10 subject-deepeners, cap 10 concurrent, topped up
per completion.

**New category `engineering-assessment` (order 9)** — appended, never reordered. 13 of
the 18 new subjects live there; the rest went to llm-agent (2), operations (2),
engineering-process (1).

New subjects (18 / 106 techniques / 54 applications): measurement-honesty,
maturity-ladders, readiness-passports, remediation-roadmaps, delivery-analytics,
metric-forecasting, people-analytics-ethics, peer-benchmarking, adoption-measurement,
analytics-time-windows, executive-reporting, conformance-checking,
public-verdict-badge, judgment-guardbands, remediation-handoff, repo-manifest-standard,
data-retention, plan-entitlements.

Deepened (10): scoring-rubrics (+weight-lenses), quality-gates (+unmeasurable-criteria,
+policy-projection), prompt-safety (+payoff-removal), agent-memory (+memory-value-model,
+coverage-instrumentation, +rollup-compaction), structured-output
(+answer-coverage-gating, +output-budget-signal), codebase-scanning (+ingestion-budget,
+evidence-scoping), knowledge-registry (+catalog-as-sync-key, +deterministic-seeding),
rate-limiting (+limit-derivation), alerting (+periodic-digest), audit-logging
(+tamper-evidence, +decision-records).

**Corrections to standing doctrine — the outcome worth paying for:**
- `quality-gates/gate-laddering` claimed "a local-only check is a courtesy, not a gate".
  Wrong for defects that are *irreversible at push time*: a leaked credential has
  already left the machine, so the local rung is the only layer that can prevent, and
  the remote rung's honest product is detection and revocation.
- `audit-logging/append-only-design` presented hash chaining as the cheap rung with no
  mention that a chain has one tail and **forks under concurrent writers**, and carried
  no rung for a per-record keyed proof. Also: verification must run **on read**, or it
  is not tamper-*evidence*; the verdict is four-valued (unsigned is not ok).
- `rate-limiting/limiter-topology` said fail-open/closed is chosen by resource
  *criticality*; corrected to how *recoverable* each mistake is. "A rejected free
  request is recoverable in a minute; a denial-of-wallet is not."

**Upward lessons where the repo beat the expert draft** (a sample; every forger
reported 4-8):
- **Blend direction inverted.** A forger drafted "thin evidence coverage ⇒ let the model
  speak". The opposite is correct: coverage measures what *the model* read, while the
  deterministic backbone is coverage-robust, so low coverage must **damp** the model.
  A plausible, confidently-wrong rule that would have shipped as standard.
- **Customized responses must be `private`, not longer-lived** — a path-keyed shared
  cache serves one embedder's styling to every viewer.
- **Filter-then-pick, not pick-then-filter** — taking each member's latest measurement
  and *then* filtering comparability drops exactly the members whose latest run
  degraded: a non-random hole in a benchmark corpus.
- **Rank on the number the reader is shown** — ranking a roadmap on a pre-blend signal
  surfaced a top gap "with a rationale citing a number never shown next to it".
- **A true finding with no available remedy is still a precision failure** — a
  guaranteed-yellow trains people to ignore the checker.

**Consolidation recorded as a hypothesis, not a verdict** (the llm-observability
lesson, applied): `delivery-flow-metrics` was folded out — its extraction half went to
delivery-analytics, its window mechanics to analytics-time-windows, its general honesty
to measurement-honesty. Return condition: a consumer needing volume-weighted rate
aggregation and median-of-medians *without* the extraction half.

**Instrument note, verified two ways before reporting** (the carried-forward-metric
lesson): the index builder reports `use_when 123/755` for this bundle. The counter is
correct — confirmed by counting frontmatter on disk independently. It is a real,
**pre-existing** gap: all 123 techniques carrying `use_when` are this wave's; the 632
techniques forged in the founding run predate the brief clause that requires it. Not
backfilled here. A backfill is a mechanical pass over 632 files and should be its own
change, not a rider on this one.

**The apply pass falsified a promoted upward lesson, within the same session.**
`agent-memory` took "usage is a veto on forgetting" from the source repo as an upward
lesson and promoted it to the golden path, a technique and an application — it reads
as an elegant emergent property (the store declines to forget what is still in
demand). Landing the bundle's own rules back into that repo proved it was the defect:
the term counted *deliveries*, not uses, and was unbounded while the retirement sweep
scored with the same function — so rank caused delivery, delivery raised rank, and a
stale low-trust row financed its own survival forever with the janitor as the
mechanism. The repo capped the bonus so the floor stays reachable; all three documents
were corrected to match, and the application now records the defect and its fix rather
than quoting the claim approvingly.

Doctrine for the next run: **an upward lesson stated as an emergent property deserves
more suspicion than one stated as a rule.** "Nobody has to implement it, it falls out
of the arithmetic" is exactly the shape of a feedback loop nobody bounded. Ask what
the loop's input is, and whether the loop terminates. Same failure family as the
llm-observability run, one step earlier: there a consolidation call was falsified in
hours; here a promoted lesson was.

**Wave hazard, recorded for the next run.** A session limit killed 7 deepeners
mid-write. Five had already integrated (frontmatter + prose + applications) and were
complete; two left orphan technique files the gate caught immediately ("exists but
<subject>.md does not declare it"); one had written nothing. The bidirectional
technique check is what made a mid-air failure diagnosable in one command — and the
repair agents were told to *review before integrating*, since an orphan was written by
an agent that never reconciled it. One was kept unedited on review, one gained nothing
new (its anchors were already covered), and nothing was integrated merely because it
existed on disk.

Gate green (`check-bundles.mjs`): 124 subjects · 755 techniques · 306 applications,
4875 links checked.

## 2026-08-20 — deepen round 1: model-routing (LLM-provider topic)

Scope: one subject, operator-directed. Specimen: FreeLLMAPI
(`github.com/tashfeenahmed/freellmapi`, MIT, ~19k stars) read at commit
`20d41b3`, plus LiteLLM / OpenRouter / Portkey as convergence checks and a
training-data-blind lane.

Landed in model-routing (6 → 9 techniques):
- **model-identity** — the routing unit is the logical model, not the
  provider-qualified endpoint; in-group vs cross-group substitution are
  different events; grouping is a heuristic derivation with an operator
  merge/split override channel; capability lives on the member, and the group
  advertises the intersection. Convergence: specimen `model-groups` +
  LiteLLM `model_group` + OpenRouter's provider-vs-model split (3 independent).
- **failover-horizon** — substitution is free only before the first delivered
  byte; the *unusable success* (empty completion, prose where structure was
  requested, cap-truncated structure, schema-invalid tool arguments,
  unparseable tool dialect, stalled stream) is a routing signal, not an
  application error; a deterministic failure eliminates the model, not the
  credential. Boundary held: transport/status taxonomy stays with retry-backoff.
- **candidate-ranking** — ranking terms (normalized, convex, Σw=1) vs guardrail
  factors (multiply, never reorder); reliability as a posterior with a prior so
  nothing freezes out after a bad afternoon; strategy = weight vector, not a
  second engine; exploration suspended under sustained degradation with
  asymmetric entry/exit grace.
- Golden path **corrected**: the decision record must carry the *served* model,
  not only the selected one — presentation normalization of the upstream model
  field destroys the only evidence of silent provider substitution. Cites
  gate-sees-target.
- Dated application `process--candidate-ranking` (refresh_by 2026-11-20) with
  the field study and an explicit trust verdict.

Cross-subject proposals, landed the same session at operator direction:
- **retry-backoff/circuit-breakers** — an open carries provenance (heuristic /
  escalated / stated); only a heuristic open is probeable; never shorten a
  stronger open (it also launders the provenance). Scope must match the
  evidence in both directions.
- **rate-limiting/key-design** — an egress key is a copy of someone else's
  boundary, not a choice; providers meter on **pools** coarser than the
  credential and orthogonal to the operation, so the default per-credential key
  over-permits silently; remote-limit observations rank by source
  (header/quota-endpoint > error body > local counting > documentation).

Counter-evidence lane, honest results:
- rate-limiting's egress stance ("a local model of a remote authority; the
  provider's refusals are corrections") — **verified, left untouched**.
- model-routing's "no call site names a model" — **survives**, sharpened: an
  inbound model name on a compatibility surface is an alias to resolve, not a
  target to obey.
- circuit-breakers' "successes offset evidence, they do not purge it" —
  **survives against a live counter-example**; the specimen purges its failure
  window on any success. Recorded in the application as an instance of the
  defect, not folded into the rule.
- The specimen's own sticky-session premise (mid-conversation model switches
  cause a hallucination spike) is **uncited anywhere in its repository**. The
  mechanism was kept (a token-costing mitigation is charged against the budget
  routing already checked); the quality claim was **not** promoted — no
  technique rests on it.
- Secondary coverage of the specimen (dev.to, blog round-ups, Aug 2026) is
  **stale and contradicted by the tree**: "16 providers / 800M tokens / no tool
  calling or vision" vs 29 providers with tool-call rescue and vision fusion.
  Primary source only.

Declined: sticky sessions as a technique (single-sourced, premise uncited) —
banked; return condition is a published measurement of quality loss across a
mid-conversation model switch.

Instrument note, unresolved: `catalog.json` content hashes are computed over
on-disk bytes, so a checkout with `core.autocrlf=true` produces different
hashes than an LF checkout for byte-identical content. Every bundle's hash
churns on regeneration from a Windows tree. Not fixed here — flagged.

Gate green (`check-bundles.mjs`): 106 subjects · 632 techniques · 239
applications, 4208 links checked.

## 2026-08-23 — voice-io: portable-provider-package forged, then deepen round 1 (spoken-output quality)

Scope: one subject, operator-directed, two passes in one sitting. Pass 1 forged
`portable-provider-package` from the kp `packages/voice-tts` realization (the
engine layer as a package: host seam, one dispatch + one validation door,
host-owned preference / package-owned resolution, route wrapper, compare by ear,
shared per-user engine home). Pass 2 ran four lanes on the non-streaming gap:
current practice (web), counter-evidence against the package's own claims
(web), local-engine streaming specifics (web), and a training-data-blind
control.

Landed in voice-io (8 → 9 techniques):
- **speech-ready-text** — display text to speakable text as one pure,
  isomorphic door (markup removed, anchor text kept, phrases terminated, emoji
  dropped, numbers deliberately NOT expanded: inflected-language expansion is
  grammatical and belongs to a per-locale host normalizer); prosody that
  travels is punctuation; chunk boundary rules (abbreviations, decimals,
  initials, the ordinal dot of inflected languages, open quotes), min/max
  sizes with the maximum an engine-declared capability, first chunk may end
  at a clause mark; chunks are one utterance with one verdict, a late failure
  is a truncation. Convergence: blind lane + current-practice lane + the
  package's own measured defect (a 450-char paragraph = 10 s before sound on a
  CPU engine) — 3 independent.
- `portable-provider-package` **corrected** twice from the counter-evidence
  lane: serializing local engines is a processor-budget choice, not a
  correctness rule (every relevant engine has a resident mode); and the compare
  surface needs like-for-like audio (listeners identify a lossy codec and
  prefer the louder clip regardless of voice).
- `tts-pipeline` segmentation section now defers boundary rules and sizes to
  the new technique and states the half-real-time CPU figure.
- Application `node--portable-provider-package` re-verified 2026-08-23 with the
  chunking, like-for-like WAV and language correction landed in kp, and three
  new deviations (per-call spawn, no loudness normalization, no Czech number
  expansion) with return conditions.

Counter-evidence verdicts: whole-clip-at-1200-chars WEAKENED (cap is not the
fix; chunk); serialize-because-reload REFUTED as necessity; 60 s positive probe
cache CONFIRMED with "invalidate on real failure, 429 is busy not down";
MP3-vs-WAV compare WEAKENED; "Kokoro is English-only" WEAKENED (8 languages,
no Czech/German — the Czech half confirmed); single default voice CONFIRMED as a
default, weakened as "the right one" (voice choice moves trust; offer a picker).

Banked leads (return conditions): resident engine workers (a host needing
sub-second local TTFA); loudness normalization + silence trim on the compare
surface (a host running a real listening test); per-locale number expansion
for Czech (a Czech-first spoken surface); true streaming adapters over the
cloud WebSocket / sherpa per-sentence callback (a relay-mode conversation
plane adopting the package).

Saturation ledger, voice-io: depth L2 (primary vendor docs + engine sources
read; one L3 measurement on a real tree); last-pass yield 1 technique + 2
corrections; dry-streak 0; clock: vendor landscape ~3 months (streaming
endpoint shapes, chunk schedules) — next pass training-data-first, probing
the standing claims above.

## 2026-08-22 — Rust-backend refactor campaign: findings folded into existing subjects

Source: a multi-week backend refactor campaign in a desktop agent-orchestration
app (the same tree the ipc-contract and data-access applications already cite).
Contributed as **applications first, techniques only where the finding was a
general procedure with no home** — no new subjects, no new categories.

New applications (4):
- `ipc-contract/rust--drift-gates` — the orphan blind spot re-measured by an
  inventory walk (1,008 exported types / 1,039 committed artifacts / **35**
  orphans), the class split nobody had named (**13** whose source type is alive
  but stopped carrying the export derive, **22** deleted), the mirror direction
  (**4** exports with no artifact), and the two-sided-allowlist inventory gate
  that closed it.
- `codegen/rust--generated-file-hygiene` — three generators that began failing a
  formatting gate introduced after them, resolved by folding the formatter into
  the generator rather than exempting the generated roots. The technique
  prescribes the exclusion branch; this is the other branch, with its condition.
- `concurrent-vcs/process--commit-verification` — three verification *checks*
  that reported the wrong thing: a private index seeded by copy that staged a
  reversed diff, a deletion check that grepped the commit message, a publish
  whose refusal was laundered by a pipe.
- `background-jobs/rust--tick-isolation` — 56 hand-rolled crash barriers into
  one helper; why the log field names had to be unified (field names must be
  literals), the optional parameter that was refused in favour of composition,
  and what the consolidation deliberately did not fix.

New techniques (3), each added to its golden path's list in the same change:
- `dead-code/configuration-union-proof` — reachability is scoped to the
  configuration it was computed under. A deletion wave verified green under the
  developer default broke the shipping configuration in dozens of compile
  errors. Union rule, gate-over-exempt, verbatim restore.
- `test-harness/negative-control-tests` — proving a test can fail; choosing a
  mutation the system cannot absorb (a case-only rename was absorbed by
  case-insensitive name matching); and never quieting the harness's own capture.
- `remediation-handoff/finding-refutation-channel` — the third outcome beside
  done and failed. Measured refusal rates from four specialist lanes, and a
  catalogue whose concern survived while **not one of its eight counts** did.

Corrections to existing content:
- `ipc-contract/node--drift-gates` — its **29** orphans is superseded by the
  inventory walk above and was wrong about the class as well. Marked, dated,
  and pointed at the new application rather than rewritten; the defect shape it
  describes held, and the reference-checker inversion it documents held.
- `data-access/rust--row-mapping` — extended with the lane that found a query
  failing on **every call since 2026-05-11** by naming its columns, plus the
  corollary that converting wildcards to explicit projections **raises** every
  static rule keyed on a column name, and that rise is evidence the conversion
  worked.

Declined, deliberately:
- A census of **ten** gates found green for reasons unrelated to what they check
  (a dependency scanner erroring on its own config, a hook whose transcript walk
  had never fired across 477 file-editing turns, a lint shipped at warn under a
  `--quiet --max-warnings 99999` runner, …). `quality-gates/gate-liveness`
  already states every mechanism, and that subject sits at 4 applications —
  over the 1-3 guidance. The individually novel instances were placed in the
  applications above instead. The unifying claim, recorded here rather than
  duplicated into a document: **the common failure is not an absent gate, it is
  a gate whose output shape is indistinguishable from success.**

Gate green (`check-bundles.mjs`): software-engineering 124 subjects · 759
techniques · 311 applications; 1777 concept documents · 4896 links checked;
`bundle integrity OK`. Index and catalog rebuilt in order.

## 2026-08-24 — deepen (source-driven): multi-model practice video against the llm-agent lane

Source: a practitioner video on multi-model agent harnesses ("combine compute,
don't select compute": opinion fan-out, multi-round debate, plan-fanout with an
architect seat), ingested as one research input for a /deepen pass over
llm-agent. Transcript pulled in full; every claim mapped against prior art
before drafting.

New technique (1), on lane convergence (field sighting + literature):
- `fleet-orchestration/heterogeneous-model-panels` — N sessions, one question,
  N model families. The counter-evidence lane set the spine: equal-compute
  studies show homogeneous debate ≈ self-consistency voting and
  simultaneous-revision rounds form a martingale, so round one is the product,
  rounds get a cap, and the voting baseline (N samples of the best model) is
  the bar a panel must beat. Masked seats (own-family bias, already measured in
  judge-stability); synthesizer seat for build shapes; verdicts carry
  concordance structure and per-seat cost.

Correction to existing content:
- `cost-metering/price-tables` — a rate is sometimes a *schedule*: several
  providers now price the same unit class by the call's own context length
  (input commonly doubling past a published threshold) while others sell the
  full window flat. Verified against current vendor pricing pages 2026-08-24;
  the video sighted the same trap independently on a third vendor.

Verified-and-left-untouched:
- `judge-stability` — the video's "never reveal model names to co-agents; they
  get weird" is an anecdotal field echo of own-family preference / presentation
  sensitivity, which the technique already states with measured evidence. The
  mechanism claim ("sabotage") stays unadopted: single-source, no measurement.
- `comparison-modes` / `eval-harness` — "take public leaderboards with a grain
  of salt, run private benchmarks on your own use case" is already the
  subject's stance (matrix runs, frozen instruments).

Declined, deliberately:
- The video's model landscape (tier lists, per-model opinions, pricing-war
  reads, vendor picks) — product-named currency signal, not knowledge; upper
  layers are transplant-clean and no consumer application needed the roster.
- "In-loop vs out-loop / software factory" framing — rhetoric over mechanism;
  everything mechanical in it is already fleet-orchestration + result-harvest.

Gate green (`check-bundles.mjs`): software-engineering 146 subjects · 921
techniques · 400 applications; 3093 concept documents · 7341 links checked;
`bundle integrity OK`. Index rebuilt. Note for the next pass: an untracked
media-generation application (`process--capability-to-vendor-plan.md`) sits
uncommitted in the tree from other work; its index entry was deliberately not
committed here.
