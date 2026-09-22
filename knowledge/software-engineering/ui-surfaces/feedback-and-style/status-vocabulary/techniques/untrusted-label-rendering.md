---
layer: technique
type: technique
subject: status-vocabulary
technique: untrusted-label-rendering
status: forged
laws: [one-validation-door]
shared_with: []
use_when: [deciding whether a rendered string is repo-authored, a pill hue keyed on a user-typed name, a crafted name breaks the layout, choosing a markdown renderer for text a model wrote, untrusted prose flows into a channel carrying the product's own marker, bounding the length of a model-supplied field]
---

# Untrusted label rendering

The same badges, cells, and headings that render closed-vocabulary labels
also carry text the repo did not author: entity names typed by users,
titles imported from other systems, summaries written by a model. The
ownership test is the **author**, not the surface — if any part of a
rendered string came from outside the repo, this technique applies to it,
however small the pixel footprint. Small surfaces are where the guard is
most often skipped, because a name in a badge "obviously" is not a
document.

## Escape by default, at the primitive

Rendering untrusted text as ordinary text nodes — which every mainstream
UI framework escapes — is already safe, and needs no sanitizer, no
helper, and no review. So the display primitives (badge, cell, tooltip,
heading) accept **text, never markup**, and safety becomes a property of
the rendering layer rather than a per-call-site discipline. The defects
live at the two doors out of that default:

- **The raw-markup door.** Any injection of a string into the DOM as
  markup goes through one named sanitizer helper with an explicit tag
  allowlist, and the injection sits on the same line as the helper call
  so a reviewer sees both at once
  ([one-validation-door](../../../../_laws.md#one-validation-door): the door is
  enumerable, the writers are visible).
- **The markdown door.** Rich untrusted text renders through **one**
  shared markdown renderer where the link, image, and raw-passthrough
  policy lives — never a bare markdown component per call site, because
  the policy is exactly what the bare component lacks. URLs that arrived
  *with* the content are sanitized before they become link targets, and
  external opens route through the app's one external-open door.

### A door narrower than the sanitizer

The markdown door as stated assumes the product must render a full
grammar and therefore needs a policy for the dangerous half of it. Where
the repo also controls the **producer** of the rich text — a model it
prompts, an importer it wrote — a third option exists, and it is cheaper
than the policy: render a grammar that has no dangerous constructs in it
at all. A renderer that knows only paragraphs, bullets, emphasis and
inline code has no link target, no image source and no raw-markup path,
so there is no allowlist to keep current, no sanitizer whose correctness
has to be re-argued, and no configuration flag a later contributor can
widen by one option. Unrecognised syntax falls through as literal text,
which is the honest rendering of a construct the product never promised
to draw, and an unclosed marker stays literal rather than swallowing the
rest of the line.

The condition that makes this safe to choose is the one that makes it
safe to say no: the producer is instructed to emit only what the renderer
draws, so what is dropped is nothing anybody was promised. Pin it with a
test that feeds the renderer a link and a markup tag and asserts both
come back as text. The grammar's *absence* is the security property here,
and an absence is exactly the kind of thing a later convenience refactor
restores by accident — swapping in a real engine looks like a strict
improvement to everyone who did not read the comment.

The deeper treatment — hostile model output, fencing, the sanitizer's own
correctness (single-pass entity decoding is not a fixpoint) — is owned by
[output-sanitization](../../../../llm-agent/prompt-and-context/prompt-safety/techniques/output-sanitization.md)
and its sibling
[model-output-as-untrusted](../../../../llm-agent/prompt-and-context/prompt-safety/techniques/model-output-as-untrusted.md).
This technique owns the display half: the primitives' contract and the
two doors.

## Untrusted text never becomes vocabulary

The subtler failure is not injection but **identity confusion**: logic,
color, filtering, or persistence keyed on user-authored content as if it
were a token. A status pill whose hue derives from matching an
entity's *name*, a branch on a model-emitted phrase, a map keyed by an
imported title — each treats content (open, hostile, renameable) as
vocabulary (closed, trusted, stable). The boundary is the same one
[token-label-separation](../../../../client-architecture/i18n/techniques/token-label-separation.md)
draws for catalog labels, applied to a rougher neighborhood: **tokens are
minted by the repo; everything else is a dead end that data flows into
and never out of.** If untrusted content must influence presentation
(user-chosen accent colors, say), it does so through a closed selection
the user picks from — the content names a token; it never *is* one.

The same confusion has a second shape that does not look like display at
all: a **marker the product writes into a text channel that also carries
untrusted content**. A system that maintains one updatable message inside
somebody else's thread finds that message again by a sentinel written
into its body, and that sentinel is a closed vocabulary with exactly one
member — which untrusted prose flowing into the same body can mint. The
content does not have to escape anything; it only has to spell the
marker, and the product's own machinery then attaches to a message the
content authored. Neutralise the marker's opening sequence on every
untrusted field on the way **in**, at the single point all of them
already pass through, rather than at whichever render site is the current
consumer: the marker's readers are not all renderers, and the next reader
written will not know to ask.

## Geometry is part of the contract

Untrusted text has untrusted *shape*: unbounded length, no spaces,
right-to-left runs, combining characters, emoji. The primitive owns
truncation (with the full value recoverable — a tooltip or expansion),
overflow, and bidirectional isolation, because a call site that clips by
eye will be wrong at the first name longer than the test data. A layout
broken by a crafted name is the same class of defect as markup injected
by one — outside authorship exploiting a per-call-site decision — and the
same cure applies: decide once, inside the primitive.

A size bound at the ingestion door and a display truncation at the
primitive answer different questions — what may be stored and streamed
versus what fits on a line — and a product with untrusted text usually
needs both. The ingestion bound carries one non-obvious obligation of its
own: a cut measured in storage units rather than characters can land
*inside* a character, and the fragment it leaves is not merely ugly but
invalid text, which breaks the next re-serialisation or the next write
rather than the next layout. Whatever cuts also repairs the cut.
