---
layer: application
type: application
subject: quality-gates
technique: instrument-answers-only-its-own-question
stack: node
verified_on: 2026-09-01
verified_against: node@24
---

# The scoped lint pass that cannot see an undefined name

In this Next.js app the two static instruments over `src/**/*.ts{,x}` are
ESLint and the TypeScript compiler, and they are *disjoint* on the one
question an automated edit most often raises — does this identifier exist.
Nothing at either call site says so.

## Where the partition is written

`eslint.config.mjs:1-7` composes the whole rule set out of two published
presets:

```js
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
const eslintConfig = defineConfig([...nextVitals, ...nextTs, /* … */]);
```

The typed half of that chain reaches `@typescript-eslint`'s
`eslint-recommended` layer, which contains the line that decides the
partition — observed in the installed tree at
`node_modules/@typescript-eslint/eslint-plugin/dist/configs/eslint-recommended-raw.js:36`:

```js
'no-undef': 'off', // ts(2304) & ts(2552)
```

That is deliberate and correct upstream policy: typescript-eslint's own FAQ
tells projects not to enable `no-undef` because the compiler already provides
the check, better. The comment even names the compiler diagnostics it defers
to. But the repository never restates it. Neither `eslint.config.mjs` nor any
script mentions that ESLint here has been configured to stop answering the
resolution question — the setting lives three packages up, inside a preset
imported by name.

## The two questions never meet except in one script

`package.json:18-20` keeps them as separate scripts and joins them in exactly
one place:

```json
"lint": "eslint",
"typecheck": "tsc --noEmit",
"verify": "npm run lint && npm run typecheck && npm run test:coverage && npm run build",
```

So `npm run verify` asks both questions; every cheaper invocation asks one.
An agent editing a file and reaching for the fast confirmation — `npx eslint`
over the file it just changed — gets a green that is *true* and that says
nothing whatsoever about whether the call it added resolves. Add a call to a
helper that was never imported, or misspell an exported name, and the scoped
lint pass reports zero problems: the only rule that would have objected was
switched off by the preset, in favour of a compiler this invocation never
runs. The failure then surfaces at `npm run typecheck`, at build, or in CI —
one full agent cycle later, which for an in-loop author is the entire cost the
local rung existed to avoid.

## What the repo does have

The full-fat chain is correct: `verify` runs lint *and* typecheck *and* the
build before anything is claimed, and CI runs the same. The gap is not in the
declared gate; it is in every abbreviation of it, and the abbreviation is what
a machine author reaches for when it wants a fast answer about one file.

## The rule this repository should carry

The verification step for an automated edit is named by its *question*:

- an edit that adds a call, an import, or a type reference is confirmed with
  `npm run typecheck` (or a project-scoped `tsc --noEmit`), because
  resolution is the compiler's question here by explicit configuration;
- a scoped `eslint` run is recorded as evidence about style, hooks rules and
  the repo's own layering gate — and as silence on resolution;
- the two are never described as "the fast one and the slow one." They are
  two instruments with two remits and one overlap that was deliberately
  removed.

The cheapest durable fix is a comment at `eslint.config.mjs`'s preset imports
stating which questions this config does not answer and which command does,
so the partition is legible at the file everyone opens rather than at the
package everyone inherits.

## Sources

- `eslint.config.mjs:1-7`, `package.json:18-20` (this repo, HEAD `7ed00bb9`).
- `node_modules/@typescript-eslint/eslint-plugin/dist/configs/eslint-recommended-raw.js:36`
  — installed dependency, not committed here; the same rule is published as
  guidance in the typescript-eslint ESLint FAQ
  (<https://typescript-eslint.io/troubleshooting/faqs/eslint/>), which states
  the check is already provided by TypeScript and should not be enabled.
