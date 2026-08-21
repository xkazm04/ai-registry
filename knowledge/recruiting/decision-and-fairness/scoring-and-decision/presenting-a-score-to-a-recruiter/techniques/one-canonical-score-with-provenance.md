---
layer: technique
type: technique
subject: presenting-a-score-to-a-recruiter
technique: one-canonical-score-with-provenance
status: forged
laws: [a-verdict-is-bound-to-what-it-judged, every-decision-names-its-actor, a-candidates-process-never-stalls-on-your-constraints]
shared_with: []
use_when: [more than one component can compute a candidate's fit figure, a score differs between two screens, adding a new scoring producer]
---

# One canonical score with provenance

The concern is **plurality at the point of display**. A mature screening
system almost always has several legitimate producers of a fit figure, and no
single one of them is wrong. What is wrong is letting each surface choose.

Typical producers, all defensible:

- a **fast heuristic** at intake — keyword and requirement overlap — so a list
  can be sorted the second an application lands;
- a **full rubric run** from the deep analysis pass, arriving minutes or hours
  later;
- a **recruiter re-weighting** view, recomputed from the same components under
  different priorities;
- an **imported** figure that travelled in with the record from another
  system;
- a **fallback** figure minted when the primary path was unavailable.

Each writes its own field, and the day a second surface is built, someone
reads whichever field they found first. The candidate now carries three
scores.

## The procedure

**1. Name the canonical field, and make it the only public one.** Exactly one
property is *the* score. The producer-specific fields still exist — you need
them to debug and to recompute — but they are private to the reconciliation
layer, and no rendering surface, export, sort or threshold may read them
directly.

**2. Declare a precedence order once, in code, with the reasoning attached.**
The order is a policy decision, not a coincidence of which field is non-null.
A defensible default: recruiter-adjusted view (only within the view that owns
it) → full rubric run → imported figure → heuristic → none. Write the order in
one function; every "is there a score here?" question in the system goes
through it.

**3. Stamp provenance onto the resolved value.** The reconciliation returns a
figure *and* its origin: which producer, which rubric or scale version, when
it was computed, and whether the run was degraded. A verdict is bound to what
it judged — [a-verdict-is-bound-to-what-it-judged](../../../../_laws.md#a-verdict-is-bound-to-what-it-judged)
— and a score whose rubric version is unrecoverable cannot be marked
superseded when the rubric changes; it can only be silently re-meant.

**4. Render the provenance, at least in short form.** A heuristic figure and a
full-rubric figure look identical as digits and are not remotely equally
trustworthy. The surface distinguishes them: a preliminary marker, a caption,
a different weight of type. This is the same instinct as
[every-decision-names-its-actor](../../../../_laws.md#every-decision-names-its-actor)
applied one step earlier — before the decision is made, the recruiter is told
who computed the input.

**5. Recompute-or-refuse on version skew.** When the stored score's rubric
version does not match the current one, the resolution either recomputes (if
the components are retained) or marks the figure superseded. It never renders
a stale figure under a current label.

**6. Decide what stays out.** Reconciliation is for **rival answers to the
same question**. A figure that answers a *different* question — a fresh fit
check recomputed at offer-drafting time to justify a salary, a ranking total
from a group evaluation with its own weight vector — is not a stale version of
the score; it is another measurement. Folding it in makes the canonical number
wrong; rendering it as a bare "match" beside the canonical number makes the
card wrong. It gets its own caption, naming what it measured and when.

## Decision rules

- **When two producers disagree and both are current, prefer the more
  expensive one and record the delta.** A large, systematic gap between the
  heuristic and the full run is a calibration signal worth alerting on; it is
  never a reason to average the two. An average of two scoring philosophies is
  a third philosophy nobody designed.
- **When the primary path is degraded, still emit a figure, and downgrade its
  provenance truthfully.** A candidate's process never stalls on your
  constraints — [a-candidates-process-never-stalls-on-your-constraints](../../../../_laws.md#a-candidates-process-never-stalls-on-your-constraints).
  The fallback is allowed to exist; what it may not do is inherit
  full-confidence presentation or outlive the outage as the canonical value.
- **A recruiter's re-weighted figure never overwrites the canonical score.**
  It is a view: scoped to that recruiter's session or saved as an explicitly
  labelled alternative weighting. Otherwise the first person to drag a slider
  silently redefines the candidate for everyone else.
- **A backfill sweep is fill-only.** A batch job that scores the unscored is
  safe; the same job allowed to overwrite existing figures silently re-scores
  a population under a newer rubric with no event, no version bump, and no
  way to explain why a candidate moved.
- **New producer, new precedence entry, same day.** A producer added without a
  precedence rule is a future divergence with a date on it. If you cannot say
  where it sits in the order, you have not decided what it means.

## Anti-patterns

- **Coalescing at the call site.** "Take the deep score, or the quick score, or
  zero" written inline in three components is three policies that will drift
  apart, and the trailing zero converts absence into a value (see
  absent-score-is-its-own-tier).
- **Provenance stored but never surfaced.** An origin field that no view reads
  satisfies an audit and helps no recruiter.
- **Letting the export be its own producer.** Report generators that
  re-derive the figure "because the shape is different there" are the most
  common source of a candidate reading differently in an emailed document than
  on the screen it was generated from.

## When not to use this

- **Deliberate comparison surfaces.** An internal calibration view whose whole
  purpose is to show the heuristic beside the full run should show both — but
  each explicitly labelled by producer, and it must not be a surface anyone
  makes a hiring decision on.
- **Single-producer systems.** If exactly one path can ever mint the figure,
  the reconciliation is ceremony. Keep the provenance stamp anyway: it costs
  one field, and it is what lets you add the second producer without an
  incident.
