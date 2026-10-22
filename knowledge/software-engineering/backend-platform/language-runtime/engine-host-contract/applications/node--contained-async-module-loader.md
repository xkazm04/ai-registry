---
layer: application
type: application
subject: engine-host-contract
technique: contained-async-module-loader
stack: node
status: forged
verified_on: 2026-10-22
verified_against: node@22
applied: experiment
ab_verdict: better
proof: ab-paired
---

# The idle loader in a build script's vm sandbox, in a marketing site

**Witness:** the tree has no `engines` field. Its CI workflows pin `node-version: 22`
(`.github/workflows/ai-change-gate.yml:28 "node-version: 22"`), and the tree's own
`typescript` resolved to 6.0.3. The experiment ran on a local Node 24.14.0, and nothing
it measured depends on that minor. personas-web (`github:xkazm04/personas-web`, public,
commit `b788f3c9`) is a Next.js marketing and documentation site for a desktop app.

No managed project embeds a script engine with its own module system. Two earlier
attempts (2026-10-14, and earlier on 2026-10-22) grepped manifests for one and found only
an operator-owned WASM plugin directory. Node's own `vm` module is a builtin with no
manifest entry, so a manifest grep can never see it. A source-level grep across all 19
fleet trees did, and it found seven call sites. Four of them evaluate the project's own
code in a test, or read a build manifest with no import path. The other three are this
application: personas-web's build scripts transpile a TypeScript data module and
evaluate it in a fresh `vm` context. That context is an embedded engine whose host
decides what an import does. These scripts are the only place in the fleet where a host
fills that hook.

## The seam: three idle loaders, one rule

The technique's third section says a host that does not load modules should install an
**idle loader**, one that fails every import with an error saying so, instead of leaving
the hook unset. All three sandboxes do that, independently:

- `scripts/i18n/load-locale.mjs:49 "require: (specifier) => {"` and
  `scripts/i18n/load-locale.mjs:50 "Unexpected runtime import"` is the one loader behind
  the i18n coverage check, the identical-values report and the UI ledger. It is run per
  locale file, selected by `scripts/i18n/load-locale.mjs:18 "const LOCALE_FILE"`.
- `scripts/generate-tour-audio.mjs:58 "en.ts must stay a pure data module"` and
  `scripts/generate-tour-audio.mjs:61 "Unexpected runtime import"` read the narration
  copy out of the English locale.
- `scripts/compile-use-case-corpus.mjs:53 "must stay a pure data module (it required"`
  loads the connector table.

The transpile targets CommonJS, so every runtime import a guest writes becomes a call to
the sandbox's `require`. The `require` is the whole loader. The host's stated policy is
that the guest may import nothing.

## The A/B

Arm A is the shipped `evalTsModule`, imported from the tree unchanged. Arm B is the same
function with the `require` key removed from the sandbox, so the hook is unset. Both arms
ran over eight guest fixtures plus every real locale file. The harness never changed
product code.

**Target:** guest imports refused with an error naming the specifier.
**Floor:** every real locale's exports identical across arms (sha-256 of the JSON).

| Guest shape | A | B |
| --- | --- | --- |
| static named import | refused, names specifier | `require is not defined` |
| `export *` re-export | refused, names specifier | `require is not defined` |
| side-effect import | refused, names specifier | `require is not defined` |
| namespace import | refused, names specifier | `require is not defined` |
| TS `import x = require()` | refused, names specifier | `require is not defined` |
| top-level `import()` | refused **after the loader returned**, names specifier | same timing, `require is not defined` |
| `import()` inside an uncalled closure | **accepted** | **accepted** |
| type-only import (control) | loads | loads |

Target: A names the specifier for 6 of 7 runtime imports, and B names it for 0 of 7.
Floor: 14 of 14 locale files produced identical exports. The verdict is `better`. The
tree already ships arm A, so nothing ships. The application records that the rule paid
here, and by how much.

The arm-B message says only that a capability is missing. It names neither the import
nor the file. Arm A names both, so a contributor who adds an import to a locale reads
the offending specifier in the check's output. That is the technique's reason for a
filled seam, measured.

## What the seam was chosen to falsify, and what it caught

The falsifying question was whether any guest import shape gets past the idle hook. If
none did, the hook would be the purity check its comments claim. Two shapes did.

1. A top-level dynamic import transpiles to a `require` deferred into a promise. The
   refusal fires, but only after `evalTsModule` has returned the module as loaded. In a
   check script, it then surfaces as an unhandled rejection rather than at the loader's
   call.
2. A dynamic import inside a function nobody calls at load time never reaches the hook.
   Both arms accept the module. The tree already holds this shape outside the sandbox:
   `src/i18n/catalog.ts:225 ".then((m) => m.zh)"` is a table of lazy locale imports. If
   the same pattern moved into a locale file, every check built on `evalTsModule` would
   load it cleanly.

So an idle loader refuses an import **when the guest executes it**. It does not certify
that a module contains no imports. The technique states the idle loader's job as filling
the seam, and that part held. A host that leans on the idle loader as a purity check is
asking it for a static property it cannot give. That check needs the source's import
list, read before evaluation, with type-only imports excluded. No locale file in the tree
carries a runtime import today (the floor loaded all 14), so this is a latent boundary,
not a live defect. It is recorded as a lead, not amended into the technique, and it has
a return condition in `librarian/applied.md`.

## What this realization cannot show

The root-containment half of the technique (normalise lexically, canonicalise the root
once, compare component-wise) has no seam here. The host refuses every specifier, so
nothing is ever resolved against a root. That half is still unapplied in the fleet. Its
return condition is a project whose embedded engine resolves guest imports by path.
