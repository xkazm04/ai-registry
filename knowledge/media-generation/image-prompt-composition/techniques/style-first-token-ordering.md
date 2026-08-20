---
layer: technique
type: technique
subject: image-prompt-composition
technique: style-first-token-ordering
status: forged
laws: [style-is-restated-not-remembered]
shared_with: []
use_when:
  - ordering the blocks of a generation prompt
  - a model obeys the first half of a prompt and ignores the rest
---

# Style-first token ordering

## The concern

Prompt order is not presentation; it is **priority under loss**. Two
mechanisms make early tokens worth more than late ones, and they bound
different model generations. First, truncation: short-window caption
encoders attend to roughly the first 77 tokens and silently drop everything
after — no error, just an image that obeyed the prompt's opening and never
saw its end. **This is a class boundary, not a universal law**: model
families built on long-context language-model encoders process hundreds of
tokens (commonly 256–512), and material placed past token 77 demonstrably
reaches the image. Hybrid pipelines that run both encoder types keep the
short window on the caption branch, so front-loading still pays there.
Second, attention weighting: even models that read the whole prompt weight
early material more heavily, so the front of the prompt is obeyed more
faithfully than the back on *every* model, not only the truncating ones.
Ordering therefore survives the encoder generation change — as a robustness
and portability practice rather than a truncation fear. A prompt ordered for
the worst window runs unchanged on every model class; a prompt that buries
the style at token 300 runs only where nothing truncates.

So ordering is a triage question: **when the model reads only the first N
tokens, which N produce the least-bad image?** The answer is stable: an
on-style image missing late subject detail is recoverable — it still belongs
to the project and can be re-run or edited. An off-style image with perfect
subject detail is unrecoverable — it belongs to no project. Therefore the
style block goes first, always.

## Procedure

Order the prompt in strictly descending priority:

1. **Rendering technique and medium** — the single phrase that most
   constrains everything else ("flat vector editorial infographic").
2. **The remainder of the style block** — palette with roles, finish, line
   quality, explicit style bans.
3. **The subject's macro-structure** — the composition-level facts (panel
   division, primary elements, their spatial relations), most important
   element first.
4. **Subject detail** — secondary elements, the invented or decorative slot.
5. **Reserved space and edge conditions** — what must stay empty.
6. **The constraint clause** — the no-text ban, last in the positive prompt
   (and duplicated into the negative prompt where one exists, which is not
   subject to the same window).

Within each block, apply the same rule fractally: the element that carries
the image's argument is stated before the elements that dress it.

On models exposing weighting syntax, use it as a *correction*, not a
structure: boost a key token the model demonstrably underweights, rather
than building a prompt whose meaning lives in its weight annotations — those
annotations do not port across models; order does.

## Decision rules

- **When a model reproduces the style and the opening of the subject but
  nothing after a certain point, suspect truncation before incompetence.**
  Confirm cheaply: re-run with only the style block plus the first subject
  element. If that renders faithfully, the model is fine and the prompt is
  too long for its window — cut or accept the loss, knowingly.
- **When targeting a mixed fleet of models, write for the smallest window in
  the fleet**: everything that must hold everywhere goes inside it;
  everything after is a bonus on the short-window models and a requirement
  on the long-window ones. One prompt, two service levels, by construction.
- **When a late instruction is genuinely critical** (an element the image is
  pointless without), it does not belong late — promote it into the
  macro-structure position, and demote atmosphere to pay for it.
- **When the constraint clause must survive on a truncating model**, do not
  move it first — that spends the most valuable tokens on a negation. Rely
  on the negative prompt (unwindowed) or the vendor's exclusion parameter to
  carry it instead.

## When not to use it

The ordering is nearly free, so there is no situation to *avoid* it — but do
not mistake it for a cure. Ordering decides what survives loss; it does not
prevent the loss. A prompt that consistently overruns its target model's
window needs a budget cut (prompt-budget-limits), not a cleverer sequence.
And on a single long-context model with no fleet ambitions, obsessing over
micro-ordering past the block level yields little; the block order is the
90% of the value.
