# Fleet convergence — keeping the registry and its consumers in agreement

The registry publishes a standard and consuming projects subscribe to it. Both halves
worked; nothing joined them on a schedule. This document describes the loop that does,
and — more usefully — the measurements that made it necessary.

## What was measured

All of these were true simultaneously on 2026-09-20, with no instrument broken and no
error reported anywhere:

| | |
| --- | --- |
| project maps stale against the current corpus | 13 of 13 |
| verdicts judged against a subject that had since changed | 228 |
| context↔subject pairs judged at all | 254 of 4,691 (5.4%) |
| leads sitting in project ledgers, uncollected | 193, oldest 21 days |
| `software-engineering` subjects never consulted in 30 days | 172 of 229 (75%) |
| consults of the `table` subject, fleet-wide, in 30 days | 2 — both in the project it was forged from |
| distinct bespoke table implementations across the fleet | ≈60, none shared |

The registry-side loop was not idle during that period: `librarian/applied.md` recorded
566 landings in September alone. **The corpus was feeding itself far better than it was
feeding the fleet.**

## Why nothing gated it

Every instrument that walks the fleet — `build-registry-map.mjs`, `build-fleet-map.mjs`,
`leads-collect.mjs`, `signals-collect.mjs` — resolves its checkouts through
`.machine.local.json`, which is gitignored by design: absolute roots and contributor
identity are not publishable. So **none of them can run in CI**, and `scripts/gate.mjs`
called none of them. Fleet drift was architecturally un-gateable.

The resolution is an indirection. `converge.mjs` runs where the fleet is visible and
leaves behind a committed, public-safe report; `check-coverage-age.mjs` gates **that
file's age**. CI never needs to see the fleet, and drift still fails a build.

Read a red `check-coverage-age` correctly: it never means the fleet is broken. It means
nobody has measured it recently.

## The three instruments

### `consult-check.mjs` — the commit→subject join

Given the staged paths, it answers *what governs this change, and did anyone read it?*

- **Mapped code** resolves through `.ai/registry-map.json` — a lookup, exact and cheap.
- **Unmapped code** falls back to the corpus router over the path's own tokens. This is
  the half that matters: the `knowledge-sync` clause carried by 18 skills routes *only*
  through the map, so new work — which has no map row — resolved to no subject and
  reported success. A new `components/AuditDataTable.tsx` now reaches `table` on the day
  it is written.

It **never blocks**. A hook that blocks a commit over a knowledge read gets deleted, and
a deleted hook measures nothing. Instead it prints the governing subjects where an agent
session reads them as tool output, and appends `outcome: "missed"` to the project's
consult ledger so the gap becomes a number.

> **Wire note.** `.ai/consults.jsonl` rows may now carry `outcome: "consulted" | "missed"`.
> **An absent `outcome` means `consulted`** — the rows already on disk predate the field.
> A `missed` row must never count as coverage, or the instrument certifies itself after
> one run.

Install with `install-consult-hook.mjs`. It detects five hook mechanisms across this
fleet, refuses to rewrite `lefthook.yml` or `.pre-commit-config.yaml` (printing the
snippet instead), never overwrites a hook it did not author, and never commits.

### `converge.mjs` — the loop

One command where the fleet is visible: rebuild every map, fold leads into the
librarian's inbox, refresh signals, invert the fleet map, discover undeclared checkouts,
write `librarian/fleet-coverage.md`.

Two guards worth knowing about, both added because the underlying trap fired during
development:

- **Contributor identity.** If `.machine.local.json` declares a contributor the signals
  lane does not already hold for this app, the signals phase is **skipped** rather than
  minting a second public identity for one installation. `docs/telemetry-identity.md` is
  explicit that a rename is an evidence-backed migration in `identity-aliases.json`,
  never an inference from similar names.
- **Undeclared checkouts** are identified by the manifest's own `repo.name`, not by path,
  ledger activity or git remote. A benchmark clone of `kp` declares `name: kp`; a
  genuinely unregistered project declares a name nothing else claims. On this machine
  that distinction is the difference between 2 real findings and 26.

### `converge.mjs --pending` — the efferent nerve

There is no push mechanism, and there does not need to be one. Every map pair already
records the subject revision it was judged against; every rebuilt map already marks
arrived contexts. **A landing in the registry already shows up in each consuming
project's own map as a number that moved** — propagation was never missing, it was
unrendered. `--pending --write` renders it to `.ai/registry-pending.md` in each project.

It deliberately omits never-judged pairs: fleet-wide that is 94.6% of them, and a queue
opening with four thousand rows of `unknown` is a queue nobody reads. `unknown` is a
coverage question for `/conform`. Pending answers the narrower one — what changed under a
verdict this project already gave, and what arrived that no verdict covers.

Nothing is applied automatically. Merging is adopting; a human acts.

## Running it

```sh
node scripts/converge.mjs                    # the full pass, where the fleet is visible
node scripts/converge.mjs --check            # read-only; non-zero if stale
node scripts/converge.mjs --pending --write  # render each project's queue
node scripts/install-consult-hook.mjs        # report hook coverage
node scripts/install-consult-hook.mjs --install
node scripts/check-coverage-age.mjs          # what CI runs
```

`converge` and the hook installer write into other repositories and **never commit, never
push, and never merge** — the same propose-then-adopt law `/straighten` runs under.

## What this does not fix

- The corpus's **retrievability by domain vocabulary**. The `table` subject cannot be
  reached by the words developers name table files with: `virtualized` and `datagrid`
  return nothing fleet-wide, and `row`, `column` and `grid` route to other subjects
  entirely. A subject reachable only by its own slug is reachable only by someone who
  already knows it exists.
- The **banked-lead backlog**. 35 of the first 85 triaged leads were recorded as real
  findings and never written into a subject file; `librarian/runs/2026-09-01-1.md` lists
  "Writers for the 35 banked leads" under *Owed*.
- **Shared implementations.** Nothing here makes nine projects share one table.
