---
layer: application
type: application
subject: vendored-patch-stack
technique: collapse-patch-axes-that-share-hunks
stack: node
verified_on: 2026-10-05
verified_against: node@22
applied: code
ab_verdict: better
proof: ab-paired
---

# Two carriers over one dependency's hunks, cut on different axes

The stack version is witnessed by the tree's `.nvmrc` (22), which its CI
workflows read through `node-version-file`; the manifest's `engines` floor says
only `>=20`. The bundler is Vite 8 (`^8.0.11` in the manifest, 8.0.16
installed). The tree is a public desktop app, read at commit `318f24730`.

## The stack nobody called a patch stack

The app carries local divergence against two minified upstream files it does
not own: `@xterm/xterm` and `@xterm/addon-webgl` both vendor a keycode
namespace that does `o.toString=s` at module scope, and a frozen
`Object.prototype` in the host's webview makes that assignment throw at import.
The fix is a rewrite of that statement to `Object.defineProperty`. That is a
patch stack in everything but name: local hunks held against upstream text that
moves on every release.

It was carried twice. A `postinstall` script rewrote the hunks in
`node_modules` (cut **per upstream file**: an explicit list of four target
paths, reaching dev and production alike), and the dev server's dependency
pre-bundler ran a transform with an `@xterm` branch that rewrote them again
(cut **per environment**: dev only, with a wider pattern). A third carrier, a
runtime accessor shim, predates both and no longer applies on a frozen realm.
The config's header comment named two layers; the feature doc named a
different two. Neither list mentioned all three, which is the
one-authority failure the technique predicts for a carrier outside the list.

## The intersection, measured

The technique's test is to list the regions each axis touches and intersect
them. Run over pristine `@xterm/xterm` 6.0.0 and `@xterm/addon-webgl` 0.19.0
fetched from the registry (the checkout's own copies were already patched):

| | postinstall | dev transform | shared | dev only |
| --- | --- | --- | --- | --- |
| `xterm.mjs` | 1 | 1 | 1 | 0 |
| `addon-webgl.mjs` | 1 | 1 | 1 | 0 |
| both CJS builds | 0 | 0 | 0 | 0 |

The intersection was not merely non-empty, it was the whole set. And the two
carriers wrote **different bytes** for the same hunk: the postinstall defined a
non-enumerable property, the dev branch an enumerable one (which is what a
plain assignment produces). The result therefore depended on which carrier
reached the hunk first. With the postinstall run, the dev branch rewrote
nothing. Without it (an install with scripts disabled, or a cache restored
from before the script existed), dev was patched and the production build
shipped xterm raw, so the one environment a developer looks at hid the failure
from the one that ships.

The CJS zero is a shared blind spot, not an absence: both builds carry
`e.toString=function(e){...}`, a function-literal right-hand side neither
pattern matches. It is outside the app's graph (the bundler resolves the
package's `module` entry to the `.mjs`), so it costs nothing here, but two
carriers that miss the same hunk are one more sign they were the same axis.

## A and B

**A**: the tree as it was. **B**: the dev branch collapsed into the
postinstall. The postinstall now carries the union of both patterns, with the
faithful enumerable descriptor and the terminator preserved so a sequence
expression stays one, and is recorded as the only carrier for `@xterm`. The
transform returns early for `@xterm` and keeps its disjoint job, spaced
assignments in non-minified dependencies, which never matched a hunk in
either xterm file. The axis decision is written beside the set, in the
script, the config header and the feature doc:

- `scripts/patches/fix-frozen-intrinsics.mjs:58 "const PATTERN ="`
- `scripts/patches/fix-frozen-intrinsics.mjs:77 "enumerable:!0"`
- `vite.config.ts:32 "WebView2 compatibility uses THREE carriers, each owning disjoint code:"`
- `vite.config.ts:234 "@xterm"` (the early `return null`)

Both arms' postinstall scripts were run over a scratch copy of the pristine
files laid out as `node_modules`, each arm's dev transform applied on top, in
the normal state and with the postinstall skipped.

**Target** (carriers per hunk; files where dev and production bytes differ
when the postinstall did not run): 2 to 1 on both hunks; 2 files to 0.

**Floor** (production still patched, nothing else lost): raw protected
assignments left in production bytes were 2 in both arms, and reading them
showed they are the CJS function-literal rows above. B's production bytes are
byte-identical to what A's dev transform produced, so no new rewrite entered
the tree. Both arms are idempotent on a second run. The project's
compatibility suite passed 27 of 27, and loading the real config through the
bundler's own loader returned `null` for pristine xterm and still transformed
`decimal.js-light`, so the second axis survived where it is disjoint.

## What this realization cannot do

It cannot prove a frozen-realm production run. The verdict is read from bytes,
not from a webview, and the machine-wide freeze is an experiment the host
vendor may withdraw. The checkout's live `node_modules` still holds the old
carrier's non-enumerable output until the next install, because the script's
idempotence marker is unchanged.

The general transform remains dev-only and has no production carrier. It
rewrites `decimal.js-light` and similar packages in dev; whether a production
build on a frozen realm throws in them is unmeasured here, and it is the same
shape of question (an axis per environment) one layer over. A `vite build`
scanned for raw protected assignments in each vendor chunk is the instrument
that would answer it.

The technique's own size boundary held in an instructive way. Below a dozen
patches it says the axis barely matters, and this stack has two hunks. The
axis still mattered, because the cost here was not triage time but a silent
dev/production split: the overlap produced two outcomes for one hunk, which a
stack of any size can carry.
