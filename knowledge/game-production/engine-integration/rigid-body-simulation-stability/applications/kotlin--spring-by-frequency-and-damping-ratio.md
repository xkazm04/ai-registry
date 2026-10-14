---
layer: application
type: application
subject: rigid-body-simulation-stability
technique: spring-by-frequency-and-damping-ratio
stack: kotlin
status: forged
verified_on: 2026-10-14
---

# An exact-step integrator with a bounded correction, measured at five step sizes

The version witness for this stack is the managed project's build file, which is not cited
by path here; the numbers below come from that project's own test gate on 2026-10-14, run
as a scratch test that was deleted afterwards. No project name or source path is given.

## What the integrator does

A top-down vehicle model discretizes its first-order lags with the exact exponential form,
one minus the exponential of the negative step over the time constant, and clamps its
lateral correction to the sideways velocity that exists. Both choices are the techniques'
rules realized: the first removes the stability bound
(`spring-by-frequency-and-damping-ratio`), the second makes the correction unable to
reverse (`bound-actuation-by-the-lightest-coupled-body`).

## The measurement

The same steered-cornering input was integrated at 120, 60, 30, 20 and 15 Hz and compared
with a 240 Hz reference over a 2 s full-lock corner at 30 m/s (steer 1.0, throttle 1.0).
Reference: heading -1.969 rad, slip 0.409 rad, speed 25.33 m/s.

| step | heading error (rad) | slip error (rad) | position error (m) |
| --- | --- | --- | --- |
| 120 Hz | -0.0046 | -0.0015 | 0.256 |
| 60 Hz | -0.0137 | -0.0044 | 0.766 |
| 30 Hz | -0.0316 | -0.0105 | 1.768 |
| 20 Hz | -0.0490 | -0.0168 | 2.750 |
| 15 Hz | -0.0659 | -0.0233 | 3.706 |

Every value is finite at every step: the exact form removes the bound. The error is first
order in the step, roughly three times larger for a threefold longer step. A gentler corner
(steer 0.4) shows the same slope, 0.56 m at 60 Hz.

## What this realization cannot do

The exact step makes the model stable at any rate and says nothing about whether the result
is right at that rate. Four metres of position error at 15 Hz is stable and wrong. The
decision rule the measurement adds: the fixed step is part of the model; a variable step
needs a convergence check (the same input at two rates, a tolerance on position and heading),
not a stability check.

The project's existing step-size test integrates straight-line throttle only, with a
tolerance of 0.8 m at half rate. It does not exercise the yaw path, which is where the error
above lives, so it cannot see this. A convergence test has to drive the axis that carries
the error.
