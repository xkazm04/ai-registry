---
layer: technique
type: technique
subject: image-prompt-composition
technique: prompt-dialect-matching
status: forged
laws: [style-is-restated-not-remembered, cost-per-usable-output]
shared_with: []
use_when:
  - adopting a new image model into an existing prompt pipeline
  - a prompt that works on one model degrades on another
  - deciding between prose and tag-list prompt styles
---

# Prompt dialect matching

## The concern

A model does not read your prompt; it reads your prompt **through the
captions it was trained on**. Model families split into dialects along that
axis, and writing in the wrong one degrades adherence more than any
ordering or weighting trick can recover:

- **Caption-class models** were trained on short alt-text-like captions
  through a bag-of-concepts encoder. They reward **tag-style prompts**:
  comma-separated concept lists, front-loaded, using the exact vocabulary
  of their training corpus. Syntax between the tags is mostly noise to
  them; grammar does not bind attributes to subjects reliably.
- **Language-model-encoder models** were trained on long descriptive
  captions through an encoder that parses syntax. They reward **full
  natural-language prompts**: complete sentences, spatial relations,
  counts, multi-paragraph structure — and they *lose* precision when fed
  comma-soup, because the tag list reads as a degenerate sentence.
- **Community-finetuned niches** can bind a dialect even tighter: models
  trained on a tagged image-board corpus respond to that corpus's exact
  tag vocabulary and quality-tag conventions, and to nothing else as well.
- **Instruction-following multimodal models** — a language model that
  emits images, rather than an image model with a language encoder in
  front of it — read the prompt as a **brief**, not as a caption. They
  reward what a brief rewards: the artifact's type and purpose stated
  first ("a one-page infographic explaining X for first-year students"),
  then the content it must carry, then the look, then the constraints.
  They parse structure: a fielded prompt (a JSON object with `type`,
  `layout`, `style`, `content`, `constraints` keys) is a legitimate
  serialization of the same contract, and is the natural one when an
  agent, not a person, is the author. They render specified text and
  apply world knowledge to unspecified detail — which is why an
  unspecified slot is filled with a plausible invention rather than left
  blank, and why the contract must close every slot it cares about (see
  [verbatim-text-locking](./verbatim-text-locking.md)). And they expose
  **no negative channel**: exclusions are positive prose, as on the
  distilled class, and the model will otherwise helpfully "improve" the
  brief — including by returning a board of variants where one image was
  wanted, unless the brief states the output's cardinality.

The same split governs **emphasis syntax**. Parenthesis weighting,
attention multipliers and section-break markers are features of specific
runtimes over caption-class models; language-model-encoder pipelines
ignore them or read them as literal text. The portable emphasis kit is
therefore linguistic, not syntactic: **order** (earlier is stronger),
**repetition** (state the load-bearing property twice in different words),
and **dominance prose** ("only", "nothing but", "dominated by").

## Procedure

1. **Identify the dialect before writing a word.** From the model's
   documentation or its community's working prompts, classify it:
   tag-dialect, prose-dialect, or a niche vocabulary. When in doubt, run
   one probe pair — the same scene as tags and as prose — and keep the
   dialect that adheres.
2. **Maintain one style contract, two renderings.** The project's style
   block stays a structured record (technique, palette roles, finish,
   bans); the compiler renders it per dialect — a tag sequence for
   tag-dialect targets, sentences for prose-dialect targets. One source,
   two serializations; never two hand-maintained prompts.
3. **Keep emphasis portable by default.** Express priority through order,
   repetition and dominance prose in the contract itself. Runtime-bound
   weighting syntax is applied only in the per-model adapter, only as a
   measured correction, and never becomes the place where the prompt's
   meaning lives.
4. **Do not mix dialects in one prompt.** A prose prompt with a tag tail
   (or tags with an explanatory sentence) degrades both halves — the
   encoder resolves the prompt as one register, and the minority register
   is read as noise within it.

## Decision rules

- **When a proven prompt collapses on a new model**, suspect dialect before
  suspecting the model: re-render the same contract in the target dialect
  and compare before judging quality.
- **When a niche model's community publishes a tag vocabulary**, use it
  verbatim — synonyms that read identically to a human are different,
  weaker tokens to the model.
- **When a pipeline serves both dialect classes**, the adapter boundary is
  the compiler, not the author: authors write the contract once and never
  target a model directly.
- **When the target is a brief-reading model, lead with what the image is
  for, and close every slot.** The purpose line does on this class what
  the medium line does on token readers — it sets the frame everything
  else is interpreted in. Then state exact text, exact counts, the format,
  and "exactly one image": what the brief leaves open, the model fills,
  and it fills well enough that the invention is not noticed until it
  ships.
- **When emphasis syntax appears load-bearing** — removing it visibly
  changes the image — record which runtime that observation was made on;
  it is a per-runtime fact, not part of the style contract.

## Failure modes

- **The bilingual prompt.** Half prose, half tags, adhering as neither.
- **Weight-annotation prompts as source of truth.** A prompt whose meaning
  lives in its multipliers ports nowhere and cannot be reviewed as prose.
- **Dialect cargo-culting.** Copying a tag-dialect quality incantation into
  a prose-dialect model (or vice versa) because it "always helps" — it is
  dead tokens at best and a style contaminant at worst.
