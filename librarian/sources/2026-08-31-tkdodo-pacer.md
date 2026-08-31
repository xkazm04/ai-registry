---
source: github:TkDodo/pacer
kind: vendor repository (open engine)
url: https://github.com/TkDodo/pacer
title: TanStack Pacer
author: TanStack maintainers
commit: e5c2b53e9391423467ff66c75083f6c4792c1a62
words: 836 landing / 29268 authored guides / 87063 generated reference (excluded)
extracted: 12
accepted: 1
declined: 0
leads: 0
already_covered: 8
untriaged: 2
applied: 1
shipped: 0
dispatched: 0
fetches_spent: 0
run_id: intake-pacer-0831
siblings: 1
---

# TanStack Pacer - the check order that decides a shed policy

A monorepo of client-side execution-control primitives: debounce, throttle, rate
limit, queue, batch, retry, each in a synchronous and an asynchronous form, with
four framework adapters and a devtools package.

## The class, and where the yield was

**Vendor repository (open engine).** The whole engine is in the tree, so nothing had
to be inferred from an advertisement - but the ratio that matters here is not the
usual one. This repo's `docs/` holds 87,063 words of **generated** API reference
across 267 files and 29,268 words of **authored** guides across 21. Counting the
whole of `docs/` would have reported 116k words and flattered the sweep; the
generated half is a type dump with prose around it and produced nothing. The authored
guides are first-party practitioner documents and produced everything.

Swept in order: the guides, then `packages/pacer/src/` (13 primitives, 23,059 LOC),
then the test suites (12,632 LOC), then the README last. Both halves of the tree were
needed - **the finding exists only because the guide and the code disagree**, and
either alone would have produced a catch instead of a landing.

Expected yield was called low before the triage table and was low. This source lands
in three subjects the corpus has already forged deeply, and eight of twelve candidates
went to the corpus.

## Accepted

### Reject-by-class is foreclosed by the order of the two checks

Landed as an amendment to `admission-queue/depth-bounds-and-shed`, plus
`gate-sees-target` added to that technique's laws and one `use_when` entry.

It came from the **denial hunt**. `priority-and-fairness` states *"Priority orders the
wait; it does not skip the gate"* and forwards the single exception - reject-by-class
shed - to `depth-bounds-and-shed`, which duly lists it among three canonical shed
policies. Both files describe it as a policy a designer *selects*. Neither says what
makes it implementable: that the gate must evaluate class before depth, and that the
natural code shape does the opposite for a good reason (the capacity test is a length
comparison available immediately; the class has to be derived from the arrival). The
designer configures a priority function, the function reaches only the insertion sort,
and the shed policy is refuse-newest.

The corpus already owned the mirror discipline one level down - *"from the declared
number, can you walk to the line of code that refuses because of it?"* The amendment
is that same mechanical test turned on the class, plus the observation that the
comparison is the easy half and the displacement rule is the hard one.

**The source refuted itself, and that is why the pick was kept.** Its guide asserts
that when a maximum size is set, lower priority items may be rejected if the queue is
full. Its code checks capacity at `queuer.ts:410` and derives priority at `:419`; the
async twin does the same at `:479` and `:488`; a grep for any eviction path finds none
in either. The docs describe reject-by-class and the engine implements refuse-newest.

**And its tests could not have caught it.** Both packages carry 8 priority tests and 7
capacity tests, and **zero** construct a queuer with both. The defect lives exactly in
the untested intersection of two well-tested features - which is the half of the
amendment that generalises furthest, because it says what case has to exist rather
than what rule to believe.

## Already covered - the corpus won these

Eight, and several by a wide margin. Worth recording because the pattern is the point:
this source is a competent library writing down standard practice, and a mature corpus
should beat it almost everywhere.

- **Jitter against the thundering herd.** `retry-backoff` golden path, point 2:
  backoff without jitter converts N independent failures into N-caller pulses.
- **A retry needs a total-time budget, not an attempt count.** `backoff-design`
  already says exactly this, in a line the source's total-execution-time option is one
  implementation of.
- **Cancellation must reach the work.** The source's warning that aborting stops the
  retry logic but not the in-flight operation unless the function threads the signal
  is real, and `job-progress-and-cancellation` states it better: cancel is
  cooperative, acknowledged in two steps, and what is not allowed is pretending -
  reporting cancelled over a job still writing output.
- **Fixed vs sliding windows.** `rate-limiting/algorithm-selection` carries three
  families and their burst semantics against the source's two.
- **An unlimited default switches the bound off.** The sharpest catch.
  `depth-bounds-and-shed` had already written that a bound whose degenerate value
  switches it off has quietly made "off" the easiest configuration to ship - and the
  source's batcher defaults its size cap to infinity, its wait to infinity and its
  custom trigger to a constant false, so a batcher constructed with no options never
  flushes, while its pending flag (computed from whether the wait is finite) reports
  idle. The corpus predicted the shape; the source is the instance.
- **Supersession.** A second execute call on one retryer aborts the first with a
  new-execution reason - the supersession row of `cancellation-attribution`'s
  four-cause table.
- **Backpressure signalling** and **bounded-queue rejection accounting** - both inside
  `depth-bounds-and-shed` and `admission-vocabulary`.

## Untriaged - extracted, reached the table, nobody picked them

Recorded with anchors so a later run does not re-derive them. **Nobody verified these;
they are not declines.**

1. **Pick a pacing primitive by its loss policy, not its timing shape.** The source's
   decision guide discriminates its five primitives by what each does to the calls it
   does *not* run: debounce rejects during activity, throttle rejects all but one per
   interval, rate-limit rejects at quota, queue rejects only when full, batch never
   rejects. That is a cleaner axis than the timing diagrams usually used, and it
   strips. The home is contested: `admission-queue` and `rate-limiting` already draw a
   two-way boundary between shaping a flow over time and arbitrating occupancy, and
   this is a five-way client-side cut across a line the corpus owns from the server
   side. Anchor: `docs/guides/which-pacer-utility-should-i-choose.md`.
2. **A wrapper's boolean never says which half it governs.** Two instances in one
   repo: disabling the rate limiter blocks the wrapped function entirely rather than
   disabling the limiting (the guide says so in a callout, because users get it
   wrong), and setting the retryer to throw on every error silently disables retrying.
   Same root - an option on a wrapper is ambiguous between the wrapper and the
   wrapped, and the name resolves it in neither case. `research-map` found no coherent
   home across four framings; impact `none`, which is the value that should prompt
   asking whether it belongs in `practices/` instead.

## Notes on the source itself

- **`docs/guides/server-rate-limiting.md` is a nine-word stub** - frontmatter and a
  title, no body. The source documents a gap it has not filled. Not corpus material,
  but worth recording: the guide index links it as though it exists.
- **The async retryer is self-declared alpha**, with the note that its ergonomics suit
  internal use by the other primitives rather than external use. Its callback ordering
  diagram is nonetheless the most precise thing in the repo.
- The README was read last and contributed **zero** accepted candidates, which is the
  eleventh consecutive run where that is true of a repository source.

## Run conditions

0 of 3 fetches spent - eleventh consecutive zero-fetch run on a source carrying its own
primary material. Corroboration for the landing came from training-data convergence
(bounded priority queues and their admission-vs-ordering distinction are long-settled
ground reachable without this source) plus real code read in both the source tree and a
managed project.

One sibling was live on the board at Phase 0 (`intake-knip-0831`, same GitHub
organisation, different repository) and held no subject this run touched.

## Applied

`personas`, mode `code`, verdict `better`. The managed project carries the same
arrangement the amendment describes - three priority levels whose top class is
documented as healing retries, a bound of ten, and a depth verdict that returns before
the class is derived - and this registry's own evidence overlay had recorded it as
"bounded depth with refuse-newest shed", filed as a chosen policy. It was an inherited
one. The intersection was untested there too, found independently of the source: 0 of
34 cases constructed a queue that was bounded *and* prioritized.

Arm A: 33 passed, 1 failed - the urgent arrival refused while bulk work keeps its
positions. Arm B: 34 passed, 0 failed. Ship 0, blocker class `environment`: the change
spans two crates and the caller crate's build script fails on this checkout for a
pre-existing missing plugin permission, reproduced with the diff stashed. Shipping the
tested half alone would leave the other crate failing on a field it does not yet know
about, so both halves stay uncommitted.
