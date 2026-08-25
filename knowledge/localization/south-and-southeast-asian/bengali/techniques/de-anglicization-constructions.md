---
layer: technique
type: technique
subject: bengali
technique: de-anglicization-constructions
status: forged
laws: [every-finding-cites-an-anchor, clean-strings-stay-untouched]
shared_with: []
use_when: [reviewing Bengali strings that read as translated, rewriting calqued sentence structure, deciding whether an "is" sentence needs a verb at all]
---

# De-anglicization constructions

A Bengali string can be lexically perfect — right register, right termbase, right
digits — and still read as a translation, because the *sentence plan* is
English. These are the constructions that expose it. Each is anchored, because
"this feels translated" is taste until the finding names the construction it
violates; each also has a legitimate-use note, because the fastest way to
degrade a good catalog is to over-apply de-anglicization to strings that were
already idiomatic
([clean strings stay untouched](../../../_laws.md#clean-strings-stay-untouched)).

## BN-SOV · the verb goes to the end

**Rule.** Bengali is verb-final. Subject — object — verb, with negation after
the verb (করা যাবে না) and the question living in the verb's ending, not in
fronted word order. An English imperative or question rendered in source order
(মুছুন এই ফাইলটি এখনই?) is a calque; the Bengali plan puts the object and
adverbs first and closes with the inflected verb (এই ফাইলটি এখনই মুছবেন?).

**Procedure, not permutation.** Do not "move words until it parses" — re-plan
the sentence: identify what is acted on, front it (with টি if definite, per
BN-CLASSIFIER), stack modifiers before the verb, end on the verb whose ending
carries register and mood. Placeholders move with the phrase they belong to;
[position is not part of the skeleton](../../../_laws.md#format-skeleton-is-inviolable)
— leaving a placeholder in its English position "to be safe" is the actual
failure mode.

**Latitude.** Short verbless fragments (labels, headings) have no verb to
place. Emphasis can legitimately front a verb phrase in conversational Bengali;
in আপনি-register UI copy that latitude is almost never wanted.

## BN-ZEROCOP · present-tense "is" is silence, not আছে or হয়

**Rule.** Bengali has **zero copula in the present tense**: "X is Y" is X Y
with no verb — এটি একটি খসড়া ("this is a draft"), সংযোগ সক্রিয় ("the
connection is active"). English "is" strings pull translators toward
back-filling a verb, and both available fillers say too much:

- **আছে** asserts existence, location or possession ("there is / has"):
  ফাইলটি ফোল্ডারে আছে is correct *because it locates*. এটি একটি খসড়া আছে is
  wrong — nothing is being located.
- **হয়** asserts habitual occurrence or becoming: প্রতিদিন ব্যাকআপ হয় ("backup
  happens daily") is correct *because it is habitual*. এটি হয় একটি ত্রুটি is
  the classic word-for-word calque of "this is an error".

The reviewer's discipline is symmetrical: do not flag a correct verbless
equational sentence as "missing its verb". The absence *is* the grammar.

**Where a verb does belong.** Past and future copular sentences use ছিল/হবে
(ফাইলটি খালি ছিল, "the file was empty") — the zero-copula rule is strictly
present-tense. Negated equations use নয়/না (এটি ত্রুটি নয়, "this is not an
error"), and negated existence uses নেই (কোনো ফলাফল নেই, "there are no
results") — নেই is the idiomatic engine of every "no X found" string.

## BN-LIGHTVERB · compound verbs are conventional, not compositional

**Rule.** The productive Bengali verb pattern is noun/loanword + light verb —
করা "do", দেওয়া "give", হওয়া "become", পাওয়া "get" — and the pairing is fixed
by convention per noun, not derivable: সংরক্ষণ করুন (save), অনুমতি দিন (grant
permission), সম্পন্ন হয়েছে (has completed), খুঁজে পাওয়া যায়নি (was not found).
Choosing the wrong light verb, or translating an English verb's parts
literally, produces a grammatical sentence that no Bengali writer would form.
The passive-of-availability pattern (করা যাবে না "cannot be done", পাওয়া
যায়নি "was not found") is the idiomatic engine of error copy — prefer it to
calquing English passives word by word.

**Decision rule.** For a new action verb: check the termbase for a settled
compound first; else prefer the transliterated-noun + করা pattern the loanword
policy produces (এক্সপোর্ট করুন) over inventing a native paraphrase; and settle
one compound per action —
[one concept, one rendering](../../../_laws.md#one-concept-one-rendering)
applies to verbs as hard as to nouns.

## BN-FULLCLAUSE · translate the clause, not the words you recognize

**Rule.** A string is translated when its whole clause is Bengali under the
loanword policy — termbase nouns transliterated, connective tissue native, one
script rhythm. A sentence with bare English words stranded mid-clause ("কোনো
pending reviews নেই") is a *coverage* defect, not a style variant: it is the
literal shape of a half-finished pass, observed shipped in real catalogs. The
fix rewrites the full clause and, in the same touch, normalizes whatever else
the string carries (daṛi, digit script, canonical spellings) — one visit per
string.

**Boundary.** Do-not-translate brands and technical identifiers legitimately
stay Latin mid-sentence (attached per BN-LATINSUFFIX); the tell distinguishing
them from stranded English is the termbase: a Latin token with no
do-not-translate row is untranslated residue.

## When not to over-apply

These anchors exist to type findings, not to license rewrites. A string flagged
under none of them is not "improvable" by this technique, however English its
ancestry — fluent Bengali tolerates a wide range of orders and borrowings, and
an unanchored naturalness pass is how already-right strings get churned. If a
real defect fits no anchor here, the move is to mint the anchor, not to fix
silently.
