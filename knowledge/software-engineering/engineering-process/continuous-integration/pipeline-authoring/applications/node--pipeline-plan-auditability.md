---
layer: application
type: application
subject: pipeline-authoring
technique: pipeline-plan-auditability
stack: node
status: forged
verified_on: 2026-08-21
verified_against: node@20
---

# One code path, two modes — the generated-artifact gates in this registry

This repository does not generate its pipeline, but it does generate the artifacts its
pipeline asserts on, and every rule in this technique is realized in that smaller loop. Three
scripts carry it: `scripts/build-index.mjs`, `scripts/build-catalog.mjs`, and the guard that
exists only to protect the comparison itself, `scripts/check-hash-stability.mjs`.

## The two modes are one flag

`build-catalog.mjs` states the contract in its own header: *"`--check` verifies the committed
catalog matches what a fresh build would produce and exits non-zero if not — that is the CI
form. Without it, the file is rewritten."* One argument, one code path:

```js
const checkOnly = process.argv.includes('--check');
```

`build-index.mjs` takes the same flag, and `knowledge.yml` invokes both in check form —
`node scripts/build-index.mjs --check`, `node scripts/build-catalog.mjs --check`. There is no
separate validator anywhere in `scripts/`, which is the property the technique asks for: the
thing that writes the artifact is the thing that judges it.

The digest is factored out for the same reason, with the reason written at the seam:

> The digest itself lives in `scripts/lib/bundle-hash.mjs` so the stability guard
> (`check-hash-stability.mjs`) hashes through exactly the same code this builder does —
> two copies of a digest is two answers to "did this bundle change".

## The upward lesson: freshness is not correctness

The technique's rule that a verifying mode must *recompute from inputs* rather than compare
against a stored digest of its own output is stated abstractly. This repository paid for the
concrete version and left the incident in the source:

> Subjects are FOUND, never assumed to sit one level down. This loop used to read
> `<domain>/<subject>/techniques` at a fixed depth; when bundles nested it counted CATEGORY
> folders as subjects and reported "4 subjects / 0 techniques" for a bundle holding 15
> subjects and 91 techniques — and `--check` stayed green throughout, because it compares the
> committed file against a fresh build of the same wrong logic. Freshness is not correctness.

That is the sharpest available statement of the failure, and it is sharper than the technique
had it: a single-authority `--check` proves the artifact matches the generator. It proves
nothing about the generator. Two commits shipped numbers the maintainers knew nothing about,
with a green gate over them the whole time.

The fix is a **second, independently-coded count**, and the comment argues for its severity as
carefully as for its existence:

> `build-index.mjs` and this script both count the same corpus, by different code. Two
> independent counts of one thing that disagree mean one of them is wrong, and until this
> check existed nothing said which. […] FATAL rather than a warning. A catalog is the file
> consumers sync instead of walking the tree; publishing numbers we know are contradicted is
> worse than publishing none.

Note what this is *not*: it is not two authorities for one rule, which the technique forbids.
It is one authority (the digest, in `lib/bundle-hash.mjs`) plus one independent witness whose
disagreement is fatal. The distinction is the whole design — a second implementation of the
*verdict* drifts; a second implementation of the *count*, used only to contradict, cannot.

## Asserting the instrument before the result

Both gates refuse to report a clean walk they did not perform. `build-catalog.mjs` exits 2 —
not 1, and not 0 — before doing anything, on either of two conditions:

```js
if (!fs.existsSync(KNOWLEDGE)) {
  console.error(`FATAL: no knowledge/ lane at ${KNOWLEDGE} — refusing to write a catalog that claims zero bundles.`);
  process.exit(2);
}
if (!fs.existsSync(CATALOG)) {
  console.error(`FATAL: ${CATALOG} does not exist. This script edits a catalog, it does not invent one.`);
  process.exit(2);
}
```

`check-bundles.mjs` closes the same loop at the other end, after the walk rather than before
it, with three counts that must be non-zero — `conceptFiles`, `linksChecked`, `filesScanned` —
each exiting 2 with the diagnosis in capitals (`THE PARSER IS BROKEN`, `THE LINK MATCHER IS
BROKEN`, `THE WALKER IS BROKEN`). The reserved exit code separates "the check ran and found
problems" from "the check did not run", which is the distinction the technique's assert-the-
instrument rule is about.

## Normalizing before hashing, and gating the normalization

The technique's last rule — normalize before hashing, so the verdict is a property of the
content and not of the checkout — exists here as a dedicated gate, and its header records why
the property could not simply be trusted:

> The digest used to hash raw bytes. Git hands a Windows clone CRLF and a Linux clone LF for
> the same commit, so the hash was a property of the machine that ran the builder […] The
> catalog-freshness job sat red for weeks against hashes generated on a CRLF machine, and a
> red gate nobody can distinguish from a real staleness is a gate that has stopped working.
>
> The fix (newline normalization inside the digest) is one line and would be one line to undo
> by accident. This asserts the property directly instead of trusting that nobody does.

`check-hash-stability.mjs` writes the same fixture tree twice, once with each line ending, and
requires one digest from `hashBundle`. Its fixture includes a deliberately invalid UTF-8 byte
sequence *"so a digest that round-tripped through a string would mangle it and this test would
notice"* — the instrument for the instrument. `knowledge.yml` runs it as the first step of the
`catalog` job, ahead of `build-catalog.mjs --check`, so the question "does *current* mean the
same thing here as on the machine that wrote it" is answered before the freshness question is
asked.
