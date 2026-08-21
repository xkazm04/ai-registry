---
layer: technique
type: technique
subject: public-work-evidence-bounding
technique: public-work-is-optional-evidence-not-a-requirement
status: forged
laws: [absence-of-evidence-is-not-evidence, uncertainty-resolves-toward-the-candidate, no-adverse-outcome-is-solely-automated]
shared_with: []
use_when: [deciding whether to ask for a portfolio or repository link, weighting public output in a scoring model, writing an advertisement that mentions public work, auditing a pipeline for availability bias]
---

# Public work is optional evidence, not a requirement

Public output is unevenly available for reasons that have nothing to do with
capability, and a hiring process that requires it has narrowed its pool along
those reasons. This technique is the fairness rule that bounds every other
technique in the subject: everything else governs how to read public work
well; this governs what its *absence* is permitted to mean, which is nothing.

## Why absence carries no information about capability

The distribution of public work tracks four things far more strongly than it
tracks skill:

- **Discretionary time.** Publishing happens outside paid hours for most
  people. It therefore correlates with caring responsibilities, second jobs,
  commute length, health, and disposable income — a filter on circumstance
  wearing the costume of merit.
- **Employer policy.** Entire sectors forbid publishing work product.
  Defence, finance, healthcare, government, security, and most agency and
  client-service work routinely produce fifteen-year careers with no public
  artifact at all. The more sensitive and trusted the work, the less of it is
  visible.
- **Career stage and cohort norms.** Publishing habits differ sharply by
  generation, by discipline, and by the professional culture someone trained
  in. A convention that is near-universal in one specialism is unheard of in a
  neighbouring one.
- **Willingness to be visible.** Public participation carries a harassment
  cost that is not distributed evenly, and people who have paid it once
  reasonably stop.

Each of these correlates with characteristics a hiring process must not select
on. That makes "has public work" a proxy — and a proxy's adverse impact is
not excused by the sincerity of the team using it.

## The rules

1. **Presence may raise a claim's standing; absence may never lower one.**
   With no public evidence, the assessment is exactly the assessment that
   would have been made without the question being asked
   ([absence-of-evidence-is-not-evidence](../../_laws.md#absence-of-evidence-is-not-evidence)).
2. **Never make a public link a required field.** Optional means optional in
   the form, in the validation, in the completeness meter, and in the
   recruiter's view. A profile rendered as incomplete because a field is blank
   has made the field mandatory in the only place that matters — the reader's
   impression.
3. **Never let public work enter a ranking as a component that defaults to
   zero.** An unmeasured section coerced to a low value ranks the person worst
   on a number nobody computed. Exclude the section instead, and renormalise
   honestly or not at all.
4. **Weight it by what the role actually depends on.** For a research post,
   publications may legitimately be primary evidence, because the work
   *product itself* is public by construction. For a creative or design role,
   a portfolio may be primary for the same reason. For everything else it is
   supporting evidence — and stating that dependence in the role brief, in
   advance, is what separates a defensible requirement from an imported
   hobbyist filter.
5. **When public work is genuinely required, say so in the advertisement and
   say why.** Then accept the pool consequences knowingly, offer an equivalent
   route — a work sample, a described project, a redacted artifact, a
   reference — and treat the alternative as equal, not as a concession.
6. **Never let the absence drive an automated adverse outcome.** No auto-reject,
   no auto-deprioritise, no silent sort to the bottom of the queue
   ([no-adverse-outcome-is-solely-automated](../../_laws.md#no-adverse-outcome-is-solely-automated)).

## Decision rules

- **When a hiring manager asks to filter on "has a public repository", offer
  the capability filter they actually mean** and show what the public-work
  filter costs the pool. The request is nearly always a proxy for "evidence I
  can see quickly", which a structured work sample serves better and fairly.
- **When public evidence exists for some candidates and not others in the same
  shortlist, do not compare across that line.** A comparative claim needs
  comparable bases; corroborated-and-uncorroborated is a difference in
  visibility, not in quality.
- **When a scoring model gives public work a weight, audit that weight against
  outcome data as you would any other proxy.** If it moves selection rates
  between groups, it is a proxy for something and needs a business
  justification stronger than convenience — that audit is the
  adverse-impact subject's craft, but the trigger belongs here.
- **When a candidate volunteers a link, the strongest reading is still
  corroborative.** Generosity with evidence is not itself a qualification, and
  rewarding it directly re-introduces the same bias through the back door.
- **When uncertain whether an absence is a signal, it is not**
  ([uncertainty-resolves-toward-the-candidate](../../_laws.md#uncertainty-resolves-toward-the-candidate)).

## Anti-patterns

- **"Show me your code."** A screening habit rather than a policy, applied
  unevenly across a pool by whichever interviewer happens to ask, which makes
  it both a fairness problem and an unrecorded, undefendable decision.
- **The completeness meter.** A progress bar that treats an optional public
  link as a missing item, teaching candidates that the optional field is
  compulsory and teaching recruiters that the profile is deficient.
- **The enrichment sweep.** Silently searching for a candidate's public
  presence without being given a link, then scoring what is found: it credits
  strangers' work, penalises common names, and turns a fairness rule into a
  surveillance one.
- **Volume metrics as a floor.** Requiring a minimum activity count, streak,
  or contribution graph — a direct measurement of unpaid discretionary time.
- **The equivalent route that is not equivalent.** An alternative path that
  costs the candidate four hours where the link costs zero has not removed the
  requirement; it has priced it.

## When not to use it

- **When the public artifact is the profession's actual work product** —
  academic publication records, open-source maintainership as the role itself,
  performance or exhibition history. Even then, requiring it is a role
  decision that must be stated in the advertisement and justified by the work,
  and the equivalent-route rule still applies to anyone whose comparable work
  was done under a name or an employer that owns it.
- **When reading public work at all is out of scope** — a blind screen, an
  early anonymised stage. This technique bounds how absence is read; it does
  not argue for looking.
