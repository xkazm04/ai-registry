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
