---
layer: technique
type: technique
subject: unattended-build-loop
technique: review-at-the-fan-out-point
status: forged
laws: [unmeasured-is-not-a-pass, no-gate-self-certifies, a-budget-shapes-the-output]
shared_with: []
use_when: [an unattended plan has an item several later items build on, the first instance of a repeated kind is about to be copied across the rest, a run is watched intermittently rather than continuously, deciding when an unjudged item's review is due rather than whether]
---

# Review at the fan-out point

A review agenda emitted at run end is correctly timed for an item whose defect stays
where it is. It is late for the item other items are built on: the first character a
roster is cut from, the consistency pass six modules are styled after, the shared card
a screen set reuses. Call such an item a **fan-out point**. A perceptual defect in it is
not one defect. Every dependent launched after it inherits the defect, and by run end the
reviewer meets it N times, scattered across areas, with the root one line among many.

This technique moves the review request for a fan-out point to the moment the point
decides, bounds how long its dependents wait for an answer, and orders the run-end agenda
so the root is read first.

## The mechanism it catches

An unattended loop releases dependents on a completion status, and completion is
certified at whatever rung returned a verdict. For most plans that is the shape rung: the
build passed. So the fan-out proceeds on exactly the verdict the coverage agenda refuses
to trust, and the agenda that would have flagged it is assembled only after the
dependents have been built, repaired and promoted on top of it.

The size of that gap is measurable from a recorded run without re-running anything: count
the sessions launched on a fan-out point whose required rung never returned a verdict. In
one set of recorded runs where the perceptual gate was configured and never judged, three
fan-out points were decided on the build gate alone, and 104 sessions - about nine hours
of agent time - ran on top of them before anything asked for a look. A creator-reported
36-hour build shows the same shape from the outside: a held-item defect in the first
character reappeared across every race and class built after it, and it was noticed only
when the finished game was played.

## Why not simply hold the line

Manufacturing's first-article rule stops the line until the first part is inspected, and
the rule is right where an inspector is standing at the line. An unattended loop usually
has no inspector, and a perceptual gate that cannot run returns no verdict at all. Under
those conditions a hold is a required gate by another name. In the same recorded runs,
holding every dependent until a perceptual verdict arrived completed 9 of 85 areas
instead of 85. That is the coverage technique's forbidden fix arriving by a longer road:
success becomes unreachable, and the run burns its budget waiting.

So the hold is **bounded**, and the bound is priced by whether anybody can answer inside
it. The request is the part that always pays. The wait pays only when somebody reads it.

## The procedure

1. **Mark fan-out points when the plan is built.** An item with two or more direct
   dependents, or an item declared as the template for a repeated kind. This is
   structural, read off the dependency graph, and needs no judgment. Where the plan can
   say so, mark which edges carry the *presentation* rather than a schema. A dependent
   that consumes the root's data model does not inherit its look.
2. **When a fan-out point decides below its required rung, raise the request then.**
   Send it to whatever channel the operator already reads mid-run: a progress journal,
   a notification, the log line they watch. Carry the evidence the loop does have (a
   captured frame, the diff) and the count of dependents about to inherit the verdict.
3. **Hold its dependents for a bounded window** while the loop works elsewhere,
   independent items first. The window is a budget stated in the run's configuration, in
   minutes or iterations, never an open wait.
4. **On a verdict:** a pass releases the dependents at the rung reached, and a fail routes
   to repairing the root before any dependent launches. A fail found after dependents
   launched makes those dependents the rewind's candidates. The last green snapshot
   before the first inheritor is the natural target.
5. **On window expiry, release the dependents tagged as inheriting an unjudged root.**
   They count under the self-reported basis only, like any shape-verified item, and the
   tag names the root.
6. **At run end, order the agenda by root.** List each unjudged fan-out point first, with
   its inheritors grouped beneath it. Grouping is not deduplication. An inheritor can
   carry a defect of its own, so its items stay on the agenda. What changes is that the
   reviewer's first read lands where one fix reaches N items.

## Decision rules

- **When nobody reads the run until it ends, set the window to zero.** Keep the tagging
  and the root ordering. A hold nobody can answer only spends wall-clock.
- **When the run is watched intermittently, this is where the technique pays.** Examples
  are an operator glancing at a journal between other work, or checking in once before
  sleep and once after. Size the window to that operator's response latency and route
  the request to where they already look. Mid-run steering prompts that arrive unasked
  about the first instance of a kind are this request made by hand, late.
- **When the perceptual gate actually works, the gate is the request.** The window is the
  gate's own run time, and nothing reaches the human.
- **Never let the window grow run over run until it is a required gate.** A window
  raised every time a defect slips through converges on infinite. Once a root's defects
  keep slipping through, the fix is a gate that can judge it, not a longer wait.

## The planning-side sibling

Production planning freezes a closed vertical slice as the reference standard for the
broad pass, and that is right. This technique is the loop-side condition under which the
freeze is safe: a slice closed on the shape rung freezes an unjudged standard, and the
broad pass copies it faithfully. Where a planner declares a slice, its terminal step is a
fan-out point by construction.

## When NOT to use this

- **Under continuous supervision.** A human watching every instance land is already the
  inspector at the line.
- **For items with no dependents, or dependents that inherit only data.** The run-end
  agenda is correctly timed for a defect that cannot spread.
- **As a reason to make the perceptual gate required.** The request and the bounded hold
  exist because the gate is absent or unreliable. If the gate works, use it. If it does
  not, a longer hold only relocates the stall.
