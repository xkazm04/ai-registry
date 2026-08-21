---
layer: technique
type: technique
subject: regulated-credential-gating
technique: issue-versus-expiry-date-disambiguation
status: forged
laws: [absence-of-evidence-is-not-evidence, uncertainty-resolves-toward-the-candidate, say-only-what-the-record-holds]
shared_with: []
use_when: [a credential line carries two dates, extraction is producing unexplained expiry flags, an expiry check appears to never fire]
---

# Issue versus expiry date disambiguation

A credential line usually carries dates, and usually carries them without saying which
is which. "Registered nurse, 2019–2027", "certificate no. 4471, 03/2021 06/2026",
"awarded 2018, valid to 2026", or simply a credential followed by one bare year. The
role assigned to each date decides the verdict, and **both errors invert it**:

- **Issue read as expiry** — every credential granted in the past reads as expired. The
  gate fires on candidates who are perfectly current, in bulk, and the failure is at
  least visible: an unexplained surge of credential risk flags.
- **Expiry read as issue** — nothing ever expires. The gate never fires, the safety net
  is decorative, and it *looks like it is working*. This one survives for years, because
  the absence of an alarm is indistinguishable from the absence of a problem.

Because the second error is silent, the correct posture is not "pick the more likely
reading" but "assign roles by rule, and have an undetermined outcome you are willing to
emit".

## Procedure

1. **Prefer explicit labels above everything.** Words adjacent to a date — issued,
   awarded, granted, conferred, since, versus expires, valid through, renewal due, good
   until — settle the role outright. Build the label vocabulary per language the pipeline
   actually ingests; a label list that only covers one language is why the ambiguous
   branch dominates on international corpora.
2. **Use a labelled range.** Two dates joined by a range separator, where the first is
   not in the future, is issue-then-expiry — the near-universal convention. A single
   date with no label is *not* a range and must not be treated as half of one.
3. **Consult the catalog.** If the credential is one that does not expire, a lone date
   is an issue date, full stop. If it always expires and only one date is present, the
   role of that date is genuinely ambiguous and must go to the undetermined branch rather
   than being guessed.
4. **Use ordering only between two dates of the same credential**, never across lines.
   Of two dates belonging to one credential, the earlier is the issue and the later the
   expiry. This rule is safe; the same reasoning applied to dates scavenged from
   neighbouring lines is not.
5. **Use the future test as confirmation, not as inference.** A date in the future is
   almost certainly an expiry. A date in the past is *not* evidence of either role —
   which is precisely the asymmetry naive implementations get wrong, because a corpus of
   past dates reads as a corpus of expiries.
6. **Bind a month to its year, never to the string.** Within an expiry year that equals
   the current year, the question "has it already passed" turns on a month — and the
   only number that may serve as that month is one *adjacent to that year* in one of the
   conventional orderings. Scanning the whole string for any number in the one-to-twelve
   range reads a day, a series number, a certificate id or a room number as a month, and
   flags a current licence as lapsed. This is the same class of error as the year
   inversion, one digit smaller and correspondingly harder to notice.
7. **Emit undetermined when the rules do not settle it**, and carry that state through
   the gate as its own value. Undetermined is not expired and not current.

## Decision rules

- **When the role of a date cannot be established, do not conclude expired.** The
  candidate is not disqualified by a formatting choice
  ([uncertainty resolves toward the candidate](../../../../_laws.md#uncertainty-resolves-toward-the-candidate)).
- **When the credential is regulated, required, and its currency is undetermined, cap
  the verdict and route to verification.** Undetermined is not a pass either — the
  favourable conclusion still does not issue, because the record does not support it
  ([absence of evidence is not evidence](../../../../_laws.md#absence-of-evidence-is-not-evidence)).
- **When only one date is present on a credential that always expires, record it with
  its role marked unknown** rather than assigning it to whichever field the schema makes
  convenient. A date filed into the expiry field "for now" is a fabricated claim the
  moment anything reads it
  ([say only what the record holds](../../../../_laws.md#say-only-what-the-record-holds)).
- **When formats are ambiguous between conventions** — a numeric day/month pair that is
  valid either way — resolve by the document's other dates where they disambiguate, and
  by the issuing jurisdiction's convention otherwise; where neither settles it and the
  two readings straddle the reference date, emit undetermined.
- **When a year alone is given for an expiry, treat the credential as current through
  the end of that year.** Assuming the first day of the year invents an expiry the
  document does not state.

## Instrumentation, because both failures are quiet

Neither error announces itself, so the check is statistical rather than per-candidate.
Track the distribution of outcomes over the corpus: the share of regulated credentials
reading as expired, the share undetermined, and the share of extractions where two dates
were present at all. A regulated-expiry rate near zero, or near one, is a defect report
regardless of which direction it points. Sample a fixed set of profiles with known
correct readings and re-run them whenever the extraction prompt or the parsing rules
change — this is the only cheap way to catch a silent inversion introduced by an
unrelated edit.

## When not to use this

- **Do not use it on dates that are not credential dates.** Employment ranges,
  publication years and education dates live on other lines and follow other
  conventions; borrowing this rule set for them produces confident nonsense.
- **Do not use it to synthesise a missing date.** Inferring an expiry from a typical
  renewal cycle plus an issue date produces a number that looks measured and is not.
  The catalog's renewal cycle may inform a *question to ask*, never a stored value.
- **Do not use heuristics here to avoid asking.** Where the credential is a legal
  precondition and the dates are ambiguous, one message to the candidate or one register
  lookup outperforms every rule on this page.
