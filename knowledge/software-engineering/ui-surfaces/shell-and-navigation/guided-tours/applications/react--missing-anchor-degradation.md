---
layer: application
type: application
subject: guided-tours
technique: missing-anchor-degradation
stack: react
status: forged
applied: experiment
ab_verdict: better
proof: ab-paired
verified_on: 2026-09-02
verified_against: react@19
---

# Missing-anchor degradation — React/Tauri implementation (Personas guided tours)

How the Personas desktop app (public repository, React 19 + Zustand + a
Tauri shell) realizes the
[missing-anchor-degradation](../techniques/missing-anchor-degradation.md)
technique, and what a paired experiment on the tree said about the technique's
central claim: that the degradation record is the integration's to write, not
the engine's to emit. Read at commit `47c1dd1d4` on 2026-09-02; the harness
ran under vitest 4 in jsdom and was deleted afterwards — no product code was
changed.

## The engine: an in-house spotlight with bounded patience

The tour is home-grown, not a framework-agnostic engine. The step rail
(`GuidedTour.tsx`) sets a `data-testid` for the current step 300 ms after
navigation; the dimming layer (`TourSpotlight.tsx`) follows exactly one node
matching that testid through a shared measurement hook
(`useTrackedElementRect.ts`). The hook is the technique's **bounded patience**
in its polling form: a 100 ms initial measure, then up to four 500 ms retries,
after which it reports the anchor missing — a fixed 2.1 s budget, with a
`MutationObserver` scoped to the anchor's parent for re-measures once found
(the mutation watch the technique prefers is used for *tracking*, the deadline
loop for *absence*). The spotlight renders nothing without a rect and its
overlay is `pointer-events-none`; the rail carries Next, Back and dismiss and
renders at its own layer regardless of the anchor.

## Structural fact 1: one global policy, chosen by omission

There is no per-step declaration. Every missing anchor takes the same path:
the spotlight sets a store boolean, `tourHighlightMissing`, and the narrative
deck shows a "not on screen yet" note while the step's text stays up and the
tour stays alive. That is the technique's **re-center** policy applied
globally — the guidance detaches from the anchor and keeps teaching — with no
**skip** available at all, not even as an opt-in. Steps that are purely about
the absent control (the Lab tab on a tier that lacks it, the Obsidian panel
without the binary) show their text beside a note saying the thing they
describe is not there. Nobody chose this; it is what a flag-and-continue
default produces, and it is the category error the technique names, in its
softer half.

## Structural fact 2: the record is a boolean the next step overwrites

`setHighlightMissing` is a plain `set({ tourHighlightMissing })`. The spotlight
clears it optimistically on every highlight change and again whenever a rect
resolves. So the record of a degradation lives exactly as long as the step
that suffered it. The persisted tour state (`persistCurrentTour`) carries
completion, dismissal, step index and completed sub-steps — never a
degradation count. A tour that completed after missing three anchors persists
byte-for-byte like one that hit every anchor. This is the technique's "skip
spelled like success", reached by a different road than the engines it
describes: not *no event*, but an event whose only memory is a flag the next
step resets.

## The paired experiment

**Arms.** A = the tree as-is: the transient boolean. B = an integration-written
ledger, which is what the technique prescribes when the engine emits no
durable signal — a `store.subscribe` on the rising edge of
`tourHighlightMissing`, recording the current step id and testid.

**Input.** The first three real steps of the `getting-started` tour and the
testid each would spotlight: `appearance-setup` →
`settings-appearance-panel`, `credentials-intro` → `credential-manager`
(its first sub-step's anchor), `persona-creation` → `agent-intent-input`.
Run twice: once with the **first** anchor removed from the document and the
other two present, once with all three present. Fake timers advanced past the
2.1 s patience budget per step. n = 3 steps x 2 runs.

**Read.**

| run | A: flag at tour end | B: ledger |
| --- | --- | --- |
| first anchor removed | `false` | `[{appearance-setup, settings-appearance-panel}]` |
| all anchors present | `false` | `[]` |

A cannot tell the two runs apart; B can. Verdict **better** for the
technique's claim that the ledger must be written by the integration, at the
one seam where that ledger would attach.

**Never-strand, verified at the first step.** With the first anchor removed
no dimming surface was painted at any point in the 2.1 s wait or after it —
the spotlight returns `null` without a rect, so there is no dim to strand
under, and the rail's exit controls do not depend on the anchor. The
technique's warning that the first step is the commonest failure site does not
bite here, for a reason worth naming: this engine never *walks* on a missing
anchor, so it has no "nowhere to walk from" state. The invariant holds by
construction, not by a guard.

## What this realization cannot do

- It cannot **skip**. A step whose subject is absent still shows its text
  and a note; there is no per-step policy, so the author cannot say "this
  step has no value without its control".
- It cannot **count**. Completion accounting, the persisted state and any
  telemetry see a degraded run and a clean run as the same fact; the drift
  gauge the technique wants does not exist. The next change this tree owes is
  a per-run degradation list (tour, step, testid, policy) written on the
  rising edge and cleared on tour start, with its length carried into the
  completion record.
- It cannot **distinguish "not yet" from "never"** beyond the fixed 2.1 s
  budget: a panel that renders later than that is reported missing and, if it
  then mounts, is re-found only by the next scroll, resize or mutation under
  its parent — there is no re-resolution on a document-wide change.
- The harness measured the store, not the screen: it confirms what the
  integration can *know*, not what a user sees. The rendered note in the deck
  was read from source, not asserted.
