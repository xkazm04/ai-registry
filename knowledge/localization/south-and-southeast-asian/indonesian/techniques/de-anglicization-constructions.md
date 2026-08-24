---
layer: technique
type: technique
subject: indonesian
technique: de-anglicization-constructions
status: forged
laws: [clean-strings-stay-untouched, every-finding-cites-an-anchor]
shared_with: []
use_when: [reviewing machine-translated Indonesian for naturalness, deciding active vs passive voice in Indonesian copy, fixing relative-clause and preposition calques]
---

# De-anglicization constructions

The constructions that expose an Indonesian string as a translation. Each rule
here exists because "reads foreign" is not a finding — a finding cites the
construction by ID
([every finding cites an anchor](../../../_laws.md#every-finding-cites-an-anchor)),
and a string none of these rules flags is presumed clean and left alone
([clean strings stay untouched](../../../_laws.md#clean-strings-stay-untouched)).

## ID-PASSIVE · the passive trap runs in both directions

Formal Indonesian uses the `di-` passive substantially more than English uses
its passive — for system events, error states, and anywhere the agent is
obvious or irrelevant. `Berkas tidak ditemukan` ("file not found"),
`Perubahan disimpan` — natural, idiomatic, correct. The two traps:

- **Anglicizing direction**: forcing English active voice by manufacturing an
  agent. `Sistem tidak dapat menemukan berkas` for "the system can't find the
  file" is grammatical and bureaucratic; the natural sentence has no agent at
  all. If a draft contains `Sistem` or `Aplikasi` as a subject, ask whether
  the `di-` passive says it shorter — it usually does.
- **Over-correcting direction**: a translator taught "Indonesian likes
  passives" converts mechanically, producing agentless copy where the *user's*
  action is the point. Instructions, confirmations of user intent, and
  anything answering "what should I do?" stay active or imperative:
  `Pilih berkas untuk diunggah`, not `Berkas dipilih untuk diunggah` as an
  instruction.

Decision rule: **who the sentence is about wins.** System did/found/failed →
`di-` passive, no agent. User should act → imperative or active. Product
speaks as itself (apology, promise) → active with `kami`.

Second passive form, the one MT reliably fumbles: when the agent is a pronoun,
Indonesian uses the bare-verb "agent-focus passive", not `di-` + `oleh`:
`berkas yang Anda pilih` ("the file you selected"), never
`berkas yang dipilih oleh Anda`. Any `oleh Anda` / `oleh kamu` in a catalog is
a defect; `oleh` survives only with third-party agents genuinely worth naming.

## ID-DIMANA · `di mana` is a question word, not a relative pronoun

The highest-frequency calque in the language pair. English "a page where you
can manage connections" word-for-word becomes
`halaman di mana Anda dapat mengelola koneksi` — understood, and instantly
foreign. In standard Indonesian, `di mana` asks a question; it does not join
clauses. Repairs, in order of preference:

1. **Purpose phrase** (usually best and shortest):
   `halaman untuk mengelola koneksi`.
2. **`tempat`** when the relation is genuinely locative:
   `folder tempat berkas disimpan` ("the folder where files are stored").
3. **Restructure into two sentences** when neither fits.

Same family, same repair strategy: `yang mana` for "which" as a relative
("the option which…" → plain `yang`), `di mana` sentence-initially as a fake
discourse connective ("where this matters is…"). Grep for `di mana` and
`yang mana` in declarative strings; near-zero legitimate hits in UI copy.

## ID-YANG-CHAIN · one `yang` per clause spine

`yang` is Indonesian's universal relativizer, and English's stacked relative
clauses tempt a translator into chaining it: `persona yang menggunakan koneksi
yang dibuat oleh pengguna yang…` — three `yang`s deep, each grammatical, the
whole unreadable. Rules:

- Two `yang`s in one sentence is the review threshold; three is a defect.
- Repairs: split the sentence; convert one clause to a possessive or
  prepositional phrase (`koneksi buatan pengguna` for "the connection the user
  created"); or drop a relative English only needed for its article system —
  Indonesian's bare noun already carries "the X that is relevant here".
- Do not delete a `yang` that is doing definiteness work: `pilih berkas yang
  benar` ("choose the *right* file") needs it; `pilih yang benar` needs it as
  a nominalizer. The rule caps chains, it does not ration the word.

## ID-PREP-CALQUE · prepositions translate per construction, not per word

English prepositions map many-to-many onto Indonesian, and word-level MT picks
the dictionary head. The recurring collocations worth enforcing:

- "depends on" → `bergantung pada` (never `tergantung di` / `di atas`)
- "consists of" → `terdiri atas` (formal standard; `terdiri dari` is common
  but `atas` is the codified form — pick one per catalog and hold it)
- "different from" → `berbeda dengan`/`berbeda dari` (not `berbeda kepada`)
- "according to / in accordance with" → `sesuai dengan`
- "for free" → `secara gratis` or just `gratis` (never `untuk gratis`)
- adverb-forming "in a … way/manner" → `secara …`, not a calqued `dalam cara …`
- "on <a surface/screen/date>" → `di`/`pada` chosen by idiom, not by "on":
  `di layar`, `pada {date}`.

Enforce these as a collocation list, extended when review finds a new stable
calque — each addition is a minted anchor, which is how the list compounds.

## ID-ADALAH · the copula is optional and usually absent

Indonesian needs no verb "to be" between subject and predicate; `adalah` is a
formal-definition copula. English "X is Y" translated with a reflexive
`adalah` everywhere reads like a textbook. Use `adalah` for genuine
definitions in long-form copy; drop it in UI strings, tooltips, and status
text (`Koneksi aktif`, not `Koneksi adalah aktif` — the latter is flatly
ungrammatical with an adjective predicate, which is how this rule sometimes
graduates from style to grammar).

## When NOT to apply

These rules govern review of drafted strings; they are not a license for
unanchored rewrite sweeps. A string that is idiomatic but uses, say, an
`oleh` with a named third-party agent, or a single well-placed `yang` pair, is
clean. Flag on rule hits, not on vibes — that boundary is the entire reason
the rules carry IDs.
