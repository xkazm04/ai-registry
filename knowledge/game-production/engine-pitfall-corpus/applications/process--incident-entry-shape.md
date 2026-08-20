---
layer: application
type: application
subject: engine-pitfall-corpus
technique: incident-entry-shape
stack: process
status: forged
---

# A 42-entry Unreal pitfall corpus as a curated authoring artifact

PoF (`C:\Users\kazda\kiro\pof`) keeps its hard-won Unreal Engine knowledge as a
hand-curated array of typed entries in `src/lib/knowledge/ue-gotchas.ts`. At the
time of extraction it held **42 entries**, alongside an 18-entry identifier
catalogue in `src/lib/knowledge/ue-known-assets.ts` and a one-screen boundary
declaration in `src/lib/knowledge/binary-content.ts`. The corpus is not
documentation for humans to browse; it is a payload injected into generation
prompts, which is why it is an array of records rather than a document.

## The record

The `Gotcha` interface (`ue-gotchas.ts:7`) is the five-field shape, one for one:

```ts
export interface Gotcha {
  id: string;
  summary: string;
  detail: string;
  appliesTo: PromptKind[];   // hard filter: task kind
  modules?: string[];        // soft filter: domain — omitted means UNIVERSAL
  source: string;            // provenance
}
```

`appliesTo` carries values like `'ue-python'`, `'ue-cpp'`, `'packaging'`, `'web'`.
It is a hard filter for the reason the technique gives: `interchange-fbx-commandlet-crash`
is advice about a scripted import route and is actively wrong for a compiled task.

## Summaries are conclusions

Every summary in the file reads as an instruction or a prohibition, and the ones
with a single load-bearing token put the token in the line:

- `material-const3vector-pin` (`:22`) — *"Constant3Vector output pin is "" not
  "RGB""*. The whole fix is one string value, so it is in the summary; the reader
  never opens the body.
- `plugin-content-not-in-registry-headless` (`:69`) — *"engine-PLUGIN content
  (/MoverTests, /MoverExamples) is missing from the asset registry under
  `-run=pythonscript` until the paths are scanned — `does_asset_exist` lies"*. The
  symptom the reader will actually meet ("lies", a false absence) is in the line.
- `warning-vs-error-policy` (`:386`) — *"Pick failure severity by consequence …
  and never fabricate the missing object to keep running"*. A policy stated as a
  rule, not a topic heading.

## Details recount the probe

`headless-physics-needs-ticking-world` (`:375`) is the model entry for the probe
discipline. It opens with the mode and version — *"Live-probed on UE 5.8.0"* —
lists the entire API surface that **resolves** in the commandlet
(`set_simulate_physics`, `editor_play_simulate`, `spawn_actor_from_class`,
`ChaosSolverActor` …), states plainly *"so introspection alone suggests a headless
'simulate then bake' pass is scriptable. It is NOT"*, then names two hard walls
with their exact observed behaviour: the transient world has no physics scene so
`is_simulating_physics()` stays `False`, and `editor_play_simulate()` is a fatal
crash with *"process exit code 3"*, not a catchable exception. It closes with the
split — the bake half is fully headless, the settle half needs a ticking world —
which is what turns the entry from a dead end into an architecture.

`interchange-fbx-commandlet-crash` (`:60`) shows why the version must be in the
detail: **5.7 crashes** where **5.8 silently reports "there was nothing to import"**.
An entry that said only "this does not work" would be wrong about one of the two.
It records the verbatim log string, the proven fix (a console command run at the
top of the script, *"proven on 5.8.0"*), and a failed-attempt trap — an export that
selects only the armature yields a mesh-less file and fails with a bare
"Import failed".

`plugin-content-not-in-registry-headless` (`:69`) carries the blast radius
explicitly: *"Project content under /Game is unaffected; this only bites paths that
live in a plugin mount."* Without that sentence the rule would metastasise into
ceremony around every lookup in the codebase.

## The three-layer entry

`asset-swap-at-path-does-not-repoint-referencers` (`:313`) is the layered form the
technique prescribes, kept as one entry because each layer hid the next:

1. `rename_asset` **updates serialized referencers**, so the "swap at the old path"
   trick silently re-points every consumer at the *backup*; the fix is to set the
   consumer's default-object property explicitly — and to check every related slot
   (a dodge has forward/backward/left/right/default).
2. Even then, compiled code may bypass configuration entirely — a hard-coded
   fallback load *"a leftover 'always show something in PIE' self-heal"* overrode
   every configured montage.
3. Only runtime observation (which montage name actually plays, per sample) shows
   which of the two won. Loading the asset path in a commandlet passes at every
   stage and proves nothing.

Split into three entries, the lesson — that fixing layer one produces a convincing
but still-wrong result — is exactly what would be lost.

## Provenance, as far as it goes

Every entry carries `source`, and the strings do distinguish grades in practice:
lived incidents (`'vertical-slice: materials'`, `'vertical-slice: packaging'`),
field investigations (`'ardy verify-retarget: fresh clips onto Manny'`), and
secondary research with a named origin (`'research: State of Rigging & Animation
Tools in UE 5.8 (Unreal Fest Chicago 2026) + live 5.8 headless probe'` — which
honestly marks a reported lead *confirmed by a local probe*).

**Deviation, standard not lowered.** Version and date live inside the prose of
`detail` (*"proven on 5.8.0"*, *"Fix (proven 2026-08-20)"*, *"measured generated/
library 2026-08-17"*) rather than in typed fields, and `source` mixes strength with
origin in one free-text string. That is enough for a human reader and not enough
for the upgrade audit `provenance-on-every-entry` prescribes: nothing can select
"every probed entry older than the current release" without parsing prose. The
standard remains typed `strength`, `version`, `mode` and `date` fields; the corpus
is one interface change away from being auditable, and the discipline of writing
the stamp is already there.
