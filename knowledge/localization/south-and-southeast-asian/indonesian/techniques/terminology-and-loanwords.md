---
layer: technique
type: technique
subject: indonesian
technique: terminology-and-loanwords
status: forged
laws: [one-concept-one-rendering, the-authority-is-a-hypothesis]
shared_with: []
use_when: [deciding whether an English tech term stays English or takes an Indonesian form, building or auditing an Indonesian termbase, fixing loanword drift in a catalog]
---

# Terminology and loanwords

Indonesian absorbs English tech vocabulary through two entirely different,
both-valid routes, and the single biggest source of translator drift in this
locale is mixing routes within one concept. The routes, then the decision
rules, then the traps.

**Route 1 — adapted-spelling absorption** (the KBBI standard route): the word
is respelled to Indonesian orthography and *becomes* Indonesian — not a
code-switch, the correct native word. `application`→`aplikasi`,
`feature`→`fitur`, `computer`→`komputer`, `dashboard`→`dasbor`,
`export/import`→`ekspor`/`impor`, `configuration`→`konfigurasi`,
`session`→`sesi`, `version`→`versi`, `notification`→`notifikasi`,
`template`→`templat`, `draft`→`draf`, `credential`→`kredensial`,
`connector`→`konektor`, `execution`→`eksekusi`, `click`→`klik`.

**Route 2 — unassimilated borrowing**: kept as literal English. Reserved for
proper-noun-like feature and product names, and for identifier-class
vocabulary with no naturalized form in practice (API, JSON, webhook, OAuth,
CLI, plugin in developer contexts).

**Route 3 — native coinage**: the language authority (Badan Bahasa, whose
dictionary is KBBI) also mints native equivalents. Some won the market
decisively — `unduh` (download), `unggah` (upload), both Javanese-derived and
now the ordinary UI words; `pengaturan` (settings); `pemberitahuan` alongside
`notifikasi`. Some lost decisively — `tetikus` (mouse) and `salindia` (slide)
exist in KBBI and essentially nowhere else.

## ID-ABSORB · use the absorbed form where one is established

Where an adapted-spelling form is established, raw English spelling is a
defect: `Dashboard` where `dasbor` exists, `Download` where `unduh` exists,
`export` where `ekspor` exists read as laziness, not as deliberate borrowing —
Latin-alphabet English with sprinkled Indonesian grammar is precisely what an
unlocalized product feels like. The audit is a termbase-driven scan for the
English spellings of every concept the termbase renders natively.

## ID-KBBI-CURRENT · KBBI sanctions, usage decides

The decision rule when KBBI's form and market usage diverge — a direct
application of
[the authority is a hypothesis](../../../_laws.md#the-authority-is-a-hypothesis):

1. KBBI form exists AND is current in real product usage → use it, cite KBBI
   as provenance (`unduh`, `unggah`, `dasbor`, `templat`).
2. KBBI form exists but the market ignored it → follow usage, record the
   ruling (`mouse` not `tetikus`; for developer audiences `browser` remains
   more common than `peramban`, though `peramban` is defensible for
   general-consumer copy — decide per product, once).
3. No KBBI form, no naturalized form → keep English (route 2) and record it
   on the do-not-translate list rather than inventing a respelling.

"Current in real usage" is counted, not felt: check what the major Indonesian
platforms and the shipped catalog itself use before enforcing a dictionary
row.

## ID-VERB-NATIVE · verbs are never borrowed-as-verbs

English nouns borrow; English verbs do not. `save`→`simpan`,
`browse`→`jelajahi`, `refresh`→`segarkan`, `toggle`→`alihkan` /
`aktifkan`/`nonaktifkan` (never a "toggle-kan"), `submit`→`kirim`,
`cancel`→`batal`/`batalkan`. A borrowed root that must act as a verb takes
native affixation only after full absorption — which is the test: the one
systemic exception is `klik`, so fully naturalized that `mengklik`/`diklik`
are ordinary, and it is the only word Indonesian UI uses for the concept (do
not substitute `menekan tombol`, "press the button", out of purism). If
affixing the borrowed root feels like an invention, the root is not absorbed
and the verb must be native.

## ID-TERM-SPLIT · one concept, one rendering — Indonesian's specific drift pairs

[One concept, one rendering](../../../_laws.md#one-concept-one-rendering) has
predictable Indonesian failure pairs, because English cognates offer a lazy
alternative to the natural word. Recurring drift pairs to consolidate, with
the usual winner first:

- `kemampuan` vs `kapabilitas` (capability) — MT reaches for the cognate;
  the natural word wins.
- `peristiwa` vs `acara` (event) — `acara` is a social occasion; a system
  event is `peristiwa`. Wrong-sense, not just drift.
- `tinjauan`/`tinjau` vs `ulasan` (review) — `ulasan` skews "user review /
  commentary"; approval-flow review is `tinjau`.
- `pemberitahuan` vs `notifikasi` — both valid; pick one per product.
- `berkas` vs `file` — both current; developer products often keep `file`,
  general products use `berkas`; pick once.

The consolidation signal is mechanical (two renderings of one source term);
the ruling is judgment — some pairs are legitimate distinct senses (`ulasan`
for user-written reviews AND `tinjauan` for approval reviews can coexist when
the English source genuinely has both concepts).

## ID-DNT · the do-not-translate floor

Never translated, never respelled: brand names; technical identifiers and
acronyms (API, CLI, JSON, HTTP, SQL, OAuth, JWT, SDK, URL, CPU/GPU/RAM);
protocol and format names; code identifiers, enum values, and placeholders;
units and separators carried from the source. Feature names a product treats
as proper nouns belong on the product's own list — the mechanism (a recorded,
audited list) is this rule; the entries are the house's.

## When NOT to apply

Do not retro-sweep a shipped catalog to a "better" loanword ruling without a
product decision: a coherent catalog that consistently uses the second-best
form beats a half-migrated one using both. And keep the termbase downstream —
this technique teaches the decision rules; which rendering a given product
chose for "vault" or "workflow" is the consuming repo's row, not this
subject's.
