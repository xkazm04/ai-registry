---
layer: technique
type: technique
subject: i18n
technique: encoding-corruption-ratchet
status: forged
laws: [gate-sees-target, deletion-is-not-repair, count-carries-predicate]
shared_with: []
use_when: [a locale renders as punctuation soup while every parity board is green, a repaired locale file re-corrupts on a later unrelated edit, choosing a per-file baseline over a hard zero for a defect backlog]
---

# Encoding corruption ratchet

Every other gate in this subject reads **structure**: does the key exist,
does its value differ from the source, does the placeholder set match, does
the file parse, does the generated key type still compile. A catalog file
opened once in the wrong character encoding and saved back passes all of
them unanimously and is nonetheless unreadable to the only people who will
ever read it. That is the defect class — text that is **structurally
perfect and visually garbage**. Key parity is exact. Value parity is
satisfied, because the values are certainly not identical to the source any
more. Placeholders survive untouched; they are ASCII. The type checker is
blind by construction, the corruption living *inside* a string value where
every value has the same type. Every one of those gates is observing the
shape of the catalog while the thing it exists to protect is the text
inside it — the
[proxy diverging exactly where it matters](../../../_laws.md#gate-sees-target).

## How the corruption is made, and why it comes back

Text stored in a multi-byte Unicode encoding is read by a tool that assumes
a legacy single-byte page: an editor with a stale default, a spreadsheet
round-trip, a vendor's translation export, a shell redirect on a host whose
console codepage is not Unicode. Each *byte* of a multi-byte character is
taken for a whole character. Saving re-encodes each of those as Unicode,
and one accented letter is now two or three characters of punctuation soup.
The file grew, and it is still perfectly well-formed.

Two properties make this worse than an ordinary defect:

- **It is invisible to the team.** In most products the source language is
  effectively ASCII, so the source catalog cannot be corrupted this way and
  the source-locale build looks flawless. The defect is observable only
  from a locale nobody on the team reads — the same asymmetry that makes
  hardcoded strings survive review, one layer deeper.
- **It is re-introducible in one save.** A file repaired by hand is not
  repaired permanently. The next edit that touches a completely unrelated
  key in that file, made through the same misconfigured tool, re-corrupts
  every accented value in it. Any team that treats repair as a project with
  an end will discover that already-repaired locales have quietly regressed
  behind them. The check is therefore not a one-off cleanup script; it is a
  standing gate on every change, forever.

Detection and repair are wildly asymmetric in cost — the inverse byte
mapping recovers most cases mechanically, but doubly-corrupted text and
text whose original encoding is uncertain need a native reader or a
re-translation — and that asymmetry is the entire reason the enforcement
shape below is a ratchet rather than a threshold.

## Detection: the character pair legitimate text never writes

Do not try to detect "text that looks wrong" — no scanner can, and a
whitelist of expected characters per language is a maintenance burden that
fails on the first loan word. Detect the **mechanical signature** instead.

The byte-splitting produces a fixed shape: a character from the legacy
page's **accented-Latin band** (the bytes that lead a multi-byte sequence)
immediately followed by a character from that page's **punctuation,
currency and symbol band** (the bytes that continue one). The rule is that
adjacency, with no separator between them.

Two refinements the shape needs to be complete. There is more than one
legacy page: the Western European and Central European pages disagree about
which accented letters and which symbols occupy those bands, so a product
shipping Central European locales must include both pages' bands or it will
miss the corruption in exactly the locales that have the most of it. And
the **replacement character** — the glyph a decoder emits when it knows a
byte sequence was invalid — belongs in the same rule as a standalone match.
It is the other half of the same failure: one signature catches a decoder
that silently guessed wrong, the other catches one that admitted defeat.
Both end up in the reader's field of view.

Its negative space is what makes it usable:

- **A lone accented character is not flagged.** That is just text, in every
  Latin-script language.
- **A lone symbol is not flagged.** That is just a price, a quote mark, or
  a degree sign.
- **Legitimate orthography never abuts the two.** An accented letter is
  followed by a letter, a space, or ordinary punctuation. No language sets
  an accented capital directly against a currency sign, a typographic
  quote, a non-breaking space or an inverted question mark.
- **Scripts outside the Latin band cannot produce the lead character at
  all.** A logographic script and a connected right-to-left script live far
  above the single-byte page, so clean text in them can never match. When a
  file in one of those scripts *is* corrupted, the same two bands produce
  an even denser signature, so one rule covers every script the product
  ships.
- **Escaped code points cannot match either.** A catalog that writes its
  non-ASCII content as numeric escapes is immune to the whole defect class
  and also invisible to the check — which is a legitimate hardening choice
  for a small, stable catalog and an unreadable one for a large translated
  catalog a human has to review.

The rule is a signature, not a proof, and it will one day flag a string
that is genuinely fine. When it does, the answer is the baseline below —
**never a widened character class**. Loosening the classes to silence one
string blinds the check in every file at once, which is the trade that
converts a working gate into decoration.

## The ratchet: a baseline nobody may exceed

A product that discovers this defect discovers it at scale — hundreds of
occurrences across several locales, each needing a reader of that language.
A hard zero on day one blocks every unrelated change until the backlog is
cleared, and a gate that blocks everything gets removed within the week;
removing it converts a now-visible defect class back into an invisible one
([deletion is not repair](../../../_laws.md#deletion-is-not-repair)). The
enforcement shape that survives is a ratchet with four states.

**A per-file baseline, committed as data.** One reviewed number per file,
alongside the check, in version control — so raising it is a diff somebody
must approve and explain, not a runtime argument or an environment
variable. The number states its predicate
([a count carries what was counted](../../../_laws.md#count-carries-predicate)):
occurrences of the signature, not corrupt values, not corrupt keys, and per
file, not per locale. A baseline whose unit is ambiguous ratchets in the
wrong direction the first time someone recounts.

1. **Above baseline — fail.** New corruption entered, and the message names
   the file, the count, and the ceiling it broke. This is the state the
   gate exists for, and it fires on the change that caused it rather than
   in a report a month later.
2. **At baseline — pass, with the debt named.** The pass message lists the
   remaining count per file. Known debt that is never printed becomes debt
   nobody remembers, and the pass line is the only place a reader of that
   locale ever meets the number.
3. **Below baseline — pass, and print a reminder to tighten.** This is the
   state teams forget, and forgetting it is what makes ratchets rot: the
   repair lands, the ceiling stays where it was, and the file now carries
   headroom that new corruption can occupy silently for months. A drop is
   the *only* moment anyone has the context to lower the number, so the
   gate asks for it at exactly that moment — and the tightening itself is a
   named, explicit operation the check offers, run deliberately after a
   repair, never as an automatic rewrite of the file it is being judged
   against.
4. **The shipping lane — hard zero, no baseline at all.** At least one
   catalog reaches every reader no matter which locale they chose: the
   source catalog, which fallback merging places underneath all the others.
   Corruption there is not one locale's problem, it is everyone's, so that
   file gets no allowance whatsoever. The same reasoning promotes any other
   always-delivered form — a bundled artifact, a generated payload, a
   section that preloads unconditionally — into the same lane. Two lanes,
   two rules: tolerate debt where it is being worked off, tolerate none
   where it is served.

Bind the check to the same door as the rest of the catalog's gates — the
commit or push that touches locale content — and to the pipeline as a
backstop. Like every gate in this subject it must distinguish "checked,
found nothing" from "matched no files"; a run whose glob went stale is an
error, not a clean bill.

## When this is not the technique you want

This gate answers one question: *are the bytes of this catalog intact*. It
says nothing about whether the translation is good, whether the locale is
complete — that is [completeness-gates](./completeness-gates.md) — or
whether the text is set legibly once it renders, which is
[script-aware-presentation](./script-aware-presentation.md). And a locale
whose corruption backlog is large enough to be user-visible should not be
riding a baseline to production at all: withhold it with the
[incomplete-bundle-kill-switch](./incomplete-bundle-kill-switch.md) and
work the backlog off out of the reader's view. The ratchet is for debt a
reader can tolerate meeting; the kill switch is for debt they cannot.
