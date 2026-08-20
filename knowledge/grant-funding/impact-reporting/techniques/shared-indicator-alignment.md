---
layer: technique
type: technique
subject: impact-reporting
technique: shared-indicator-alignment
status: forged
laws: [honest-null-over-forced-guess, provenance-per-field, the-funder-sets-the-form]
shared_with: []
use_when: [choosing outcome indicators for a new award, designing an outcomes schema for reports that must aggregate across funders, deciding whether a bespoke metric should map to a sector-standard indicator]
---

# Shared indicator alignment

Every report needs outcome figures, and the naive path is to invent a fresh
metric per grant — whatever the program officer asked about, phrased however
the writer phrased it that day. The result is an organization whose own
outcomes cannot be added up across grants, and whose funders cannot roll its
results into a portfolio view. The technique: **choose outcome indicators
once, at award time, from a shared sector indicator taxonomy where one
faithfully fits — and record the mapping as part of the indicator's
provenance.** Sector bodies maintain indicator libraries and impact data
standards precisely so that "people trained" means the same thing in two
organizations' reports; aligning to them is what makes an outcome figure
legible beyond the report it first appeared in.

## Why award time, not report time

An indicator selected while drafting a report is chosen to flatter the data
already collected. An indicator selected at award time — when the grant
agreement is signed and collection has not begun — disciplines the data
collection itself: intake forms, attendance logs and follow-up surveys get
designed to feed the declared indicators, so the report-time question becomes
"read the ledger", not "what can we claim from what we happen to have". The
alignment decision is a measurement-design decision wearing a reporting hat,
and it is cheap exactly once.

## The mapping rules

1. **Map faithfully or not at all.** A program outcome that no standard
   indicator genuinely describes gets a bespoke indicator, declared as
   bespoke — never shoehorned into the nearest-sounding standard entry. A
   mis-mapped indicator poisons every aggregate it enters, which is
   [an honest null beating a forced guess](../../_laws.md#honest-null-over-forced-guess)
   applied to taxonomy: "unmapped, ours" is a truthful state; a strained
   mapping is a quiet lie that compounds downstream.
2. **The mapping is provenance.** Each indicator carries the identifier and
   version of the taxonomy entry it maps to (or the explicit bespoke marker),
   alongside the data source that feeds it —
   [provenance per field](../../_laws.md#provenance-per-field) extended one
   level up, from the value to the definition of the value. Taxonomies
   revise; an indicator that names its version can survive a revision, one
   that doesn't silently changes meaning.
3. **A funder's required indicator set wins.** When the award prescribes its
   own indicators or its own framework, report in theirs —
   [the funder sets the form](../../_laws.md#the-funder-sets-the-form) holds
   for measurement as for prose. Keep the internal mapping anyway, so the
   same underlying figure can feed both the funder's frame and the org's own
   roll-up without being counted twice or defined twice.
4. **The taxonomy is a translation layer, not the theory.** The organization's
   own outcome chain — what it believes changes, for whom, by what mechanism —
   stays primary. Alignment translates that chain into shared vocabulary; it
   must never replace it, or the org ends up measuring what the taxonomy
   makes convenient instead of what the program actually does.

## When not to use it

A small program with one funder and no aggregation need gains little from the
mapping overhead — declare clean bespoke indicators and move on. Skip
alignment when no maintained taxonomy covers the domain: a forced fit is
worse than none (rule 1 is the whole technique). And never adopt a standard
as costume — an indicator mapped to a shared library but fed by no real
collection instrument is a fabrication risk dressed in rigor.
