---
layer: application
type: application
subject: game-dialogue-voice-pipeline
technique: cast-ledger-with-consent
stack: process
status: forged
refresh_by: 2027-05-16
verified_on: 2026-11-16
---

# Process: the 2025 SAG-AFTRA Interactive Media Agreement as ledger fields

Read on 2026-11-16 from two law-firm alerts and one trade report on the agreement; **the
union's own agreement text was not opened**, so every term below is as those pages state it
and is a lead to re-read against the text before a contract relies on it. Ratified in July
2025 (the reports disagree on the certification date, 9 or 24 July).

## What the pages state

- **Form and specificity.** Frankfurt Kurnit Klein & Selz,
  https://technologylaw.fkks.com/post/102mewu/inside-the-new-sag-aftra-interactive-media-agreement-new-standards-for-ai-and-di :
  consent in "clear and conspicuous" writing, separate or a specifically signed rider, with
  a "reasonably specific description" of the use; consent cannot be taken at initial hire for
  future games. Davis+Gilbert, https://www.dglaw.com/sag-aftras-new-video-game-agreement/
  (alert dated 6 November 2025): "Consent must be in writing, separately signed or initiated,
  and must be reasonably specific", required "prior to the creation and use".
- **Runtime generation is named.** Both alerts: the consent must say whether the replica will
  be used for Real-Time Generation, defined in the Davis+Gilbert alert as "dynamic generation
  of voiced dialogue in real time" in a released game where the dialogue was not
  pre-generated. The FKKS alert adds disclosure of sensitive content (profanity, slurs).
- **Pay by line, and a usage report.** FKKS: vocal replica pay is counted in generated lines,
  a line being "roughly ten words"; a usage report is due within 90 days of release, naming the
  characters that used a replica and how pay was calculated. The Wrap (12 June 2025, before
  ratification), https://www.thewrap.com/sag-aftra-video-game-deal-details/ : real-time
  generation at "at least 7.5x that minimum scale".
- **Suspension during a strike.** The Wrap: "the ability to suspend consent of companies to use
  AI to create replicas of their work during a strike". A search summary (not opened) reported
  an exception for a replica already incorporated for real-time generation; unconfirmed, not
  used.
- **Two replica kinds.** Digital Replicas made primarily from covered work, and Independently
  Created Digital Replicas made from other material or by prompting a model with the
  performer's name; Davis+Gilbert: any de minimis covered material moves a replica out of the
  second kind, and de minimis is undefined.

## Mapping onto the ledger row

| Term | Ledger field or state |
| --- | --- |
| separate, specific, per-project consent | `consent` with project and document location |
| real-time generation named in the consent | `runtime_scope` |
| suspension during a strike | status *suspended for new renders* |
| pay per generated line, usage report in 90 days | catalog x ledger query: lines per replicated voice per character |
| replica kind | `origin` plus `reference_material` (which material it was made from decides the kind) |

## The provider half, confirmed the same day

One speech provider's professional-clone page,
https://elevenlabs.io/docs/product-guides/voices/voice-cloning/professional-voice-cloning :
"For now, we only allow you to clone your own voice"; "Even with their consent, you cannot
clone someone else's voice"; the other person creates and verifies the clone and shares it.
The same page: a clone trains automatically on some models and is fine-tuned manually for the
newest, and "A clone on Eleven v4 may sound substantially different from the same clone on
Eleven v3" (the re-cast gate's premise). The technique's provider-controls paragraph stands.

## Scope

This is one union's agreement for one jurisdiction's covered work. A designed voice with no
performer behind it reads *not applicable* in these fields, with the reason.
