---
layer: application
type: application
subject: rejection-with-dignity
technique: protected-attribute-line-suppression
stack: node
status: forged
---

# Whole-line suppression in the rejection-feedback module

`app/_lib/rejection-feedback.ts` is the whole technique in one dependency-free,
unit-testable module, and its header comment (`:1-20`) states the doctrine before
any code: say only what was actually **recorded**, in the words the record holds,
and specifically **not** (a) a fresh model call — "a per-candidate generation
would … invent a rationale that was never the reason. The reason has to be the
one on file or it is theatre", (b) anything derived from a protected attribute
or free text mentioning one, (c) a reason at all when nothing was recorded,
because "silence beats a fabricated explanation".

## The deny-list and the line rule

`PROTECTED_PATTERNS` (`:32-42`) is eight regexes covering age, gender and
pregnancy, marital and family status, nationality/citizenship/visa/ethnicity,
religion, disability and health, and union/political/orientation — plus a ninth
covering the Czech morphological equivalents (`věk|pohlaví|těhoten\w*|mateřsk\w*|
rodinn\w*|národnost\w*|občanstv\w*|nábožen\w*|zdravotn\w*|invalid\w*`), because
that is the locale most adverse comms ship in. The stem-plus-`\w*` shape is the
morphology rule realized: one pattern per concept, every inflection.

The comment above it states the standard's two hardest points in one place:
matching is on the **line**, and a match "drops the whole line rather than
redacting a word — a partially-scrubbed sentence about someone's age is still a
sentence about their age", and the tuning is set by cost asymmetry —
"deliberately broad: a false positive costs one bullet, a false negative costs a
lawsuit."

`safeLines` (`:65-81`) executes it: normalize whitespace, drop empties, `continue`
past any line any pattern matches while raising `filtered`, then de-duplicate
case-insensitively ("the gap list and the unmet-requirement list overlap often,
and the same sentence twice reads as sloppy in the one message that must not"),
then `.slice(0, MAX_FEEDBACK_LINES)`. Filter-then-cap, in that order — the
ordering the technique requires. `MAX_LINE_CHARS = 140` (`:26`) with ellipsis
truncation adds the per-line cap.

## Empty is a state, not an error

`buildRejectionFeedback` (`:88-105`) returns a typed `source` of
`"recorded_gaps" | "unmet_requirements" | "none"`, and when suppression removes
every line it returns `{ ...EMPTY, filtered: true }` rather than a source with
zero lines — "fall through rather than return a source with no lines". That is
the collapse-to-honest-no-reason rule enforced by the type. `renderRejectionFeedback`
(`:113-117`) returns `""` for empty feedback "so the caller appends nothing and
the existing template ships unchanged": no backfill path exists.

The `filtered` flag is documented as recruiter-facing, not just auditor-facing
(`:50-53`): "so a recruiter can see the filter fired rather than wondering where
a recorded gap went".

## Where it fires, and what gets recorded

`dispatchRejection` (`app/_lib/comms-dispatch.ts:258-297`) calls
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

## Deviations

- **Human-written reason fields reach the filter, but recruiter free text is
  only one of two sources.** The Python letter path
  (`pipeline/jobfit/automation.py:541`) instructs a model to avoid
  protected-characteristic language in prose but has no equivalent post-hoc
  line filter over the generated body — the deny-list guards the deterministic
  template path only. The standard wants the filter to run last over *every*
  outbound line regardless of author.
- **No test-visible pattern versioning.** The standard asks for versioned,
  tested patterns because this control fails silently; the module is
  unit-testable by design but the deny-list carries no version or coverage
  marker.
