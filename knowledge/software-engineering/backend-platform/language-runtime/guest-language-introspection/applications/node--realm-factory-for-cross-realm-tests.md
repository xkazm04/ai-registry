---
layer: application
type: application
subject: guest-language-introspection
technique: realm-factory-for-cross-realm-tests
stack: node
status: forged
verified_on: 2026-10-23
verified_against: node@22
applied: code
ab_verdict: better
proof: ab-paired
---

# A second realm in the unit test of a walker that only ever sees foreign trees

**Witness:** the tree has no `engines` field. Its CI pins `node-version: 22`, and the
test step runs `.github/workflows/ci.yml:50 "- run: node --test"`. The experiment ran
on a local Node 24.14.0. Nothing it measured depends on the difference: the
experiment's first assertion checks on the running Node that a `vm` context's
intrinsics are distinct. personas-web
(`github:xkazm04/personas-web`, public, commit `64ffb7dd`) is a Next.js marketing and
documentation site.

No managed project embeds a language engine with its own realm constructor, so the
technique's debug factory has no direct seam. Node's `vm` module is the fleet's realm
factory instead. `vm.runInNewContext` creates a new global with its own intrinsics,
inside the caller's isolate, sharing the caller's collector and microtask queue. That
is the in-context construction the technique asks for, not a throwaway engine. The
site's build scripts use it: `scripts/i18n/load-locale.mjs:54 "vm.runInNewContext(compiled, sandbox, { filename });"`
evaluates every locale file. So every tree the i18n checks walk was built in a second
realm. Its objects have that realm's object prototype, and its arrays have that realm's
array constructor.

## The seam: a walker whose tests never left this realm

`scripts/i18n/identical-values-lib.mjs:73 "export function collectLeaves(node, prefix = [], out = new Map()) {"`
flattens a locale tree into dotted key paths. In production its input is always
foreign. Its six unit tests passed only object literals from the test's own realm. That
is the fake-realm failure in its cheapest form. Nobody built a fake factory. The tests
had no second realm at all, so a cross-realm rule could not be observed. The walker
happens to be realm-correct: it decides with `typeof` and `Array.isArray`, and both
read internal slots, not prototypes. No gate holds it there.

## The A/B

Arm A is the shipped test file. Arm B adds one test that makes a tree with
`vm.runInNewContext` and opens with the technique's first assertion, that the second
realm is real:
`scripts/i18n/identical-values-lib.test.mjs:105 "assert.notEqual(Object.getPrototypeOf(foreign), Object.prototype);"`.
It then asserts that the foreign array fails this realm's `instanceof Array` and still
passes `Array.isArray`, and finally checks the leaves. Both arms ran against five
realm-naive mutants of the walker, each a check a reviewer would plausibly accept.

**Target:** realm-naive mutants that turn the test file red.
**Floor:** unmutated walker green in both arms, the real locales unchanged, and the CI
glob `scripts/i18n/*.test.mjs` green.

| Mutant of `collectLeaves` | A | B |
| --- | --- | --- |
| none (control) | green | green |
| `Array.isArray(node)` -> `node instanceof Array` | green | green |
| object branch -> `Object.getPrototypeOf(node) === Object.prototype` | green | **red** |
| object branch -> `node instanceof Object` | green | **red** |
| object branch -> `node.constructor === Object` | green | **red** |
| both branches -> `instanceof` | green | **red** |

Target: A catches 0 of the 4 behaviour-changing mutants, and B catches 4 of 4. Floor:
both control arms are green. All 14 real locales came back from the loader with a
foreign object prototype (14 of 14). For each locale, the shipped walker produced the
same leaves from the foreign tree as from a this-realm `structuredClone` of it, so there
is no live defect. The CI glob ran 17 of 17 green with B in place. The verdict is
`better`, and arm B shipped as `64ffb7dd`.

The size of what arm A misses: under the prototype-identity mutant, the English locale
drops from 1,397 leaves to 0, and every locale drops to 0. Run over the same tree after
`structuredClone`, the same mutant returns all 1,397. A test written against a copy, or
against literals, cannot tell the two apart.

## What the seam was chosen to falsify

Two questions could have killed this application. First, is the sandbox a real realm?
If `vm` handed back this realm's intrinsics, there would be nothing to cross. The
assertion in arm B answered yes, and so did all 14 locale trees. Second, does the
array half of the technique's brand-check rule bite here? It does not. The
`instanceof Array` mutant is **equivalent** for this walker: a foreign array falls into
the object branch, and `Object.entries` yields the same index keys the array branch
would. So the realm hazard for a tree walker sits in the plain-object test, not the
array test. That matches the technique's "prototype identity shortcuts" case more than
its brand-check case. A walker that treats arrays and objects differently in its
output, such as a shape comparator, would expose the array half too.

## What this does not cover

The coverage check's own walkers, `scripts/check-i18n-coverage.mjs:48 "function compareShape(expected, actual, pathParts, issues) {"`
and its leaf counter, are module-private. They read the same foreign trees, and nothing
tests them at all. `compareShape` does distinguish arrays from objects. A partial
`instanceof Array` mutant would flag every foreign array as the wrong type. Applied to
every check, the same mutant would silently stop reporting an extra item in a locale's
array.
Guarding it the same way first means exporting those two functions into a library the
test glob can import. That is the return condition.
