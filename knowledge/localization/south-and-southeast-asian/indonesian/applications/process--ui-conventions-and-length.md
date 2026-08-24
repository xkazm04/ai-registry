---
layer: application
type: application
subject: indonesian
technique: ui-conventions-and-length
status: forged
stack: process
verified_on: 2026-08-24
---

# Process — casing, typography and length measured on a real catalog

The Personas Desktop Indonesian style guide
(`personas/docs/i18n/style-id.md`, evidence base
`src/i18n/locales/id.json`, ~11,500 keys) is a worked example of turning the
ui-conventions-and-length rules into counted, enforceable per-locale
contract rows.

## ID-SENTENCE-CASE — drift documented, not imitated

The shipped file inconsistently Title-Cases short 2–3-word buttons and
headers (`"Simpan & Pindah"`, `"Edit Cepat"`, `"Ke Dasbor"`,
`"Muat Ulang Aplikasi"`) while other strings in the same file get sentence
case right (`"Simpan dan lanjutkan"`). The style guide's ruling is the
correct process shape: name the drift explicitly as *legacy debt to fix on
touch, not precedent to follow* — so a bulk reviewer citing the rule fixes
`"Simpan & Pindah"` → `"Simpan & pindah"` without needing a fresh judgment
call, and no new Title-Cased label lands.

## ID-TYPOGRAPHY — the counts that made the rulings

Every typography ruling in the guide was settled by counting the shipped
file rather than trusting the first pattern seen:

- Ellipsis: 473 literal `...` vs 211 real `…` — the *majority* pattern was
  declared wrong (legacy MT debt) and `…` enforced going forward. The lesson:
  a count settles what the convention is only when the catalog is coherent;
  an incoherent catalog needs an authority-backed ruling, here EYD plus the
  product's other locales.
- Em dash: 511 spaced `—` vs 101 legacy `--` — majority pattern confirmed
  as the rule, `--` fixed on touch.
- Quotes: 198 straight `\"…\"` vs 3 curly pairs — the 3 ruled copy-paste
  noise, not a second style.

## ID-LENGTH — the +11% number

The guide's length budget is measured, not folkloric: a direct character
count across ~10,000 matched translated key/value pairs put Indonesian at
+11% average over English, with the asymmetry the technique predicts —
single nouns at parity or shorter (`execution`→`Eksekusi`), sentences longer
from grammatical small words (`yang`, `untuk`, `dengan`, `akan`, `telah`).
Its narrow-surface rules are the technique's verbatim: single-verb buttons
(`Simpan` not `Simpan sekarang`), noun-first badges (`{count} tertunda`),
no two-verb buttons (`Simpan & pindah`), overflow flagged in review notes
rather than truncated.

## ID-VERB-SLOT confirmed

Buttons ship bare-root (`Simpan`, `Coba lagi`, `Buka monitor`, `Jalankan`),
progress strings ship `me-` + ellipsis (`"Memuat…"`), state strings ship
passive/stative forms (`"Disimpan"`, `"Dipromosikan"`), and the guide
explicitly notes that pronoun-less imperatives are the formal default, not a
register downgrade — the `Anda` register and bare-root controls coexist by
design.

## Process shape

One file per locale, holding: the casing rule with its named drift
inventory, typography rulings each carrying its occurrence counts, the
measured expansion figure, and fix-on-touch instructions a reviewer can
execute without escalation. The counts are what make the file durable — a
future pass re-litigating the ellipsis question hits the 473-vs-211 record
and stops.
