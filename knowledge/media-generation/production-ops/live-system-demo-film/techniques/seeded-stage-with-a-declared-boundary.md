---
layer: technique
type: technique
subject: live-system-demo-film
technique: seeded-stage-with-a-declared-boundary
status: forged
laws: [output-never-outruns-evidence]
shared_with: []
use_when: [choosing what a demo film runs against, a demo depends on state a live environment cannot guarantee, disclosing which parts of a demo are staged, planting a defect a story needs]
---

# The seeded stage with a declared boundary

A demo film runs against a **deterministic seeded fixture** with the defects the
story needs planted where it needs them — not against a live environment. The
price of that fixture is a **declared boundary**: the film's own documentation
states which parts of what the audience sees are the real system and which are
staged. The fixture without the declaration is a con; the declaration without
the fixture is a film that cannot be re-run. Both halves, or neither.

## Why not the live environment

Recording against the real thing feels like the honest choice, and it is a trap
made of three promises a live environment cannot keep on the day you are
shooting:

- **The state the story needs.** The film's argument requires a particular
  situation — a request at the right stage, an account with the right history, a
  defect present and not yet fixed. Live systems are not obliged to be in an
  interesting state at eleven on a Tuesday, and waiting for one is not a
  production plan.
- **A surface nobody changed overnight.** A take driven against a moving system
  fails for reasons that have nothing to do with the film, at the moment the
  film is being made, which is the worst possible time to discover them.
- **An unattended boot.** A film that is a build has to start from nothing:
  no credentials to fetch, no third-party service to be up, no network to be
  reliable. Anything a human has to do before the run is a thing that will not be
  done on the run nobody was watching.

Determinism is the positive form of all three. The same inputs produce the same
state, the same identifiers, the same ordering, and — wherever a date or a
duration appears on screen — the same clock. Two takes become comparable, which
is what makes a re-shoot cheap and a regression visible.

## Planting is legitimate; hiding is not

A stage is dressed for the argument being made, exactly as a set is. Planting the
defect the story is about is not deception; it is authorship, and a demo whose
stage was not authored is a demo with no story in it. What is not legitimate is
leaving the audience to work out which parts were dressed, because they cannot,
and because the whole value of a film about a live system is that the audience
believes the picture.

So the boundary is written down, and it separates at least three categories:

- **Real** — the system under test doing its own work. The claim here is full
  strength: this is what the product does.
- **Staged** — a fixture standing in for something. Two sub-kinds worth naming
  separately, because they age differently: a stand-in for a *service* (a
  deterministic double for something real that exists), and a stand-in for a
  *surface the product does not have yet*. The second is a promise; the first is
  an isolation choice.
- **Explanatory** — what the recorder itself adds for legibility and the product
  never shows. It is staged by construction and belongs in the list.

The document that carries this is read by the people who show the film, which is
the point: a salesperson who knows which part is a stand-in answers the question
in the room instead of overclaiming and being corrected later.

## The script test for a boundary that means something

A declaration can be technically true and still useless, if the film is built so
that the staged part is load-bearing. The test:

> Write the script so that swapping a staged part for the real one changes the
> **words**, not the **beats**.

If replacing the fixture with the real service would delete a beat, that beat was
about the fixture. If it would re-order the film, the film's structure is a
property of the stage rather than of the product. A film that passes this test
graduates by editing lines; a film that fails it has to be re-authored the day
the product catches up, which — reliably — is the day nobody has time.

The corollary is a useful piece of project management: **the boundary list is a
backlog.** Every staged-surface entry is a promise the product has not kept yet,
written down in the one document that everyone already reads before a demo. A
boundary list that never shrinks is telling you something.

## Failure modes

- **The undisclosed stage.** The audience leaves believing a capability exists.
  The correction, when it comes, costs more credibility than the demo bought.
- **The drifting fixture.** The stage is maintained, the product moves, and the
  film comes to demonstrate a system nobody ships. Guard against it by pointing
  the same script at the real system periodically, even if the resulting take is
  never published — a take that fails against reality is the notification.
- **The flattering seed.** Data chosen so everything looks good — no long names,
  no empty lists, no error states. A seeded stage should include the awkward
  cases the product handles, because handling them is usually the claim worth
  making.
- **Determinism claimed, not held.** A fixture that seeds identifiers randomly,
  or renders a live date, reintroduces exactly the variability the fixture
  existed to remove, and it does so in the frames a viewer is most likely to
  freeze on.

## Decision rules

- When the story needs a state, plant it in the fixture and declare it; when the
  story needs a state the product cannot actually reach, the story is wrong —
  fix the story, not the fixture.
- When a value appears on screen and comes from the stage, it is declared, not
  computed from the run; run figures are the other technique's business and the
  two must not be blurred.
- When a staged surface becomes real, delete its entry and re-run; if the re-run
  needs more than line edits, record that as a finding about the script's
  coupling, because it will recur.
- When a demo will be shown by people who did not build it, ship the boundary
  with the film rather than in a separate place, because a disclosure nobody has
  to hand is a disclosure that does not happen.

## When not to use it

A system whose claim is precisely its behaviour under real-world conditions —
sustained load, live data, third-party latency — is undercut by a fixture, and
the honest production there accepts the flakiness and declares the boundary the
other way: this is one real run, on this date, unrepeatable. Similarly, a
compliance or audit recording of an actual event is evidence of that event and
must not be staged at all. The technique is for films that argue about what a
system does, not for records of what it did once.
