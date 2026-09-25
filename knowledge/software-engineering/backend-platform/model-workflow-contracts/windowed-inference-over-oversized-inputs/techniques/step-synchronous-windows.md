---
layer: technique
type: technique
subject: windowed-inference-over-oversized-inputs
technique: step-synchronous-windows
status: forged
laws: [one-authority-per-vocabulary, derivation-names-recomputation]
shared_with: []
use_when: [running an iterative or sampling model over windows because the whole input does not fit, a windowed refinement pass shows detail that changes abruptly at a window boundary although the geometry lines up, handing the finished tail of one window to the next as fixed context and still seeing a seam, choosing between window-major and step-major order for a multi-step model, deciding what state must stay resident for a windowed multi-step run]
---

# Step-synchronous windows

Everything else in this subject assumes a model that maps a window to a
prediction in one pass. The window runs, its prediction is weighted into the
canvas, and after the last window the canvas is divided once. The seam that
procedure removes has one cause: a border position was predicted without the
context the model was trained to have, and the neighbour that saw it near its
centre gets the larger say.

An **iterative** model breaks that assumption without breaking any of the code.
A sampler that refines a state over a fixed number of steps, a denoiser, a
multi-pass refiner: each is still a function from a window to a result, so the
one-pass procedure runs. Each window is taken through all of its steps, the
finished results are stitched with the tapered weights, and the output has a
seam anyway. It is a different seam, and no taper, overlap fraction or weight
floor removes it.

## Two windows made two different decisions

An iterative model commits to its content gradually, and it commits to the
coarse structure in the early steps. Two windows run to completion one after
the other make those early commitments separately. In the overlap they are two
independent answers to the same question. A stochastic sampler draws its
detail from different noise in each. A deterministic refiner starts from a
different surrounding context in each and settles into a different local
solution. The two results agree on what the conditioning fixed, such as
geometry, layout and identity, and disagree on what it left open: texture,
small objects, the exact shape of a highlight.

Blending two confident, different answers does not produce a better answer. It
produces a crossfade. The tapered weight moves the crossfade toward one side,
and a wider overlap makes it longer. Neither removes the moment where one
window's version of the picture turns into the other's. On a sequence that
moment is a single frame at the window boundary, where a patch of flowers
suddenly takes a different shape or a panel switches style. Viewers find it
much more readily than a truncated-context seam, because it is a change and
not a blur.

The obvious repair also fails, and it is worth recognising early. Pass the
finished tail of window one into window two as fixed context, the way a
continuation is conditioned. Geometry now lines up across the boundary,
because window two was told what the tail looks like. The detail still drifts,
for two reasons. Window two's early steps committed its own coarse structure
before the handed-over tail could constrain its interior. And window one never
learned anything from window two. The handoff is one-directional and reaches
only the final state. A practitioner who built exactly this watched the detail
change at the transition frame and abandoned it for the rule below. That is
one account, n=1, and it matches the failure the order of the loops predicts.

## The rule: every window reaches step k before any window takes step k+1

Change the order of the loops. The one-pass procedure is window-major: for each
window, all steps. The iterative procedure is **step-major**: for each step,
every window advances by one step from the shared canvas state, and the results
are reconciled into the canvas before any window takes the next step. Each
window's next step reads a canvas its neighbours have already written into, so
the early commitments are negotiated across the overlap while they are still
soft. Nothing has to be blended apart at the end.

The reconciliation is the rule this subject already owns. Within a step, it is
[overlap-weighted-stitching](./overlap-weighted-stitching.md) unchanged: two
canvases, the schedule-derived normaliser, one division. The only thing that
changes is how often it runs. The division happens once **per step** rather than
once per run, and each division sets the state the next step starts from. Fusing
overlapping diffusion paths this way, by averaging their per-step predictions over
the overlap, is the published construction for panorama-scale generation from a
fixed-size denoiser. There it is the solution to a per-step least-squares
problem, and that solution is the normalised weighted average this subject
already computes.

Four consequences follow from the change of order, and each one is a way to
build the step-major loop wrong:

- **The normaliser is still built once.** It depends on the schedule, the
  weight map and the output size, not on the step. Rebuilding it per step costs
  a pass over the slice list for every step and buys nothing.
- **Per-step randomness is a function of position and step, never of window.**
  A sampler that injects noise at each step must give a shared position the
  same perturbation whichever window reads it. The simplest way is to draw it
  once over the whole canvas and slice it per window. Deriving it from the
  position's own coordinates works equally well, and it keeps working when the
  canvas is too large to hold a noise field. Two windows that draw their own
  noise for a shared position inject two different perturbations into the
  overlap at every step, and that recreates the independent decisions this rule
  exists to prevent. The seed identifies the run, so a per-window seed is a
  second authority for the same value
  ([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).
- **The step schedule is global.** Every window is at the same step, on the same
  point of the noise or refinement schedule, when its prediction enters the
  canvas. A window that is a step behind contributes a state from a different
  schedule point, which is a different kind of quantity. Averaging it in is a
  unit error, not a weighting choice.
- **A handoff within a step is order-dependent. An average is not.** The
  sequential variant, where window one's step-k output conditions window two's
  step k, is step-synchronous and removes most of the drift. But it has the
  flaw the one-canvas running mean has: arrival order sets the weight, the first
  window dominates every overlap, and reversing the scan changes the result.
  The weighted average over the overlap gives the same result for any scan
  order, and it is the default.

## What it costs

The number of window-steps is the same: steps times windows, in either order.
The cost is in residency. Window-major keeps one window's state alive at a time
and needs the canvas only at the end. Step-major keeps the **whole state
canvas** alive for the whole run, because every window's next step reads it.
It also touches the canvas once per step instead of once. When the canvas lives
off the accelerator under
[split-device-inference-and-stitching](./split-device-inference-and-stitching.md),
the transfer count per window is multiplied by the number of steps. That is
usually the term that decides whether the placement still pays.
[failure-driven-memory-degradation](./failure-driven-memory-degradation.md)
still applies, with one caution. A rung that changes the window size between
steps changes the schedule mid-run, so the only safe descent point is before
step one.

The residency buys a second property the one-pass procedure never needed. The
full-resolution state is never materialised in one piece on the accelerator, so
a windowed iterative pass can refine an input longer or larger than any single
window could hold. When the model's own limit is the reason for windowing, that
is the point of the design, not a side effect.

## Decision rules

When the model makes one pass, use the one-pass procedure; nothing here applies.
When it iterates and its early steps commit content that its conditioning does
not pin, run step-major, with averaging within each step and canvas-level
noise. When it iterates towards a unique fixed point, as a contraction solver
does, window-major may converge to the same answer. Measure the overlap on a
held-out input before assuming it. When a windowed iterative pass shows a seam,
first check whether the two sides differ in *geometry* or in *detail*. A
geometry seam is a context or coverage problem, and the one-pass fixes apply.
A detail seam, where the two sides agree on layout and disagree on texture, is
the signature of window-major order, and no overlap setting will remove it.

## When not to use this

When the pieces are meant to be separate, such as two shots with a cut between
them or tiles that are each their own image, there is nothing to negotiate, and
running them in lockstep couples choices that should stay independent. When the
windows do not overlap, there is no shared position to reconcile, whatever the
step order. And when a later pass will refine the whole result again, as when a
draft pass feeds a full-sequence refinement, the draft pass may run window-major
and pay only for the geometry to line up. What must be step-synchronous is the
*last* pass that decides detail.
