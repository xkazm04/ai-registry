---
layer: application
type: application
subject: german
technique: register-and-address
stack: process
status: forged
verified_on: 2026-08-24
---

# Register drift and the inclusive-form gap in two real German catalogs

Two fleet products chose formal Sie for German, wrote it down, and still hit
the exact drift patterns this technique predicts — in different places,
because the products have different conversational surfaces.

## Personas Desktop: du-drift in exactly the chatty strings

`C:\Users\kazda\kiro\personas\docs\i18n\style-de.md` fixes "formal Sie / Ihr
everywhere — no exceptions, including companion and onboarding copy" for an
~11,500-key catalog (`src/i18n/locales/de.json`). Its "Known drift to fix,
not imitate" block is the DE-ADDRESS incident in the wild: shipped `du`-form
concentrated in companion chat, onboarding tour and twin-identity strings
(`chrome.tray_acceptance_pending`, `athena.guide_trig_intro`,
`onboarding.tour_intro_heading`, `twin.identity.bioRefineHint`) — surfaces
that "read conversationally", so translators reached for the friendlier
pronoun. The guide's response is the process to copy: name the drift as
wrong (a companion instructing an operator is still a professional tool),
and mandate conversion-on-touch — any string edited in those areas converts
du→Sie in the same edit. Its Pitfall 6 gives the worked repair pair:
"Lass uns das Intake machen — frag mich…" → "Lassen Sie uns das Intake
machen — fragen Sie mich…" — warmth kept, pronoun corrected.

The same file also enforces DE-FORMAL's axis split downstream: buttons are
short imperative infinitives (`Speichern`, `Abbrechen`), never bureaucratic
sentences (`Das Speichern durchführen`).

## kp: register held, first-person leak and vocabulary register

`C:\Users\kazda\kiro\kp\docs\i18n\style-de.md` makes the same Sie ruling for
a B2B recruiting product and adds the vocabulary axis explicitly: "formal in
*address* (Siezen) and plain in *vocabulary*", with the DE-FORMAL avoid-list
(mittels, seitens, sämtliche…). kp's review ledger
(`C:\Users\kazda\kiro\kp\docs\i18n\review-de.md`) then shows the
DE-ANTHRO-adjacent leak: progress labels split between first-person singular
("Denke nach…", "Verbinde…") and the passive the rest of the catalog uses
("Wird gestartet…", "Wird erstellt…") — flagged, with the note that the
Czech guide has an explicit rule banning the first-person leak and German
did not yet; the review's suggested fix ("Denkt nach…" / "Wird verbunden…")
was queued rather than half-applied.

## The inclusive-form gap: a missing ruling, found by audit

review-de.md is the evidence base for DE-GENDER. The 2026-08 sweeps found
four coexisting inclusive-form styles in one catalog: generic masculine
("Kandidaten" in decisions/analytics), slash ("Kandidat/in" in pipeline),
full pairs ("Kandidatinnen und Kandidaten" in status/comms), and colon/
midpoint stragglers ("Kandidat:innen-Fokus" at de.json:5842). Multiple ledger
rows (`decisions.row.candidateCount`, `analytics.funnelGuide.waiting`,
`pipeline.drawer.timeline.inviteDeclined`, `simulation.step.offer.clickCaption`)
reach the same verdict independently: every individual form is defensible
German, so no string-level fix is possible — "needs one contentious
house-style decision (pervasive, not fixed here)". The audit correctly
produced a *ruling request*, not edits. That is DE-GENDER's mechanism
verified end to end: absent a recorded house form, reviewers can only file
the gap; the productive output of the audit is the minted ruling.

## What stays downstairs

Both products' actual choices — Sie itself, kp's "wir"-voice for system
speech ("Wir hören zu."), personas' button-idiom table, either product's
eventual gender-form ruling — are house artifacts. What this subject keeps is
the decision structure they instantiate: one recorded address contract,
vocabulary formality as a separate axis, anthropomorphism bounded per
surface, and one inclusive-form ruling swept once.
