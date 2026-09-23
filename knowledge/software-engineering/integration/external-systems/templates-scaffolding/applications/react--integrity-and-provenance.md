---
layer: application
type: application
subject: templates-scaffolding
technique: integrity-and-provenance
stack: react
verified_on: 2026-09-23
verified_against: react@19
applied: experiment
ab_verdict: better
---

# Template integrity in the catalog loader, the badge, and the autopsy of the gate that wasn't

*Re-checked against the project tree at `f05c1759f` (react 19.2.6
installed). First written 2026-08-18. Since then the backend autopsy block
and the batch verifier moved within `template_adopt.rs`, and a third
integrity site (the trust badge) got a real comparison on 2026-09-17.*

This repo carries the technique three times over in one feature: a working
integrity gate at the catalog door (`templateCatalog.ts`); a badge that
until recently claimed integrity from origin alone (`templateVerification.ts`);
and, in the backend, the full autopsy of a deleted gate that ran for
months while verifying nothing
(`src-tauri/src/commands/design/template_adopt.rs:20-56`).

## The manifest: one generator, two consumers, representation pinned

`scripts/generate-template-checksums.mjs` walks `scripts/templates/`,
hashes each canonical template, and emits **two** manifests from one run
(`:7-8`, `:22-23`): `src/lib/personas/templates/templateChecksums.ts`
(frontend) and `src-tauri/engine/src/template_checksums.rs` (compiled into
the binary). Locale overlay files (`name.cs.json`) are skipped so they
don't get independent checksums (`:72-74`). The canonical set is defined
once, at the generator.

The loader hashes `JSON.stringify(template)` of the *imported module*
(`templateCatalog.ts:182-183`), using the same string-hash function the
generator uses: same identity (relative path), same bytes as seen. The
feature doc records the failure class this avoids: a JSON tool that
re-canonicalizes (number precision, key order) changes every hash while
changing nothing real (`docs/features/templates/06-integrity-and-security.md:251`,
`:270`).

## The gate that works: skip-with-reason at the catalog door

`loadAndVerify` (`templateCatalog.ts:145` onward) is verify-at-seed, and
every verdict is spelled distinctly (`CatalogSkipReason`, `:77`):

- `missing_checksum` (`:176-180`) is **absence**: a build-time bug, skipped
  with its own reason.
- `checksum_mismatch` (`:182-188`) is **mismatch**: the entry is dropped
  from the catalog and recorded per entry in `skipped`.
- `schema_invalid` (`:190-199`) runs **after** the checksum, with the
  ordering rationale in place.
- `unpublished` is intentional absence, not an error.

The rollup is `CatalogLoadStatus = ok | partial | failed | empty`
(`:108-117`): "every template failed verification" is distinguishable from
"no published templates". `CatalogIntegrityError` (`:85`) refuses to serve
a catalog with duplicate ids, because last-wins dedupe depends on
platform glob order (`:204-207`).

## The badge: origin painted as integrity, fixed 2026-09-17 (`97f3c45f63`)

The 2026-08-29 deviation: `shared/TrustBadge.tsx` drew ShieldCheck
"Verified" from `verifyTemplate`, where `integrityValid` was set from
origin alone. The content hash was computed and compared to nothing. The
fix makes the seeder fingerprint what it writes
(`src/lib/personas/templates/seedTemplates.ts:80-83`, via
`registerBuiltinContentHash`), and `resolveIntegrityValid`
(`src/lib/templates/templateVerification.ts:201-210`) compares the stored
`design_result` against that digest. A mismatch, or a fingerprinted
built-in with no payload, is now `untrusted` with `requireApproval`. The
fix ships a tamper test: `src/lib/templates/__tests__/templateIntegrity.test.ts:33-42`
mutates the payload and requires `untrusted`. It is the first test in this
feature that demands red.

It also keeps two folds, both written down deliberately:

- **Transient absence reads as Verified.** When no digest has been
  recorded yet (the gallery painted before seeding, a language switch
  mid-flight), `resolveIntegrityValid` returns `true` (`:208`), and
  `templateIntegrity.test.ts:54-60` pins "does not accuse a built-in the
  seeder has not fingerprinted yet" as `verified`. The digest registry is
  process memory (`templateVerification.ts:70`). So the window is every
  start-up until the seeder runs. That is exactly the case the technique's
  *pending* state exists for. Not accusing was right. Painting the shield
  was not.
- **Generated origin is Verified regardless.** `deriveTrustLevel`
  (`:150-168`) returns `verified` for `origin === 'generated'` without
  reading `integrityValid`. For those entries the shield still attests
  origin (made in this app), not integrity. It is one mark carrying two
  predicates, which the technique's badge rule separates.

The fingerprint is taken from the in-memory template the seeder is about
to write. That template already passed `loadAndVerify`. So the chain is:
catalog door verifies files against the manifest, the seeder records a
digest of what it wrote, and the badge compares the store against the
seeder. The second comparison catches mutation *of the store after
seeding*, which is the adoption-time check the technique allows when the
store is writable by other parties.

## The gate that wasn't: `check_template_integrity`, deleted 2026-08-09

The comment block at `template_adopt.rs:20-56` preserves the autopsy of
the per-adoption gate that used to be documented as "the authoritative
security gate":

- The manifest is keyed by **relative file path** and hashes the **entire
  template file**. Every real caller passed a **bare label** and the
  **payload-only** `design_result`. So `is_known_template` was false for
  **100% of adoptions** (`:28-35`), and fixing the key alone could not
  help.
- The release build only warned on "unknown". An earlier revision
  hard-rejected, which bricked two first-party adoption paths on shipped
  binaries while passing in dev, where that branch compiled out
  (`:36-39`).
- The reasoning sits at the deletion site: "A control that looks like
  security and is inert is worse than none" (`:40-42`).
  `docs/features/templates/06-integrity-and-security.md:157` ("Where
  enforcement actually lives") names the precondition for ever re-adding a
  per-adoption check: a payload-keyed manifest from the same generator.

`verify_template_integrity_batch` (`template_adopt.rs:2229`) survives as
layer 2, over the same (path, whole-file) pairs. Its caller only reports.
The comment calls it "a detector, not a gate" (`:49-52`). The corpus audit
(`docs/concepts/golden-paths/catalog-browse-and-apply.md:243-254`,
`:371-372`) goes further. Layer 2 receives `{path, content}` over IPC from
layer 1 and never opens the file, so the two manifests agree 0-in-111 by
construction, and the verdict is discarded at both call sites. The
technique's independence rule is measured here, not hypothetical.

## Where the implementation sits below the standard

- **No tamper test at the catalog door.** The badge now has one. Nothing
  flips a byte in a template file and requires a `checksum_mismatch` skip
  from `loadAndVerify`.
- **The hash is not cryptographic** (a 64-bit string hash,
  `templateVerification.ts:38-50`). That is fine against corruption and
  edit-without-regen. Against a deliberate attacker who can also
  regenerate the frontend manifest it is decoration, and the threat model
  leans on layer 2's compiled-in copy, which only reports.
- **The trust display has no pending state.** `TrustBadge` knows
  `verified | sandboxed | untrusted` (`shared/TrustBadge.tsx:21-25`). Any
  not-yet-known state has to fold into one of them, and it currently folds
  into the shield.
- **Provenance is thin.** The manifest records hashes but not generator
  run, source or time, and the adopted instance's stamp does not chain to
  a manifest version.

## Applied 2026-09-23 - the timing window, replayed against the tree's verifier

The start-up order was replayed against the real verifier over the 38 published built-ins.
Rows saved by the last session are fetched and painted before the seed pass runs (deferred
behind idle, up to one second), and expected digests exist only once that pass computes
them. Before the digest: 38 of 38 read verified, and a tampered row reads verified too.
After it: a tampered row reads untrusted, an untouched one verified. The window appears on
every cold start with the gallery mounted, folded into the success mark. Not hunted, the
mirror window: the pass registers the new payloads' digests before its write lands, so
after an update stale rows are accused until the refetch - 18 of 37 built-ins when
upgrading from a 2026-06-01 build, 1 of 38 from 2026-07-01, 0 from 2026-08-01 - and if the
write fails, the error is swallowed and the accusation lasts the session. Two timing
absences, folded opposite ways; one bounded pending state covers both. A build-time
checksum of every catalog entry (43) already ships in the binary, but over the entry
rather than the seeded payload. `better`.
