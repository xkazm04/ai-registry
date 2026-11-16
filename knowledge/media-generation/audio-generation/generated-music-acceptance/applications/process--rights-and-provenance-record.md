---
layer: application
type: application
subject: generated-music-acceptance
technique: rights-and-provenance-record
status: forged
stack: process
verified_on: 2026-11-16
refresh_by: 2027-02-16
---

# The rights landscape the record is written against — November 2026

The technique says: record account, tier, the event the grant is anchored
to, vendor, date, brief, human contribution, references, and destination
at acceptance. This application is the dated snapshot of the vendor terms
that make each field load-bearing. Terms pages move; this page carries the
date each item was resolved and expects to go stale. First written
2026-08-26; re-sourced 2026-11-16 from the pages named below, and only the
items marked re-checked carry the new date.

## Per-vendor posture

- **Suno** (re-checked 2026-11-16 against suno.com/terms, "Date of Last
  Revision: August 10, 2026", "Effective Date: September 3, 2026", and the
  help center):
  - Free/Basic: outputs for "lawful, personal and non-commercial purposes"
    only; the help center says Suno owns free-plan songs.
  - Pro/Premier: Suno assigns its rights in the output to the user, with
    "no representation or warranty ... that any copyright will vest".
  - **The anchor moved.** Commercial exploitation now requires a permitted
    download "through an approved channel", counted against a per-tier
    monthly allowance; rights tied to that download are "perpetual" and not
    affected by "the expiry, cancellation, downgrade or suspension" of the
    subscription. A record for a Suno asset therefore needs the download
    event and date, not only the tier.
  - Non-retroactivity still holds by default: help article 2425729 says a
    subscription does not grant retroactive commercial licensing to
    free-plan songs, though Suno "may" offer it for specific songs. The
    terms themselves do not state it either way.
  - **Remixes** made through the remix feature (another user remixing your
    output) are joint works and "may only be used for lawful, personal and
    non-commercial purposes", whatever the tier. This is the cleanest public
    case of a derivative carrying a narrower grant than its source.
  - Suno may append "a fingerprint, watermark, or metadata indicating the
    applicable service tier", and removing it is prohibited: the tier is
    now partly carried in the file, but only the vendor can read it.
- **ElevenLabs (Eleven Music)** (re-checked 2026-11-16 against the Music
  Terms, "Last updated: 09 October 2026"):
  - Free: individual use, no downloads, no streaming distribution.
    Starter: individual use, a monthly download cap, no streaming
    distribution. Streaming distribution from Creator up.
  - **Destination carve-out.** Most self-serve tiers read "All online and
    offline commercial use permitted, except film, TV, radio, and Studio
    Games"; unrestricted media rights sit on the top tiers. Indie games are
    allowed, with 60 days to move plan if a game stops qualifying.
  - **Retroactive on upgrade, pinned on downgrade** (§1.5): on an upgrade
    "all Output in your account at the time of the upgrade are subject to
    the upgraded plan"; on a downgrade or termination "Output remains
    subject to the plan in effect when that Output was created". This
    refutes the old blanket "grants are non-retroactive" reading.
  - §3.4: the vendor may mark output as AI-generated but "no marking
    ElevenLabs applies satisfies your disclosure obligations"; §4.4 puts the
    destination platform's AI-disclosure policy on the user.
  - Ownership (§2.2): "you retain any and all rights in and to your Input
    and Output", subject to the underlying agreement.
- **Udio** (NOT re-checked: the terms page returned no readable text on
  2026-11-16). Secondary reporting says the settlement with a major label
  in late 2025 removed downloads, with a short window to save existing
  songs under the older terms, and moved the service toward a walled
  garden. Treat the August line "paid plans grant commercial use" as
  unverified and do not clear a Udio asset from this page.
- **Open-weights generators.** The weights licence binds the output's use
  whatever the source song's status. A model released under a
  non-commercial licence makes every take experimental, including a cover
  of the production's own song.

## Jurisdictional layer

Re-checked 2026-11-16 against a law-firm briefing dated 2026-09-01
(Houthoff, "AI Act: transparency obligations and the AI Omnibus
Regulation"). EU AI Act Article 50 has applied since 2 August 2026.
Art. 50(2) binds **providers** to mark synthetic audio "in a recognisable
and machine-readable manner", with a transition to 2 December 2026 for
systems placed on the market before August. Art. 50(4) binds **deployers**
to disclose deepfakes. For the record this means two fields: whether the
vendor marks its output (a provider fact), and whether the destination
use needs a deployer disclosure (a use fact). The August page's "several
jurisdictions issued 2026 guidance" had no source and is withdrawn.

## Registration doctrine

Re-checked 2026-11-16:
- U.S. Copyright Office, *Copyright and Artificial Intelligence, Part 2:
  Copyrightability*, published 29 January 2025 (copyright.gov/ai lists no
  later part or revision): "prompts alone do not provide sufficient human
  control to make users of an AI system the authors of the output"
  (quoted by IPWatchdog, 2025-01-29). Human expressive input perceptible
  in the output, and human modification or arrangement, remain routes to
  a claim.
- *Thaler v. Perlmutter*: certiorari denied on 2 March 2026 (Morgan Lewis,
  2026-03), leaving the D.C. Circuit's human-authorship holding in place.
  How much human involvement is enough is still open (*Allen v.
  Perlmutter* is pending).
- Suno's own help page says that in the U.S., prompting alone does not
  make someone the creator of an AI-generated song.

The August page called "the authored plan" the human contribution. That
was wrong. A plan is a prompt. What carries the claim is lyrics a person
wrote, a melody a person supplied, and the edits and splices a person
chose, kept with what each one changed.

## A worked record

```yaml
asset: cue-02-the-turn
generated: 2026-08-26
vendor: elevenlabs
model: music-v2
account: studio-main          # not a personal account
plan_tier: paid (creative)    # tier at generation time, verbatim from the account page
grant_anchor: creation-plan   # what the terms read: creation plan / download event / upgrade-lifted
plan_events: []               # every later upgrade, downgrade, cancellation, with dates
download: null                # for a download-anchored vendor: date and channel of the counted download
terms_resolved: 2026-08-26    # the day the Music Terms were read for this project
brief: plans/cue-02.json      # the composition plan, kept - reproducibility, not authorship
human_material: lyrics (authored), melody: none
human_edits: two section splices post-review (offsets kept)
references: none              # explicit, not omitted
vendor_marking: unknown       # does the vendor mark output (provider duty)
disclosure_needed: no         # deployer disclosure for this destination
cleared_for: web trailer (worldwide)   # not film/TV/radio under this tier
cleared_by: operator, 2026-08-26
```

The fields productions most often lose are still `plan_tier` and
`references`. `grant_anchor`, `plan_events` and `download` are the
November additions: the same asset can be cleared or not depending on
which of those events happened and in which order.
