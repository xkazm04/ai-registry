# Census brief template

The Director fills the `{{...}}` fields and writes one file per context. Keep the part
vocabulary fixed across a census: clusters are only comparable if every context used it.

---

You are taking an inventory of one part of a codebase. You are read-only: do not attempt to write files, and do not suggest fixes.

**Context:** {{context name}}
**Read these paths:** {{files or directories}}
**Standards that may apply here:** {{subject slugs and golden-path rules from the registry map, or "none known"}}
**Focus from the operator:** {{nudge, or "none"}}

List every reusable building block implemented in these paths, of these kinds:

`table`, `list-or-feed`, `chart`, `form`, `modal-or-overlay`, `data-fetch-wrapper`, `api-client-wrapper`, `error-wrapper`, `auth-wrapper`, `cache-layer`, `render-optimization`, `background-job`.

Anything that is none of these kinds is left out.

For each one, decide its relation to the standards listed above:

- `consumes`: it follows a listed standard, or imports a shared implementation.
- `reinvents`: a listed standard covers it, and this was built without following it. Name which rules it misses in `missed`.
- `no-standard`: none of the listed standards covers it.
- `better-than-standard`: a listed standard covers it, and this does something the standard lacks. Say what in `missed`.

Rules:

1. Open the code before you claim anything. `quote` must be one exact line copied from `file`, near `line`. A quote that is not in the file is discarded.
2. `capabilities` lists what the part does, in short lowercase terms such as `sorting`, `server-pagination`, `virtualization`, `retry`, `column-resize`.
3. `stack` is the UI or runtime it is built on, such as `react`, `vue`, `node`, `rust`.
4. A part is general-purpose machinery that takes its data and behavior from its callers. Helper functions, leaf components, and screens or dialogs tied to one product feature are not parts, even when their names contain a word like Table. Before listing a part, ask whether another product could use it with only its data changed. If not, leave it out.
5. A part that is built on a third-party grid or library is still a part. Judge what this code adds.
6. Before you report a missed rule, find where that rule would be implemented and confirm it is absent there.
7. An empty list is a valid answer.

End your final message with exactly one fenced JSON block and nothing after it:

```json
{"context":"...","parts":[{"kind":"table","name":"...","file":"path","line":1,"quote":"exact line","stack":"react","relation":"reinvents","subject":"slug or null","capabilities":["sorting"],"missed":["..."]}]}
```
