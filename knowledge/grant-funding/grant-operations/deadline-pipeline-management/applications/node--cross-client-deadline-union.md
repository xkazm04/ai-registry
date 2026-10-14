---
layer: application
type: application
subject: deadline-pipeline-management
technique: cross-client-deadline-union
stack: node
status: forged
verified_on: 2026-10-14
applied: code
ab_verdict: better
---

# Node: the portfolio fan-out that already conformed, and the two rules it missed

How one Next.js/TypeScript grant-writing product realizes the cross-client
union as an agency portfolio page, and what applying the technique to it found.

## What already conformed

The loader enumerates only the caller's memberships, reads each organization's
drafts through the same per-org scoped read the single-org view uses, and folds
them in a pure module (one row per client, then a totals roll-up). There is no
cross-tenant query. The technique's security shape (N scoped reads, never one
unscoped one) and its "keep the merge pure" rule were met before the technique
was applied.

## The seam chosen to falsify

The two decision rules a membership fan-out most often breaks are the ones about
failure, not security: *per-org failures degrade, not destroy* and *cap-hits are
loud*. Caught outcome worth having: a conforming-looking fan-out that fails both.
It did.

- **A (as shipped):** the per-client reads ran under a single `Promise.all`. One
  client's rejected read threw out of the loader and took the whole page with it,
  so the practitioner lost every other client's clocks. Separately, each read was
  windowed at 200 drafts and a full window rendered as a complete at-risk count,
  the "silently truncated client" the technique names.
- **B (applied):** each client loads under its own try/catch. A rejected read
  becomes a visible "couldn't load, not checked" row; a read that filled its
  window is marked capped and rendered as "N+ at risk (window full)"; the totals
  carry an `unverifiedClients` count so a quiet headline is not read as checked.

## Reading

Target: a failed client's read, A: whole page throws; B: that client is an
explicit failed row and the other client's at-risk count survives (loader test,
fails on A, passes on B). Floor: the pure roll-up tests, tsc and eslint stayed
green; no existing row's figures changed. Not covered: the union here is a
count-and-stats roll-up, not the merged soonest-first deadline list the
technique describes, and the at-risk day count uses the server instant rather
than a stated business timezone. Both are open gaps, not changed in this pass.

Return condition: build the soonest-first merged list over the same per-org
reads and give it a single stated timezone frame.
