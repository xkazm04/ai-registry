---
layer: technique
type: technique
subject: phone-controller-input-protocol
technique: answer-the-open-ask-by-id
status: forged
laws: [every-effect-on-the-rules-is-visible, refuse-rather-than-destroy]
shared_with: []
use_when: [a phone assists a turn-based session that the television leads, a companion screen could navigate or change session state, a companion request arrives after the host stopped asking, two screens can both move what the room is looking at]
---

# Answer the open ask by id

## The concern

The rest of this subject governs continuous controller input, where the phone streams state
and the host samples it. A turn-based companion is a different shape: the phone takes a
photo, types an answer, picks from a list, and the result changes what the session does
next. If the phone may write whenever it likes, two screens can both move the session. A
late answer lands on a screen the television has already left, or the person on the sofa
and the person holding the phone change what the room sees at the same moment. Nothing
errors, and nobody can say afterwards who moved it.

## Procedure

1. **The host opens an ask.** When the television needs something from the phone, it opens
   an ask with a kind and an id and shows on screen that it is waiting.
2. **Every companion write route names the kinds of ask it answers.** A request with no id,
   with an id that is not the open ask's, or with the id of an open ask of another kind gets
   a conflict answer and changes nothing.
3. **Spend the ask when the work begins, not when the request arrives.** A refusal before any
   work starts - bad input, busy - leaves the ask open for another try; a result or a failure
   of the work closes it.
4. **Navigation and session state are never companion writes.** Any route that navigates,
   seats a person, or opens content refuses every companion request, whatever id it carries.
   The host and in-process callers pass through as before.
5. **Walk the refusals on the device**: post each refused shape from the phone and compare
   the session state before and after. Unchanged is the pass.

## Decision rules

- When a companion feature needs to move the session, the host opens an ask for it; the
  phone never gains the move.
- When an answer arrives for an ask that has closed, refuse it visibly on the phone rather
  than applying it to whatever is open now.

## When not to use it

Continuous controller input - steering, aiming, held buttons - stays under the absolute-state
techniques of this subject; an ask per frame is the wrong shape. A session with no single
leading screen (a shared board both devices own) needs an arbitration rule, not this one.
