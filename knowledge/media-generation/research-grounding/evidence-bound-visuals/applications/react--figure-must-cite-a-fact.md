---
layer: application
type: application
subject: evidence-bound-visuals
technique: figure-must-cite-a-fact
stack: react
status: forged
verified_on: 2026-08-19
---

# Figure-must-cite-a-fact in the Gravitone frames validator (React/TypeScript)

The Gravitone video studio (`C:\Users\mkdol\dolla\gravitone-gcloud`) realizes
the technique as a typed frame model plus a rejecting parser that sits
between the LLM direction pass and the compositor. Nothing reaches the
render that did not survive the gate.

## The typed text layer

`app/_phases/frames/frames.ts` defines the frame as three layers whose split
the header comment calls "an EPISTEMIC one rather than a stylistic one"
(`frames.ts:3-25`). The text layer is typed by role exactly as the technique
prescribes:

```ts
export type TextRole = "caption" | "figure" | "label" | "kicker";

export interface FrameText {
  id: string;
  role: TextRole;
  value: string;
  ...
  /** The notebook fact this asserts, when it asserts one. A figure with no
   *  factId is a number nobody checked — the gate Step 3 exists to hold. */
  factId?: string;
```

(`frames.ts:49-60`.) The binding is by identifier (`factId` into the
research notebook), not by restated content — the doc comment states the
gate's rationale in one line.

## The rejecting validator, both checks

`app/_phases/frames/sceneSpec.ts` parses each model-produced scene spec.
The figure gate is enforced, not requested (`sceneSpec.ts:157-166`):

```ts
const factId = tx.factId ? String(tx.factId) : undefined;
// The integrity gate, enforced rather than requested.
if (role === "figure" && !factId)
  throw new SceneSpecError("A figure cites no fact. Every number on screen must be traceable.");
if (factId && !knownFactIds.has(factId))
  throw new SceneSpecError(`It cites "${factId}", which is not in this notebook.`);
```

Both rejecting steps from the technique are present: the missing citation
(`role === "figure" && !factId`) and the *fabricated* citation — an id that
does not resolve in `knownFactIds`, the set built from this project's
notebook. The second check is the one that catches a generator inventing
plausible ids, and the error message names the epistemic offense rather
than the schema violation.

## Per-unit rejection, priced in

The review function's own comment (`sceneSpec.ts:179-189`) records why
findings are collected per beat instead of thrown on first defect: "Direct
the cut" is a multi-minute LLM call over the entire script, and failing the
batch "discarded every good scene the model produced and charged the user
again to find out whether it was a fluke." A bad scene is still rejected —
"nothing here is more forgiving than it was — it just no longer takes its
fifteen siblings down with it." This is the technique's per-unit rule
motivated by real money: batch-fail semantics were tried first and paid
for.

## What the validator deliberately does not check

The same file documents restraint (`sceneSpec.ts:130-133`): motion strings
get no verb whitelist, no duration vocabulary — "Nothing has measured
those, and a validator built on an impression rejects good direction with
total confidence." The fact gate is hard because traceability is a
checkable property; style vocabulary is not gated because no measurement
backs a rule. The pairing shows the boundary of the technique honored in
both directions.

## Confirmations and upward lessons

- **Confirmed:** role-typed text layer, id-binding, dual rejecting checks,
  prompt-side instruction (`pipeline/FRAMES-SCENE-PROMPT.md:40`: "Every
  figure must cite a fact id") backed by validator-side enforcement.
- **Upward lesson taken into the technique:** per-unit rejection when the
  generating call is expensive (`sceneSpec.ts:179-189`), and the
  don't-gate-the-unmeasured restraint next to the hard gate.
