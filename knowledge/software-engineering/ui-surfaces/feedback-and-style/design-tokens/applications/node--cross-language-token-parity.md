---
layer: application
type: application
subject: design-tokens
technique: cross-language-token-parity
stack: node
verified_on: 2026-08-22
---

# Cross-language token parity in Style Dictionary (Node)

Style Dictionary compiles one authored token set into CSS, SCSS, Less, JS/TS,
Android XML, Compose, Objective-C, Swift, Flutter and React Native — the
reference implementation of the technique's strategy 1, *one source, generated
mirrors*. Reading it tells you which parts of parity a compiler can guarantee
structurally and which it cannot. Citations are against `style-dictionary` 5.5.2,
commit `29f1b25` (2026-08-19), package root `lib/`. This reconciles an external
tree rather than the consumer repo the sibling applications cite, so the pin
lives here in prose rather than in `verified_against`.

## 1. Every mirror is compiled from the same tree, never from another mirror

The parity guarantee is a scoping decision in one function. `_exportPlatform`
opens by `structuredClone`-ing the authored dictionary three ways — the nested
object, the flat map, the array (`lib/StyleDictionary.js:428-432`) — so each
platform transforms a private copy of the *authored* tokens. No platform ever
observes another's output; the CSS build cannot see that the Android build
already turned `2rem` into `32sp`. That is what makes fifteen `transformGroups`
(`lib/common/transformGroups.js:65-357`) composed from 62 transforms
(`lib/common/transforms.js`) and 44 formats (`lib/common/formats.js`) safe to run
side by side: the fan-out is a fan, not a chain, and drift between mirrors is
unrepresentable rather than discouraged. Results are memoized per platform
(`getPlatformTokens`, `:397-403`) — a cache, not shared state.

## 2. Resolve-then-transform, iterated to a fixed point

The hardest case is a token whose value is another token: transform too early and
you transform a reference string, too late and a transitive transform never
fires. The build loops both steps until nothing moves
(`lib/StyleDictionary.js:470-537`): `transformMap` defers any token whose value
still contains a reference (`lib/transform/map.js:67-70`), `resolveMap`
substitutes what it can while ignoring the deferred set (`:510-516`), and the
loop exits when that set empties (`:521-522`). A pass that fails to shrink it is
by definition a cycle, so a final unrestricted resolve runs purely to *name* the
cycles (`:525-532`); the detector walks a live stack and reports the whole ring —
`Circular definition cycle: a, b, c, a`
(`lib/utils/references/resolveReferences.js:111-137`).

## 3. The vocabulary boundary is enforced at the reference, and it throws

The technique asks that a parity gate fail loudly rather than report a green
nothing. Here the default is a hard failure: unresolvable references are collected
during the loop, and `log.errors.brokenReferences` — default `'throw'`
(`lib/StyleDictionary.js:110-117`) — turns the count into `throw new Error`
(`:539-555`). Naming a token that does not exist breaks the build for *every*
platform at once, exactly the "same members" half of parity. Unknown transform and
transformGroup names throw at config time too (`lib/transform/config.js:43-47`,
`:67-85`).

## 4. Identity is the path; the name is a per-platform rendering

A token's cross-runtime identity is its `path` array. Every built-in name
transform is a pure function of that path plus the platform prefix — `name/kebab`
(`lib/common/transforms.js:545-550`), `name/snake` (`:564-569`), `name/camel`
(`:526-531`), `name/pascal` (`:602-611`) — so `color.bg.primary` becomes
`--color-bg-primary`, `color_bg_primary` and `ColorBgPrimary` from one source.
When auditing parity across two generated artifacts: **compare by path, never by
emitted name**, because the names are supposed to differ. The exception proves
the rule — `name/human` returns `[attributes.item, attributes.subitem].join(' ')`
(`:507-512`), two segments of a five-segment CTI, so tokens sharing item and
subitem collapse onto one name. Collisions are detected per output file only
(`lib/StyleDictionary.js:699-730`) and at `warn` level by default (`:112`).

## 5. `outputReferences` preserves the indirection; the header carries provenance

Emitting resolved values gives parity of *values* but loses the graph: a CSS file
of literals cannot be re-themed at runtime. `outputReferences` walks the formatted
value back to `var(--ref)` (`createPropertyFormatter.js:185-238`), optionally with
the resolved literal as fallback (`:222-226`). Two supplied predicates make that
safe rather than merely available: `outputReferencesTransformed` refuses when the
token's transformed value differs from a plain re-resolution of its original —
i.e. when a transitive transform did work a `var()` would undo
(`lib/utils/references/outputReferencesTransformed.js:21-27`); and
`outputReferencesFilter` refuses when any referenced token was filtered out of
*this* file, retracting its warning as it does (`outputReferencesFilter.js:22-31`).

Generated files carry `Do not edit directly, this file was auto-generated.` by
default (`lib/common/formatHelpers/fileHeader.js:75-78`, on unless
`showFileHeader: false` at `:47-51`), and `fileHeaderTimestamp` defaults to
**false** (`:18`) — so output is byte-stable across rebuilds and a stale
generation surfaces as a real diff instead of a churning timestamp, which is what
lets a freshness gate be a `git diff`.

## 6. Deviations

**A failed transform degrades silently to an untransformed value.**
`_transformTokenWrapper` catches any throw, records it, and returns the *input* —
`token.attributes`, `token.name`, or the untouched value by transform type
(`lib/transform/token.js:48-68`). A `size/rem` throwing on one malformed token
emits a raw value into the CSS mirror while Android, whose transform did not
throw, emits `32sp`: the technique's "fails silently and visually" hazard,
produced by the compiler itself. The count is reported
(`lib/StyleDictionary.js:557-573`) but thrown only if the consumer set
`log.warnings: 'error'`; the default is `'warn'` (`:112`). Same posture for
filtered-out references (`:785-806`), whose help text names the failure without
stopping it (`:796`).

**Nothing compares one platform's emitted set against another's.** Each platform
config carries its own `files[].filter`, applied independently
(`lib/filterTokens.js`, invoked at `lib/StyleDictionary.js:668`), and no path in
`lib/` reads two platforms' dictionaries together — `this.platforms[…]` is indexed
exactly once, in `getPlatformConfig` (`:388`), and `grep -i parity` over `lib/`
returns nothing. Set parity across runtimes therefore holds only as long as
filters agree; a filter tightened on JS and not on CSS silently ships two
vocabularies and the tool cannot notice. That check stays the consumer's job.

## Reconciliation summary

Confirmed: one authored source cloned per platform so mirrors cannot chain;
resolve/transform iterated to a fixed point with named cycle detection; missing
references throwing by default across every platform at once; path-as-identity
with per-platform name rendering; reference-preserving output guarded against both
transitive-transform and filter loss; timestamp-free do-not-edit provenance.
Deviations: a throwing transform silently emits the untransformed value at `warn`
level — the technique's silent-visual drift generated inside the compiler; and no
cross-platform set comparison exists, so per-platform filters can diverge the
vocabulary undetected. Not present by
scope: runtime readback (strategy 2) — a build-time compiler cannot track
theme-varying values, so that half lands on the consuming application, not here.
