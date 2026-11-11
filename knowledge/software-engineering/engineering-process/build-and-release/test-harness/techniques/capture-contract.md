---
layer: technique
type: technique
subject: test-harness
technique: capture-contract
status: forged
laws: [gate-sees-target, failure-not-empty-success, absent-guard-is-loud]
shared_with: []
applied: blind-ab
ab_verdict: better
use_when: [a screenshot or capture tool is the only way a gate or critic sees the product, a visual gate or vision-model critic judges captured frames, a capture step waits a fixed delay before the shot, pixel baselines flake on an unchanged build, console errors are recorded but do not fail the capture run]
---

# The capture contract is the product's obligation

When a gate - a pixel diff, a vision-model critic, a human reviewer of a gallery - sees
the product only through one capture tool, the capture is the product as far as the gate
knows. A capture that depends on timing, live data or luck turns every verdict into a
measure of the capture, not the build. The fix is not a smarter harness. It is a
**declared contract the product upholds**, and a build that breaks it is broken, the same
way a build that fails to compile is.

## The four clauses

1. **A readiness signal the product sets.** Each view announces when it has settled
   (data loaded, fonts and images decoded, first stable frame) through one declared
   global or attribute. The harness waits on it with a bounded timeout; it never waits a
   fixed delay or for network idle, which say nothing about the view.
2. **A deterministic view enumeration.** The product declares the views to capture (and
   for animated content, the frames, through a frame-addressed render call), and every declared view must be
   captured. A view the harness cannot reach is a failure, not a skip.
3. **No dependence on wall clock, randomness, input or live data in capture mode.** The
   product exposes a capture mode with a fixed clock, seeded randomness, paused or
   frame-addressed animation and fixture data. A lint over the capture surface can
   forbid the raw sources (`Math.random`, `Date.now`, `requestAnimationFrame` loops,
   running transitions, network fetches).
4. **Zero console errors.** An error during capture fails the run; recorded-but-passing
   errors are how a broken view enters the baseline.

## Decision rules

- **When a verdict is drawn from captures, a contract breach fails the build** - the
  gate cannot tell a regression from a race, so the race must be made impossible.
- **When a capture's purpose is to show live state** (an alert snapshot, an uptime
  check, a production smoke shot), do not freeze it; wait for readiness only. The
  contract is for captures that are compared or judged against a baseline.
- **A missing baseline is not a pass**: the first capture of a view needs a reviewer
  before it becomes the reference.
