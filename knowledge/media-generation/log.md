# Log — media-generation bundle

Audit trail (OKF reserved file). One block per event that changed or
validated this bundle's content. Public-safe by rule: no private paths, no
operator preferences — those live consumer-side.

## 2026-08-27 — forge from a run: character-identity-continuity

- Trigger: a trailer-consistency spike on a single-GPU studio pipeline that
  measured, rather than assumed, whether one character survives across a cut.
  Six still lanes, two motion lanes, a face ruler calibrated on real film
  before anything was generated.
- New subject `character-identity-continuity` under `visual-generation`
  (7 subjects, under the cap), three techniques:
  `identity-ruler-calibration`, `reference-admitted-late`,
  `camera-position-not-focal-length`; two process applications.
- The load-bearing catch is a **sign error in the obvious instrument**. A
  self-supervised image embedding — which `visual-style-locking` correctly
  recommends for separating *style* — inverts on identity: two different
  actors in matching costume under matching light scored 0.28 while one actor
  across a cut scored 0.50–0.59. The property that makes it the right style
  instrument makes it the wrong identity instrument. A pipeline that skipped
  calibration would have published numbers meaning the reverse of their claim,
  with nothing in the output looking wrong. `identity-ruler-calibration` makes
  the inversion check a stop condition, not a caveat.
- Second catch: **conditioning at full strength replaces rather than
  conditions**, and the failure scores perfectly — 0.168 identity, better than
  real film, on a lane where two of three shots were the reference image
  again at a difference of 0.0002. Hence the mandatory second axis, and
  `reference-admitted-late`, whose ablation assigns the fix to timing rather
  than to the reference crop that arrived with it.
- Third catch is test design: prompt-and-seed discipline scored 0.486 on a
  shot list varying only in focal length and 0.764 — past the different-actor
  ceiling — on the same list rewritten to move the camera. The technique did
  not change; the test did.
- **Confirmed and left untouched**: `generated-shot-sourcing`'s claim that
  adjacency anchoring does not scale to a chain. Last-frame chaining drifted
  to 0.6262 by the third clip against reference conditioning's 0.1887. The
  bundle already owned this; the run is evidence for it, not a new node, and
  the new subject hands over at the cut rather than restating it.
- Instrument note: an identity embedding must **refuse** outside its domain.
  Every "different person" verdict in the first motion scoring came from a
  12–28 px face; every real face measured 125 px or more. The floor reversed a
  conclusion already drawn in the same session. Wide shots are routinely
  unscoreable for identity — a fact about how trailers are shot, and the
  reason continuity across a mixed sequence is a two-instrument measurement.
- Gates: `check-bundles` green (19 subjects · 118 techniques · 44
  applications); index and catalog rebuilt; currency unaffected — both new
  applications are `process` and carry no derived clock.

## 2026-08-26 — intake run: the audio-generation category

- Trigger: /intake on a 76-word vendor product announcement (a
  section-by-section song editor). The source itself yielded one catch —
  its headline feature is this bundle's `edit-do-not-regenerate` law,
  stated at lower altitude — plus a currency signal; the operator's
  structural question ("does audio deserve a home?") became the run's body.
- New category `audio-generation` (order 4), three subjects:
  `music-prompt-composition` (5t), `generated-music-acceptance` (5t),
  `sound-effect-generation` (4t); two process applications carrying the
  dated 2026-08 vendor landscape and rights tiers, one node application
  verified against a consumer tree the same day (a cue rendered at exact
  duration through a server-side seam — 10.000s briefed, 10.032s measured).
- `review-iteration-loops` gains `partial-regeneration-seams`: continuous
  media add a seam to the edit plan — kept regions by reference, declared
  per-seam continuity, the anchor region whose edits are global. Written
  against primary vendor schema docs, not the announcement.
- Boundary prose (the four-way discriminator: producing / placing /
  plumbing / judging) added on the two neighbouring bundles' audio
  subjects and baked into the new golden paths. No standalone audio
  domain: every domain here is named for a job, not a substrate, and the
  consumer test splits audio consumers across jobs.
- Gates: check-bundles green at each step; purity sweep of the new upper
  layers against the run's own vendor vocabulary — clean.

## 2026-08-20 — deepen run: image-prompt-composition

- Trigger: /deepen undercooked scan (deterministic signals + gap thesis);
  operator chose image-prompt-composition over four higher-scoring
  candidates as the mastery target.
- Research: 5 lanes (landscape, artstyle specifics, counter-evidence,
  recognition judges, training-data-only). 24 raw findings → 11 presented
  → 11 accepted.
- Corrections (4): 77-token truncation scoped to short-window caption
  encoders; negative prompts scoped to guidance-based models; no-text ban
  reframed capability→architecture; style restatement bounded by current
  reference-conditioning (lands in visual-style-locking).
- New techniques (2): prompt-dialect-matching, medium-vocabulary-locking
  (image-prompt-composition: 6 → 8 techniques).
- New applications (2): process--vendor-fact-ledger (generative-provider-
  routing; dated 2026-08 model landscape), process--vision-model-grading-
  schema (generated-output-grading; judge tiers + biases).
- Technique boundary notes (3 files): two-grader-disagreement-rule,
  unconditional-fail-criteria, shape-language-over-nouns.
- Local probe (n=5+5, one judge family, style-lock fixtures with known
  ground truth): scalar-vs-countable-contract scoring was perfectly stable
  (5/5 identical); pairwise-vs-anchor-image was not (3/5 correct, misses
  in both orders). Recorded in the grading application's appendix with
  confounds stated.
- Sources: 30+ URLs, recorded per document; all edits gate-clean
  (check-bundles) at each commit.

## 2026-08-20 — deepen round 2: three subjects in parallel (full-pipeline workers)

Efficiency experiment: one worker per subject running research + apply,
Director diff-review replacing per-finding triage. All gate-clean.

### video-assembly
- Counter-evidence: sync thresholds verified against ITU-R BT.1359 + ATSC
  IS-191 — survive untouched; forge-era "no reliable AI video pipeline"
  refuted for short-form (dated in the new application).
- + technique generated-shot-sourcing (conditioning ladder, clip caps,
  baked-in-audio doctrine, cost/usable-second); + application
  process--generated-shot-sourcing (2026-08 video-model ledger, 11 sources).
- Golden path: loudness-delivery section; spotting duck given 6-12 dB range.

### creator-voice-and-tone
- Gap closed: spoken voice was absent bundle-wide. + technique
  spoken-delivery-direction; + application process--spoken-delivery-direction
  (2026-08 TTS casting ledger, 13 sources).
- Corrections: 197-252 wpm band scoped to human presenters (synthetic
  narration ~130-175, rate measured not set); engine-tone separation holds
  but invariance checks must strip delivery markup.

### platform-format-adaptation
- Golden path refreshed vs 2026-08 platform reality: right-edge occlusion,
  ceiling-vs-band drift on separate clocks, monetization thresholds as a
  second duration force. + technique sound-off-first-design; + application
  process--sound-off-first-design (provenance-graded constraint table).
- Counter-evidence: hook/retention/word-budget claims confirmed unchanged.

## 2026-08-23 — deepen against an external source (beginner-walkthrough class)

Operator handed a marketing-automation tutorial (`youtube:yCACmFTiCto`, 9483
words) to `/deepen`. Second source-driven pass on this bundle today. Full
triage in [[2026-08-23-one-person-marketing-team]].

- **Yield 1 of 8.** Five candidates already owned, two of those with the corpus
  actively contradicting the source; one declined out-of-domain; one banked.
  Dry-ish is the expected profile for this sub-class and was not padded.
- **+ technique performer-claims-need-a-person** (evidence-bound-visuals:
  5 → 6 techniques). A person on screen saying "I used this" claims a person;
  every other laundering form overstates a real fact's grade, this one invents
  the witness. Two-property trigger (synthetic performer × first-person
  experience claim), four graded cases, judgment recorded at cast time because
  nothing in the pixels carries it afterward.
- **+ application process--performer-claims-need-a-person** (verified_on
  2026-08-23, refresh_by 1yr as a regulatory landscape): 16 CFR Part 465
  §465.2, effective 2024-10-21; the source recorded as a live instance of the
  named defect — its QA pass rejects takes over packaging text and nothing
  reads the script.
- **Golden path**: opening grammar extended by one mark; "what this subject is
  not" now earns the widening from factual to promotional work explicitly,
  rather than letting the technique carry it silently.
- **Counter-evidence confirmed-and-left-untouched (5)**: the conditioning
  ladder, clip caps as a structural constraint, the style-locking ratchet,
  grading criteria, and cost-per-usable all survive; two of them refute the
  source rather than the other way round. No edits made to any of them.
- **Banked**: the aggregator/credit-broker topology against
  `generative-provider-routing`. Return condition — a second, non-promotional
  source or a tree that integrates one.
- Instrument: `research-map` returned "no prior art" for a concept
  `generated-shot-sourcing` owns, on a vocabulary mismatch (corpus says
  "identity drift", field says "character consistency"). Caught by reading the
  file. Recorded in the skill's LESSONS.
- Gate-clean (`check-bundles`) at each commit; currency unchanged (0 expired,
  0 at-risk).

## 2026-08-24 — secondary-machine harvest: non-silent-elimination gets its application

`generative-provider-routing/node--non-silent-elimination` (gravity's imaging
router): the record of elimination rather than the hop — closed why vocabulary,
guard order, unsupported's positional asymmetry, and constraint outranking
vendor error in the message a caller finally sees. Complements
`node--refusal-reroute-hop`, which follows the hop through the same file. Gate
green.
