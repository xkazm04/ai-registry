---
layer: technique
type: technique
subject: local-visibility-and-reputation
technique: pack-visibility-per-engine-never-averaged
status: forged
laws: [not-measured-is-not-zero, label-convention-as-convention, provenance-is-binary-and-labelled]
shared_with: []
use_when: [computing map-pack visibility from imported rank observations, a market with more than one map engine, importing a pack export]
---

# Pack visibility per engine, never averaged

Map-pack visibility is the share of tracked service-by-area pairs whose listing sits in
the pack - the top three - on one engine. Where a market has a second map engine, the
same figure is computed a second time over that engine's observations and reported on
its own line. The two are never averaged, never summed into one "tracked" count, and
never given a shared "average position", because a mean of positions on two different
maps describes a place that exists on neither.

## Procedure

1. **Tag every observation with its engine at import.** The engine column is optional;
   an absent or empty cell means the dominant engine, which is what every legacy export
   is. A cell that is present but unrecognised is *refused* - the row is rejected with
   a coded error - never guessed onto either engine. Mis-attributing one engine's
   position to the other corrupts both series and nothing downstream can detect it.
2. **Split before computing.** Filter the active observations to one engine, then
   compute: tracked pairs, pairs at position three or better (in the pack), pairs at
   position one, the mean position, and the pack rate as in-pack over tracked. Repeat
   for the second engine. A zero-row engine produces no line, not a line of zeros.
3. **Exclude untracked pairs from the current figures and disclose them.** A partial
   re-import keeps an omitted pair with its history and a frozen, months-old current
   position, marked untracked. Folding that into "tracked N, in pack M" overstates
   present coverage; the pair is excluded and its count reported on its own line.
4. **Report the engines that are actually present.** The list of engines is derived
   from the rows; an empty import yields an empty list, never a phantom entry for the
   dominant engine, so a surface can tell "no rows" from "dominant-engine rows only".
5. **Label the observation method.** A grid of points across the service area is the
   standard instrument, and its per-cell ranks are the real reading. One observation per
   area from one point is labelled *one point, one day* wherever the figure appears.

## Decision rules

- **When a market has a second map engine with meaningful share, compute visibility
  twice and show both, because a business can be first on one and absent from the
  other** and the average of those hides the absence.
- **When the engine cell holds an unrecognised value, reject the row, because a
  guessed engine is a silent corruption of two series** and a rejected row is one line
  the importer can fix.
- **When importing a pack, fail the whole import on any malformed row, because a pack
  is a ranking**: a silently dropped competitor renames every position below it and
  rewrites every share computed from it. Reviews, ranks and coverage imports are
  tolerant - a missing row there is a missing row. A pack is the exception, and the
  error carries the line number.
- **When a pack export marks no listing as the business's own, match by folded name
  and say so;** an explicit flag anywhere in the area wins over a coincidental match.
- **When an observation's rank exceeds the deepest position the engine shows (about
  twenty on the dominant engine), treat it as a typo, not a rank.**
- **When the only observation is a single point, do not call it the area's rank.**
  Proximity is the largest single input to the pack and the one the business cannot
  change; a reading half a kilometre away is a different reading.

## Share of voice is an illustration

A per-position click weight turns a pack into a share of estimated clicks. Where the
weights are assumed rather than measured for this market - which they nearly always
are - the share is labelled illustrative and used only to say "you are behind these
two and ahead of those four". It is never a traffic estimate, never a forecast, and
never blended with a measured click figure. A pack whose rows carry no coordinates
still ranks and still produces a share; it simply places no pins, because nothing
fake goes on a map.

## What the per-engine split costs, and why it is paid

Two lines instead of one, two sets of figures to explain to a client, and a report
that occasionally says "on the second engine you are not tracked". Every one of those
is cheaper than the alternative, which is a client who sees "average position 2.4" and
asks why the phone is quiet in the half of the market that uses the other map. The
split is the report telling the truth about where the number came from.

## When NOT to use

- **A market where the second engine has no meaningful share.** One engine, one line;
  the split is harmless but the second line is noise.
- **For organic (non-pack) positions.** Those belong to the ordinary rank-tracking
  discipline; this technique is about the map block and its three-deep boundary.
- **To compare two areas against each other.** Per-engine is a rule about *engines*.
  Two areas on one engine may be compared, with the proximity caveat.
- **As a substitute for the grid.** Where a grid instrument exists, use it; the
  per-engine split is orthogonal to the per-point one and does not replace it.
