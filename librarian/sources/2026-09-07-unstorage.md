---
source: unstorage
kind: repository
url: https://github.com/unjs/unstorage
title: "unstorage — a universal key-value storage layer with 32 pluggable drivers (TypeScript)"
author: unjs
words: 276 landing page / 10,396 in-tree docs / 6,462 LOC src
commit: 7f773be19216ee28790f00ae51c74ba06169c2ec
version_witness: package.json 2.0.0-alpha.10 + @types/node ^26.2.0 (the only concrete node pin; CI asks for lts/*) + packageManager pnpm@11.22.0
extracted: 7
accepted: 2
declined: 0
leads: 1
already_covered: 2
untriaged: 2
applied: 2
shipped: 2
dispatched: 0
run_id: unstorage
siblings: 2
rescan_when: the `flags.ttl` capability gains a reader in src/storage.ts or a declaring driver, or the shared conformance suite in test/drivers/utils.ts grows a read-only lane (an opt-out beside `noKeysSupport`, or an assertion that a driver without `setItem` refuses rather than resolves); or 8 weeks elapse (2026-11-02)
---

# unstorage — a driver contract, read for its architecture

Operator brief: *focus on code architecture and design patterns rather than
tool use.* The run was scoped accordingly — the design read (Phase 2d) was the
whole of the extraction, and the claim lane produced nothing worth landing.

**Class.** Vendor repository / library in repo form. The README is 276 words
against 10,396 words of in-tree documentation and 6,462 lines of source — a
38x ratio, so the landing page was read last and cited nowhere. Swept in the
sweep order, with the round-32 focus applied: the **route table**
(`src/server.ts`, 199 lines) was opened before the README, and it earned its
new rank — it is where the HTTP surface's method→capability map and its
authorization seam are literally written. No `changelog.d/` fragments; the
CHANGELOG is a release-notes stub, so the fragments-first rule cost one
sentence here and stopped.

**Siblings.** 2 live at claim (`gbrain`, `memlancedb`), both at phase 0, neither
holding a subject this run touched. No contention, no deferred rows.

**Fetch budget: 0 of 3.** Every row was corroborated from code read in a tree,
which is what the class predicts.

## Routing count (Phase 2d, v2.2) — both clauses, written before deciding

Five systems in the tree; entries grouped by system, `corpus: NONE` counted per
system and `HOME IF NEW` counted across them.

| System | Entries | NONE | Nearest home |
| --- | --- | --- | --- |
| A — driver capability contract | 5 | 2 | `data-layer/data-access` |
| B — composition closure (mount, prefix, overlay, tracing) | 3 | 0 | `codebase-stewardship/module-design` |
| C — dependency manifest + its derivation check | 3 | 1 | `maturity-and-conformance/conformance-checking` |
| D — value/serialization (stringify, raw base64, meta sidecar) | 2 | 0 | `data-access/row-mapping` |
| E — HTTP exposure (route table, authorize hook) | 2 | 0 | `security/identity-and-access/authorization` |

**Per-system maximum 2; across systems the three NONEs name two different
homes-if-new, so no three share one. Neither clause fires — no forge handoff,
no XL spec.** Worth stating plainly because the tree looks forge-shaped and is
not: 32 drivers and five subsystems, and the corpus already models four of the
five. `--no-handoff` was not needed; the count declined it.

## The design record

Seven entries; the two that landed are given in full, the rest compressed.

**A1 — three required methods, everything else optional, and a missing write
is a silent no-op.**
`forces:` drivers arrive from contributors over backends with genuinely
different powers, and one Storage spans several mounts, so a caller iterating a
namespace cannot know which mount is writable.
`buys:` mount substitutability — any driver goes anywhere in the tree, no
call-site branching.
`rejects:` a typed refusal. `where:` `src/storage.ts:213-215, :276-278, :361-369`
(`return; // Readonly`, three times); `docs/1.guide/4.custom-driver.md`
advertises it — "write methods are optional so drivers can be read-only".
`stage:` dispatch, after mount resolution, before the driver call.
`corpus:` **modelled, and forbidden** — `capability-declared-in-the-type` says
"never a default that returns empty, never one that quietly does nothing".
→ catch.

**A2 — capability is declared by method presence for whole operations, and by a
`flags` object for options on operations that are always present.**
`forces:` the Driver is a plain object literal — no base class, no default
implementations — so presence cannot be inherited and is therefore identical to
capability, not merely correlated with it. But `getKeys` is always present, so
whether it honours `opts.maxDepth` is invisible to reflection.
`buys:` zero declaration ceremony for the eight optional operations; a declared
channel only for the residue presence cannot express.
`rejects:` declaring every capability as data (the corpus's Tier 2).
`where:` `src/types.ts:25-28, :65-93`; reflection at `src/storage.ts:172, 202,
213, 255, 296, 361`; the single flag read at `:330`.
`stage:` per-operation, at dispatch.
`corpus:` **NONE for the discriminator.** `capability-declared-in-the-type`
rules reflection out flatly, on an argument whose middle clause is *inherited
from the refusing default* — a premise this interface does not have.
→ **amendment (boundary case: the rule inverts under a stated precondition).**

**A3 — `flags.ttl` is declared in the type, declared by zero drivers, read by
no line of the core.** `corpus:` the same technique names this exact failure.
→ catch, and the confirming structural fact in the application.

**A4 — the capability fallback is chosen so it is idempotent with the native
path, which lets a mixed-mount query degrade globally instead of per-mount.**
`where:` `src/storage.ts:328-353` — one `allMountsSupportMaxDepth` boolean, one
filter pass; re-filtering already-correct keys is a no-op, so the weakest-link
rule costs only CPU. `corpus:` NONE; nearest is `cross-driver-invariant-parity`,
which models two engines agreeing rather than one query composing their
fallbacks. → untriaged (see below).

**A5 — the shared conformance suite tests the facade, not the driver.**
`where:` `test/drivers/utils.ts` — it asserts `setItems`, `getItems` and raw
round-trips that the *core* synthesises, so they pass whether or not the driver
implements them; its one opt-out is `noKeysSupport`. 30 of 35 driver test files
call it; the one read-only built-in is tested by four bespoke assertions outside
it. `corpus:` the technique's demanded third assertion — declared-unsupported
produces a typed refusal rather than an empty success — is not merely missing
here but unrepresentable. → catch, and the application's strongest evidence.

**C1/C2 — every optional peer dependency is injectable as a value (`lib`), and
the dependency manifest is published as data keyed by that injection option.**
`forces:` bundlers and edge runtimes cannot resolve a dynamic import of an
uninstalled optional peer; consumer frameworks need to know what to install.
`where:` `src/drivers/utils/index.ts:35-54`; `src/types.ts:30-63`;
`src/_drivers.ts:152+`. `corpus:` `optional-dependency-degradation` models it.
→ catch.

**C3 — a test regex-parses each driver's source for `importLib(...)` call
sites, follows relative imports transitively, and asserts the published manifest
equals what the code imports.** `forces:` the manifest is consumed by third
parties, so it must be complete; and its subject is unresolvable at check time
because the packages are deliberately not installed, so presence, shape and
execution are all unavailable. `where:` `test/driver-dependencies.test.ts:30-84`.
`corpus:` **NONE.** `declared-then-proven`'s ladder has three rungs and this is
none of them. → **new technique.**

## Landed

**1. `conformance-checking/derived-expectation-needs-an-evidence-floor`** (new
technique). A check that computes its own expectation has two ways to pass —
the declaration is right, or the derivation returned nothing — and the second
is spelled the same green as the first. The trap closes because such a
population legitimately contains empty cases, which is *why* one derives rather
than declares.

Measured on the source tree, both arms, with a calibration first: arm A (the
regex as shipped) derives **24 dependency facts across 33 drivers, 14 of them
legitimately empty, 33 pass**. Arm B renames `importLib` — an ordinary refactor
in the implementation, not the check — and derives **0 facts, 33 pass**. The
report is byte-identical in the two arms; the number separating a working check
from a disarmed one appears nowhere in its output. A per-case negative control
would not have caught it: mutating one driver's declaration does make the check
fail, so the instrument certifies as validated while the shared derivation is
the thing that breaks.

**2. `data-access/capability-declared-in-the-type`** (amendment). The
technique's objection to reflection is exact *because of its middle clause* —
a member can be **inherited** from the refusing default. Remove inheritance and
defaults and the argument goes with them: in a plain record of optional function
fields a member exists only because this implementation's author wrote it, so
presence is the declaration, carried where it cannot drift from the code. The
discriminating question is therefore not *declared or reflected* but **is the
gap a whole operation, or an option on an operation that is always present?**
The amendment adds both costs observed here: the residue channel is where the
rot concentrates (2 of 32 drivers declare any flag; `ttl` is declared by none
and read by nothing), and presence leaves no room for a refusal, which is how
the silent branch gets written.

## Applied and shipped — 2 rows, both `code`

**Row 1 → this registry, `better`, shipped.** Three of its gates derive
evidence by pattern-matching source. The citation gate **already carries the
floor** (`if (urls.length < 50) die(...THE EXTRACTOR IS BROKEN)`) plus
known-alive/known-gone probe controls — arrived at independently, which is the
strongest corroboration the technique has. The usage and signals lane gates had
neither, and they are the harder must-not-match shape where a clean sweep and a
dead pattern set are the same output. Four arms on a planted Windows path:
as-shipped RED, patterns drifted **GREEN with the lane reporting OK**, control
added + as-shipped RED (no false positive), control added + drifted RED naming
the dead pattern. Both gates now assert their five patterns against one fixed
positive each before reading a contributor file. **The first calibration attempt
was invalid and is recorded as such**: the planted value was written through a
shell argument that ate its backslashes, so the "known positive" contained no
separator and the gate correctly ignored it — the instrument agreeing with a
broken fixture, this technique's own failure arriving one level up.

**Row 2 → kp, `better`, shipped (`3f253853`); the amendment's own verdict is
`not-better` and that is the point.** kp is the tree on the *other* side of the
amendment's boundary: its adapters subclass a base provider whose
`complete_document` raises a typed refusal, so every adapter has the member and
presence is uninformative by construction — and kp correctly declares, with the
comment "DECLARED per adapter, never probed at call time". The amendment
predicts kp must not use presence and it does not; nothing there is improved by
changing channels. What the boundary *did* direct was the technique's third
assertion, which kp was owed and lacked: `subtype="missing_capability"` existed
once in source and in **no test**, against five other subtypes that are asserted.
Two tests now derive both directions from the capability matrix, with a floor on
the derived join. Negative control: claiming the capability for an adapter that
inherits the refusing base turns the pair red and names the defect; matrix
restored, 12 pass.

## Already covered (2)

- **A1, the silent read-only write.** The corpus forbids it by name and is
  right; the interesting half is that a well-regarded library chose it
  deliberately and documents it as a feature, which is evidence *for* the tier
  ladder, not against it. Folded into the application.
- **A3/A5, the unread flag and the facade-shaped suite.** Both are failures the
  technique predicts in prose; observed here with counts. They are the
  application's structural facts, not new claims.

## Untriaged (2) — with the question that would promote each

- **A4, fallback composition across heterogeneous mounts in one query.** Reads
  `partial` because `cross-driver-invariant-parity` is adjacent. *Promoting
  question:* does that technique's parity model say anything about a **single
  operation whose result is assembled from implementations with different
  capability levels**, as opposed to two implementations answering the same call
  separately? If no, this is a mechanism it lacks and the idempotence property
  (a fallback safe to apply globally because it is a no-op over the native path)
  is the technique.
- **B2, the overlay's in-band tombstone.** A sentinel string written into layer
  0 to shadow a value in a layer that cannot be deleted from
  (`src/drivers/overlay.ts:9,49`). *Promoting question:* does any subject own
  the value-space collision this creates — storing the sentinel itself is an
  undetectable phantom delete — or only the layering it implements?

## Lead (1)

- **`prefixStorage`'s hand-maintained key-first method list.**
  `src/utils.ts:5-23` enumerates the seventeen `Storage` methods whose first
  argument is a key, and rewrites them; four more (`getKeys`, `watch`,
  `getItems`, `setItems`) need bespoke wrappers because their keys also appear
  in the *return* value. Nothing ties the list to the interface, so a new
  key-first method added to `Storage` and not added to the array silently
  bypasses the prefix — a namespaced store that writes outside its namespace.
  Same family as the run's landed technique (a declaration nothing derives),
  but the fix is a type-level exhaustiveness check rather than a floor.
  *Return:* when a second tree shows the same hand-maintained
  methods-that-take-a-key list, or when this one ships a wrong-namespace bug.

## Standing checks (Phase 1)

- **Focus block:** taken from the **highest round number (32)**, per that
  block's own item 1, not from the last block in the file — the file's tail
  order is 30, 27, 31, 32.
- **Route table before README:** done, and it paid; recorded above.
- **Re-scan conditions:** read; none fired.
- **Lead return conditions:** last ten notes read; none fired. Fourth
  consecutive "none", which three prior blocks predicted would mean the
  conditions are written too far out. This run's lead is deliberately written
  with a *source-fireable* first clause (a second tree showing the shape) rather
  than only a registry-fireable one.
- **Handoffs unconsumed:** `librarian/handoffs/` holds 10 files, the newest
  2026-09-06; none consumed by this run and none owed to it.
