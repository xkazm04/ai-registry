---
layer: application
type: application
subject: motion
technique: engine-selection
stack: react
verified_on: 2026-11-09
verified_against: react@19.3.1
applied: experiment
ab_verdict: better
---

# React application — what a transition does when the state moves again

The technique's interruption section names queue and collapse as a third answer
beside snap and retarget. This is the measurement behind it. `<ViewTransition>`
schedules through `startTransition`, and React's reference says it will "wait for
them to finish" and that "the next one will animate from B->D". Nothing in that
sentence says what the wait costs or how it differs from calling the platform.

## The experiment

A one-component page with React 19.3.1 and `<ViewTransition name="card">` around a
value, bundled with esbuild and driven by Playwright against Chromium 156, with
every snapshot animation at 800 ms. The value starts at A. B is set at t0, C at
150 ms, D at 300 ms. Five fresh pages per arm. `document.startViewTransition` was
wrapped to time each transition, and a mutation observer recorded what committed.

| Arm | How each set is scheduled | Committed | Transitions | Each transition's length (ms) | Set D to D committed (ms) |
| --- | --- | --- | --- | --- | --- |
| R | `startTransition` | A B D | 2 | 814-823, 829-861 | 526-543 |
| R2 | `startTransition`, sets 1100 ms apart | A B C D | 3 | 811-844 each | 8-12 |
| H | `startViewTransition` with `flushSync` per set | A B C D | 3 | 154-158, 150-156, 833-843 | 16-24 |
| F | `flushSync`, no transition | A B C D | 0 | none | 4-8 |

Target and floor were written before any arm ran. The target held in all five runs
of R. H and F were the controls. One instrument failed and was replaced before the
result was read: the first skip counter read `vt.ready` rejections, which only fire
for a skip before ready, so it reported zero in every H run while H was cutting each
transition off at about 154 ms. Duration is what shows it, and the table uses
duration.

## What it means

R2 is why this is a queue and not a collapse-everything rule. With nothing in flight
every state commits and animates. The collapse happens only to updates that arrive
during a running transition.

The cost is the D column, and the reference does not state it. Under R the value the
user last asked for reached the DOM about 530 ms after they asked, which is the
remainder of the running transition. Under H it took about 20 ms. Moving a
hand-rolled transition onto `<ViewTransition>` gives up that responsiveness in
exchange for never showing C, and whether that is the right trade depends on the
gesture.

A fleet tree does the hand-rolled form today: its deed transition runs
`startViewTransition` with `flushSync` inside the update, gated on the reduced-motion
preference. The H arm uses that shape. It was not changed by this measurement.

## What this realization cannot do

It is one browser and one transition duration. It does not test `<Suspense>` reveals
or `useDeferredValue`, which also activate view transitions. It does not say whether
a person prefers the collapse or the responsiveness, which is the question that
decides adoption at a real site.
