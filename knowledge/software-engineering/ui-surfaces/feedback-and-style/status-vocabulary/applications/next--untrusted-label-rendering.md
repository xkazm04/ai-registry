---
layer: application
type: application
subject: status-vocabulary
technique: untrusted-label-rendering
stack: next
status: forged
verified_on: 2026-09-20
verified_against: next@16
---

# Next.js application — the door narrowed until it needs no policy

Measured in the `ascent` tree at HEAD `62c252dd` (Next 16.3.3, Node 24 per
`.nvmrc`). Everything this product shows about a repository is written by
a model reading that repository, so the untrusted text is the *product*,
not an edge case: a repo that wants the public report to say something
gets to write the prompt's input. The tree answers with two doors and no
sanitizer in the render path.

## The markdown door, shrunk to four constructs

`src/components/report/MarkdownLite.tsx` renders model prose and knows
exactly four things: blank-line paragraphs, `- ` bullets, `**bold**` and
`` `inline code` ``. Its header comment (`:1-18`) is in two halves, and
the second is the one to copy — *"A real markdown renderer admits links,
images, and HTML — every one an injection surface for a repo that wants
the report to say something. Four inert constructs keep the whole thing
plain text with formatting; there is no href, no src, no
dangerouslySetInnerHTML."*

Structurally there is nothing to configure: `parseBlocks` (`:26`) emits a
two-variant block type and `renderInline` (`:60`) emits text nodes plus
`strong` and `code` elements. No attribute anywhere takes an
interpolation, so the framework's own text escaping is the entire defence
and there is no allowlist to keep current. An unclosed marker falls
through as literal text by construction (`:62`), which is the honest
rendering of a construct nobody promised to draw.

The producer half is what makes this safe rather than lossy: the scan
prompt asks the model to structure its summary in those four constructs
(`:6-10`), so what the renderer drops is nothing the model was invited to
emit. The comment also records what the component replaced — a
900-character single paragraph in a drill-in, where finding, evidence and
caveat all sat at one weight — so the structure is a readability fix whose
security posture came free.

The absence is pinned. `MarkdownLite.test.tsx:44-50` feeds
`[x](https://evil.example)` and `<img src=x onerror=alert(1)>` through
the component and asserts there is no anchor and no image element and
that both strings appear as text; `:37-42` pins the unclosed-marker
fall-through. That is the right shape of test for a grammar-by-absence: a
later contributor swapping in a real engine reads as a strict improvement
to anyone who did not read the comment, and these two cases are what
stops them.

One renderer, two wrappers, no second engine:
`src/features/shared/athena/AthenaProse.tsx` delegates to it and adds only
fence-stripping (`:17-23`) for the paths that bypass the upstream block
parser — a half-written fence rendered as prose is a paragraph of raw JSON
shown to an operator. `src/components/report/DimensionDetail.tsx:52` and
`src/components/org/shared/RepoDimensionModal.tsx:163` are the other call
sites. Elsewhere the answer is plainer still: memory bodies and skill
bodies render as preformatted text, with the choice stated in each file's
header (`src/features/shared/memory/MemoryCard.tsx:5`,
`src/features/shared/skills/SkillCard.tsx:5`).

## The raw-markup door, and why it is one door

The only `dangerouslySetInnerHTML` in the tree is three structured-data
script tags — `src/app/layout.tsx:61`, `src/app/page.tsx:122`,
`src/app/about-org/page.tsx:78` — and all three call `jsonLdScript`
(`src/lib/site.ts:187-192`) *on the same line as the injection*, which is
the reviewer-visible form the technique asks for. The helper's docstring
(`:179-186`) is the argument for consolidating: each of the three sites
had previously carried a comment asserting its payload was static and
therefore safe, *"Two were"* — the third interpolated an environment-derived
base URL, so the claim was already false where it mattered, and the next
contributor to add a dynamic field would have read "safe to inline" and
had no reason to check. Three re-derived proofs replaced by one escaping
door.

## The ingestion door, which the display half does not duplicate

`src/lib/llm/provider.ts` bounds untrusted model fields on the way in,
and the split of responsibilities is explicit in its comment (`:106-116`):
the validator bounds *shape*, `cap()` bounds *size*, and neither bounds
*content trust*, so `sanitizeText` (`:124-125`) does three things at the
one point every model-supplied string passes through:

- strips ASCII control characters, the Unicode bidi overrides
  (`U+202A–202E`, `U+2066–2069` — the Trojan-Source class) and the byte-order
  mark (`:118`). The technique asks the primitive for bidirectional
  *isolation*; for text destined for a public report this tree removes the
  overrides instead, which is the stronger answer when no legitimate
  producer needs them.
- defuses the HTML-comment opener, for the reason in the next section.
- caps each field at 2000 characters (`:104`), *after* sanitising, so the
  escape expansion cannot push the result back over the bound (`:128-129`).

The cut then repairs itself: length truncation operates on UTF-16 code
units, so it can land between the two halves of an astral character and
leave a lone high surrogate — invalid text that breaks strict
re-serialisation or corrupts the persisted column rather than the layout.
`cap()` drops a trailing unpaired high surrogate (`:133-136`). This is the
clearest specimen of the obligation in the technique's geometry section.

## Untrusted text minting a marker

The identity-confusion instance here is not a colour keyed on a name. The
product maintains one sticky comment on a pull request and finds it again
by a sentinel in the body: `GATE_COMMENT_MARKER =
"<!-- ascent-maturity-gate -->"` (`src/lib/scoring/gate-comment.ts:14`),
consumed by `upsertStickyComment` at `src/lib/github/pr-gate.ts:196`. Model
prose — headline, rationale, discrepancy claim — flows into the same body.
A repository that persuades the model to emit that sequence mints a member
of a one-member vocabulary and attaches the product's own update
machinery to text it authored.

The defusing lives in both places on purpose: `defuseComment` at
`gate-comment.ts:61` for the table the gate builds, and mirrored inside
`provider.ts`'s `sanitizeText` *"so EVERY consumer — not just the gate
table — gets sanitized text"* (`:114`). That is the correct placement
argument in one clause: the marker's readers are not all renderers.

## The residual

The display half owns no geometry. `MarkdownLite` truncates nothing and
clips nothing; the only length bound is the ingestion cap, which is sized
for a database column rather than for a line. Untrusted strings that are
not model prose — repository and organisation names rendered into cells
and headings — reach the document as ordinary text nodes, correctly
escaped and unbounded in shape. Nothing here is unsafe; the line between
"safe" and "renders well against a crafted name" is simply not drawn yet.
