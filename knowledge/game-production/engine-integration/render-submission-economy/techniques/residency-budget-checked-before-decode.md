---
layer: technique
type: technique
subject: render-submission-economy
technique: residency-budget-checked-before-decode
status: forged
laws: [a-budget-shapes-the-output, law-and-check-share-one-source, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [declaring how much texture memory a game may hold on a small device, an art drop could replace a page with a larger image, an over-budget or malformed asset must not take a visual system down with it]
---

# Residency budget checked before decode

The concern: on a device whose graphics processor shares a small memory pool with the rest of the
process, texture memory is the allocation most likely to grow without anyone deciding it should.
Art arrives in drops, a replacement file is larger than the one it replaced, a second backdrop is
loaded before the first is released, and the first symptom is not a slow frame but a failed
allocation, an eviction or a process the platform ends. A budget stated after the fact — "we use
about forty megabytes" — protects nothing. The budget has to be declared per class before the art
exists, checked at the moment an image would become resident, and enforced with a fallback, so
that an asset that does not fit costs a visual its art and not the game its frame.

## Procedure

**1. Declare a table of allocation classes, with units and basis.** Resident world and interface
art; the largest single page; render targets; font pages; small one-off textures; and a total of
owned textures. State the unit — binary mebibytes, say — and the basis: texture memory as
allocated texels times bytes per texel, with or without the mip chain, which adds about a third.
Give each entry its derivation (so many pages of at most this size), so that a change to the
table is a change to an argument, not to a number
([a-number-carries-its-unit-and-basis](../../../_laws.md#a-number-carries-its-unit-and-basis)).

**2. Keep whole-process memory as a separate budget, measured separately.** Owned textures are
one claimant; the process's proportional share of memory as the platform reports it is the
number the platform acts on. A texture total under budget does not prove the process is, and the
whole-process figure is taken with the platform's own per-process measure, never estimated from
the managed heap.

**3. Check before decoding pixels.** Read the image file's signature and header — width, height,
format — and compute what it would cost resident. Compare that with the class limit and with the
remaining total. Only an image that fits is decoded. A check that runs on the decoded pixels is
too late: the oversized image is already in memory when the check refuses it. Platform guidance
for image loading on this class of device gives the same order — ask the decoder for the bounds
alone, then decide — because on a unified-memory device the decoded pixels and the texture
compete for the same pool as everything else the process holds. Decode once: a cheap header read
followed by a single decode for the upload, never a full decode to measure and another to use.

**4. Refuse with a fallback, and count the refusal.** An image over its class limit, or over the
remaining total, is not loaded; the system that wanted it draws its procedural fallback — the
version that existed before the art did — and the refusal is a counted, reported event. A refusal
that disables the system is worse than the overrun it prevented.

**5. Validate the metadata that travels with the image.** An animation catalogue with no frames, a
bounds rectangle of zero area or outside its page, a scale that would divide by zero: each must be
rejected so that a valid page with broken metadata does not count as an available effect. A valid
texture is not a valid asset.

**6. Publish actual residency with its limit status.** Per class and in total, in the game's own
telemetry: bytes resident, limit, within or over. Count a shared texture once, however many
systems sample it. The budget and the check read the same table, so that changing a limit in the
document changes the check
([law-and-check-share-one-source](../../../_laws.md#law-and-check-share-one-source)).

**7. Bound the optional large allocations.** At most one large backdrop resident at a time, with
loading the next one disposing the previous; fixed pools for effects rather than growth on demand.

**8. Test the refusal paths.** A regression with a malformed header and one with an oversized
header; a zero-budget run in a real graphics context in which every system must still draw its
fallback. A long run on the device then checks that resident memory stays within budget and does
not trend upward over the session.

## Decision rules

- **When setting a class limit, set it at the size the class should be.** A generous limit is read
  as the intended size and gets spent
  ([a-budget-shapes-the-output](../../../_laws.md#a-budget-shapes-the-output)).
- **When an exception to the per-page limit is needed — one large font page, one render target —
  name it in the table as an exception.** An unlisted exception is how a limit stops meaning
  anything.
- **When an asset is refused, the game draws the fallback and says so.** Never silently, never by
  disabling the system.
- **When the platform can lose the graphics context, keep textures recoverable from their files.**
  A budget that forced textures to be built only in memory has traded residency for a blank screen
  after a context loss.
- **When the frame or memory budget fails, do not loosen the budget to pass.** Reduce residency or
  escalate the cut as a design decision.

## When not to use

On hardware with dedicated video memory far beyond the game's needs, a per-class table is
bookkeeping without a constraint behind it; a total and a growth check suffice. And on a platform
whose image loader exposes no header read, the check still belongs before upload — measure the
decoded image immediately and release it — but say that the protection is weaker, because the peak
was already paid.
