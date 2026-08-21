---
layer: technique
type: technique
subject: candidate-status-transparency
technique: stage-role-mapping-not-stage-names
status: forged
laws: [meaning-does-not-live-in-a-label, uncertainty-resolves-toward-the-candidate]
shared_with: []
use_when: [deriving a candidate-visible phase from an internal pipeline stage, auditing status copy after a board rename, handling a stage that has no role]
---

# Stage-role mapping, not stage names

The concern: the candidate-visible phase must be derived from *what a stage
means* in the process, never from what it is currently called. Teams rename
columns constantly — merging "Phone screen" and "Screening", translating a
board, renaming "Final" to a client's codename — and a projection keyed on the
display string breaks silently at the moment of the rename, with no error and
no test failure.

The failure this prevents is specific and has been observed more than once:
a candidate at **offer stage** shown *we have received your application*,
because the column they sit in was renamed and no longer matched the string
the mapping expected, so the mapping fell through to its first bucket. The
candidate reads it as evidence that the process lost them, days after a verbal
offer. This is the concrete cost of
[meaning-does-not-live-in-a-label](../../../_laws.md#meaning-does-not-live-in-a-label).

## The procedure

1. **Consume a stable role vocabulary.** Entry, screening, interview, offer,
   terminal. This subject does not define it — a sibling subject owns stage
   modelling and the guarantee that every stage carries a role. Read the role
   off the stage; never parse, normalise, lowercase or fuzzy-match the title.
2. **Map role → candidate phase, one direction, exhaustively.** The mapping is
   a total function over the role set. Every role has a phase; adding a role
   without a phase must be a build-time or test-time failure, not a runtime
   fallthrough.
3. **Collapse deliberately.** Several roles may share a candidate phase — a
   candidate does not need to know that "screening" and "recruiter screen" are
   distinct in your board. Collapsing is fine; *inventing* granularity that
   mirrors internal micro-stages is not.
4. **Give the unmappable case its own honest state.** A stage with no role, a
   migrated board, an archived pipeline: this is a real state and it gets copy
   that is true of every possibility — "your application is in progress" —
   never the entry bucket.
5. **Test the direction of error.** The regression test worth writing is not
   "offer maps to offer"; it is that no internal state maps to a phase
   *earlier* than the candidate's actual progress. Overstating progress is
   embarrassing; understating it, at offer stage, is the incident.
6. **Re-derive on read.** Compute the phase when the candidate looks, from the
   current stage role. A phase stored at stage-change time is stale the moment
   the record moves, and a status page that can be confidently wrong is worse
   than none.

## Decision rules

- **When a stage's role is unknown, do not guess from the name.** Under
  [uncertainty-resolves-toward-the-candidate](../../../_laws.md#uncertainty-resolves-toward-the-candidate),
  an unclassifiable stage yields the neutral in-progress state, which cannot
  insult anyone, rather than a name-matched guess that can.
- **When two roles differ only in internal handling, collapse them.** The test
  is whether the distinction changes what the candidate should do or expect.
  If it does not, it is machinery.
- **When a stage is retired or a board is migrated, expect historical records
  to point at it.** The mapping must survive a stage that no longer exists —
  the stage-modelling sibling's tombstone rules are what make this possible;
  consume them rather than special-casing the null.
- **When someone proposes showing the actual stage title "for transparency",
  refuse.** Internal titles carry internal meaning ("Manager review — hold"),
  and a candidate reading them will interpret them, correctly or otherwise.

## When NOT to use it

- **Recruiter-facing surfaces.** Internal users need the real stage name, and
  collapsing to roles there destroys the operator's model of their own board.
  Role mapping is for the candidate boundary specifically.
- **Metrics and funnel analysis.** Those key off roles too, but for a
  different reason and with a different granularity — the funnel sibling owns
  it and needs distinctions this technique deliberately collapses. Do not
  share one collapsed enum between a status page and a conversion metric.
