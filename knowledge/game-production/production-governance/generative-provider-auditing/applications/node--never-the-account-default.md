---
layer: application
type: application
subject: generative-provider-auditing
technique: never-the-account-default
stack: node
status: forged
verified_on: 2026-09-01
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# The imaging contract that reasoned about cost's basis and never about identity's

Gravitone is a Next.js/TypeScript production tool whose `lib/imaging/` module routes
image generation, editing and recognition across four vendors behind one capability
interface. Every call returns a `Provenance` record that is persisted with the asset,
because — as the file itself argues — "an asset outlives the response it arrived in, and
after the fact the vendor is not re-derivable from the pixels."

That record is where this technique's first decision rule lands, and the tree confirms
the rule by breaking it in the exact shape the rule predicts.

## The structural fact: one field got the epistemology, its neighbour did not

`lib/imaging/types.ts` carries a `CostBasis` discriminator — `vendor-reported` /
`estimated` / `unpriced` — and eight lines of comment arguing for its own existence:

> Without it a reader can only INFER whether a figure is a receipt or our own
> arithmetic — Playground did exactly that, by noticing when the number differed from
> its own estimate, and had to stay cautious whenever the two happened to coincide. An
> estimate presented as a receipt is the error worth spending two lines to make
> impossible.

That is this technique's decision rule — *a request parameter is a claim by the caller;
only the echoed identity is a claim by the party that did the work* — derived
independently, from a real incident, for a **number**. Immediately above it,
`model: string` sat required and unmarked, with no basis field of any kind.

Nobody designed that asymmetry, and it is better evidence than the change that followed.
The same file also gives `cleanup` a named-miss enum (`deleted` / `failed` /
`not-applicable`) for custody, and documents `reroutedFrom`'s absence as meaningful. Of
the four audited properties this subject enumerates, three had their epistemic status
modelled in the type and **Identity — the property the subject opens with — had none**.
A team that had already won this argument twice did not notice it applied a third time.

## What the tree was doing with the unmarked field

All five construction sites filled `model` from a caller-side constant, never from a
response. Three resolve it through the pattern this technique names explicitly as "the
same failure relocated":

```ts
const IMAGE_MODEL  = process.env.GOOGLE_IMAGE_MODEL?.trim()  || "gemini-3.1-flash-image";
const VISION_MODEL = process.env.GOOGLE_VISION_MODEL?.trim() || "gemini-3.6-flash";
const MODEL        = process.env.OLLAMA_VISION_MODEL?.trim() || "qwen3.8:27b";
```

An env var with a sensible default baked in, written into the artifact's provenance as
though the vendor had confirmed it. The remaining two are literals — Leonardo's
`"lucid-origin"` and Qwen's SKU ladder — caller-side in the same way, differing only in
that no environment can move them.

## Arms

The technique's own audit test is *"ask which model version produced it, and answer from
stored data rather than inference."* The measurable is therefore the fraction of
provenance construction sites at which a reader can determine the **basis** of the
recorded identity. Instrument: `tsc --noEmit`, the project's own gate, on both arms.

| Arm | Change | Sites declaring identity basis |
| --- | --- | --- |
| A | tree as it stood (`e79e04c`) | **0 of 5** — gate green, nothing to see |
| B | `modelBasis` added to `Provenance`, required | **5 of 5** — gate green |

Making the field **required** is what turned the gate into the instrument: the
intermediate typecheck failed at exactly five sites and named them, so the count came
from the compiler rather than from a reader's grep. Every one of the five error messages
displayed a `costBasis` on the same object literal — the asymmetry printed by the
toolchain, five times, without being asked.

All five resolve to `requested` today, which is the honest value: no adapter reads a
model identifier out of a response. `lint:ratchet` stayed at baseline, 0 errors.

## What this realization cannot do

- **It marks the claim; it does not upgrade it.** Every site says `requested`, so the
  record is now *honest* rather than *better sourced*. Recovering a genuine
  `vendor-reported` means parsing the identifier back out of each vendor's response
  shape — per-adapter work this change did not do. A reader who wants confirmed identity
  still has none; they can now tell that they have none, which is the whole delta.
- **`undisclosed` is declared but unreached.** The enum carries the state for a provider
  whose contract exposes no identifier, because that is the case the technique's *When
  NOT to use this* section governs. No vendor in the current roster is in it, so the arm
  is untested here.
- **The gate sees construction, not persistence.** `tsc` proves every new record declares
  a basis; it says nothing about records already stored, which carry no `modelBasis` and
  are indistinguishable from confirmed ones. Backfill is a data question this change does
  not touch.
- **Nothing here refuses anything.** The technique also asks that unattributable output
  be kept out of shipping classes. The type now makes attribution status *legible*; no
  gate reads it, so the shipping decision is still made by a human who may not look.
