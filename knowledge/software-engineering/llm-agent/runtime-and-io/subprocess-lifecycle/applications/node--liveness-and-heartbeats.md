---
layer: application
type: application
subject: subprocess-lifecycle
technique: liveness-and-heartbeats
stack: node
verified_on: 2026-09-02
verified_against: node@24.14.0
applied: experiment
ab_verdict: better
proof: ab-paired
---

# One ceiling doing three jobs, measured against armed clocks

The app's headless reasoning turn is a spawned CLI child, and the runner
that owns it (`lib/claudeCli.ts`, the `runClaude` function) supervises it
with exactly one instrument: a ceiling timer started at spawn, floored at
thirty seconds so a garbage configuration cannot become "kill instantly".
The floor is the tree's own earlier finding — a tight timeout that routed
every call to the fallback while the probe still read green — and it is
correct. What the tree does not have is anything that arms on first contact:
no time-to-first-byte deadline, no activity clock reset by output, no
distinction between "never spoke" and "went quiet". The ceiling is the
startup bound, the stall detector and the executioner at once.

## The structural fact

The single timer forces the tree to size one number for three phases whose
honest bounds differ by an order of magnitude. A cold start of the child
runs tens of seconds (the floor comment says so: "the fastest real turn this
app makes is tens of seconds"); a stall mid-turn is worth noticing within a
minute; a whole turn may legitimately run ten minutes. One ceiling cannot be
right for all three, so it is sized for the third and the first two are
undetected until it fires. The tree's fallback ladder (`lib/text/router.ts`)
then descends on a `timeout` verdict that cannot say which phase produced it.

## What A and B were

A harness in the run's scratch space spawned three child shapes drawn from
what this runner actually meets — hang before the first byte, a slow cold
start followed by steady output, steady output followed by a hang — under
three supervision policies, with all durations scaled down by two hundred.

| Policy | Ceiling | Startup deadline | Activity clock |
| --- | --- | --- | --- |
| A-tight | 3000 ms | none | none |
| A-generous | 6000 ms | none | none |
| B | 6000 ms | 2500 ms to first byte | 1000 ms silence after first contact, reset per byte |

Read from the harness's own verdict per run, the predicate being "a working
child was killed" and "at what elapsed time was a hang detected".

| Child | A-tight | A-generous | B |
| --- | --- | --- | --- |
| hang before first byte | ceiling at 3011 ms | ceiling at 6018 ms | startup deadline at 2511 ms |
| slow cold start then work | **killed at 3079 ms, mid-work** | completed at 4701 ms | completed at 4688 ms |
| work then hang | ceiling at 3012 ms | ceiling at 6020 ms | stall detected at 1862 ms |

A-tight has one false kill and detects both hangs at the ceiling. A-generous
has no false kill and detects both hangs only at the ceiling. B has no false
kill and detects the two hangs at 42% and 31% of the ceiling. The harness
terminated at detection to read the time; the technique's rule that only the
ceiling kills a *stalled* child stands, and the startup deadline may
terminate because a child that never made contact holds no work.

## What this cannot show

The harness measured the runner's supervision shape, not the runner. The
real child is an external binary whose cold start and output cadence the
harness only imitates, so the numbers say the policy discriminates, not what
the right thresholds are for this app; those come from the class profile the
technique asks for and are not written anywhere in this tree yet. The next
change is a time-to-first-byte deadline and an activity clock in
`runClaude`, with the `timeout` verdict split into never-connected and
went-silent so the fallback ladder can tell them apart.
