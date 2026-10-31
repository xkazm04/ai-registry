---
layer: application
type: application
subject: generated-music-acceptance
technique: rights-and-provenance-record
status: forged
stack: process
verified_on: 2026-08-26
refresh_by: 2026-11-26
---

# The rights landscape the record is written against — August 2026

The technique says: record account, tier, vendor, date, brief, references,
and destination at acceptance, because commercial grants are plan-scoped
and non-retroactive. This application is the dated snapshot of the vendor
terms that make each field load-bearing. Terms pages move; this page
carries the date it was resolved and expects to go stale.

## Per-vendor posture (2026-08)

- **Suno** — as of June 2026: Free plan includes **no commercial use**;
  Pro and Premier include commercial rights **for songs made under those
  plans**, and subscribing later does **not** retroactively license
  free-plan songs by default (Suno may grant it for specific songs). This is the cleanest public example of the
  non-retroactivity trap the technique warns about, and the reason "plan
  tier at generation time" is the record's first field.
- **Udio** — as of 2026-10-31: **no commercial grant on any tier, and no
  downloads.** Udio's 2025-10-29 announcement of its Universal settlement
  (https://www.udio.com/blog/a-new-era) says "Starting today, downloads
  from the platform will be unavailable", and its Terms of Service (Last
  Revised November 12, 2025; https://www.udio.com/terms-of-service) say
  "you may use Output solely for your personal and non-commercial
  purposes, provided that you may not download any copies of your Output
  from the App for any purpose". A paid subscription now only waives the
  attribution notice for Output made during it. The licensed platform
  co-developed with Universal (and Warner, 2025-11-19) was announced for
  2026; Udio's blog shows no launch as of this date. The earlier
  "paid plans grant commercial use" posture is the strongest example of a
  grant withdrawn after the fact — the reason the record captures the
  terms in force at generation, not today's.
- **ElevenLabs (Eleven Music)** — "cleared for broad commercial use" with
  tier-dependent restrictions; the operative document is the vendor's
  Music Terms, which distinguishes tiers and destinations — resolve it
  per project rather than citing this page.
- **Jurisdictional layer** — several jurisdictions issued 2026 guidance
  conditioning commercial AI-music use on the generator's licensing and
  data-sourcing transparency; the practical consequence for a record is
  the vendor field itself: which model generated an asset has become a
  compliance fact, not just a reproducibility one.

## Registration doctrine

Standing U.S. Copyright Office guidance (2025–2026): works generated
entirely by AI without meaningful human creative input are generally not
registrable, and its January 2025 report holds that prompts alone do not
make the user an author. The registrable claim, where one exists, rides on
the human contribution — the authored lyrics, selection and arrangement,
the edit history — with the authored plan as evidence of intent rather
than a claim on its own. The record's brief-and-edits field is that
evidence; a production that discards its plans and edits after delivery
has discarded its own authorship claim.

## A worked record

```yaml
asset: cue-02-the-turn
generated: 2026-08-26
vendor: elevenlabs
model: music-v2
account: studio-main          # not a personal account
plan_tier: paid (creative)    # tier at generation time, verbatim from the account page
terms_resolved: 2026-08-26    # the day the Music Terms were read for this project
brief: plans/cue-02.json      # the composition plan, kept
references: none              # explicit, not omitted
human_contribution: authored plan, authored lyrics, two section edits post-review
cleared_for: web trailer (worldwide)
cleared_by: operator, 2026-08-26
```

The two fields productions most often lose are `plan_tier` and
`references` — the first because nobody records what was obvious that
day, the second because "none" feels like nothing to write down. Both are
exactly the facts that cannot be reconstructed in month three.
