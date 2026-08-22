---
layer: technique
type: technique
subject: test-harness
technique: flake-lifecycle
status: forged
stage: team
laws: [deletion-is-not-repair, count-carries-predicate, creation-names-reaper]
shared_with: []
use_when: [a test fails intermittently, quarantine has grown and nobody reviews it, deciding whether to retry or to quarantine]
---

# Flake lifecycle

A flaky test is not a state a test is in; it is a **process a test goes through**, with five
transitions and an owner at every one: detected, labelled, quarantined, fixed, released. Teams
that treat flakiness as a condition end up with two populations — tests that block and tests
everyone ignores — and the second one grows.

The rule this technique enforces at every step is
[deletion-is-not-repair](../../../../_laws.md#deletion-is-not-repair). A test failing
intermittently is reporting something true about the test, the harness, or the product.
Deleting it converts that report into silence at exactly the site where visibility existed.
Quarantine is the alternative, and quarantine only works if it is *loud*.

## Detected: by history, not by impression

"That one is flaky" is an impression, and impressions are wrong in both directions — they miss
tests that fail rarely on the branch nobody watches, and they condemn tests that were failing
for a real reason. Detection is a query over run history, not a memory.

The usable signal is a **transition count**: how often a test's outcome changed between
consecutive runs *on the same code*, over a window. It is preferable to a raw failure rate
because a consistently failing test is broken rather than flaky, and the two need opposite
responses. Same-code is the load-bearing qualifier: outcomes compared across different trees
measure the product's churn, not the test's stability.

Per [count-carries-predicate](../../../../_laws.md#count-carries-predicate), a flakiness figure
travels with its window, its branch filter, and its run count. "12% flaky" is not a finding;
"changed outcome in 12 of 100 runs on the protected branch over 14 days" is — and the second
is the one that supports a decision, because it exposes the case of nine runs where the
percentage means nothing.

Detection needs history to exist, which means test results have to be **retained across runs
and keyed by a stable test identity**. That identity survives renames and reordering or the
history resets whenever someone tidies a file, per
[identity-survives-reuse](../../../../_laws.md#identity-survives-reuse). Without retained,
stably-keyed results, none of this technique is available, and building that is the first step.

## Labelled: automatic, visible, reversible

Crossing the threshold applies a label. Three properties:

- **The label is applied by the system**, not by a person filing a ticket. A manual step here
  means the population is whatever people got round to.
- **The label is visible where the test appears** — in the run output, in the listing, in the
  dashboard — not only in a separate registry.
- **The label is removed automatically** when the history stops supporting it. This is the half
  everyone forgets, and its absence is why flake registries only ever grow. A test that has
  been stable for the whole window is no longer flaky and must stop being described as one, or
  the label stops meaning anything.

Labelling is not quarantining. A labelled test still blocks. The label is information; the next
step is a decision.

## Quarantined: a deliberate, owned, expiring decision

Quarantine is a human decision with three mandatory attributes, per
[creation-names-reaper](../../../../_laws.md#creation-names-reaper):

- **An owner.** A named person, not a team. Unowned quarantine is never reviewed.
- **An entry date and an expiry.** The expiry is what makes quarantine debt rather than
  amnesty. On expiry the item is escalated, not silently extended.
- **A reason.** Which of the three causes is suspected — the test, the harness, or the product
  — because the third is a product defect wearing a test's clothing and must escalate
  immediately.

Two forms, and they are not interchangeable:

| form | behaviour | use when |
|---|---|---|
| **muted** | still runs, result recorded, does not block | almost always — the data is what fixes it |
| **skipped** | does not run at all | the test is destructive, hangs, or costs real money on failure |

**Prefer muted.** A muted test keeps producing the history that will eventually diagnose it; a
skipped test produces nothing and is indistinguishable from a deleted one after a month. Skip
only for a stated reason recorded with the entry.

An agent must never quarantine a test as part of making a build green. That is the
build-fixing shortcut in its most respectable disguise, and it belongs on the list of changes
requiring a human author.

## The register, and the two numbers that keep it honest

Quarantine lives in a register — one entry per test, with owner, dates, reason, form, and
link to the failure evidence. Two figures are published wherever the suite's health is
published:

- **Size**, with its trend. A register growing monotonically is deletion with extra steps and
  a slower fuse.
- **Age of the oldest entry.** More diagnostic than size: a register of 40 entries none older
  than a fortnight is a working process; a register of 6 with one 14 months old is a broken
  one.

Set a ceiling on the register and treat breaching it as a stop-the-line event for the suite.
Without a ceiling the register absorbs every hard problem and the suite quietly stops
certifying anything.

## Retry: measurement, not masking

An automatic retry that hides the first failure destroys the detection signal this whole
technique runs on. A retry that **records** the first failure and then salvages the run
preserves it. The distinction is the entire difference between a harness that measures its own
flakiness and one that has arranged never to find out.

- Retries are bounded, and the bound is small.
- Every retry is recorded with its original failure, and the retry count is a published health
  metric of the harness with its predicate attached.
- A test that only ever passes on retry is flaky at a rate of one hundred percent and should
  have been labelled by the detector. If it was not, the detector's window is wrong.

## Released: how a test leaves

A quarantined test returns to blocking after it has been observed stable — the same window the
detector uses, not a single green run. One green run of an intermittent test proves nothing,
and releasing on it is how the same test enters quarantine three times a year.

Record the exit: what the cause turned out to be. Over a year that record is the most valuable
artifact this technique produces, because flakiness concentrates — a handful of causes
(shared state between tests, time and timezone assumptions, ordering dependence, real
concurrency defects in the product) generate most of it, and the register is what reveals
which one is yours.

## Decision rules

- Detect from retained, stably-keyed history using outcome transitions on the same code; never
  from impression.
- Every flakiness figure carries its window, branch filter, and run count.
- Labelling is automatic, visible, and automatically reversed; labelling is not quarantining.
- Quarantine requires an owner, an entry date, an expiry, and a suspected cause; expiry
  escalates.
- Prefer muted over skipped; skip only for a recorded reason.
- An agent never quarantines to make a build green.
- Publish register size with its trend and the age of the oldest entry; set a ceiling and stop
  the line at it.
- Retries are bounded and always record the original failure; the retry rate is a published
  harness metric.
- Release only after a stable window, and record what the cause turned out to be.
