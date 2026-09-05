---
subject: untrusted-extension-host
domain: software-engineering
last_touched: 2026-09-04
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

## 2026-09-03 - intake `intake-chatterino2` (2.3.2)

Technique triple from a desktop chat client's in-process scripting sandbox, the first
non-web instance of the subject: `capability-subtraction-sandbox` (build the runtime from
the full standard library, delete capabilities and their aliases, test by enumerating the
extension's globals) and `safe-mode-registration` (an operator-initiated boot registers
every extension and runs none, keeping the disable control reachable), plus a boundary
section in `per-callback-failure-policy` for observe-and-augment surfaces where uniform
non-fatal is correct and the host owes a re-entrancy mute. Two `cpp--` applications record
the source's drift (its published allowlist omits two libraries the runtime opens; no
globals test; safe mode untested) and one `rust--` application confirms the amendment
against a fleet runtime whose observers are non-fatal by signature. Placement: `security`
is at its ten-subject cap; anything further here is a technique, never a sibling subject.

## 2026-09-03 - intake run `intake-boa-0903` (source: an embeddable language engine)

Amendment to **`capability-subtraction-sandbox`** ("Where the runtime counts, the ceiling
set is not empty") and a one-clause correction to the golden path's sentence "reach
without ceilings", which had denied too much: the technique's own hedge ("unless the
runtime offers an instruction-count hook and the host wires it") is the general case for
an interpreter the host embeds. Whatever the runtime counts it can cap - frames, stack
slots, loop back-edges, instructions, and bytes where the allocator is its own - and three
rules make the counted set honest: a counted ceiling raises a failure the guest cannot
catch; the ceiling set is published as two lists, counted (with defaults) and uncounted
(wall time inside a host call, host-side allocation, each with its bound elsewhere or the
word none); and the uncounted list is empty exactly when the guest imports nothing. The
source engine carries four counted limits with non-catchable errors and a changelog of
the uncounted list shrinking one built-in at a time. Application
`rust--capability-subtraction-sandbox` (**simulation, unmeasurable, structural-only**):
the fleet's WASM plugin host is the rule's third clause instantiated - fuel, memory,
tables and instances capped and published beside consumption, and no imports, so both
arms end identically; the instrument named is the linker's import count. The mechanism of
counting itself is now a sibling subject in `backend-platform/language-runtime`
(`guest-execution-bounding`), which links this technique from its golden path; this
subject keeps reach and grants.

## 2026-09-04 - /intake `opik` (run `opik-0904`)

New technique `host-api-import-budget`. The subject models the timeout as
bounding the host's **wait** and the tier boundary as determining the API; what
nothing modelled is that **reaching** that API is charged to the extension's
clock. A host requires the extension to import the host's own interface - a base
class to subclass, a result type to return - and if the published client pulls in
a settings layer, a transport client and a large class registry, that import can
consume a quarter of a single-digit-second limit before the extension's first
line runs. The symptom arrives as *the extension timed out*, pointing every
diagnosis at the author.

The landed rules: measure import and execution separately, cold, under the pool's
real contention; state the limit as a total with the host's share named rather
than as an extension budget it is not; substitute a dependency-free
implementation of the documented hot subset **under the real import path**; and
cover both resolution routes with one idempotent loader, because a stub in the
module table misses dotted submodule imports - which are precisely the imports
that motivate the fallback. The technique's own escape clause prefers the
upstream fix: a host whose extension-facing surface has no heavy dependencies
never needs the second implementation.

Applied `experiment`/`not-better` against a fleet observability client, which is
the escape clause firing: zero runtime dependencies at the entry point, so the
substitution is correctly declined and the tree confirms the preference. No fleet
project hosts foreign code under an execution limit, so the technique reached its
seam from the library side rather than the host side.
