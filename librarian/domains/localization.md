---
domain: localization
subject: null
last_swept: 2026-08-29
layout: nested
demand_known: unknown
---

# Localization

Coverage note for the `localization` bundle. Part of [[index]]; graded against
[[standard]]. First sweep — this bundle had no domain note before 2026-08-28,
and no `/deepen` run had ever touched it.

## Shape at this sweep (2026-08-28)

| | 2026-08-28 (close) | 2026-08-28 (open) |
| --- | --- | --- |
| Subjects | 14 | 14 |
| Techniques | 85 (2 amended) | 84 |
| Applications | 28 | 27 |
| `use_when` written | 85/85 | 84/84 |
| Version witness | 0/28 | 0/27 |
| Runtime-bearing applications | **0** | 0 |
| Expired / at-risk | 0 / 0 | 0 / 0 |
| Never swept | 13/14 | 14/14 |
| Attention points | 67 | 72 |
| Cap breaches / taxonomy errors | none / 0 | none / 0 |

A record of this sweep, not an input to the next one. Recompute with
`node scripts/librarian-scan.mjs --domain localization`.

## The attention score cannot rank this bundle at all

The worklist came back a **13-way tie**: every language subject scored exactly
5, on exactly the same two clauses — *single stack (process)* and *never swept
by the librarian*. Not approximately flat; identical. The counter has no term
that separates Arabic from Spanish, because every language subject was forged
in one wave, to one template, against one tree.

That is not a defect in the subjects and it is not fixable by sweeping to clear
the flag. It means **the scan is structurally blind in this domain** and
ranking has to come from demand and judgment. Recorded here so the next run
does not spend a cycle re-deriving a tie.

The one subject that scored differently — `translation-pipeline-topology` at 2 —
did so only because it had been swept before.

## The four-bundle "zero version witness" claim is wrong here

[[2026-08-27-1]] grouped `localization` with `civic-intelligence`,
`grant-funding` and `recruiting` as bundles with zero version witnesses, and
concluded that *"drift there is not absent, it is uncomputable."* For the other
three that holds. For this one it does not: `check-currency.mjs` reports
`driftUnknown: 0` for `localization`, because **all 28 applications are
`process`-stack and none is runtime-bearing**. There is no runtime to drift
against. A version witness here would be a fabricated fact, not a missing one.

The corpus is craft — what a language demands of a translator — and it is
supposed to outlive every runtime it was read against. A backfill pass over
this bundle would be wrong. Left uncorrected in [[standard]] for now; the claim
is right about the class and wrong about this member.

## Demand: unknown, with a routing defect now fixed

No installation reports consulting this bundle. But the sweep found the
map itself wrong: `personas-web` ships a **thirteen-locale catalog matching this
bundle's thirteen language subjects exactly** (`ar bn cs de es fr hi id ja ko ru
vi zh`) and was registered against `software-engineering` only, in both halves
of the project bridge. A localization run had no way to find its own consumer.

Corrected this sweep in [[projects]] and the local bridge together. This does
not make demand *known* — demand is what an installation reports — but the
routing now exists for it to be reported through, and the first application
written off that tree landed the same day.

## What is owed

- **A second tree for all 14 subjects.** Every subject is single-stack
  `process`. The language subjects were forged against one product's catalogs;
  the transplant claim has never been tested. This is `/reconcile` work, and it
  is the whole of the bundle's attention score.
- **A maturity signal.** All 14 documents say `forged`. Nothing here has been
  reconciled or transplant-tested.
- **The 13 language subjects have never been deepened.** Round 1 went to the
  craft subject on demand grounds, not because the languages are done.

## Dispatched

### 2026-08-28 — three rounds, in-session, all landed

All three on [[translation-pipeline-topology]]; rounds 2 and 3 probed round 1's
own technique rather than surveying, per loop doctrine.

- **Round 1** — `source-identical-value-audit` earned on convergence between two
  independent trees plus a law that asks for it. Counter-evidence changed the
  finding twice: it killed the opening hypothesis with a measurement, and the
  field's i18n-testing literature turned out to cover a different problem.
- **Round 2** — refuted the new technique's own class 4. Two thirds of French's
  residue are **cognates**, not borrowings; a cognate is a fact, not a ruling,
  and the termbase must not receive it. Floor restructured to five classes cut
  two ways. `french/terminology-and-loanwords` gained **FR-COGNATE**.
- **Round 3** — refuted its class 2. "Pure skeleton" is locale-independent in
  LTR targets only; in RTL a wordless string can still need an isolate or a
  mark. **Arabic needed no edit** — `AR-BIDI-REVIEW` already owns the claim
  entirely, and the round's correct output was to leave the language subject
  alone and scope the craft one.

Yield ran high → moderate → confirmation-heavy, the curve the loop design
predicts. `dry_streak` 0; not saturated, but the cheap axes (format capability,
vocabulary stock, direction) are each spent once. The next honest probe is a
second *tree*, not a fourth round.

**The loop's own lesson this run:** two of three rounds landed by refuting the
run's own prior output, and both refutations came from sorting a measurement
that already existed rather than from new research. A technique minted in round
1 is the cheapest thing in the corpus to attack in round 2, and attacking it is
worth more than surveying a fresh subject.

## Banked from this sweep, not placed

- **The uniform six-technique template.** Twelve of thirteen language subjects
  carry exactly six techniques on the same axes (script/typography, quantity,
  register, terminology, de-anglicization, UI conventions); Czech carries seven,
  Indonesian five. That uniformity is a *forge template*, and the open question
  is whether it is also each language's real ceiling — whether some languages
  have a seventh axis that matters more than one of the six. Untested. **Return
  condition:** a language-subject deepen round, which should test this
  explicitly rather than assume the template.
- **Indonesian's five is earned, not a floor breach.** Checked against the file
  this sweep: the missing slot is typography, and the golden path justifies its
  absence in the opening paragraph (Latin script, no diacritics). The
  deterministic outlier was a false positive. Do not re-flag it.
- **A staleness instrument for hand-authored exceptions** still has a contract
  and no implementation anywhere in the fleet — carried forward from
  [[translation-pipeline-topology]]. Partially answered this sweep: the
  consuming tree *does* have one for its guide corpus (per-unit source-hash
  drift with a strict release gate). The gap is now specifically the **UI
  catalog**, whose format cannot record the fact.

## Instrument notes from this sweep

- **A `grep` run through the Bash tool returned zero matches for terms that
  occur 102 times in the bundle.** Reported as `PRIOR ART: none` it would have
  produced a duplicate technique. The dedicated search tool was correct. Fourth
  recorded instance of *verify the instrument before reporting a content gap*,
  and the first where the instrument was a shell built-in.
- **A concurrent session was writing into this checkout mid-run** (four
  untracked files appeared across `game-production` and `software-engineering`
  between two gate runs). `build-catalog.mjs` refused to publish disagreeing
  counts, which was the right call and is what surfaced it. `catalog.json`
  regeneration is owed once the tree settles; it was deliberately not committed
  by this run.

## 2026-08-29 — external-reconcile wave 1: eight subjects, and the bundle gets classified

The bundle was **absent from `docs/reconcile-brief.md`'s "The 48, classified"** — the
brief was written 2026-08-24, before this bundle existed. So this wave is also the
classification, and the answer is that localization is the corpus's **strongest class-B
ground**: Unicode and CLDR ship *executable conformance data* (`LineBreakTest.txt`,
`NormalizationTest.txt`, CLDR's own `@integer`/`@decimal` sample sets), not the prose
procedures the brief's class B was built around. Two workers independently scored
19338/19338 on the same conformance file with independently written implementations.

Eight workers, **eight applications landed, zero rejected, zero wrong citations found**
across ~1,000 reviewed lines. Every load-bearing claim was re-verified by the director
against the primary source.

| subject | counterpart | fate |
| --- | --- | --- |
| arabic | CLDR 48.2 plural rules | confirmed, 3 sharpenings |
| indonesian | CLDR + UTS #35 Part 9 + ICU4J | confirmed on data, refuted on consequence |
| vietnamese | CLDR 48.2 + release history | **refuted** (ordinals), split verdict |
| chinese | UAX #11 | refuted in part |
| japanese | UAX #11 + UAX #14 | confirmed, 1 sub-claim refuted |
| korean | UAX #14 | confirmed, sharpened |
| bengali | CLDR + Unicode 17.0.0 | confirmed, 1 partial refutation |
| translation-pipeline-topology | `mdn/translated-content` | confirmed, widened |

**Applications 28 → 36. The `spec` stack is declared and carries a null clock**, so
`driftUnknown` stays 0 — the pre-flight instrument commit (`1dbf9e0`) is what prevents
these eight from reporting as drift-blind, which is the same false signal this note
corrected for the bundle yesterday.

### What the wave says about the domain note's own claims

- **"Every subject is single-stack" is now false for eight of fourteen.** The remaining
  six (`czech`, `french`, `german`, `hindi`, `russian`, `spanish`) are all class-B
  reachable by the same counterparts and are the obvious wave 2.
- **The class-D residue is real and should be written down as accepted debt.**
  `de-anglicization-constructions` and `register-and-address` appear in all thirteen
  language subjects and have **no conformance artifact anywhere**. They will score
  single-stack forever; the brief's `accepted: [single-stack]` note is the right
  instrument and has not been written yet.

### Convergence (the cycle's input)

- **Two sightings, ready to land:** the Ambiguous-width trap on *prescribed* glyphs, and
  UAX #11 §4.1's relational fullwidth/halfwidth vocabulary — found independently by the
  `chinese` and `japanese` workers, neither aware of the other.
- **Two sightings:** "a tailorable rule requires disclosure, not obedience" (`japanese`
  UAX14-C1; `korean`'s opt-in space tailoring).
- **One sighting each, banked:** the mandatory catch-all `*` vs `other` (`indonesian`);
  range selection as a separate table (`arabic`); a plural category encoding anaphora
  rather than morphology (`vietnamese`); NFC-does-not-unify-every-legacy-spelling
  (`bengali`).

### Demand, restated honestly

Still **unknown**. `personas-web` is now correctly routed to this bundle, but no signals
contributor witnesses a consult. This wave serves a real consumer whose demand is not yet
reported, and says so rather than implying otherwise.

## 2026-08-29 — external-reconcile wave 2: the single-source debt is discharged

Six workers on the six remaining single-source subjects — `czech`, `french`, `german`,
`hindi`, `russian`, `spanish`. **Six applications landed, zero rejected.** Applications
36 → 42.

**All 14 subjects in this bundle now carry a second source**, and the bundle's attention
score fell from **67 to 2**. Thirteen subjects score zero.

The residual 2 belongs to `translation-pipeline-topology`, and it is **the proxy failing,
not a gap**. That subject has three applications drawn from three genuinely distinct
sources — a desktop app, a web app, and a foreign repository — but all three are class-A
readings of trees, so all three legitimately sit on the `process` stack. The scan counts
stacks; the brief is explicit that *the stack was always the proxy for the source*. Two of
the three also predate the lane's `source:` convention, and the brief says **no backfill**,
so this row stays visible until enough new applications accumulate for a source-aware
scan. Recorded so no future run reads it as unfinished work.

| subject | counterpart | fate |
| --- | --- | --- |
| french | CLDR 48.2 + RBNF | confirmed; `one` is the interval [0,2); ordinals a real gap |
| spanish | CLDR 48.2 + RBNF | `many` refuted as stated — notation, not magnitude |
| russian | CLDR 48.2 | confirmed and sharpened; ranges refuted on all three sub-claims |
| czech | CLDR 48.2 + reference impl | `many` is the *fraction* category; ranges refuted |
| german | Unicode 17.0.0 UCD | ß→SS confirmed; ẞ **refuted as reachable** |
| hindi | CLDR 48.2 | ordinals confirmed; the golden path, not the technique, is silent |

### Convergence — the wave's real output

- **The range family reached five sightings** (`arabic` 5 overrides, `czech` 0,
  `spanish` 1, `russian` 0, `french` 0-with-gaps). Four opens a law conversation, which
  the cycle may never write itself. Crucially the sightings **disagree**, and that is the
  finding: from `arabic` alone the claim would have been "range tables override the
  default", which `czech` and `russian` disprove. The transferable rule is the mechanism —
  *range selection is a (start, end) pair lookup with an end-value default; a published
  row may confirm **or** override, so counting rows tells you nothing.*
- **"A plural category can be a property of the rendering, not the value"** — three
  sightings: `czech` (`many` is `v != 0`), `russian` (every rule guards `v = 0`),
  `spanish`/`french` (compact notation moves a quantity between categories).
- **The caseless-key choice must be recorded** — one sighting (`german`), banked.

### What is now owed

- ~~**Accepted-debt notes for the class-D techniques.**~~ **Withdrawn 2026-08-29 — the
  item was mis-stated and is not real.** `librarian-scan.mjs` scores **subjects**, not
  techniques: its clauses are missing-`use_when`, no-application, thin-techniques,
  single-stack, expired/at-risk, never-swept and consumer demand. **Nothing flags an
  uncovered technique**, so an accepted-debt note for `de-anglicization-constructions`
  would suppress nothing. And the brief's `accepted:` key is read **nowhere** in the scan
  — the brief itself says that reading must be built *before* the first such note is
  written, and it has not been. No subject here needs one either: all 14 now carry a
  second source. Verified by grep against the scan, not assumed.
- **`common/rbnf/<lang>.xml` is an unused counterpart surface** — gendered and cased
  spellout rulesets and digit-ordinal patterns, conformance-grade evidence for gender and
  ordinal claims that `plurals.xml` cannot support. The best structural lead of the wave.
- **CLDR's per-locale minimal pairs** (`plural`, `ordinal`, `case`, `gender`) are a
  ready-made versioned fixture for any subject here; a sweep for non-distinguishing pairs
  is a wave of its own.

### Director's error rate, recorded deliberately

Across both waves the director's dispatch prompts carried **four factual errors** — a
pre-check read against an unreleased branch, a "richest table in the corpus" claim that
was wrong, a worked plural-range example that was backwards, and an assertion that CLDR
says nothing about gender. **Workers caught all four**, and in each case the correction
improved the finding. The contract works; the lesson is that a director's reconnaissance
is a hypothesis and must be phrased as one in the prompt.

## 2026-08-29 — external-reconcile wave 3: the banked surface, consumed

Three workers, three applications, zero rejected. Applications 42 → 45. Every subject
already had a second source, so this wave targeted **uncovered techniques** — the shape
the lane takes once a bundle's single-source debt is discharged.

It consumed the surface wave 2 named as its best lead, the **spell-out rulesets**, and
proved it executable: two workers independently wrote interpreters for the published rule
syntax and both reached parity with their oracle. Both harnesses are locale-agnostic, so
the tooling transfers to any language subject here.

- **korean/counting-and-quantity** — two refutations. The ordinal count ruleset delegates
  to the *attributive* forms from 2 up, and the alternation is conditioned on the
  following morpheme rather than a stem table (21 of 99 values differ).
- **arabic/script-and-typography** — refuted on three counts, including both of its named
  regional digit claims, which are backwards. 21 of 29 locale files declare Arabic-Indic
  digits, **zero declare Western**, and base `ar` inherits Western from root.
- **russian/gender-and-aspect** — gender changes the numeral at exactly two positions, so
  82% of integers spell identically in all four genders; the technique omitted numerals
  entirely.

**Three more upstream defects**, all verified here, bringing the corpus total to five
unfiled candidates. The sharpest: **the counterpart violates the technique's own rule** —
Arabic unit patterns hardcode Arabic-Indic digits beside a placeholder that renders in the
resolved system.

**Last unconsumed surface:** CLDR's per-locale minimal pairs. The Arabic worker touched one
incidentally and found it live and usable.

## 2026-09-01 — sweep correction to "What is owed"

The first bullet under "What is owed" is stale and stays as written because this note
appends. The scan on 2026-09-01 reads **13 of 14 subjects on two stacks**
(`process` + `spec`); only `translation-pipeline-topology` is single-stack, and the
bundle's whole attention score is 2 points. The second-tree debt is retired. What is
still owed here is the maturity flip (the reconcile lane's definition of `reconciled` may
be met by the spec-bound applications; the mechanical pass verifies each subject against
the definition before flipping anything) and the unwitnessed demand. Run: [[2026-09-01-1]].

## 2026-09-14 — `/deepen` on operator demand: English as a target, and the fleet gate

The operator asked for this bundle to become "a professional service for creating high
quality english native texts to web", and for every project in the fleet to follow the
rules when landing and marketing pages are built. **The scan found a coverage hole, not an
undercooked subject**: all fifteen subjects treated English as the source and taught what
the *other* language demands; nothing held English as the language a product ships in. By
the skill's own rule the hole was forged, not deepened around.

**Landed** (registry `main`): [[english]] (european; 8 techniques, 88 `EN-*` anchors, 3
applications) and [[copy-quality-gates]] (craft; 6 techniques, 2 applications) in
`e86f41e8`; the shared skill `native-copy` (contract, zero-dependency checker whose findings
cite `EN-*` IDs, baseline ratchet, anchored review, brief-first writing, pre-push wiring) in
`148fdbe6`; generated views `a1f164e2`, `8f559610` (gate 19/19). Shape: **17 subjects, 105
techniques, 50 applications**.

**Demand is no longer unknown.** It was stated by the operator and by the fleet survey: 8 of
13 projects ship public English web copy (kp, systedo-case, personas-web, ascent, gravitone,
politicas, goat, gravitone-gcloud), no prose linter existed anywhere, only systedo-case had
English style documents, and the four projects that had an em-dash policy disagreed with each
other. Operator decisions recorded 2026-09-14: gate blocks **new** errors only (baseline),
**all 8** projects, **US English fleet-wide**, **em dash banned fleet-wide** in product copy.

### The run's largest finding was not about English

The research lane on cross-repo enforcement read the harness documentation and flagged that
out-of-project symlinked rule files may not load. Probed the same hour with a load-telemetry
hook: **they do not** (2.1.270; a hard link or copy does; skill-directory links do). kp loaded
0 of its 4 registry rules; every project's external-include approval flag was false. **The
always-on knowledge rules — this registry's "present, not fetched" design — had been reaching
no session**, while `link-registry --check` reported them healthy. Fixed in `84f4b6aa` (copies +
drift check); kp re-probe 4 of 4. This affects every bundle, not only this one, and it means
the pre-2026-09-14 "no reporting installation" demand signal for every domain was partly an
artifact: agents never saw the cards. Memory: `symlinked-rules-do-not-load`.

### Applied in the same run

- kp `8450dbb1` — the i18n gate walked arrays as opaque leaves; after the fix it read 8,553
  strings per locale (34,212 counted equal) and found **4** banned dashes where it had
  reported 0. Row in `applied.md`.
- Registry `84f4b6aa` — the rule delivery above, `code` / `better`. Row in `applied.md`.

### Research shape and source classes (tallied against accepted vs declined findings)

Seven lanes + a fleet survey; a Director dossier fixed slugs and IDs with convergence marks.

| source class | fate this run |
| --- | --- |
| primary style-guide pages, read directly | accepted; **several canonical URLs have moved** (GOV.UK guidance host, Shopify content docs, plainlanguage.gov PDFs) — cite the current host |
| peer-reviewed studies | accepted; carried the refutations (readability, native review, detectors, plain-language credibility) |
| preprints | accepted only hedged, with n stated (em-dash baseline on 8 human essays) |
| vendor survey statistics | declined as cited (a stated-preference localization survey answers a different question) |
| secondary summaries of papers | accepted only as "indicative" (translationese polish-pass effect size) |
| practitioner lint packs and field guides | rule ideas and exception wording only; their single-lane rules are written hedged |

The counter-evidence lane was again the highest-yield per token, and the blind training-data
lane converged with the web lanes on every rule that reached the golden paths.

### Director's error rate, again recorded deliberately

Workers caught **six** dossier errors, each improving the result: a "validated rule with six
pairs" that shows five (two of them article fixes); a "puffery stack" mostly made of
checkable facts; a Title Case finding that was consistent, not mixed; two word-list hits clean
under their own exceptions; a ~2,000-pattern ban ceiling that was decoding-time, not prompt;
a 23.5x style figure that compared few-shot with zero-shot. The Director's own pre-fix kp
measurement looked for one character and found 1; the gate running every rule found 4.

### Saturation ledger

| subject | rung | last-pass yield | dry streak | clock |
| --- | --- | --- | --- | --- |
| english | L2 (+ fleet samples) | forge | 0 | vocabulary rules re-checked by 2027-03-14; authorities table by 2027-09-14 |
| copy-quality-gates | L2 + two L3 field incidents | forge | 0 | re-probe rule delivery after every harness upgrade |

### Banked (return conditions in the subject notes)

Heading-restating subheading rule (second sighting), elided head noun rule (second sighting),
`specimen` lexicon row, precision count of the mechanical EN rules on real catalogs once
several trees have run the checker, `link-registry --check` at a seam, a scripted delivery
probe, the linker's CRLF `.gitignore` rewrite.

## 2026-09-14 (same day, second pass) — the market harvest, wave 1 of three

The operator asked whether this domain could become an AI agency; the answer given was
"narrow productized service yes, broad agency no, prove uplift first", and the operator then
redirected to the useful half: **mine the market for craft, buy nothing, report where the
cheapest learning is.** Five lanes: open-source platform and linter code read at tip, vendor
public docs, the field's campaign papers with their data. Source note:
[[2026-09-14-l10n-market-landscape]].

**The finding that matters most: we published two wrong claims**, and the market's own
measurements are what exposed them. Span-level detection was quoted at "0.3–0.6 F1" (actual:
13.47% best automatic against a 47.48% second-human ceiling; on English→Czech the three human
columns read 14.40 / 24.86 / 18.24 against 10.55), and the severity weighting was quoted as
"1, 5 and 25" (actual: major 5 / minor 1 / neutral 0, with non-translation 25 and minor
punctuation-fluency 0.1 as *category* exceptions) — **in the golden path as well as the
technique**, which is the recurring shape: a number corrected downstairs and left standing
upstairs. Both fixed in `423a40d7`.

**Landed (wave 1):** the two corrections plus the human-ceiling rule; segment-vs-system
inversion; never-evaluate-with-the-metric-that-selected-it; per-pair catastrophic recall;
blind-sentinel and corner-case rater controls; metric-delta significance floors (bootstrap
floor ~4× smaller than the human-agreement cutoff); the category-free review protocol as a
costed tier with its trade; the cost-and-weight-licence layer; a new technique
`serialization-transport-safety`; rename-carrying cache deltas and absence-compatible key
fields. Generated views rebuilt in `a43fd0b4`; localization now **17 subjects, 106 techniques**.

**Cost answer, recorded so nobody re-asks:** zero. The richest sources are an open
continuous-localization platform's code and an open grammar checker's rule architecture, then
the 2025 campaign papers, then a desktop tool's QA reference. Paid tiers (€47–1,245/mo across
five vendors) buy use or per-pair calibration on our own strings, never design. Two narrow
exceptions: the formal typology standard's normative text, and commercial rights to the
strongest open quality-estimation weights — the latter moot, since a permissive alternative
ships code and weights.

**Waves 2 and 3 are planned, not owed on a clock** (operator: "we will probably spread into
wave 2,3 and language spread to our supported set"). Wave 2 is ~16 new techniques whose
evidence is already in hand (per-language check exemptions, format-aware check catalog, the
precondition graph, prefilter normalisation, auto-fix classes, the prompt context contract,
rendered-size budgets, pseudo-localization, cross-language source-defect detection, fuzzy
reuse thresholds, engine QE from reviewer corrections, register as a locale modifier, the
key-class taxonomy, near-duplicate grouping, multi-model disagreement as a context signal,
screenshot/co-occurrence context). Wave 3 is checker and skill work (rule metadata with
measured precision per rule, a deterministic veto in front of model review, unique-span
expansion, glossary spans as an FP mask, per-item failure memory, a read-only audit mode) plus
eight new English rule families. **Return condition for both: the operator opens them, or a
consumer deviation makes one of them urgent.**

**The language spread is ours to write.** The largest open false-friend corpus carries 152
Polish→English rules, 89 German, 49 Russian and **zero Czech**, and its first-language grammar
files are near-empty. Our 16-anchor interference set has no counterpart there. The Polish and
Russian sets are LGPL, so they are cross-checks and never sources; Czech data must be
re-derived from academic lists.

**Owed from this pass:** `reference-free-quality-estimation` is now 197 lines (profile
guideline 60–150) because three findings landed in one file — the natural split is the
cost-and-licence section into its own technique, in wave 2. `serialization-transport-safety`
has no application yet (`process--` slot open), and its `shared_with` is empty although the
transport rule plausibly belongs to a checker subject too.

## 2026-09-14 (third pass) — wave 2 landed; wave 3 in flight with personas-web as the tree

Operator: *"lets continue with wave 2 and 3. We will use 'personas-web' as real tree to exercise
the review in last wave."* Run as three phases: A = the knowledge (four workers, one subject
each), B = the two skills, C = personas-web (applications, pipeline applies, and the anchored
review exercise).

**Phase A landed** in `900dad91` (generated `0899f327`, gate 19/19): **localization is now 17
subjects, 119 techniques.** Thirteen techniques — measurement +4 (the cost/licence split,
per-language check exemptions, engine quality from reviewer corrections, context-sufficiency
signals), topology +4 (non-translatable value classification with four exclusion classes,
pseudo-localization readiness, fuzzy reuse under a threshold, the prompt-context contract),
copy-quality-gates +5 (format-aware check catalog with the precondition graph, deterministic
repair classes, length and render budgets, severity as declared data, source defects from
cross-language agreement) — and eight English rule families plus a first-language-keyed
false-friend lexicon.

**Workers corrected the Director five times this pass, all accepted:**
1. Wave 1's "two orders of magnitude" throughput claim for a distilled estimator was arithmetic
   wrong (146 vs 8–10 segments/s is ~15×); fixed in the split.
2. "Arabic must not be checked for kashida between letters" misread the source, which describes
   an Arabic-*only* check, the opposite of an exemption — left out rather than guessed.
3. The `Billion` false-friend pair is corroborated as a *family* by other first languages'
   corpora, not as the pair itself — and it would be wrong for Russian, where the cognate is 10⁹.
4. The market keeps even rule-based spelling and grammar checks at warning; this bundle lets a
   rule block after its precision is counted at 95%. The worker narrowed "never blocks" to
   statistical verdicts and recorded the divergence in both files; the Director kept the
   stricter-but-earned rule, because a counted precision is evidence the blanket rule lacks.
5. "Allowlisted" values in the exclusion vocabulary *are* translated, so they cannot sit in the
   "excluded values stay identical" assertion — caught while writing.

**Instrument note, worth keeping:** a purity scan whose glob matched no files reported clean
(caught by the worker), and the Director's own positive control failed silently because the
known phrase wraps across a line. The scan was re-run against an application file that must
match (11 hits) before its empty result over 25 upper-layer files was trusted.

**Owed from phase A:** the measurement golden path is 294 lines against a 120–220 guideline;
the per-language exemption blocks (and a settled answer on Arabic kashida) belong in the
language subjects; the context-disagreement signal has no measured precision; a break-even for a
local estimator versus a hosted judge is unwritten; none of the thirteen new techniques has an
application yet — phase C writes the first seven, grounded in personas-web.
