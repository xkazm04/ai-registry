# App context coverage (architect reference)

Loaded at the end of a run when a `.personas/` directory exists in the MAIN checkout or the Personas app dispatched the run.

## App context coverage (Personas-managed repos)

This skill declares `contexts: tracked` — the Personas app measures per-context memory coverage for it. When run inside a Personas-managed repo (a `.personas/` dir exists in the main checkout, or the app dispatched this run), before finishing append JSON lines to `.personas/memory-outbox.jsonl` (append, never rewrite) — one node per context you meaningfully worked on.

**Write to the MAIN checkout, never to `$PWD`.** `.personas/` is gitignored, so it exists only in the main checkout; a run that followed Phase 7a into a worktree finds no such directory there, and a node written into the worktree is lost silently. Resolve the root from the shared git dir:

```bash
MAIN="$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")"
OUTBOX="$MAIN/.personas/memory-outbox.jsonl"
```

One line per node:

```json
{"type":"node","kind":"progress","title":"<=200 chars: what you did in this context","body":"optional detail","context":"<exact context name the app knows>","skill":"architect"}
```

**Which name — this is the part that silently fails.** The ingest anchors a node
by matching `context` against the names the app actually knows, case-insensitively.
A name it does not recognize is NOT an error: the node is stored with a null
context and simply never counts toward coverage. Use the name set the overlay's
`coverage_context_source` declares; with no overlay, use the context map's names.
**A repo whose map and whose app disagree must say so in the overlay** — a
mechanically generated map and a product-level taxonomy can share almost no names,
and anchoring to the wrong one loses every node silently.

Always set both `"skill":"architect"` and `"context":"<name>"` — together they drive the per-skill context-coverage % (last 30 days). The app ingests and deletes the file when the session ends. Skip silently when not Personas-managed.
