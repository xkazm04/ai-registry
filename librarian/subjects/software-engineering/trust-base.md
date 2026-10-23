---
subject: trust-base
domain: software-engineering
last_touched: 2026-10-22
touched_by: deepen
dry_streak: 0
---

# trust-base

Founded 2026-10-14 by intake run duvet-1014 from one verified-core repository (n=1) plus
a compile experiment and a fleet audit. Home: engineering-process/standards-and-gates.
Boundaries held: proof cost (test-input-generation), runtime invariant placement,
gates and waivers, dependency policy, test-harness structure. Review again when a
second independent source (another verifier or an unsafe-heavy codebase) reaches the
same rules; until then every technique rests on one tree read plus training convergence.
Resolved 2026-10-14 (/deepen n136): a lint can enforce a comment on unsafe trait impls (clippy undocumented_unsafe_blocks visits them); the original claim "block form only" was a phantom, corrected in the golden path and soundness technique.
Deepen pass 1 (2026-10-14): L1 synthesis + one L2 source read (linter source). Yield: 1 correction. No new technique - single convergence only. Banked: Rust 2024 edition widened the spelled base (unsafe attributes required, unsafe extern, unsafe_op_in_unsafe_fn warn default - last unverified at primary) ; return when a second verifier/unsafe-heavy tree is read. Saturation: dry=0, L2 not reached for verifier-side claims (external_body semantics, Kani stubbing).
Impact: see registry-map stale queue after regeneration.
2026-10-14 (intake icm-1014, while vox held the subject): a second unsafe-using tree read against `soundness-argument-names-its-dependencies` - application `rust--soundness-argument-names-its-dependencies--icm` (three per-module test mutexes standing in for one environment lock; a transmute under a lint allowance). Not a verifier, so it does not discharge the review condition above for the verifier-side techniques.
2026-10-14 (intake vox-1014): new technique `census-counts-unmarked-members` - functions a later language revision re-marks as unsafe are trust-base members with no marker in older-revision code; the revision's migration lint counts them (text stand-in validated 9 = 9 on one package). Measured: one fleet tree 38 marker sites vs 103 unmarked members, another 0 vs 49. Amendment to `soundness-argument-names-its-dependencies`: a dependence on which threads exist decays at a distance (the source tree's note was invalidated five months later by a latency change that started a thread one line before the call path). Golden path: audit caution, technique count six to seven, list entry. Converges with the icm run's application the same day (per-module test locks; the race is on the whole environment, not one key). Applications: source tree `rust--census-counts-unmarked-members`, fleet `rust--census-counts-unmarked-members--personas`. Direction proposed to tracklight (0 markers, 49 unmarked test writes, one lock). The deepen pass's banked lead (the 2024 revision widened the spelled base) is the other side of this technique and is not discharged by it.

## 2026-10-21 - deepen tb-deepen-1021 (ranked: single stack, rust)

Second stack: next (TypeScript), from kp read at 4ca15eb79. kp's ts-ratchet ceilings every
@ts- directive and eslint disable and records explicit `any` as zero, reasoning that the
type checker is the gate for it. In TypeScript the unchecked type is a value: JSON.parse,
Response.json() and Array.isArray narrowing hand typed code an `any` that nobody spelled.
Census over three feature packages: arm A (directives) 0; arm B (typescript-eslint 8.59.2
no-unsafe-*, outside config, tree unchanged) 30 production lines, plus 4 members that
neither instrument sees: a `.then((x: T) =>` callback on a promise of `any` is an assertion
with no `as`. A standalone fixture reproduced the lint's silence. 13 such sites tree-wide
(a floor). The text stand-in was validated against the lint on one package: 16 = 11 flagged
sources + 3 folds into `unknown` (sound, overcounted by text) + 2 annotations. The package
with 0 members folds every response through `unknown`.

Condition added to census-counts-unmarked-members (upper layer, no product names): where the
unchecked type is a value, count its flow with the type-aware lint beside the directives,
and count annotated callbacks separately, since the lint does not visit them; name what the
lint does not visit with its count. Golden path: third audit caution widened, list entry.
Application: next--census-counts-unmarked-members--kp (experiment, better). No new technique.

Counter-evidence lane: the lint's blind spot probed on a fixture outside the tree (flagged
`const v: T = await r.json()` and `useV(JSON.parse(s))` and isArray's `any[]`; silent on
the annotated callback and, correctly, on the fold). Self-correction during the run: the
annotated-callback search first counted `(p: unknown)` callbacks (the cure) as members, and
the one-line `as` classifier missed `as (`; both fixed before landing. Volatile scan: no
vendor-set facts in the subject (year and duration mentions only).

Impact: 0 judged trust-base verdicts fleet-wide (18 pairs over 12 projects, all `unknown`);
nothing for `/conform --stale`. kp map regenerated (2 trust-base digests moved, judged 339
kept).

Review condition from founding (a second verifier or unsafe-heavy tree) still open: this
pass widens census-counts-unmarked-members only; verifier-side techniques still rest on one
tree. Banked: kp direction, a typed-lint ratchet line; return when kp adds it. Dry-streak 0;
depth L3 (an instrument run against a tree plus a fixture).

Idled 2026-10-22 (curator, /deepen subject form, run tb-idle-1022). Dispatched on "never swept by
the librarian" at HEAD a00b9d2f, a day after tb-deepen-1021 landed the next stack. The finding
was an instrument artifact: this note had no frontmatter, so librarian-scan read last_touched as
null and scored the subject 3 points on that reason alone (0 expired, 0 at-risk, oldest
verified_on 2026-10-14). Volatile scan re-read: years and illustrative durations only, none
platform-set. Frontmatter added; no research rerun, no clock or event to point at. Return
conditions unchanged (a second verifier or unsafe-heavy tree; kp adds a typed-lint ratchet line).
