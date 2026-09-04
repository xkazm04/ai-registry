---
layer: technique
type: technique
subject: generated-workflow-candidates
technique: two-tier-data-statistics
status: forged
laws: [one-authority-per-vocabulary, unknown-is-not-a-value]
shared_with: []
use_when: [designing the analysis stage a generator reads before it decides anything, choosing the keys a statistics file exposes to templates, adding a new measurement to an existing analyzer]
---

# Two-tier data statistics

A generator decides from measurements, and the measurements have to be a
file — something a reviewer can open when a candidate looks wrong and a
template can read without touching the data. This technique states the shape
of that file: two tiers, computed by two kinds of analyzer, keyed by one
contract.

## The two tiers

The **per-case tier** holds one record per sample: its spatial shape, its
spacing, its intensity range and distribution, its label set and the
per-label voxel or pixel counts, whatever the recipe family needs to decide
per-sample facts. The analyzer that produces it is **itself a transform over
one sample** — the same kind of callable that a preprocessing pipeline is
made of, taking one loaded case and returning that case with a statistics
entry attached. Making it a transform is not a stylistic preference. It means
the analysis stage reuses the same loading, the same caching, the same
multi-process data pipeline as training, so the shape and spacing it measures
are the shape and spacing the model will see, and the per-case work
parallelizes over the dataset for free.

The **summary tier** holds one record for the dataset: medians, percentiles,
minima and maxima, class frequencies, computed over the list of per-case
records. The analyzer that produces it is a second kind of callable — one
that takes the list of case outputs, not a sample — and it is cheap, because
its input is a few numbers per case rather than the case.

The split is what makes the file reviewable. A summary median that looks
wrong is traced to the cases that produced it by reading the per-case tier,
not by re-running analysis; and a template that needs a per-case fact — the
largest single label region, say — reads it from the tier that has it rather
than from a summary that averaged it away. The summary tier is *derived* from
the per-case tier and the derivation is the summary analyzer, so a
regenerated summary is a recomputation with a named path, never a second
hand-maintained opinion.

## The keys are a contract

Both tiers are dictionaries, and the temptation is to let each analyzer emit
whatever keys it likes. Resist it. Every key a template may read is a member
of a **closed enumeration** owned in one place, with the summary keys, the
per-case keys, the image-statistic keys and the label-statistic keys as
distinct enumerations that compose. An analyzer writes under an enumeration
member; a template reads under the same member; adding a measurement means
adding a member, and the enumeration is the one authority every writer and
reader derives from (`../../../../_laws.md#one-authority-per-vocabulary`).
Two hand-maintained spellings of "median spacing" — one in the analyzer, one
in the template — drift the first time someone renames either, and the drift
is silent because a dictionary lookup on the wrong key does not fail; it
returns nothing, and the next rule is about what happens then.

## An unmeasured field is a refusal, not a default

When a template reads a key the statistics file does not carry, the wrong
behaviour is the one every dictionary API makes easiest: fall back to a
default. A default patch size written where a measured one was expected is a
value nobody chose, unrecorded in any fill log, and indistinguishable from a
measurement in the candidate that carries it
(`../../../../_laws.md#unknown-is-not-a-value`). The rule: a template's read
of a statistic is strict, and a missing key stops generation for that
template with the key named. If a template genuinely does not need a
measurement, it does not read it; if it needs one the analyzer does not
produce, the analyzer is extended, not the template's fallback.

The same rule governs the analyzer's own inputs. A dataset whose labels are
in a layout the analyzer does not expect — multi-channel where a single index
map was assumed, or the reverse — must be refused or converted *loudly*, with
the conversion recorded in the per-case tier. A silent nearest-neighbour
resize applied because two shapes differed by less than a tolerance is a
measurement of data that was never there; it may be the right engineering
choice, and it still belongs in the record.

## Decision rules

- **When a measurement is a property of one sample, compute it in a
  per-case analyzer that is a transform**, so it runs through the training
  data pipeline and parallelizes with it.
- **When a measurement is a property of the dataset, compute it in a summary
  analyzer over the per-case list**, never by a second pass over the data.
- **Every key in either tier is an enumeration member**, and the enumeration
  is the only spelling any analyzer or template uses.
- **A template's read of a statistic is strict.** A missing key names itself
  and stops that template; it never silently defaults.
- **Any conversion the analyzer applies to make a case measurable is
  recorded in that case's record**, so the statistics say what was measured.
- **The statistics file states what it does not cover** — the modalities,
  label layouts and dimensionalities the analyzer refuses — in the analyzer's
  own documentation, in one place, not scattered across the sites that
  refuse.

## When not to use this

A single recipe with no data-dependent values needs no statistics stage; it
is a pre-filled template and should say so rather than run an analysis whose
output nothing reads. And a dataset small enough that the generator can
afford to read it directly still benefits from the file — not for speed, but
because the file is the audit trail, and there is no size below which
"why did it choose that" stops being asked.
