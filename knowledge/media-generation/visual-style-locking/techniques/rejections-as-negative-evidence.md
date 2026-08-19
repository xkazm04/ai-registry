---
layer: technique
type: technique
subject: visual-style-locking
technique: rejections-as-negative-evidence
status: forged
laws: [cost-per-usable-output, unmeasured-is-not-pass]
shared_with: []
use_when: [deciding what happens to a rejected proof, sizing sheet capacity, a proofing round keeps repeating the same misses]
---

# Rejections as negative evidence

When a human rejects a proofed render, the render has not become garbage —
it has become **the record of what this style is not**. This technique keeps
rejected proofs on the sheet, marked and annotated, permanently: never sent
as references, never counted against any capacity, and never deleted as
tidying.

## Why keep what failed

- **The rejection carries the style's boundary.** "Approved" images show
  where the style is; rejections show where it stops — too much interior
  detail, the wrong finish, an accent color doing a ground color's job. A
  sheet with only approvals defines the style by its center; the boundary
  is defined by the rejections, and the boundary is what the next proofing
  round needs in order not to wander back out.
- **The note is the durable part.** A rejection with a reason ("gradients
  crept in", "type too fine to survive") is a reusable style-design lesson;
  a silent deletion repeats the same miss next round, at full render price.
  Rejection without a note is half a decision.
- **The spend is real.** Every rejected render was paid for. Kept, it
  contributes evidence value against its cost; deleted, it is pure waste —
  and it vanishes from the honest accounting of what the sheet cost, which
  matters exactly when someone proposes throwing the sheet away.
- **Auditability.** A locked style should be able to answer "what did you
  reject on the way here, and why?" A sheet that can only show its winners
  cannot be audited, only admired.

## The two rules that make it safe

1. **A rejection is never a reference.** Only approved proofs ride along as
   style conditioning. Sending a rejected image — even as "what to avoid" —
   hands the model the exact look you refused, labeled ambiguously, on a
   channel where images speak louder than caveats. Negative guidance
   travels in the *text* channel (exclusion clauses), never in the image
   channel.
2. **A rejection consumes no capacity.** The model's reference window caps
   *approved* proofs, because approved proofs are what get sent. Counting
   rejections against the window is a real shipped defect with a memorable
   shape: a well-worked sheet reports "full", the surface advises rejecting
   something to make room, and rejecting changes nothing — the sheet is a
   dead end built entirely out of bookkeeping. Capacity math touches
   approvals only.

## Decision rules

- When a proof is rejected, require (or strongly invite) a one-line reason
  — the note is what the next round actually uses.
- When the same rejection reason appears twice, stop generating and edit
  the block — the style description, not the luck of the draw, is what is
  producing the miss.
- When a sheet is at its approved-capacity limit, the act that makes room
  is rejecting or retiring an *approved* proof — and the surface should
  say exactly that.
- When fixing a sheet, re-generate to replace the rejected proof's slot in
  the coverage (its element, its subject) — the rejection stays as the
  record; the replacement competes fresh.

## When not to use it

Storage is the only real constraint: proofs are stored images, and an
unbounded archive of rejections eventually costs more than its evidence is
worth. When pruning becomes necessary, prune oldest rejections first, keep
their notes even when dropping their pixels, and never prune approvals to
make room for anything. And in a pre-ratification scratch space — renders
nobody judged — there are no rejections to keep, because nothing was
decided; the technique begins where human judgment does.
