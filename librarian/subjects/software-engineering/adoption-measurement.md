---
domain: software-engineering
subject: adoption-measurement
last_touched: 2026-08-31
touched_by: intake
dry_streak: 0
---

# adoption-measurement

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-08-31 - `/intake` (run `intake-agentic-trends-0831`)

First note for this subject. `before-after-outcome-pairing` gained a section,
"Two reasons a half is missing, and only one of them is out of scope", two
decision rules and two `use_when` entries. Source:
[[2026-08-31-agentic-coding-trends-report]] - a vendor prediction report whose
one usable measurement was that ~27% of AI-assisted work is work that would not
have been done at all.

**The gap.** Step 5 excludes a part scored on one side and not the other, to
prevent a delta manufactured by coverage change. Correct, and under-specified:
**induced scope has the identical syntactic shape and the opposite meaning.** A
unit absent from the before side because nobody measured it has an *unknown*
before-value and must be excluded; a unit absent because it *did not exist* has
an **observed zero**, and excluding it deletes the practice's largest effect and
reports the residue. The amendment adds the discriminator (was it absent from
the measurement, or from the world?), the evidence requirement that keeps an
observed zero distinct from an invented baseline - the technique's absolute rule
is untouched and explicitly cited - an `induced` status token, and the rule that
induced scope is reported beside the delta, never folded into it.

**The shape worth remembering.** This is the same defect as the run's other
landing on `hitl-approval`: a rule keying on the property that was easy to
observe rather than the one that decides the verdict, and being structurally
unable to see the difference. Two sightings in one run is not convergence, but a
third from an independent run would make it law-shaped. Recorded in the source
note for that purpose.

**Applied** to `personas` (experiment, `not-better`) and inspected against a
second project's lint ratchet. Both instruments returned *coverage change*, so
the amendment changed no verdict - a rejection, and the most useful row of the
two. The seam class it names: **an instrument whose unit population is derived
by a matcher rather than enumerated from the tree cannot exhibit induced scope**,
however fast the tree grows, because its units are its own output. The map's
contexts held at 208 -> 208 across eight days while the source tree grew 4,746 ->
5,881 files. The ratchet, by contrast, enumerates three causes for a *drop* and
guards its population floor, but has **no ceiling** - a real asymmetry that costs
that project nothing today because its tree is flat (990 -> 996 files in three
months). It is the place to re-run this when that changes. See
[[../../librarian/applied]].
