---
layer: application
type: application
subject: codegen
technique: generated-file-hygiene
stack: rust
verified_on: 2026-08-22
---

# Three generators against a formatter that arrived after them

The technique's one-writer-per-file rule prescribes excluding formatters from
generated roots. This repo took the other branch of that fork, deliberately,
and the reasoning is worth carrying because the situation is common: the
generators existed for years, the formatting policy arrived in 2026-08, and
the collision was silent until someone looked.

## The setup

Three generators emit Rust by string concatenation into tracked files:

| Generator | Output |
|---|---|
| `scripts/generate-connector-seed.mjs` | `src-tauri/db/src/builtin_connectors.rs` |
| `scripts/events/generate-connector-events.mjs` | `src-tauri/db/src/builtin_shared_events.rs` |
| `scripts/generate-template-checksums.mjs` | `src-tauri/engine/src/template_checksums.rs` |

All three had committed their output unformatted for as long as the repo had
no formatting policy — which was fine, because nothing had an opinion.

## The collision

On 2026-08-20 a workspace-wide `cargo fmt` reformatted every tracked source
file, these three included, and a `rust-fmt` CI job plus a staged-files
pre-commit hook began enforcing the result. Correctly: they are tracked source
files, people read and diff them, and there was no reason to carve them out.

The generators, of course, kept emitting the raw shape. So from that commit
onward **every `npm run dev` rewrote all three files into a state that fails
the format gate** — the two authorities of the technique's one-writer rule,
oscillating on a schedule. The only thing between that and a red build was a
human noticing a dirty tree and reverting by hand, which is a control that
works right up until the day someone commits without looking.

## The resolution: the generator runs the formatter

Rather than exempting the generated roots, each generator now calls the
formatter over its own output as its last step
(`rustfmtInPlace(<output>)` — the identical helper in all three:
`generate-connector-events.mjs:65-75` invoked at `:368`,
`generate-connector-seed.mjs:41` at `:132`,
`generate-template-checksums.mjs:46` at `:326`). The header states the trade:

> Formatting here rather than exempting generated files from the gate: the
> output is source that people read and diff, and "generated" is not a reason
> for it to look different from everything around it.

This preserves the property the exclusion rule was protecting — **one writer**
— by folding the second writer into the first: the generator's output *is*
formatted output, so there is no second authority left to oscillate with. The
exclusion route protects the same property by removing the formatter; this
route protects it by absorbing the formatter. Pick by whether humans read the
file. They read these.

Two details keep it honest:

- **Best-effort by design.** If the formatter binary is absent the generator
  warns, names the file, and still writes valid source (`generate-connector-events.mjs:69-73`). A codegen
  task that hard-fails on a missing optional tool converts a cosmetic gap into
  a broken dev command.
- **The header carries the incident.** All three helpers share a `WHY.` block
  recording the 2026-08-20 sequence in full — the generated file's own
  provenance line, which is where the next person to consider carving out an
  exemption will be standing.

## The part that generalizes past this repo

After fixing two of them, the third was found by **sweeping for the class
instead of waiting to trip over it** — and a fourth was searched for and
confirmed not to exist. That sweep is the actual lesson: a newly enforced
whole-tree policy is not one bug, it is a *class* over every generator in the
pipeline, and the population is enumerable from the task registry in minutes.
Any repo that turns on a formatting, linting, or header policy across tracked
sources owes itself the same pass, because every generator that predates the
policy is now a generator that violates it on the next run.
