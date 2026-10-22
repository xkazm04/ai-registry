---
layer: application
type: application
subject: agent-addressable-ui
technique: opt-in-instrumentation-gate
stack: react
status: forged
verified_on: 2026-10-22
verified_against: react@19
applied: code
ab_verdict: better
---

# React: a double gate that conformed and was pinned by nothing

The personas-web tree (`react@19`, Turbopack) already realises the technique's gates, and
this application records what the tree shows when the gates are run rather than read.

| technique element | realization |
| --- | --- |
| gate one, registration | `next.config.ts` adds the Turbopack rule only inside `if (process.env.DEV_INSPECT === "1")` |
| gate two, the transform re-checks | `source-loc-loader.cjs` returns its input when the same flag is not `"1"` |
| lazy toolchain | `babel` is `require`d after both gates, inside the branch they open |
| gate three, overlay | `layout.tsx` mounts the overlay only when `NODE_ENV === "development"` |
| flag as invocation env | `dev:inspect` is `cross-env DEV_INSPECT=1 next dev`; README names the same command |

**Seam chosen to falsify "the tree already conforms".** Every row above was true on
reading, so a confirming seam would have taught nothing. The question that could fail:
does anything notice if a row stops being true? Gate two is redundant by design, which
makes it the gate a refactor deletes first, and "babel is never loaded" is a property no
test or build log shows. Before this run no test in the tree touched the loader.

**Paired proof (mutation, both arms through the same four-case suite).** A is the tree as
it was: no test. B adds `scripts/dev-inspector/gate.test.mjs`, which runs the loader in a
child process per case and reads that process's module cache. Two mutants were applied
and reverted: gate two removed, and the toolchain `require` hoisted to module top.

- Target: gate-breaking mutants caught. A 0 of 2 (nothing runs the loader). B 2 of 2:
  removing gate two fails 3 of 4 cases (stamps appear with the flag absent, toolchain
  loaded, spelling check), hoisting the require fails 2 of 4 (toolchain loaded before any
  gate). Hoisting leaves output identical, which is why only a module-cache read sees it.
- Floor: unmutated tree 4 of 4 green; with the flag set both host elements are stamped,
  and a flag value other than `1` is still a no-op.

Shipped: personas-web `31b94a80` on origin master, test plus one CI line. The same test
asserts config, loader and script each read exactly one spelling of the flag, the
`one-authority-per-vocabulary` half of the technique.

## What this does not cover

The technique's last sentence asks for a release-pipeline check that the production
artifact carries no stamp attribute. The tree still has none: CI never builds and greps.
The `.next` directory on the checkout is a dev build, so it was not evidence either way.
This test pins the gates that keep the stamp out; it does not observe the artifact. The
absence is the open edge, banked in `librarian/applied.md` with its return condition.
