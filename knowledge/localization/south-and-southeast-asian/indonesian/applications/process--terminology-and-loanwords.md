---
layer: application
type: application
subject: indonesian
technique: terminology-and-loanwords
status: forged
stack: process
verified_on: 2026-08-24
---

# Process — terminology and loanwords in a shipped 11,500-key catalog

How the Personas Desktop Indonesian locale (`personas` repo,
`src/i18n/locales/id.json`, ~11,500 keys as of 2026-07-09) realizes the
loanword rules, documented in its per-locale style guide
`personas/docs/i18n/style-id.md`. The guide was derived from the shipped,
translated three-quarters of the catalog by counting occurrences — the
authority-is-a-hypothesis discipline executed literally.

## ID-ABSORB / ID-KBBI-CURRENT in the wild

The catalog's absorbed-form spine is exactly the technique's route 1:
`komputer`, `klik`, `dasbor`, `ekspor`/`impor`, `konfigurasi`, `sesi`,
`versi`, `kredensial`, `konektor`, `eksekusi`, `notifikasi`, `draf`,
`templat`. Its route-2 list is the product's borrowed feature names (`Lab`,
`Cockpit`, `Twin`, `Brain`, `Director`, `Deployment` as section noun) plus
the glossary's do-not-translate identifiers (API, CLI, JSON, webhook, OAuth,
…). The split ruling worth studying: **deployment** ships as borrowed
`Deployment` for the tab/section name but native `penerapan` for the act in
body copy (`"Penerapan gagal"`) — one English concept, two Indonesian
renderings, legitimate because the two senses (proper-noun surface vs.
action) are distinct concepts, and because the ruling is written down in the
style guide.

## ID-TERM-SPLIT drift, counted

The style guide's fix-list is a live record of the technique's drift pairs,
each settled by occurrence count in the shipped file:

- `kemampuan` (26) vs `kapabilitas` (19) for *capability* — consolidated on
  `kemampuan`; `kapabilitas` declared fix-on-sight.
- `peristiwa` (162) vs `acara` (27) for *event* — `acara` is the
  wrong-sense social-occasion word; fix-on-sight.
- `tinjauan`/`tinjau` (150) vs `ulasan` (55) for *review* — consolidated on
  `tinjauan`, the term used in the higher-stakes approval flows.
- *skill* vs *capability* collision: `skill` kept borrowed lowercase (~17
  instances) to stay lexically distinct from `kemampuan`, while two stray
  keys shipped `Keahlian` and `Keterampilan` — a three-way split of one
  concept, scheduled for consolidation on the borrowed form.

## ID-VERB-NATIVE confirmed

The catalog borrows zero verbs: `jalankan` (run), `simpan`, `jelajahi`,
`segarkan`, `alihkan`; the noun *run* is rendered `proses`/`eksekusi` rather
than left bare English. The one absorbed verb is `klik` with normal
inflection (`mengklik`), matching the technique's single systemic exception.

## Process shape

The pipeline: `docs/i18n/glossary.md` (product-wide termbase) →
`docs/i18n/style-id.md` (locale contract, counts, fix-list) → translation
and review passes that cite both. Drift findings flow back into the style
guide as new counted rulings rather than being fixed ad hoc — the mint-the-
anchor loop, run at per-locale scope.
