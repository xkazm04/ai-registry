---
layer: technique
type: technique
subject: accountability-publishing-ethics
technique: honest-empty-states
status: forged
laws: [missing-is-not-zero, disclose-never-repair, non-partisan-symmetry]
shared_with: []
use_when: [designing not-found and outage behavior for entity detail pages, rendering a metric whose data was never ingested, a backend degradation makes records temporarily unreadable]
---

# Honest empty states

On an ordinary product, an empty state is a UX nicety. On a surface about
named people, every empty state is a *published claim about a person*, and
most default behaviors make false ones. A detail route that answers a busy
database with a not-found page has stated "this person does not exist". A
metric widget that renders zero for an uningested dataset has stated "this
person gave zero speeches". A silently blank panel implies "nothing to see
here" — which, on an accountability platform, reads as a clean bill of health
the platform never issued. The technique: enumerate every absent state a
surface can be in, and make each one a sentence that is actually true.

## The state vocabulary

Four different absences, four different truths, four different renderings:

1. **Not found within the checked scope** — a successful lookup found no
   matching record in the declared dataset and period. This is the
   only state that earns a true not-found, and it should be *reserved* for
   that meaning: a not-found that also fires on infrastructure trouble has
   spent its truthfulness.
2. **Temporary unavailability** — the store is unreachable, busy, or degraded.
   Say that the lookup could not be completed; do not assert that the record
   exists unless a separate reliable observation establishes it. Provide a
   recovery route. A truthful explanation does not make a failed data request
   successful: transport status and retry behavior follow the service contract.
3. **Not measured** — the pipeline never ingested this data for this entity
   or period. Render "not measured", visually distinct from zero and from
   perfect, with the coverage note saying what was and wasn't ingested.
   Nothing not-measured participates in a ranking or comparison — an entity
   must never lose a comparison it was never entered in.
4. **Measured empty** — the data was ingested and the true count is zero.
   This is a *finding* ("no detected ties, checked against register R on
   date D") and it gets the full finding treatment: citation, coverage,
   symmetric surface. The distance between "no data" and "verified none" is
   the entire credibility of a negative claim — and a negative may only be
   asserted from a source that could have contained the positive.

## The procedure

1. **Classify at the loader, render by class.** The data layer returns a
   discriminated state (found / not-found / unavailable / not-measured / empty), never a
   bare null that every surface interprets by guess. A null that means three
   things will be rendered as the wrong one somewhere.
2. **Never let a fallback fabricate.** List surfaces may degrade to labeled
   sample data (see the form-encoding technique); detail surfaces about a
   named person may not — there is no honest illustrative version of a
   specific person's record. Their degradation path is the explicit
   unavailability page.
3. **Count what was withheld.** When bad source rows are suppressed (an
   impossible date, a broken record), the surface that would have shown them
   states how many were withheld and why. Disclosure is the alternative to
   the two dishonest options: silently repairing the value or silently
   dropping the row.
4. **Test the outage path as copy, not just as code.** The assertion is not
   "renders without crashing" but "renders a true sentence": feed the surface
   each absent state and assert the claim it makes. The false-404 defect
   passes every technical test — it fails only a truthfulness test.

## Decision rules

- **When the lookup failed, preserve uncertainty about existence.** Say
  "could not check this record", not "this person does not exist" or "the
  record exists". A successful lookup establishes only its declared scope.
- **Missing values stay missing in the display too.** Use an explicit
  not-measured marker for layout gaps. Render zero only when the measurement
  and its coverage establish zero; never export a visual placeholder as data.
- **An empty queue is news, phrase it as such.** "No entries yet — decisions
  appear here as reviews complete" is honest; a blank panel invites the
  reader to conclude either "nothing wrong with anyone" or "this feature is
  broken", and both are false.

## When not to use it

- Not an excuse for indefinite degradation. The honest unavailability page is
  a truthful *incident state*, not an operating mode; if a surface shows it
  routinely, the defect is upstream and the disclosure has become wallpaper.
- The full vocabulary is for surfaces making claims about entities. Purely
  navigational chrome (a search box with no query yet) can use ordinary empty
  patterns — no claim about a person is at stake.
