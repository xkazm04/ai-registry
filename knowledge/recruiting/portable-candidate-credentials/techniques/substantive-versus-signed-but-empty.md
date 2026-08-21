---
layer: technique
type: technique
subject: portable-candidate-credentials
technique: substantive-versus-signed-but-empty
status: forged
laws: [absence-of-evidence-is-not-evidence, say-only-what-the-record-holds, a-candidates-process-never-stalls-on-your-constraints]
use_when: [a credential verifies but shows nothing useful, defining what counts as a substantive assessment payload, hardening a credential issuer against degraded upstream stages]
---

# Substantive versus signed-but-empty

## The concern

A signature over an empty payload verifies flawlessly and proves nothing. This is the
failure mode that looks most like success, and it is the reason structural emptiness has
to be its own resolved state rather than a variety of pass.

The shape is always the same. An upstream stage degrades — the analysis returned nothing,
the recording was silent, the exercise was abandoned after thirty seconds, a schema change
left the extraction writing into a field nobody reads, a timeout produced an empty result
object that a permissive parser accepted. Nothing throws. The issuer receives an object of
the right shape, assembles a well-formed envelope, seals it correctly, and hands the
candidate a credential whose signature is impeccable and whose content is a hollow.

Then a stranger opens it, sees a green check, and the system has attested to an assessment
that did not meaningfully occur. Per
[absence of evidence is not evidence](../../_laws.md#absence-of-evidence-is-not-evidence),
the empty payload is not a low score and not a pass — it is the absence of a measurement,
and the only honest rendering says so.

## What "substantive" has to mean

Not "non-null". A structural check that only rejects missing fields passes every one of
the interesting cases, because degraded pipelines produce *present and empty*, not absent.
Define substance per assessment kind, in terms that a degraded run cannot accidentally
satisfy:

- **The measured dimensions exist and are populated** — not merely present as keys with
  default values. A dimension set where every entry is the scale's midpoint or its floor
  is a strong signal of a default-filled object, not a real reading.
- **The evidence the result rests on exists.** If the assessment claims to be based on
  observed work, there must be a reference to that work with a non-trivial extent — a
  transcript with a length, a submission with a size, a session with a duration.
- **The extent clears a floor set by the instrument, not by a round number.** A thirty-
  second sample of a forty-minute exercise is not a short assessment; it is not an
  assessment. Derive the floor from what the instrument needs to produce a reading and
  write down that derivation, because you will be asked.
- **Free-text justification, where the instrument produces one, is present and is not the
  template.** A rationale identical across credentials is a default, and a default
  rationale attached to a real name is worse than none.

Check substance on the *canonical form's fields* — the sealed claim — never on the
rendering. A template that shows an em-dash where a number should be tells you about the
template.

## Procedure

**1. Check substance at issuance and refuse to issue.** This is the important half. The
verification-side state exists to catch what escaped; the fix is not issuing a hollow
credential in the first place. An issuer that cannot assemble a substantive payload
produces no credential and an explicit operational failure — never a sealed placeholder.

**2. When issuance is refused, tell the candidate something true and non-blaming.** Their
assessment could not be recorded; they did nothing wrong; here is what happens next. A
degraded run on your side must not become a silent absence they discover by finding
nothing in their hands, and per
[a candidate's process never stalls on your constraints](../../_laws.md#a-candidates-process-never-stalls-on-your-constraints)
it must not park their progress either.

**3. Re-check substance at verification, as a distinct resolved state.** Older credentials
predate the issuance gate, and a payload can be emptied by a migration. The state is
*structurally empty* — not verified, not tampered, not an error. Its copy: the signature
is intact and the record contains no assessment result.

**4. Order it after integrity and before freshness.** An empty payload that fails its
signature is broken, not empty; and asking whether an empty result is stale is a category
error.

**5. Suppress all numeric rendering in this state, unconditionally.** There is nothing to
show, and a zero, a dash or an empty meter each read as a result. Show the state.

**6. Alert on the rate.** Structurally-empty issuance attempts are a pipeline health
metric, and a rising rate is the earliest available signal that an upstream stage has
degraded. If nobody is watching it, the first detection will be a candidate asking why
their credential is blank.

## Decision rules

- **When a payload is partially substantive — some dimensions real, others empty — issue
  the credential covering only what was measured, and state the coverage.** Per
  [say only what the record holds](../../_laws.md#say-only-what-the-record-holds), a
  three-dimension credential that says it covers three of five dimensions is honest; the
  same credential silently presented as a full assessment is not.
- **When substance is borderline, refuse.** The cost of not issuing is a person who did
  not get an artifact; the cost of issuing is an attested claim about an assessment that
  did not happen, standing in front of a stranger with your organisation's name on it.
- **When a re-assessment rebuilds to a non-substantive payload, leave the existing
  credential alone.** Reissue normally means revoking the old artifact and minting a
  corrected one — but if the new build has no substance there is nothing to mint, and
  revoking anyway strips a genuine credential out of someone's hands to resolve an internal
  inconsistency. A degraded re-run is not evidence that the original assessment did not
  happen.
- **When a degraded upstream stage is the cause, never seal a partial result as though it
  were complete in order to keep a promise about issuing credentials.** The promise is to
  issue a true one.
- **When someone proposes a "pending" credential to be filled in later, refuse that too.**
  A credential is sealed over what it says; a placeholder that will be mutated is either
  not sealed or will fail verification once mutated.
- **When emptiness is genuinely the outcome — the candidate declined, withdrew, or did not
  attempt — that is not a credential.** Do not issue an artifact whose content is a
  non-participation. It is a record that can only harm its holder, which fails the
  ownership test the whole subject rests on.

## When not to use this

- **Not as a quality gate on the assessment's result.** A low score from a real assessment
  is substantive. This technique detects the absence of a measurement, never an unwelcome
  one, and any implementation that starts filtering weak results is a scoring policy
  wearing a validity check.
- **Not for judging how much an assessment is worth as evidence.** How heavily an observed
  exercise, a self-report or a third-party claim should weigh belongs to the
  evidence-provenance discipline and its ladder. This technique answers only whether there
  is anything there at all.
- **Not a replacement for schema validation upstream.** Catching hollow payloads at the
  seal is the last line; catching them where they are produced is cheaper and tells you
  which stage broke.
