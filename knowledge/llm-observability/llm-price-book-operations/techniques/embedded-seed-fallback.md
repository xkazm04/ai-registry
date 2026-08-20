---
layer: technique
type: technique
subject: llm-price-book-operations
technique: embedded-seed-fallback
status: forged
laws: [never-present-absence-as-an-answer, nullable-never-zero]
shared_with: []
use_when: [shipping a metering service as bare binaries, seeding a fresh install's price book, diagnosing why edited seed prices did not take effect]
---

# Embedded seed fallback

A price book that starts empty does not fail loudly. It prices every event at
null, the nulls flow into aggregates as unpriced traffic, and a dashboard over
an unseeded install renders all spend as — nothing. To an operator who has not
yet internalized [nullable-never-zero](../../_laws.md#nullable-never-zero),
that screen is indistinguishable from "these models are free". The failure is
silent, total, and shaped exactly like success on a quiet day. The technique
closes the one deployment path that produces it: **compile a copy of the seed
price book into the binary itself**, so that no install — however it was
delivered — ever boots with an empty book.

## Why the path exists at all

The on-disk seed file works for source checkouts and packaged installs, where
the config directory travels with the code. But real distribution includes
release archives and one-line installers that carry only binaries; there is no
seed file next to the executable, and no operator step that would create one.
Without a fallback, precisely the lowest-touch install — the one chosen by the
least-invested evaluator — is the one that silently prices everything at null.
The embedded copy costs a few kilobytes of binary and removes the entire
class.

## The precedence rule

The load order is fixed and small:

1. **A parseable file on disk wins.** Operators must be able to override the
   shipped book without rebuilding.
2. **A missing file falls back to the embedded copy.** Normal for binary-only
   installs; not an error.
3. **A present-but-unparseable file also falls back to the embedded copy — and
   warns.** A corrupt seed must not produce an empty book; but neither may it
   fall back silently, because the operator who wrote the broken file believes
   their edits are live.
4. **The database, once seeded, outranks all of it.** Seeds run once against
   an empty price table; thereafter the admin write path owns the book, and
   re-editing seed files does nothing.

Rule 4 is where operators actually get burned, which is why the technique
carries a reporting duty per
[never-present-absence-as-an-answer](../../_laws.md#never-present-absence-as-an-answer):
**at boot, say which source the book came from** — file, embedded, or
database — and how many rows it holds. One log line converts "why are my
edited prices not showing up" from an afternoon of confusion into a glance:
the boot said `embedded`, so the file you edited was never read.

## The embedded copy is a build-time asset, and tested like one

An embedded seed that fails to parse is not a runtime condition to handle
gracefully — it is a defect in the build, and the place to catch it is the
build's own test suite. Two assertions are mandatory and cheap:

- the compiled-in document parses, and
- the book it produces is non-empty.

Without them, a malformed edit to the seed file degrades the fallback to
exactly the empty-book state it exists to prevent — discovered not in CI but
in production, by the silence. With them, the failure mode is a red test on
the pull request that introduced the typo.

## Decision rules

- **The embedded copy is the same document as the on-disk seed, included by
  reference at build time — never a second hand-maintained copy.** Two copies
  drift; the drift is invisible until an embedded-fallback install prices
  differently from a file-seeded one.
- **Staleness of the embedded copy is a release concern, not a runtime one.**
  The binary's book is as old as the binary; that is acceptable *because* the
  database and admin path take over after first boot, and because the seed
  carries its own last-verified provenance for anyone who asks. Refreshing the
  seed belongs on the release checklist, next to changelog and version bump.
- **Fallback never merges.** File or embedded, one source wins whole. Merging
  a partial file over the embedded book produces a chimera no one can
  reproduce from artifacts.
- **A network-refreshed seed is a fourth source, not a substitute for the
  embedded one.** Part of the field keeps its book current by fetching a
  maintained copy at startup, falling back to the packaged copy when the
  fetch fails — the same never-empty guarantee with the precedence inverted.
  If you adopt it, the rules above still bind: one source wins whole, the
  boot line says which one won, and a fetched book is a *seed* — once the
  database owns the rows, a startup fetch that silently overwrote admin
  corrections would be the restatement door reopened from the network side.

## When not to use it

- **When an empty book is a refusal, not a state.** A deployment posture that
  says "no pricing configured means refuse to ingest" is coherent and strictly
  safer for billing-grade systems — there, absence should block, and a
  shipped default price list would be the lie.
- **When prices are tenant-negotiated.** Embedding list prices into a binary
  that meters contract rates guarantees the fallback is *wrong* rather than
  stale; wrong-and-plausible is the one outcome worse than empty.
- **Frequently-repriced domains with long release cadences** — if the gap
  between binary builds routinely exceeds the providers' repricing cadence,
  the embedded book's role must be narrowed to "prices exist, verify before
  trusting", and its staleness surfaced, not just logged.
