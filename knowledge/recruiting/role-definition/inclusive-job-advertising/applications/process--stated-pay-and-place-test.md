---
layer: application
type: application
subject: inclusive-job-advertising
technique: stated-pay-and-place-test
stack: process
status: forged
verified_on: 2026-08-20
---

# The concreteness test across three runtimes (process)

The same rule — *a phrase never satisfies a fact test* — is implemented three
times in this codebase, in two languages, on both sides of the
advertisement/outbound seam. Reading them together is what shows the doctrine.

## 1. The posting lint: what counts as a figure and a location

`app/_lib/jd-lint.ts:65-74` defines both concreteness tests as patterns, not as
non-emptiness checks.

```
const MONEY_RE = /\d[\d\s  .,]*\s*(?:kč|czk|eur(?:o)?\b|usd\b)|[€$]\s?\d/iu;
```

A stated pay figure is **digits adjacent to a currency token**, in either order
(`"65 000 Kč"`, `"3 200 EUR"`, `"€3,200"`, `"$120k"`). The character class
inside the number deliberately includes NBSP and narrow-NBSP (`:67`) because
those are the thousands separators real Czech text uses — a naive `[\d ,.]`
class fails on text pasted out of a word processor, which is where most
postings come from.

`PLACE_RE` (`:73-74`) accepts a work-mode keyword in either language
(`remote`, `hybrid`, `on-site`, `home office`, `na dálku`, `z domova`,
`kancelář`) or a named city. Both are substring stems, for the diacritic reason
the multilingual technique covers.

`lintJd` (`:121-122`) then reports `{ kind: "missing", what: "salary" | "place" }`
when the pattern does not hit. Crucially it is the *body prose* that is tested
— "competitive salary" produces both a `vague` finding and a `missing: salary`
finding, which is the correct double report: the phrase is a red flag *and* the
fact is absent.

## 2. The suppression seam: what the reader will actually receive

The missing-salary finding is suppressed when `salaryAvailable` is true
(`:121`), whose contract is documented at `:114-117` — the structured band
exists, so the published artifact will carry a figure even if the prose does
not. The availability answer comes from exactly one place,
`jdMarketResearchAvailable` (`app/features/library/jds/jdsLibrary.ts:18-23`),
shared across the ledger modal, the read-view and the public page's editor so
none of them can disagree about whether a role has a salary.

The place finding has **no** such suppression, and that asymmetry is correct:
a location that never appears in the prose is a location the reader never
learns.

## 3. The outbound side: a defaulted value is simply absent

`pipeline/jobfit/campaign.py:121-146` states the same rule for advertising copy
sent outbound, where the sibling `sourcing-campaign-honesty` subject owns it.
`_job_facts` is docstringed as *"The ONLY facts the copy may use. A
DEFAULT_POLICY phantom (recorded in `defaulted_fields`) or a blank string is
absent — never advertised."* Its `stated()` helper (`:129-131`) returns the
value only when it is both non-blank and not in `defaulted_fields`, and the
salary line applies it explicitly (`:141-142`): *"an anchor band normalize_job
stamped ('salary_band' phantom) is absent, so WARN_NO_SALARY fires."*

That is the standard's rule that suppression is not satisfaction, enforced on
the harder side: a band exists in the record, and it still does not count,
because it was defaulted rather than decided. The seam between the two subjects
is this line — the posting lint asks *is the figure concrete*, the campaign
builder asks *is the figure stated* — and the two must not drift.

## 4. The seeded template must pass its own test

`app/features/shared/renderTemplate.ts:29-73` carries the output-language
doctrine (a posting's scaffolding follows the DOCUMENT's `lang`, never the
recruiter's cookie; user-authored headings are never machine-translated) and,
with it, the rule that the seeded filler must clear this lint. The comment at
`:66-73` is explicit: the filler *"is deliberately concrete and coded-language-
free so a JD rendered from the default still LINTS CLEAN (jd-lint) — each
language keeps a work-mode word ('hybrid' / 'hybridní' / 'hybrides Arbeiten' /
'travail hybride') for the place signal jd-lint checks"*, and `:83-86` records
what it replaced: *"the old 'Competitive pay…' line was exactly the boilerplate
jd-lint flags."*

## Deviations

- **`MONEY_RE` does not require a period.** `"65 000 Kč"` passes with no
  per-month or per-year marker, so an annual figure and a monthly figure are
  indistinguishable to the check — the ambiguity the standard requires the
  period to close.
- **No upper-bound or band-width test.** A single figure satisfies the pay
  check as fully as a range does, and a range spanning any width passes. The
  standard's "a range so wide it contains every plausible answer is a gesture"
  has no implementation here.
- **No blocked-posting path.** The findings are advisory throughout; nothing
  routes an undecided band to whoever can decide it. The standard's escalation
  step is absent, not weakened — teach it, do not lower it.
