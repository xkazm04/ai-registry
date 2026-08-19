---
layer: technique
type: technique
subject: impact-reporting
technique: verifiable-impact-certificates
status: forged
laws: [clean-is-not-ready, provenance-per-field, never-fabricate-a-figure]
shared_with: []
use_when: [designing third-party-checkable proof of delivered impact, publishing a public credibility page for an organization, deciding how a verification badge may honestly present itself]
---

# Verifiable impact certificates

An organization's impact claims usually live on its own website, which is to
say: nowhere a skeptic can check. The certificate technique packages one
delivered outcome — this grant, from this funder, deployed these dollars, and
the report on it was submitted on this date — as a structured attestation a
third party can inspect **without logging in and without trusting the
claimant's prose**. The certificate does not make the claim more true; it
makes the claim's basis inspectable, which is what separates accountability
from marketing.

## Anatomy of an honest attestation

A certificate is a list of **named checks**, each carrying: an identifier, a
human-readable label, a passed/failed verdict, the source of the evidence,
the timestamp it was checked, and a note stating the concrete fact ("$50K
awarded by [funder] for [program], reported under [period]"). Three
properties are load-bearing:

1. **Failed checks stay in the document.** A certificate for a grant whose
   report was never submitted shows that check failing — it is not omitted,
   and the certificate is not withheld. The format's value *is* the failure
   case: a scheme that only ever emits all-green attestations is a rubber
   stamp, and readers learn to price it as one. The aggregate verdict is
   "all checks passed", computed over every check present —
   [clean is not ready unless every check ran](../../_laws.md#clean-is-not-ready)
   demands the reader be able to see both what was checked and what each
   check found, never a bare seal.
2. **Every fact names its source.** Which record system attested the dollars,
   which attested the submission —
   [provenance per field](../../_laws.md#provenance-per-field) at the
   attestation layer. A modeled figure inside a certificate keeps its
   approximation marker and its conversion rate; the certificate inherits the
   figure's epistemics, it does not upgrade them.
3. **Integrity covers the built object.** If the certificate is signed or
   hashed, the signature is computed over the assembled certificate itself —
   never over a separately hand-mirrored copy of its fields. A mirror drifts
   the day someone adds a field to one side, and then the signature silently
   stops covering the very value (say, the submission timestamp) that gates
   the verdict.

## Expiry and restatement

An outcome statement ages: figures get restated, follow-on periods change the
picture, records get corrected. Certificates therefore carry an expiry — a
year is a reasonable durability for a delivered-outcome attestation — and an
expired certificate **must never render as currently passing**. Expired is a
distinct visual and logical state, not a detail in metadata: a verifier page
that shows a confident green verdict over a stale attestation is asserting
something no one has checked recently, which is the temporal form of the
fabricated figure ([never fabricate a figure](../../_laws.md#never-fabricate-a-figure)).
Supersession, not mutation, handles updates: a restatement issues a new
certificate; the old one expires or is marked superseded. Attestations are
append-only history, not editable records.

## Disclose the strength of the scheme itself

The seal must not claim more than its cryptography delivers. A
deterministic keyless hash proves an attestation is internally consistent
with the issuing scheme — useful against accidental corruption — but it is
not forgery-resistant, and a verification page presenting it as a guarantee
is overclaiming about its own machinery. The rule: the verification surface
states, in reader-facing words, what the signature does and does not prove,
and the caveat is driven by the certificate's own spec-version marker so
that upgrading to real key-based signatures drops the caveat automatically —
disclosure as a property of the data, not a paragraph someone must remember
to remove. Tooling that overclaims teaches readers to distrust the entire
surface, including its honest parts.

## The public dossier

Individual certificates compose into a public, no-login credibility page:
attested outcomes listed alongside the aggregate ledger figures, with
expired attestations visibly downgraded and an explicit empty state when
there is nothing yet worth showing. Keep the two evidence classes distinct
on the page — attested certificates versus self-reported aggregates — so a
reader always knows which claims carry independent checkability. Blending
them launders the weaker class in the stronger's credibility.

## When not to use it

Certificates attest **specific, record-backed events** — dollars received, a
report filed, an eligibility check passed. They cannot honestly attest
diffuse outcomes ("improved community wellbeing") that no record system can
verify; forcing those into certificate form dresses narrative in the costume
of proof and degrades the format. And below a handful of attestable events,
skip the machinery: a public dossier with one certificate impresses no one —
publish the honest ledger and build the history first.
