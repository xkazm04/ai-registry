---
layer: technique
type: technique
subject: interview-calendar-integrity
technique: three-valued-free-busy-unknown-is-not-free
status: forged
laws: [absence-of-evidence-is-not-evidence, a-candidates-process-never-stalls-on-your-constraints, meaning-does-not-live-in-a-label]
use_when: [designing a free/busy lookup against an external calendar, deciding what to return when an integration fails, rendering availability copy on a candidate or recruiter surface]
---

# Three-valued free/busy — unknown is not free

## The concern

A conflict lookup against a calendar you do not own has three possible outcomes,
not two. It can find a conflict, find none, or fail to find out. The third
outcome occurs constantly in production — expired grants, revoked consent, rate
limits, timeouts, an interviewer who never connected anything — and it is the
only one that a boolean return type cannot express.

When the type cannot express it, the code must coerce it, and both coercions are
wrong in a way that is invisible:

- **Unknown coerced to free** offers times that are actually taken. The system is
  never louder or more confident than at the moment it is most wrong. Nothing
  errors, nothing alerts, and the failure surfaces days later as a person who
  did not turn up.
- **Unknown coerced to busy** hides real availability, produces an empty or
  near-empty grid, and stalls a candidate over an infrastructure fault they
  cannot see or influence.

The absent third value is not a nicety. It is the whole discipline
([absence of evidence is not evidence](../../_laws.md#absence-of-evidence-is-not-evidence)).

## The procedure

1. **Type the result with three states.** The lookup returns a value that names
   which of *not connected*, *unavailable*, or *checked* occurred, and only the
   third carries a set of busy intervals. There is no nullable boolean and no
   empty-list-means-fine convention anywhere in the chain.

2. **Never collapse at a boundary.** The third value must survive every hop it
   crosses — the client wrapper, the availability service, the API response, the
   view model. Each layer that flattens it to "no conflicts found" reintroduces
   the original bug one level further from where anyone will look for it.

3. **Define the degraded output as the pre-integration output.** When the status
   is not *checked*, the caller returns exactly the list of times it would have
   proposed if the integration had never been built: the full configured grid,
   with only the constraints you own applied — business hours, the booking
   window, business days, your own existing bookings. The integration is a
   *filter over an already-correct list*, so skipping the filter is always safe.
   Never return an error, an empty list, or a partial list in this case.

4. **Attach the status to the payload, not to a log line.** The status travels
   with the times so every consumer can decide what it may claim. A status that
   exists only in telemetry cannot stop a surface from rendering a green tick.

5. **Distinguish the two non-checked states in what you record.** *Not connected*
   is a steady-state fact about a person's setup and requires no alarm.
   *Unavailable* is an incident signal: a grant that used to work stopped
   working. Merging them makes a chronic token expiry indistinguishable from an
   interviewer who never opted in, and it will stay invisible for as long as the
   merge lasts.

## Decision rules

- **When the lookup fails, offer the unfiltered grid** — never an error and never
  an empty list — because scheduling must work at least as well without the
  integration as it did before it existed
  ([a candidate's process never stalls on your constraints](../../_laws.md#a-candidates-process-never-stalls-on-your-constraints)).
- **When the status is not *checked*, no surface may claim a calendar was
  consulted.** No "conflict-free", no "we checked their calendar", no
  affirmative badge. The word must key off the state, not off what reads well
  ([meaning does not live in a label](../../_laws.md#meaning-does-not-live-in-a-label)).
- **When a busy interval is returned but its bounds are malformed or its span is
  implausible, treat the whole lookup as unavailable** rather than partially
  applying it. A half-trusted filter silently removes real availability.
- **When the integration is slow, time out into *unavailable*.** A lookup that
  blocks a candidate-facing page indefinitely has already failed; a short timeout
  with a correct third value is strictly better than a long wait for a possibly
  correct second value.
- **When a caller wants a boolean for convenience, derive it — never store it.**
  A single derived flag meaning exactly *the status is checked* is fine and
  useful. A second boolean persisted alongside the status is a duplicate truth
  that will drift, and it will drift toward the optimistic value.
- **When the status enum is a canonical list, guard it against every catalog that
  renders it.** A new status added without its copy shows a raw key or, worse, a
  blank where a caveat should be. Enforce set-equality between the enum and the
  message catalog mechanically, in every locale, so the enum cannot grow a member
  that no surface knows how to explain.

## When not to use it

- **When the calendar is a system you own and operate**, and its unavailability
  is your own outage rather than a third party's, you still need the third value,
  but the degraded behaviour may reasonably differ: an internal store being down
  can be a fail-fast condition because the whole product is down anyway.
- **When there is no fallback list to fall back to.** If your product genuinely
  cannot propose times without the external calendar, three-valued typing alone
  will not save you — you have a hard dependency, and the correct fix is to
  build the constraint model that lets you propose times on your own, not to
  dress the dependency up in a nicer type.
- **For questions the calendar is not authoritative about.** Whether an
  interviewer is *willing* to take a slot, whether a room exists, whether a
  panel is complete — these are your model's facts, not the external calendar's,
  and giving them an unknown state just because they were fetched over a network
  confuses a data question with a policy one.

## The tell

You have this right when deleting the integration's credentials from a
staging environment changes the offered times **not at all**, and changes only
the status carried alongside them.
