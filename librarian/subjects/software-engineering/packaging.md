---
subject: packaging
domain: software-engineering
last_touched: 2026-11-06
touched_by: intake
dry_streak: 0
---

# packaging

## 2026-09-02 - intake [[2026-09-02-sentry-self-hosted]]

First intake touch. Class: EXTENDS. `installer-authoring` gained "Configuration the user
owns, that the upgrade must change" - generate once, three states (default -> migrate;
migrated -> pass; custom -> report), consent with the flag printed and an unreadable prompt
exiting by name, refusal graded by what the change prevents. Discriminator against
`idempotent-steps` stated: who owns the state decides skip-and-report versus halt. Applied
against the registry's own link script (`node--installer-authoring`, experiment, ab-paired,
**not-better**): the block it rewrites is a machine-owned region, 0 operator lines inside
markers across 7 checkouts, 3 stale self-comments a naive foreign-line check would misreport;
the amendment's closing paragraph now draws that boundary. 6 -> 6 techniques, 2 -> 3
applications.

## 2026-09-03 — `/intake` over a doctrine corpus ([[2026-09-03-rusttraining]])

+1 amendment. **`os-arch-matrix`'s "Host leakage" bullet widened past
cross-compilation.**

It framed host leakage as an *architecture* trap: build scripts and test runners
execute on the host, so anything they probe describes the host rather than the
target. The source's case is a **same-architecture** build where the varying
property is an optional resource — two runners in one pool yield two different
products from one revision.

One admissibility rule now covers both: *can this property differ between builder
and target?* If yes, detect it where it is used; if no, build-time detection is
fine and the variant belongs in the label.

### 2026-11-06 - intake jamiepine/voicebox delta 51f49de..8af7efe (run intake-voicebox-1106)

`process--signing-and-trust.md` re-pinned to `8af7efe` (release workflow anchors shifted by 1-4 lines, content unchanged; version witness 0.5.0 -> 0.6.0). The wrapper-attestation diagnosis the application cites still reads "fix pending" upstream.
