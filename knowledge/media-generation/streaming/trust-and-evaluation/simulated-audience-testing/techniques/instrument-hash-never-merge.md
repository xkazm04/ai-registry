---
layer: technique
type: technique
subject: simulated-audience-testing
technique: instrument-hash-never-merge
status: forged
laws: [output-never-outruns-evidence]
shared_with: []
use_when: [storing and comparing results across tournaments, changing the rubric, judge, audience or situation bank, reporting a slice that had to be measured differently]
---

# Instrument hash, never merge

A tournament's number is produced by an instrument, and the instrument is
larger than it looks. It is not only the judge: it is the audience
calibration, the situation bank, the rubric, the judge model and its prompt,
and the harness code that schedules streams and turns verdicts into rates.
Change any of them and the same host, in the same configuration, can produce a
different number. Results from two instruments are two kinds of measurement,
and a table that pools them describes no instrument at all.

## Procedure

1. **Define the instrument's contents explicitly.** List every input that
   shapes a result and is not an axis of the design: calibration document,
   situation bank, rubric, judge model identifier and parameters, judge
   prompt template, scoring code — and the host's own held-constant inputs,
   its persona documents, enabled rules, moderation lists and format tables.
   A host whose rules were edited between two batches is two hosts, and its
   results are two series.
2. **Hash them together** into one short identifier, computed from the
   contents rather than from version labels someone has to remember to bump.
   Normalise before hashing (line endings, encoding) so the same content
   hashes the same on every machine, and record the per-file digests beside
   the combined one so a changed hash can be explained. Where a component
   cannot be hashed from content — harness logic spread across code — a
   version constant is the fallback, and it is the instrument's weakest
   link: a verdict-changing edit that forgets to bump it merges two
   instruments silently.
3. **Split the hash into a base and an axis part when an axis is a
   document.** When one design axis is itself a file — a tone or persona
   variant — the base hash covers everything else and is shared by the whole
   tournament, and each run's full hash adds the axis file. Comparisons
   across the axis are made within one base hash.
4. **Let an optional component join the hash only when present**, so adding
   a new optional input leaves every existing hash, and every existing
   series, unchanged.
5. **Stamp the hash on every run record** at the moment the run is created,
   alongside the configuration under test and the seed.
6. **Refuse to aggregate across hashes.** The reader that builds summary
   tables groups by hash first and errors, rather than warns, when asked to
   pool two.
7. **Report off-instrument slices beside, never inside.** When part of the
   design had to be measured differently — the strongest tier as host,
   judged by a different model; a later re-run with a revised rubric — it
   gets its own column or table, labelled with its instrument and the reason,
   and no ranking crosses it.

## What counts as an instrument change

Anything that could move a verdict without the host changing: a rubric row
reworded, a situation added, an archetype's proportion adjusted, the judge
upgraded, a timeout raised so that previously pending runs now finish,
scoring code that reclassifies an outcome. A fix to the instrument is still a
change to it, and the fixed instrument's results begin a new series.

What does not count: the design's axes (host tier, segment, room size) and
the seed. Varying them is the point; they are recorded on every run, and an
axis that is a document is handled by the base-and-axis split above.

## Decision rules

- **When a rubric fix makes old results look wrong, re-judge the old
  transcripts under the new instrument; never edit old verdicts in place.**
  The transcripts are the durable artifact; verdicts are reproducible from
  them.
- **When a comparison across instruments is unavoidable, compare the
  direction within each instrument, never the levels across them.** "Tier B
  beat tier A under both judges" is a finding; "tier C scored higher than tier
  B" across judges is not.
- **When a headline figure is quoted outside the report, quote its hash and
  n with it.** A number that has left its table has left its instrument too
  (law: [output-never-outruns-evidence](../../../../_laws.md#output-never-outruns-evidence)).
- **When the hash changes mid-tournament, the tournament splits.** Runs before
  and after are two tournaments, and the incomplete one is either completed
  under its own hash or discarded.

## Failure modes

The **silent judge upgrade**: the provider updates the model behind a stable
name, and next month's tournament looks like a regression or a breakthrough.
Pin versions wherever the provider allows it, and include the resolved
version in the hash. The **helpful merge**: a slice measured with a different
judge is folded into the main table because it fills an empty cell, and its
higher score is read as the best configuration. The **mutable rubric**: rubric
rows edited between batches of one tournament, so early and late runs answer
different questions.

## When not to use it

During rubric development, while the instrument is deliberately being
changed run by run, hashing every variant is noise. Hash from the first
tournament whose results anyone will compare or act on.
