---
layer: technique
type: technique
subject: subsystem-review-doctrine
technique: regression-diff-new-persisting-resolved
status: forged
laws: [unmeasured-is-not-a-pass, a-verdict-is-bound-to-its-content]
shared_with: []
use_when: [reporting review results across repeated runs, a finding list is too long to read whole, showing whether quality is improving]
---

# Regression diff: new, persisting, resolved

## The concern

One review produces a list. Nobody outside the review can act on a list of four hundred
findings; they can act on *direction*. Two reviews produce direction, but only if the second
is diffed against the first — and the diff is where the honesty is won or lost, because every
tempting shortcut in it flatters the result.

## The three buckets

Compare the current run's findings against the previous run's, restricted to the scope that
was actually re-reviewed:

- **New** — present now, absent last time. *The change that just landed introduced this.* New
  findings are the ones that belong in a merge conversation; they are attributable to recent
  work and cheapest to fix while the author still has the context.
- **Persisting** — present in both. *The team saw this and did not act.* Persisting is not a
  neutral bucket. It is either accepted debt, which should be recorded as accepted with a
  reason, or it is a finding nobody read. Persisting counts that only rise are the clearest
  available signal that review output is not reaching anyone.
- **Resolved** — present last time, absent now. *Work landed.* This is the bucket that makes
  the report worth producing, and the one that is easiest to inflate.

Report each bucket broken down by severity, not just by count. Twelve new low findings and
one new critical are not comparable, and a single total hides which happened.

## The two disciplines that keep it honest

**Line-insensitive identity.** Match findings between runs on a fingerprint that excludes the
line number — the subsystem, the file, and a normalised form of the description. Otherwise a
finding that merely shifted down twelve lines when someone added an import reports as one
resolved plus one new, and every refactor produces a report full of movement with nothing
having changed. Normalise the description (case-folded, punctuation stripped, truncated) so
that a reworded finding about the same defect still matches itself. Keep the line number in
the finding for navigation; keep it out of the identity.

*Within* a single run the opposite applies: deduplicating findings that several passes all
reported should include the line, because two genuinely distinct instances of the same defect
in one file must not collapse into one. When they do collapse, keep the higher severity — a
merge that silently downgrades is a merge that hides the reason to act.

**Scope restriction.** When only some subsystems were re-reviewed, restrict the comparison to
those subsystems. Otherwise every finding in every untouched subsystem is absent from the
current run and reports as resolved — the most flattering possible false result, produced by
doing nothing. This is the single most important correctness rule in the diff, and it is a
one-line filter that is very easy to forget.

## Resolved is not one thing

A finding that disappeared because the defect was **fixed** and one that disappeared because
the code was **deleted** are different events and must not be counted together. Deletion
resolves the finding and may have removed a feature, moved the defect somewhere the review no
longer looks, or been an unrelated refactor. A resolved-by-deletion count that quietly inflates
the improvement number is exactly the kind of lie a dashboard tells for months.

The cheap discrimination: at diff time, check whether the file a resolved finding pointed at
still exists and still contains a recognisable form of the construct. Absent file, or absent
construct, marks the finding **resolved-by-deletion** — reported in its own line, never folded
into the fixed count. Where attribution to a specific change is available, attach it; a
resolved finding whose change nobody can name is weaker evidence than one that can.

## The first run, and the no-baseline case

There is no diff on the first run and the report must say so. **Not-compared is not
all-new**, and it is certainly not all-resolved: the first run reports its findings with the
comparison explicitly marked absent. A prior run that found nothing is different again — that
is a real empty baseline, and everything in the current run is genuinely new. Distinguish
"no prior run" from "prior run with no findings" in the data, not just in the prose.

## Decision rules

- **When a finding persists across three runs, promote it out of the finding list** into an
  explicit accept-or-schedule decision. A finding that can be ignored indefinitely is training
  the team to ignore the list.
- **When the new count spikes without a corresponding change in scope, suspect the reviewer**
  before the code — a changed prompt, a changed check set, or a changed model will manufacture
  findings, and they will all be tagged new.
- **When the resolved count spikes, check the deletion split first.** Real fixes and vanished
  files look identical in a total.
- **Bind the diff to what it compared.** A diff is evidence about two specific states of the
  code; once either has moved, it is a historical document, and it is reported with the
  identity of the states it compared.

## When not to use it

- **Not as a gate on its own.** "No new findings" is a statement about the delta, not about the
  absolute state; a subsystem can hold a hundred persisting critical findings and pass a
  delta-only gate every time. Delta gates and absolute gates answer different questions and a
  serious pipeline runs both.
- **Not across a reviewer change.** When the check set, the prompt or the model changed, the
  buckets are not comparable and the run is a new baseline. Say so rather than publishing a
  diff whose movement is an artefact of the instrument.
- **Not for a first-time review of legacy code,** where every finding is new by definition and
  the bucket carries no information. Take the run as the baseline and start diffing from the
  next one.
