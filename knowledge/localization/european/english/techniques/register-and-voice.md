---
layer: technique
type: technique
subject: english
technique: register-and-voice
status: forged
laws: [the-authority-is-a-hypothesis]
shared_with: []
use_when: [setting the register of English copy per surface, reviewing English that reads stiff, corporate or letter-like, writing error and status messages]
---

# Register and voice

English has no grammatical formality system to commit to, so register is carried by word choice,
address, contractions and sentence frames, and it has to be decided per surface. The failure
this technique exists for runs in two directions. Copy derived from a formal source language
arrives as a business letter (*we would like to inform you*); copy written by a marketing habit
arrives in the settings screen as a sales pitch. Declare the surface first, then apply the rules
that surface admits.

| Surface | Admits | Refuses |
|---|---|---|
| Marketing and landing | fragments, idiom, contractions, direct address, one exclamation per page | officialese, unexplained buzzwords |
| Product UI | terse imperatives, contractions, *you* | idiom, jokes, *we* in status lines, decorative *please* |
| Errors and corrective copy | plain, neutral, blame-free statements with a next step | the reader as the accused subject, jokes |
| Legal | formal, faithful, defined terms | contractions, minimizers, friendliness |

## EN-YOU · Address the reader as "you" in task and benefit copy

> **Trigger** — *the user*, *users*, *customers* or *clients* used for the person reading.
> **Rule** — address the reader directly in instructions, benefits and onboarding.
> **Source** — Microsoft, Google, Apple, GOV.UK, Mailchimp; direct address helps receptive,
> task-focused copy (Cruz et al. 2017).
> **Exceptions** — corrective, adversarial or error copy, where *you* as the subject of a
> failure reads as blame (Hussein & Tormala 2023): phrase neutrally. Legal terms keep their
> defined parties.

✗ *The user can export reports as spreadsheets.* → ✓ *You can export reports as spreadsheets.*
✗ *You entered an invalid date.* → ✓ *That date isn't valid. Use DD/MM/YYYY.*

## EN-WE · No "we" in errors and status; elsewhere only once the organisation is named

> **Trigger** — *we* or *our* in an error, status line or progress message; *we* on a surface
> where the reader has not yet met the organisation.
> **Rule** — errors and status lines report the state and the next step. Elsewhere, *we* is
> natural after the organisation has been named.
> **Source** — Microsoft, Google. One vendor's own pages contradict each other: an older app
> guidance page models *We couldn't save…* while its newer style guide says to avoid *we* in
> messages. Prefer the newer.
> **Exceptions** — privacy statements (*we collect*), recommendations (*we recommend*); in
> service replies, a named first-person singular agent beats a corporate *we* (Packard, Moore &
> McFerran 2018).

✗ *We couldn't load your content. We apologize.* → ✓ *Couldn't load content. Try again.*

## EN-ACTIVE · Name the actor

> **Trigger** — an agentless passive where the actor is known. A sentence opening on *There
> is/are* is EN-EXPLETIVE-OPEN, so one span raises one finding.
> **Rule** — put the actor in the subject slot.
> **Source** — Microsoft, Google, GOV.UK.
> **Exceptions** — an unknown or irrelevant actor (*Your data is encrypted at rest*). Generated
> prose tends to *under*-use the agentless passive (about half the human rate), so this rule is
> for translated and officialese copy; do not apply it to prose that has no passive problem.

✗ *Your request has been received and will be processed.* → ✓ *We've received your request and
will reply within two working days.*

## EN-EXPLETIVE-OPEN · Open on the real verb, not on "There is" or "You can"

> **Trigger** — a sentence opening on *There is/are/were* whose real verb waits in a later
> clause; *You can* opening a step the reader has to take.
> **Rule** — promote the buried verb to the main clause; write a required step as an imperative.
> **Source** — three open prose linters ship the pattern (surveyed 2026-09; presence, not a
> measured effect); one major technology style guide lists it among its top ten tips.
> **Exceptions** — existence is the claim (*There's no fee for the first seat*, *There are no
> results*); *you can* for an optional capability rather than a step (EN-YOU).

✗ *There are three settings that control sync. You can open Settings to change them.* → ✓ *Three
settings control sync. To change them, open Settings.*

## EN-CONTRACTION · Use natural contractions, and never mix forms on one surface

> **Trigger** — *do not*, *cannot*, *you will* in conversational UI or marketing; a surface
> holding both *don't* and *do not*; a noun + verb contraction (*Product's launching*).
> **Rule** — contract the common forms (*don't*, *can't*, *you'll*, *it's*) in UI and marketing,
> and hold one form per surface. Avoid noun + verb contractions and rare ones (*it'd*,
> *should've*).
> **Source** — a documented contradiction: Microsoft, Google and Apple use contractions; GOV.UK
> avoids negative contractions because some readers misread them. Both cite comprehension.
> **Exceptions** — legal text; a declared house policy against negative contractions.

✗ *You can't undo this. Do not close the window.* → ✓ *You can't undo this. Don't close the
window.*

## EN-OFFICIALESE · Drop letter formulas and officialese frames

> **Trigger** — *we would like to inform you*, *do not hesitate to contact us*, *in case of any
> questions*, *within the framework of*, *hereby*, *Dear customer*, *it is possible to*.
> **Rule** — state the news and address the reader. The frame carries no information.
> **Source** — GOV.UK, Microsoft, Mailchimp; the frames are direct calques of formal letter
> conventions in Czech, German and other Central European languages.
> **Exceptions** — formal legal notices that require the frame.

✗ *We would like to inform you that it is possible to change your plan. In case of any questions,
do not hesitate to contact us.* → ✓ *You can change your plan at any time. Questions? Contact us.*

## EN-REDUNDANCY · Say it once

> **Trigger** — a modifier that repeats its head (*past history*, *free gift*, *end result*,
> *advance planning*, *completely finished*); a multi-word frame standing in for one word
> (*because of the fact that*, *in a timely manner*, *at this point in time*).
> **Rule** — delete the repeated word; replace the frame with its word (*because*, *promptly*,
> *now*), or with the fact it was hiding (*within a day*).
> **Source** — four independent open prose checkers ship the family (surveyed 2026-09;
> presence, not a measured effect). Letter formulas are EN-OFFICIALESE; this rule owns the rest.
> **Exceptions** — legal doublets (*null and void*); fixed terms and product names; a repetition
> a declared voice uses for emphasis.

✗ *Because of the fact that the import is completely finished, the end result arrives in a
timely manner.* → ✓ *The import is done, so the report arrives within a minute.*

## EN-PLEASE · Delete "please" unless the request is inconvenient or the product is at fault

> **Trigger** — *please* in instructions, labels and routine prompts.
> **Rule** — delete it; an instruction is not rude in English UI.
> **Source** — Google, Microsoft, Apple, GOV.UK.
> **Exceptions** — the reader is asked to wait, retry or do extra work because of the product.

✗ *Please enter your email.* → ✓ *Enter your email.* · kept: *Please wait while we restore your
data.*

## EN-MINIMIZER · Delete claims about the reader's effort

> **Trigger** — *easy*, *easily*, *simply*, *just*, *quickly* describing what the reader does.
> **Rule** — delete it. If the task is easy the reader will notice; if it is not, the word
> blames them.
> **Source** — Google, Microsoft.
> **Exceptions** — a measured claim (*Set up in 5 minutes*), when it is true.

✗ *Simply connect your account and just click Import.* → ✓ *Connect your account and select
Import.*

## EN-JARGON · Replace corporate buzzwords with the plain verb; keep terms of art

> **Trigger** — *leverage*, *utilize*, *synergize*, *facilitate*, *solutioning*, *going
> forward*, *best-in-class*.
> **Rule** — use the plain word (*use*, *help*, *from now on*). Keep the precise terms the buyer
> uses in contracts and searches.
> **Source** — GOV.UK words to avoid; Mailchimp; Microsoft. Jargon rises with low status and
> lowers engagement (Brown, Anicich & Galinsky 2020; Bullock et al. 2019); plain language does
> not cost credibility with experts (Benson & Kessler 1987).
> **Exceptions** — terms of art the audience itself searches for (*SOC 2*, *idempotency*).

✗ *Leverage our platform to facilitate onboarding going forward.* → ✓ *Use it to onboard new
hires.*

## EN-CLICHE · Replace a worn English figure with the claim it stands for

> **Trigger** — a stock figure native to English: *at the end of the day*, *think outside the
> box*, *move the needle*, *low-hanging fruit*, *hit the ground running*, *the tip of the
> iceberg*.
> **Rule** — state what the figure means. In UI and errors, always; on marketing pages it is a
> density rule: one figure is a choice, a paragraph of them is a finding.
> **Source** — two open prose checkers ship lists of about 600 entries (surveyed 2026-09); the
> lists are not reproduced here, and a hit is a candidate a reader confirms. Distinct from
> EN-IDIOM-CALQUE (a source idiom rendered word for word) and EN-JARGON (buzzwords).
> **Exceptions** — a figure used literally; quoted speech; a figure a declared voice adopts.

✗ *At the end of the day, our alerts move the needle.* → ✓ *Our alerts flag a failed payment
within five minutes.*

## EN-HEDGE · One qualifier per claim, where the uncertainty is

> **Trigger** — stacked qualifiers (*could potentially*, *may possibly*) or performed caution
> (*it's important to note that*).
> **Rule** — keep one qualifier, attached to the uncertain part; delete the frames.
> **Source** — generated essays carry about twice the human rate of performed hedging markers
> (a 2026 preprint); GOV.UK and Microsoft on direct statements.
> **Exceptions** — qualifiers a legal review put there.

✗ *It's important to note that this could potentially affect some reports.* → ✓ *This may affect
reports created before March.*

## EN-EXCLAIM · No exclamation marks in UI or errors; at most one per marketing page

> **Trigger** — `!` in a button, label, status, error or toast; several on one page.
> **Rule** — remove them from UI and errors; allow at most one on a marketing page.
> **Source** — Google, Mailchimp, Atlassian, Apple. Translations from German carry about 2.8
> times as many exclamation marks as original English (Volansky, Ordan & Wintner 2015).
> **Exceptions** — a genuine celebration moment (first project published); a declared voice.

✗ *Saved successfully!* → ✓ *Saved*.

## Using the set

Declare the surface, then walk the rules that surface admits. EN-OFFICIALESE and EN-YOU yield
the most on translated copy; EN-MINIMIZER, EN-JARGON, EN-HEDGE and EN-CLICHE on marketing
drafts. EN-REDUNDANCY and EN-EXPLETIVE-OPEN are phrase patterns a script can surface for a
reader to confirm. Where a rule records a contradiction (EN-CONTRACTION, EN-WE), the declared house choice decides, and a
catalog already coherent on the other side wins over the authority until someone rules
otherwise.

When NOT to apply: legal text and contractual notices, which are register-correct in their
formality; quoted customer speech, which is evidence rather than voice; and a declared brand
voice that deliberately admits exclamation or idiom. That voice must then hold everywhere it
applies.
