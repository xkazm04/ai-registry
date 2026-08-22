---
layer: application
type: application
subject: hash-pinned-translation-pipeline
technique: drift-classification
stack: node
status: forged
verified_on: 2026-08-22
verified_against: node@22
---

# Drift classification in a plain Node detector

A server-rendered web application ships a 116-topic user guide in thirteen
non-English locales, translated one locale per model subagent in a single
big-bang pass. The freshness detector
is `scripts/i18n/check-guide-translations.mjs` — a dependency-free Node script
that reads the English source, computes a content hash per topic, and compares
it against the hash each locale recorded at translation time in
`src/data/guide/locales/<lang>/_meta.json`.

## The four buckets, verbatim

The verdict vocabulary is the technique's, materialized as a per-locale object
at `check-guide-translations.mjs:132`:

```js
const localeReport = { stale: [], missing: [], orphaned: [], fresh: [] };
```

Each bucket is filled by a rule that is exactly one comparison
(`check-guide-translations.mjs:134-159`):

- **missing** — `if (!localeMeta)`: the English source defines the topic and
  the locale's record set does not mention it (`:138-140`).
- **stale** — `else if (localeMeta.translatedFromHash !== englishHash)`
  (`:141-148`). The finding is a work order, not a flag: it carries the topic
  id, `currentHash`, `translatedHash` and `translatedAt`, which is precisely
  the both-hashes-plus-date shape the technique calls for.
- **fresh** — the remaining `else` (`:150`).
- **orphaned** — a second pass over the locale's own record keys:
  `for (const topicId of Object.keys(meta.topics ?? {})) if
  (!englishHashes[topicId])` (`:154-159`), under the comment *"Orphaned: locale
  has a translation for a topic that no longer exists."*

The scope decision sits one screen above, stated as a comment at
`check-guide-translations.mjs:119` — *"Combined hash so a title/description
change also triggers re-translation"* — and implemented at `:120` as
`JSON.stringify({ title, description, body })`. Titles and descriptions are
translated, so they are in the digest: the technique's rule applied correctly.

The report groups by locale before topic (`:161`, `:168-179`) and truncates
each bucket's listing at five ids with a `, ...` suffix — the axis work is
assigned along is the axis the report is sorted along.

## The gate, and the wire that was never run

`check-guide-translations.mjs:184` is the strict mode:

```js
if (flags.strict && totalDrift > 0) process.exit(1);
```

The header at `:13` describes `--strict` as *"exit 1 if any drift exists
(release gate)"*. **Nothing invokes it.** The repository's own scan records the
finding: `ci.yml` runs only `check:i18n-coverage` and `check:i18n-encoding`, as
does the auto-installed pre-push hook, and neither the drift detector's strict
mode nor the parity audit has any caller at all — `guide-i18n-audit.mjs` does
not even have an npm script
(`docs/harness/ambiguity-ui-scan-2026-07-16/localized-guide-content.md:19`).
The gate is written, correct, exit-code ready, and has never once decided
anything. This is the technique's enforcement clause failing at the last mile,
and it is the same shape as the never-fired documentation hook the stewardship
bundle autopsies.

## Deviation: orphans do not count as drift

`totalDrift++` fires in the missing branch (`:140`) and the stale branch
(`:148`) and **not** in the orphan pass (`:154-159`). Since the gate's
predicate is `totalDrift > 0` (`:184`), a locale whose only problem is
orphaned topics **passes the release gate**. Meanwhile the human-readable
summary computes `issues = r.stale.length + r.missing.length +
r.orphaned.length` (`:169`) and prints orphans among them. Two numbers on the
same screen, two different predicates, one of them named "Total drift"
(`:181`).

That is the technique's severity warning arriving in the form the technique
predicts — orphans treated as informational accumulate forever — and it is also
a [count-carries-predicate](../../../_laws.md#count-carries-predicate)
violation inside a single program's output. The fix is one line: make the gate
predicate a statement over the whole vocabulary rather than over a counter that
two of the four verdicts increment.

## Deviation: unreadable records are spelled as empty ones

`readMeta` (`:88-96`) returns `{ topics: {} }` in two distinct situations: the
`_meta.json` file does not exist (`:90`), and it exists but fails to parse
(`:91-95`, a bare `catch` that discards the error). Both then classify every
topic in that locale as **missing**.

The direction is safe — over-reporting work rather than declaring a corpus
fresh — but the two states are spelled identically and neither is
distinguishable from "this locale is genuinely unpinned"
([failure-not-empty-success](../../../_laws.md#failure-not-empty-success)). A
corrupted provenance file, a locale directory renamed by a refactor, and a
locale nobody has translated yet all produce the same report. The technique's
instrument-assertion clause wants three separate exit conditions here.

A related gap: `fresh` means *a record exists whose hash matches*. The detector
never opens the locale's `topics.ts` or `content/<category>.ts` at all, so a
locale holding a `_meta.json` entry and no actual translated file reports
fresh. The gate is reading the ledger, not the shipped artifact.

## The measured cost of unpinned units

Running the detector today yields **767 issues — 59 per locale, 19 "missing"
and 40 "stale"** (`localized-guide-content.md:9`). But the shape audit,
`scripts/guide-i18n-audit.mjs`, reports every one of the thirteen locales at
116/116 titles and 116/116 bodies. The 19 "missing" topics are **fully
translated in every locale**; they were simply never recorded — `_meta.json`
holds 97 entries against 116 topics, because the batch that added the newer
translations skipped the bookkeeping step.

So 247 bookkeeping gaps (19 × 13) sit undifferentiated among 520 potentially
genuine staleness findings (40 × 13), and the scan's own conclusion is that the
detector *"is now all noise"* (`:11`). This is the technique's rule about the
unit with no record, priced: classifying an unpinned unit as **missing** was
correct — the action really is "produce and record a translation" — but folding
it into the same bucket with no sub-label destroyed the report's usefulness at
a ratio of roughly one part bookkeeping to two parts real work. Report it as
*"of 19 missing, 19 are present but unpinned"* and the same run becomes two
actionable queues.

The root cause is the technique's write-together rule broken exactly once
(`localized-guide-content.md:10`): the translations landed, the records did
not, and *"nothing re-stamps the ledger."*

## What "fresh" is worth here

One caveat governs every count above. The body extractor these verdicts rest on
(`check-guide-translations.mjs:59`) closes its non-greedy match at an escaped
code span followed by a comma, and **11 of the 116 English bodies are therefore
hashed only up to a prefix** — measured 2026-08-22; `creating-a-new-agent` is
hashed over 110 of 1,778 raw source characters. For those eleven topics, an
English edit inside the untracked remainder never moves the recorded hash, so
the unit lands in the `fresh` bucket permanently.

That does not weaken the four-verdict vocabulary; it undermines one of its
inputs. But it is worth stating in this document because it changes how the
report should be read: `fresh` here means *"the tracked prefix of this unit
matches"*, which is a narrower predicate than the bucket's name implies
([count-carries-predicate](../../../_laws.md#count-carries-predicate)) and a
narrower one than any consumer of this report would assume. The parity
application carries the full measurement and the extraction-coverage fix.

## Shape and content, measured side by side

This tree happens to hold both checks as separate programs, and their outputs
are the cleanest available demonstration that they answer different questions:
`guide-i18n-audit.mjs` says 116/116 across thirteen locales; the drift detector
says 767 issues. Neither is wrong. The feature documentation states the
distinction in the repository's own words at
`docs/features/guide/localized-content.md:49` — *"key parity does **not** imply
prose freshness … shape-sync (enforced by `tsc` / key parity) does **not**
imply content-sync"* — and supplies the receipt: the English
`installing-personas` body describes a Windows-only product with a
prerequisite section, while the German and Japanese bodies still describe all
three platforms available with no prerequisite, from a translation that was
correct when it was made.

Both programs hardcode their own locale list — `check-guide-translations.mjs:30`
and `guide-i18n-audit.mjs:20`, the same thirteen codes in two different orders
— which is a second copy of a closed vocabulary
([one-authority-per-vocabulary](../../../_laws.md#one-authority-per-vocabulary))
and the reason the two reports cannot be joined by a third program without
choosing a side.
