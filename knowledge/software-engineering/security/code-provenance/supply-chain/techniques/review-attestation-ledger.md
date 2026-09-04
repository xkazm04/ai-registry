---
layer: technique
type: technique
subject: supply-chain
technique: review-attestation-ledger
status: forged
stage: fleet
laws: [unknown-is-not-a-value, count-carries-predicate]
shared_with: []
use_when: [a clean advisory scan is being read as a reviewed graph, an obligation requires showing who looked at third-party code, a graph too large for one team to read alone, importing another organization's audit records]
---

# Review attestation ledger

Advisory matching answers one question: **is this version known to be bad?**
Its silence covers two very different states — code that has been examined and
found fine, and code that nobody has ever opened. A graph with zero findings is
routinely reported as a reviewed graph, which converts *we do not know* into a
definite verdict at precisely the boundary where confidence misleads
([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)). The
complementary axis is a durable record of **who reviewed which version against
which criteria** — an attestation ledger. It does not replace the advisory
gate; it measures a dimension the advisory gate has no opinion about.

Prior art in this subject covers the other axis thoroughly:
[dependency-policy-gates](./dependency-policy-gates.md) owns advisories,
licences, sources and bans, and [update-automation-review](./update-automation-review.md)
owns the human review of an individual proposal. What neither produces is a
*durable artifact of that review* — the reviewer's verdict on a specific
version, surviving the merge, readable next quarter, and reusable by somebody
else.

## Shape: versioned files, not a dashboard

The ledger is three committed artifacts, and their being committed is the whole
mechanism — a review that lives in a review thread expires with the thread.

- **The certifications.** One entry per package version examined, naming the
  version, the criteria it was certified against, and who certified it.
  Certifications come in two useful shapes and both matter: a **full** review
  of a version from scratch, and a **delta** review that certifies the diff
  from an already-certified version to a new one. The delta shape is what makes
  the ledger survivable — the recurring cost is reading a diff, not re-reading a
  package.
- **The criteria and trust configuration.** What "reviewed" was asserted to
  mean — that the code performs no unexpected I/O, that it contains no unsafe
  constructs, that it is free of deliberate backdoors — and which external
  parties' records this project accepts, for which criteria. Criteria are a
  closed vocabulary and belong in one place; two definitions of "audited" is
  the ordinary vocabulary drift with a security label on it.
- **A pinned imports record.** Imported third-party records are inputs to a
  gate; unpinned inputs move underneath it. Pin them and let updates arrive as
  reviewed diffs, exactly as the resolved graph itself does.

The gate over these files is the same standing-policy shape as every other
mechanism in this subject: it runs on the merge rung, and it fails when the
graph contains a version no accepted attestation covers.

## Pooling is load-bearing, not a convenience

The cost of the ledger scales with **graph churn**, not graph size: every
version bump of every transitive dependency is an uncovered version until
somebody attests to it. For any graph a team did not hand-pick, that rate
exceeds what the team can read, and the ledger's coverage decays into
permanent exemptions — the failure mode this technique dies of.

Importing peer organizations' certifications under a declared trust
relationship is what changes the arithmetic. Popular packages are reviewed once
by somebody and the record is shared; the local team's remaining burden is the
long tail nobody else touched, which is also the part most worth their
attention. Read pooling as the design's load-bearing element rather than an
optimization, because the un-pooled version of this technique is not a smaller
version of it — it is one that does not work.

## The import is a trust transfer, and it must be read

Importing another organization's records adopts **their** criteria and their
review standard for every version they cover. That is a defensible trade and
it is the point of the mechanism, but it is a decision, and the ledger renders
it as coverage either way:

- Read the criteria you are importing, in the other party's own definitions,
  and map them onto yours. Two ledgers using the same word for different
  thresholds is the failure that produces a green graph nobody reviewed.
- An **unread import is worse than no ledger at all.** With no ledger, the team
  knows its graph is unexamined. With an unread import, a coverage number says
  otherwise and is quoted in the places coverage numbers get quoted — which is
  the same law that governs the advisory count, one level up
  ([count-carries-predicate](../../../../_laws.md#count-carries-predicate)): the
  predicate behind "94% attested" includes whose criteria produced the 94.
- Prefer importing from parties whose exposure resembles yours and whose
  criteria are published. Trust relationships are recorded in the
  configuration file with the same explicitness as a policy exception, because
  that is what they are.

## Two adjacent facts the ledger keeps honest

- **"No known vulnerabilities" is silent about maintainership.** Whether a
  package is still maintained is a separate policy dimension from whether it is
  vulnerable, and abandonment is not an advisory — nobody publishes one. A
  graph can be simultaneously clean, attested, and quietly dependent on code
  with no living maintainer. Keep the unmaintained dimension as its own
  decision in the policy rather than letting it inherit whatever default the
  tooling shipped.
- **The ledger records the reviewer, so it records the departure.** When the
  only person who ever certified a criterion leaves, that is visible in the
  files. In the review-thread version of this practice, it is not visible
  anywhere.

## Decision rules

- **Two axes, two mechanisms.** Advisory matching for known-bad; the ledger for
  never-looked-at. Neither substitutes for the other, and a report that merges
  them is reporting neither.
- **Attestations are files in the repository**, versioned and diffed, with the
  criteria named per entry.
- **Certify diffs, not packages, once a package has a baseline.**
- **Pin imported records and update them as reviewed diffs.**
- **Read imported criteria before accepting them; record the trust
  relationship where the policy lives.**
- **Unmaintained is a separate verdict from vulnerable.**

## When not to do this

Two conditions, and both must fail before the ledger earns its place.

Below the graph size where a team could plausibly read its own dependencies —
and absent an external obligation that requires *showing* who reviewed what —
the ledger is bookkeeping for a review nobody performs. Certifying a version
one has not actually read is worse than an empty ledger by the same argument as
the unread import.

The obligation half is what usually decides it, and the honest reading of where
this practice comes from is that its own documentation tends to scope it to
organizations with strict supply-chain requirements — regulated, contractual,
or infrastructure-critical — and to say that a good policy gate suffices for
everyone else. That framing under-sells it in one specific way worth naming:
the *coverage question* it answers is real for every project, whatever the
obligation. A small team can answer it once, informally, by reading the graph
and writing down what it read. What the tooling adds is durability and pooling,
and those are what a large or fast-moving graph cannot do without.
