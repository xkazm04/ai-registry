# Anchored model review - the checklist, the finding record, the loop

The mechanical checker covers what a regex can prove. Everything else in the `english`
subject is judgment: collocation, articles, register, transcreation, specificity. A model is
useful here only when its judgment is anchored - asked a binary question tied to one rule ID,
required to quote the span, and dropped when it cannot. "Is this good English?" or "does this
sound generated?" produces agreement near chance and churn on clean strings.

## 1. Build the checklist from the subject, not from memory

Resolve the `english` subject through the registry's `knowledge/localization/index.json`
(`subjects.english.file`, then its `techniques/` directory). For each rule the scope can
trigger, turn the rule's **Trigger** and **Rule** lines into ONE yes/no question whose "yes"
means a defect. Take the wording from the technique file; the seed table below shows the
shape and is overridden by the subject wherever they differ. A rule ID that is not in the
subject is not asked.

Select by string class so the reviewer is not handed 90 questions per string: a button gets
the UI questions, a hero paragraph the persuasive and construction questions, an error the
error questions.

| rule | binary question (yes = defect) | MQM path | usual severity |
| --- | --- | --- | --- |
| EN-ARTICLE | Does a singular count noun in running text lack a determiner it needs? | fluency/grammar | minor-major |
| EN-ARTICLE-DEM | Is "this/these" used on first mention of something not in view? | fluency/grammar | minor |
| EN-PREP | Is a preposition the one the source language maps, not the English one? | fluency/grammar | minor |
| EN-PERFECT | Does a state reaching now use the simple present or past instead of the present perfect? | fluency/grammar | major |
| EN-PROGRESSIVE | Is a standing feature described in the progressive ("is supporting")? | fluency/grammar | minor |
| EN-ORDER | Is new information fronted, or emphasis carried by source-language word order? | style/unidiomatic | minor-major |
| EN-COMMA-THAT | Is there a comma before a restrictive clause or a trailing because/if? | fluency/punctuation | minor |
| EN-COLLOCATION | Is a verb-noun pair one no native writer uses ("realize a payment")? | style/unidiomatic | major |
| EN-IDIOM-CALQUE | Is an idiom translated word for word? | style/unidiomatic | major |
| EN-FALSE-FRIEND | Given the context, is the cognate used in its source-language sense? | accuracy/mistranslation | major |
| EN-CONNECTOR | Does an explicitating connector (moreover, thus, furthermore) sit in web or UI copy? | style/register | minor |
| EN-MODAL-PASSIVE | Is "can/must/should be + participle" used where an imperative or active verb works? | style/unidiomatic | minor |
| EN-SENTENCE-SPLIT | Is a comma chain carrying several ideas that want separate sentences? | style/awkward | minor |
| EN-NOUN-PILE | Is an action buried in a nominalization chain? | style/awkward | minor-major |
| EN-YOU | Does task or benefit copy talk about "the user" instead of addressing the reader? | style/register | minor |
| EN-WE | Does an error or status message say "we"? | style/register | minor |
| EN-ACTIVE | Is the actor hidden when it matters who acts? | style/unidiomatic | minor |
| EN-PLEASE | Is "please" used where nothing inconvenient is asked? | style/register | minor |
| EN-JARGON | Is a corporate buzzword used where a plain verb exists (keeping terms of art)? | style/register | minor |
| EN-PUFFERY | Does the sentence stay true for any product in the category (swap test)? | style/unidiomatic | major on money pages |
| EN-SYNONYM-SWAP | Does a proposed fix rename a flagged word instead of removing the empty claim? | (applies to fixes) | reject the fix |
| EN-SIGNIFICANCE | Is importance narrated instead of the consequence shown? | style/unidiomatic | minor |
| EN-COPULA | Is "serves as / boasts / features" used for a plain is/has? | style/unidiomatic | minor |
| EN-VAGUE-ATTRIBUTION | Is a claim attributed to unnamed experts, studies or teams? | style/unidiomatic | major (proof policy is marketing's) |
| EN-INCOMPLETE-COMPARISON | Is a comparison missing its baseline ("2x faster")? | accuracy/ambiguous | major |
| EN-TRIAD | Can the weakest item of a three-item list be deleted without losing information? | style/awkward | minor |
| EN-FALSE-CONTRAST | Does "not X, but Y" deny something this audience does not believe? | style/unidiomatic | minor |
| EN-CLOSER | Does the text end by restating instead of giving the next step? | style/awkward | minor |
| EN-WHETHER | Does "Whether you're X or Y" lead to the same content for X and Y? | style/unidiomatic | minor |
| EN-TEMPLATED-GRID | Could two or more cards swap titles without anyone noticing? | style/unidiomatic | major on money pages |
| EN-STACCATO | Is there more than one mic-drop fragment run on the page? | style/unidiomatic | minor |
| EN-BUTTON | Does a button fail to start with a specific verb plus object or outcome? | style/unidiomatic | major |
| EN-CTA-PERSON | Does one flow mix "my" and "your" in CTAs? | terminology/inconsistent | minor |
| EN-ERROR | Does an error fail to say what happened and what to do, or blame the reader? | accuracy/omission | major |
| EN-EMPTY-STATE | Does an empty state fail to say why and offer one first action? | accuracy/omission | minor |
| EN-LABEL | Is a placeholder the only label of a field? | design/usability | major |
| EN-TAGLINE | Does the hero line fail the name-swap test? | style/unidiomatic | major |
| EN-LIST-PARALLEL | Do list items mix grammatical forms? | style/awkward | minor |
| EN-CONTRACTION | Does one surface mix contracted and full forms? | locale-convention | minor |
| EN-SERIAL, EN-QUOTE-PUNCT, EN-DATE, EN-TIME, EN-CURRENCY, EN-NUMERAL, EN-RANGE, EN-COMPOUND, EN-CAPITALS | Does the string break the variant's or the contract's declared mechanic? | locale-convention | minor |
| EN-FIDELITY | (translated strings only) Is a negation, number, condition or qualifier lost or changed? | accuracy | critical |
| EN-TRANSCREATE | Is a persuasive string rendered literally where its intent should be rewritten? | style/unidiomatic | major |

Severity is arithmetic, not mood: weights neutral 0, minor 1, major 5, critical 25,
normalized per word. The same finding in a pricing-page headline outranks it in a settings
tooltip; the project's money-page list (overlay) decides where 100% review applies.

## 2. The finding record

Every finding is one line:

```
key · "span" · EN-ID · MQM path · severity · minimal fix
landing.hero.lead · "fused into one contribution index of the MPs of the 10th term" · EN-NOUN-PILE · style/awkward · major · "combined into one index for the current parliament's MPs"
```

Drop, without discussion, any finding that:

- cites no rule ID, or an ID that is not in the `english` subject;
- quotes no span, or a span that is not in the string verbatim;
- quotes a span that occurs more than once in the string - the reviewer must widen it until it
  occurs once (word by word; character by character in scripts written without spaces);
- proposes a fix that replaces the flagged word with a synonym (EN-SYNONYM-SWAP) - a claim word
  the fix keeps while it removes another is retained, not swapped;
- proposes a fix that adds, drops or renames a placeholder or tag;
- alleges authorship ("sounds AI-written") - a finding names a text property, never a writer;
- rests on a detector score or a model's "sounds generated" verdict (EN-DETECTOR);
- sits on a key the contract marks `keys.locked` or `keys.preserved`.

A minimal fix changes the span and nothing around it. A clean string gets no record.

### Truth is not a language finding

The review measures one thing: how far the English is from what a native writer would put on
the page. A rule judges how a claim is **worded** - EN-VAGUE-ATTRIBUTION flags "experts agree",
a vocabulary rule flags an empty "seamless". Whether the claim is **true** is a different
question no EN-* rule can decide: two pages naming different plans, a privacy promise the
product may not keep, an unsourced test percentage, a renamed product.

A reviewer who notices one records it outside the finding list, as one line in a
**fact-check notice** (`key · "span" · what contradicts it or what source is missing`), and
does not repair it. The notice is not vetoed, not sampled 2-of-3, and not counted in
`given`, `kept`, repairs, escalations or any agreement figure: mixed in, it inflates every
number with items only the product owner can settle. It goes to the owner after the language
report.

### The veto runs these drops, not a reader

Save the reviewer's findings as JSON - an array of
`{ key, span, rule, mqm, severity, fix, reason, file?, line? }` - and run (a string extracted
without a key, such as a module-constant meta description, is named by `file` and `line` with
an empty `key`):

```
node ${CLAUDE_SKILL_DIR}/scripts/copy-check.mjs --veto review.json [--registry <registry>]
```

It resolves each key against the strings the contract's sources hold, applies the veto rules
of `scripts/lib/veto.mjs` in order (V-SHAPE, V-UNKNOWN-RULE, V-AUTHORSHIP, V-UNKNOWN-UNIT,
V-UNIT-AMBIGUOUS, V-LOCKED-UNIT, V-SPAN-NOT-VERBATIM, V-SPAN-AMBIGUOUS, V-ACCEPTED-TERM,
V-SKELETON, V-NOOP-FIX, V-SYNONYM-SWAP, V-RULE-GUARD), and prints the kept findings, each with
its unique `anchor`, plus every suppressed one with its veto id and reason. It writes nothing.
V-RULE-GUARD replays the checker's executable guards (see [rules.md](rules.md)) against model
findings that cite the same rule: a false positive recorded once is vetoed on every later run.
Report `given`, `kept` and `counts` beside the review's coverage line. When a human rejects a
finding the veto kept, and the rejection has a recognizable shape, the shape is a new veto or
guard - that is how the layer grows (copy-quality-gates/anchored-model-review).

## 3. Who reviews

- **Fresh context or a different model family than the writer.** A model prefers text it
  recognizes as its own; a reviewer that drafted the copy, or shares the drafting context,
  is not a reviewer. Pass only: the strings with keys and call-site role, the contract, the
  termbase, the exemplars, and the checklist. Never the writer's reasoning.
- **Blind to authorship**, and for A/B comparisons run in both orders.
- **Bulk sweeps take 2-of-3**: run three independent samples and keep a finding only when at
  least two report the same rule on the same span. There is no determinism at temperature 0,
  and over-correction is the documented failure of model correctors.
- **Money pages get a human** calibrated on the checklist; a variant-native editor for
  nativeness, the termbase owner for terms. Review on the rendered page when possible: a
  spreadsheet hides noun/verb ambiguity ("Order", "Close").

## 4. Repair once, on flagged spans

1. Apply the minimal fixes for critical and major findings; mechanical minor fixes
   (typography, casing) too; leave judgment minors noted.
2. Touch nothing else. Clean strings stay untouched; drive-by rephrasing is regression.
3. Re-run `copy-check` on the changed strings - a repair must not introduce a mechanical error.
4. Re-run the review on the repaired strings ONCE, with a fresh reviewer, and split what it
   raises. **Repair stability** - findings on text the repair wrote, or proposing to revert
   it - must be zero. **Panel recall** - new findings on text the repair did not touch - is
   expected above zero and is not a failed repair.
   A string that flips A to B to A is frozen at its current value and escalated to a human;
   a second self-refinement round without new anchors degrades output.

## 5. Calibrate the reviewer

- **Gold-set edit rate.** Keep 20-50 strings the team has already reviewed as clean
  (`docs/i18n/exemplars-en.md` is the seed). Before trusting a reviewer configuration, run it
  on the gold set: its edit rate there is its false-positive rate, and the target is about
  zero. A reviewer that "improves" gold strings is tuned wrong - tighten the checklist, do not
  lower the bar.
- **Acceptance rate per rule.** Log accepted vs rejected findings per rule ID. A judgment rule
  accepted below 50% over 20 findings gets its question rewritten or leaves the checklist.
- **Promotion to the gate.** A pattern moves from review into the mechanical checker only as
  a regex with a counted precision of at least 95% on this catalog, and from warning to error
  only once its existing occurrences are zero (the baseline makes that a ratchet).
- **Coverage is reported.** A review states how many strings it was given and how many it
  judged; a short batch is re-run from the current catalog, never from a stale snapshot.
