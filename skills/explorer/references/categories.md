# Explorer hunting lists, by category

Loaded in Phase 4 AFTER the probe pass (`probes.md`). These are single-artifact
questions: useful for the files a probe pointed at, and for an area whose joins came back
clean. The probes run first because, in a mature codebase, the joins carry the yield.

**Hard exclusion - lint-baseline migrations.** Anything the overlay's
`## Baseline exclusions` lists is fix-as-you-touch, never a standalone item. With no
overlay, detect the same shape: a lint rule reporting warnings in the thousands is a
declared migration, not a finding. Never surface "migrate the raw utility classes in X"
or "extract N hardcoded strings from Y". An item is a *structural* defect (wrong
mechanism, broken behaviour), not baseline backlog.

## quality
- Dead code, unreachable branches, unused exports.
- Duplicated logic across files (3+ near-identical blocks).
- Misleading names, unclear intent, leaking abstraction.
- Comments that explain "what" instead of "why" - flag the comment, not just the code.
- Commented-out code older than the current branch.
- A capability the code documents and does not use (a parameter with a test and no
  caller; a default that is also the absent value; a label map with one column).

## dx
- Test setup boilerplate that could be a fixture.
- Call sites bypassing the repo's own typed wrapper for a boundary.
- Repeated try/catch boilerplate that should use the repo's error helpers.
- Build-time hot paths (large bundles, slow rebuilds) - use recent build output if any.
- Errors thrown without enough context to debug.

## ui
- Hand-rolled duplicates of shared primitives (spinner, empty state, modal backdrop,
  tooltip) - check the repo's shared-component catalog before calling one missing.
- Visual bugs (overflow, alignment, contrast), only when reproducible or strongly
  suspected from the code.
- Spacing/radius/shadow inconsistent with the design tokens.
- Missing loading / empty / error states on user-facing components.
- Accessibility gaps that double as UX gaps (icon-only buttons without a label, broken
  keyboard navigation).

## perf
- Unnecessary re-renders (object/array literals in deps, missing memoization on
  expensive children, store selectors without shallow comparison).
- N+1 queries or IPC calls in a loop.
- Large lists without virtualization.
- Effect chains where one effect depends on another's state.
- Subscriptions that never unsubscribe.
- Synchronous work on the render path that could be async.

## bug
- Race conditions (read-then-write without a transaction, async effects without abort).
- Unhandled edge cases (empty arrays, null/undefined, NaN).
- Stale closures in effects and callbacks; wrong hook dependency arrays.
- Off-by-one and boundary errors.
- Errors swallowed silently (empty catch, or a catch that only logs).

## i18n
- Status tokens displayed raw where the repo law names a token-label helper.
- Error messages bypassing the repo's translated-error path.
- Constants carrying a literal label where the convention is a key.
- Feature-scoped locale data routing around the repo's single catalog.
- NOT bulk string extraction - that is the lint-baseline exclusion above.

## a11y
- Form inputs without labels.
- Contrast risks visible in the code (low-opacity text on tinted backgrounds).
- Clickable non-interactive elements without role and keyboard handling.
- Missing focus styles.
- Modals without focus trap, escape handler, or backdrop handling.

## sec
- A visibility/ownership rule applied to reads and not to writes - a rule enforced on
  reads alone is a display rule, not an access rule (`gate-matrix` in `probes.md`).
- Externally reachable surfaces (HTTP routes, IPC commands, webhooks) without
  authentication or validation.
- Privileged subprocess spawns without sandboxing.
- User input interpolated into SQL or command strings.
- Credentials logged or surfaced in error messages.
- Severity: a `sec` finding is promoted to `critical` (the `/research` security
  escalation rule applies).
