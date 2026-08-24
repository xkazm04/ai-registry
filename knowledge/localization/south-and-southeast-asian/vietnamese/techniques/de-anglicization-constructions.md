---
layer: technique
type: technique
subject: vietnamese
technique: de-anglicization-constructions
status: forged
laws: [every-finding-cites-an-anchor, clean-strings-stay-untouched]
shared_with: []
use_when: [reviewing Vietnamese translations for English-shaped constructions, fixing bị/được valence in status strings, deciding word order and pronoun density in vi strings]
---

# De-anglicization constructions

A Vietnamese string can be lexically perfect and still read as a translation
because its *structure* is English. These are the constructions that expose it,
each stated as a citable rule. One of them — passive-marker valence — is not a
style matter at all: it changes what the string asserts, and an audit types it as
a meaning error, not a fluency one.

## VI-WORDORDER · noun phrases are head-first

**Trigger:** any compound or modified noun phrase, especially ones translated
element-by-element from an English compound.
**Rule:** the head noun comes first; every modifier follows. Internet Accounts →
Tài khoản Internet; logon script processing → xử lý script đăng nhập; server
name → tên máy chủ. Microsoft's guide states it flatly: the order of Vietnamese
compounds is the inverse of English. The audit heuristic: find the noun the
phrase is *about* — if it is not the first content word, the phrase is in source
order. Long English compound chains should also be broken with của or a relative
clause rather than stacked — Vietnamese tolerates far shallower modifier
nesting than English noun piles.
**Exception:** established borrowed compounds that entered Vietnamese whole
(e.g. some brand-adjacent phrases) keep their imported order; they are termbase
rows, not grammar.

## VI-COPULA · adjectives take no là

**Trigger:** any "X is ADJECTIVE" source pattern.
**Rule:** Vietnamese adjectives are stative verbs — they predicate directly.
"This file is important" → Tệp này quan trọng; "the connection is secure" →
Kết nối an toàn. Inserting là (Tệp này là quan trọng) is the copula calque, and
it is near-diagnostic of machine-assisted translation. là is correct where the
predicate is a *noun* — Đây là bản nháp ("this is a draft") — and in
cleft/emphatic constructions. The decision rule: noun predicate → là; adjective
predicate → no là; when the adjective needs grading, the intensifier replaces
the copula slot (rất quan trọng), not supplements it.

## VI-PASSIVE · bị is adverse, được is favorable — valence is meaning

**Trigger:** any passive or resultative status string — saved, deleted, blocked,
updated, approved, rejected, disconnected.
**Rule:** Vietnamese passives are built with a marker whose choice asserts how
the event affects the subject: **được** = beneficial or welcome, **bị** =
adverse, suffered. The choice is made from the *user's* point of view, not the
grammar of the source:
- Tệp đã được lưu — your file was saved (good news, được).
- Tài khoản của bạn bị khóa — your account has been locked (bad news, bị).
- A deletion the user requested: đã xóa / đã được xóa. The same deletion by an
  admin against the user: bị xóa.
The failure mode both directions: bị on a success string tells the user
something went wrong ("Tệp bị lưu" reads as "the file suffered a save"), and
được on an adverse one is unintentionally sarcastic ("your account got the
privilege of being locked"). An audit marks a wrong marker as a **meaning
error** — the string asserts the wrong valence — which outranks any fluency
finding on the same string. Neutral third option: many status strings need no
passive at all; Vietnamese happily fronts the object with a bare verb —
Đã lưu thay đổi ("changes saved") — and this is the idiomatic default for
toasts and confirmations.

## VI-PRONOUN-CALQUE · drop what Vietnamese recovers from context

**Trigger:** strings dense with "you / your / it / we" rendered one-for-one.
**Rule:** Vietnamese omits recoverable subjects, objects, and possessives.
Render the first reference, drop the echoes: "Enter your name and your email" →
Nhập tên và email của bạn (one của bạn, at most), often just Nhập tên và email.
"It will restart when it finishes" needs no nó at all. The English dummy
subject never translates: "It is raining"-type constructions drop the subject
entirely (Microsoft's guide: đang mưa). A string where every clause opens with
bạn or nó is grammatical and dead — the calque is measurable as pronoun density
against comparable native text.
**Exception:** legal and consent strings, where the explicit repeated subject is
deliberate precision — do not "improve" them to idiomatic sparseness
([clean strings stay untouched](../../../_laws.md#clean-strings-stay-untouched)
extends to intentionally heavy register).

## VI-TENSE · đã/đang/sẽ are information, not conjugation

**Trigger:** English tense mechanically mirrored — every past → đã, every
progressive → đang, every future → sẽ.
**Rule:** the aspect adverbs appear only where the time relation is *news*.
A completed-action toast keeps đã (Đã lưu — the point is that it happened);
a menu history label "Files you opened" needs none (Tệp đã mở is fine, Các tệp
mà bạn đã mở là is the calque ladder in full). "Saving…" → Đang lưu… keeps đang
because ongoingness is the message. The test: delete the marker — if the string
still says the same thing in context, the marker was transfer residue.

## Scope

These five rules cover structure. Word *choice* smells — wrong stratum, wrong
loan — belong to terminology-and-loanwords; a reviewer citing this technique
should be pointing at syntax, and every finding still names its rule ID per
[every finding cites an anchor](../../../_laws.md#every-finding-cites-an-anchor).
