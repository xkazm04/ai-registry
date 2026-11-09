# Census brief template

`census-run.mjs census` fills the `{{...}}` fields and writes one file per chunk. Keep the
part vocabulary fixed across a census: clusters are only comparable if every chunk used it.

---

You are taking an inventory of one part of a codebase. You are read-only: do not attempt to write files, and do not suggest fixes.

**Chunk:** {{chunk}}
**Focus from the operator:** {{focus}}

**Open every one of these files:**

{{files}}

**Standards known to apply near this code:**

{{standards}}

**If you find a part of one of these kinds, open its standard:**

{{kindStandards}}

These standard files are outside this repository; reading them is allowed. Open a standard before you judge a part against it.

List every part implemented in these files, of these kinds:

`table`, `list-or-feed`, `chart`, `form`, `modal-or-overlay`, `data-fetch-wrapper`, `api-client-wrapper`, `error-wrapper`, `auth-wrapper`, `cache-layer`, `render-optimization`, `background-job`.

Anything that is none of these kinds is left out.

A part is the component, hook or module that implements one of those kinds, **whether it is general-purpose or was built for one feature**. A members table used on one page is a part. Helper functions, buttons, icons, and screens that only render some other part are not parts: list the part they render, where it is defined.

For each one, decide its relation to the standards you opened:

- `consumes`: it follows a named standard (give it in `subject`), or it is a thin use of a shared implementation (give that in `builtOn`). A part with neither is not `consumes`.
- `reinvents`: a standard covers it, and this code breaks or lacks one of its rules. Name the rule in `missed`.
- `no-standard`: no standard you opened covers it.
- `better-than-standard`: a standard covers it, and this does something the standard lacks. Say what in `missed`.

Rules:

1. Open the code before you claim anything. `quote` must be one exact line copied from `file`, near `line`. A quote that is not in the file is discarded.
2. `builtOn` names what the part is assembled from: an in-repo shared component or a library, such as `components/kit/DataTable` or `ag-grid`. Use null if it is built from scratch out of plain elements.
3. `capabilities` lists what the part does, in short lowercase terms such as `sorting`, `server-pagination`, `virtualization`, `retry`, `column-resize`.
4. `stack` is the UI or runtime it is built on, such as `react`, `vue`, `node`, `rust`.
5. Before you report a missed rule, find where that rule would be implemented and confirm it is absent there.
6. An empty list is a valid answer.

End your final message with exactly one fenced JSON block and nothing after it:

```json
{"chunk":"...","parts":[{"kind":"table","name":"...","file":"path","line":1,"quote":"exact line","stack":"react","builtOn":"library or shared component, or null","relation":"reinvents","subject":"slug or null","capabilities":["sorting"],"missed":["..."]}]}
```
