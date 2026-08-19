---
layer: technique
type: technique
subject: nonprofit-verification
technique: verification-passport
status: forged
laws: [clean-is-not-ready, provenance-per-field, small-samples-stay-silent]
shared_with: []
use_when: [turning a multi-source verification run into a durable credential an org can reuse, defining the aggregate eligibility verdict and its confidence score, deciding how long a verification stays valid and how tampering is detected]
---

# Verification passport

A verification run is expensive attention: several registries queried, a
name bound, polarities weighed. Spent as a one-off boolean it evaporates,
and the organization re-proves its legitimacy from scratch to every funder,
fiscal sponsor, and tool that asks. The technique is to crystallize the run
into a **portable, signed, time-boxed credential** — one document carrying
the verdict, every per-source outcome behind it, and enough integrity
machinery that a third party can trust it without re-running the checks.

## What the passport contains

- **Identity as verified, not as claimed**: the claimed legal name, the
  registry's canonical name, and the three-valued name-match result. The
  registry name is the authoritative one; carrying both preserves the
  provenance of the disagreement when there is one.
- **The full source roster**: for every declared source, its key, outcome,
  raw status, human detail, and check timestamp. This is provenance per
  field — a verifier can re-derive the verdict from the evidence rather
  than trust the headline boolean, and an auditor can see which checks ran,
  which decided, and which were structurally absent.
- **The verdict and its score** (below), jurisdiction, entity type, issue
  and expiry instants, an integrity signature, and a spec version so
  future readers can parse past credentials.

## The verdict: three clauses, none negotiable

**Eligible = at least one determinate pass AND zero determinate fails AND
name-match is not a mismatch.**

- *At least one pass*: a run where every source came back inconclusive —
  outage, unconfigured deployment, unbuilt jurisdiction — certifies
  nothing. Zero findings from zero decided checks is not a clean bill;
  requiring a positive makes "clean but unready" unrepresentable.
- *Zero fails*: determinate disqualifiers are gates, not score components.
  No accumulation of passes outvotes a dissolution record or a sanctions
  hit.
- *No name mismatch*: the impersonation guard keeps its veto at the
  aggregate level, where it can override otherwise-clean checks — the only
  place a veto means anything.

The confidence score is computed **over determinate results only**: passes
divided by decided checks, undefined-as-zero when nothing decided. Dividing
by all sources *run* lets infrastructure weather dilute a legitimate
organization's score; excluding inconclusives keeps the number a statement
about evidence. This is the small-samples discipline applied to a
credential: a ratio over checks that never decided is a lie told with true
numbers, so those checks stay out of the denominator — and a score over
very few decided checks should be presented with its denominator, not as a
bare percentage.

## Integrity and lifetime

Sign the credential — at minimum a content hash enabling offline
tamper-detection, with an asymmetric signature or verifiable-credential
envelope as the production-grade form so verification does not require
asking the issuer. Verification of the passport is recomputation: re-derive
the signature over the embedded content and compare.

Expiry is not optional. Good standing is a perishable fact — organizations
dissolve, exemptions are revoked, sanctions lists change weekly — so the
passport carries an expiry a few months out (a 180-day order of magnitude
balances re-verification cost against staleness risk, with the sanctions
dimension arguing for the shorter end wherever funds actually move). A
consumer treats an expired passport exactly like an absent one.

## Decision rules

- **When the UI needs a rich per-source view, project the passport into a
  display summary rather than letting views read raw adapter results,
  because** one projection point is the only way the headline, the roster,
  and the credential are guaranteed to agree.
- **When new sources come online, reissue rather than amend, because** a
  credential whose contents changed after signing is exactly what the
  signature exists to reject; passports are immutable snapshots and the
  newest unexpired one wins.
- **When a funder wants "just the boolean", give the boolean with the
  issue date, expiry, and source count attached, because** a yes divorced
  from when and from how many checks decided is the rumor the passport was
  built to replace.
- **When the registry's legal-form code disagrees with the applicant's
  self-declared entity type, carry the reconciliation (verified, mismatch,
  unconfirmed) in the summary and surface mismatch for correction,
  because** entity type feeds eligibility gates downstream, and a silently
  wrong self-declaration poisons every later verdict.

## When not to use

Do not mint passports from a single-source run in a multi-source
jurisdiction as if roster coverage did not matter — the credential's value
is precisely that it attests the *whole* declared check set, gaps included.
Do not stretch the passport into a general reputation score by folding in
soft signals (age, size, past awards); it certifies registry-grounded
standing, and mixing argument into evidence spends the credibility that
makes it portable. And skip the credential machinery entirely for a purely
internal, immediately consumed check — sign and box the result when it
travels; a signature on a value that never leaves the process is ceremony.
