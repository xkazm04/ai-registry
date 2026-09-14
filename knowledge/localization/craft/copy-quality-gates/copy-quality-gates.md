---
layer: golden-path
type: golden-path
subject: copy-quality-gates
status: forged
use_when:
  - a coding agent or a contractor is about to write source-language product copy
  - designing the check that decides whether catalog copy may merge
  - a style standard lives in an instruction file and shipped copy still breaks it
  - deciding what a model reviewer may flag and who signs off on the pages that earn money
techniques:
  - copy-contract-before-drafting
  - rendered-string-extraction
  - layered-mechanical-gate
  - anchored-model-review
  - reviewer-calibration-and-sampling
  - enforcement-at-the-write-seams
  - format-aware-check-catalog
  - deterministic-repair-classes
  - length-and-render-budgets
  - severity-as-declared-data
  - source-defects-from-cross-language-agreement
---

# Copy quality gates

The language subjects in this bundle say what correct copy *is* in a language.
[Translation quality measurement](../translation-quality-measurement/translation-quality-measurement.md)
says how anyone would know a derived translation store got worse. This subject
sits upstream of both: the pipeline that **proves a catalog's copy meets its
language standard before that copy becomes the source**, whoever wrote it — a
product owner, a contractor, or a coding agent drafting a landing page at speed.
Its body is language-neutral; English is its first worked language, and the
English subject's rule identifiers are what its findings cite.

The source gate is the highest-leverage gate a multi-locale product owns. Under
[the source locale is the source of truth](../../_laws.md#the-source-locale-is-the-source-of-truth)
a defect in the source caps every locale at once: a vague claim or a calqued
preposition is translated faithfully into every shipped language, and each
localizer who notices it can only work around it in one. A catalog gate that
checks targets carefully and the source not at all sits downstream of the defect —
though its target findings, grouped by source unit, are the cheapest way to find one
([source-defects-from-cross-language-agreement](./techniques/source-defects-from-cross-language-agreement.md)).
The stance, in one sentence: **instructions advise; gates enforce.**

## Why the standard cannot live in the writer's prompt

The naive pipeline hands a writer — human or model — the whole style guide and
trusts the output. It fails for measured reasons. A coding agent harness's own
documentation describes always-on instruction files as context, not enforced
configuration, and adherence to them decays as they grow. Instruction-following
degrades with constraint density: on a benchmark scaling from ten to five hundred
simultaneous constraints, the best frontier models were near-perfect at the low
end and reached only 68% at five hundred, and the dominant error was omission —
the constraint silently not applied (Jaroslawicz et al. 2025). A forty-page style
guide is five hundred constraints.

Forbidden-word lists are the sharpest case. Naming a word in a prompt can prime
it (one preprint, thin evidence pointing one way); banning tokens can thin a
response's substance even when the ban is obeyed (one preprint); and decoding-time
token banning becomes unusable at around two thousand patterns, where a
backtracking sampler that checks and rewinds handled several thousand (Paech et
al. 2025). The evidence favours what this subject builds: **generate freely, check
mechanically, repair the flagged spans.** The standard reaches a writer as a short
positive description, a handful of exemplars and roughly ten verifiable
constraints; everything a script can decide is enforced by the gate and kept out
of the prompt ([copy-contract-before-drafting](./techniques/copy-contract-before-drafting.md)).

## The contract comes before the draft

A finding needs something to cite, and a writer needs something to aim at; one
artifact serves both. Before page copy is written the product records its declared
variant and mechanics — the choices authorities genuinely disagree on, counted
against the catalog first, per
[the authority is a hypothesis](../../_laws.md#the-authority-is-a-hypothesis) —
register per surface, a termbase with forbidden variants
([one concept, one rendering](../../_laws.md#one-concept-one-rendering)), three to
five voice exemplars per surface with a few annotated anti-exemplars, the rule set
with block, warn or off per rule, the money pages, and who owns review. Exemplars
beat description for style: few-shot prompting matched an author's style up to
23.5 times more accurately than zero-shot prompting (Jemama 2025, preprint). Page
copy is written from a **brief and a fact sheet** that is the only permitted source
of claims — the one defence against the invented specific, which no language rule
catches because it is grammatical, fluent and false.

## Lint what renders, and count what was linted

Prose rules run on rendered text, not message syntax. A plural or select message
is several sentences; a placeholder deleted before a grammar rule runs produces
"Hi , welcome" and a false finding. So extraction expands every branch into a
concrete sample, substitutes placeholders with neutral typed values and strips
rich-text tags before any language rule sees the string
([rendered-string-extraction](./techniques/rendered-string-extraction.md)).

Extraction is also where coverage is silently lost. One catalog gate flattened
nested objects into dotted keys but stored arrays as single leaf values, and its
typography check returned early for anything that was not a string: fourteen
arrays holding sixty-two strings per locale were never checked, and the only
banned dash left in the source locale sat inside one of them, while the product's
written contract stated the rule was gated. Two sibling gates in other trees
recursed into arrays. The difference was whether the check printed what it
covered.
[Coverage is counted, not claimed](../../_laws.md#coverage-is-counted-not-claimed):
a gate reports strings checked against strings present, and proves with a fixture
that it still sees a planted defect in every container shape the catalog uses.

## Layer by certainty, cheapest first

| layer | what it decides | disposition |
|---|---|---|
| L0 extraction | every rendered string, with an address and a surface class | must print its count |
| L1 deterministic | message syntax, placeholder parity, concatenated fragments, literals escaping the catalog, typography, declared-variant spelling, termbase forbidden variants, link text, case per element, length budgets | blocking |
| L2 spelling and grammar | real-word and agreement errors; sentence rules off for fragments | blocking only after counted precision |
| L3 style patterns | interference lists, officialese, puffery density, opener and closer templates | warn; a reviewer confirms |
| L4 anchored judgment | nativeness, collocation, register, transcreation, specificity | advisory in CI; human sign-off on money pages |
| L5 fidelity | translated strings only: negation, number, condition, qualifier | bilingual, before fluency |

The ordering is the sibling subject's
[deterministic checks before estimates](../translation-quality-measurement/techniques/deterministic-checks-before-estimates.md)
applied to source copy, with the source-side classes a translated store rarely
has: fragments concatenated in code, strings that never reached the catalog, and
the variant and case rules a writer drifts from within a paragraph. L3 warns
rather than blocks because every pattern in it has legitimate uses
([layered-mechanical-gate](./techniques/layered-mechanical-gate.md)). What L1
actually contains, and the precondition graph that stops one defect being reported
five times, is the [format-aware-check-catalog](./techniques/format-aware-check-catalog.md);
the classes a script should fix rather than report are
[deterministic-repair-classes](./techniques/deterministic-repair-classes.md); and
"length budget" is three instruments, not one
([length-and-render-budgets](./techniques/length-and-render-budgets.md)).

A rule earns blocking. Structural rules block from the first day. Every other rule
blocks only after at least 95% of its findings on the real catalog were accepted,
and a rule accepted under half the time across twenty findings is demoted or
rewritten. A warning nobody sees is theatre: it is surfaced in the change review or
not emitted. Legacy occurrences are held by a ratchet on per-occurrence
fingerprints — rule, address, text hash — never a bare count, which lets one fixed
occurrence pay for one new one. The diff is gated on every change; the whole
catalog is audited on a schedule and whenever the rule set or checker changes.
Dispositions are data beside the rule identifier, and a check whose verdict is a
model's or a score's warns and never blocks
([severity-as-declared-data](./techniques/severity-as-declared-data.md)).
Two instruments never gate: a readability formula is an alarm on body blocks of a
hundred words or more (the English subject's EN-READABILITY), and a generated-text
detector is not evidence at all (EN-DETECTOR) — a finding names a text property
and a span, never an author.

## Model review is anchored by construction

A model asked whether copy is good returns taste with confidence attached. A
model asked a checklist of binary questions — one per rule identifier in scope for
that surface — agrees with human judgment measurably more often (exact agreement
rose from 46.4% to 52.2% in Cook et al. 2024; Lee et al. 2024 report the same
direction). So the reviewer's output schema *is* the law
[every finding cites an anchor](../../_laws.md#every-finding-cites-an-anchor): a
rule identifier that exists, a span quoted verbatim, a minimal replacement;
anything else is dropped before a human sees it. The reviewer runs in a fresh
context, from a different model family where available, blind to who wrote the
copy (self-preference grows with self-recognition, Panickssery et al. 2024), in
both orders for comparisons (position bias, Wang et al. 2024), and a finding is
kept when at least two of three samples report it
([anchored-model-review](./techniques/anchored-model-review.md)).

Repair happens once, on flagged spans only. Intrinsic self-correction without
external feedback can make output worse (Huang et al. 2024) and self-bias grows
across refinement rounds (Xu et al. 2024) — the model-scale form of
[clean strings stay untouched](../../_laws.md#clean-strings-stay-untouched). A
reviewer is measured by its edit rate on a known-clean gold set, whose target is
near zero, and by idempotence: re-run on its own repaired output, it must find
nothing new. A string that flips A to B and back is frozen and escalated. Model
judgment is usable in aggregate and weak on any single string, so it advises; it
never clears a money page alone.

## Reviewers are qualified by calibration, not by nativeness

"Have a native speaker look at it" is neither necessary nor sufficient. Expert
annotators working with an error typology and document context diverge sharply
from crowd raters (Freitag et al. 2021); agreement between human raters in
generation evaluation usually falls below conventional thresholds (Amidei et al.
2019); the readers who reliably spot generated prose are heavy model users, not
natives as such. So reviewers qualify on a seeded set — planted defects to find,
clean strings to leave alone — and roles separate: bilingual revision checks
fidelity, monolingual review checks nativeness (the line ISO 17100 draws), a native
of the *declared variant* edits for nativeness, and the termbase owner rules on
terms. Review happens on the rendered page, because a spreadsheet hides whether
"Order" is a noun or a verb.

Severity is arithmetic, not mood. The typology and its weights belong to the
sibling subject; this subject adds the surface multiplier — a construction finding
in a pricing headline outranks the same finding in a settings tooltip — and a
coverage rule: money pages (home, pricing, top landing pages, sign-up, checkout,
payment and authentication errors, transactional email) get complete review; the
long tail is sampled toward new, translated and brief-less strings, on the
sibling's
[sampling discipline](../translation-quality-measurement/techniques/human-review-sampling-under-a-budget.md)
([reviewer-calibration-and-sampling](./techniques/reviewer-calibration-and-sampling.md)).

## Enforcement lives at the seams that see every write

A gate an agent writer can route around is advice again. A writer changes a
catalog through its file tools, a shell, a generator, or a merge of a parallel
session's work, and each path skips a different check. Instruction files scoped to
paths load when a matching file is *read* — not when one is created or written by a
shell — so they are least reliable exactly when a new page is written. A pre-write
deny on file tools gives fast feedback, but a shell write bypasses it and a hook
that times out allows the write. The seams that see every path are an
end-of-session check over the working tree's diff, the commit or push gate, and
continuous integration
([enforcement-at-the-write-seams](./techniques/enforcement-at-the-write-seams.md)).

Delivery of the advice is verified too, by the right instrument. A fleet that
installed its always-on instruction files as symlinks to a generated file outside
each project found with a load-telemetry hook that none had reached a session —
while its own consistency check reported every link healthy, because it checked
where the link pointed, not whether the file loaded. Listing an instruction
directory proves a file exists; only load telemetry proves a session saw it.

## Failure modes this subject exists to prevent

- **The standard as a prompt.** Five hundred constraints, silently omitted, unchecked.
- **The banned list in the writer's context.** The words primed, the synonym shipped.
- **The flattened blind spot.** A container shape the walker skipped, a gate that
  printed a key count, and a contract that says the rule is enforced.
- **The unearned block.** An uncounted pattern rule at error level, soon suppressed.
- **The taste loop.** An unanchored model reviewer, re-run until the copy is worse.

## Boundary

What a correct sentence is belongs to the language subjects; this subject runs
their rules. Estimation, engine selection, the error typology and budgeted sampling
belong to the sibling measurement subject, built on here for source copy and agent
writers. Persuasion strategy — page structure, proof policy, positioning, keywords,
brand voice — is a marketing concern: a gate flags the wording of a vague
attribution and leaves its sourcing to marketing. Translating the source into other
locales is the translation workflow's; this subject decides whether that source is
fit to be consumed.
