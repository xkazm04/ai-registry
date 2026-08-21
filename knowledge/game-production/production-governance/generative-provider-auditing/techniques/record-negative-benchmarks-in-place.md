---
layer: technique
type: technique
subject: generative-provider-auditing
technique: record-negative-benchmarks-in-place
status: forged
laws: [a-number-carries-its-unit-and-basis, unmeasured-is-not-a-pass]
shared_with: []
use_when: [a model variant was evaluated and rejected, writing up a benchmark result, a rejected option keeps getting re-proposed]
---

# Record negative benchmarks in place

## The concern

Benchmarking produces two kinds of result and organisations reliably keep only one. The
winner becomes the pin, which lives in code. The loser becomes a paragraph in a document,
a message in a channel, or nothing — and six months later someone opens the integration,
sees the rejected variant advertised by the provider, and spends the same money and the
same week to learn the same thing.

The waste is not the re-test. The waste is that the second person had no way to know a
first test existed. The provider's own listing is the surface they read; your write-up is
not. So the rejection has to be written **on the surface they read**.

## Procedure

1. **Write the rejection beside the pin it lost to**, in the same declaration, in the
   code path that selects models. Adjacent, not linked; a link to a document is a
   document nobody opens.
2. **State the verdict as a verdict**: this variant was evaluated for these classes and
   is not used. Not "may be worth trying", not a commented-out option — an explicit,
   dated rejection.
3. **Attach the measurements that produced it**, per class, each with its unit and its
   basis: the budget it overshot and by how much, the defect or artifact rate and against
   which baseline, the task set the numbers came from.
4. **Name the date and the harness that produced the numbers**, so the verdict is
   re-runnable rather than merely asserted, and so a reader can tell whether the
   rejection is still binding or has aged past a provider revision.
5. **State the condition that would reopen it** — a new version, a budget change, a class
   that did not exist at the time. A rejection with no reopening condition invites
   someone to reopen it on vibes.

## Decision rules

- **When a rejection is class-specific, say so.** A variant that overshoots the budget
  for a background prop may be exactly right for a hero object. "Rejected" without a
  class is a false generalisation that costs you a good option.
- **When the numbers are close, record the margin anyway.** A narrow loss is different
  information from a rout: it tells the next reader that a provider revision could flip
  the decision, and that re-testing on a new version is worthwhile rather than wasteful.
- **When you cannot express the reason as a measurement, the rejection is weak** and
  should be labelled as a preference rather than dressed as evidence. Unmeasured is not
  a verdict; it is an opinion with a date.
- **When the rejected arm is the provider's own headline recommendation**, say that
  explicitly in the note. That is precisely the case where the next reader's instinct
  will fight the record, and the note has to be strong enough to survive the fight.
- **When a rejection ages past the pin's re-benchmark cadence**, it becomes evidence
  about the past. Keep it, mark it stale, and do not delete it — a stale rejection still
  tells you what to measure.

## Correct a wrong reason where the wrong reason was written

A standing rejection's *reason* can be wrong even when its *verdict* is right. Someone
re-derives the numbers, finds the stated mechanism was never the operative one, and now
has two facts: the option is still rejected, and the explanation everybody has been
repeating is unsound.

Write the correction **at the wrong claim** — marked as a correction, dated, with the new
measurement and the narrower reason that survives. Do not silently rewrite the sentence.
The fact that the original reasoning was unsound is itself load-bearing: it is what stops
the same reasoning from being reused in the next decision, and it is invisible once the
sentence has been quietly repaired.

## Where "in place" actually is

The test is behavioural, not architectural: *where will the next person be standing when
they consider this option?* For a model choice, that is the declaration listing the
available models. For an input-preparation setting, it is the function that applies it.
For a licence restriction, it is the capability declaration. Put the note there. If two
places qualify, put the numbers in one and a one-line pointer in the other — but the
numbers go where the decision is made, and the numbers are the part that persuades.

## When NOT to use this

- **For exploratory results with no protocol behind them.** Recording an uncontrolled
  impression as a rejection is worse than recording nothing: it blocks a good option with
  false authority.
- **Where the rejection is a business fact rather than a technical one** — a contract
  term, a licence, a procurement decision. Those belong in the membership declaration
  with their reason, not in the benchmark record; they will outlive any measurement.
- **When the list of rejected variants would swamp the file.** Past roughly a handful,
  keep the two or three that people actually keep proposing in place and move the rest to
  a benchmark record that the in-place note names. The purpose is to stop the re-test that
  will otherwise happen — not to archive everything.
