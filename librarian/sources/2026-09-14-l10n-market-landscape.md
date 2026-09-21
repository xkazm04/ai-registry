---
source: landscape:localization-market
kind: landscape sweep (open-source code + vendor docs + peer-reviewed papers)
url: multiple; per-finding links in the lane sections below
title: "The localization / AI-translation / copy-quality market, mined for craft"
words: n/a (five parallel lanes; ~15k words of lane reports)
extracted: 96
accepted: 9
declined: 3
leads: 41
already_covered: 12
untriaged: 31
dispatched: 2
applied: 0
shipped: 0
run_id: landscape-l10n-0914
siblings: 0
---

# The l10n market, mined for craft — not for a business

Operator framing, in two moves. First: *"how feasible would it be to create an AI agency from
our registry's translations domain?"* — answered in-session as **narrow productized service yes,
broad agency no, and prove uplift before anything** (the corpus's own counter-evidence refutes
detectors, readability targets and native-review-suffices as gates). Then the redirect that
produced this note: *"lets start from different direction … web research these solutions to see
whether we can extract knowledge or good techniques from docs or codebases … with goal to improve
our registry domain without making the public service"*, plus the decision rule — **compare where
we can gather most for the lowest price, then the operator decides to stop or continue.**

Five lanes ran in parallel against a shared brief that carried the bundle's own inventory, so
every finding had to be marked NEW / ENRICH / CONFIRMS / CONTRADICTS against what we already own.

## The answer to the operator's question

**Total cost to learn everything valuable: zero.** Nothing in the lane set justified a purchase.
The two exceptions are narrow: the formal quality-typology standard text (the council's own pages
403 automated readers; the operational weights everyone actually runs are public and free), and
commercial rights to the strongest open quality-estimation weights — moot, because one vendor's
alternative ships permissive code *and* weights.

Ranked by learning value per unit of cost: an open continuous-localization platform's code
(86 checks, its translation prompt, memory maths, glossary automaton, render checks, per-language
exemptions) and an open grammar checker's rule architecture (guards as data at ~5:1, examples as
regression tests, retire-without-delete, a deterministic veto over neural findings), then the
field's 2025 evaluation campaign (which **contradicts a number we published**), then a desktop
tool's QA-configuration reference and a platform's published prompt-context contract, then two
open AI-localization CLIs, then a vendor's measured production pretranslation numbers.

Paid tiers buy *use* or per-pair calibration on our own strings, never the design: hosted platform
plans €47–616/mo, support €645–2,550/yr, one open-core's QA engine at €179/mo, a copy-governance
platform at $249/mo (and it has since **moved its numeric scorecard behind login** — the
governance retreat is itself the finding), a translation-memory platform at $525–1,245/mo.

## The uncomfortable part: we are wrong twice

1. **Span-detection F1.** The measurement subject quotes "0.3–0.6 F1". The 2025 campaign reports
   the best automatic span annotator at **13.47% micro-F1** against a **47.48% second-human
   ceiling**; on English→Czech the human ceiling is **18.24%** and a strong metric reaches 10.55%.
   The correction is not a smaller number, it is a rule: **a span score without the
   human-versus-human number beside it cannot be read.**
2. **Placeholder position.** `deterministic-checks-before-estimates` says position is deliberately
   not checked. Two independent platform implementations compare **named** placeholders as an
   order-free multiset and **unnamed positional** ones **in order**, because reordering silently
   swaps arguments. Our claim is right for the first case and wrong for the second.

Both are in wave 1, dispatched the same day.

## Wave 1 — accepted and dispatched (2026-09-14)

| # | Finding | Landing | Source class |
|---|---|---|---|
| 1 | Span-F1 correction + the human-ceiling rule | `reference-free-quality-estimation` + golden path | measured-independent (2025 campaign tables) |
| 2 | Segment-vs-system inversion with 2025 numbers; never evaluate with a metric that selected or trained the system | same | measured-independent |
| 3 | Per-pair catastrophic recall (84% → 12–21% for one metric across pairs) | same | measured-independent |
| 4 | Blind sentinel control; corner-case rater tests (wrong language/script shipped unflagged in 2025) | same | measured-independent |
| 5 | Metric-delta significance floors, and that the metric's own bootstrap floor is ~4× smaller than the human-agreement floor | `regression-detection-under-a-moving-engine` | measured-independent |
| 6 | The category-free review protocol as a costed tier: 34 s vs 49 s per segment, non-experts, 94.9% system-ranking agreement, τc 0.254 vs 0.116 — trade = no routing by category | `human-review-sampling-under-a-budget` + boundary note in `error-typology-over-a-single-score` | measured-independent (2024, 28 annotators) |
| 7 | Operational severity weights: major 5 / minor 1 / neutral 0, with non-translation 25 and minor punctuation 0.1 as **category** exceptions | `error-typology-over-a-single-score` | measured-independent |
| 8 | Cost and licence of measurement: ~22 GB → ~8 GB at 3-bit with no quality loss; a 278M student at 92% quality and ~146 seg/s; pruning collapses it; **the reference-free and span-level checkpoints of the most-used open family are non-commercial** | `reference-free-quality-estimation` | primary sources |
| 9 | NEW technique `serialization-transport-safety` — target punctuation terminates the transport (`„{title}" anhängen?` breaks JSON); transport choice > identity tokens > bounded idempotent repair; plus rename-carrying delta and absence-compatible cache keys | `translation-pipeline-topology` (new technique + `source-hash-translation-cache` amendments) | code-verified, permissive licences |

## Declined

- **Back-translation as a quality check** — appears on an enterprise tier's feature list; our
  guardrails already record it as a non-lever for nativeness, and a pricing page is not evidence.
- **A large uncountable-noun list** for the English checker: five of the eight nouns we flag are
  classed *partly* countable in the biggest open corpus, so adopting it would manufacture
  findings. Our narrow curated list is the safer design — recorded as a negative finding.
- **Regex passive-voice detection**: three independent implementations match predicate adjectives
  ("was tired") as passive. Two of them documented the flaw independently. Do not build it.

## Leads — waves 2 and 3, and the language spread (operator: "we will probably spread")

**Wave 2, new techniques (evidence is in hand, effort is writing):**
per-language check exemptions (two ~20-year implementations agree on the shape: no terminal
punctuation in Thai/Lojban, Devanagari danda, Greek question mark, Armenian exclamation, caps
checks meaningless in 28 languages, no kashida between Arabic letters, doubled-word allowlists per
language) · format-aware check catalog (each serialization earns its own syntax check) · the
precondition graph (a failing gate check suppresses ~35 dependents — the largest single
false-positive reducer found) · prefilter normalisation before matching · auto-fix classes
(deterministic repairs instead of findings: ellipsis, zero-width space, danda, French punctuation
spacing) · the translation-prompt context contract (per-string context/explanation, a third
language's translation, plural form counts *and* formulas, failing checks, placeholder map;
few-shot as prior turns, not system text; per-language instruction map with fallback) · rendered-size
budgets with per-language fonts and an 85% source-side pre-warning · pseudo-localization (three
orthogonal knobs; a 10% variable multiplier; zero-API locale) · source defects detected from
cross-language check agreement (fails in ≥2 languages ⇒ source defect) · fuzzy reuse under a
threshold (two different similarity formulas and floors in production) · engine quality estimated
from reviewer corrections, with measured production anchors (~50% approved unchanged at scale,
~90% for memory-sourced) · register as a locale modifier (`xx@FORMAL`) · key-class taxonomy
(never-translate / drop / human-owned / allowlist) and the pre-prompt value classifier ·
near-duplicate grouping before batching · multi-model disagreement as a **context**-deficiency
signal (the most original design found) · screenshot and key-co-occurrence context delivery.

**Wave 3, the checker and skill build:** rule metadata (measured precision + date per rule, guards
as data, retire-without-delete, overlap priority, standard issue types, examples as regression
tests) · a deterministic veto layer in front of model review · unique-span expansion (word-by-word
alphabetic, character-by-character CJK) · glossary spans as a false-positive mask · per-item failure
memory in the retry loop · a read-only audit mode.

**English subject additions:** redundancy/pleonasm · redundant acronyms · expletive openers ·
an ordered generic-pronoun ladder · an inclusive-language family · regional vocabulary as a third
variant axis · ungradable absolutes · native clichés · false friends keyed by the author's first
language with a measured precision bar and short glosses — including `Billion` = 10⁹ US vs 10¹²
Czech/German, dangerous on a pricing page.

**Language spread:** the world's largest open false-friend corpus has 152 Polish→English rules,
89 German, 49 Russian and **zero Czech**, and its first-language grammar files are near-empty. Our
16-anchor interference set has no counterpart in it. The spread is therefore *ours to write*, and
the Polish and Russian sets are cross-checks, not sources (they are LGPL; re-derive from academic
lists).

## Instrument and currency notes

- **A shared web-search budget is a real constraint**: two lanes exhausted a 200-call session cap
  mid-run, and the last three lanes leaned on direct URL fetches and code reads instead. Plan
  lane order so the cheapest-to-verify lane runs last.
- `help.smartling.com`, `docs.rws.com` and `support.deepl.com` return 403 to automated fetching;
  those need a browser.
- **Stale references to fix when touched**: one copy-governance vendor's docs now redirect wholly
  to a new brand; the two most-used prose-lint style packages moved organisation; an i18n
  ecosystem **removed its lint-rule lane entirely** (replaced by an open design issue, so cite it
  as a format/runtime, not a QA source); an open translation toolkit **relicensed to GPL-3** in
  July 2026 and its check module became a package.
- **Licence discipline for anything landed from here**: mechanics, counts, rule IDs and designs are
  learnable; LGPL rule *data* must be re-derived from another source, with the original used only
  as a cross-check. Everything else in the sweep is MIT / Apache-2.0 / BSD, with one open-core
  vendor's enterprise directory source-available but non-commercial.

## Untriaged (31)

Mostly wave-2 candidates not yet sized: the change-control model over translations (checkpoints and
explicit conflict selection), workflow rigour set per project × language, the two distinct
"needs checking" vs "needs rewriting" states, per-string auto-enable of a check, ICU sub-check
granularity and the gap that plural selectors are not validated against the target's required set,
document-level memory tiers (a run-scoped glossary that writes itself), time-to-edit as an effort
metric, threshold-as-auto-confirm-band vocabulary, and a declarative rule DSL + signed rule-pack
format as the shape our anchors and checker rules would converge on if they ever merged.
