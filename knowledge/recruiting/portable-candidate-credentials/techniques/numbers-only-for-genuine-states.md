---
layer: technique
type: technique
subject: portable-candidate-credentials
technique: numbers-only-for-genuine-states
status: forged
laws: [say-only-what-the-record-holds, a-claim-carries-its-sample-and-its-basis, absence-of-evidence-is-not-evidence]
use_when: [rendering a credential verification surface, deciding what a failed check may still display, designing a public credential page]
---

# Numbers only for genuine states

## The concern

A credential that cannot be verified does not get to show a score.

This is violated constantly, and never maliciously. The number is right there in the
payload. The template already has a slot for it. The badge beside it already says
"could not verify". It feels like the reader has been told. They have not.

A numeral renders as a fact regardless of what surrounds it. A reader shown **78** under
a grey chip reading *unverified* walks away remembering 78. Qualifiers lose to digits —
people read the figure first, the badge second if at all, and remember the figure a week
later when the badge is gone. Worse, a rendered number *implies* that a measurement
occurred, which is exactly the proposition in doubt. Per
[say only what the record holds](../../_laws.md#say-only-what-the-record-holds), a system
that cannot establish where a figure came from must not display it, because displaying it
is an assertion no chip can retract.

And the beneficiary of the leak is precisely the wrong party. If a payload is
unverifiable because someone supplied a doctored file, the system has just rendered their
number in your typography, on your page, under your organisation's name.

## Which states are genuine

Genuine is not the same as verified. It means: the system can establish that this result
came from a real assessment it can account for.

**Numbers render:**

- **verified** — fully, with all sub-dimensions.
- **stale** — fully, with the assessment date stated adjacent to every figure, not once
  in a footer. Suppressing a real result from its owner because a timer elapsed is its own
  dishonesty and destroys the artifact's value to the person holding it.

**Numbers do not render:**

- **revoked** — the issuer has withdrawn the claim; the figure is the withdrawn part.
- **unverifiable** — the provenance is exactly what is unknown.
- **tampered** — the figure may be the forged part.
- **structurally empty** — there is no figure; a zero, a dash or an empty meter each read
  as a result.
- **unsigned** — show the content as a *claim*, plainly framed as unattested. If your
  surface cannot make that framing survive a screenshot, do not render figures here
  either.
- **superseded** — the figure is a grade on a scale you no longer operate. Show what was
  recorded as a historical fact if you show anything, never as a current band.

## Procedure

**1. Gate at the data layer, not the template.** The resolver returns numeric fields only
in states that permit them and omits them entirely otherwise — not as nulls the template
must remember to check. A template cannot leak a value it was never handed. Every
regression of this rule traces to a surface that could reach the payload directly.

**2. Design each non-genuine state's rendering as a real layout, not a hidden section.**
A card with the score area blanked out invites the reader to wonder what is being
concealed and to ask the bearer. Each state gets a purposeful presentation: what was
found, what it means, what to do next.

**3. Suppress every numeric proxy, not just the headline figure.** Meters, rings, bars,
star counts, percentile phrases, "top quartile", coloured bands, ranked orderings and
sparklines are all numbers. Colour is a number too: a green-to-red gradient communicates
a score with no digits at all, and a surface that suppresses the figure while keeping the
gradient has suppressed nothing.

**4. Where a number does render, render its basis with it.** Per
[a claim carries its sample and its basis](../../_laws.md#a-claim-carries-its-sample-and-its-basis),
a score alone is uninterpretable to a stranger. Attach the scale and its range, the
instrument and its version, the date, and the extent of what was observed. "78" means
nothing; "78 of 100 on a structured exercise, 45 minutes observed, assessed on a stated
date under a stated methodology" is a claim someone can weigh — and weighing it against
other evidence is the evidence-provenance discipline's business, which this surface should
enable rather than pre-empt.

**4b. Make a genuine zero visually distinguishable from no data.** A meter drawn at zero
is an empty track, and an empty track is exactly what "we have nothing here" looks like.
Draw a deliberate baseline mark at zero so a real low score reads as *low* rather than
*missing* — and expose the value and its scale to assistive technology, because a bar with
no announced range gives a screen-reader user a number with no way to interpret it. A
surface that cannot tell a reader whether zero means "scored zero" or "not measured" has
reintroduced the ambiguity this whole technique exists to remove.

**5. Never substitute a default for a missing figure.** A zero for an absent score is a
fabricated adverse result about a person, and it is the worst possible direction for the
error to run. Per
[absence of evidence is not evidence](../../_laws.md#absence-of-evidence-is-not-evidence),
absent renders as absent.

## Decision rules

- **When a state is not on the genuine list, no figure renders — no exceptions for
  internal viewers, previews, exports or debug modes.** Screenshots escape every one of
  those contexts, and a screenshot of a number has no badge attached.
- **When someone argues the badge is sufficient, ask what the reader will repeat
  tomorrow.** They will repeat the number.
- **When a partial verification succeeds — some dimensions checked, others not — render
  only the checked dimensions and state the coverage.** Rendering all of them behind a
  partial badge is the same overstatement at a finer grain.
- **When a figure is genuine but the instrument does not support the precision, round it
  down to what the instrument can carry.** A decimal place invented by a division is a
  claim about resolution the assessment never had, and it makes the whole surface look
  more precise than it is.
- **When the surface is public and candidate-controlled, apply the rule harder, not more
  loosely.** That page is seen by people with no context at all and is the most likely
  thing to be screenshotted.

## When not to use this

- **Not on the employer's internal recruiter surfaces.** A recruiter looking at a
  candidate in the pipeline needs the number with its uncertainty presented honestly, and
  how to do that is the presenting-a-score discipline's job. This technique is about a
  public artifact read by a stranger who cannot ask a follow-up question.
- **Not as a reason to hide results from the candidate themselves.** A person is entitled
  to see what was recorded about them, including in states where a public surface would
  not display it; what they are shown, and how it is explained, belongs to the
  disclosure-and-explanation discipline.
- **Not a substitute for the trust state itself.** Suppressing numbers on a surface that
  still shows a green check has fixed the smaller half of the problem.
