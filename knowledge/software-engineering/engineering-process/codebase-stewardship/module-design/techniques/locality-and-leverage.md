---
layer: technique
type: technique
subject: module-design
technique: locality-and-leverage
status: forged
laws: [count-carries-predicate]
shared_with: []
use_when: [arguing that a boundary is in the wrong place, choosing between two competing structural proposals, deciding what to co-locate]
---

# Locality and leverage

A boundary pays out twice, and the two payments go to different people. Keeping
them separate is what turns a structural opinion into a proposal somebody can
disagree with on the merits.

- **Locality** is the maintainer's payoff. A class of change lands in one place:
  cheap to make, findable when it breaks, fixed once.
- **Leverage** is the caller's payoff: capability obtained per unit of interface
  learned. This is depth ([module-depth](./module-depth.md)) seen from outside.

Both are consequences of depth, both are real, and **they can be traded against
each other** — which is the fact that makes them useful as a pair of criteria
rather than as two words for "good design."

## Locality's operational form: co-locate what changes together

Locality is not "put related things near each other," which is unfalsifiable
because relatedness is in the eye of the arranger. Its operational form is
narrower and testable: **things that change together live together; things that
change for different reasons live apart.**

The second half is the neglected one. Two pieces of code that are structurally
similar but change for different reasons are the classic bad merge — a shared
helper that grows a mode flag on its first divergence and a second flag on its
next, until it encodes the union of two jobs and belongs to neither. The
similarity was a coincidence of the present tense. Duplication is cheaper than
the wrong abstraction, and the test for which is which is not "do these look the
same" but "would a change to one of them require a change to the other."

Co-location is also physical, not only logical. Where a directory's name no
longer predicts its contents, or where implementing one feature requires editing
in three sibling trees, the grouping is describing a taxonomy of *kinds of file*
rather than a taxonomy of *reasons to change* — and a reader must hold the whole
map in their head to find anything.

## Scattered change is the diagnostic

The most reliable signal that a boundary is in the wrong place is that one
intention requires edits in several places that do not know about each other.
It is the best available signal for one reason: it is **measured from history
rather than from taste.** Nobody has to agree that a module is ugly. They have
to agree on what the last twenty changes of a given kind touched, which is a
fact.

To use it, the measurement carries its predicate
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).
"This change touched nine files" is not a finding. The finding is: *changes of
this class — adding a new kind of X — touched a median of nine locations across
the last N of them, counted as edits to distinct modules, excluding tests and
generated output.* Three parts of that matter:

- **A class of change, not a change.** One large change proves nothing; a
  recurring class of change proves the structure does not anticipate it. If the
  class recurs twice a year, the scatter may be correct and the boundary may be
  buying something else.
- **A stated counting rule**, because "files touched" and "modules touched" and
  "distinct decisions restated" give different answers, and the third is the one
  that matters most and is hardest to count.
- **A stated exclusion set.** Tests co-changing with their subject is health,
  not scatter. Generated output co-changing with its source is arithmetic.
  Counting either inflates every number and discredits the instrument.

The counter-case that keeps the diagnostic honest: **scatter is evidence, not a
verdict.** A change class that touches many places because it genuinely is a
cross-cutting concern — an audit obligation, a locale, an access rule — has
found a real property of the problem, and the answer may be a mechanism rather
than a boundary move. What scatter tells you reliably is that *some* decision is
encoded in more places than anybody chose. Which decision, and whether the
encoding is worth removing, is the next question and not the same one.

## Leverage, and how to see it from the wrong side

Leverage is measured at the call site, which is why the author of a module is
poorly placed to judge it. Two things a maintainer sees as elegant read as
overhead from outside:

- **A boundary that requires a caller to assemble state before using it.** If
  using a capability means constructing three objects in a required order, the
  capability's interface includes that ceremony, and the leverage is whatever is
  left after paying it.
- **A boundary that returns work rather than results.** A module that hands back
  something the caller must then interpret, validate or dispatch on has moved
  the work across the boundary without hiding it — every caller reimplements
  the same interpretation, and they drift.

The usable test is a sentence: *what does a caller have to learn, and what do
they get for it.* When the first clause takes longer to say than the second, the
boundary is not delivering leverage, whatever it is delivering.

## The trade, and why naming it is the technique

Locality and leverage are frequently in tension, and pretending otherwise is
what makes structural arguments circular. Two recurring shapes:

- **Hiding a decision buys leverage and can cost locality.** A boundary that
  makes one thing easy for every caller may require two subsystems on the other
  side to change in lockstep forever, because the hidden decision spans them.
  The callers are delighted; the maintainers pay quarterly.
- **Perfect locality can cost leverage.** Pulling everything that changes
  together into one place can produce a module whose interface is a
  configuration surface — every variation that used to live at a call site now
  lives in an option. Locality achieved by absorbing variety is depth in the
  wrong place, and it presents as an options bag.

So the decision rule is procedural rather than substantive: **a structural
proposal states which of the two it buys, which it spends, and who collects
each.** A proposal that claims to improve both without a trade is either a rare
genuine win — a boundary that was simply wrong — or, far more often, an
argument that has not yet found its cost. Asking "who pays" is the fastest way
to find out which.

When the two genuinely conflict and no reframing dissolves it, prefer locality.
Leverage is collected by whoever is calling the module today; locality is
collected by everyone who changes it for as long as it exists, and the second
population is larger and includes people who were not consulted.

## When not to use it

These are criteria for arguing about a boundary, not a measurement programme.
Instrumenting change scatter continuously across a whole codebase produces a
ranked list dominated by whatever changed most recently, and it converts a
diagnostic into a dashboard nobody acts on. Measure the scatter of a change
class **when a candidate has been proposed and needs grounding** — the
measurement is evidence in an argument, and outside an argument it is noise with
a chart.

The pair also does not settle boundaries drawn for reasons outside this
subject's scope: a boundary that exists because two parts are deployed
separately, owned by different teams, or subject to different obligations is
justified by that fact, and scoring it on locality and leverage will produce a
recommendation nobody can act on.
