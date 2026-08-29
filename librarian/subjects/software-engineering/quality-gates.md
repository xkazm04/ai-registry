---
subject: quality-gates
domain: software-engineering
last_touched: 2026-08-29
touched_by: intake
dry_streak: 0
---

# quality-gates

First touch: [[2026-08-29-ai-native-sdlc-and-ci-on-call]], intake of a vendor SDLC
playbook batched with a first-party on-call account. Gained
`oracle-frozen-during-repair` (11 techniques now) and an amendment to
`gate-laddering`'s placement matrix (asking controls sit at stage boundaries).
Golden path gained one section after "The gate must see its target".

## What the gap actually was

A missing stage, the shape the 2026-08-22 findings had. The subject's law is that a
gate must *see* its target; the repair task adds that the gate must not be
*writable by* the party it gates, and no technique sat at the point where a fixer
holds write access to the test. The rule existed one stage later -
`proposal-not-push` reserves test deletion and gate configuration for a human at
the merge gate - so the technique is the same rule enforced early, and says so.

## Standing

Was the #2 attention point (27) and never swept. This run touched two techniques
and the golden path; it did not sweep the other nine. Six consumer deviations
remain unread.

## Declines

None.
