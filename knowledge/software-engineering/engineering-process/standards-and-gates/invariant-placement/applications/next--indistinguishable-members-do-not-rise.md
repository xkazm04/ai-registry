---
layer: application
type: application
subject: invariant-placement
technique: indistinguishable-members-do-not-rise
stack: next
status: forged
verified_on: 2026-09-16
verified_against: next@16.3.3
applied: code
ab_verdict: better
proof: ab-paired
---

# A tenant boundary that was a comment, in a scanning platform

Verified against `xkazm04/ascent` (public) at commit `d37c8288`, whose parent is
`21b2bebe`. Version witnesses from the tree: `package.json` pins `next` at
`^16.3.3` and the checker resolves to `5.9.3`. Every anchor below was
machine-checked against that commit with `scripts/check-anchors.mjs` on the date
above.

An organization is addressed two ways here, and which one you hold decides
whether a read is tenant-safe. The **slug** is what a request carries and what
authorization is checked against; the **id** is what every tenant-scoped store
read is ANDed with. Before `d37c8288` both were `string`.

## The invariant was stated, in prose, one line above the hand-off

The gate says the rule out loud and then returns both values together, so one
destructure hands every consumer two interchangeable strings:

- the rule — `src/app/api/athena/gate.ts:75` "// The tenant boundary is enforced twice, as everywhere else in this codebase: the slug is"
- the hand-off — `src/app/api/athena/gate.ts:79` "return { org, orgId };"

At the parent commit the context declared both members as `string`. The
populations either side of the resolver were 40 functions taking `orgId: string`
and 181 taking `orgSlug: string`, with one resolver between them and no brand on
either:

- the one door — `src/lib/db/org-rollup.ts:154` "export async function getOrgId(slug: string): Promise<OrgId | null> {"

That anchor shows the door **after** the change; at `21b2bebe` its return type
was `Promise<string | null>`.

## Arm A: nothing in the repository could see the confusion

The same one-token confusion was injected into both arms — passing the slug
where the tenant id belongs, at a real call site:

- the site — `src/app/api/athena/threads/route.ts:34` "listAthenaThreads(ctx.orgId),"

Injected as `listAthenaThreads(ctx.org)` at the parent commit:

| Instrument | Result |
| --- | --- |
| `tsc --noEmit` | exit 0, **0 errors** |
| `vitest run` over the athena routes and the id-gating suite | 4 files, **70 of 70 tests green** |

The seam was chosen because it could **falsify** the technique: had the existing
suite caught a transposed tenant identifier, the finding would have narrowed to
pairs whose confusion is behaviourally silent, and this seam's pair is carried
and matched on rather than computed with. A caught outcome would have said the
call-site altitude was already adequately covered here. It was not caught, which
makes this corroboration from a seam that was genuinely at risk.

**Why it is silent is the part worth copying.** A slug matches no row, so the
scoped read returns empty rather than throwing. There is no error and no wrong
data on screen — just a feature quietly always blank, which is
[failure spelled as empty success](../../../../_laws.md#failure-not-empty-success)
at a tenant boundary.

## Arm B: the checker now names the boundary

The two identifiers carry distinct nominal brands, minted at the door:

- `src/lib/org/ids.ts:37` "export type OrgId = string & { readonly [orgIdBrand]: true };"
- `src/lib/org/ids.ts:40` "export type OrgSlug = string & { readonly [orgSlugBrand]: true };"
- the context that hands both out — `src/app/api/athena/gate.ts:38` "org: OrgSlug;"
- `src/app/api/athena/gate.ts:39` "orgId: OrgId;"
- a migrated consumer — `src/lib/db/athena-threads.ts:130` "export async function listAthenaThreads(orgId: OrgId, limit = ATHENA_THREAD_PAGE): Promise<AthenaThreadRecord[]> {"

The identical injection now fails the typecheck with `TS2345`, reporting that an
argument of type `OrgSlug` is not assignable to a parameter of type `OrgId`.

**Target and floor, both declared before the arms ran.** Target: is the injected
tenant confusion refused? A: no, 0 errors. B: yes, 1 error naming it. Floor: the
change must not move the project's own outcome — `tsc --noEmit` clean with no
injection in both arms, and the full suite green under B at **970 files and
12,599 tests passed, 2 pre-existing skips**. Both held, so `better`.

## The cost of raising the altitude across 221 surfaces was 2 edits

This is the number that decides whether the technique is affordable, and it is
small for a structural reason rather than a lucky one. A branded string is
assignable **to** `string` and not from it, so branding the door's *output*
broke no caller: every unmigrated signature that still takes a plain `string`
kept compiling, and is exactly as safe as before rather than less.

Branding the door plus 13 consumer parameters produced **4** typecheck errors in
total, all in the one other place that carried the same pair as plain strings —
resolved by widening that context's type and one `asOrgSlug` call at the
boundary where a slug arrives from a listing. Nine files, 134 insertions.

## The negative artifact, and the rung it was nearly written onto

The artifact whose pass condition is a refusal:

- `src/lib/org/ids.typecheck.ts:26` "// @ts-expect-error - an OrgSlug may not stand in for the tenant id a store read is ANDed with"
- `src/lib/org/ids.typecheck.ts:27` "const confused: TenantScopedParam = slug;"

It was first written as `ids.test.ts`, and **it stayed green with both brands
deleted**. `tsconfig.json` excludes every `*.test.ts` from the typecheck, so a
type-level artifact in a test file is read by no rung at all: it cannot fail, and
it certifies its own exclusion
([gate-sees-target](../../../../_laws.md#gate-sees-target)). Renaming it out of
the test glob put it inside `include`, and deleting either brand now reports
`TS2578 Unused '@ts-expect-error' directive` and fails `npm run typecheck`. Seen
red at birth, then restored.

That is a general fact about this tree worth carrying into any future
type-level guarantee here: **its typecheck cannot see its own test files.**

## What the realization cannot do

The brand proves **provenance, not validity** — that the value came through the
resolver that looked the org up. It does not say the org still exists, that the
caller is authorized for it, or that the string is non-empty. Authorization and
freshness have clocks and stay where this subject says they stay, at the gate
and the call site.

Record fields were deliberately left as `string`: they are rows read back from
the store, and branding them would pull row construction into the door, which is
the door-invents-data cost the golden path prices. And the migration is
incomplete by design — of 221 surfaces, 14 carry the brand. The remaining ones
are not protected; they are simply no worse than they were, and the order they
get migrated in is blast radius, not alphabetical.
