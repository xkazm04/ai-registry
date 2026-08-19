---
layer: technique
type: technique
subject: eligibility-analysis
technique: legal-form-eligibility-model
status: forged
laws: [hard-gates-precede-soft-scores, honest-null-over-forced-guess]
shared_with: []
use_when: [entering a jurisdiction whose opportunities publish no applicant codes, modelling which registered legal forms may receive public funding, an applicant with an ineligible legal form reached the fit stage]
---

# Legal-form eligibility model

In many jurisdictions the opportunity side is silent about audience — no
applicant codes, often no eligibility prose worth parsing — because the
question is settled at a different layer: **whether the applicant's registered
legal form may receive public grants at all.** An association, foundation,
public-benefit company, municipality or university may; certain commercial or
hybrid forms may not, or may only under specific programmes. Supranational
regimes formalize the same idea as legal-entity validation: before any
call-specific criterion, the applicant proves legal personality with
registration extracts, and a central service validates the entity once for
all programmes. The technique models this applicant-side gate explicitly
instead of pretending every jurisdiction is code-based.

## Procedure

1. **Enumerate the jurisdiction's legal forms.** Each entry carries the
   form's code, a human label, and a boolean-or-conditional
   `grantEligible` flag sourced from the jurisdiction's actual grant law and
   registry practice — not inferred from analogy to another country's forms.
   This table lives in the jurisdiction model, versioned with it.
2. **Gate on the applicant's declared form.** The check is a lookup: form
   declared and recognized and eligible → pass; recognized and ineligible →
   fail, with a message naming the form and the reason; undeclared → unknown
   with a prompt to set it; declared but unrecognized → unknown naming the
   unmatched value. Four outcomes, and the two unknowns must not collapse
   into either fail or the dominant pass.
3. **Branch by regime, not by opportunity.** The eligibility engine chooses
   between the code-intersection check and the legal-form check by asking the
   jurisdiction model whether funder-side codes exist there (an empty
   eligible-codes set is a clean signal). Per-opportunity special-casing of
   the branch reintroduces the drift the model exists to prevent.
4. **Keep validation evidence separate from the flag.** Whether a form *may*
   receive grants (the model) and whether *this* organization's registration
   is proven (verification documents, registry extracts) are different
   questions on different lifecycles. The gate reads the model; the
   verification workflow accumulates the evidence; conflating them makes
   every unverified applicant look ineligible.

## Decision rules

- **When a form's eligibility is conditional ("only for cultural
  programmes"), model it as eligible-with-a-note rather than ineligible,
  because** a hard fail hides every opportunity including the ones the
  condition permits; the condition belongs in the detail and in the fit
  layer's context.
- **When the applicant's form is missing, ask — never default, because** the
  plausible default (the dominant nonprofit form) is precisely wrong for the
  segments a legal-form regime distinguishes, and a wrong form flows into
  every downstream verdict.
- **When two jurisdictions share a language or legal tradition, still write
  separate form tables, because** near-identical form names carry different
  grant-eligibility rules across borders, and a shared table is a silent
  cross-border assumption.
- **When a supranational call is in play, run the membership/territory gate
  and the legal-form gate both, because** the supranational layer adds
  requirements (validated legal personality, minimum consortium composition
  across member territories) without removing the domestic ones.

## Failure modes

- **The analogy trap.** Mapping foreign forms onto the home jurisdiction's
  categories ("this is basically a charitable nonprofit") imports the home
  regime's rules into a jurisdiction that never had them. The form table is
  primary-source work per jurisdiction.
- **Fail as the unrecognized default.** New or rare forms appear in registry
  data constantly; a lookup miss that returns fail turns a vocabulary gap
  into a rejection. Misses are unknown and are logged for table extension.

## When not to use

In a jurisdiction whose funders publish applicant codes on every opportunity,
the legal form is redundant for the gate (though still useful for
verification and document requirements) — run code intersection and let the
form drive onboarding instead. Do not run both as hard gates where one regime
clearly governs; double-gating doubles the false-fail surface.
