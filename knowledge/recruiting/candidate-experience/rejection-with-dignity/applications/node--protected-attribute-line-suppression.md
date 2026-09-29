---
layer: application
type: application
subject: rejection-with-dignity
technique: protected-attribute-line-suppression
stack: node
status: forged
verified_on: 2026-09-29
verified_against: node@24
applied: code
ab_verdict: better
---

# Whole-line suppression in the rejection-feedback module

`app/_lib/rejection-feedback.ts` is the whole technique in one dependency-free,
unit-testable module, and its header comment (`:1-19`) states the doctrine before
any code: say only what was actually **recorded**, in the words the record holds,
and specifically **not** (a) a fresh model call — "a per-candidate generation
would … invent a rationale that was never the reason. The reason has to be the
one on file or it is theatre", (b) anything derived from a protected attribute
or free text mentioning one, (c) a reason at all when nothing was recorded,
because "silence beats a fabricated explanation".

## The deny-list and the line rule

`PROTECTED_PATTERNS` (`:32-`) is now ten regexes: age, gender and pregnancy,
marital and family status, nationality/citizenship/visa/ethnicity, religion,
disability and health, union/political/orientation, and one each for Czech,
German and French (German and French were added on 2026-09-22, `a49d6d837`).
The comment above them states the standard's two hardest points in one place:
matching is on the **line**, and a match "drops the whole line rather than
redacting a word — a partially-scrubbed sentence about someone's age is still a
sentence about their age", and the tuning is set by cost asymmetry —
"deliberately broad: a false positive costs one bullet, a false negative costs a
lawsuit."

**The Czech pattern is the record of a defect this application first described
wrongly.** The 2026-08-20 reading said the stem-plus-`\w*` shape was "the
morphology rule realized". It was not: `\bpohlaví\b` never matched the word at
all, and `\bvěk\b` matched only the bare nominative, because JavaScript's `\b`
is ASCII-only. The fix (`336e9dd70`, 2026-08-22) is the comment now at `:40-53`:
a Unicode-aware "start of line or non-letter" guard, an open tail, and the
`/u` flag. The German and French patterns follow the same shape.

`safeLines` (`:79-100`) executes it: normalize whitespace, drop empties,
`continue` past any line any pattern matches while raising `filtered`, then
de-duplicate case-insensitively, then `.slice(0, MAX_FEEDBACK_LINES)`
(`MAX_FEEDBACK_LINES = 3`, `:24`). Filter-then-cap, in that order, as the
technique requires. `MAX_LINE_CHARS = 140` (`:26`) truncates with an ellipsis,
which the ceiling technique advises against (a truncated quotation of the record
is no longer the record).

## Empty is a state, not an error

`buildRejectionFeedback` (`:102-`) returns a typed `source` of
`"recorded_gaps" | "unmet_requirements" | "none"`, and when suppression removes
every line it returns `{ ...EMPTY, filtered: true }` rather than a source with
zero lines — the collapse-to-honest-no-reason rule enforced by the type.
`renderRejectionFeedback` (`:127-`) returns `""` for empty feedback, so the caller
appends nothing and the existing template ships unchanged: no backfill path
exists.

The `filtered` flag is documented as recruiter-facing, not just auditor-facing:
"so a recruiter can see the filter fired rather than wondering where a recorded
gap went".

## Where it fires, and what gets recorded

`dispatchRejection` (`app/_lib/comms-dispatch.ts:549-591`) calls
`buildRejectionFeedback` with `entryProfileGaps(...)` and appends the rendered
block between the localized `rejection.opening` and `rejection.closing` strings.
Its audit event carries exactly the two facts the standard asks for:

```
[ automated ? "policy auto-reject" : "manual reject",
  `feedback:${feedback.source}`,
  feedback.filtered ? "protected-filter:fired" : null ]
```

— documented as answering "was this rejection explained?" without reopening the
outbox body, with "a dropped line is a fairness event".

## The second guard: model-drafted letters

The Python letter path is now guarded (the 2026-08-20 deviation is closed in
kind). `protected_language()` (`pipeline/jobfit/automation.py:415-`) scores every
candidate-visible field against `PROTECTED_TERM_RE`, and `_letter_is_safe` /
`letter_problem` discard the whole draft when it hits, so the deterministic
template ships and the source is labelled `deterministic`. The docstring gives the
reason for discarding instead of redacting: "a letter whose stated reason has been
cut is no longer the letter the model wrote". The comment on the regex calls it
"the ONE protected-characteristic vocabulary in this repository". It was not: it
was a second, narrower vocabulary than the TypeScript list above.

## Measured 2026-09-29: two guards, one probe

A hand-labelled probe of 20 explicit protected lines (English 6, Czech 8, German
3, French 3), 8 proxy phrases (English 6, Czech 2) and 19 legitimate
requirement lines built to collide, run through the real modules (n is small;
labels are the author's):

| Guard | English | Czech | German | French | Proxies |
|---|---|---|---|---|---|
| Recorded-line filter (TS) | 6/6 | 7/8 | 3/3 | 3/3 | 0/8 |
| Drafted-letter guard (Python), before | 4/6 | 2/8 | 0/3 | 0/3 | 0/8 |
| Drafted-letter guard (Python), after `4dd303bdd` | 4/6 | 8/8 | 3/3 | 3/3 | 0/8 |

- The Python guard's Czech misses were the same nominative-only defect fixed on
  the TS side five weeks earlier ("ve věku 55 let", "Vašemu věku" passed), and it
  had no German or French term although letters are drafted in cs, de, en and fr.
  The fix on 2026-09-29 (`4dd303bdd`, local commit, not pushed) extends the stems
  and adds whole-word German and French forms, keeping "alternative" and SQL's
  ALTER and the German adjective in "alter Codebasis" out (the first draft of the
  patch caught both, and the probe showed it). The 23 tests in
  `test_fault_injection.py` plus 167 in `test_automation` and
  `test_automation_eval` pass.
- The TS filter's one Czech miss is "těhotná" (the stem is `těhoten`, not the
  adjective `těhotn`).
- **No guard catches a proxy.** "Overqualified for a young team", "recent
  graduate", "too old for the team", "a long gap in employment", "not the right
  cultural background", "may find the travel difficult with a young family", "je
  příliš starý pro tým" and "jste žena a tým je převážně mužský" all pass both.
  These are the standard's own examples. What protects kp is upstream, not the
  filter: its keyless letter path is a closed vocabulary (see the feedback-letter
  application).
- **False positives.** Across the 835 short skill labels in the 120 seed
  postings the recorded-line filter drops none. Across the 906 sentence-shaped
  stack lines in the 100 calibration cases it drops 32 (3.5%): "Exclusive Agency"
  and "agent" (the French `age` stem has no closing boundary), a medical-services
  role, "single-tenant", a union-governed workplace, and "alternative" (the
  German `alter` stem). On the 19 collision-built lines it drops 13, which shows
  the mechanism and not a rate.
- **A dropped line changes what the survivors mean.** With profile gaps
  `["TypeScript union types", "Kubernetes", "Terraform"]` the filter drops the
  first and ships the other two under "Where the decision landed, based on what
  we recorded for this role". `filtered: true` is recorded, but the letter
  itself reads as complete. The list is unranked, so the module cannot know the
  dropped one was the decisive one.

## Deviations

- **No pattern versioning or coverage marker.** Unchanged: the deny-list carries
  no version, though the module now has tests and the Python side a fault-injection
  eval (`fault_eval.py`, mode `protected_language`).
- **Two vocabularies still.** The TS list (10 patterns, 4 locales, 19/20) and the
  Python regex (single alternation, 18/20 after the fix, no English `visa` or
  `union`) are separate; a parity test would make the comment's "one vocabulary"
  true.
- **The recruiter-approved feedback letter is not filtered.** The approve route
  sends the reviewer's text verbatim after a length check; no protected-language
  check runs over what the recruiter typed (the model draft that seeded it was
  checked, the edit is not).
- **Proxies are unaddressed by either guard.**
