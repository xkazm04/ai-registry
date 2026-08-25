---
layer: technique
type: technique
subject: indonesian
technique: ui-conventions-and-length
status: forged
laws: [the-source-locale-is-the-source-of-truth]
shared_with: []
use_when: [writing or reviewing Indonesian control labels and headings, budgeting layout for Indonesian strings, choosing verb forms for buttons vs status text]
---

# UI conventions and length

The conventions that make Indonesian chrome read native: casing, the
affix-per-slot system for controls, and the length profile a layout must
budget for.

## ID-SENTENCE-CASE · title case does not exist

Indonesian has no title-case convention. Every label, button, heading, tab,
and menu item is sentence case: first word capitalized, then only proper
nouns and `Anda`. `Simpan perubahan`, `Muat ulang aplikasi`, `Ke dasbor` —
never `Simpan Perubahan`, `Muat Ulang Aplikasi`. English Title Case bleeding
into 2–3-word Indonesian labels is the single most frequent mechanical error
a token-for-token translation makes, because the model copies the source's
capitalization pattern instead of re-deriving the target's. The audit is
cheap: any multi-word label whose non-initial common nouns are capitalized is
a defect. (Single-word labels are moot; capitalized borrowed feature names
mid-label are the proper-noun exception working correctly.)

Source: EYD capitalization rules reserve mid-sentence capitals for proper
nouns and terms of address; no published Indonesian style authority defines a
title case.

## ID-VERB-SLOT · bare root on the control, `me-` in progress, `di-`/`ter-` when done

Indonesian's affix system maps one-to-one onto UI verb slots, and using the
wrong slot's form is how a catalog betrays gerund-for-imperative confusion:

- **Control (button, menu item) → bare-root imperative**: `Simpan`, `Hapus`,
  `Unduh`, `Kirim`, `Batal`. Never the `me-` form: `Menyimpan` on a button
  is "saving/to save", a description where a command belongs. Transitive
  suffixes stay when they are part of the verb (`Batalkan`, `Aktifkan`,
  `Jalankan` — the suffix is not the prefix; only `me-` marks the
  non-imperative).
- **In-progress status → `me-` form + ellipsis**: `Menyimpan…`, `Memuat…`,
  `Mengunduh…` — the active indicative is exactly right for "Saving…".
- **Completed state → `ter-` or `di-` passive**: `Tersimpan` (saved,
  state), `Disimpan` (was saved, event), `Diunduh`, `Selesai` for generic
  completion. `ter-` reads as resulting state, `di-` as the action's
  completion; both are natural, pick per string and keep parallel states
  parallel.
- **Noun slots (tabs, section titles) → nominalization or bare noun**:
  `Pengaturan` (settings), `Pengunduhan` only where the *process* is meant;
  prefer the shorter bare noun when one exists.

Decision rule for a translator holding an English "-ing" or bare-infinitive
source string: identify the slot first, then pick the affix — the English
surface form is noise
(the same discipline as
[the source locale is the source of truth](../../../_laws.md#the-source-locale-is-the-source-of-truth)
read in reverse: the source fixes the *meaning*, never the target's
morphology).

## ID-LENGTH · gentle expansion, unevenly distributed

Indonesian runs close to English on short labels and roughly 10–15% longer
across full sentences — a measured catalog-scale average sits near +11%. The
distribution matters more than the average: absorbed single nouns are often
the same length or shorter (`Eksekusi`, `Notifikasi`), while sentences grow
because Indonesian spends small grammatical words English omits or contracts
(`yang`, `untuk`, `dengan`, `akan`, `sudah`/`telah`). Budget rules:

- **Buttons**: single dominant verb over a verb phrase — `Simpan`, not
  `Simpan sekarang`, unless "now" disambiguates a real now-vs-later choice.
  Never stack two verbs; where English does (`Save & Switch`), keep one
  dominant verb and the shortest connector (`Simpan & pindah`).
- **Badges, tabs, counts**: lead with noun or number, drop connectives —
  `{count} tertunda`, `Kredensial (3)`, not `Ada {count} yang tertunda`.
- **A string that still overflows is flagged, never silently truncated** — a
  truncated Indonesian string reads as a typo, not a design choice, and a
  too-small surface is a source/layout defect to surface, not a local
  workaround.

## ID-TYPOGRAPHY · punctuation and number facts

- Ellipsis is `…` (U+2026), never `...`; it attaches directly to the word
  (`Memuat…`).
- Quotes are plain straight doubles, used to wrap literal user-supplied
  values, not for emphasis. No guillemets, no low-quotes — standard
  orthography has no such tradition.
- Em dash `—` with spaces both sides for parenthetical breaks; fix legacy
  `--` on touch.
- Numbers invert English: decimal comma, thousands period (`1.234,56`).
  Dates read day-month-year. Both are precisely why numeric and date
  formatting stay in runtime formatters — a hand-formatted number in a
  translated string is wrong in one locale or the other by construction.
- No diacritics in standard spelling; an accent mark in Indonesian output is
  almost always MT hallucination from Malay, Dutch, or French cognates.
- LTR Latin script, ordinary ASCII spacing: no bidi marks, no narrow
  no-break spaces before punctuation, nothing CJK. A layout engineer owes
  Indonesian nothing exotic — only the length budget above.

## When NOT to apply

ID-VERB-SLOT governs product chrome. Conversational copy — onboarding
dialogue, assistant messages, long-form help — uses full natural sentences
where `me-` forms are simply correct grammar, and forcing bare roots there
produces robot-speak. And ID-LENGTH's averages are planning numbers, not
per-string verdicts: a single string 40% longer than its source can be the
right translation.
