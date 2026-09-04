---
layer: technique
type: technique
subject: generated-workflow-candidates
technique: template-filling-with-provenance
status: forged
laws: [derivation-names-recomputation]
shared_with: []
use_when: [writing the step that turns a template and a statistics file into a candidate, deciding what a generated configuration should record about its own origin, adding a template that does not fit every dataset]
---

# Template filling with provenance

A template is a complete, runnable package whose data-dependent values are
placeholders. Generation copies the template to a fresh directory, computes
each placeholder's value from the statistics, and writes the value in. This
technique is about the part of that step that gets skipped: the record of
what was written, where, and from what.

## The fill is a function of the statistics, and it is logged

For each template, the generator defines one function from the statistics
file to a mapping of *configuration file* to *placeholder* to *value*. Nothing
else may write into a candidate's configuration. The function reads the
summary tier for dataset-wide values (the patch size from the median shape,
the normalization from the intensity percentiles, the class count from the
label set) and the per-case tier where a per-sample fact matters, and it
returns the mapping rather than editing files, so that the mapping exists as
data before any file is touched.

Export then does two things in order: it writes the mapping into the copied
configuration files, and it writes the mapping itself — the **fill record** —
beside the candidate, keyed by configuration file. The fill record is the
candidate's account of its own origin. A reviewer who opens a generated
package and finds a learning rate, a patch size and a resampling target
cannot otherwise tell which of them the template's author wrote and which
the generator chose; with the record they can, and for each generated value
they can find the statistic it was derived from, because the fill function is
the derivation and the record names it
(`../../../../_laws.md#derivation-names-recomputation`). A value that was
computed and written but not recorded is, to every later reader, a value the
author typed.

The record is per configuration file because a candidate has several — a
training configuration, an inference configuration, a metadata file — and
the same placeholder may be filled in more than one. A flat record loses that
and a reviewer looking at the inference configuration cannot tell whether the
generator touched it.

## Pre-filled templates are legitimate

The base behaviour of the fill function is to return **nothing**: a template
with no placeholders is copied verbatim and its fill record is empty. That is
not a degenerate case to warn about. A template author who has decided that
their recipe's values do not depend on the data — a fixed-resolution
architecture, a recipe validated on one modality — has made a claim the empty
record states honestly, and the candidate is exactly as runnable as a filled
one. The generator must not require every template to define a fill, and it
must not treat an empty record as a failure.

The distinction that matters is between *empty because nothing was filled*
and *absent because the fill was never attempted*. The first is a candidate
with a record that says so; the second is a candidate whose origin is
unknown, and the generator should never leave one behind.

## A template may decline a dataset

Not every recipe fits every dataset. A template written for volumetric input
cannot fill a patch size from a two-dimensional shape; a recipe with a fixed
class head cannot take a label set larger than its head. The naive generator
fills anyway, and the candidate fails hours later, in training, with an
error about tensor shapes that no one traces back to a generation decision.

The rule: **a template declares the conditions under which it applies, the
generator evaluates them against the statistics before copying anything, and
a template that does not apply is skipped with the skip recorded**. The
record names the template and the condition it failed, so the operator who
expected four candidates and got three does not have to guess which one is
missing or why. The condition is evaluated on the statistics, not on the
data, for the same reason the fill is: the statistics are the file the
decision can be audited from.

## Templates are versioned inputs

The template a candidate was generated from is part of the candidate's
provenance, and a template set that is fetched at generation time must be
fetched **by pinned identity** — a release tag and a content hash — and the
identity recorded with the candidate. A generator that fetches "the latest
templates" produces candidates whose origin changes under them; two runs a
week apart generate from different recipes and nothing in either candidate
says so. Pinning is the generator's obligation; verifying the pinned bytes is
the signed-artifact doctrine's, and this technique borrows the pin without
owning the verification.

## Decision rules

- **One fill function per template, from statistics to a
  file-to-placeholder-to-value mapping.** No other code writes into a
  generated configuration.
- **The mapping is written beside the candidate as a fill record, keyed by
  configuration file**, at the moment the files are written.
- **A template with no placeholders returns an empty mapping** and is a
  first-class template. Empty and absent are distinguished.
- **A template declares its applicability and the generator evaluates it
  on the statistics before copying.** A skip is recorded with its reason.
- **The template set is fetched by pinned identity and the identity travels
  with the candidate.**
- **Generated values are never edited in place by later stages.** A stage
  that needs a different value produces a new candidate through the same
  fill, so the record stays true.

## When not to use this

A system with one recipe and one dataset, where the author fills the
template by hand and keeps the result, is scaffolding with a provenance
stamp, and the neighbouring subject owns it. The fill record earns its place
the moment a program chooses the values, because at that moment there is no
longer an author to ask.
