---
layer: application
type: application
subject: agent-addressable-ui
technique: framework-internals-independence
stack: react
status: forged
verified_on: 2026-10-22
verified_against: react@19.2
applied: code
ab_verdict: better
---

# The resolver was independent; nothing would have said so if it stopped

The personas tree resolves a click to source with two primitives and nothing else:
a `[data-loc]` selector and an `Element.closest` walk (`src/lib/dev/devLocate.ts:56`
`buildChain`). The React version is witnessed by `package.json` (`"react": "^19.2.6"`)
and the build side by `scripts/babel/inject-source-loc.mjs`, whose header names the
removed debug-source field as the reason it exists.

## What the tree confirms

A search of every fleet project for private renderer fields (fiber handles, the
debug-source and debug-owner fields, the devtools global hook) found none, with the
search run first against a file known to contain one. The technique's acceptance test
passes in this tree: the resolver is plain DOM, and its existing tests build their
input with `innerHTML`, so no framework is involved in what they prove.

## The seam was chosen to falsify that

The question that could have killed the finding: is the independence enforced, or only
currently true? A fallback was added to `buildChain` that, when the attribute is
absent, reads the element's fiber handle and its debug-source field. The existing 42
tests in `src/lib/dev` stayed green. The leak is invisible to a suite that proves the
resolver works, because a fallback only adds a path.

## A and B

- **A:** the suite as it stood. Injected leak caught 0 of 1.
- **B:** a test that strips comments from the four inspector sources and fails on any
  private-surface identifier, plus a chain test over DOM written by hand with no
  framework. Injected leak caught 1 of 1; the clean tree passes 47 of 47, with `tsc`
  and `eslint` clean.
- **Target:** a regression to private reads is detected. **Floor:** existing tests,
  types and lint unchanged. Both held, so the verdict is `better`.

## What this realization cannot do

The scan is a denylist of identifiers; a leak spelled through a computed key passes it.
It guards the resolver and the plugin, not the overlay's rendering. It proves nothing
about the build stage's correctness, which the stamping application covers.

## A neighbouring silence the seam showed

With stamps on, hovering an element that carries none (a portal, a third-party widget)
shows the same line as no hover at all, and a right-click there is swallowed without
feedback. This is the empty-state-reads-as-nothing failure from
the uninstrumented-degradation technique at element rather than build granularity, and
it was left unbuilt: no measurable here beyond the wording.
