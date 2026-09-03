---
subject: untrusted-extension-host
domain: software-engineering
last_touched: 2026-09-03
dry_streak: 0
---

# untrusted-extension-host

Born 2026-09-03 from `/intake` run `emdash-design` (intake 2.2.0, a design-deep vendor
repository read under the operator's "architecture, not product" framing). Per-system
routing count: system B, eight design decisions, **five `corpus: NONE` sharing one home**.

The finding that made it a subject rather than an amendment is worth keeping. The nearest
neighbour, `agent-runtime-assembly/operator-tier-code-loading`, states its tiers as a
two-row table whose second row reads *service-writable configuration, written by any
authenticated administrator, may name code: **never***. It justifies that with a
precondition — *"there is no protocol boundary here and no process boundary; the isolation
story the tool protocol offers across a wire is unavailable in the host's own address
space."* This source is the case where the precondition fails, deliberately: an
administrator installs third-party code from a UI in one click. An enumeration with a
hole, found by walking the technique's own table rather than by matching a slug. That
technique gained the third row as an amendment in the same run; the mechanisms live here.

Placed in `security` directly (ninth of ten) beside `supply-chain` — which owns code
arriving through a package manager at build time, where this subject owns code arriving
through the product's own admin UI at runtime. The discriminator is in the golden path's
opening as one answerable question: *who installs this code, and when — a developer
editing a committed manifest that passes your build and your review, or an administrator
clicking a button in your running product?* Other boundaries stated: `authorization` (who
may act), `sidecar-provisioning` (acquisition of a binary the operator wants, versus
containment of code the operator merely tolerated), `schema-driven-ui` (owns the
declarative-UI machinery entirely; this subject adds only the force, and it is one
paragraph, not a technique). The distribution half is the sibling subject
`decentralized-artifact-distribution`, forged the same session.

Seven techniques, one more than the spec proposed: the drafter split the privilege
declaration in two, arguing that the source's strongest evidence is a *diff* failure
rather than a *format* failure, so `grant-change-consent` carries the escalation polarity
and the re-consent gate while `canonicalizable-privilege-declaration` keeps the shape.
Two upward corrections from the tree that the expert draft had wrong: an added constraint
defaults to **escalation** unless the comparator knows the key's semantics, because an
open constraint vocabulary makes an unknown key's polarity uncomputable; and a thrown
refusal sentinel must be discriminated on a stable marker rather than prototype identity,
or a bundler duplicating the module reports a deliberate refusal as a crash.

Three source-tree applications, two negative and both stronger than the spec's version:
the finest-grained escalation instrument in the tree has zero non-test callers, and the
administrator's update path runs a flat set difference whose own comment admits a host
swap "sails through"; and a per-extension memory ceiling is declared, defaulted, resolved
and merged by both isolation runners and enforced by neither.

Director review: gate green, `use_when` on all seven, taxonomy appended after the
sibling's entry (both workers re-read before editing; neither clobbered), purity grep
against the source's full vocabulary clean, one cited line opened and confirmed. Spec:
`librarian/handoffs/2026-09-03-emdash-untrusted-extension-host.md` (EXECUTED). Two spec
errors the drafter overrode correctly: `stack: typescript` is not in the bundle's stack
set, and the link depth the spec gave was one level too deep.

Fleet: **unapplied, and the reason is structural** — no managed project hosts third-party
code, so the forces are absent rather than merely unbuilt. Return condition: when a fleet
project grows an extension surface. Security is now at exactly ten subjects, the cap; the
next one there forces subdivision.
