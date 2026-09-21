---
layer: technique
type: technique
subject: responsive-search-ad-craft
technique: over-limit-omitted-not-truncated
status: forged
laws: [a-gate-before-money-and-copy]
shared_with: []
use_when: [building an import sheet or bulk export from an ad set, deciding what to do with an over-limit asset, reviewing a generator's clamp step]
---

# Over-limit: omitted, not truncated

An asset over the platform's character limit does not go into the import sheet at all.
It is not cut at the limit and shipped. A truncated headline is copy nobody approved -
a word in half, a call to action missing its verb, a benefit that now claims something
else - entering an auction where the writer will not see it for weeks, under a rating
that says the set is fine. An omitted asset leaves an empty slot, which the platform
accepts, and a red flag in the editor, which the writer sees.

This is the export-time half of a rule whose generation-time half is the self-correction
pass in `platform-limits-stay-slightly-under`: the generator gets one chance to
shorten, then the asset is dropped. Neither half truncates.

## Why the two paths must agree

A workspace typically has two exports - one per platform - and each has its own slot
builder. When one omits and the other truncates, the same ad set ships clean on one
platform and mangled on the other, and the writer, who reviewed one preview, does not
know. The rule is stated once, applied identically in every export path, and the
rationale is written where the filter lives so a later maintainer does not "fix" the
omission into a truncation.

## Procedure

1. **Trim, then filter, then cap.** Trim whitespace; drop empty assets; drop assets
   longer than the limit; take the first *n* that remain, where *n* is the platform's
   slot count. Order is preserved so the writer's ordering of headlines survives.
2. **Pad the sheet to the full slot count with blank cells.** The column set is then
   always complete and mappable; a sheet whose width varies with the asset count
   breaks the import mapping.
3. **Keep each platform's limits as that platform's own constants**, cited to its
   documentation, so a change on one platform touches one exporter.
4. **Flag the omission before the export runs.** The row that will be dropped is
   already red in the editor; the export dialog says how many assets it will omit.
   Silence at export is the failure the rule prevents.
5. **At generation time, clamp only after self-correction, and log what was
   clamped.** A generator wrapper that clamps silently hides a model that cannot hold
   the limit; the clamp log is the signal that the tier is wrong for the task.

## Decision rules

- **When an asset is over the limit at export, omit it and say so, because** a
  truncated asset is unapproved copy in a live auction.
- **When omission drops the set below the platform's minimum (three headlines, two
  descriptions on the dominant platform), refuse the export and send the writer back
  to the set, because** a sheet that imports with too few assets fails at upload with a
  less useful message than the one the exporter can give.
- **When the two exporters disagree on the rule, align them to omission and record
  why, because** they were inconsistent once already in the tree this subject was
  reconciled against, and the more-used path was the one that had drifted.
- **When a generator's clamp fires on more than a stray asset, treat that as a model
  fitness finding, not a copy problem, because** limit compliance is a constraint the
  smaller tiers do not hold and no clamp makes their output usable.

## When NOT to use

- Do not omit at *generation* time without a self-correction pass first. The generator
  that wrote a forty-character headline can write a twenty-eight-character one with the
  same meaning; dropping it unasked throws away an angle.
- Do not apply omission to fields that are not free copy - display paths, final URLs,
  match types. Those fail validation on their own terms and an empty cell is a broken
  row, not a safe default.
- Do not let omission substitute for the editor's red flag. The rule protects the
  auction from the writer's slip; it does not excuse a surface that lets the slip go
  unmarked until export.
