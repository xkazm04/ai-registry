---
name: feature-walkthrough-capture
version: 0.1.0
status: seed
domain: creative_design
path: creative_design/video
---

# Feature walkthrough capture from the running app

The rendered view of [`recipe.json`](recipe.json). When the two disagree, the JSON is
right and this file is stale.

**Need.** A feature nobody can watch has to be explained by hand every time. A
walkthrough recorded from a guessed script shows screens the app does not produce, and
one recorded against a live instance with no prepared state shows a loading spinner
where the feature should be, or somebody's real data standing in for a sample.

**Input.** The implementation of the feature to be shown, a running instance in a known
state, whatever capture tooling exists on the machine, and where the result will be
watched.

**Core action.** Read the code first so the walkthrough follows the path a real user
takes, put the app into a state that will show the feature rather than the empty case,
then drive that path live and pace the capture for a viewer rather than for the machine.

**Output.** A walkthrough artifact recorded against a named build, legible at the size
it will be watched, accompanied by the steps in writing, with any limitation of the
available capture method stated in it rather than hidden.

## Activities

1. Read the implementation to establish the real user path and what it needs to be in
place *(observe)*
2. Establish what capture the machine can actually do *(observe)*
3. Plan the steps, their pacing and the state the app has to be in before recording
*(decide)*
4. Drive the path in the running app and capture it *(act)*
5. Check the capture for legibility at the size it will be watched and for anything that
should not be in frame *(decide)*
6. Deliver the artifact with its build, its written steps and its stated limitations
*(deliver)*

Linear and branch-free, by contract. This is the shape of the work, not a runbook.

## Outcomes

**Any feature worth showing has a current walkthrough that matches what the app does
today.**

- Each walkthrough records the build or commit it was captured against, and the parts of
  the implementation the path went through, so a later change makes it detectably
  suspect rather than silently wrong.
- A walkthrough whose screens no longer match the app is marked stale rather than served
  as current.
- A capture that failed produces a stated reason, never a silently empty file or a video
  of an error page.

**The walkthrough follows the path a real user takes, grounded in the code that
implements it.**

- The steps shown correspond to the implemented flow rather than a guessed one,
  including whatever the flow requires to be true before it can be reached.
- The app is in a state that shows the feature working, so an empty list or a spinner is
  not captured as though it were the thing being demonstrated.
- A limitation of the capture method available on this machine is stated in the artifact
  rather than hidden behind a lesser one.

**The result can actually be used by the person it was made for, including someone who
cannot watch it.**

- The interface text is legible at the size the artifact will be played, not only at the
  size it was captured.
- The steps exist in writing beside the artifact, which is both the accessible
  equivalent and the only part that survives being searched.
- Nothing is in frame that should not leave the machine: real names, real customer data,
  tokens, notifications, other people's work.

## Guidance

Read the code first, or the walkthrough shows a path the app does not have. Put the app
into a known state before recording, because a live instance will otherwise hand you a
loading spinner as the feature and somebody's real data as the sample. Pace it for a
viewer, who needs a moment on each screen to read it. Check the text is legible at the
size it will be watched rather than the size it was captured. A silent capture still
needs its steps written down.

## Where this is worth adopting

- A team whose support answers the same how do I question with a freshly typed paragraph
  every week, because the answer is four clicks and there is nothing to point at.
- A product whose features page carries screenshots taken fourteen months ago, where
  nobody can say which of them still match the app and checking means opening each one.
- An onboarding flow that shipped last sprint and which nobody outside the team building
  it has watched work from beginning to end.
- A team that records its demos by hand before every release, one person and one
  afternoon each time, and skips it whenever the release is late.
- A company that once published a demo showing a real customer's name in a table, and
  now reviews every capture frame by frame at a cost nobody budgeted.

## Connector types

`development`, `browser_automation`.

Types, never connectors. Adoption resolves each to any connector whose catalog
`categories` include it, and the concrete knowledge lives in [`examples/`](examples/):
[codebase](examples/codebase.md) for `development`,
[desktop_browser](examples/desktop_browser.md) for `browser_automation`.

## Recommended trigger

`self_paced`. Act when a feature has shipped without a walkthrough, when the screens in
an existing one no longer match the app, or when the operator asks. A stale set is
worked down over time rather than recaptured wholesale, and the judgment about which one
is worth doing next is exactly what a clock cannot make.

A recommendation is a default, not a binding: the adopter assigns the real trigger at
adoption or later.

## Personalization needs

- Which app and which of its surfaces are worth recording, because recording everything
  produces a library nobody watches and a maintenance load nobody agreed to.
- Who the walkthrough is for, since an internal review capture, an operator memory aid
  and a public demo differ in pacing, in annotation and in whether narration is needed
  at all.
- Where the result will be watched and at what size, because that is what decides the
  viewport and whether the interface text will be readable.
- What capture tooling actually exists on this machine, so the adopter is not promised
  video where only stills are possible.
- What must never appear in frame for this adopter, which is a policy question rather
  than a technical one and is the one thing a later reviewer cannot fix.

## Dependencies

- a running local instance of the app being demonstrated, reachable and in a state the
  walkthrough can use
- browser automation tooling on the machine, which sets the artifact ceiling: without it
  the recipe degrades from video to stills
