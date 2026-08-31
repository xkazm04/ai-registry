---
layer: technique
type: technique
subject: dead-code
technique: suppression-hygiene
status: forged
laws:
  - creation-names-reaper
  - deletion-is-not-repair
  - failure-not-empty-success
use_when: [writing a reason for a suppression entry, an exemption points at deleted code, deciding whether an ignore delegates or hides]
---

# Suppression hygiene

Every instrument that reports findings grows a suppression surface: ignore globs,
exclude lists, allowlists, keep-prefixes, inline pragmas. Suppression is necessary —
an instrument with no escape hatch gets deleted the first time it blocks something
it misunderstands — and it is also dead code's favorite disguise, because a
suppression entry is the one artifact whose *job* is to make an instrument report
nothing. Undisciplined suppression converts an instrument into a decoration one
entry at a time, with every step individually reasonable.

## Reasons are mandatory, with enforced substance

Every suppression entry carries a reason, and the instrument *enforces* the
requirement mechanically — including a minimum substance bar, because "temp" and
"TODO" satisfy a presence check while explaining nothing. An unexplained exemption
is how suppression becomes policy: the next person extends the pattern ("there are
already six entries like this"), and within a year the exclude list is a shadow
configuration nobody can audit because nobody recorded what any entry was for. The
reason is written for the person deciding whether to *remove* the entry — it names
the condition that made the exemption necessary, so its lapse is checkable.

## A stale suppression fails the run

The load-bearing rule, and the one most tools get backwards: **a suppression that
matches nothing is a failure, not a harmless leftover.** When the excluded file is
deleted or renamed, the exemption points at nothing — and a tolerant instrument
carries it forever. That entry is dead code *inside the instrument built to find
dead code*, and it rots in the worst available direction: a glob-shaped exemption
that outlived its target will eventually re-match something new, silently exempting
code its author never saw. Failing on the stale entry converts the rot into a
ten-second fix at the moment the context still exists
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success) — an
exemption that exempts nothing and an exemption doing its job must be
distinguishable, and only the instrument can tell them apart).

## Every entry names its reaper

A suppression is created for a reason that will someday lapse — the migration will
finish, the vendor tree will be replaced, the dynamic-dispatch surface will get
typed. So every entry names its reaper at creation
([creation-names-reaper](../../../../_laws.md#creation-names-reaper)): an expiry date, a
re-review cadence, or the checkable condition under which it lapses. Stale-match
failure reaps entries whose *target* died; the reaper clause covers the other rot
axis — entries whose target survives but whose *justification* died. Without it,
the list only ever grows, and a growing suppression list is the instrument's
coverage shrinking on a schedule nobody approved.

## The three reaper forms are not equals

The clause above offers an expiry date, a re-review cadence, or a checkable condition as
interchangeable ways to name a reaper. They are not, and the ranking runs opposite to how often
each is reached for.

**A date is the worst of the three and should be treated as unavailable.** It expires on a
schedule nobody chose, which means it fires on whoever happens to run the instrument that day —
a person with no context on the entry, usually mid-task on something unrelated, holding a red
build they did not cause. The expiry is working exactly as designed and it has still arrived at
the wrong person, so the repair it forces is the cheapest one available: push the date out. A
reaper whose most probable outcome is its own postponement has bought a recurring interruption
and no reaping. The failure is not that dates are ignored; it is that they detonate, correctly,
at a moment chosen by the calendar rather than by the work.

**Prefer a threshold on a version the team itself moves.** Tie the entry to the next major bump
of the artifact it lives in, or to the version of the dependency whose defect made it necessary.
Such a threshold fires when somebody takes the action that makes the deferred work relevant —
opening the major, upgrading the dependency — so the person present is the one with the context,
and the surrounding work is already open. It is the practical realization of the checkable
condition: an event the team causes, rather than one that arrives on its own.

That leaves the ranking: a condition tied to an event the team causes, then a version threshold
as its usual concrete form, then a re-review cadence for entries with no such event, and a date
only where an external deadline genuinely is the condition — a certificate, a contractual
sunset, a regulatory boundary. In those cases the date is not a stand-in for a condition; it *is*
the condition.

## The third rot axis: the entry whose reach grew

The two axes named above are both properties of the entry *as written*. The
target died, and stale-match failure reaps it; the justification died, and the
reaper clause reaps it. Neither can see the third, and the third is the one an
audit of the roster cannot detect at all: **an entry whose target is alive and
whose reason still holds, but whose reach has grown.**

The stale-match section already names this hazard without being able to act on
it — a pattern that outlives its author "will eventually re-match something new,
silently exempting code its author never saw." An entry that went from
suppressing three findings to suppressing three hundred passes every check in
this technique. It matches, so it is not stale. Its reason is still true, so its
reaper has not fired. Its delegation note is still accurate about the class. And
the instrument's coverage has collapsed while every audit on the roster stays
green.

**The corrective is one number: what each entry suppressed on this run, printed
where the run's output is read.** Suppressed, never invisible. This is
[failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)
spoken in the suppression surface's own vocabulary — an entry doing exactly the
job it was written for and an entry eating a hundred findings nobody has ever
read produce the same silence, and only a count tells them apart.

It is cheaper than it sounds, because the instrument already has the number. The
finding was produced and then discarded, so the entry that discarded it is known
at that instant; what is missing is almost always the printing, not the
counting. Three forms work, in ascending strength:

- a per-entry tally in the run's summary — enough for a person who goes looking;
- a line naming the entry each time it fires — right for a surface with few
  entries and expensive ones, and the form that survives being read in a log;
- **a committed count the run compares against**, so an increase arrives as a
  diff in review rather than as a number nobody reads. This is the strongest,
  because it converts the axis into an ordinary ratchet and puts the change in
  front of the person whose commit caused it.

What to do with the number is a review trigger, not a gate. Hits growing is
perfectly legitimate when the exempted surface legitimately grew — the vendor
tree got bigger, the generated directory has more files. It becomes a finding
when **the hits grew and the reason did not**: the entry is now covering a
population its author never assessed, and the honest repair is to narrow the
pattern back to what was assessed, not to write a wider justification for
territory nobody examined.

This pairs with the blind-spot roster below rather than replacing it. The roster
says which class an entry hides and which instrument covers that class; the
count says how much of it. A delegation to an instrument that genuinely exists is
still worthless once the delegating entry's reach has outgrown the delegate's.

## Prefer the suppression that fails when the defect is repaired

The strongest reaper is one nobody has to write, and it comes from choosing the suppression's
**form**. Most instruments offer two ways to silence the same finding, and they differ in what
happens on the day the underlying problem goes away:

- A directive that **asserts the finding is expected** stops being satisfied once the finding
  stops occurring, and the instrument reports the now-unnecessary suppression as an error. The
  entry reaps itself, at the exact moment its justification lapses, in front of whoever made the
  improvement.
- An override that **forces the value through** — a cast, a coercion, a blanket exclusion —
  succeeds identically before and after. It is correct on the day it is written and stays green
  forever, including long after the instrument improved, the upstream defect was fixed, or the
  code it guards was replaced.

Where both forms are available, the first is mandatory. This is the one case where
[creation-names-reaper](../../../../_laws.md#creation-names-reaper) is satisfied without a reaper
clause at all, because the instrument is the reaper — and it is strictly better than any clause,
since it fires on the real condition rather than on a proxy for it.

The rule has a sharp corollary for the case where you believe the instrument is wrong. When a
finding is a suspected defect in the tool rather than in the code, the tempting move is to reshape
the code until the tool stops complaining. Do not: a reshaped workaround is indistinguishable from
intended design, carries no record of why it looks like that, and outlives the defect
silently — which is the same rot as the stale exemption, minus the entry that would have made it
findable. Suppress in the self-retiring form instead, say in the reason that the tool is suspected
wrong, and link the upstream report. The link is what makes the condition checkable, and the
suppression's own form is what makes the check happen without anyone scheduling it.

## The ignore roster is a published blind-spot inventory

The healthiest suppression surface is not a confession of weakness but a coverage
map: each ignore entry declares **which orphan class it hides and which other
instrument covers that class**. Ignoring the generated-artifact tree in the
unused-export scanner is correct *if and only if* the reconciliation instrument
owns that tree — and the entry should say so, turning "ignored" into "delegated."
The audit this enables is the valuable one: walk the roster, and any entry that
delegates to an instrument that does not exist marks a class with **no coverage at
all** — invisible precisely because every individual tool shows green. Suppression
without delegation notes divides coverage between instruments with a gap in the
middle, and the gap is where the orphans live.

## Suppressing to quiet versus suppressing to delegate

Two suppressions can be textually identical and morally opposite. Suppressing
because another instrument owns the class, because the finding is a measured false
positive, or because a quarantine decision is pending — with the reason recorded —
is hygiene. Suppressing because the finding is *annoying*, the fix is unscheduled,
or the report should look better is
[deletion-is-not-repair](../../../../_laws.md#deletion-is-not-repair) in its most common
costume: the defect stays, and the one place that displayed it goes dark. The
mechanical tells are the reason field (the quiet-motivated entry cannot state a
condition that will lapse) and the reaper clause (it cannot name one). A
suppression surface where both are enforced makes the dishonest entry harder to
write than the honest one — which is the correct direction for the friction to
point.
