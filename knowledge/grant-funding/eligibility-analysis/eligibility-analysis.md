---
layer: golden-path
type: golden-path
subject: eligibility-analysis
status: forged
use_when: [deciding whether an applicant may apply before judging fit, building or reviewing an eligibility gate in a matching pipeline, deciding what an AI scoring layer may and may not override, an eligible-looking opportunity was hidden or an ineligible one was recommended]
techniques:
  - hard-gate-vs-soft-score
  - applicant-type-code-mapping
  - legal-form-eligibility-model
  - geographic-scope-gating
  - award-size-capacity-fit
  - deadline-and-cutoff-evaluation
---

# Eligibility analysis

Eligibility analysis answers one question and refuses to answer any other:
**may this applicant submit to this opportunity at all?** It comes before any
judgement of fit, alignment, or strategy, and it is decided by deterministic
gates over four facts — who the applicant legally is, where it sits, whether
it can absorb the money, and whether the window is still open. The naive
reading treats eligibility as the first band of a fit score: "eligibility
contributes 30 points". The principal reading is that eligibility and fit are
different *kinds* of answer. Fit is an argument; eligibility is a fact. A
beautifully argued match to an opportunity the applicant is not permitted to
submit to is worth exactly nothing, and worse than nothing when a human spends
a week writing it.

## The four gates

A complete eligibility verdict runs four independent checks, each returning
one of exactly three statuses — pass, fail, unknown:

1. **Applicant type** — is the applicant's kind of organization inside the
   opportunity's declared audience?
2. **Geography** — is the applicant inside the opportunity's territorial
   scope?
3. **Award-size capacity** — can an organization of this size responsibly
   absorb an award of this size?
4. **Deadline** — is the submission window still open at this instant?

The checks are independent on purpose. Each reads different fields, fails for
different reasons, and is explained to the user separately. A combined
"eligibility score" destroys the single most useful property of the gate: a
fail names exactly what disqualifies you, which is also exactly what would
have to change (a fiscal sponsor, a partner in the right territory, a
coalition, a later cutoff) for the answer to flip.

## Three-valued logic is the load-bearing distinction

Every gate must distinguish *"the data says no"* from *"the data does not
say"*. An opportunity that publishes no applicant codes, no award range, or no
close date has not failed anything — it has declined to answer, and the honest
verdict is **unknown**, surfaced to a human with the exact question to verify.
Collapsing unknown into fail silently deletes real opportunities from the
corpus (sparse listings are common, and sparser in exactly the newer markets
where coverage matters most). Collapsing unknown into pass manufactures false
confidence and sends applicants to write against opportunities nobody checked.
Both collapses are one-line bugs with corpus-scale consequences. Unknown is a
first-class status with its own rendering, its own human-review routing, and
its own message stating precisely what is missing.

## Two structurally different eligibility regimes

Field practice across jurisdictions splits into two regimes, and an engine
that models only one silently misreads the other:

- **The code-based regime.** The funder side publishes an enumerated audience:
  each opportunity carries a set of applicant-category codes (charitable
  nonprofits, local governments, school districts, higher education, small
  businesses, individuals, unrestricted…). Eligibility is set intersection:
  map the applicant's declared entity type to the codes it may apply under,
  and pass if the opportunity's set intersects the applicant's set.
- **The legal-form regime.** The funder side publishes no applicant codes at
  all; eligibility is a property of the *applicant's* registered legal form.
  Some legal forms may receive public grants and some may not, and the gate is
  a lookup of the applicant's entity type in the jurisdiction's model of
  grant-eligible forms. Supranational programmes extend this with formal
  legal-entity *validation* — proof of legal personality via registration
  extracts — before any call-specific criterion is even considered.

The regimes need different inputs (opportunity-side codes vs applicant-side
legal form), fail in different directions, and produce different unknowns (a
codeless opportunity vs an undeclared or unrecognized legal form). One check
interface can serve both, but the branch between them belongs to the
jurisdiction model, not to per-opportunity special-casing.

## Deterministic gates outrank every model

The defining architectural rule: **eligibility checks are deterministic and
authoritative, and no scoring layer — heuristic or model-based — may override
a hard fail.** A language model reading an opportunity's prose will sometimes
conclude, fluently and confidently, that "the program appears open to
organizations like yours" while the structured codes say otherwise. The
verdict function must be shaped so this cannot win: compute the fit score
however you like, then let any hard eligibility fail force the terminal
verdict regardless of that score. The inverse discipline also holds:
eligibility gates never inflate fit. A pass means "you may apply", never "you
should".

There is a subtler rule inside this one: **only evidence of gate-grade
reliability may hard-block.** Structured, authoritative fields (declared
codes, a registered legal form, a structured territory, a published close
instant) may produce a fail. Heuristic signals — prose keyword matches,
inferred scope, capacity rules of thumb — are allowed to *pass* or to say
*unknown*, but a heuristic should be very reluctant to fail, because a
false fail hides an opportunity forever while a false pass merely survives to
the fit stage, where a human still reads the listing. Asymmetry of error cost
is the design input; the gate's confidence class must match the severity of
what it blocks.

## Failure modes of the naive reading

- **Eligibility as a score band.** A 92-point match with an eligibility fail
  ranks above honest 70-point eligible matches. The fix is structural, not a
  weight: fail forces the verdict.
- **Prose-only geography.** "National programme" reads identically in every
  country's listings; without a structured country gate, cross-border leakage
  makes every geographic pass untrustworthy. Structure first, prose as
  refinement.
- **Single-bound award collapse.** Treating a missing floor as equal to the
  ceiling makes generous "up to X" opportunities fail the capacity check;
  treating a missing ceiling as equal to the floor lets opportunities spoof
  the fit band. A missing bound is open — floor defaults to zero, ceiling to
  unbounded.
- **Clock-naive deadlines.** Day counts computed in the server's zone rather
  than the applicant's business zone flip an open opportunity to "closed" on
  its most urgent day. Deadline math is the one gate where an off-by-one is a
  forced false fail, so it inherits the full timezone discipline.
- **Stale verdicts.** Eligibility depends on the applicant profile as much as
  the opportunity. Any cached verdict must be keyed on *every* profile field
  the gates read — jurisdiction, entity type, location, revenue — or a
  profile change silently serves the old answer.
- **Default-class fallthrough.** An unrecognized applicant code or legal form
  must resolve to unknown, never to the dominant class. A gate that quietly
  assumes "probably a nonprofit" routes every school district, municipality
  and small business through the wrong door.

## What a fail owes the user

A hard fail is a verdict, not a dead end, and the message it carries is part
of the gate's contract. Each fail states which gate failed, what the
opportunity requires, what the applicant is, and — where a legitimate path
exists — the doorway: an award too large for one organization may be reachable
as a coalition with complementary partners; a closed cutoff may be one of
several, with a later one still open; a type mismatch may be resolvable
through a fiscally sponsoring intermediary. The gate's job is to stop wasted
work, not to end the conversation.

## Order of operations

Run all four gates unconditionally and return all four results — do not
short-circuit on the first fail. The user deciding whether to pursue a
workaround needs the whole picture (a coalition is worth exploring only if
type, geography and deadline all pass). Then derive the verdict: any hard
fail → ineligible; otherwise the fit layer takes over and the verdict becomes
a fit judgement. Eligibility ends where argument begins.
