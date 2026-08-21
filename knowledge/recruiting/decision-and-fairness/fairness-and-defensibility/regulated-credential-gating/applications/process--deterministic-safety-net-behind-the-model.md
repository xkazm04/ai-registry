---
layer: application
type: application
subject: regulated-credential-gating
technique: deterministic-safety-net-behind-the-model
stack: process
verified_on: 2026-08-20
---

# The credential gate as prompt instruction plus deterministic screen

The CV-analysis pipeline realizes the two-pass discipline literally: the extraction
prompt states the gate in prose, and `pipeline/jobfit/credentials.py` recomputes it in
pure Python with no model and no network. The module docstring names the reason the
second pass exists — the gate "was delegated 100% to the LLM's free-text
`recruiter_risk_flags` — a single missed generation = a silent wrong hiring outcome with
compliance exposure" (`credentials.py:1-20`). That is the standard's non-determinism and
silence-is-ambiguous arguments, discovered from a production failure rather than from a
principle.

## Pass one: the model extracts into first-class fields

`pipeline/jobfit/models.py:16` defines `Credential` as a typed record — `name`,
`issuer`, `identifier`, `expiry`, `kind` — documented as "a professional license or
certification — **often the legal gate on a hire** … First-class so it can be surfaced,
verified, and gated on, **not lost in free-text**". The standard's insistence on typed
records over prose is the schema's own stated rationale.

The extraction prompt in `pipeline/jobfit/gemini.py` carries both halves of the
technique:

- the capture instruction (`gemini.py:556`): licences and certifications go into
  `credentials` "with issuer/identifier/expiry where stated … extract them even if
  mentioned only briefly; **never invent an identifier**" — the anti-fabrication rule
  placed at exactly the field that invites it;
- the gate instruction (`gemini.py:557`, labelled `CREDENTIAL GATE`): when the job
  description requires a specific licence the candidate's credentials do not include,
  "treat it as a BLOCKING gap — surface it in `job_fit.recruiter_risk_flags` and `gaps`,
  and **do not rate them a strong fit on skills alone**. A required-but-expired
  credential is the same risk."

That last clause is the standard's cap-the-conclusion rule stated to the model in one
sentence, and the equivalence of expired and missing stated in the next.

## Pass two: the deterministic recomputation

`credential_checks` (`credentials.py:102-140`) takes the job-description text and the
structured credential list and re-derives both gate conditions with no model in the
loop: required-but-missing (the requisition matches a regulated cue and no held
credential name matches that licence's name cues) and expired-regulated (a held
regulated credential carries a date already past). It is pure and parameterised on
`today`, which is what makes `pipeline/jobfit/tests/test_credentials.py` able to pin the
contract at a fixed reference date.

`pipeline/jobfit/pipeline.py:321` folds the result into `sanity_checks` — the same trust
ledger that carries `authenticity_checks`, `prompt_injection_checks` and
`_grounding_sanity_checks`. The call-site comment states the independence property the
standard asks for: the prompt gate "was LLM-narration only. This **independently** flags
a JD-required regulated licence the candidate doesn't hold … a hard, compliance-relevant
blocker that a single missed LLM flag must not silently drop."

## Screen, not verdict

Every emitted finding ends in `(manual review)` and every one says "verify":
"…not found in the candidate's credentials — **verify before advancing**", "…confirm the
licence is current". The module docstring makes it a rule — "A SCREEN, not a verdict —
every finding says 'verify'" — matching the sibling authenticity screen's "never an
auto-reject" posture at `pipeline.py:308-311`. Findings count toward the review flag;
nothing in this path rejects, filters or hides a candidate.

## Where the repo falls short of the standard

- **The gate is a sentence, not a structured gap.** Findings are English strings folded
  into a string list, so the credential, the state and the requisition source cannot be
  read without re-parsing prose. The repo already knows better elsewhere: `KoReason`
  (`pipeline/jobfit/matching.py:266-268`) pairs a stable `key` with a human `detail`
  precisely so "rollups group by category directly instead of re-parsing English prose".
  Credential findings should carry the same shape.
- **The verdict is not actually capped in code.** The cap on "strong fit" lives only in
  the prompt (`gemini.py:557`); the deterministic pass raises a flag but does not
  constrain the score or the fit label the model returned. A missed generation therefore
  still yields a strong-fit verdict with a credential warning beside it. The standard's
  rule is that the deterministic result binds.
- **The gate does not reach the hard-gate filter.** `ko_filter`
  (`matching.py:294-340`) enforces seniority, education, language and work mode; there
  is no credential arm. Keeping a credential gap out of the knockout list is the *right*
  call under the standard — a capped candidate must stay visible — but it means the
  requisition-side requirement is never modelled as a first-class `Job` field, only
  re-detected from raw text each time.
- **No verification tier, no jurisdiction, no undetermined state.** Extraction reads a
  document; nothing records that this is a self-asserted claim, no field scopes a licence
  to a jurisdiction, and an unparseable date silently returns "not past" rather than
  "undetermined". The standard's three-value currency state does not exist here.

## What the repo gets right that generalizes

`ko_filter`'s treatment of uncertainty is the posture the credential gate should inherit
wherever it grows a knockout arm: an unknown education level **skips** the education gate
rather than failing it, an unclassified archetype is explicitly not hard-gated
("FAIL CLOSED: never auto-KO on seniority a candidate we cannot classify"), and a work
mode stamped from `DEFAULT_POLICY` rather than asserted by the ad is treated as absent —
"a PHANTOM the ad never asserted … must NEVER act as a hard gate"
(`matching.py:335-340`). That phantom rule is the sharpest statement in the repo of why
an unasserted requirement may not exclude anyone.
