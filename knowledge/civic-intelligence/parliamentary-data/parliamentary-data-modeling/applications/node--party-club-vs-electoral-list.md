---
layer: application
type: application
subject: parliamentary-data-modeling
technique: party-club-vs-electoral-list
stack: node
status: forged
verified_on: 2026-10-14
verified_against: node@24
applied: code
ab_verdict: better
---

# Node chamber read: "the club today" for a member who left every club

The politicas repo already splits the two affiliations: the election mirror reads the
electoral list, and a dated resolver answers "which club on the day of this vote" with a
tagged verdict that keeps "outside any window" apart from "never had one". The technique's
rule that the dated side is the only denominator for whip-line metrics is therefore
honoured. The defect sat on the third consumer, the "club today" display.

## One query, three consumers, one unexamined case

A single mandate-to-club query feeds the leaderboard, the money ties and the election
mirror, all of which label it "today". Its ordering was already repaired once so that an
open window beats a closed one. What nobody asked was the case where no window is open:
a sitting member who left their club and sits as an independent. The query returned the
closed club anyway, last window by start date, so the display showed the person in the
club they had left. That is the technique's "no club on this date is an answer" rule
failing on the one date the product prints most, today.

## The paired read

Seam chosen to falsify the claim "today's club is already right": the earlier repair and
its test covered the club switcher and the stayer, never a member with only closed windows.
Fixture: one sitting member with an open chamber seat and a single closed club window, one
replaced member (seat closed, one closed club window), plus the existing switcher and
stayer.

- Arm A (shipped query): the sitting independent resolved to the old club; the replaced
  member to the old club.
- Arm B (query omits closed windows only for a member whose chamber seat is open and who
  has no open club window): the sitting independent has no entry, which every consumer
  already renders as "no club"; the replaced member keeps the last known club; switcher
  and stayer unchanged.

Floor: the 647 civicscore, volby and money unit tests, the fixture lane for the store and
the full pre-push suite stayed green. Not measured: how many of the live chamber's two
hundred seats are independents today, because no live store was reachable in the run.

## The decision rule this added

A map keyed by member that serves a "current" label must distinguish a member who no
longer sits (keep the last known affiliation, say so) from a member who sits with no open
affiliation (omit it). Carrying the last closed window for both repaints the second group
with a body they left, and the consumers cannot tell the difference afterwards.
