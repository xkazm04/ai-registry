---
layer: technique
type: technique
subject: data-access
technique: localized-record-identity
status: forged
laws: [identity-survives-reuse, absent-guard-is-loud]
shared_with: []
use_when: [user-authored records must exist in several languages, deciding whether a new field belongs to one translation or to all of them, a list screen shows the same entry twice under different languages, adding a language would otherwise require a schema change]
---

# Localized record identity

Translating the interface is a solved and separate problem: every string a
reader sees becomes a keyed catalog entry, authored once in a source
language, resolved at runtime by preference. That discipline does not
transfer to the records the product's own users author, and trying to make it
transfer is the first mistake. A translated article is not a value of a key.
It has its own address, its own lifecycle state, its own revision history,
its own author, and it must be publishable while its siblings are still
drafts. It is a **record**, and the question is what its identity is.

## Three models, and why one survives contact with the requirement

**A column per language.** Every translatable field becomes as many columns
as there are languages. Adding a language is a schema change over every
table, and every query names every language. It dies on the requirement that
put this technique in the product: an operator adds a language, today,
without a release. It also makes per-language publishing impossible, because
lifecycle state belongs to the row.

**A sidecar translations table.** Identity stays clean — one canonical
record, N translation rows hanging off it — and the cost lands on the hottest
path the product has. Every list read joins; every list read joins *per
field*, or reassembles rows in the application. The canonical record also
acquires a privileged language by construction, which is wrong in every
market where the source language is not the primary one.

**One row per language, linked by a group identifier.** Each translation is
an ordinary row in the same table, with its own identity, its own address,
its own lifecycle state and its own revision chain, carrying two extra
columns: the language code, and a **group identifier** shared by every
translation of the same thing. Address uniqueness moves from *(address)* to
*(address, language)*.

The third model is the one that satisfies the requirements as stated, and it
is worth being precise about which requirement kills each alternative:
**adding a language is zero schema change** kills the column-per-language
model; **a list read for one language touches one table with no join** kills
the sidecar. Per-language publishing and per-language revisions then come for
free, because lifecycle state and revision pointers were already per-row.

The honest costs, priced up front: the row count multiplies by the number of
languages, so every index on the table becomes larger and less selective
unless the language column participates in it; and every read acquires a
predicate it did not have before — which is this technique's weak point, and
it gets its own section below.

**Mint the group identifier at creation and never derive it from position or
order.** The first row of a group takes a freshly minted group identifier;
converting an existing single-language store backfills each row's group to
its own identity, making every existing record a group of one. What the group
identifier must never be is the "original" row's identity used as a
*reference*, because the original translation can be deleted while its
siblings continue to exist; the group is a name for the set, not a pointer to
a privileged member
([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)).

## The rule this forces on every later feature

The model's real payload is not the two columns. It is a question that now
has to be asked of every field, relation and feature added for the rest of
the product's life:

> **Is this per-language, or per-group?**

The rule: **anything a reader sees is per-language; anything that identifies
"the same thing" across languages is per-group.** A title, a body, an
address, a summary, a lifecycle state — per-language. A categorization, a
cross-reference, a menu entry's target, an external identifier, an
analytics key — per-group.

Two worked consequences, because the rule is abstract until it is applied:

- **A categorization assignment stores the group identifier, not the row
  identity.** Assign the category once, from any language, and the assignment
  holds for every translation — including translations created next year.
  Store the row identity instead and you get one assignment per language,
  which is not redundancy but *divergence*: the moment an editor
  re-categorizes in one language, the same thing is filed under two
  categories and no query can tell which is right.
- **A reference from one record to another stores the group identifier.** A
  link then resolves to a translation in the reader's language automatically,
  and degrades to a fallback when that translation does not exist. Store the
  row identity and every link is hard-wired to the language it was authored
  in, so a reader in one language is silently thrown into another.

The same question applies to definitions, not just to data: a taxonomy's
*terms* are per-language (the label is read), while the assignment pivot
holds the term's group.

## Fallback is asymmetric, and the asymmetry is not a preference

**For a lookup by address, fall back.** The reader asked for one specific
thing; serving the default-language version beats a not-found, provided the
response says a fallback happened so the surface can label it — an
unannounced fallback is a reader silently given the wrong language with no
way to know.

**For a list, never fall back.** A list is an enumeration, and a fallback
inside an enumeration makes the same entry appear more than once: once under
its own language, and again standing in for each untranslated sibling.
Depending on how the fallback is joined it either duplicates rows or
silently changes the meaning of the result's count. The rule to state and
keep: **fallback belongs to resolution by identity, never to enumeration.**

The chain itself — requested language, then its configured fallback, then the
default — is configuration, and the response carries which link of the chain
answered.

## The weak point: an invariant nothing enforces

Every read against a localized table must carry a language predicate. That
sentence is a correctness invariant, and in most implementations of this
model it is carried by **prose in a contributor document and nothing else**:
no type distinguishes a language-scoped read from an unscoped one, no rule in
the linter matches the query builder's shape, no test fails when the
predicate is missing. This is the technique's honest defect and it should be
named as one rather than assumed away.

It is dangerous specifically because of *where* it hides. A missing predicate
is invisible in the only environment most of this code is written in — the
single-language installation — and the defect ships to exactly the customers
who adopted the second language. The absent guard is silent at precisely the
population it exists to protect
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)).

What enforcement actually looks like, strongest first:

1. **Make omission unrepresentable.** The read surface for localized records
   takes the language as a required argument of every operation — no default
   parameter, no ambient value picked up from the request. A caller that does
   not know which language it wants has found a design question, not an
   inconvenience. This is the only enforcement that scales, and it works only
   if that surface is the sole door to those tables.
2. **A fixture that would catch it.** Every list-read test runs against a
   fixture that contains a second language for every record, and asserts the
   result count. A missing predicate changes a count from N to 2N, which is
   the loudest possible signal and costs one fixture.
3. **A sweep, where raw statements survive.** Enumerate the statements that
   name a localized table and assert each mentions the language column. Crude,
   defeated by fragment assembly, and still worth more than nothing.

What is *not* enforcement: a default value on the language column. A default
makes unscoped writes land somewhere plausible, which removes the crash that
would have exposed the unscoped read.

## When not to reach for this

- **One language, forever.** The two columns are cheap; the discipline above
  is not. Do not pay for it speculatively — but do note that the migration
  into it is a table-level shape change on every content table, which is not
  cheap either, so "forever" should be a decision and not an assumption.
- **Translations that must stay locked to the source.** Regulated text with a
  single approved version, where a translation may not be published or
  revised independently, wants the sidecar model: the point there is that the
  translation is *not* an independent record.
- **Machine translation at read time.** If nothing is stored per language,
  there is no identity question — and no per-language lifecycle either, which
  is the trade being made.
