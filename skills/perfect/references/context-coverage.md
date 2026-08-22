# App context coverage — the Personas memory outbox in detail

The Personas app measures per-context memory coverage for a skill that declares `contexts: tracked`
from its Memory Ledger, not from the vault. A vault-only run shows 0% there forever. Fleet/CLI sessions
have no DB access, so the ledger is fed by an append-only JSONL outbox at the repo root:

```
<repo>/.personas/memory-outbox.jsonl
```

```json
{"type":"node","kind":"progress","title":"<=200 chars: what you did in this context","body":"optional detail - direction slugs, commit SHAs, verdicts","context":"<exact context name the app knows>","skill":"perfect"}
```

## Rules that make a row actually count

- **Always set both `"skill":"perfect"` and `"context":"<name>"`** — together they drive the coverage %.
  A node missing `context` is *unanchored*: it lands in the ledger but counts toward no context, so the
  bar does not move. A node missing `skill` is attributed to anonymous `skill:outbox` and is excluded
  from per-skill coverage entirely.
- **Which name — this is the part that silently fails.** The ingest matches `context` against the
  names the app actually knows (its `dev_contexts`), case-insensitively. An unrecognized name is NOT an
  error: the node is stored with a null context and never counts toward coverage — the failure mode that
  reads as 0% with no error anywhere. The context map mirrors those names when the map is fresh, but it
  is an *export* of a past scan and there is no import path (`git pull` does NOT sync a peer's rescan
  into this machine's DB), so a map older than the last rescan can name contexts the app no longer has.
  Preference order: a name the overlay's `## Context sources` confirms the app knows (the local app
  DB's `dev_contexts`, the same DB `/perfect smoke` opens read-only) → `.personas/contexts.txt` when
  THIS machine's app dumped it → the context map name. Never trust a rendered context doc
  (`.claude/codebase-context.md`) — it is a stale render. One repo measured all three disagreeing with
  the DB on one day; two of the three would have anchored to nothing.
- `kind` must be one of `fact | progress | decision | gotcha | map`: `progress` for work done,
  `decision` for a direction accepted/rejected and why, `gotcha` for a trap the next session must not
  re-hit, `map` for observed structure drift (the app reacts to `map` nodes with a delta context scan).
  Unknown kinds degrade to `fact`.
- Caps enforced by the ingester: ≤ 200 lines, ≤ 512 KB per file, title ≤ 200 chars, body ≤ 4000 chars.
  One JSON object per line, no trailing commas, no pretty-printing — a malformed line is counted as
  `skipped` and silently lost; verify the file parses at Wrap.
- Coverage is a **30-day rolling window** — a context goes stale and the bar drops if the loop never
  returns. That decay is the instrument working, not a bug: it is the loop's own "which contexts am I
  neglecting" signal, and it feeds the Phase-P queue score as a tiebreaker.
- Re-emitting an identical node refreshes its freshness instead of duplicating (content-hash dedupe),
  so a re-touched context is safe to re-emit.
- **Coverage is earned, not declared**: emit a node only for a context where this session produced
  real evidence (a scout brief, a gated slate, or a merge) — never one per queue entry.

## When to emit (incrementally — same reason the vault is written incrementally)

- **Phase P**, after each context's gate resolves → one `progress` node (what the scout found + what
  was proposed), plus a `decision` node per accepted or rejected direction carrying the user's reason.
- **Phase B**, after each merge → one `progress` node naming the direction and commit SHA; a `gotcha`
  node for any trap the build hit (a builder death, a registry clobber, a convention the diff violated).
- **Phase W** → backfill anything the phases missed, then verify the file parses. "Before finishing"
  alone loses everything when a session is killed, and this loop's sessions get killed.

## Who ingests it

The app sweeps the outbox into the Memory Ledger and **deletes the file** when a *Fleet-spawned*
session exits, and whenever the Skills Manager panel (Dev Tools → Skills) is opened for the project. A
`/perfect` run in a plain terminal is neither, so its lines sit on disk until the user next opens that
panel — expected, not a failure. Never hand-write into the ledger DB; the outbox is the only door.
**Skip silently when not Personas-managed** (no `.personas/` and no app dispatch).
