---
layer: application
type: application
subject: agent-addressable-ui
technique: agent-pasteable-reference-format
stack: react
status: forged
verified_on: 2026-10-14
verified_against: react@19
applied: code
ab_verdict: better
---

# The clipboard ladder in a dev inspector: two rungs present, the third missing, one leak

The ascent tree ships an in-app source inspector whose copy handler was already
close to the technique: it tries the asynchronous write, falls to the legacy copy
command against a temporary textarea, and spells failure differently from success
(a red "Copy failed" beside "Copied" in a live status region). The default payload
is the bare `path:line`, pinned by tests, which is the shape the technique leads
with. So the seam was read for what could still falsify the technique rather than
for what already confirmed it.

## What A did

- The temporary field was appended, selected and copied inside one `try`, and
  removed only on the success line. If the legacy command threw, the field stayed
  in the document and was hit-tested as page content on the next hover. The
  technique says the field is removed on every exit path including the failure
  path; the tree did not.
- When both rungs failed, the HUD printed the reference as plain text under a red
  label. The person had to triple-click it themselves; the technique's third rung
  is the text already selected.
- The copy result was a boolean, so the good path could not say which rung it took.

## What B did

The copy moved into its own module returning `async | legacy | failed`, with the
field removed in a `finally`. On `failed` the HUD renders a read-only field that is
focused and fully selected, labelled for assistive tech with the keystroke. No
change to the emitted text: the bare `path:line` stays, so every existing payload
assertion still held.

## Read

Four jsdom cases walked the ladder (async, legacy after a rejection, both refused,
legacy throwing) plus two HUD cases. Target: leaked temporary fields when the
legacy command throws, A 1 and B 0; HUD on failure shows selected text, A no and
B yes. Floor: the 38 inspector tests, typecheck and lint stayed green, and the
payload text is unchanged. The technique held; the tree fell short of it, and no
amendment was needed.

Not measured: how often the manual rung is reached in a real session, and whether
a short anchor of the element's visible text is worth adding beside the path. The
existing payload tests pin the bare shape, so that is an owner call.
