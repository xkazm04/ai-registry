---
layer: application
type: application
subject: visual-style-locking
technique: style-block-restated-every-call
stack: react
status: forged
verified_on: 2026-08-27
verified_against: react@19
---

# React: compiling and restating the style contract per call

The gravitone-gcloud studio carries the style contract into every generation
call through one prompt compiler and one provider adapter, and its knowledge
base records the incident that made restatement law.

## The source incident

`knowledge/VISUAL-STYLE.md:37-50` ("The style block is carried by an image
AND by text — never by the image alone") preserves the practitioner quote
that anchors the whole technique:

> "I tried to also leave the style block here and it was actually not
> working because it transformed style mid video."

Attaching the approved reference "is necessary and not sufficient"; dropping
the textual block drifts the look *inside a single clip*, so "the style
block must be restated at every hop — including the hop from a picked still
into motion." The same doc states the two-block law (`VISUAL-STYLE.md:18-31`):
style block with project lifetime, action block with shot lifetime, "authored
once and never retyped" — never re-derived per shot.

## The compiler and the send count

Every generation path goes through `compilePrompt` from `lib/stylePrompt`
(imported at `app/library/Playground.tsx:21`) — style block plus subject
compiled at call time from the structured `StyleBlock` record, alongside a
shared `NEGATIVE_PROMPT` and a `PROMPT_CHAR_LIMIT`. The playground fixes the
reference send count as a named constant (`Playground.tsx:28-38`):

```ts
/** ... The model accepts 14, but each is a ~250KB base64 payload and they go
 *  up the wire on every trial. Four is where the style is unambiguous and
 *  the request is still quick ... */
const MAX_REFS = 4;
const IMAGES_PER_RUN = 1; // declared once so the shown price and the sent count cannot drift
```

— the window (14) and the send count (4) kept as different numbers, per the
approved-reference-sheet discipline.

## Labeling references and translating negatives

The provider adapter (`lib/imaging/providers/google.ts:337-347`) compiles
the contract into what the vendor accepts. `buildPrompt` prepends, before
any image part, an explicit role statement:

```ts
`The ${n} attached images are STYLE REFERENCES, not content to reproduce.
 Match their technique, palette, line weight and finish exactly.
 Do NOT copy their subject matter — draw the subject described above, in
 their visual language.`
```

The comment names why (`google.ts:327-335`, `:160-165`): "attached images
are ambiguous by default: the model has no way to know whether it is being
shown a subject to redraw or a look to imitate, and it guesses 'subject'" —
an unlabeled reference on a style-lock request returns "the previous frame's
subject back in the new frame's style: exactly backwards." The same function
translates the exclusion clause into prose because this vendor "takes no
negative-prompt field, so a negative becomes an explicit exclusion clause
rather than being silently dropped."

## The claim, measured

`docs/imaging.md:145-178` runs the subject's control-arm probe against this
exact wiring: anchor / conditioned / control sharing one style block, judged
by a vision model through one schema. First run: **locked 67% vs control
33%** palette retention — and the honest reading recorded with it: "the
style block does most of the work on colour, and references do the work on
everything colour cannot describe." The probe also asserts routing (the
conditioned request must land on the reference-honoring provider, because a
sibling vendor's API silently ignores reference images), and it asserts an
absolute bar rather than `locked > control`, which "at n=1 … would be a coin
flip dressed as a test."

## Re-verified 2026-08-27: the override question, and the gap the contract hid

Two structural facts, both read from the tree rather than claimed by it.

**The tree takes the no-override side of the default-with-override rule, and
its shape says why.** The technique's 2026-08-27 amendment allows a scoped,
recorded override of the block for a scene that needs its own look. This
codebase has no override anywhere: every generation path takes one
project-level block, the scene spec type carries no style field, and the
art-direction prompt instructs the director to "compose within it rather than
against it." That is not an unbuilt feature — it is the boundary case the
amendment implies: a cut of *plates for one narrated video* has no scene that
earns its own register, so the stricter policy (no overrides, compose within)
is correct for this shape. The override discipline is for multi-scene
cinematic work where a midday exterior and a soft interior legitimately
diverge. A tree that wanted overrides would need a style delta on the scene
spec; nothing here has a place to put one, which is the structure saying the
project never needed it.

**A contract everyone honors can still have one caller outside it.** The
labeling clause, the reference plumbing, the routing constraint and the
measured control-arm all existed — and the production Frames path still
generated text-only, because passing `references` was the one step no type
forced. Found and closed on 2026-08-27 (the production and alternatives paths
now send the newest approved proofs, capped by a send-count constant declared
beside the window constant so the two numbers cannot be conflated). The
lesson for the technique: "every call goes through one compiler" governs the
*text* half by construction, but the *image* half rides a separate optional
field, and an optional field is where the contract leaks. The pipeline's
compiler owns the prompt; nothing owned the attachment.
