---
layer: application
type: application
subject: import-normalization
technique: import-validation
stack: node
verified_on: 2026-09-02
verified_against: node@22
applied: experiment
ab_verdict: better
proof: before-after
---

# Three spellings through every merge door in one tree — one fixed, one open, one collapsed at the boundary

The technique's "absent, null, and empty are three different words" rule was
tested against every place in a desktop-app tree (TypeScript front, Rust
back) where an incoming collection guards a merge, replace, or import branch.
The overlay merge that produced the lead
(`src/lib/personas/templates/templateOverlays.ts`) had already been fixed, so
that seam was read **before/after in git history** — the pre-fix module
copied out of the commit and run beside the current one on identical inputs.
The live question was whether the *other* doors in the same tree carry the
same all-of-over-empty guard. They were enumerated, and two do.

## Arms and instrument

A temporary vitest file (no product code changed, deleted after the run)
pushed the three spellings — key absent, key `null`, key `[]` — through each
seam and classified the output as kept / erased / rejected.

**Seam 1 — translation overlay merge.** A = `mergeArray` as it stood before
the fix commit; B = current. Three canonical list shapes (an object list
matched by id, two primitive string lists). n = 9 cases.

| spelling | A (pre-fix) | B (current) |
| --- | --- | --- |
| absent | kept 3/3 | kept 3/3 |
| null | kept 3/3 | kept 3/3 |
| empty `[]` | **erased 3/3** | kept 3/3 |

A's replace branch was exactly the technique's measured trap:
`overlay.every(v => !isPlainObject(v) && !Array.isArray(v))` is vacuously
true on `[]`, so the wholesale-replace branch returned `[]` and the
canonical `use_cases`, `service_flow`, `principles` vanished — after the
canonical file's checksum had passed, because the checksum gates the input
to the merge, not its output (the module header says overlays "are not
independently checksummed"). B adds `if (overlay.length === 0) return
canonical;` ahead of the predicate and a fixture named for the failure. Note
what B chose: in this format all three spellings mean *untouched* — the
`mergeObject` loop `continue`s on `null` and `undefined`, and the array
branch now returns canonical on `[]`. That is a legitimate declaration (the
overlay format has no "delete" at all — structure is single-sourced), and it
is now written in a comment and a test rather than left to whichever
routine the code happened to call.

## The enumeration — what the rest of the tree does with `[]`

Every `every()` / `all()` over an incoming collection that sits on a merge,
replace, or import branch:

- **Length-guarded, correct** (5): the conflict-resolution button
  (`conflicts.every(...)` behind `hasConflicts`), the export select-all
  (`shownIds.length > 0 &&`), the credential negotiator's prefill check
  (`fieldKeys.length > 0 &&`), its step-graph skip rule (`keys.length === 0`
  returns early), and the Rust archive path check (`rel.is_empty() ||`).
- **Passes `[]`, converges anyway** (1): the wizard session restore accepts
  `questions_json: []` through `Array.isArray(v) && v.every(...)`, but the
  only consumer tests `questions.length > 0`, so `[]` and `null` reach the
  same sub-phase. Not a loss; it is however the shape that becomes one the
  day a second consumer reads `questions !== null`.
- **Passes `[]`, erases at the consumer** (1, open):
  `CredentialTemplateForm.tsx` validates `metadata.auth_variants` with
  `v.fields.every(f => typeof f === 'string')`; `fields: []` passes, and the
  field filter at the render site (`effectiveTemplateFields.filter(f =>
  v.fields.includes(f.key))`) then renders **zero credential fields** for
  that variant, where absent or `null` are rejected and the form falls back
  to the full field list. Harness: absent → 3 fields, null → 3 fields, empty
  → 0 fields. The same bytes have a *second* consumer in the Rust healthcheck
  resolver (`engine/healthcheck.rs`), which scores variants by filled fields
  and `continue`s on zero — so `fields: []` means "never matches" on one side
  of the process boundary and "show nothing" on the other. No shipped
  connector definition carries `[]` (the three that declare variants all list
  one to six fields), but the field's own doc comment names AI-driven
  negotiation as a producer. No fixture exists for the empty case; whatever
  the form does with it *is* the format's semantics, and today two
  consumers disagree.

## The structural fact: presence arrives at the boundary and is thrown away

The Rust bundle importer runs a two-pass conflict flow. The command receives
`resolutions_json: Option<String>` — presence is a fact the type carries —
and then does

```rust
let resolutions: HashMap<String, String> = resolutions_json
    .as_deref().and_then(|s| serde_json::from_str(s).ok()).unwrap_or_default();
let is_resolution_pass = !resolutions.is_empty();
```

Absent, malformed, and `{}` all read as *pass 1*, which re-runs the
non-conflicting phases and mints fresh ids for non-builtin tool definitions.
The trap is unreachable today for one reason only: the conflict panel's
confirm handler writes one entry per conflict (`resolutions[key] ?? 'skip'`),
so a pass-2 map is never empty and the panel is never shown without
conflicts. The merge's presence test lives in a React component, not in the
merge. That is the technique's rule met by accident — the day a second
caller (a CLI, a headless bridge, a test) sends `"{}"` or an unparseable
string, pass 1 runs twice and nothing reports it. A `.is_some()` on the
option, before the parse, is the one-line form of "test presence before
content".

## Verdict

`better`, `before-after` at n=9 on the fixed seam (3/3 erasures → 0/3), and
the enumeration turned up one unfixed guard of the same shape and one
boundary that collapses presence into content. The application's next
change is not the overlay: it is deciding what `auth_variants[].fields: []`
means — the healthcheck side already voted "never matches" — writing that as
the empty fixture the technique calls required, and reading the import
pass from the option rather than the map.

## What this realization cannot show

The harness reproduced two module-private predicates by literal copy
(they are not exported); it proves the predicate's behaviour on the three
spellings, not that the component is wired to it the way the source reads.
The Rust boundary was read, not run — the cargo test cycle exceeded the
budget of the landing, so it is a walked case with the reachability
condition named, not a measured arm.
