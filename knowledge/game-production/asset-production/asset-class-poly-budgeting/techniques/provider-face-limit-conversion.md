---
layer: technique
type: technique
subject: asset-class-poly-budgeting
technique: provider-face-limit-conversion
status: forged
laws: [a-number-carries-its-unit-and-basis, one-authority-per-quantity]
use_when: [wiring a budget into a generation request, adding a second generative provider, a provider exposes a face or density parameter]
---

# Provider face-limit conversion

## The concern

The authored budget is in triangles. The service's density parameter counts whatever
topology the request asked for: in triangle mode a face is a triangle, in quad mode a
face is a quad and the same number therefore delivers roughly twice the triangles. The
conversion between the two is trivial arithmetic and is exactly the kind of trivial
arithmetic that gets done in someone's head, correctly, once, and then copied to a
second call site without the halving.

The technique is to make the conversion a named, pure function at the adapter edge that
every call site must pass through.

## Procedure

1. **Model the request as a pair, not a number**: the triangle budget plus the topology
   the provider was asked for. A budget without its topology cannot be converted, and a
   function that takes only a number will be called with the wrong one.
2. **Write one function per direction** — triangle budget to the provider's face limit,
   and delivered face count back to triangles — and export both. The inverse is not
   decoration: measurement and diagnosis need it.
3. **Floor, never round up.** One quad is two triangles, so a quad budget is the
   triangle budget halved. Rounding up authorises a mesh past the budget it was derived
   from; over an asset library that is a systematic upward drift with no author.
4. **Return nothing for an unusable input.** A non-finite, zero or negative budget
   yields no limit at all rather than a fabricated one — a budget that cannot be
   honoured is never invented, and a downstream *unmeasured* is the honest outcome.
5. **Call it from the adapter**, at the point where the request payload is built, so no
   caller has the option of doing the arithmetic itself.
6. **Record what was actually sent** alongside the authored budget, so a later
   investigation can distinguish "we asked wrongly" from "they answered wrongly".

## Decision rules

- **When the provider's topology mode is caller-controlled, the conversion is a
  function of that mode, not a constant.** Hardcoding the halving because "we always
  request quads" breaks the day someone requests triangles for a hard-surface asset.
- **When the provider's density parameter is a preset name rather than a count**
  (low / medium / high, or a quality tier), publish the mapping from those presets to
  measured triangle counts and pick the preset from the authored budget. An opaque
  preset is a unit you have not declared yet; some services multiply the nominal count
  by a large factor in quad mode, so the mapping must be *measured*, not assumed from
  the label.
- **When the provider accepts no density parameter at all, do not invent one.** Send
  nothing, record that no budget was requested, and let grading fall to the class
  ceiling with that fact stated (class-ceiling-vs-requested-budget).
- **When two providers count differently, do not average or normalise upstream.** Each
  adapter converts from the one authored unit. Upstream stays single-authority.
- **When the provider silently clamps your limit to its own range**, treat the clamped
  value as what was requested for grading purposes, and log the clamp. Grading against
  a number the service never accepted produces a false accusation.

## Verification

The conversion is pure arithmetic, so test it as such: the round trip, the floor at odd
budgets, the undefined result for junk input, and one end-to-end case asserting that a
quad-mode request for a given triangle budget produces exactly half that as the
provider's limit. Then verify once *empirically* — commission one asset per topology
mode and measure the delivered triangles. A conversion that is right in unit tests and
wrong about the provider's semantics is the failure this technique exists to prevent,
and only a measured delivery can tell you which one you have.

## When not to use it

- **When the service's parameter is documented in triangles and you have measured that
  it is true.** Then the conversion is the identity — but keep the function, because
  the identity is a claim about a vendor that can change under you, and a function is
  where you record that claim.
- **When the budget is enforced by post-process decimation rather than at generation
  time.** The decimator's target is in its own unit; convert for it instead, and note
  that decimating after the fact is the inferior path — a generator that was told the
  budget produces better topology than one whose output was cut down.
