---
layer: technique
type: technique
subject: application-intake-and-conversion
technique: eligibility-gate-versus-bot-defence
status: forged
laws: [uncertainty-resolves-toward-the-candidate, absence-of-evidence-is-not-evidence]
shared_with: []
use_when: [adding spam or abuse controls to an application form, designing knockout routing, triaging complaints that qualified applicants were rejected without reason]
---

# Eligibility gate versus bot defence

Two different populations arrive at an application form uninvited: humans who
do not meet a real requirement of the role, and automated junk. They look
similar in a database and demand opposite treatment. The doctrine is one
sentence:

> **The eligibility gate filters ineligible humans, not bots.**

Two problems, two mechanisms, no overlap. Conflating them produces both a
worse gate and a worse bot defence, in a way that is easy to derive and easy
to observe once you know to look.

## The properties are deliberately inverted

| | Eligibility gate | Bot and abuse defence |
| --- | --- | --- |
| Visibility | explained before the question is asked | invisible; never mentioned anywhere |
| Feedback on failure | a specific, plain reason | none, ever — indistinguishable from success |
| Recoverability | correctable in place, immediately | none; a human who trips it is recovered by other means |
| Audit | every failure recorded with its reason | recorded, and reviewed for false positives |
| Tuning goal | precision — decline only what the role truly excludes | recall against scripts, at near-zero human cost |
| Owner of the decision | ultimately a person | the control, silently |

Every row is opposite, which is why one control cannot serve both. A mechanism
tuned to explain itself teaches an attacker how to pass; a mechanism tuned to
say nothing abandons a human.

## The two failure directions

**Gate used as spam control.** More required fields, a stricter validator, a
mandatory account, a puzzle. Each of these deters a script by roughly nothing
— the script does not get bored, does not have one hand free, is not on a
train — and deters real applicants substantially, with the loss concentrated
among mobile applicants and anyone whose details do not fit the validator's
assumptions. You have paid your best candidates to solve a problem they do not
have.

**Bot defence used as a gate.** A real person trips a rate limit (a shared
office network, a family computer, a second attempt after a failed upload), a
timing heuristic (a screen reader, a slow connection, someone who prepared
their answers), or an invisible trap (an autofill extension filling a hidden
field). They receive a rejection, a generic error, or — worst — a message
telling them they are not eligible. Nothing about their application was
examined. They have no reason to appeal and often no way to.

The second is worse because it is invisible on your side too. Blocked traffic
does not appear in the funnel as a lost candidate; it appears as a number that
went down, which is what the control was installed to do.

## Rules that keep the two apart

1. **A bot signal never renders a human-readable rejection reason.** It either
   accepts silently into a quarantine lane, or fails in a way that is
   indistinguishable from an ordinary network error. Explaining the trap
   removes the trap.
2. **An eligibility failure never routes through the spam path.** It gets the
   full treatment: named reason, in-place correction, an audited record, an
   alternative offered.
3. **Any signal a human can plausibly trip is advisory, not decisive.** Rate,
   timing, network reputation, duplicate device — these mark a record for
   review; they do not decline it. Where the signal is ambiguous and the
   outcome adverse, the decision
   [resolves toward the candidate](../../../_laws.md#uncertainty-resolves-toward-the-candidate).
   Only signals no human can trip by accident may act alone.
4. **What silence means depends on who guaranteed the question was asked.**
   This is the distinction most gates get wrong by being uniformly strict or
   uniformly lenient, and it has exactly two cases:
   - **Your own surface.** The form itself guarantees every gate question was
     put to the candidate, so at the server trust boundary an *absent* answer
     is a fail, not a pass — otherwise a crafted submission skips work
     authorisation by simply omitting the key. The strictness is safe only
     because the client refuses to submit an incomplete form and never lets a
     real candidate meet that rule.
   - **A third party's surface.** No such guarantee exists: an agency form, a
     board integration, or a partner's page may never have asked. Silence
     there is [absence, not failure](../../../_laws.md#absence-of-evidence-is-not-evidence),
     and only an explicit negative declines. Missing lands the candidate
     **visibly unverified** — recorded on the record as which gates the source
     never asked, human-routed, and asked directly at the next contact.

   Both halves are needed. Applying the strict rule to third-party intake
   deletes candidates for a question they were never given; applying the
   lenient rule to your own endpoint hands anyone with a scripting tool a way
   around the gate.

5. **Record which gates were explicitly passed, not just that the gate
   passed.** When the candidate later returns to a fuller application, it
   should skip exactly the gates they already answered and no others. An
   unrecorded gate is asked again, never assumed — a small extra question
   beats a fabricated declaration.

## Traps must survive a restyle

The cheapest effective bot control is a decoy field that a human never sees
and a naive script always fills. Its entire value depends on remaining
invisible to people and visible to machines, and its entire fragility is that
invisibility is usually implemented in exactly the layer that gets rewritten.
Three failure histories, all common:

- A redesign swaps the styling system, the hiding rule silently stops
  applying, and the decoy becomes a visible field that real candidates
  helpfully fill in — turning the control into a filter that declines humans
  and passes scripts, the precise inversion of its purpose.
- The hiding technique is one an accessibility tool ignores, so screen-reader
  and autofill users fill it and are silently dropped. A control that
  disproportionately blocks assistive-technology users is not a spam control;
  it is an accessibility exclusion with a security justification.
- The field is named something a password manager or browser recognises, and
  autofill completes it for everyone.

The construction that survives all three: a *real* input, pulled out of the
visual tree by a positioning rule attached to the element itself rather than
by a theme class a redesign can drop; removed from the accessibility tree
explicitly; removed from the tab order; and with autofill turned off. Notably
it must **not** be a natively hidden input type — indiscriminate form-fillers
routinely skip those, which is the whole population the trap is for. The field
must be reachable by a script and unreachable by a person, and every one of
those four properties is doing part of that work.

So: hide by a mechanism that does not depend on a visual theme, name the field
something no autofill heuristic will claim, mark it inert to assistive
technology explicitly, and — because all three of the failures above are
silent — pin the invariant as a test. "The decoy is not perceivable and is
not filled by a legitimate submission" is testable in a way that "remember to
keep this hidden" is not. Pair it with a submission-side check: if the decoy is
being tripped at a rate far above your expected junk volume, something in the
page changed and the control is now eating people.

## Layering, cheapest first

Order controls by cost to a real candidate, not by strength: passive signals
first (decoy field, submission timing floor, per-identifier rate limits,
duplicate-payload detection), reputation second, and an interactive challenge
only if volume genuinely demands it — an interactive challenge is a
measurable conversion tax and it falls hardest on low-end devices and
low-bandwidth connections. Where a challenge is unavoidable, failing it routes
to review rather than to rejection.

## When not to apply this

An internal, authenticated, or invitation-only intake surface has no anonymous
population and needs no trap at all; adding one there is pure conversion cost.
Conversely, a paid-campaign landing surface with a deliberately tiny form has
almost no eligibility gate to speak of and leans almost entirely on passive
bot signals — the asymmetry is fine, because the two mechanisms were never
supposed to be balanced against each other in the first place.
