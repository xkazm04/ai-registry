---
layer: technique
type: technique
subject: giveaway-legal-guardrails
technique: registration-value-threshold
status: forged
laws: [unmeasured-is-not-pass]
shared_with: []
use_when: [a giveaway prize may be large enough to need a registration or bond, choosing a default prize-value threshold for a streamer tool, deciding what the streamer must confirm before a high-value draw runs]
---

# Registration value threshold

Some jurisdictions require a promoter to register a prize promotion, and sometimes post a
bond for the prize value, before it starts, once the total value of prizes crosses a line.
A streamer tool cannot know which of those places its streamer's viewers live in, nor keep
every statute current. It can compare the declared prize value against a threshold and,
when the value crosses it, hold the draw until the streamer confirms they have handled it.
Product design practice, not legal advice; the figures below are illustrative.

## Illustration, with its source and date

Practitioner and vendor summaries read on 2026-11-02 describe two US states that require
registration and a surety bond when the total retail value of all prizes in a promotion
exceeds 5,000 US dollars, with filing due before the start date — the summaries variously
say seven or thirty days for the same state — and disagree on whether the line is "more
than" or "at least" the figure and on non-profit exemptions. The summaries also name the
two usual responses: keep the total prize value at or under the line, or exclude residents
of those places from entry. Those figures are an illustration of the mechanism, not an
input to copy; they will move, and other places have other rules.

## The mechanism

1. **The prize value is a required field** on any draw with a prize, in the promotion's
   currency, as the retail value a winner would pay — not the price the streamer paid, not
   the value of a key bought at a discount. Multiple prizes, and multiple winners, sum.
2. **The threshold is a setting with a provenance.** Ship a conservative default, and show
   beside it where it came from and the date it was last checked. A threshold with no source
   is a number the streamer will trust more than it deserves.
3. **At or above the threshold, hold.** The draw cannot be sealed until the streamer records
   one of: the filing is done (with a reference they can find later), the places that need
   it are excluded from entry (and the eligibility text says so), or the prize is reduced
   below the line. Each is a separate confirmation, because each has a different follow-up.
4. **A missing value is not zero.** A prize with no declared value is held exactly as an
   over-threshold prize is, until a value is entered.
5. **Edge of the line counts as over.** When sources disagree whether the line is inclusive,
   the default treats a value equal to the threshold as crossing it.
6. **Compare in integer minor units.** Store the value and the threshold as whole cents (or
   the currency's smallest unit), never as floating point, and pin the exact boundary with a
   test either side of it; a value that rounds across the line in one layer and not another
   is a draw that is held on one screen and sealed on the next.
7. **Offer the configuration fix beside the confirmation.** "Lower the prize to the line" is
   one choice next to "the filing is done", so the streamer who never meant to cross the
   line removes the finding instead of confirming something they have not done.

The confirmation is recorded against this draw and this value. If the prize changes, the
confirmation no longer describes what is running and is asked again.

## Things the threshold does not settle

Crossing no threshold does not make a draw lawful; it only means this check found nothing.
Large prizes tend to carry tax reporting for the winner and sometimes for the promoter, and
cross-border prizes raise shipping, customs and export questions; the tool names these as
questions for the streamer's adviser and does not compute them. A threshold set per
jurisdiction is better than one global figure only if the tool can actually know the
entrants' places; without that, one conservative global threshold is more honest than a
table that implies a precision the tool does not have.

## Decision rules

- **When the streamer raises the threshold above the default**, require the source they are
  relying on and record it with the change.
- **When the tool's default source is older than the product's review cycle**, flag the
  default as unreviewed on the settings screen rather than silently keeping it.
- **When prizes are paid in platform currency or gifted subscriptions**, value them at what
  the viewer would pay for them.
- **When a series of small draws shares one prize pool**, sum the pool; splitting a large
  prize into several small draws is the obvious way around a threshold and the tool should
  not make it invisible.

## When not to use it

Do not use a value threshold as the only guardrail for a paid-entry draw; consideration is
decided by the classifier, and a cheap prize does not make a paid lottery lawful. Do not
ship a jurisdiction table the product has no process to keep current.
