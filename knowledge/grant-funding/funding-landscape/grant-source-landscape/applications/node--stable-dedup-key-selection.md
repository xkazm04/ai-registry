---
layer: application
type: application
subject: grant-source-landscape
technique: stable-dedup-key-selection
stack: node
status: forged
verified_on: 2026-10-22
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# The publisher's identifier existed under a name nobody read

Source tree: the fleet's grant-matching platform for small nonprofits (slug `grant`), a
TypeScript web application, read on 2026-10-22 on `main`. The stack witness is the
continuous-integration pin, Node 24. The repository is private, so this document describes the
seam and does not cite paths or lines. The change is `b238884` on the project's `main`.

## The ladder's first rung, missed by a field name

The Czech structural-funds adapter followed the selection ladder in its code: take the call's
own code, fall back to a slug of the title only when there is none. Its fixture spelled the code
field one way. The live ministry export spells it another, so on real data the first rung never
matched and every id was minted from the title, which is the rung the technique says is mutable
and collides. It was found by replaying the real export for the status-gate application in the
same run, not by reading the adapter.

## The paired proof

Same file both arms, the live export dated 2026-10-21. Distinct ids over all 821 calls, A 768:
53 calls overwrote an earlier call with the same title prefix on upsert, and since the status
gate did not yet exist, a closed call could replace an open one. Over the 154 open and planned
calls the status gate keeps, A 151, B 154. Floor: 3,669 tests, type check and lint green; the
new test, two calls sharing a title under two codes, fails on A.

## What this does not fix

Rows already stored under title-slug ids are not migrated or retired. The store only upserts,
so on a store that ran this adapter before the change, the old ids stay beside the new ones
until their close dates pass. The adapter is off by default, and no live store was inspected.
The lesson for the technique's onboarding step is that a fixture written from documentation
proves the ladder's shape and not that its first rung fires: assert the identifier rung against
one captured real payload.
