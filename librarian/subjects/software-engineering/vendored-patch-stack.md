---
subject: vendored-patch-stack
domain: software-engineering
last_touched: 2026-10-05
---

# vendored-patch-stack

## 2026-10-05 - apply collapse-patch-axes-that-share-hunks (run intake-1005-cpax)

Dispatched by the attention scan for carrying no application. First application,
`node--collapse-patch-axes-that-share-hunks`, against personas (`code`, `better`,
ab-paired).

**Seam.** No fleet project holds a directory called patches with a patch set in it;
three tracked patch files exist across sixteen trees. The real stack was found by
what mutates third-party bytes: a `postinstall` script rewriting two minified
`@xterm` hunks, plus a dev-only bundler transform with an `@xterm` branch over the
same hunks, plus a runtime shim the platform now defeats. Two axes - per upstream
file and per environment - and the two docs describing them each named a different
two of the three carriers.

**Chosen to falsify.** Had the dev branch reached hunks the postinstall did not,
collapsing it would have lost coverage and the rule would need to read "collapse
into the union at the carrier that reaches every environment". Measured on pristine
xterm 6.0.0 + addon-webgl 0.19.0: 2 shared hunks, 0 dev-only, so the finding held
as written; the landing still carried the union pattern, so a future dev-only hunk
is not lost. Carriers per hunk 2 -> 1; dev/prod divergence with the postinstall
skipped 2 files -> 0; floor held (production bytes patched, B equal to A's dev
output, suite 27/27, the disjoint transform still fires on non-minified deps).
personas 318f24730 + applied row 43ac68537, not pushed (personas master carries
34 unpushed sibling commits).

**Lead - the size boundary.** The technique's "When not to use it" says below about
a dozen patches the axis barely matters. This stack had two hunks and the axis
mattered anyway, because the overlap was between environments: two carriers wrote
different bytes for one hunk (enumerable vs not) and the order they ran in decided
which shipped. The boundary as written is about triage cost; it does not cover an
axis whose overlap produces two outcomes. One sighting, so no amendment.
Return condition: a second stack, in another tree, where carriers split by
environment or build stage overlap below the dozen-patch line.

**Lead - a dev-only carrier with no production twin.** The same transform rewrites
spaced protected-member assignments in non-minified dependencies (`decimal.js-light`
and similar) in dev only. Whether a production build on a frozen realm throws there
is unmeasured. Return condition: a production build scanned per vendor chunk for raw
protected assignments, or a frozen-realm production run of a page that loads them.

**Impact** (stale verdicts before this landing): none recorded - the subject had no
application and no project map joined to it.
