---
layer: application
type: application
subject: machine-paced-delivery
technique: agent-readable-build-outcomes
stack: node
status: forged
verified_on: 2026-08-21
verified_against: node@20
---

# The gate output contract as this registry's checkers implement it

Six dependency-free checkers under `scripts/` gate this repository, and they were written for
a consumer that is usually an agent. Between them they realize most of this technique, and the
two places they fall short are instructive.

## Verdict, counts, then findings

`scripts/check-bundles.mjs` closes with exactly the prescribed order — the counts with their
predicates first, then the verdict, then the bounded detail:

```js
console.log(`${conceptFiles} concept documents · ${linksChecked} links checked · ${filesScanned} files scanned for health`);
```

followed by the note stream and then:

```js
if (failures.length) {
  console.error(`\nbundle integrity FAILED — ${failures.length} problem(s):\n`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log('bundle integrity OK');
```

The counts are the technique's "how many things were examined" and they are what makes a walk
that examined nothing visible. Every finding is one line, prefixed `  - `, and every one is
constructed as *location, then reason, in the same string*:

```js
fail(`${rel}: type "${fm.type}" but location says "${expect}"`);
fail(`${here}/${slug}.md: declares technique "${t}" but techniques/${t}.md does not exist`);
```

The path is normalized to forward slashes at construction —
`path.relative(ROOT, file).replace(/\\/g, '/')` — so a finding produced on one platform reads
and resolves the same on another. Small, and the difference between a location a consumer can
act on and one it has to interpret.

The gate goes further than the technique asks on one point: the reported path is *the path the
reader will actually find*, with the reason attached at the seam.

> Every finding below reports the path the reader will actually find, whatever depth this
> bundle currently sits at. A message that reconstructs `<domain>/<slug>` would send people to
> a folder that does not exist the moment a bundle nests.

## Two severities, visibly distinct

`failures` and `notes` are separate arrays with separate sinks: notes print as
`  note: <text>` inside the normal report, failures print to standard error under a `FAILED`
header and set the exit code. The severity is assigned by the checker, at the site that knows
— `report()` inside the taxonomy section is literally a function that chooses which array to
push to, based on whether the bundle's layout is materialized:

```js
const report = (msg) => (materialized ? fail(msg) : notes.push(`${msg} [layout: flat — not yet materialized]`));
```

The suffix is the part worth stealing: a demoted finding says *why* it was demoted, so a
consumer reading a note knows it is a real finding under a different regime rather than an
advisory remark.

## Did-not-run has its own exit status

The technique's third verdict is implemented as a reserved exit code, and the checkers are
consistent about it. `check-bundles.mjs` asserts three instrument counts after the walk, each
exiting 2 with the diagnosis in capitals:

```js
if (conceptFiles === 0) {
  console.error('FATAL: zero concept documents parsed across all bundles. THE PARSER IS BROKEN.');
  process.exit(2);
}
```

`linksChecked === 0` gives `THE LINK MATCHER IS BROKEN`; `filesScanned === 0` gives
`THE WALKER IS BROKEN`. `check-skills.mjs` states the doctrine as a rule rather than a
practice — *"THE INSTRUMENT IS ASSERTED BEFORE THE RESULT […] a gate that walks zero files and
exits 0 reports 'clean' when it means 'blind'. An empty lane, an unreadable lane, or a
`--since` ref git cannot resolve are FATAL (exit 2), never green."*

`check-currency.mjs` applies the same split to the opposite default. It exits 0 with findings
by design — *"A stale document must never block an unrelated pull request"* — but keeps the
distinction intact: *"A broken input still exits 2: reporting nothing is not the same as
finding nothing."* Report-versus-fail is a severity decision; ran-versus-did-not-run is not,
and the two are not allowed to collapse into each other.

## Where the implementation falls short of the technique

**No structured form.** Every checker emits lines for a human. `check-currency.mjs` is the sole
exception, with a `--json` flag documented as *"machine-readable (this is what /librarian
reads)"* — and the existence of that one flag, added for the one consumer that needed it,
shows the general case was not designed for. An agent parsing `check-bundles.mjs` output today
is parsing prose.

**No cap on findings.** `for (const f of failures) console.error(...)` prints all of them. A
change that breaks a shared law anchor or renames a widely-linked subject produces hundreds of
lines with no elision marker and no "showing N of M". The technique's bounding rule is
unimplemented, and the failure mode is the expensive one: the consumer pays for the whole list
to reach a first error that was on line one.

**No causal marking.** Findings print in walk order, so the first line is the first
alphabetically-encountered problem rather than the one to fix first. Where a single cause
produces many findings — one missing law anchor cited by twenty techniques — nothing says so.
