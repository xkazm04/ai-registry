---
layer: technique
type: technique
subject: hindi
technique: de-anglicization-constructions
status: forged
laws: [format-skeleton-is-inviolable, clean-strings-stay-untouched]
shared_with: []
use_when: [auditing machine or crowd translations for English-shaped Hindi, fixing word order and postposition placement, reviewing light-verb and passive constructions]
---

# De-anglicization constructions

The constructions that expose a Hindi string as a translation are few, specific,
and mechanical — Hindi and English disagree on head direction (SOV vs SVO,
postpositions vs prepositions) and on how verbs are built (light-verb compounds
vs single lexical verbs), so the calques repeat with high fidelity across every
machine pass and every hurried human batch. Each anchor below is written to be
citable by an auditor who found the smell and needs the rule it breaks.

## HI-SOV · the verb complex closes the clause

**Trigger:** a conjugated verb sitting mid-sentence with objects or adverbials
after it; a placeholder trailing the verb.

**Rule:** Hindi is verb-final — subject, then objects and adverbials, then the
verb complex (stem + aspect + auxiliary: सहेजा जा रहा है). A string whose verb
arrives before its object almost always preserved English order: *डाउनलोड करें
फ़ाइल* for "download the file" instead of फ़ाइल डाउनलोड करें. Placeholders move
with their grammatical role: English "Send {file} to {name}" becomes {name} को
{file} भेजें — both placeholders migrate leftward and the verb lands last. Moving
them is obligatory; the token stays byte-identical
([the format skeleton is inviolable](../../../_laws.md#format-skeleton-is-inviolable)
— position is not part of the skeleton).

**Exception:** short exclamations and afterthought right-dislocation exist in
natural Hindi speech, and headline-style fragments (labels, titles) have no verb
to place. The rule audits sentences, not fragments.

## HI-POSTPOS · postpositions trail their noun, and chain

**Trigger:** के लिए, में, पर, से, को, तक appearing *before* the noun phrase they
govern; a preposition-shaped gap where English had "for/in/on/with".

**Rule:** Hindi's relational words are postpositions — they follow the noun
phrase, which stands in the oblique case before them: इस फ़ाइल के लिए ("for this
file"), खाते में ("in the account"). The canonical MT calque strands them in
English preposition position — के लिए यह फ़ाइल — which is not awkward Hindi but
ungrammatical non-Hindi, and it is trivially searchable: a postposition at the
start of a clause, or immediately after another postposition's chain begins, is
a near-certain hit. The demonstrative obliques travel with the noun: यह → इस, वह
→ उस (इस फ़ाइल के लिए, never यह फ़ाइल के लिए).

**Exception:** none grammatical. But do not "fix" compound postpositions by
splitting them — के लिए, के बारे में, की ओर से are units; an auditor counting
words in a chain is not finding a defect.

## HI-LIGHTVERB · light verbs are the idiom, calques are the smell

**Trigger:** करना/होना/देना/लेना compounds that read stilted; MT output pairing
the wrong light verb or forcing English argument structure through one.

**Rule:** the productive way Hindi verbs a borrowed or nominal concept is a
light-verb compound: क्लिक करें, डाउनलोड करें, लोड हो रहा है, साइन इन करें. This is
the idiom, not a compromise — resist "improving" a settled compound into a
literary single verb. The defects live in the details of the pairing:

- **करना vs होना is voice.** करना builds the transitive/agentive ("आप सहेजते
  हैं"-shaped), होना the intransitive/stative ("सहेजा गया"-shaped): अपलोड करें
  (do the upload) vs अपलोड हो गया (the upload happened). MT swaps them under
  English influence — "upload completed" rendered अपलोड किया गया where अपलोड हो
  गया is the natural report of a state change.
- **English passives do not pass through जाना by default.** "The file was
  deleted" is idiomatically फ़ाइल हटा दी गई or फ़ाइल हट गई; a reflexive English
  agentless passive often wants the Hindi intransitive, not a full passive.
  Blanket X किया जाता है for every English "is X-ed" is the single strongest
  translationese marker in Hindi technical prose.
- **Compound (vector) verbs carry aspect** — दिया/लिया/गया after a stem (हटा
  दें, खोल लें, हो गया) mark completion and direction of benefit. Their absence
  everywhere reads flat and machine-made; their presence in the wrong places
  reads over-colloquial. The workable rule: completed-action confirmations take
  the vector (सहेज दिया गया, हो गया); neutral instructions stay simple (सहेजें).

**Exception:** where a native single verb fully owns the territory (खोलें, बंद
करें, भेजें, चलाएँ), do not build a light-verb compound around the English word —
ओपन करें for "open" is drift when खोलें is settled.

## HI-CALQUE · translate the move, not the words

**Trigger:** idioms, courtesy formulas, and UI phrasal conventions translated
word-for-word; "please" appearing as कृपया on every imperative.

**Rule:** English UI formulas map to Hindi *conventions*, not to glosses.
English cushions imperatives with "please"; Hindi's honorific -ें imperative
already carries the courtesy, so कृपया is reserved for genuine impositions
(errors asking the user to redo work) — कृपया before every button-adjacent
instruction is an English politeness system transplanted whole. "Are you sure?"
is क्या आप निश्चित हैं — the क्या question particle is the move English does with
inversion. Negative questions, "would you like to…" (क्या आप … चाहेंगे), and
error apologies each have settled Hindi shapes; the audit question is "is this
how a Hindi product says this?", never "are these the same words?". When the
answer is yes, the string is clean and stays untouched
([clean strings stay untouched](../../../_laws.md#clean-strings-stay-untouched))
— de-anglicization passes over already-idiomatic catalogs are where good strings
go to die.

## When not to use this

This technique audits constructions, not vocabulary — an English loanword inside
a perfectly Hindi-shaped sentence is terminology-and-loanwords' jurisdiction,
and most are correct. And run these rules only against product voice: quoted
material, user content, and deliberately English-mixed marketing registers
(where the house has recorded that ruling) are out of scope.
