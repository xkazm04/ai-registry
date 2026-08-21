---
layer: technique
type: technique
subject: regulated-credential-gating
technique: expiry-scoped-to-regulated-credentials-only
status: forged
laws: [inference-must-look-like-inference, meaning-does-not-live-in-a-label]
shared_with: []
use_when: [deciding whether a lapsed certification should affect a hiring decision, designing expiry warnings on a candidate profile, tuning why credential warnings are being ignored]
---

# Expiry scoped to regulated credentials only

Two credentials on the same profile can carry the same expired date and mean completely
different things. This technique is the rule that keeps them apart: **expiry is enforced
where lapse is a legal bar, and merely displayed everywhere else.**

## The asymmetry

- **An expired ordinary certification is a soft signal.** It says a renewal was not
  completed. It may weakly suggest the holder has moved away from that technology or
  practice — or it may say only that their employer stopped paying the fee. It is
  evidence about currency, at low strength, and it belongs in the scoring model where a
  hiring manager can weigh it against the fact that the person has done the work daily
  since.
- **An expired regulated licence is a legal bar.** It is the same object as *not held*.
  The person may not lawfully perform the activity today. No amount of recent practice
  changes it, because the thing that lapsed was the permission, not the skill.

Enforcing the second on the first produces two harms at once. It excludes competent
people over administrative lapses — and, worse, it floods the interface with expiry
warnings until recruiters learn that expiry warnings are noise. The signal that is a
legal bar then arrives in the same visual register as a three-year-old vendor badge and
is skimmed past. **A warning system that cries wolf on soft signals has disarmed itself
for the hard one**, which is a case of
[inference must look like inference](../../_laws.md#inference-must-look-like-inference)
running in reverse: a soft reading dressed in the grammar of a hard fact.

A third reason to scope is defensive rather than semantic: the date field on a captured
credential is populated with whatever date the document showed, which is an issue date
about as often as an expiry. Checking every dated credential multiplies that known
ambiguity across the whole corpus; checking only the regulated ones a requisition
actually requires confines it to cases a human is about to verify anyway.

## Procedure

1. **Resolve the credential through the catalog first.** The regulated flag decides
   whether expiry is a gate. Never derive it from the presence of a date — many ordinary
   certifications expire, and some genuine licences on a profile carry no date at all.
2. **Enforce expiry only on the regulated subset**, and only where the credential is
   *required by this requisition*. A lapsed licence the role does not need is not this
   role's gate; note it, do not block on it.
3. **Compare against a stated reference date**, recorded with the verdict. "Expired" is
   a claim relative to a moment, and a match result re-read a year later must not silently
   re-evaluate ([a verdict is bound to what it judged](../../_laws.md#a-verdict-is-bound-to-what-it-judged)
   in its plainest form).
4. **Model the near-expiry window explicitly.** A licence expiring within the notice
   period of the role is a scheduling fact worth surfacing — not a block, and not silence
   either.
5. **Render the two classes differently.** Regulated lapse gets the risk-flag treatment
   and a verification route; ordinary lapse gets a neutral date line. If they look alike
   on screen, the scoping in the data model has been thrown away at the last step.
6. **Treat a missing date on a credential that always expires as incomplete, not
   current.** The catalog knows which credentials carry expiries; an undated instance of
   one is an extraction gap that needs asking about, and defaulting it to valid is
   exactly the flattering default the domain forbids.

## Decision rules

- **When the credential is regulated, required, and past its expiry, block the
  favourable conclusion and flag** — the same treatment as not evidenced, with a
  different reason string.
- **When the credential is not regulated and expired, score it as a mild currency signal
  and never gate.**
- **When the credential is regulated but not required by this requisition, display and
  do not gate.**
- **When a grace period or renewal-in-flight is evidenced, the state is
  renewal-in-progress, not expired.** These are different situations with different
  hiring answers; flattening them into one label loses the distinction the recruiter
  needs ([meaning does not live in a label](../../_laws.md#meaning-does-not-live-in-a-label)).
- **When the expiry date is undetermined because the source line was ambiguous, do not
  conclude expired.** Hand it to the disambiguation technique and, failing that, to a
  human.

## When not to use this

- **Do not use it to build a "credential freshness" score across all certifications.**
  Aggregating expiry across the ordinary class produces a number that penalises long
  careers and rewards recent test-takers, with no eligibility meaning at all.
- **Do not use it on credentials that do not expire.** A degree, an admission that is
  permanent absent discipline, a one-time qualification — attaching a currency
  expectation to these invents a requirement.
- **Do not use it as a proxy for continuing-education compliance.** Whether someone has
  met their profession's ongoing-development obligations is a question for the register
  and the employer's compliance function, not for a screening pass reading a résumé.
