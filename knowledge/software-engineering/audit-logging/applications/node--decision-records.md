---
layer: application
type: application
subject: audit-logging
technique: decision-records
stack: node
---

# Decisions that survive the next regeneration

Four modules of a repository-analysis product surface work a human must
judge — a failing security check, a repo with no owning team, a readiness
blocker, a solo-maintained repo — and none of them owns a database row:
each is "recomputed from scan data on every render"
(`src/lib/org/findings.ts:1-6`). The decision a user records against one
must therefore attach to something that survives the next scan.

## Identity before wording, stated as the design's foundation

The module header says it outright: "The whole design rests on key
stability. A key built from wording ('Default branch is unprotected')
changes the moment a rubric or an LLM reworded the sentence, **silently
orphaning the decision and resurrecting a finding the user already
dismissed**" (`findings.ts:9-13`). The ladder is implemented as written:

- Entity plus stable check id — `itemKey: \`${row.fullName}::${c.id}\``
  for security findings (`findings.ts:91`).
- The bare durable entity where the finding *is* the repo — teams and
  contributors key on `fullName` (`:113`, `:174`).
- Normalized-text hash **only** where nothing else exists: readiness
  blockers are model-authored prose, so `blockerKey`
  (`findings.ts:128-135`) hashes `stableText` (trim, lowercase, collapse
  whitespace — `:64-66`) with a dependency-free FNV-1a (`:48-61`), scoped
  inside the repo's own prefix so "collisions are scoped to one repo's
  blocker list". The consequence is accepted deliberately in the doc
  comment: "A materially reworded blocker is a NEW finding — correct: the
  decision was made about the old wording, and a changed blocker deserves
  a fresh look" (`:128-131`).

Both structural rules hold. Derivation lives in one pure module — "no
Prisma, no React, no db imports … keeps the key derivation in exactly one
place" (`findings.ts:15-19`) — and "Adding a new module means adding a
builder here, **never inventing keys at the call site**" (`:13-14`). The
uniform key shape pays off downstream: because every key is either
`fullName` or `${fullName}::${suffix}`, selecting a repo's decisions "is a
prefix match, not a guess" (`src/lib/db/org-decisions.ts:138-142`).

## State and act, in two stores

`decide()` (`org-decisions.ts:168-232`) upserts the **state** on the
`(orgId, module, itemKey)` unique — "re-deciding edits the row rather than
appending" — and the store is "sparse by construction: an undecided
finding has NO row", which "keeps the badge count a single indexed read"
(`org-decisions.ts:9-12`). The **act** is then appended to the audit
ledger through the ordinary door: `recordAudit("org_decision.recorded", {
module, itemKey, status, memoryId }, …)` (`:226-230`). Neither store tries
to be the other.

The derived-artifact rule is stated as a deliberate ordering: the
write-through that publishes the rationale into shared org memory is
"best-effort and NON-transactional with the decision itself … a missing
memoryId is a recoverable gap, a lost decision is not"
(`org-decisions.ts:14-19`), and the publish is wrapped in `.catch(() =>
null)` (`:206-219`).

## The record keeps its own caption, bounded

`DecideInput` persists `title` — "The finding's title at decision time, so
the record still reads after the finding disappears"
(`org-decisions.ts:88`) — alongside `rationale`, `decidedBy` and
`snoozedUntil`. Where decisions are fed back into the product's own model
prompts, `decisionsForRepo` returns "only RESOLVED decisions carrying a
rationale … Newest first, bounded" at `MAX_PROMPT_DECISIONS = 12`, because
"a repo with 40 dismissed findings must not crowd out its own code"
(`org-decisions.ts:134-157`).

## The allowlist, and the caveat that may not be declined

Owner declines on the readiness passport are keyed by field path against
an explicit allowlist, `DECLINABLE_PATHS`
(`src/lib/analyze/passport-overlay.ts:52-75`), validated at the route
before anything is stored (`src/app/api/report/passport/overrides/route.ts:62`,
`:106`). The exclusion is the part worth copying, and the comment above the
table gives the reason: "A decline is only meaningful for a gap an owner
can legitimately choose to live with. **Enforcement facts a SCAN couldn't
observe (the tokenless branch-protection caveat) are deliberately NOT
declinable** — that would let an owner silence a limitation of the
evidence rather than accept a real trade-off"
(`passport-overlay.ts:40-43`). Unknown paths are skipped on render, never
rejected (`:149`).

## A decline never moves the score

`applyDeclines` (`passport-overlay.ts:96-99` onward) retires the matching
blocker line and re-renders it under `passport.declined` with its label and
the owner's reason — "scores are never touched — a choice to skip a gap is
not the same as closing it, and the score must stay honest". The module
header draws the same line: "A decline is NOT a fix: it never moves a
score. It retires the gap from `blockers` … so the next reader sees a
decision instead of an unread finding" (`:5-9`).

## Stored outside what regeneration rewrites

The survival property is structural: declines live in
`Repository.passportOverridesJson`, "**never inside the scan-derived
passportJson**. A new scan rewrites passportJson only … so the overlay
re-applies the same declines to the freshly generated passport — a re-scan
can never silently clear an owner's decision"
(`passport-overlay.ts:11-15`), with the overlay applied at read time on
every surface that renders a passport (`src/lib/db/org-rollup.ts:408`,
`src/lib/db/org-nav-counts.ts:106`,
`src/lib/db/personal-passports.ts:53`) and the store itself confined to
one module (`src/lib/db/passport-overrides.ts:1-8`). Erasure honors the
same split: a tenant erase resets scan-derived caches including
`passportJson` but deliberately leaves owner-authored config, because
"erasure removes the data, it does not silently unconfigure the tenant"
(`src/lib/db/retention.ts:752-765`).
