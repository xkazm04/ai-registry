# App context coverage (host-app-managed repos)

Loaded on demand from `SKILL.md`. This skill declares `contexts: tracked` - a host app that
manages the repo can measure per-context memory coverage for it. **Skip this silently when
the overlay sets no `context_outbox`.** When it does, before finishing append JSON lines to
that file (append, never rewrite) - one node per context you meaningfully worked on:

```json
{"type":"node","kind":"progress","title":"<=200 chars: what you did in this context","body":"optional detail","context":"<exact context name from the overlay's name source>","skill":"friend"}
```

**Which name - this is the part that silently fails.** The ingest anchors a node by
matching `context` against the names the host app actually knows, case-insensitively. A
name it does not recognize is NOT an error: the node is stored with a null context and
simply never counts toward coverage. Take names only from the name source the overlay's
`## Context sources` declares (falling back to the `## Areas` table), and never from a map
that section marks stale - a mechanically generated map usually carries names no app knows.

Always set both `"skill":"friend"` and `"context":"<name>"` - together they drive the
per-skill context-coverage % (last 30 days). The app ingests and deletes the file when the
session ends.
