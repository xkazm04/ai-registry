---
layer: technique
type: technique
subject: streamer-dress-rehearsal
technique: provenance-survives-every-consumer
status: forged
laws: [output-never-outruns-evidence, checkability-routes-the-pixel]
shared_with: []
use_when: [carrying a simulated label from generated chat to overlays, proofs and exports, deciding when an aggregate counts as simulated, designing the provenance badge on a rehearsed overlay]
---

# Provenance survives every consumer

A rehearsal's outputs travel further than the rehearsal. An overlay on a scene can be
recorded; a draw result can be screenshotted and posted; a moderation record can be
exported; a vote tally can end up in a clip. Each consumer is a place where "this was
simulated" can fall off, and once it falls off, a rehearsed result is indistinguishable
from a real one — which, outside the rehearsal, makes it a fabricated record. This
technique keeps provenance as **data that every derived artifact inherits** and every
surface renders, rather than as a property of the screen it was first shown on.

## Provenance is set at the source and derived everywhere else

The simulated flag is set once, when the generated message is created, in a typed field.
Every derivation carries it forward by rule, and the rule for aggregates is **taint**: an
aggregate is simulated if any contribution inside it was simulated. A vote window holding
one generated ballot among real ones is a simulated tally; a draw whose pool held one
generated entrant is a simulated draw. The rule is deliberately conservative, because the
cost of labelling a mixed result simulated is a badge, and the cost of not labelling it is
a public result that a generated input helped decide.

No consumer decides provenance for itself, and no caller passes it in. A renderer reads
the flag from the state it renders; an export copies it from the record it exports. A
label that a consumer computes from context — "we are on the rehearsal screen, so add the
badge" — vanishes the moment the same output is reached from anywhere else
([law: output-never-outruns-evidence](../../../../_laws.md#output-never-outruns-evidence)).

## Provenance has more than one axis

A rehearsed draw can have a generated audience and a real, publicly verifiable
randomness round; a rehearsed visual can be driven by a generated burst through the real
render path. Collapsing those into one "simulated" word misstates one of them: either the
real round is called fake, or the generated audience is hidden behind a real-looking
proof. Label each axis that differs — who took part, where the randomness came from,
whether the transport was live or recorded — and say which is which on the surface that
shows the result.

## Rendering the label

The label is drawn by deterministic code, in a fixed place that the overlay's own
artwork cannot cover or restyle, and it survives every redraw — a design-package change,
a reconnect, a scale change
([law: checkability-routes-the-pixel](../../../../_laws.md#checkability-routes-the-pixel)).
A label carried only in a transport comment, a log line or a page attribute is metadata
for machines; the viewer of a recording sees none of it. On a scene, the label is a
visible badge. On a proof, it is a field the verifier prints. In an export, it is a column
that cannot be dropped without dropping the row.

## Procedure

1. Put a simulated flag on the input type itself, set by the generator and nowhere else.
2. For each derived artifact — tally, draw, decision record, render snapshot, export —
   carry the flag by the taint rule and test it with a mixed input.
3. Identify the provenance axes each artifact has and label each one that differs from
   live.
4. Render a visible badge on every on-stream surface from the artifact's own flag, outside
   the art layer, and assert in tests that it appears for a simulated snapshot and is
   absent for a real one.
5. When a surface clears on error, clear the badge with the content, so a stale badge
   never sits over live content and a stale result never loses its badge.

## Decision rules

- **When any contribution is simulated, the aggregate is simulated.** Do not compute a
  share to decide.
- **When a surface cannot show the label, it cannot show the rehearsed result.** Withhold
  the output rather than render it bare.
- **When two provenance axes disagree, name both.** A single word on a mixed artifact is
  wrong in one direction.

## When not to use it

Internal component tests whose outputs never leave the test runner need the flag only
where the code under test reads it. The technique governs every artifact a person could
see or keep.
