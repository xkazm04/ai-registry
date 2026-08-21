---
layer: technique
type: technique
subject: portable-candidate-credentials
technique: freshness-is-separate-from-integrity
status: forged
laws: [say-only-what-the-record-holds, meaning-does-not-live-in-a-label, a-verdict-is-bound-to-what-it-judged]
use_when: [setting a validity window on a credential, changing an assessment rubric that older credentials were scored under, writing the badge copy on a verification surface]
---

# Freshness is separate from integrity

## The concern

A credential can be perfectly valid and completely out of date. The signature says the
bytes are the bytes that were sealed; it has no opinion whatsoever about whether those
bytes still describe the person. Conflating the two is the most common substantive error
in credentialing, and it runs in both directions:

- **Integrity read as currency.** A green check on a result from two years ago, presented
  as though it were a statement about the person today. The system is technically correct
  and communicatively false.
- **Currency read as integrity.** A stale credential shown in a warning colour with a
  broken-seal icon, so a sceptical reader concludes the artifact is suspect. Nothing is
  wrong with it. It is old, and old is not damaged.

Freshness is a second, independent axis with its own inputs, its own policy and its own
copy. Model it that way or the badge will lie in one direction or the other.

## Two mechanisms, not one

**Elapsed time.** A result decays because the world moved: the person practised, changed
domains, or stopped. This is a clock on the credential — a validity window, chosen per
assessment kind rather than globally, because a language-proficiency reading and a
one-hour coding exercise decay at nothing like the same rate. It is knowable at
verification time from the credential alone.

**Supersession.** The assessment methodology changed on *your* side. The rubric was
recalibrated, a dimension was split, a scale was rescaled, a scoring model was replaced,
a band boundary moved. Every credential issued under the old methodology still verifies
perfectly — and the claim it encodes has quietly retired, because the label it carries no
longer maps to anything you currently mean by that label. This is
[meaning does not live in a label](../../../_laws.md#meaning-does-not-live-in-a-label) in its
sharpest form: the string "band 3" survived the migration; the thing it referred to did
not. And it is
[a verdict bound to what it judged](../../../_laws.md#a-verdict-is-bound-to-what-it-judged):
the verdict was bound to a methodology, so when the methodology retires, so does the
binding.

Supersession is not a clock. It is an event, on a date, caused by you, and a system that
models freshness only as elapsed time will never detect it — the credential is young, the
signature is good, and the meaning is gone.

## Procedure

**1. Stamp the methodology version into the sealed form.** Without it there is no way to
detect supersession after the fact, and you will be reduced to guessing from the issuance
date, which is wrong for anything issued near a migration boundary.

**2. Publish a validity window per assessment kind, and put it in the seal.** Sealing the
window means the credential carries its own expectations rather than depending on a policy
lookup the verifier may not be able to reach. Choose the window from how fast the measured
thing actually changes, and be prepared to defend the number; an unexplained round number
is a guess wearing a uniform.

**3. Maintain a supersession register.** For each assessment, the methodology versions
that are current, the ones that are retired, and the date and reason for each retirement.
Resolution consults it. A retirement entry should say whether old results *translate* into
the new methodology — sometimes a rescale is honestly mappable and should be presented as
the old result plus a stated conversion, and much more often it is not, and the honest
output is that the result is no longer interpretable under the current instrument.

**3b. Derive freshness from fields that are already sealed — never add a signed field to
get it.** This is the rule that lets you introduce freshness to a system that already
issued credentials. Issuance date and methodology version are enough to compute both age
and supersession; adding a new field to the form would bump the version, invalidate every
outstanding artifact and break every link a candidate has already shared. A new dimension
computed from an existing seal is free. A new dimension inside the seal costs you the back
catalogue, and the people holding it did nothing to deserve that.

**4. Resolve freshness after integrity, and report it separately.** Integrity first
because a stale broken credential is broken; then freshness as its own outcome. The
surface shows two facts, not one blended verdict: what was checked about the bytes, and
what is known about the currency.

**5. Write copy that separates fault from age.** *"This credential is intact. It records
an assessment from [date], under a methodology retired in [date]."* Not "invalid", not
"failed", not a warning triangle. Per
[say only what the record holds](../../../_laws.md#say-only-what-the-record-holds), the
record holds an old true thing, and saying so plainly is the whole job.

## Decision rules

- **When a credential is stale, keep showing its substance with the date stated.** Hiding
  a real result from its owner because a timer elapsed is its own dishonesty, and it
  destroys the credential's only value to the person — that they left holding something.
  Age is context, not disqualification.
- **When a credential is superseded, say so and stop presenting the result as a current
  grade.** This is the one freshness case where suppressing the figure is right, because
  the figure now means something you no longer measure. Show what was recorded and state
  plainly that it is not interpretable under the current instrument.
- **When you change a rubric, decide the fate of existing credentials in the same change,
  not afterwards.** The migration plan is incomplete until it says whether previously
  issued credentials are superseded, translated, or unaffected. Deferring this decision
  guarantees it gets made accidentally by whoever writes the badge template.
- **When elapsed time and supersession disagree, supersession wins.** A three-week-old
  credential under a retired methodology is superseded, not fresh.
- **When you cannot determine the methodology version — an old credential from before you
  stamped it — do not assume it is current.** Report unknown methodology and treat the
  result as uninterpretable rather than defaulting it into the live rubric.
- **Never let a freshness rule expire a credential out of a candidate's hands.** Their
  copy is theirs permanently; what expires is your willingness to vouch for its currency,
  and those are different sentences.

## When not to use this

- **Not where the underlying fact does not decay.** A record that a person completed a
  specific exercise on a specific date is not less true a decade later. Attach freshness
  to *inferences about present ability*, not to statements of historical fact — and be
  honest about which one your credential is, because most credentials are a mixture and
  the mixture is where the misreading happens.
- **Not as a retention mechanism.** Expiring a credential does not delete anything, does
  not discharge a retention obligation and does not answer an erasure request; the
  consent-and-retention discipline owns that entirely. A stale credential is a live record
  with an unflattering date.
- **Not as a revocation mechanism.** Revocation is a deliberate act about a specific
  credential, usually because something was wrong with it. Staleness is time passing.
  Collapsing them means every routine expiry reads to a stranger as though the issuer
  withdrew the claim.
