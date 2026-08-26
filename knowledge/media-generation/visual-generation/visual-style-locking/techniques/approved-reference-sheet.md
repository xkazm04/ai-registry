---
layer: technique
type: technique
subject: visual-style-locking
technique: approved-reference-sheet
status: forged
laws: [style-is-restated-not-remembered, cost-per-usable-output]
shared_with: []
use_when: [building the image half of a style lock, deciding how many references to send per call, sizing a sheet against a model's reference window]
---

# Approved reference sheet

The reference sheet is the physical form of a ratified style: a small set of
rendered images, each individually approved by a human, attached as style
references to subsequent generations. It descends from the character sheet
of traditional animation — authored before any shot, consulted by every
shot — with one modern addition: the sheet is *generated from the style
block and then judged*, so every image on it has passed the same gate.

The sheet carries what language cannot. Text holds the nameable attributes —
exact colors survive on words alone — but the simplicity of shapes, the line
character, the amount of interior articulation a style permits: these
transfer through example or not at all. The sheet is the example. It is one
half of a two-channel lock, and only ever half: images without the restated
text block drift measurably, which is why the sheet never travels alone.

## What belongs on the sheet

- **Approved renders only.** A render becomes a reference the moment a human
  approves it, and not before. Pending renders are undecided; rejected ones
  are negative evidence and are never sent anywhere.
- **Varied subjects, one style.** A sheet of near-identical images teaches
  the model the subject, not the style. The useful sheet shows the style
  surviving *different* content — which is also exactly what proofing
  should have exercised.
- **Coverage of the element vocabulary.** If the project will need charts,
  maps, and captions in this style, the sheet should show the style
  carrying each. An element the sheet never demonstrated is an element the
  first production frame will improvise.
- **Lineage per image.** Each proof records what produced it — model,
  provider, cost, timestamp — so the sheet can be audited later and an
  image promoted elsewhere carries its history. Where lineage was not
  recorded, show absence, not a guess.

## The window and the send count are different numbers

Two limits govern the sheet, and conflating them causes real defects:

- **The reference window** is the *model's* limit — the maximum reference
  images a call accepts. It caps the **approved** images on a sheet, not
  the sheet's total. Counting rejections against the window turns a
  well-worked sheet into a dead end: the surface reports "full" while the
  model would happily accept every approved image, and the advice it then
  gives ("reject one to make room") does nothing at all. Rejections are
  records, not payload; only approved images occupy the window.
- **The send count** is *your* choice per call, and it should be well under
  the window. References are heavy — each is a substantial payload on
  every single call — and their value saturates fast: a handful of
  approved images makes the style unambiguous, and past that you are
  paying transfer time and tokens for agreement you already had. Pick the
  number where added references stop changing the output, and fix it as a
  named constant so cost estimates and actual sends cannot drift apart.

## Decision rules

- When a sheet's approved count reaches the model window, the only act that
  makes room is rejecting (or retiring) an approved image — say exactly
  that, and nothing else, on the surface.
- When choosing which approved images to send, prefer the ones closest in
  element vocabulary to the frame being generated — a chart-bearing frame
  is best anchored by the sheet's chart proof.
- When a style will be judged for consistency, condition on the sheet and
  measure against a control — the sheet's contribution is a claim, and
  claims are measured, not assumed.
- When a sheet must be discarded or rebuilt, present its accumulated cost
  honestly first — the sheet is paid-for evidence, and "unpriced" renders
  count as unknown cost, not zero.

## When the sheet holds a subject, not a style

The sheet descends from the character sheet, and when it carries an actual
character — an identity a motion model must hold, rather than a look — one of
its rules inverts and two tighten. "Varied subjects, one style" inverts to
**one subject, varied views**: the useful identity sheet shows the same face
and build from the angles the shots will need, because a view the sheet never
demonstrated is a view the first generation will improvise.

The two tighter rules exist because a motion model *locks onto* an identity
sheet rather than imitating it:

- **The identity-bearing surface appears exactly once, at maximum scale.** A
  sheet with the face in two panels — a close-up and a small head on a
  full-body shot — gives the model two candidates, and it picks
  unpredictably per take, which reads as identity drift downstream. Worse,
  the small face is a low-resolution identity, and the model reproduces its
  poverty of detail faithfully. The fix is cheap and looks strange: keep the
  full-body panel for build and costume and *remove its face*, so the
  close-up is the only face on the sheet. Practitioners converge on this
  independently because the alternative is rediscovered per project as
  mid-sequence drift.
- **Neutral, uncluttered ground.** A plain backdrop measurably raises the
  usable fraction of a batch, because nothing competes with the subject for
  the model's attention — and nothing from the sheet's background leaks into
  shots as invented set dressing.

The rest of the sheet discipline carries over unchanged: approved views
only, lineage per image, the window and the send count still different
numbers.

## When not to use it

Before any render has been approved there is no sheet, and generating
against an unratified image quietly promotes an unjudged render into a
standard. During onboarding and proofing, calls run on the text block alone
— that is the phase's job. And a provider that silently ignores reference
images must be routed away from, not sent a sheet that does nothing: an
unconditioned image in the wrong style is not a cheaper success, it is a
failure wearing one's clothes.
