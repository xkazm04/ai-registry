# App context coverage (Personas-managed repos)

This skill declares `contexts: tracked` - the Personas app measures per-context memory
coverage for it. When run inside a Personas-managed repo (a `.personas/` directory
exists, or the app dispatched this run), before finishing append JSON lines to
`.personas/memory-outbox.jsonl` at the repo root (append, never rewrite) - one node per
context you meaningfully worked on:

```json
{"type":"node","kind":"progress","title":"<=200 chars: what you did in this context","body":"optional detail","context":"<exact context name the app knows>","skill":"explorer"}
```

**Which name - this is the part that silently fails.** The ingest anchors a node by
matching `context` against the names the app actually knows, case-insensitively. A name
it does not recognize is NOT an error: the node is stored with a null context and never
counts toward coverage. Use the name set the overlay's `coverage_context_source`
declares; with no overlay, use the context map's names. **A repo whose map and whose app
disagree must say so in the overlay** - a mechanically generated map and a product-level
taxonomy can share almost no names, and anchoring to the wrong one loses every node
silently.

Always set both `"skill":"explorer"` and `"context":"<name>"` - together they drive the
per-skill context-coverage percentage (last 30 days). The app ingests and deletes the
file when the session ends. Skip silently when the repo is not Personas-managed.
