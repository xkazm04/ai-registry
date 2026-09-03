# XL spec — `decentralized-artifact-distribution`

**Status:** DISPATCHED (2026-09-03, run `emdash-design`)
**Source:** `github:emdash-cms/emdash` @ `7a5d9c1838f6afc5649b7bc0940eacf920b40dab`
**Routing count:** system C, 8 design decisions, 6 `corpus: NONE` sharing one home.

## Placement

`knowledge/software-engineering/security/decentralized-artifact-distribution/`

`security` holds 8 subjects directly; this and its sibling `untrusted-extension-host`
(forged in the same session) bring it to exactly 10, which is **at** the cap, not over,
so no subcategory is created. Append the slug to `taxonomy.json`'s `security.subjects`
array — **append, never reorder**. Link depth to `_laws.md` is `../../../_laws.md`.

## Why this is a subject

`research-map` over every concept in this system returns hits only in *other bundles* —
`grant-funding/nonprofit-verification`, `recruiting/portable-candidate-credentials`,
`game-production/content-drift-and-revision`. Inside `software-engineering` there is no
subject that models distributing third-party artifacts when **no single party is
trusted to say what is listed, what is safe, or who published it**. The nearest
neighbours own adjacent halves and must be bounded against, having read them:

- `security/supply-chain` — owns the *consumer's* standing policy at each crossing:
  dependency gates, lockfile freshness, `permission-manifest-scoping`. It assumes a
  registry exists and is authoritative. You own the case where the registry is a
  cache and the authority is the publisher's own signed record.
- `security/signed-artifacts` — owns integrity, provenance and admissibility for a
  file *meant to be carried* between two processes. That is your integrity primitive,
  not your subject: you own who is allowed to *say* things about an artifact, how those
  statements are distributed, and what a consumer does when the sayer is unreachable.
  Do not restate canonical hashing or key custody; cite them.
- `engineering-process/build-and-release/release-pipeline` — owns `release-verification`
  and the updater chain inside one organization's own pipeline. You own publication
  across a trust boundary between strangers.
- `backend-platform/resilience/optional-dependency-degradation` — owns
  `refusal-is-not-failure`. Your fail-closed technique must cite it and add what it
  does not have: the case where degrading *open* is an attack primitive.

## Proposed techniques

Six. Each carries `use_when` and a decision rule.

### 1. `origin-signed-record-with-index-as-cache`
Publisher identity is a portable key, not an account row; the listing IS a signed
record in the publisher's own store, and the index re-fetches and re-verifies it —
inclusion proof plus commit signature — before serving. Decision rule: the index may
**withhold** but must never be able to **forge**, and the test is that a client pointed
at a hostile index cannot be shown a record the publisher never signed. State the cost
plainly: the operator can no longer fix a listing, and a publisher who loses the key
loses the name — which is the same property read from the other side.
Anchors: `apps/aggregator/src/pds-verify.ts:1-18,90-110`,
`packages/core/src/registry/authoritative-records.ts:68-117`.

### 2. `verdict-bound-to-the-exact-revision`
A trust signal names the exact content hash it judged, so approval is
**non-transferable across edits**: the publisher editing the record produces a new
hash and drops out of the approved projection with no moderator action. Same rule on
the consumer's side — install consent is pinned to the revision that was *displayed*,
and re-checked at commit, turning a time-of-check/time-of-use window into an explicit
drift error. Cite `verdict-survives-boundary`. **Do not mint a law**; the director has
recorded a lead that two other bundles carry a content-binding law this one lacks.
Anchors: `packages/registry-moderation/src/evaluate.ts:89-91`,
`packages/core/src/api/handlers/registry.ts:217-240`.

### 3. `split-admit-state-and-redact-authority`
"Moderator" is not one power. Admission (may this be listed at all), state (what is
its status) and redaction (take it down) are three authorities that should be
separately configurable, so an operator can accept one party's takedowns without
accepting its approvals. Decision rule: a single trusted-moderator boolean conflates
three grants and cannot express the common real policy. Include the collision rule —
two terminal states simultaneously active must fail closed, not pick one.
Anchors: `packages/registry-moderation/src/policy.ts:5-14,42-44,60-62`,
`apps/aggregator/src/listing-policy.ts:86,94-110`, `evaluate.ts:174-195`.

### 4. `fail-closed-trust-dependency`
When a required trust signal's *source* goes unavailable, the tempting fix — serve the
last known state, or fail open — hands an attacker a takedown-evasion primitive: knock
the signal source over, ship the bad revision. The rule is demotion: an unhealthy
required source is dropped, and every listing that depended on its positive signal
disappears with it. Two derived rules the source paid for: the health timeout is
**derived from the source's own reconnect budget**, not picked round; and a
*config-parse failure* in the trust policy degrades to deny-all rather than to the
previous or default value, because a partially-parsed policy is a partially-enforced
one. Cite `refusal-is-not-failure`.
Anchors: `apps/aggregator/src/label-source-health.ts:1-4,101-147`,
`apps/aggregator/src/listing-policy.ts:113-132`.

### 5. `signal-that-only-subtracts`
Separate the *display-safety* claim from the *artifact-integrity* claim, give them
different instruments, and make the softer one structurally unable to admit: a
compromised content-moderation signal can block an install but "cannot supply any
verified record, checksum, permission, or executable byte." Pair it with the
automation rule the source enforces at the policy layer rather than by prompt
discipline: **a model may recommend or fail, never admit** — the positive verdict has
no machine-reachable branch, and the only path to it is a human decision naming the
exact revision. Include the honesty note: leaving the unreachable positive branch in
the type with nothing marking it as intentionally dead makes a deliberate design
indistinguishable from a bug.
Anchors: `packages/registry-moderation/tests/inputs.test.ts:119-135`,
`apps/labeler/src/assessment/policy.ts:34,99-141`, `apps/labeler/docs/runbooks.md:7-11`.

### 6. `provenance-required-by-the-publisher-not-the-distributor`
Whether an artifact must carry build provenance is declared in the **publisher's own
signed metadata**, not by a registry-wide switch. That is what makes a downgrade
attack detectable: stripping the provenance from a release still leaves the signed
policy saying it was required. Pair with the publishing half: the CI runner holds no
long-lived publishing credential — it presents an ephemeral attested workload identity,
and the custody service pins the exact workflow identity and holds a delegation scoped
to **one collection and one action**, so a compromised repository yields at most
releases matching an already-approved tuple. Carry the negative: the shipped default
is permissive, so the whole apparatus is opt-in per package and the fleet default is an
unattested install — and the compensating control (a discovery holdback on age) is
weaker because the record carries no *signed* publication time.
Anchors: `packages/registry-verification/src/records.ts:113-117,247-268`,
`packages/registry-lexicons/src/index.ts:75-78`,
`apps/release-service/src/workload/policy.ts:10-50`.

## Boundaries this subject must NOT absorb

- **Running the artifact.** Isolation, capability enforcement at call time, hook
  failure policy — the sibling subject `untrusted-extension-host`, forged this session.
  Your subject ends the moment the bytes are admitted. One sentence in your opening.
- Cryptographic primitives and key custody (`signed-artifacts`).
- Consumer-side dependency policy inside one org (`supply-chain`).
- Any specific federation protocol. Strip it. The techniques must read for a team that
  has never heard of the one this source uses.

## Open questions the drafter must DECIDE

1. **Is `fail-closed-trust-dependency` a technique here or an amendment to `optional-dependency-degradation`?** That subject owns `refusal-is-not-failure`. The distinguishing claim is that failing open is an *attack primitive*, not merely a correctness choice. Argue it, place it once, and if you place it there, write only the boundary here and say so.
2. **Do techniques 1 and 6 collapse?** Both are "the authority is the publisher's signed record." If the honest answer is yes, write one strong technique, not two thin ones, and report the merge.
3. **What single question tells a reader whether they are in this subject or in `supply-chain`?** Put it in the golden path's opening.

## Source-tree applications

Write **three** against the source tree (`stack: typescript`), `verified_against` naming
the stack at the version the tree *witnesses* (engines field, CI pin, lockfile), with
the first paragraph saying which witness.

One application must be **negative**, and the strongest candidate is already found: a
publisher-verification record type is fully specified, ingested, stored, tombstoned and
re-served, and is consumed by *nothing that changes a decision* — the aggregator's
public view carries no verification field at all, while the docs promise the browse UI
shows an "approved author name". A delegated trust root with a write path and no read
path is the most useful sentence this tree can give a reader deciding whether to build
one.

## Rules

Expert-first, then reconcile against the clone at `C:/t/emdash`. Strip every proper
noun from the upper layers, including the protocol's name and every vendor's; grep your
own output for the source's vocabulary before reporting. `use_when` on every technique.
Run `node scripts/check-bundles.mjs` on your own subject. **Run no git command.**
Report every override of this spec with its argument.
