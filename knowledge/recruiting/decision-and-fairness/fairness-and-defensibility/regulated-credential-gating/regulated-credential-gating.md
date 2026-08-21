---
layer: golden-path
type: golden-path
subject: regulated-credential-gating
status: forged
use_when: [hiring into a role where a licence or registration is a legal precondition, deciding whether a missing certification should block a candidate, checking credential expiry on a profile, designing a hard gate that a model must not be trusted to enforce]
techniques:
  - licence-is-a-precondition-not-a-preference
  - credential-cue-catalog-per-role-family
  - required-but-missing-as-a-blocking-gate
  - expiry-scoped-to-regulated-credentials-only
  - issue-versus-expiry-date-disambiguation
  - deterministic-safety-net-behind-the-model
---

# Regulated credential gating

Every other subject in a hiring toolkit is, underneath, a judgment about a person's
capability: can they do the work, how well, on what evidence, compared to whom. This
one is not. **A regulated credential is a fact about a candidate's legal standing, not
an opinion about their competence** — and the entire discipline follows from refusing
to confuse the two.

A hospital may not roster an unlicensed nurse however gifted; a firm may not put an
unregistered person in front of retail investors however persuasive; a contractor may
not send an uncarded worker onto a site however experienced; a court will not hear an
unadmitted advocate however brilliant. In each case the missing item is not a weakness
in the candidate's profile that strength elsewhere can offset. It is a condition
precedent: without it there is no lawful hire, and the strongest interview in the
world does not move the answer by one step.

The failure mode is symmetric, and both halves are common:

- **Treating a licence as a preference.** The scoring model reads "registered nurse"
  as one requirement among eight, finds seven met and one absent, and returns a strong
  overall match. A recruiter, reading a high number, advances the candidate. The gap
  surfaces at offer, at onboarding, or — the expensive version — after the start date.
- **Treating a preference as a licence.** A "certification preferred" line in a
  requisition is wired into the same hard gate, and a whole cohort is knocked out for
  a credential the job never legally required. This is requirement inflation wearing a
  compliance costume, and it produces exclusion with no defence, because there is no
  statute behind it to point at.

The first failure wastes a pipeline and can expose an employer to regulatory action.
The second one excludes qualified people for nothing. A system that cannot tell the
two classes apart will commit one or the other on every requisition.

## Why this gate — and only this one — is safe to automate

The neighbouring standard on automated screening is emphatic that a machine must not
finish an adverse decision on its own, and that the route vocabulary an automation may
execute is narrower than the verdicts a model may utter. Nothing here overrides that.
What is true is that a regulated-credential check is one of the very few hiring
predicates that is *genuinely objective*, and it is worth being precise about why,
because the reasons are also the boundary:

- **It is binary and externally defined.** Held or not held, current or lapsed. The
  definition lives in a statute and a register, not in a rubric someone wrote.
- **There is an authority of record.** Someone other than the employer can be asked,
  and their answer settles it. No other screening signal has this property.
- **It is not a proxy.** It stands for itself. It does not correlate with a protected
  characteristic by construction the way a school, a postcode, a gap or a tenure
  pattern does — and where a licensing regime itself produces disparate access, that
  is a policy question about the regime, not a defect in reading it.
- **It is falsifiable against the candidate's benefit.** A candidate who holds the
  licence can produce it and the gate opens immediately. A capability judgment offers
  no such lever.

**Do not generalise any of that.** The moment a team says "we automate the licence
check, so we can automate the degree check, the years-of-experience check, the
seniority check", every one of those four properties has quietly been dropped: a
degree requirement is a proxy with well-documented disparate impact, years of
experience is a rubric someone invented, seniority is a label whose meaning does not
survive crossing a company boundary. The licence gate is safe *because of its specific
properties*, not because hard gates are safe. State that in the policy, next to the
gate, so the next engineer reading it does not draw the wider conclusion.

And even here the automation stops short of the adverse action. A blocking credential
gap **blocks a favourable conclusion** — it forbids "strong fit" and it forbids
auto-advance — and it **surfaces a risk flag for a human**. It does not fire a
rejection. [No adverse outcome is solely automated](../../../_laws.md#no-adverse-outcome-is-solely-automated)
holds without exception, and it holds here for a very practical reason as well as a
legal one: the most common cause of a missing credential in the record is that the
document did not mention it.

## Absent from the document is not absent from the person

A parsed profile is a reading of what a person chose to write down. Licensed
professionals routinely omit their registration number, or carry it only in a
signature block, or list it under an abbreviation the parser does not know, or hold it
in a jurisdiction whose naming the catalog has never seen.

So the honest state after a credential check has three values, not two: **held**,
**not evidenced**, and — only where a register or a document actually says so —
**not held**. Systems that collapse the middle value into the third convert a document
formatting quirk into a legal disqualification.
[Absence of evidence is not evidence](../../../_laws.md#absence-of-evidence-is-not-evidence)
is the whole of it, and its practical consequence is a workflow rather than a verdict:
a required credential with no evidence in the record produces a *verification task*,
not a knockout. [Uncertainty resolves toward the candidate](../../../_laws.md#uncertainty-resolves-toward-the-candidate)
does the rest — the block lands on the optimistic conclusion, never on the person.

## Reading a document is not verification

The standard for a regulated credential is **confirmation against the issuing
authority**: the public register, the regulator's lookup, the licence-status endpoint,
or a written confirmation from the body itself. A line on a résumé is a *claim by the
candidate*; an uploaded certificate image is a claim by the candidate with better
typography. Neither is a verification, and the difference matters most in exactly the
cases where the gate is load-bearing, because a credential that is legally required is
also the credential most worth falsifying.

Most screening systems, this one included as a class, only ever read the document. That
is a legitimate stage — it tells you where to look and it catches the honest gaps — but
it must never be *labelled* as verification. Record the tier explicitly: self-asserted,
document-supported, authority-verified. The neighbouring subject on evidence provenance
owns how strength tiers combine into a score; what belongs here is the specific rule
that **no amount of document evidence promotes a claim to the verified tier**, because
the promotion path runs through a third party, not through more paper.
[Inference must look like inference](../../../_laws.md#inference-must-look-like-inference):
a screen that renders an extracted licence line in the same visual grammar as a
register hit has told the recruiter something false.

Two operational rules follow. **Never invent an identifier.** A licence number that the
model completes into a plausible format is the single most dangerous artifact this
whole pipeline can emit, because it looks exactly like the thing a downstream verifier
would trust and will fail against the register in a way that reads as candidate fraud.
Capture the identifier only where it is literally present, and leave it null otherwise —
[say only what the record holds](../../../_laws.md#say-only-what-the-record-holds). And
**verify before the offer, not after the start date**, because the only remedy after
that point is a termination that costs the candidate a job they left another one for.

## A licence is scoped, and the scope is not in the abbreviation

The same three letters name different objects in different places. A nursing
registration is granted by a jurisdiction and is valid in that jurisdiction, sometimes
extended by a compact or a mutual-recognition arrangement, sometimes convertible by
endorsement, sometimes not convertible at all. A securities registration is tied to a
regulator, a sponsoring firm, and a set of permitted activities — and lapses on a clock
when the sponsorship ends. An engineering licence is state- or province-scoped.
Admission to practise law is scoped to a bar.

[Meaning does not live in a label](../../../_laws.md#meaning-does-not-live-in-a-label). Model
a credential as at least four fields — kind, issuing jurisdiction or body, identifier,
and status-with-dates — and match a requisition's requirement against all four. A
requisition asking for a licence in the hiring jurisdiction is not satisfied by the
same-named licence elsewhere, but neither is that candidate disqualified: they are a
*reciprocity or endorsement question*, which is a human decision with a timeline, and
frequently the right one when the pipeline is thin. Encoding that as a knockout throws
away the exact candidates a regulated role is usually short of.

Status is likewise not binary. Current, lapsed, inactive-by-choice, suspended, revoked
and renewal-in-flight are six different situations with six different hiring answers,
and only two of them are anywhere near a "no". A grace period after an expiry date is
common and is not the same as a lapse.

## Expiry is a scoped concept, not a universal one

Almost every credential on a profile carries a date, and the naive implementation
checks them all. This is wrong in a way that is worth being loud about, because it
produces both halves of the symmetric failure at once.

**An expired ordinary certification is a soft signal.** A cloud or vendor
certification that lapsed two years ago says something mild about currency of practice
and nothing at all about eligibility. Someone who has been doing the work daily since
is not less able because a renewal fee went unpaid. Rendering that as a red expiry
warning next to a genuine licence lapse teaches recruiters that expiry warnings are
noise — and then they ignore the one that matters.

**An expired regulated licence is a legal bar.** Practising on it is, depending on the
regime, a disciplinary matter or a criminal one. It is not a currency signal; it is the
same object as "not held".

There is a second reason to scope, less obvious and stronger in practice: **scoping
bounds the blast radius of an ambiguous date.** Whatever field a credential's date lands
in gets populated with whatever the document showed — an issue date as often as an
expiry. A past-date check run over every credential on every profile therefore
multiplies a known parsing ambiguity across the entire corpus. Restricting it to the
small regulated subset a given requisition actually requires shrinks the exposure to the
cases a recruiter was going to verify anyway, where a false flag costs one glance rather
than a wall of noise. Scope first, then improve the parse.

So the expiry check is **scoped to the regulated class only**, which means the catalog
that decides what is regulated is a load-bearing safety artifact rather than a
convenience list. For everything else, capture the date, show it, and let it inform a
human's reading of recency — but do not gate on it and do not colour it like a
violation.

## Two dates on one line, and the verdict inverts

The most under-appreciated bug in this whole subject is a parsing problem with a legal
consequence. A credential line commonly carries two dates — issued and expires, or
awarded and valid-through, or a date pair with no labels at all — and the two readings
produce opposite verdicts on the same candidate. Read an issue date as an expiry and
every credential in the corpus looks expired, so the gate fires on people who are
perfectly current. Read an expiry as an issue date and nothing ever expires, so the
gate never fires at all and the safety net is decorative while appearing to work.

Neither error announces itself. The first shows up as an unexplained surge in
credential risk flags; the second shows up as nothing, ever, which is why it survives
for years. Treat date-role assignment as its own step with its own rules and its own
undetermined outcome, rather than as a detail of extraction — the technique on
issue-versus-expiry disambiguation carries the procedure.

## The model extracts; something deterministic decides

A language model is the right tool for finding a credential in unstructured career
prose, normalising its name and pulling its dates. It is the wrong tool to be the sole
holder of a legal gate, for three reasons that are properties of the tool and not of
any particular one: its output varies run to run; a silence is indistinguishable from a
finding of absence; and it is exactly as fluent when inventing an identifier as when
copying one.

The discipline is **two passes over the same facts**. The model produces structured
credential records into first-class fields — never a free-text paragraph a later reader
must re-parse. Then a deterministic pass, with no model in it, takes the requisition's
required-credential set and the candidate's structured records and recomputes the gate:
required-and-not-evidenced, required-and-expired, required-and-wrong-jurisdiction. The
deterministic result is the one that binds. Where the model's narrative and the
deterministic gate disagree, the gate wins and the disagreement is itself worth logging,
because a persistent divergence is a defect report about the prompt.

This also settles what happens when the model is unavailable. The gate is not a model
feature, so a degraded run does not silently clear it: the pipeline continues on the
deterministic path, the provenance is downgraded honestly, and the verdict lands on
hold rather than freezing a degraded reading as authoritative
([a candidate's process never stalls on your constraints](../../../_laws.md#a-candidates-process-never-stalls-on-your-constraints)).

## Where this subject ends

Extraction mechanics — how career prose becomes structured records at all — belong to
the parsing-and-career-reading neighbour; this subject only specifies what fields a
credential must have and why free text will not do. How strong a piece of evidence is,
and how tiers combine into a score, belong to evidence provenance; what stays here is
that the authority-verified tier is unreachable from documents alone. The grammar for
saying "we could not determine this" belongs to inference labelling and refusal; what
stays here is the insistence that the undetermined credential state exists and is
distinct from absent. How a knockout reason is worded and ranked in front of a recruiter
belongs to score presentation; what stays here is that a blocking credential gap must
appear as a *reason*, above the score, and never be reduced to a few lost points. And
what may be automated at all belongs to the screening-fairness-gates neighbour, whose
route vocabulary this gate obeys exactly like every other signal.

## Failure modes this standard exists to prevent

- **The offsettable licence** — a hard legal precondition scored as one requirement
  among many, so skills strength produces a strong-fit verdict on an ineligible hire.
- **The inflated gate** — a "preferred" certification wired to the blocking path,
  excluding a cohort with no statute behind the exclusion.
- **Absent read as not held** — a document that never mentioned a licence treated as
  proof the candidate lacks one.
- **The invented identifier** — a plausible licence number completed by a model,
  indistinguishable downstream from a real one and failing at the register as fraud.
- **Verification theatre** — an extracted line displayed with the authority of a
  register hit, so nobody ever performs the check the standard actually requires.
- **Universal expiry** — every dated certification gated alike, until expiry warnings
  are noise and the one that is a legal bar is skimmed past.
- **The inverted date** — an issue date read as an expiry (or the reverse), silently
  firing the gate on everyone or on no one.
- **The abbreviation match** — a jurisdiction-scoped licence matched on its letters, so
  a foreign registration passes and a reciprocity candidate is knocked out.
- **The model as the gate** — the entire legal precondition resting on whether a
  generative pass happened to mention it this run.
- **The phantom requirement** — a credential requirement a normalisation step filled in
  because the requisition was silent, then enforced as though the employer had asserted
  it.
- **Verified after the start date** — a check performed late enough that its only
  remedy is a termination.

## The techniques

- [licence-is-a-precondition-not-a-preference](./techniques/licence-is-a-precondition-not-a-preference.md)
  — separating the two classes of requirement and forbidding offset between them.
- [credential-cue-catalog-per-role-family](./techniques/credential-cue-catalog-per-role-family.md)
  — the catalog of regulated credentials and their cues, organised by profession.
- [required-but-missing-as-a-blocking-gate](./techniques/required-but-missing-as-a-blocking-gate.md)
  — what a blocking gap blocks, what it does not, and how it reaches a human.
- [expiry-scoped-to-regulated-credentials-only](./techniques/expiry-scoped-to-regulated-credentials-only.md)
  — checking dates where lapse is a legal bar and only there.
- [issue-versus-expiry-date-disambiguation](./techniques/issue-versus-expiry-date-disambiguation.md)
  — assigning roles to the dates on a credential line without inverting the verdict.
- [deterministic-safety-net-behind-the-model](./techniques/deterministic-safety-net-behind-the-model.md)
  — recomputing the gate outside the model, and what binds when they disagree.
