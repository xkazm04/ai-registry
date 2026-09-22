---
layer: application
type: application
subject: brand-voice-capture
technique: rejections-and-edits-become-constraints
stack: node
status: forged
verified_on: 2026-09-23
verified_against: node@24
applied: code
ab_verdict: better
proof: ab-paired
---

# Rejections and edits become constraints - the twin's pre-send edit filter

The Czech-first adtech workspace (`systedo-case`, commit
`e1ec5d46bad267615cecd66f1f1e644ee68b3700`, 2026-09-23) banks a human's
pre-send edit of a generated reply as a style fact through one pure module,
`src/lib/twin/edit-facts.ts`, called from both review surfaces
(`src/components/app/twin/TwinOutbox.tsx:351` "const editFact = isMeaningfulEdit(original, replyText)" and
`src/components/app/modules/SpeedLeadModule.tsx:412` "const editFact = isMeaningfulEdit(aiReply.reply, replyText)"). The Node
version is witnessed by `package.json`'s `engines` field (`"node": "24.x"`)
and `.nvmrc` (`24`).

Until this commit the module was the technique's earlier rule verbatim: a
word-level edit ratio, and `EDIT_BANK_THRESHOLD = 0.25` described as "below
this it's a typo fix, not a style correction". The tree is where that rule
was tested, and it is the reason the technique now judges an edit by kind.

## What A and B were

- **A (parent of `e1ec5d46`):** bank when the word-level edit ratio is at
  least 0.25.
- **B (`e1ec5d46`):** keep 0.25 as the rewrite path
  (`src/lib/twin/edit-facts.ts:178` "if (editDistanceRatio(b, a) >= threshold) return true;"); below it,
  align the two replies and classify each changed hunk
  (`src/lib/twin/edit-facts.ts:152` "export function classifyEdit(removed: string[], added: string[]): EditOpKind {")
  as cosmetic, typo, fact or voice, and bank when any hunk is voice. A small
  edit banks its changed spans with three words of context
  (`src/lib/twin/edit-facts.ts:220` "const small = editDistanceRatio(before.trim(), after.trim()) < EDIT_BANK_THRESHOLD;").

## What was read

Twenty-two paired before/after fixtures, a 46-word Czech reply and a 51-word
English one, the same inputs through both arms, both arms imported from the
tree rather than re-implemented:

| Class | n | A banked | B banked |
| --- | --- | --- | --- |
| Voice (adjective, hedge cut, attribution added, sign-off, greeting register, elision) | 11 | 0 | 10 |
| Typo and cosmetic (typo, diacritics, transposition, case, punctuation, whitespace) | 7 | 0 | 0 |
| Fact (a price changed) | 2 | 0 | 0 |
| Rewrite | 2 | 2 | 2 |

Target: voice corrections banked, 0/11 to 10/11. Floor, declared before the
run with a tolerance of zero: typo, cosmetic and fact edits banked stays 0/9,
rewrites stay 2/2, and the project's unit suite and typecheck stay green
(4147 tests, 4144 pass, 0 fail; `tsc --noEmit` clean). The floor held.

The fixtures are constructed, not drawn from sent mail, and the arm-B
classifier was designed by the same run that wrote them - a bias the result
carries. The part of the finding that does not depend on either is
structural: on a reply of this length one changed word is a ratio of 0.02,
the largest single voice correction in the set (an added clause of
attribution) is 0.167, and A needs 12 or 13 changed words to bank anything.
Under A, a voice correction smaller than that could not bank on any input.

## The seam was chosen to falsify

If the product's replies were short - a dozen words - one swapped word would
clear a quarter and A would already bank voice edits, and the finding would
not apply here, and a CAUGHT outcome would have narrowed the technique to
long-form surfaces. The reply fixtures sit near fifty words, inside the
product's own length habit, and at that length the threshold could not see
any of the corrections the technique names. What the seam did not settle is
how often owners make such edits; that is the return condition below.

## What the realization cannot do

A register change spelled like a typo reads as a typo: the Czech colloquial
elision "zvládnem" for "zvládneme" is one character from the standard form,
and the near-spelling test cannot know it is how the owner talks. The tree
pins the miss so a later change to it is deliberate
(`test-unit/twin.test.mjs:317` "colloquial elision reads as a typo"). A per-language list of register
variants would close it; nothing in the tree has one.

Nor does the tree yet know whether the newly banked facts change a
distillation. The return condition is a month of real sent drafts: the share
of banked edit facts that the next voice distillation turns into a
directive.
