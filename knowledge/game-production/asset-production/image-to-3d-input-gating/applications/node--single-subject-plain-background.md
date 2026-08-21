---
layer: application
type: application
subject: image-to-3d-input-gating
technique: single-subject-plain-background
stack: node
status: forged
verified_on: 2026-08-20
---

# Enforcing the isolation criterion at the line that spends credits

The rubric in `src/lib/visual-gen/input-gate.ts` is only worth what its call site enforces.
This is that call site, in the PoF repo (`C:\Users\kazda\kiro\pof`).

## The gate that had no callers

The file header records the incident in its own words:

> `ran: false` is deliberately NOT a pass. Until this shipped, `gateInputImage` had zero
> callers — the forge posted the raw image straight to the paid generation — so the credit
> saving this file's header claims was never realized.

A tested, documented, pure-cored gate, and the paid path went around it. This is the
canonical shape of `compiling-is-not-wiring` for a quality gate, and it is why the header now
carries a **WHERE IT RUNS** clause naming the route by path rather than a claim about savings.

## The enforcement point

`POST /api/visual-gen/generate` (`src/app/api/visual-gen/generate/route.ts:103-115`) runs the
gate for every `image-to-3d` submit **before** any provider job starts:

```ts
inputGate = image
  ? summarizeInputGate(await gateInputImage(image, { subject: prompt?.trim().slice(0, 120) || undefined }))
  : inputGateUnavailable('imageDataUrl is not a base64 image data URL the vision seam can read');
const refusal = inputGateRefusal(inputGate);
```

On a refusal the route returns 400; otherwise the outcome rides on the 202 as `inputGate`
(`route.ts:149`, `:170`) so the caller sees the verdict either way. Line 162 carries a
deliberate absence: a `text-to-3d` submit has no input image, so it reports no gate rather
than a passing one.

## Three states, one refusal function

`InputGateOutcome` (`input-gate.ts:104`) is a union of exactly the three honest states:

- `{ ran: true, verdict, score, reasons, overridden?, note }`
- `inputGateUnavailable(reason)` → `"input gate unavailable: <reason> — image submitted ungated"`
- `inputGateSkipped()` → `"input gate skipped: the caller sent gateInput: false — image submitted ungated"`

Skipped is *stated, never inferred from a missing field*. Both non-running states stamp the
artifact "submitted ungated" in the note that travels with the job.

`inputGateRefusal` (`:141`) is one pure line — `if (!outcome.ran || outcome.verdict !== 'fail')
return null` — carrying the comment that makes the asymmetry explicit: *"Only a verdict the
gate actually PRODUCED can refuse: an unavailable gate has measured nothing and therefore
cannot condemn an image."* Keeping "which states cost money" in a single pure function is what
makes the rule testable instead of re-derived at each call site.

## The override is explicit and stamped

The refusal text names the fix in the isolation criterion's own vocabulary — *"Fix the concept
image (one subject, plain background, near-canonical uncropped pose) or resubmit with
`overrideInputGate: true` to generate anyway."* Taking the override runs
`inputGateOverridden` (`:151`), which appends `— OVERRIDDEN by the caller; generation ran
anyway` to the note. The escape hatch exists, it is a named request parameter rather than a
default or a config value, and using it is permanently visible on the artifact.

## Where the criterion came from

The prompt's isolation clause mechanizes a practice that previously lived only in prose:
`src/lib/visual-gen/reference-roles.ts:74-130`, *"For image→3D, isolate the subject on a plain
(white/neutral) background"* — "busy or textured backgrounds bleed into the mesh — the
generator reconstructs background geometry as floaters, fused blobs, or surface artifacts …
this is upstream of, and complements, the runner background-removal step." That last clause is
the ordering rule in practice: automated background removal in the runner is a repair, and the
gate is upstream of it, so an image that only passes *after* removal is a middle-band image
that was prepared, not a clean input.
