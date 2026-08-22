---
layer: application
type: application
subject: agent-addressable-ui
technique: build-time-source-stamping
stack: react
status: forged
verified_on: 2026-08-22
verified_against: react@19
---

# `data-loc` — a two-file Babel pass behind a two-line gate

The personas-web tree stamps every host JSX element with
`data-loc="<repo-relative-path>:LINE:COL"` so an in-app overlay can map a clicked
DOM node back to source. The whole mechanism is two files under
`scripts/dev-inspector/` plus eleven lines of `next.config.ts`, and the stack it
runs on is `react@19.2.8` / `next@16.3.0` on Turbopack (`package.json:42-44`).

The plugin's own header states the thesis the technique argues abstractly
(`inject-source-loc.cjs:10-15`):

> Host-only by design: component (uppercase) JSX elements don't reliably forward
> an injected prop to their root DOM node, and React 19 removed both the Fiber
> `_debugSource` field and (in 19.2) the `jsxDEV` source/self args the old
> click-to-component tools relied on.

## What the technique prescribes and what exists

| technique element | realization |
|---|---|
| host elements only | `JSXOpeningElement` visitor rejects anything but a `JSXIdentifier`, then requires `/^[a-z]/` — components, member expressions (`<Foo.Bar>`) and namespaced names all fall out (`inject-source-loc.cjs:38-43`) |
| one attribute, one vocabulary | a single `ATTR = "data-loc"` constant (`:29`) is the plugin's only name for it; the resolver re-declares the same literal in its own selector (`src/app/_dev-inspector/devLocate.ts:53`, `:55`) |
| stamp precisely, emit coarsely | the attribute carries `path:LINE:COL` (`:57`, column made 1-based); `parseLoc` matches all three and builds the copied `loc` from path + line only (`devLocate.ts:43-47`) |
| idempotent | scans existing attributes for `ATTR` and returns early — "never double-stamp (e.g. if a file is transformed twice)" (`:48-52`) |
| path from whoever knows the root | the plugin takes `relPath` as an option and no-ops without it (`:30`, `:36`); the loader computes it from `this.resourcePath` against an injected `rootDir` (`source-loc-loader.cjs:51-56`), which `next.config.ts:100-101` supplies as `process.cwd()` |
| parse-only | `configFile: false`, `babelrc: false`, and `parserOpts: { plugins: ["jsx", "typescript"] }` rather than presets — "our plugin is the ONLY transform — JSX/types are left for SWC to lower" (`source-loc-loader.cjs:64-70`) |
| source-map continuity | `sourceMaps: true` and `result.map || inputMap` passed back through the loader callback (`:66`, `:76`) |
| skip list | non-`.tsx`/`.jsx`, `node_modules`, `.next`, and the image-metadata routes — the last because "they render through satori (ImageResponse), not the DOM, so a `data-loc` attribute is meaningless there and can confuse the renderer" (`:36-47`) |
| layout-agnostic | the plugin only pushes a `JSXAttribute` onto the existing opening element (`:54-59`); no wrapper node, no class, no structural change |

## The gate, in three places

Gate one is `next.config.ts:94`: `if (process.env.DEV_INSPECT === "1")`, wrapping
the `turbopack.rules` registration for `*.tsx` and `*.jsx` (`:96-103`). Gate two
is `source-loc-loader.cjs:29`, which re-reads the same variable and returns the
untouched source. Gate three is `src/app/layout.tsx:127` —
`{process.env.NODE_ENV === "development" && <DevInspector />}` — keeping the
overlay itself out of the production bundle.

The zero-cost claim is load-bearing and the code earns it in one line:
`let babel; // lazily required only when actually transforming`
(`source-loc-loader.cjs:23`), with the `require` inside the post-gate path
(`:58-59`). That is what makes the header's claim literal rather than nearly
true (`:16-20`):

> it is OPT-IN. The matching `turbopack.rules` entry is only registered when
> `DEV_INSPECT=1` … and this loader also re-checks the flag and short-circuits
> to a no-op otherwise — so a normal `npm run dev` and every production build
> pay nothing and `@babel/core` is never even required.

The flag is invocation-scoped and has exactly one entry point:
`"dev:inspect": "cross-env DEV_INSPECT=1 next dev"` beside the plain
`"dev": "next dev"` (`package.json:18-19`) — which is the command string the
overlay prints when it detects no stamps.

## What holds

- **The classification is lexical, not framework-aware.** `/^[a-z]/` on a
  `JSXIdentifier` is a language-level test; nothing in the plugin imports or
  inspects React.
- **The idempotence guard is present before it was needed** (`:48-52`), which is
  the correct order — retrofitting it after a double-stamp incident means first
  debugging duplicated attributes in a parse tree.
- **The off-DOM skip is reasoned, not superstitious.** The comment names *why*
  the image-metadata routes are excluded (a different renderer entirely), so the
  entry can be re-evaluated rather than inherited.
- **The loader is `enforce: 'pre'`-shaped** (`:13-14`): it runs before the real
  pipeline and hands back source in the same dialect it received, which is what
  keeps "parse-only" from drifting into a second lowering.

## Deviations (reported, standard kept)

- **The root path has a fallback, so a wrong stamp is possible without a
  failure.** `String(opts.rootDir || process.cwd())` (`:51`) plus the
  outside-the-root branch that degrades to a bare filename,
  `resourcePath.replace(/^.*\//, "")` (`:56`), together mean a module resolved
  from an unexpected root produces a stamp that is syntactically valid and
  unresolvable. The standard requires the root to be a required input: a wrong
  stamp costs an agent a whole wasted edit before anyone notices, where a
  missing one costs nothing.
- **A failed transform is spelled like a skipped file.** `if (!result ||
  result.code == null) return callback(null, source, …)` (`:73-75`) passes the
  original through silently, so a module Babel could not handle is
  indistinguishable from one the skip list excluded — and the operator sees only
  an area of the app that does not resolve. One warning line naming the file
  would separate the two.
- **The attribute name is written twice.** `ATTR` in the plugin (`:29`) and the
  `[data-loc]` selectors in `devLocate.ts:53`/`:55` and `DevInspector.tsx:202`
  are independent literals. They agree today; the day one is renamed, the
  overlay reports "source mapping is OFF" on a fully stamped build — the most
  confusing failure this subject can produce.
- **Nothing asserts the production artifact is clean.** The three gates are
  sound by construction, but no check in the release path greps the built output
  for `data-loc`. The gate that would catch a soft failure is the one that
  observes the shipped artifact.
