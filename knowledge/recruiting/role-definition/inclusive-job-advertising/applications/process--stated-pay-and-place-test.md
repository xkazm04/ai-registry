---
layer: application
type: application
subject: inclusive-job-advertising
technique: stated-pay-and-place-test
stack: process
status: forged
verified_on: 2026-09-29
---

# The concreteness test across three runtimes (process)

The same rule — *a phrase never satisfies a fact test* — is implemented three
times in this codebase, in two languages, on both sides of the
advertisement/outbound seam. Reading them together is what shows the doctrine.
Read at kp `9f2ff09d6`.

## 1. The posting lint: what counts as a figure and a location

`app/_lib/jd-lint.ts:84-99` defines both concreteness tests as patterns, not as
non-emptiness checks.

A stated pay figure (`MONEY_RE`, `:89`) is **digits adjacent to a currency
token**, in either order: `65 000 Kč`, `3 200 EUR`, `60.000 €`, `€3,200`,
`$120k`. The character class inside the number deliberately includes NBSP and
narrow-NBSP, because those are the thousands separators real Czech and French
text uses. A naive `[\d ,.]` class fails on text pasted out of a word
processor, which is where most postings come from. The euro sign after the
figure was added in `ec835e39a`: before it, `45 000 € brut annuel` failed the
test, because de and fr put the sign last.

`PLACE_RE` (`:98-99`) accepts a work-mode keyword in any of the four languages
(`remote`, `hybrid`, `on-site`, `home office`, `na dálku`, `z domova`,
`kancelář`, `na pracovišti`, `vor Ort`, `sur site`, `télétravail`) or a named
Czech city.

`lintJd` (`:189-190`) then reports `{ kind: "missing", what: "salary" | "place" }`
when the pattern does not hit. Crucially it is the *body prose* that is tested
— "competitive salary" produces both a `vague` finding and a `missing: salary`
finding, which is the correct double report: the phrase is a red flag *and* the
fact is absent.

## 2. The suppression seam: what the reader will actually receive

The missing-salary finding is suppressed when `salaryAvailable` is true
(`:189`), whose contract is documented at `:165-167`: the structured band
exists, so the published artifact will carry a figure even if the prose does
not. The availability answer comes from exactly one place,
`jdMarketResearchAvailable` (`app/features/library/jds/jdsLibrary.ts:30-35`),
shared across the post-build surfaces so none of them can disagree about
whether a role has a salary.

That predicate is where *suppression is not satisfaction* was learned. It used
to accept the recruiter's ticked market-research option. The step behind the
tick can resolve to no band, and then the published body carried no figure
while the lint suppressed its finding and rendered an all-clear
(`jdsLibrary.ts:18-28`). It now accepts only a usable normalized band from the
build's artifacts. The input to a suppression must be the evidence, not the
intention that preceded it.

The place finding has **no** such suppression, and that asymmetry is correct:
a location that never appears in the prose is a location the reader never
learns.

## 3. The outbound side: a defaulted value is simply absent

`pipeline/jobfit/campaign.py:128-151` states the same rule for advertising copy
sent outbound, where the sibling `sourcing-campaign-honesty` subject owns it.
`_job_facts` is docstringed as *"The ONLY facts the copy may use. A
DEFAULT_POLICY phantom (recorded in `defaulted_fields`) or a blank string is
absent — never advertised."* Its `stated()` helper (`:133-135`) returns the
value only when it is both non-blank and not in `defaulted_fields`, and the
salary line applies the rule explicitly (`:146-148`): *"an anchor band
normalize_job stamped ('salary_band' phantom) is absent, so WARN_NO_SALARY
fires"* (`:159`).

That is the standard's rule that suppression is not satisfaction, enforced on
the harder side: a band exists in the record, and it still does not count,
because it was defaulted rather than decided. The seam between the two subjects
is this line — the posting lint asks *is the figure concrete*, the campaign
builder asks *is the figure stated* — and the two must not drift.

## 4. The seeded template must pass its own test

`app/features/shared/renderTemplate.ts:61-92` carries the output-language
doctrine and, with it, the rule that the seeded filler must clear this lint.
Scaffolding follows the build's `lang`, never the recruiter's cookie, and
user-authored headings are never machine-translated. The comment at `:70-72`
records the defect that forced it: the headings used to be a `Record<"en" |
"cs", …>` table, *"so a de/fr build put localized role CONTENT under ENGLISH
headings"*. The filler is *"deliberately concrete and coded-language-free so a
JD rendered from the default still LINTS CLEAN (jd-lint) — each language keeps
a work-mode word ('hybrid' / 'hybridní' / 'hybrides Arbeiten' / 'travail
hybride') for the place signal jd-lint checks"* (`:76-79`). `:87-92` records
what it replaced: *"the old 'Competitive pay…' line was exactly the
boilerplate jd-lint flags."*

## Deviations

- **`MONEY_RE` does not require a period.** `65 000 Kč` passes with no
  per-month or per-year marker, so an annual figure and a monthly figure are
  indistinguishable to the check — the ambiguity the standard requires the
  period to close.
- **No upper-bound or band-width test.** A single figure satisfies the pay
  check as fully as a range does, and a range of any width passes.
- **No blocked-posting path.** The findings are advisory throughout; nothing
  routes an undecided band to whoever can decide it. Where a jurisdiction
  requires pay information before the interview, the advisory lint is the only
  control kp has, and the technique's publication gate is absent.
