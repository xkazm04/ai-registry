---
layer: application
type: application
subject: generated-music-acceptance
technique: rights-and-provenance-record
status: forged
stack: node
verified_on: 2026-11-16
verified_against: node@24
applied: simulation
ab_verdict: better
---

# Node — a cover record that keeps two licences apart, and a vendor remix with no record

`gravitone-gcloud` (branch `main`, read at `fc26e172`, 2026-11-16; files
read with `git show`, nothing run) keeps a rights record on every cover.
A cover is an uploaded song section, transcribed and rendered as five takes
by an open-weights song model whose weights are licensed CC BY-NC 4.0. A
remix of the winner is then brought back from a hosted vendor by hand.
Both halves of the technique show up here: one written well, one with a
field missing.

## Written well: the declaration has no default, and the two licences stay apart

- **No default.** `packages/domain/src/cover.ts:15-16`: `COVER_RIGHTS =
  ["own", "licensed", "third-party-uncleared"]`, and "There is no default:
  an upload without one is refused". `app/(studio)/audio/_cover/desk/Source.tsx:3-4` gives the reason:
  "a choice made for them is not one". This is the technique's "an honest
  gap is usable information, a backfilled guess is a liability", enforced
  at the door.
- **The weights licence is its own axis.** `lib/sound/cover/rights.ts:6-8`:
  "Nothing here answers `publishable`, even for a song the owner wrote:
  the takes come from weights licensed CC BY-NC". `coverRights` (:14-19)
  writes the weights licence into the library note for *every*
  declaration. An `own` song computes to `use: "unknown"` (:18), never to
  cleared. That is the technique's 2026-11-16 field "the generator's own
  licence, as a separate axis from the reference's".
- **The record holds facts, not the decision.** "Whether a use is cleared
  is a decision with facts behind it ... this record holds the facts, not
  the decision" (:6-8). This is the technique's "the record is evidence,
  not counsel", in the tree's own words.

One soft spot. `exportWarning` (:22-24) speaks only for
`third-party-uncleared`. So the one sentence a person sees on downloading
an `own` winner says nothing about the CC BY-NC weights, though the
library note does. Warn-only was the owner's call (2026-11-07, :4), so
this is a disclosure gap, not a gate gap.

## The gap: the vendor remix carries no grant facts

`cover.ts:94`: `remix?: { file, mime, name, style }`. That is everything
the record keeps about the asset that would actually ship. It has no
account, no plan tier, no generation or download date, and no note of
which vendor feature made it. Each of those is load-bearing under that
vendor's terms as re-checked on 2026-11-16 (see
`process--rights-and-provenance-record`):
- commercial use needs a counted download through an approved channel,
  and the right is perpetual from that download;
- free-tier output is non-commercial, and a later subscription does not
  lift it by default;
- a remix made through the vendor's remix feature is non-commercial on
  every tier.

Whether the hand-carried "remix" is that feature or an upload-based
generation is not recorded, and the answer flips the result. This is the
technique's "unknown account, unknown reference — say so in the record"
case, except that the record has no field to say it in.

Fix: add `vendor`, `account`, `planTier`, `downloadedAt` and
`feature` (remix / cover-of-upload / fresh) to `remix`, required when a
remix is attached, and add a fixed note to `coverRights` that the remix is
uncleared until those fields exist.
