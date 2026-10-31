---
layer: application
type: application
subject: register-bytecode-execution
technique: dce-refuses-hoisted-declarations
stack: node
status: forged
verified_on: 2026-10-31
verified_against: node@20
applied: experiment
ab_verdict: not-better
proof: ab-paired
---

# A desktop app's production build eliminates hoisted declarations correctly, by the larger pass

Personas (commit `f8e62cb9ccc38add870c15820377682bec985ac8`) builds its front end with
Vite 8 and minifies with the Rolldown its lockfile pins. The witnesses, one per line:

- `package.json:220` "^8.3.4" (the bundler)
- `package-lock.json:8625` "1.2.15" (the pass under test)
- `package.json:26` ">=20.0.0" (the stack, hence `node@20`)

The arms below ran on node 24.14.0 against the Rolldown installed in that tree. The
project writes no constant-folding pass of its own. Two earlier hunts (2026-10-14,
2026-10-22) and this one found none anywhere in the fleet. The fleet does depend on one,
though, and says so in the source:

- `src/App.tsx:70` "Dynamic + dev-gated keeps the watchdog tree-shaken from prod"

Its production build relies on dead-code elimination of a constant-false branch in a
hoisting language. That pass is this technique's seam, owned by a dependency.

## The seam was chosen to falsify

A caught outcome would have been a live defect. If the build's pass eliminated on
reachability, a dev-only branch holding a `var` that shadows an outer name would make
the production bundle read the outer value where development reads undefined. The bug
would ship silently, and the technique would be urgently owed to this project. The
census of the project's own guards found no guard body holding a hoisting declaration
(the four hits on `function` near a guard were all declarations after a one-line
guard, outside it), so the experiment used the technique's demonstration cases rather
than the project's code.

## Arms and what was read

Nine cases, each one dead branch: a `var` read afterwards; the same behind the
production-defined `process.env.NODE_ENV` comparison the project uses; a block-scoped
`let`; a function declaration holding a nested `var`; a sloppy-mode block function; a
`var` under a constant-false loop; a `var` that shadows an outer `var` and is read
before the branch; a sloppy-mode block function that shadows an outer function; and a
shadowing `var` captured by a closure and assigned later. Arm A bundled each with
tree-shaking and minification off, so the dead branch survives (asserted: every dead
initialiser string present in all nine A bundles). Arm B used the project's production
shape: tree-shaking on, minify on, `NODE_ENV` defined to production. Both bundles were
executed and their output compared.

- **Target** (observable behaviour preserved): 9 of 9 outputs identical across arms,
  including both shadowing cases (`undefined`, not `outer`).
- **Floor** (the elimination actually happens): 9 of 9 dead initialisers absent from B.
  Total size 1,189 bytes in A, 442 in B.

## What the pass does instead of refusing

It never leaves a whole branch in place. Where the read is resolvable it folds:
`typeof x` becomes the literal `"undefined"` and the branch and declaration vanish
together. Where it cannot fold (the read precedes the declaration, or the declaration
shadows an outer name), it emits `if(0)var t;`, an empty conditional around the bare
declaration, with the initialiser and every other statement gone. That is the
extract-and-eliminate rewrite the technique's decision rules forbid, and it is correct
here because the pass runs after scope analysis. The technique's own "when not to use
it" clause predicts this, though it describes moving the declaration to the scope head.
The tree shows a cheaper shape that moves nothing.

## Verdict, and what this realisation cannot do

`not-better`, which here is a boundary condition and not a refutation. Adopting the
technique's walk would buy this project nothing: its only fold pass is a post-scope one
that already preserves the bindings and removes more than a refusing pass would. The
amendment written from this run states that the refusal binds only a pass that runs
before scope analysis. It also names what a consumer of the larger pass owes instead:
one shadowing case in its build check. The project has no such check. The build is
trusted to the dependency, and a regression there would show up as a wrong value, not a
thrown error. The experiment proves the pass correct at one pinned version, on nine
cases. It says nothing about the next lockfile bump, and nothing in the tree would
notice if it changed.
