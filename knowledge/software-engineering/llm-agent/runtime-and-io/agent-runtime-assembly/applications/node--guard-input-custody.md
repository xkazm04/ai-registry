---
layer: application
type: application
subject: agent-runtime-assembly
technique: guard-input-custody
stack: node
status: forged
verified_on: 2026-09-03
verified_against: node@20
applied: code
ab_verdict: better
proof: ab-paired
---

# The purity gate read its own denylist selector out of the content it was guarding

The witness for `node@20` is the CI pin: every job in this repository's
knowledge workflow runs `node-version: '20'` (`.github/workflows/knowledge.yml`,
four jobs). There is no `engines` field; the pin is the tree's own statement of
what it runs on.

This registry publishes knowledge documents whose top two layers must survive
being transplanted into an unrelated codebase, and it enforces that with a
static purity gate: `scripts/check-bundles.mjs` matches every golden-path and
technique body against a denylist of proper nouns — repository paths, source
file extensions, framework and product names — and fails the build on a hit.
The gate is mandatory, it runs in CI, it fails closed, and it is re-read from
disk on every invocation. It is the good half of the shape the technique
describes.

Its policy input was the problem. Which denylist applied to a bundle was
decided by a `purity:` key in that bundle's own `knowledge/<domain>/index.md`
frontmatter — a **content file, written by the same automated runs that write
the bundle's documents**. Every agent that lands a technique in this repository
has write access to the file that selects the rule that technique will be
judged against. That is the technique's central case exactly: the governed
party holds the guard's input, and the guard re-reads it, fresh, every run.

The failure direction made it worse rather than better. A missing `purity:` key
did not stop the build; it fell through to a `generic` profile carrying only
two patterns (repository path, source-file extension) and emitted a **note**.
The `stack/product identifier` pattern — the one that actually catches
`React`, `Tauri`, `Supabase`, `Sentry` and the rest — lives only in the named
profiles. So deleting one line from a frontmatter block silently swapped the
denylist for a much weaker one and left the gate reporting success.

## The paired comparison

The measurable is the count of `body purity` violations the gate reports, and
the arms are the same tree with and without the change. Run in a detached
worktree at the commit under test, so no sibling session's uncommitted work was
in scope. A single stack identifier (`React`) was planted in one technique body
as the probe; the baseline was asserted green before anything was planted.

| condition | A — as shipped | B — with the change |
| --- | --- | --- |
| baseline, nothing planted | pass, exit 0 | pass, exit 0 |
| probe planted, `purity:` present | **fail**, 1 violation, exit 1 | **fail**, 1 violation, exit 1 |
| probe planted, `purity:` deleted | **pass, 0 violations, exit 0** | **fail**, 2 failures, exit 1 |
| `purity:` downgraded to `generic` | passes on the weaker list | **fail**, exit 1 |

Row three is the finding: one deleted line in a content file took the gate from
a correct red to a green build, and the only trace was a note nobody reads. Row
two is the control that matters most — the change must not alter the gate's
behaviour when the declaration is correct, and it does not. Row one confirms no
false positives were introduced across all eight bundles.

## The change

The domain-to-profile mapping moved into the checker as `REQUIRED_PURITY`,
where the governed content cannot reach it. The bundle index's `purity:` key is
still read and must **agree** with the table; a missing key fails, and a key
that names a weaker profile than the bundle is pinned to fails with both values
in the message. A bundle the table does not know is a new bundle, and it must
declare a profile and be pinned — absence is never permissive.

All eight published bundles already declared the profile the table now pins
them to, so the change is behaviour-preserving for every legal state of the
tree and only closes the illegal ones. That is why the cost was ~20 lines: the
custody problem here was not that the right answer was unknown, but that the
answer was stored where the governed party could edit it.

## What this application cannot tell you

The gate is static, and the technique's own framing says a denylist is a floor
rather than the whole rule — the real transplant test is handing a document to
an agent in an unrelated codebase, which nothing here automates. This change
makes the floor un-removable; it does not raise it. A document can still carry
a product name the denylist has never heard of, and the custody fix does
nothing about that case.

It also does not address the other half of the write surface: `REQUIRED_PURITY`
now lives in a script that the same agents can still edit. Custody was moved
one step out of reach, not out of the repository. The honest ceiling for a
single-repository tool is that the enforcement and the governed content share a
trust domain; a hard boundary would need the gate to run somewhere the
contributing agent has no write access at all, which is what the CI workflow
already is for the *committed* state and is not for the local run.
