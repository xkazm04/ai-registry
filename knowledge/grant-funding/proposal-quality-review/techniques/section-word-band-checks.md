---
layer: technique
type: technique
subject: proposal-quality-review
technique: section-word-band-checks
status: forged
laws: [the-funder-sets-the-form]
shared_with: []
use_when: [setting length checks per proposal section, review flags disagree with generation guidance about length, a new funder-family section type needs bounds]
---

# Section word-band checks

Length is the cheapest reliable proxy for a section's development state. A
needs statement of forty words is underdeveloped no matter how good the forty
words are; a narrative of two thousand words will hit a funder's hard limit
or a reviewer's patience. The technique is a per-section **band** — a minimum
and maximum word count — checked deterministically, reported with the
measured count and the band so the writer knows exactly how far off they are.

## Bands are per section type, set by the funder family

There is no universal good length. Bands derive from what each funder
family's reviewers actually read —
[the funder sets the form](../../_laws.md#the-funder-sets-the-form):

- A core narrative reads well at 400–600 words; a budget justification at
  150–300; a logic model is judged by its blocks, not its prose volume.
- Award-criteria sections for a supranational research funder (excellence,
  impact, implementation) tolerate 300–700 words each.
- Federal narrative dimensions (need, approach, capacity, evaluation) run
  slightly tighter; capacity and evaluation sections read best at 200–500.
- Arts and organizing funders read shorter still — an audience-reach or
  base-building section over 500 words is padding, and their panels know it.

Maintain the band table as data keyed by section type, apart from the check
logic, so funder- or program-specific limits can be layered on without
touching code. A section type the table does not know gets a deliberately
generous default window — flagging an unknown section's length on shape
alone produces false alarms that erode trust in every other flag.

## Two tolerances, one target

The number given to the writer or the generator ("aim for 400–600") and the
number the check enforces are related but not equal. **Enforce a band
widened beyond the stated target** — flag at perhaps 300 and 750 for a
400–600 target — so only genuinely off-length sections fire. A check that
flags 601 words against a 600-word target is a nag; writers learn to dismiss
it, and the dismissal generalizes to the flags that matter. The stated target
steers; the widened band catches.

The corollary binds every surface that measures length: the generation-time
review, any separate proofreading pass, and the submission gate must agree on
the bands per section type, ideally by reading the same table. Two
independently maintained tables will drift, and the drift manifests as a
section that passes one surface and fails another — measured in one real
case as a bloated impact section (ideal 300–700) sailing through a
proofreader whose generic 80–1000 window predated the per-section table.

## Severity and edges

- **Empty is not "short."** Zero words is a missing required section — a
  blocker with its own message ("funders require it") — never the bottom of
  the short-warning range.
- **Short and long are quality-severity warnings**, not blockers: length is
  a degree, and hard funder limits are enforced at submission against the
  funder's own stated cap, not here.
- Report the measurement in the finding: "812 words (band 300–750)" is
  actionable; "too long" is not.
- Word counting must be one shared function across every surface. Two
  counters that disagree by hyphenation or whitespace rules recreate the
  drift problem at a lower level.

## When not to use it

Do not band structured sections whose quality lives in completeness rather
than volume — a logic model is checked for its four blocks (inputs,
activities, outputs, outcomes) with only a sanity window around the whole.
Do not use bands as a proxy for substance: a section can sit dead-center in
its band and say nothing, which is what required-concept checks and the
human tier are for. And never auto-truncate or auto-pad to satisfy a band —
the band is a reviewer's flag, not a transformation.
