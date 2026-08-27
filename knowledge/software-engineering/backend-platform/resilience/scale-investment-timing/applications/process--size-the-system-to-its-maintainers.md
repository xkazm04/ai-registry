---
layer: application
type: application
subject: scale-investment-timing
technique: size-the-system-to-its-maintainers
stack: process
verified_on: 2026-08-27
---

# Process — a corpus authored by machines and merged by one person

[size-the-system-to-its-maintainers](../techniques/size-the-system-to-its-maintainers.md)
asks for the maintaining headcount to be written down as a design input, and for the
gap between generation capacity and operating capacity to be tracked separately. This
registry does both, in an unusually literal way, and the second half was observable
first-hand during the session that wrote this document.

## The denominator is one, and it is declared

The operational surface, resolved on the date in the frontmatter: eight knowledge
bundles, 3,369 concept documents, 7,911 checked links, and a largest bundle holding
150 subjects across nine categories. Those figures move most days and are quoted with
their date for that reason — the corpus gained content from a second session while this
paragraph was being written. Several lane gates — `check-bundles.mjs`,
`check-skills.mjs`, `build-index.mjs --check`, `build-catalog.mjs --check` — plus the
`usage/`, `signals/` and `practices/` lanes, each with its own rules.

The maintaining headcount for all of it is **one**, and it is written down. `CODEOWNERS`
assigns `*` to a single named individual, and `CONTRIBUTING.md` makes the consequence
explicit rather than implicit: "**Merging is adopting**", with an owner review required
before anything lands.

What makes this a good instance is not that the number is small. It is that the number
is **recorded in the place decisions get made**, which is exactly the technique's
instruction and the step almost everyone skips. Most systems know their maintainer
count only as an HR fact discovered during a resignation; this one has it in a file the
merge process reads.

## The system names its own maintainer-count risk in a comment

`CODEOWNERS` goes further than recording the number. Its header comment states the
failure mode:

> In a real org these are teams (`@org/platform`, `@org/security`), never individuals —
> a personal owner becomes an unmergeable pull request the week that person changes
> team.

That is the technique's central temporal claim — the denominator is not constant and a
fall in it is a design event — written by the system about itself, in advance, at the
point of maximum cheapness. The comment does not resolve the risk; it makes it legible,
which is the difference between a known single point of failure and a surprise.

## Generation capacity and operating capacity, observed

The technique argues that cheap authorship raises how much a team can **produce**
without raising how much a person can **hold**, and that the two must be tracked
separately. This corpus is close to a pure case: its content is authored overwhelmingly
by agent sessions, and merged by one human.

The structural response is the one the technique names as "automated down" — correctness
is made **mechanical** rather than attentional. The gates check link integrity in both
directions, `use_when` presence, taxonomy placement and caps, index freshness and
catalog hash stability, so that the owner's finite attention is spent on judgment
(is this claim true, does it belong here) rather than on verification (do these 7,909
links resolve). The lane gates are the mechanism by which an operating capacity of one
person governs a surface no one person could check by reading.

**And the gap showed itself during this session, which is the part worth recording.**
Two agent sessions worked in the same checkout concurrently, and produced between them:

- a bundle-integrity failure caused by neither session's own work — an in-flight
  subject in a third area had a technique file on disk that its golden path did not yet
  declare, so the shared gate went red for both;
- two derived-file conflicts, in the bundle index and in the catalog, each of which had
  to be resolved by hand because a regeneration run by either session swept up the
  other's uncommitted state.

None of that is a defect in either session's output. It is **operational surface per
maintainer rising as a direct function of generation capacity** — precisely the
mechanism the technique predicts, arriving through coordination rather than through
code volume. The remedy applied was also the technique's: not more attention, but a
narrower operation — committing by explicit pathspec, staging new files by name, and
excluding derived artefacts that had absorbed another session's work.

## What this realization cannot do

**It does not test the technique's central temporal claim.** The denominator here is one
by design and policy, not because a team of thirty shrank to eight. The falling-headcount
mechanism — funding on a quarterly clock against architecture on a multi-year one — has
no instance in this corpus, and this application confirms the *input-recording* half and
the *generation-versus-operating* half only. A system that measurably lost maintainers
while keeping its architecture is the realization to look for.

**The over-built versus under-staffed diagnostic is untested here** for the same reason:
it requires a design-time ratio to compare against, and this corpus has been a
single-owner system for its whole life, so both sides of the comparison are the same
number.

**One-person ownership is not being recommended.** The registry's own comment says it is
a compromise appropriate to its size and wrong at organisational scale. This application
reports how a system with that constraint made it legible and mechanical; it is evidence
about the technique's instructions, not an endorsement of the staffing arrangement they
were applied to.
