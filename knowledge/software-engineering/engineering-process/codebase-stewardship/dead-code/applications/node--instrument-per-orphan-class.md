---
layer: application
type: application
subject: dead-code
technique: instrument-per-orphan-class
stack: node
verified_on: 2026-09-17
verified_against: node@22
applied: experiment
ab_verdict: not-better
proof: ab-paired
---

# The instrument roster — six orphan classes, five instruments, and the one that protects corpses

This repo has assembled its dead-code roster one instrument at a time, each born
from a specific class the previous ones could not see. Read together with the
technique's blindness matrix, the roster is also a coverage map with named gaps.

## The roster as it stands (measured 2026-08-18)

| Orphan class | Instrument | Where it runs | Measured |
|---|---|---|---|
| Unused exports | `knip` (`knip.json`, `npm run check:dead`) | manual | ignore roster below |
| Unreachable modules | `scripts/analysis/orphan-modules.mjs` | manual | 4,801 modules, 4,043 reachable from `src/main.tsx` + `src/App.tsx`, **354 non-test orphans** (758 minus 404 test files); 17 orphans carry their own test |
| Never-invoked cross-boundary registrations | `scripts/build/unused-commands.mjs` | manual | 1,585 registered commands, 23 never referenced by any string literal in TS or Rust (1%) |
| Orphaned generated artifacts | **none** — the inventory gate is unbuilt (#w2-ipc-contract) | — | 29 bindings with no Rust source; 22 still the declared return type of a live `invoke` |
| Dead catalog keys | `scripts/i18n/find-unused-i18n-keys.mjs` (`check:i18n-dead`), purge via `purge-dead-keys.mjs` | manual, warn-only | 19,118 keys, 118 unused (0.6%): whole `planner` (67/67) and `deliberation` (51/51) sections |
| Zero-render components / zero-adopter primitives / dead knobs | **none** — found only by hand-measurement in golden-path composition | — | `ChartEmptyState` 0 render sites (#w3-data-viz); `useRovingTabIndex` 0 adopters (#w10-accessibility); `max_retries` / `auto_connect` read by nothing (#w11-p2p-networking) |

Three of six classes have a mechanical instrument; three do not. Every unassigned
class was discovered by a composer counting adoption by hand — which is the roster
rule's whole point: the classes without an instrument are exactly the ones whose
corpses were found by accident.

## The instrument that preserves corpses: `scripts/check-unused-bindings.sh`

The only dead-code check wired into CI (`.github/workflows/ci.yml:186`) is a
reference counter over `src/lib/bindings/` (1,034 files): a binding survives if
`grep -rw` finds its name anywhere in `src/` outside `bindings/`, or if another
binding imports it. It is the technique's refcount blindness in its purest form,
and it is *enforced*. `VaultStatus.ts` exists; `grep -rn "struct VaultStatus"
src-tauri/` returns nothing; three live files (`src/api/vault/credentials.ts`,
`useVaultStatus.ts`, `CredentialEditForm.tsx`) import it. The guard sees the
importers and passes. The Rust fn behind `invoke<VaultStatus>("vault_status")`
returns `serde_json::Value`, so the app compiles against a contract whose producer
does not exist — and the gate built to catch dead bindings is the reason nobody
noticed. Run at HEAD on 2026-08-18 the guard reports **1** unused binding
(`WorkspaceMergeOutcome`, a fresh type not yet consumed) and passes `VaultStatus`
and its 28 fellow orphans without comment: refcount finds 1, inventory finds 29,
and the two sets do not overlap. Registered at #w2-ipc-contract; the fix is the missing reconciliation
instrument (enumerate `#[derive(TS)]` structs → expected files; diff against the
directory), not a stricter grep.

A second cost, noted rather than solved: the guard is 1,034 sequential
`grep -r` passes over ~4,800 files and takes minutes per CI run — a per-artifact
tax that the carrying-cost technique would price against the value of a check
that protects 26 of 29 orphans.

## The reachability walker, and what its output actually says

`orphan-modules.mjs` implements the technique's roster rules literally: entry
points are an owned list (`--entry`, defaulting to the two real roots), and **tests
are not entries** — the header comment says why ("a module kept alive only by its
own test is an orphan with a test, which is exactly what this instrument must
surface"). The 354 non-test orphans are candidates with a predicate, not a
deletion list: the walker sees static, dynamic, side-effect and `import.meta.glob`
edges but not tier-specific entry bundles or the harness (`src/lib/harness/`, 9
orphans, is entered by the test-automation server, not by `main.tsx`). Spot-checked
island: `src/features/agents/sub_connectors/**` (21 files) is imported only by
`DesignResultPreview.tsx`, which is itself unreachable — a shadow-declaration
island of exactly the shape the shared detection technique predicts, invisible to
any refcount and visible to the walker as one cluster.

## The cross-boundary instrument prices itself

`unused-commands.mjs` is the roster's model citizen. It joins two inventories
(`commandNames.generated.ts` for the registered side; every string literal in TS
and non-`lib.rs` Rust for the invoked side), states its own bias ("deliberately
biased toward over-reporting: a false 'dead' that you check costs a minute, a
missed one that you delete costs a broken feature"), refuses to run if the
registered inventory parses to zero (`process.exit(1)` — the instrument asserted
before the result), and carries its carrying-cost measurement in its own header
(1,647 → 823 → 8 handler entries: 35.5 s → 23.5 s → 17.0 s incremental check,
"~11 ms per registered command"). Its output ends with the honest line every
instrument here should end with: `CANDIDATES ONLY — a runtime-assembled name is
invisible here. Verify before deleting.`

## The catalog-key scanner chooses its error direction out loud

`find-unused-i18n-keys.mjs` documents the asymmetric-cost decision the technique
demands: "false negatives (claiming a key is used when it isn't) are recoverable;
false positives (claiming a live key is dead) would be destructive. Start
permissive, tighten if needed." So `t.common` marks all of `common.*` live,
`tokenLabel(t, '<category>', …)` marks the category subtree live, and
`ERROR_KEY_MAP` is read to mark error-registry pairs live. The 118 keys it *does*
report are therefore high-confidence: two entire sections (`planner`,
`deliberation`) with zero references — feature removals that updated callers and
forgot the catalog, multiplied by 14 locales each.

## The knip ignore roster as a coverage map

`knip.json`'s `ignore` list is the technique's "published blind-spot inventory"
in embryo: `src/lib/bindings/**`, `commandNames.generated.ts`, `src/i18n/generated/**`,
`src/i18n/section-locales/**`, `src/lib/harness/**`. Each entry is a class handed
to another instrument — bindings to the (unbuilt) reconciliation gate, command
names to `unused-commands.mjs`, i18n to `find-unused-i18n-keys.mjs`, the harness to
its own server. What the file does not yet do is *say so*: the entries carry no
reason and no delegate, so the audit "which ignore delegates to an instrument that
does not exist?" — the answer is `src/lib/bindings/**` — has to be reconstructed
by hand each time.

## 2026-09-17 — the class that runs the other way, tested against this tree

Re-verified on 2026-09-17 against the tree at its default branch, with the
unused-export instrument at the version the lockfile pins (knip 6.14.2) and the
runtime the tree witnesses in `.nvmrc` (node 22). The technique gained a class whose error runs toward *dead* rather than alive:
**published names**, exports whose callers live outside the instrument's declared
universe. This tree was chosen as the seam because it could falsify the class
rather than illustrate it — a private desktop application with no `exports` field
and no plugin surface should have no members — and the paired check was: for every
export the unused-export instrument reports under `src/api/**` (the wire-facing
layer, 218 rows at HEAD), does any caller outside the TypeScript universe invoke it
by name?

**Arm A, the naive join**: grep each of the 218 names as a string literal across the
Rust tree. One hit — `cliCaptureRun`, named at `src-tauri/src/test_automation.rs:962`
`"cliCaptureRun",` as a bridge dispatch. Read as a verdict, that is a live export
the instrument called dead. **Arm B, the real join**: the Rust side dispatches into
`window.__TEST__.__exec__(id, method, params)` (`src-tauri/src/test_automation.rs:213`
`let js = format!(r#"window.__TEST__.__exec__("{id}", "{method}", {params_json});"#,);`),
and the method table lives in `src/test/automation/bridge.ts`, which installs its
*own* method at `src/test/automation/bridge.ts:1691` `async cliCaptureRun(serviceType: string) {`
that calls the Tauri command directly. The API export of the same name is a duplicate
implementation with zero callers — the instrument was right, and the by-name grep
was a coincidence of naming across the wire. Target: names the instrument wrongly
called dead because their audience is outside the universe, **0 of 218**. Floor:
the instrument's own report unchanged across the arms (317 files, 1,152 exports,
662 types). Verdict `not-better`: the published-names class has no members here,
exactly as its stated precondition predicts, and a reader who applied it to this
tree would have handed the false-alive classes a new alibi. A negative at the seam
that could have refuted the precondition is the corroboration this row carries.

The join itself was the structural finding. `unused-commands.mjs` joins the
TS → Rust direction (registered commands nobody invokes) and its header claims the
test-automation bridge; the **Rust → JS direction** — 33 names the test server
dispatches by string into a JS method table resolved by parameter-name reflection
— had no instrument, and a renamed bridge method would fail at test time with no
compile error on either side. It has one now: `scripts/build/bridge-methods-join.mjs`
joins the dispatched set against the installed set (33 dispatched, 153 installed,
0 unresolved at HEAD, including the three perf methods installed by late
assignment in `perfInstrument.ts`), refuses to run green if a source file is
missing, and carries `--self-test`, which injects one dispatch the JS side does not
install and requires the instrument to report it and nothing else. The self-test
is the reach check this registry's method now demands before any green is read:
an instrument that has never returned the other answer certifies nothing.

Two currency facts for the roster above. The unused-export instrument is no longer
wired anywhere: it left CI on 2026-08-30 with the note that `continue-on-error`
was the repo's own named disease, and stays a manual audit "until its findings are
triaged enough to ratchet honestly" — at HEAD it reports 317 unused files and
exits red, so it is a verifier in the technique's *unexercised* class until
someone owns the ratchet. And the `src/lib/harness/**` ignore is not what keeps
any API export alive: dropping it moves the file count from 317 to 326 and the
export count not at all, because the harness files are themselves unreachable.
One dead island confirmed by hand for the walker's benefit: `ChatThread.tsx` is
imported by nothing and imports `ChatMessageContent.tsx`, which is imported by
nothing else — the refcount-defeating shape, visible to the walker as one cluster.
