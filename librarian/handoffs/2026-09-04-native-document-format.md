---
kind: xl-spec
date: 2026-09-04
run_id: kdenlive-0904
source: https://github.com/KDE/kdenlive
source_commit: b7124d97e8f810d9170b7049837cd7ac84edd522
bundle: software-engineering
category: integration
subject: native-document-format
status: PROPOSED
---

# XL spec — `software-engineering/integration/native-document-format`

## Why this is XL and not a technique

Three load-bearing design decisions from one system's project-file layer map to
`corpus: NONE` and share one home-if-new. Under the routing rule that is a
subject by construction, not a judgment call. They are not three variations on
one idea — they are three separate decisions about the same artifact, each with
its own forces and its own recorded failure:

1. **The saved document is a valid input to the engine that renders it**, not a
   proprietary format requiring an export step. Editor-only state rides in a
   namespace the engine ignores.
2. **A duplicated projection of document state drifted, and the fix was to
   delete the duplicate rather than to synchronise it** — write through the
   engine's own serializer so there is one writer.
3. **A process-global presentation setting leaked into serialization and
   corrupted saved documents**, forcing a deliberately backwards-incompatible
   format generation. The rule extracted: machine-facing serialization is
   locale-independent by construction; the user's locale exists only at the
   presentation boundary.

## Why the neighbours do not own it — verified, not assumed

Each was checked by opening the file, not by slug overlap:

- `integration/import-normalization` — owns **foreign** formats arriving
  (`format-detection`, `lossy-conversion-disclosure`). Says nothing about the
  format the application itself writes.
- `backend-platform/data-layer/migrations` — database schema evolution. A
  document format's compatibility problem is different in kind: the old data is
  in files the vendor does not control and cannot run a migration against.
- `operations/governance-and-records/versioning-snapshots` — durable named
  versions of an entity. Orthogonal: that is *which* version, this is *what a
  version is written as*.
- `client-architecture/i18n` — its `locale-runtime` technique is entirely
  presentation-side (first paint, switching, mirroring). The serialization half
  of decision 3 has no owner. Expect the boundary to be stated from both sides.
- `ui-surfaces/input-and-editing/undo-history` — reversibility in session, not
  persistence.

## The subject's job, stated as a boundary

> The contract between an application and the documents it writes, when those
> documents outlive the version that wrote them and are read by something other
> than the writer.

It owns: what goes in the file and what stays derived; who is allowed to write
the file; how the format evolves and how a break is declared; what the file
promises to a reader that is not this application. It does **not** own foreign
format ingestion (import-normalization), database schema change (migrations),
or version history as a product feature (versioning-snapshots).

## Proposed techniques, each with the decision rule it must carry

1. **`format-is-the-engines-input`** — Decide whether the saved document is a
   superset of the runtime/engine format or a separate format with an export
   step. Rule: if a downstream engine consumes the artifact, prefer extending
   *its* format with an ignorable namespace over inventing one and translating.
   Buys: no export step, no editor/render divergence, third-party tooling for
   free, and the application's own exported outputs become re-importable
   documents. Costs: the editor's model is constrained by the engine's, and the
   ignorable-namespace trick has a specific failure — see technique 5.
2. **`one-writer-per-fact`** — The gen-1 → gen-2 lesson generalized. When
   document state is projected into a second location for a consumer's benefit,
   the two drift, and the observable defect is that the rendered result stops
   matching the edited parameters. Rule: the remedy for a drifting projection
   is deletion of the projection, not a synchroniser; if a consumer needs a
   different shape, it derives it at read time. Must cite
   `derivation-names-recomputation` and `silent-state-is-ungoverned`.
3. **`serialization-is-locale-free`** — Rule: every machine-facing write uses a
   fixed, locale-independent representation for numbers, dates and separators;
   the user's locale is applied at the presentation boundary and nowhere
   deeper. Must carry the specific trap: the setting is frequently *process
   global* and set by a dependency, so the property is not achieved by careful
   coding at the call site — it is achieved by pinning the global and testing
   under a hostile locale in CI. The negative test (run the suite under a locale
   whose decimal separator differs) is the technique's instrument. State the
   boundary with `i18n/locale-runtime` in prose, on both sides, per the
   cross-bundle rule.
4. **`format-generations-are-declared`** — Rule: a document format has numbered
   generations, each generation names the application versions that produce it,
   and a backwards-incompatible break is announced as one rather than discovered
   by a user whose file will not open. Include the honest counterpart: a break
   is sometimes the correct fix (it was here — the alternative was continuing to
   corrupt files), and the technique must say what earns one.
5. **`ignorable-extensions-must-be-declared`** — The boundary case of technique
   1, and it must be written because the source demonstrates the failure: the
   editor wrote namespaced attributes and never declared the namespace, so the
   files were well-formed to the engine and *invalid to standard tooling* for
   several years. Rule: an extension mechanism that relies on a reader ignoring
   what it does not understand is only safe if the artifact remains valid under
   the format's own rules; "our reader accepts it" is not validity, and the
   check is a standard validator in CI, not the application's own parser.

## What this subject must NOT absorb

- Foreign-format import and its lossiness. That is import-normalization, and
  the new subject should link the boundary rather than restate it.
- Rendering, engine selection, or effect pipelines.
- Undo, in-session history, or autosave scheduling.
- Anything about the specific media domain the source works in. The subject is
  about documents, not about video.

## Open questions the drafter must decide, not discover

- Whether `format-generations-are-declared` and
  `ignorable-extensions-must-be-declared` are two techniques or one. The spec's
  view is two: one is about evolution over time, the other about validity at a
  single instant. Override this if the drafting shows otherwise, and say why.
- Whether `serialization-is-locale-free` is better placed in `i18n` as a
  boundary technique. The spec's view is that it belongs here — the failure it
  prevents is document corruption, not a localization defect, and the audience
  reading it is a person designing a save format. State the boundary from both
  sides regardless.
- Whether a sixth technique is owed on *what stays out of the file* (the
  reference-vs-embed decision: media referenced by path, generated content
  embedded). The source decides it explicitly and the forces are clear — file
  size against portability against breakage when references move. Judge whether
  it is a technique or a paragraph in `format-is-the-engines-input`.

## Web budget and primaries

Two fetches at most, spent on a format specification that documents an
ignorable-extension rule (an XML-namespace or a container-format spec) to
harden technique 5. Everything else is corpus-internal or from the source tree.

## An instance to open

The source tree is cloned for this run and its own documentation states each
decision with its forces and its recorded failure; the design record in
`librarian/sources/2026-09-04-kdenlive.md` carries the anchors. The drafter
receives the design record as its brief and must strip every product name — the
techniques carry no vendor, product or format-family names.
