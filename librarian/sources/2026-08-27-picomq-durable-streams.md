---
source: web (repository)
url: https://github.com/picomq/picomq
title: "PicoMQ - durable streams over object storage"
author: single-vendor open-source project
kind: open-source infrastructure engine (engine + operating docs in one tree)
mined_on: 2026-08-27
words: 453 (README as ingested) / ~14000 in-tree docs / ~50000 lines engine
skill_version: 0.14.0
extracted: 11
picked: 3
accepted: 3
already_covered: 3
declined: 0
leads: 2
untriaged: 3
dispatched: 0
fetches_spent: 0
---

# PicoMQ, 2026-08-27 - the class whose docs and code disagree, and why that was the yield

Run 33. A durable-stream engine over object storage, handed over cold. The
ingest returned 453 words, because what a repository landing page returns is
the install instructions. Reading the expected yield off that number was the
run's first mistake and it was corrected within one phase: for this class the
README is the least useful file present, and the source is the tree.

## Class: open-source infrastructure engine

Not the vendor-repository row - the engine is not hosted, it ships in the
tree under a permissive licence alongside ~14,000 words of design docs and a
four-file wire specification. That places it on the **research-model release**
row's structural property rather than the vendor row's: *the engine and the
operating instructions ship together, so a claim in a document is checkable
against the code that implements it, in-run, with no fetch.*

That property is not decoration. **It fired twice, and both firings were the
run's findings.** A class whose central promise is in-run falsifiability
should be sought out for exactly that reason, and the fetch budget it needs
is zero - 0 of 3 spent, now the sixth consecutive zero-fetch run for a
source carrying its own primary material.

Expected yield stated before triage: low-to-moderate, on the reasoning that
15 commits and 262 stars means a project days old whose most reliable claim
is that it exists. That reasoning was sound and the conclusion was wrong, and
the reason is worth keeping: **project age predicts the reliability of its
adoption claims, not the density of its design decisions.** A young
infrastructure project has usually just finished making every hard choice it
will ever make, and has written them down while the reasons are fresh. Age
would predict yield for a practitioner account; for an engine it predicts
almost nothing.

## The two contradictions, which are the run

**One: the docs describe an idealised mechanism the code does not implement.**
The write-path document describes group commit as self-tuning - "one upload
contains every record that arrived while the previous upload was in flight,
so per-record cost drops as concurrency rises" - a knob-free design whose
batch boundary is the previous flush. The engine's own configuration ships a
250 ms interval, an 8 MiB size cap and a 50-deep in-flight upload pool. Three
knobs, and a timer where the prose promised none.

**Two, and this is the one that mattered: the same repository implements the
idealised version correctly, elsewhere.** The metadata plane's proposal sink
is a flusher that blocks for the first command, drains without waiting
whatever else has queued behind it, commits, and repeats. No timer at all.

Two group commits, one tree, opposite defaults - the **sibling-systems
property** the reference file names for research-model releases, showing up
here in an infrastructure engine. And as that entry predicts, the
discriminator was already drawn by people who had to draw it, and visible in
the diff rather than requiring a judgement call:

> The metadata sink's flushes are **serial** - one row per batch, appended at
> the next free index - so "whatever arrived during the previous flush" is a
> complete boundary and needs no timer. The write-path WAL **pipelines** up to
> 50 concurrent uploads, and once flushes overlap there is no single previous
> flush to close a window against, so an explicit timer has to come back.

**A source that implements a good idea badly is worth more than one that
implements it well** - fifth run this has held, and the strongest instance so
far, because here one source did both at once and the gap between its halves
was the technique. Had the docs been accurate the run would have produced a
plausible rule with no boundary condition attached.

## The seam that gave finding 1 its home

`single-flight-primitives` enumerates the second-caller policies - refuse,
join, queue, coalesce - and closes by instructing the reader to pick one
explicitly per operation and write it down. That is an **enumeration**, the
Phase 6 hunt that has now paid six consecutive runs, and it invited exactly
one question: is group commit on that list?

It is not, and the omission is consequential rather than cosmetic. Merge is a
fifth policy with a different trade from any of the four: join returns one
*shared* result because both callers wanted the same thing; coalesce keeps
the last arrival and discards the rest as waste; merge carries N callers'
**distinct** payloads through one execution and returns N distinct outcomes,
discarding nothing and duplicating nothing. It is also the only policy that
lowers the *cost* of the guarded operation rather than the number of times it
runs. A designer walking that list for a durable write path finds no correct
option and either invents one unnamed or picks a wrong one.

This is the near-empty case the method warns about, in its second form: the
concern already lived inside a mature subject under a different name, and
what was missing was the boundary, not the material.

## What landed

All three landed as **amendments to existing techniques**, none as new
techniques. In a corpus at 150 subjects the amendment is usually both the
cheaper and the higher-yield move, and here it was also the more correct one:
each finding's natural home already existed and already had a section that
was wrong or incomplete rather than absent.

1. **`concurrency-guards/single-flight-primitives`** - merge added as the
   fifth second-caller policy, plus a new section on closing a merge window:
   the serial-flush self-closing rule, the boundary where pipelining breaks
   it and forces a timer back, and the requirement that the merge buffer be
   bounded with a distinguishable over-capacity refusal rather than allowed
   to grow. `use_when` extended; the decision-rule list corrected from four
   policies to five.
2. **`data-retention/time-budgeted-batch-purge`** - the existing ordering rule
   ("dependent rows before the rows they reference") is stated
   unconditionally and **inverts** across a store boundary. Where the purged
   thing spans two stores with no transaction covering both, delete the
   payload first and the reference second: a crash then leaks a retryable
   pointer the next pass cleans idempotently, where the reverse order leaks
   bytes nothing references and no pass will ever visit. Cites
   `creation-names-reaper` - only one of the two directions leaves a reaper.
3. **`concurrency-guards/cross-process-exclusion`** - the fail-open/fail-closed
   section takes the cost of a duplicate as a measured input. Amendment: that
   cost can be *engineered*. Route the holder's every effect through a shared
   serialization point and a lease stops being a safety mechanism and becomes
   an availability knob, which changes what its TTL has to be defended
   against. Two conditions stated because neither survives assumption - no
   side-channel writes, and the holder's worklist in shared state rather than
   its memory. Cites `one-validation-door`.

Honest note on 3: this is the weakest of the three. `idempotency-by-design`
already argues idempotency beats guarding, so the increment is the
*consequence* for lease sizing rather than the premise. It was worth landing
where it sits and would not have been worth a technique of its own.

## Caught (3)

- **Idempotent producers keyed by id + epoch + sequence, surviving transfer** -
  `idempotency-by-design` covers this completely and better, including the
  minted-before-first-attempt rule the source does not state.
- **A fresh epoch per process start, later epoch wins, stale proposals
  rejected** - `cross-process-exclusion` and `attempt-attribution` own fencing
  tokens; the wall-clock epoch is one implementation of a covered rule.
- **Placement as a pure function of replicated state, racing proposals
  resolved by log order with the loser a no-op** - `idempotency-by-design`'s
  conditional-write tool, applied to placement.

## Leads (2)

- **Classify what a stale view decides: speed or correctness.** The engine
  routes from a local view that lags the log, and argues this is safe because
  routing is only a performance decision while correctness comes from
  fencing - "it can misdirect a request, it cannot produce two writers." The
  fencing half is owned (`cross-process-exclusion` puts the check at the write
  site). The *classification* framing - decide per decision whether staleness
  costs latency or correctness, and buy freshness only for the second - is
  not, and reads as doctrine rather than technique. **Return on a second
  independent sighting**, which would make it convergence and let it land at
  the altitude it deserves rather than as one engine's design note.
- **Pre-warm the receiving node on ownership transfer.** The target opens the
  stream on seeing the placement rather than on the first request, so the
  first client after a handover does not pay the open cost. Plausibly general
  to any ownership-handoff design. Thin on its own - one instance, no measured
  benefit stated. **Return when a second source or a connected tree shows a
  handoff paying first-request cost.**

## Untriaged (3)

Extracted, reached the table, never picked - recorded so a later run does not
re-derive them, and with no judgement implied.

- **Write-path backpressure refuses the append rather than buffering**, with a
  cap on unconfirmed bytes and a distinguishable over-capacity outcome. Read
  as likely catch against `admission-queue/depth-bounds-and-shed`. Partly
  absorbed into finding 1's buffer-bounding paragraph; the admission-queue
  angle was never checked.
- **Recycle a held-open response on a fixed interval so intermediaries never
  observe an idle connection**, with the client resuming by offset. The corpus
  answers the same hazard with heartbeat injection and does name
  let-it-drop-and-reconnect as a legitimate alternative, but proactive
  server-side recycling with lossless offset resumption is a third answer it
  does not describe. Closest thing to a fourth finding in this run.
- **Snapshot the replicated state every N applied commands to bound replay on
  startup.** Not checked against `sync-replication` or `embedded-db`.

## Operating notes for the class

- **Read the tree, not the landing page, and do not price the run off the
  ingest word count.** The ingest returns what a repository page renders. For
  this class the ratio of in-tree material to landing-page material was about
  30:1, and the entire yield came from the 30.
- **Look for the same mechanism implemented twice in one repository.** The
  sibling-systems property is not specific to model releases. An
  infrastructure project that solves one problem in two subsystems has drawn
  a discriminator it usually has not written down anywhere, and the diff
  between the two implementations is cheaper to read than either one alone.
- **Check the in-tree docs against the in-tree code as a matter of course,
  not as a spot check.** It cost four greps here and produced the run. The
  prose describes the design the authors wanted; the configuration describes
  the one they shipped; the gap is where the boundary condition lives.
- **A young project's docs are freshest exactly where its choices were
  hardest.** Discount its adoption and maturity claims, not its design
  reasoning.
