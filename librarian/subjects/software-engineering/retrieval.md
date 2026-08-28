---
domain: software-engineering
subject: retrieval
last_touched: 2026-08-27
touched_by: research, external-reconcile, intake
dry_streak: 0
---

# retrieval

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-08-27 - `/intake`, from a vendor documentation set

Gained `relationship-proximity-lane` (7 -> 8 techniques) and an amendment inside
`hybrid-lane-fusion`. Source: [[2026-08-27-latticedb]].

**The enumeration paid again, and it was the roster itself.** "No single lane
suffices" lists lexical, semantic, recency, always-include - two similarity
matchers, a clock and a pin - and none of them can surface the item that
*disagrees* with the top hit, because similarity is the wrong instrument for
finding an objection. The fifth lane asks what is *attached* to what matched.
It is not a peer: it is a function of results, so its budget is a fan-out cap
rather than a slice share, reach and path-enumeration are different questions
with different costs, and it needs a per-relation policy (`contradicts`
expands disagreement, `replaces` expands time and often displaces its own
seed).

The amendment is the sharper half and the source produced it by getting it
wrong: its flagship query computes BM25 relevance and discards it into a
boolean filter while vector distance alone orders the result. Fusion's rule
that multi-lane convergence is evidence has an **unstated precondition - the
lanes must be independent** - and an expansion lane seeded by another's output
counts one signal twice, hardest exactly where the seeding lane was most
confident. Diversity cuts pass it, because the items genuinely differ.

Application `rust--relationship-proximity-lane` is negative and is the
evidence: a tree implementing this roster faithfully and completely, holding
two typed relation stores with no request-path reader - one read only by
export, import and a wikilink render, the other a table plus a **reverse**
index built for inbound traversal, a six-name relation vocabulary and an
eight-line stub module ending `Phase 0: stub. Phase 2: traverse, add_edge,
contradict_scan`, with no writer and no reader at all. Because the
implementation is faithful, the gap was in the standard, not in the tree.

Intake lead, awaiting a second sighting: the cheapest form of the reader test
("a workload class is claimed by a request-path reader, never by the presence
of its data") generalises beyond retrieval and was folded into the
`storage-engine-selection` subject proposal as technique 7 rather than banked
here.


### 2026-08-22 - external reconcile, [[2026-08-22-7]]

Gained `go--relevance-floors` against `weaviate/weaviate` @ `adcffc5`
(1.40.0-dev). The autocut hint refuted from inside the chosen technique: it is
a scale-free knee detector that cannot return empty - not a floor - and the
document says so with the code. The worker was killed mid-run by a network
outage; the director adopted the orphaned draft, ran the citation re-check
personally (~15 probes, all landed), and trimmed 170 -> 137.

Reconcile leads (convergence rule applies): a floor that drives FETCH DEPTH
rather than post-filtering; the unset sentinel colliding with the strictest
expressible floor (zero in the floor's own units); truncation reported to the
log instead of the caller (count-carries-predicate owed to the caller, paid to
the operator); the lexical lane borrowing another lane's floor units.

### 2026-08-22 - `/research`, from an external source

Gained `retrieval-triggering` (6 -> 7 techniques), wired into the golden path ahead of
the query stage. Source: [[2026-08-22-ai-agent-race-exploded]].

The gap was a missing *stage*, not a missing concern: every technique in the subject
began at `query`, so the decision to issue one was never modelled and defaulted to
"always" or to per-call-site habit. The subject's own honest-empty doctrine turned out
to apply one stage earlier - a skip, an empty result and an outage are three facts, and
only the last two had names.

## Open leads

- **The trigger's calibration set is the same machinery as the floors'.** If a later run
  touches `retrieval-evaluation`, check whether the labelled-query-set section should
  now cover trigger decisions explicitly rather than by implication.

## Standing debt

- **Two stacks** (`rust`, `react` per the index) - better than most of this bundle, but
  the new technique has no application yet.
- **Never swept by `/librarian`.**

## Declines

None.
