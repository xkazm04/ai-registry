---
subject: decentralized-artifact-distribution
domain: software-engineering
last_touched: 2026-09-03
dry_streak: 0
---

# decentralized-artifact-distribution

Born 2026-09-03 from `/intake` run `emdash-design` (intake 2.2.0), alongside its sibling
`untrusted-extension-host`. Per-system routing count: system C, eight design decisions,
**six `corpus: NONE` sharing one home**. The map was unusually clear here — every concept
in the system returned hits only in *other* bundles (`grant-funding/nonprofit-verification`,
`recruiting/portable-candidate-credentials`, `game-production/content-drift-and-revision`),
and nothing in `software-engineering` modelled distributing third-party artifacts when no
single party is trusted to say what is listed, what is safe, or who published it.

Placed in `security` directly (tenth of ten, at the cap). The golden path opens with the
question that separates it from `supply-chain`, decided by the drafter: *is the party you
fetch from the party you trust?* Yes — the registry is authoritative and everything is
standing consumer policy, which is `supply-chain`. No — the fetch is a cache lookup and
the trust is anchored where the index cannot reach, which is here; and the two compose
rather than substitute. Other boundaries: `signed-artifacts` supplies the integrity
primitive and is cited rather than restated (this subject owns who may *say* things about
an artifact, and what a consumer does when the sayer is unreachable); `release-pipeline`
owns publication inside one organisation; the running of an admitted artifact is the
sibling subject.

Six techniques. The drafter was asked whether two of them collapse and argued convincingly
that they do not: one defends against **forgery** — constraining what a distributor can
add or alter, tested by "a hostile index cannot show a record the publisher never signed"
— and the other against **omission**, constraining what an attacker can silently remove,
tested by "stripping the evidence leaves a signed statement saying it was required." They
are independent in both directions, and collapsing them yields a technique whose decision
rule is "sign things", which decides nothing. `fail-closed-trust-dependency` was likewise
kept here rather than made an amendment to `optional-dependency-degradation`: failing open
when a *required* trust source is unreachable converts "evade the check" into "take down
the checker", usually a smaller and less-defended target operated by someone with no stake
in the registry, which makes it an attack primitive rather than an availability trade.

Upward lessons the expert draft lacked, taken from the tree: a health timeout derived from
the signal source's own reconnect budget rather than picked round; a trust policy that
fails to parse degrading to deny-all rather than to a previous or default value; a
replay-owed recovery discipline where reconnection alone must not restore authority; and
the deliberate asymmetry that takedowns are scoped to the identity while approvals are
revision-bound.

The negative application is the strongest artifact here: a publisher-verification record
type with a complete write path — subscribed, ingested, validated, tombstoned, re-served,
two indexes annotated with the queries they were built for — and **no read path that
changes any decision**. Neither index is used; the public view carries no verification
field; the in-repo contrast is an older centralized service whose equivalent column is
selected by every browse query. The general form is banked as a lead: a delegated trust
root is not delegated until a consumer branches on it.

Director review: gate green, `use_when` on all six, taxonomy appended (no reorder), purity
grep clean — including the federation protocol's name and every one of its terms, which
the drafter stripped throughout (publisher identity is "a portable identifier the
publisher controls"). Spec:
`librarian/handoffs/2026-09-03-emdash-decentralized-artifact-distribution.md` (EXECUTED).
Could not verify in the tree, recorded as shortfalls rather than softened: no
hostile-index acceptance test exists, and a genuinely signed but superseded record is
neither detected nor documented as out of scope.

Fleet: **unapplied** — no managed project distributes artifacts to strangers. Return
condition: when a fleet project ships to an audience it does not control.
