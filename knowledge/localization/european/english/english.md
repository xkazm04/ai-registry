---
layer: golden-path
type: golden-path
subject: english
status: forged
use_when: [writing or reviewing English product, UI or landing copy, auditing an English source catalog before it fans out to other locales, deriving English from a Slavic or German source text, reviewing model-drafted English before it ships]
techniques:
  - variant-and-locale-conventions
  - register-and-voice
  - typography-and-capitalization
  - interference-constructions
  - false-friends-and-collocations
  - de-translationese-constructions
  - generated-prose-patterns
  - ui-and-landing-microcopy
---

# English (en)

English is the language most products ship first, and the one teams least expect to need
rules for. It reaches the page by three roads: written natively, derived from a text in
another language, or drafted by a model. Each road leaves its own marks, and almost none of
them is an error a spellchecker would catch. In a multi-locale product English is usually
the source locale as well, which raises the stakes: a vague, calqued or inconsistent English
string caps the quality of every translation made from it
([the source locale is the source of truth](../../_laws.md#the-source-locale-is-the-source-of-truth)).
The English review is the highest-leverage review in the catalog.

This subject is the mirror image of the other language subjects. They push English sentence
shapes out of Czech, German or Japanese; this one pushes source-language shapes, translation
fingerprints and generated-prose habits out of English. The mechanism is the same. Every
recurring failure is an anchored rule with a stable `EN-*` identifier, so a review finding
can name the rule it rests on instead of reporting a feeling.

## Correct is not native

Most failing English copy is grammatical. It fails on collocation (*realize a payment*), on
information order and density (four nouns chained with *of*), on register (a settings label
written like a sales letter), and on consistency (*colour* beside *optimize*). A grammar
checker is structurally blind to all of it: a false friend is a real word, a termbase
violation is correctly spelled, a register leak is a well-formed sentence. That is why the
construction rules here carry IDs exactly as the Czech anchors do. Without them, an audit that
requires every finding to cite a rule reports these strings clean, and re-running review on a
Czech-shaped English catalog changes nothing.

## Three families of tell, and the defect they share

The marks separate by origin, and the origin decides the fix.

1. **Source-language interference.** An author thinking in an article-less, case-marking or
   verb-final language leaves missing and misplaced articles, mapped prepositions (*on the
   picture*), the wrong tense for a span reaching now (*we help teams since 2019*), fronted
   objects, false friends, the source's mandatory comma before subordinate clauses, and source
   formats (`14. 9. 2026`, `25 %`). Each is individually recognisable and individually
   fixable. See interference-constructions and false-friends-and-collocations.
2. **Translationese.** Translated English carries a statistical fingerprint that survives
   perfect grammar. The features that best separate translated from original English are
   interference features: function-word contexts, part-of-speech sequences such as modal +
   *be* + past participle, explicitating connectors (*moreover* runs about seventeen times more
   often in translated English), comma chains where an original writer uses full stops, and
   calqued reflexives (Volansky, Ordan & Wintner 2015). Lexical density, the feature intuition
   points at, classifies at chance. See de-translationese-constructions.
3. **Generated-prose patterns.** Instruction-tuned models overuse sentence-final participial
   clauses (about five times the human rate), nominalizations (about twice) and phrasal
   coordination, while base models sit near human rates (Reinhart et al. 2025): the habit is
   taught by tuning, not inherent to the method. Around it cluster puffery with no fact
   attached, importance narrated instead of shown, reflexive triads, era openers and restating
   closers. See generated-prose-patterns.

A fourth defect class belongs to all three roads: **inconsistency** of variant, mechanics and
terms. It is the defect most reliably introduced when many hands, human or agent, write one
catalog in parallel.

## Declare and hold

Style authorities genuinely contradict each other on the mechanics of English:

| Choice | Positions on record |
|---|---|
| Spelling variant | US: Google developer documentation style guide (Merriam-Webster first form), Atlassian. UK: GOV.UK. Oxford spelling keeps *-ize* inside otherwise British text |
| Serial comma | Used: Microsoft, Google, Apple, Chicago. Omitted: AP and most UK news style |
| Dash | Closed em dash: Chicago, Microsoft, Google, Apple. Spaced em dash: AP. Spaced en dash: New Hart's Rules. Ranges written "to": GOV.UK |
| Punctuation at a closing quote | Inside the mark (US); logical (UK) |
| Percent | Closed `25%` in most web guides; `25 %` under SI and ISO 80000; one major guide spells "percent" on one page and uses the sign on another |
| Time of day | `3:45 PM` (Google), `10:45 AM` (Microsoft), `8:30 a.m.` (Apple), `5:30pm` (Mailchimp, GOV.UK) |
| Contractions | Used: Microsoft, Google, Apple. Negative contractions avoided: GOV.UK. Both sides cite misreading |
| Heading case | Sentence case: Microsoft, Google, GOV.UK, Atlassian. Headline case: Chicago, AP. Either, held per element: Apple |

On none of these rows is there evidence that one option performs better; a public-sector test
of heading case found no change in trust. The defect is not choosing wrongly. It is mixing. So
the first act on any English catalog is to record the declared choice per row, count the
catalog against each row ([the authority is a hypothesis](../../_laws.md#the-authority-is-a-hypothesis)),
and only then audit. A catalog with no record gets contradictory findings from every reviewer
who carries a different house guide in their head.

"International English" is not a row on that table. In the major guides, writing for a global
audience is a translatability discipline (no idioms, unambiguous dates, no Latin
abbreviations), not a spelling variant, and a variant still has to be chosen. European
institutions write British-based English; much global software writes American. Choose by
audience and record the reason.

Variant mixing is the characteristic leak of a Central European author, taught one variant at
school and reading the other every day. It is also characteristic of how audits go wrong. One
measured English catalog of a few thousand values held one genuine British cluster, one
American cluster and coin flips everywhere else, while two independent agents each read a
handful of files and reported a consistent house spelling. Each had found its own sample.
Count the whole catalog; never generalize from what a search happened to return.

## Register differs by surface

Marketing tolerates fragments, idiom, contractions and direct address. Product UI is terse,
literal, idiom-free and identical for identical actions. Legal text is faithful and formal. One
rubric applied to all three drags UI toward chattiness and legal text toward friendliness, so
a review declares the surface before it applies any register rule.

Three findings from the persuasion and readability research bound the register rules, and
each overturns a popular absolute:

- **Plain language does not cost credibility with expert readers; deleting their terms of art
  does.** Judges rate plain legal writing as more persuasive (Benson & Kessler 1987); needless
  complexity lowers the reader's estimate of the writer (Oppenheimer 2006); jargon lowers
  engagement even among informed readers (Bullock et al. 2019) and rises with *low* status
  (Brown, Anicich & Galinsky 2020). Cut buzzwords; keep the precise words a buyer writes into
  contracts and search boxes.
- **Concrete beats vague, until it is wrong.** Concrete wording raises satisfaction and
  purchase (Packard & Berger 2021), but a precise figure that proves false costs more trust
  than a round one (Pena-Marin & Bhargave 2019), and curiosity-gap vagueness helps only up to a
  point. Use the exact number when it is verifiable and will stay true.
- **"You" is conditional.** Direct address helps receptive, task-focused copy (Cruz et al.
  2017) and reads as aggressive in corrective or adversarial copy (Hussein & Tormala 2023); in
  service replies a first-person singular agent outperforms a corporate "we" (Packard, Moore &
  McFerran 2018). Address the reader in task copy; phrase errors and objections neutrally.

## Write from the brief; check fidelity before fluency

Translation carries sentence shape and noun density into the target, so English written from a
brief and a fact sheet beats English rendered from source-language prose. Where translation is
unavoidable, split the layers. Transcreate the persuasive layer (headline, tagline, call to
action, idiom, pun) from its intent, with its claims fixed; translate the functional layer (UI
strings, legal text, specifications, prices) faithfully.

Then check fidelity before fluency. Fluent output hides omissions: readers react to fluency
errors and miss adequacy errors (Martindale & Carpuat 2018), so a dropped negation survives any
review that only asks whether the sentence reads well. Asking a model for "more natural" output
does not reliably remove translationese; a separate target-side rewrite pass under an explicit
rule set does better (Li et al. 2025, known here through a secondary summary, so treat the
effect size as indicative).

## A finding never alleges authorship

Generated-text detectors misclassify non-native writers: across several detectors, about 61% of
essays by non-native English speakers were flagged as generated (Liang et al. 2023), and one
model vendor withdrew its own classifier after it caught 26% of generated text while flagging
9% of human text. Model judges asked whether a text is "slop" agree with human raters at about
chance (Shaib et al. 2025). Audiences penalise copy they are *told* is generated rather than its
surface, and blind readers match or prefer generated ads (Zhang & Gosline 2023). Yet heavy users
of models detect generated text almost perfectly (Russell, Karpinska & Iyyer 2025), and a
technical buyer is exactly that reader. Both facts lead to one discipline: every
generated-prose rule names a text property a human editor would cut whoever wrote it, and no
finding says "sounds AI-written".

## Word lists decay; claim shapes do not

Flagged vocabulary falls once it is publicised, while the aggregate stylistic shift keeps rising
and synonyms take the vacated slots (Kobak et al. 2025 and their monthly update, where the excess
use of *delves* fell from about 39 times baseline to about 8 within a year; Geng & Trotta 2025).
A vocabulary finding is therefore valid only when the fix removes the empty claim, never when it
renames it.

The em dash is the same lesson at the scale of one character. It is legitimate English
punctuation with a wide human range, and density, not presence, is the signal: human essays run
around three per thousand words with a fifty-fold spread, some models run about three times
higher and keep the habit under explicit bans (a 2026 preprint on eight human essays, so weak),
and the share of medical-preprint discussion sections containing one rose from about 4% to 20%
during 2025. A product may still declare "no em dash" and gate it. That is a house ruling,
recorded with the rule, not a fact about English.

## How the techniques divide the language

Variant-and-locale-conventions owns the declared mechanics table, the spelling variant, and
every value a formatter should render: dates, times, numbers, currency. Register-and-voice owns
who speaks to whom on which surface: address, contractions, officialese, buzzwords, hedges,
exclamation. Typography-and-capitalization owns glyphs and case: the dash system, quotes,
ranges, spacing, compounds, abbreviations. Interference-constructions carries the largest grammar
anchor set: the articles, prepositions, tenses, word order and comma habits of article-less and
verb-final source languages. False-friends-and-collocations owns word choice: cognates,
collocations, calqued idioms, section names and the one-term discipline.
De-translationese-constructions owns the fingerprint of translated text and the fidelity check
that must come before polishing it. Generated-prose-patterns owns the habits of instruction-tuned
models, framed as text properties. Ui-and-landing-microcopy owns component forms: buttons,
errors, empty states, labels, links, taglines and page titles.

When two rules claim one span, the more specific trigger owns it: a noun pile in a translated
string is EN-NOUN-PILE whether or not a model was involved.

## What this subject deliberately does not own

Any product's termbase (what *this* product calls a workspace), its voice exemplars, its format
contract, and its recorded house rulings, such as a ban on the em dash or a chosen time format.
Those are consuming-repo artifacts; this subject teaches the mechanisms they instantiate.
Persuasion strategy belongs to the marketing bundle: page structure, proof policy, positioning,
keyword strategy and the brand voice profile. Where a rule here touches proof (an unnamed
"experts agree", an uncompleted comparison), it flags the wording and stops; the proof policy
is a marketing concern. The pipeline that proves a catalog meets this standard, from extraction
through mechanical checks to anchored review, is the
[copy-quality-gates](../../craft/copy-quality-gates/copy-quality-gates.md) subject's; this subject
supplies the anchors that pipeline cites.
