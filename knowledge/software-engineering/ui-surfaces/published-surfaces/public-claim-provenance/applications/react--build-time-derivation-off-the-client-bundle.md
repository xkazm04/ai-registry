---
layer: application
type: application
subject: public-claim-provenance
technique: build-time-derivation-off-the-client-bundle
stack: react
status: forged
verified_on: 2026-10-14
verified_against: react@19
applied: code
ab_verdict: better
---

# A boundary kept by comment, then by the build — personas-web

The marketing site derives its public counts (integrations, templates, locales)
from the full catalogs and already follows the technique's first half: two
modules reduce the catalogs to plain numbers on the server side, and a test
fails on a hand-typed `N+` floor. What it did not have was the second half,
the part that makes the boundary uncrossable by accident. Both reducer modules
said "server-only" in a doc comment and nothing else.

## Arms

The seam was chosen to falsify the claim "the comment holds". A: a probe client
component imports the count module directly; the production build passes
(exit 0, 24 routes), so the heavy catalogs would ship to the reader with no
signal. B: the two reducer modules import the framework's server-only marker;
the same probe now fails the build with the import trace.

## What B found that the probe did not

Removing the probe and building again still failed. A dev-only preview route
enumerated sections through a client module and imported the roadmap section,
a server component that reads the count module, so the catalogs had been
inside that client graph all along. Nothing in the comment, the review, or the
bundle budget had seen it, because the route is a 404 in production and its
chunks are lazy. The fix renders that one section on the server page and hands
it to the client mount as a slot; the registry keeps a placeholder so the slug
still lists.

Marking the module also moved it into the scope of an ownership test that
requires every marked module to have a code owner, which is the right pressure:
the marker is only worth having if changing the boundary asks a person.

## Verdict

Target (a client import of a catalog reducer fails at build): moved from
passes to fails. Floor (production routes, bundle budget, typecheck, unit
suite): held; budget check reported 24 routes within budget, tsc clean. Two
guide-history tests fail on the untouched tree as well.

Shipped to the project's default branch. Return condition for any consumer:
search the module graph for client modules that import a marked module before
turning the marker on, because the first build is the audit.
