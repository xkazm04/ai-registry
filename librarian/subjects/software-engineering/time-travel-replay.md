---
domain: software-engineering
subject: time-travel-replay
last_touched: 2026-09-26
touched_by: deepen
dry_streak: 0
depth: L3
---

# time-travel-replay

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-09-26 - `/deepen`, first pass (dp-ttr-0926)

Dispatched by the Curator lane on "single stack (react)". There were four
lanes:
- a re-verification of both 2026-08-18 React applications against personas
  master `a8cb3aa62`;
- a fleet seam search over 13 trees for a replay outside React;
- counter-evidence on ten claims, against primary source (a DOM session
  replayer, a terminal-cast player and its file format, the HTML media
  element's seek algorithm, two trace viewers' skew adjusters, the tracing
  SDK spec, a durable-execution runtime's docs, an event-sourcing issue) and
  perception-latency guidance;
- a blind training-data lane.

**Tree read (personas).**
- The tempo fix the first applications asked for landed on 2026-09-02. It
  was undone on 2026-09-17, when the replay moved to a paged log reader that
  cut every line's timestamp off. Two branches merged, and the unit tests fed
  a whole stamped log, so nothing went red. Both tree lanes reached this
  independently.
- The orphaned second transport was deleted, not rewired. Replaying from the
  end is no longer one gesture.
- The replay renders its own terminal over the raw stream-json it recorded.
  The live view renders the provider parser's display projection through
  the shared terminal.
- No transport exists outside React anywhere in the fleet. The second stack
  is the Rust writer and reader of the record: three clocks, spans closed
  with a disclosure, steps closed as if measured, and a server-side frame
  engine deleted after measuring a 24x payload.

**Measured.** 523 real execution logs, the reader's projection, the client's
own regex and silence rule. As served: 0 of 523 with a recorded tempo. Stamp
kept: 523 of 523, with 3,445 silences. 20 logs outrun the 500-line page,
which ends at 52-99% of their span without saying so.

**Counter-evidence.** Ten claims attacked, none refuted outright.
- Confirmed as written:
  - time is injected;
  - a seek keeps play/pause intent. That is the media element's own
    contract, except that a seek to the end ends playback.
- Conditioned:
  - renderer reuse holds at the record's layer only; output recordings get
    a dedicated player;
  - silent compression is the terminal-cast genre's design, and the
    session-replay tools mark it. Two documented failures back the toggle
    and the measured time map;
  - the ~100ms budget fits a discrete seek. A drag is animation with a frame
    budget;
  - keyframes go stale on a code change, so they carry their derivation's
    version;
  - causal repair of skew is opt-in in one viewer and silent in another, so
    the raw stamp must survive;
  - an unclosed span is often absent from the record, not open.
- Not evaluated, with no primary source either way: end-of-replay
  reconciliation and per-element estimate labels.
- Unsourced, now worded as reasoned: "a laggy scrubber trains users not to
  scrub".

**Convergence.**
- Three lanes placed the renderer-reuse layer condition: the web sources,
  the blind lane's "reuse the view, not the ingestion", and the tree's
  raw-versus-display split.
- Three placed "compression is a toggle, never the only view".
- The tree and the counter lane placed "the derivation starts at the
  reader".
- The web and blind lanes placed the keyframe version stamp, the scrub
  budget split, never re-calling the model, and version skew.
- No new technique: every convergence was a condition on an existing one.

**Landed** (506a9c82, generated f07d193b, pushed):
- `applications/rust--timeline-derivation.md`: `verified_on: 2026-09-26`,
  `verified_against: rust@1.96`, `applied: code`, `ab_verdict: better`;
- `applications/react--renderer-reuse.md` (new);
- both React applications re-verified and rewritten, with
  `verified_against: react@19`;
- conditions in the golden path and in four techniques.

**Applied:** 1 code fix, personas `281c02dc3` (the stamped page). It is
recorded as two `better` rows, one for the reader condition and one for the
dead-air flip, and the renderer-reuse flip is banked `unapplied`.

**Declined:**
- A fix for the unlabeled engine-closed tool steps. The comment says the
  `finalized` flag would regenerate a ts-rs binding, which is outside a
  replay change's write set, and a binding change on a diverged master
  belongs to its owner.
- The page-coverage notice and the load-failure-as-empty defect. Each is
  real and each is a separate change. Both are recorded in the applications,
  so the one fix stays measurable on its own.

## Impact

- personas: 1 context (`execution-replay`), 1 stale verdict (`deviation`,
  now judged against revision 5). The map was rebuilt and committed locally
  at `aa053b03d`, not pushed, because personas master has diverged
  (101 ahead, 218 behind origin). `/conform --stale` should re-judge it: the
  tempo deviation is fixed, while the page coverage, the load-failure
  rendering and the second terminal remain.

## Saturation

L3: primary source for ten claims, two independent reads of one tree, and a
code A/B over 523 real records. Clocks: all four applications were verified
2026-09-26. Dry streak 0. Next pass:
- the renderer-reuse row, when a cargo harness can run the provider parser
  over recorded logs;
- a third stack, when a fleet project replays a record under a transport
  outside React;
- the page-coverage notice, when personas' replay states "first 500 of N";
- re-judge `execution-replay` after personas master reconciles with origin.
