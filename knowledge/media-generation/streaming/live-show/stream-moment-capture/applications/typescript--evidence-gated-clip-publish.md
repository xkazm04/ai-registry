---
layer: application
type: application
subject: stream-moment-capture
technique: evidence-gated-clip-publish
stack: typescript
status: forged
verified_on: 2026-10-21
verified_against: typescript@7
---

# The owner's gate in an operator console: a signature, a reason, and no override for a fail

How Shadowrunr OS (github.com/xkazm04/shadowrunr @ b1740fc), an AI-run villain livestream,
puts a person between its clip scorer and the public. The checks run in the Rust clip
factory; the TypeScript operator console is where a clip is approved, rejected or
published, and where the technique's states become acts a person can and cannot take.
Every citation below was opened on 2026-10-21, and the console's two clip action suites
(6 tests) passed on that tree the same day.

## The checks the console receives

The factory's gate states the technique's rule as its first line,
crates/shadowrunr-clips/src/gate.rs:3 "that could not run holds the clip as `unmeasured`, never passes it.",
reads the stream's state rather than the cut for care,
crates/shadowrunr-clips/src/gate.rs:9 "minutes before the window is still in care inside it.",
and holds on a fail or an unmeasured check alike,
crates/shadowrunr-clips/src/gate.rs:410 ".filter(|c| matches!(c.state, GateState::Fail | GateState::Unmeasured))".
Two of the technique's checks are not automated, and the module says so:
crates/shadowrunr-clips/src/gate.rs:27 "Context fidelity and caption support are the owner's to attest: approving signs them."

## The acts, as pure rules

The console's clip view model holds every rule as a pure function, so the views stay thin
and the rules are testable. Approval is refused unless the clip waits at the owner gate,
apps/console/src/pages/onair/clipModel.ts:49 "if (c.status !== ", unless its window fits
its band, apps/console/src/pages/onair/clipModel.ts:51 "if (c.window.needs_reauthoring) return",
and while any check failed,
apps/console/src/pages/onair/clipModel.ts:53 "a failed check holds whatever the score, and no override applies.".
An unmeasured check may be overridden, but only with a recorded reason,
apps/console/src/pages/onair/clipModel.ts:57 "The checks an approval would override (each needs the recorded reason).",
and the contract keeps the overridden hold reasons beside it,
crates/shadowrunr-types/src/clips.rs:321 "Required when a check was unmeasured; the hold reasons it overrode are kept beside it.".
The form will not submit without a signature, and without the reason when one is owed,
apps/console/src/pages/onair/ClipActions.tsx:41 "const ready = block === null && signature.trim() !==".
Publishing opens only after approval,
apps/console/src/pages/onair/clipModel.ts:61 "export const canPublish = (c: ClipCandidate): boolean => c.status ===",
and a rejection carries its reason, apps/console/src/pages/onair/ClipActions.tsx:94 "Reject with a reason".
The suite pins both edges of the override rule,
apps/console/src/pages/onair/clips.dom.test.tsx:3 "no approval over a failed check" and
apps/console/src/pages/onair/clips.dom.test.tsx:107 "asks for an override reason when a check is unmeasured".

This is stricter than the technique in one place, and the stricter reading is the better
one: the technique lets an operator override a hold with a recorded reason, while the
console allows that only for a check that could not run. A check that ran and failed is
final. Uploads remain dry runs,
apps/console/src/pages/onair/Layer2.tsx:55 "Uploads are dry runs: no credentials exist.",
so no clip has left the room.

## Deviations from the standard

**One unmeasured check holds almost everything, and the view does not say so.** On
2026-10-21 the store held 180 candidates; 145 were held, every one of them by
`no_open_correction` reporting unmeasured, 16 also by `injection_reply` and 2 by
`care_state` (the two care holds are fails; the rest are unmeasured). As stored, the
correction check's reason is that no corrections log exists yet, so the check cannot run,
and an owner approving any of those 145 clips must type an override reason for the same
missing file each time. The technique asks the gate's report to separate a clean show
from a gate that is not running; a funnel where 81% of holds come from one check that never
ran is the second shape, and the console shows each clip's reasons rather than that
distribution.

**The disclosure is fixed, not per surface.** Every render burns in
crates/shadowrunr-clips/src/render.rs:35 "AI character · synthetic media". That meets the
technique's revised rule, the show's own disclosure set by the show, but no adapter yet
checks a surface's own label requirement, because no adapter yet sends.
