---
layer: technique
type: technique
subject: hash-pinned-translation-pipeline
technique: drift-classification
status: forged
laws: [one-authority-per-vocabulary, failure-not-empty-success, count-carries-predicate]
shared_with: []
use_when: [designing a freshness detector's output vocabulary, a report that ranks drift by severity instead of by action, a translated unit that carries no provenance record]
---

# Drift classification

The detector's output is a **closed vocabulary of four verdicts**, and the
discipline of the technique is that each verdict names a *different action*
rather than a different amount of concern.

| verdict | the state it names | the action it names |
|---|---|---|
| **fresh** | the recorded source hash equals the current source hash | nothing |
| **stale** | the recorded hash differs from the current hash | re-translate this unit |
| **missing** | the source has this unit; this locale does not | translate it for the first time |
| **orphaned** | this locale holds a unit the source no longer has | delete it |

## Why actions, not severities

The naive detector reports severities — critical, warning, info — and the
collapse destroys the only information the report had. *Stale* and *missing*
both land as "warning", and yet one is a re-derivation with a previous target
available to diff against and, often, human polish worth preserving, while the
other starts from nothing and has no prior art to protect. They are routed to
different queues, priced differently and reviewed differently. *Orphaned*
lands as "info" and therefore accumulates forever, which is the wrong reading
twice over: an orphan is not a small gap, it is the residue of a structural
change that was let through unreconciled, and it costs bytes in every shipped
bundle while shadowing nothing.

State the verdict, name the action, and let the consumer decide urgency. A
report that pre-judges urgency has removed the reader's ability to apply
context the detector does not have — which locale has an audience next
quarter, which unit is on the landing screen.

## The vocabulary has one authoritative definition

Three consumers read these verdicts: the human-facing report, the work-scoping
audit that budgets the next run, and the release gate that exits non-zero.
[One authority per vocabulary](../../../_laws.md#one-authority-per-vocabulary)
applies with its usual force — two hand-maintained copies of a four-member
enum are not redundancy, they are a race with a delay fuse, and the fuse burns
the day somebody adds a fifth member and finds only one of the copies. Define
the set once, derive every consumer from it, and make the gate's pass/fail
predicate a *statement over the set* ("fail on any stale or missing") rather
than a re-implementation of the classification.

## The finding is the work order

A stale finding that says only "stale" makes the reader open two files to
learn anything. The finding carries, at minimum: the unit identity, the
locale, **both hashes** — recorded and current — and the recorded date. Both
hashes matter for a reason that is not obvious: they are what lets a human
distinguish a real content change from an instrument change, because in an
instrument-drift event every recorded hash in the corpus differs from every
current hash *in the same way*, and a report carrying only "differs" hides
that signature completely.

Findings are then grouped by locale before they are grouped by unit. The
question a maintainer asks is "what does German need?", not "which locales need
this topic" — locale is the axis work is assigned along, so it is the axis the
report is sorted along.

## The unit with no record

The state that breaks naive implementations: a translation is present, and
there is no provenance record for it — imported from before the pipeline
existed, hand-added, or written by a pass that stamped nothing.

The rule is: **classify it as missing, never as fresh.** It is not fresh,
because freshness is a claim the detector cannot substantiate, and a detector
that renders what it could not check as clean has converted its own blind spot
into a health claim. It is not a fifth verdict either — the *action* is
"translate it", which is exactly the missing action, and the vocabulary is
organized by action. Where the population is large enough to manage
deliberately, report it as a labelled sub-count *within* missing ("of 41
missing, 12 are present but unpinned"), which preserves both the action and the
distinction without inflating the verdict set.

The exception worth naming: if the corpus is being migrated onto pinning and
the unpinned population is most of it, the honest move is a one-time,
**recorded** bulk pin with a written rationale naming the source revision it
pins to and the units it touched — not a silent restamp. Every later restamp is
re-translation.

## The instrument must be assertable

A run that could not read a locale's records, could not parse the source, or
matched zero units is **an error, not a clean corpus**
([failure-not-empty-success](../../../_laws.md#failure-not-empty-success)).
Concretely, the detector asserts before it reports: the source corpus was
found and is non-empty; each expected locale directory was found; each
provenance artifact parsed. Any of those failing produces a distinct exit
condition and a distinct message. "Zero stale" and "read nothing" are the two
outputs a freshness detector must never spell the same way, because the second
one is what a broken path, a renamed directory or a silently-caught parse error
produces — and it is indistinguishable from success at exactly the moment
success is least likely.

## Counts carry predicates

Every number the detector emits states what it counted
([count-carries-predicate](../../../_laws.md#count-carries-predicate)). "12
stale" travels into a status update and comes back a month later meaning
something it never meant. The honest form names the population, the scope and
the instrument: *twelve translated units, in one locale, whose recorded source
hash differs from the current hash computed over title-plus-body by the shared
digest function.* The scope clause is not pedantry — it is the field that lets
a future reader tell whether a drop from twelve to zero was work or a scope
change.

## Verdicts are recomputed, never stored

The classification is derived from state on every run. It is not written back
into the tree as a status field, and no job queue tracks "units pending
re-translation". This is what makes the pipeline resumable and idempotent: an
interrupted run leaves behind exactly the translations it completed, with their
pins, and re-running the detector produces a correctly shrunken work list with
no reconciliation step. A stored verdict, by contrast, is a derived value with
no recomputation discipline and it goes wrong in the direction of claiming work
was done.
