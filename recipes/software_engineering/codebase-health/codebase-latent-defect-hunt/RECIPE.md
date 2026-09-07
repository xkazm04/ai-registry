---
name: codebase-latent-defect-hunt
version: 0.1.0
status: seed
domain: software_engineering
path: software_engineering/codebase-health
---

# Codebase latent defect hunt

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** The defects a careful reader would catch are found by users instead, because
nobody has the time to read code the way a reviewer would. The hunt that goes looking
usually reads the wrong thing: it walks the happy path looking for something that looks
unusual, and produces a queue of plausible observations that a person dismisses one by
one until they stop opening it. The failures that actually take systems down are mostly
in code that already knew something had gone wrong and then did nothing useful about it.

**Input.** The codebase, which areas have changed since they were last read, what the
project's own tools already report, and the stable signatures of findings filed before.

**Core action.** Read the failure paths the way a reviewer would, judge which of the
things that look wrong would genuinely break rather than merely read oddly, and file few
and real rather than many and speculative.

**Output.** Findings a person confirms, each naming a file, a line and what goes wrong
under which conditions, with nothing filed twice and a running record of how many were
confirmed.

## Activities

1. Pick an area changed since it was last read *(observe)*
2. Read its error handling, resource lifetimes and shared state first *(observe)*
3. Decide which of these would genuinely break, and under what conditions *(decide)*
4. Drop what is already filed and what the project's own tools already report *(decide)*
5. File each survivor for a person to confirm, and record the confirm rate *(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**Defects that a careful reader would catch are found before a user runs into them.**

- Each finding names a file and a line, says what goes wrong, and says under what
  conditions it happens, rather than reporting that something looks unusual.
- The read starts from the paths that handle failure, the places a resource is acquired
  and released on different branches, and the state two callers can touch at once.
- A finding that a linter or type checker in this project already reports is not filed,
  because it is already visible and filing it teaches the reader that the queue repeats
  what they have.

**The proportion of findings a person confirms stays high enough that they keep opening
the queue.**

- The share of filed findings that a person confirms is measured and carried forward,
  and a category confirmed rarely is narrowed or stopped rather than filed at the same
  rate.
- The same defect is never filed twice across passes, matched by a stable signature
  rather than by wording.
- A pass that read an area and found nothing worth filing records that it looked and
  what it covered, so the next pass does not pay for the same read.

**A finding reaches the person who can act on it, on the path its severity deserves.**

- Anything that looks like a security exposure leaves on its own path rather than
  queueing behind ordinary findings.
- Nothing here edits the code: a finding is a claim put to a person, and a claim that
  has already been acted on cannot be declined.
- A finding the person declines records why, in terms specific enough that the same
  shape is not filed again next month.

## Guidance

Most catastrophic failures come from code that already caught an error and then did
nothing useful with it, so read the handlers before the happy path. Do not repeat what
the project's own tools already report; what they miss is ordering, resource lifetime
and swallowed failure. File few. The confirm rate is the measure that matters, because a
queue a person mostly dismisses stops being opened, and the one real finding then
arrives into a list nobody reads.

## Where this is worth adopting

- A service whose incidents keep turning out to be an error that was caught, logged and
  then treated as success, where each one looks unique in the postmortem and they are
  all the same shape in the code.
- A codebase that has just been handed to people who did not write it, where the
  reviewer instinct that would have caught these things at the time is no longer in the
  room.
- A team whose queue already contains everything their linters and type checker can say,
  so the useful contribution is only the part of the reading a tool cannot do.
- A component with concurrency in it that nobody has read closely since it was written,
  where the failures reproduce rarely enough to be filed as flakiness and closed.
- An operator who tried an automated bug hunt once, was handed twenty plausible
  observations, confirmed two, and now needs the thing to file two in the first place.

## Connector types

`source_control`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/).

## Recommended trigger

`self_paced`. Act when an area has changed without being read, or when the review queue
has drained enough that new findings will actually be looked at. A clock produces its
worst output on a quiet week, because a pass that feels obliged to file something files
speculation, and speculation is what destroys the confirm rate the whole recipe depends
on.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- What this adopter considers worth being told about, since the floor between noise and
  signal is a taste judgment and starting from their history rather than from nothing is
  the difference between the first useful pass and the tenth.
- How many open findings they can absorb at once, which is what bounds a pass, because
  the number confirmed and not the number filed is what the work is for.
- Which tools the project already runs, because everything those report is already
  visible and filing it again is the fastest way to make the queue feel like noise.
- Whether findings stop at a report or become backlog items directly, and who is on the
  other end of the security path when one is needed.

## Dependencies

None.
