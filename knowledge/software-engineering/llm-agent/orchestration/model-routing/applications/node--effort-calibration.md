---
layer: application
type: application
subject: model-routing
technique: effort-calibration
stack: node
applied: task
ab_verdict: unmeasurable
proof: structural-only
verified_on: 2026-10-31
verified_against: node@24
---

# A routing table that refused the newest model, and had already measured why

`gravitone-gcloud` — a Next.js 16 content studio routing reasoning turns
through one vendor behind a per-turn model map. Paths relative to the repo
root; citations resolved 2026-09-02 at commit `bda26bd`. The repo declares no
`engines` field and no CI node version; `@types/node ^20` in `package.json` is
the only node witness in a manifest, so that is the pin — a weaker witness than
usual and stated as such. *Re-checked 2026-10-31 at `fd09c06c`:* the same witness
now reads `@types/node ^24.19.2`, still with no `engines` field, so the pin moved
to node@24 on the same weak footing.

This tree was opened to apply a version bump to it. It declined, in writing,
before the run arrived, and the refusal is the application.

## 1. The table is a dated measurement, and it says so

`lib/text/providers/google.ts:95-142` is a per-turn model map whose header is a
measurement record rather than a configuration comment: "MEASURED AGAINST THE
LIVE ROSTER on 2026-08-27 with this repo's key, not chosen from memory",
followed by the roster size, the count that supported the required call shape,
and a per-id result line — HTTP status, latency, and whether the native schema
was honoured.

Two entries in that list carry the finding:

- The newest flash model on the roster returned `503 "experiencing high
  demand"` and is **deliberately not used**: "a 503 under load is a bad
  property for the only engine a hosted deployment has."
- A floating `-latest` alias worked and is **also** deliberately not used,
  citing this corpus's own model-identity rule that measured history resets
  when a roster label changes.

The header then states the promotion rule verbatim: "Promote it by editing
this table and re-running the pass, **not by assuming it settled**."

## 2. The structural fact: the tree had already measured the term the release note describes

`lib/text/providers/google.ts:265-280` meters the field most estimates omit,
under a heading that is the whole argument — "THINKING TOKENS, AND THEY ARE
BILLED AS OUTPUT" — with the 2026-08-27 numbers:

- mid-tier flash: `in=20 out=27 thoughts=345` — **12.8x the visible answer**
- larger preview: `in=20 out=27 thoughts=679` — **25.1x**

The comment draws the consequence itself: a price computed from the visible
completion alone "would therefore understate a turn's real output cost by an
order of magnitude", on the one figure the app persists onto a creator's
version.

That is the technique's claim, measured, in a tree that had no reason to be
making it. The vendor released a successor the same week describing itself as
executing extra reasoning steps and calling tools iteratively at an unchanged
per-token price — a claim about precisely this term. **The tree's instrument
was pointed at the right number before the release existed**, which is better
evidence for the technique than an adopting tree would have given, because
nobody built it to prove this.

## 3. Why the verdict is a task and not a code change

The bump was not applied. A/B is not reachable in this run and the reason is
not budget: the discriminating measurement requires calling the live roster
with the repo's own key, which is spend against a third party this run had no
standing to authorize. Editing the map would have overridden a dated
measurement with an assumption — the exact move the file forbids in its own
prose, and the move the technique's re-measure cadence exists to prevent.

What landed instead, on the project's active branch at `bda26bd`:

- a rate row for the successor in `lib/text/pricing.ts`, carrying the vendor's
  published figure and its expiry — the inverse of every other row in that
  file, which are deliberately unpriced because nobody had read a rate. This
  file's rule is "never invent a price", and a published rate satisfies it.
- the pass the promotion owes, written into the measurement header with the
  two questions it must answer: whether the 503 followed the version, and what
  the thoughts ratio is on the successor.

`ab_verdict: unmeasurable`, and the instrument that would resolve it is named:
one live roster pass with this repo's key, which the tree already knows how to
run because it ran it on 2026-08-27.

## 4. What this realization cannot do

The table pins ids and measures them once. It has no cadence — the 2026-08-27
pass happened because someone chose to run it, and nothing in the repo will
ask again. A vendor shipping three releases of this tier in six weeks moves
faster than an unscheduled manual pass, so the measurement's honesty about its
own date is doing all the work that a trigger would otherwise do. The refusal
recorded here is only as good as the next person reading the header.

*Re-checked 2026-10-31 at gravitone-gcloud@fd09c06c:* the refusal still stands. The
default ids are still `gemini-3.6-flash` and `gemini-3.1-pro-preview`
(`google.ts:49-50`), the 3.8 row in `lib/text/pricing.ts` is still "NOT promoted",
and the owed pass has not been recorded. One partial clock now exists: the 3.8 row
carries `validUntil: "2026-12-31"`, and `pricing.ts:179-182` turns a quote past that
day into "re-check it". That clock watches the rate. It does not re-measure the
roster, so the cadence gap described above is still open.
