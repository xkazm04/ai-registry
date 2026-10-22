---
layer: application
type: application
subject: authoring-block-vocabulary
technique: per-block-line-grammar
stack: react
status: forged
verified_on: 2026-10-22
verified_against: react@19
applied: code
ab_verdict: better
---

# The continuation rule was safe for prose and silent for a mistyped marker

`personas-web` follows the technique almost to the letter. Every directive body is
parsed by its own line grammar in one table, the separator is matched as a class,
and a line the grammar cannot place goes to a skip counter. Tree read at the commit
before the change; witness for the stack is the project's React 19 dependency.

## What the tree confirms

- The dash separator is a class, not a literal:
  `src/components/guide/guide-markdown/parseGuide.ts:126 "const DASH = "` accepts
  the em dash, the en dash and the hyphen, so an editor's autocorrect or a
  translator's keyboard cannot make a block vanish.
- Failure is per line. Each grammar ends in the same two-step: fold, else report.
  `src/components/guide/guide-markdown/parseGuide.ts:152 "else if (line.trim()) ignore(i);"`
  sends the unplaceable line to the build-time count and renders nothing for it.
- A block that parses zero items out of a non-empty body returns null through
  `nonEmpty`, which is the technique's rule that an all-failed block is a failure
  and not an empty success.

## Where the tree falsified the rule as written

The seam was chosen to break the technique's continuation rule, not to show it
working: a line that does not start a new item is appended to the item above. In
`callout-stack` and `steps` that was literally `else if (items.length > 0)` with no
test on the line, so a mistyped label (`[warnning] text`, or a step numbered
without its bold title) was folded into the previous item and printed as prose.
Nothing was skipped, so the build count stayed at zero. The two rules the
technique states separately, fold continuations and report malformed items, met on
exactly that line and the fold won.

- **A (as found):** two mistyped-marker bodies, one per grammar. Reported 0 of 2.
- **B (marker-shaped lines are reported, the rest still fold):** reported 2 of 2.
  The shape tests are a bracketed word not followed by an opening parenthesis, and
  a number followed by a period and a space
  (`src/components/guide/guide-markdown/parseGuide.ts:133 "const LABEL_SHAPED"`).
- **Control:** genuine continuations, including a line that opens with a markdown
  link, fold in both arms. Without the negative lookahead the link would have been
  reported as a mistyped item.

Target: mistyped markers reported at build, 0 of 2 to 2 of 2. Floor: 43 guide
parser tests, the type check and the content gate over 1,526 topic bodies, all
green with no new diagnostic.

## What the tree could not confirm

Real content never held the case: 0 of 242 callout-stack, cards and steps blocks
contained such a line, so the change guards a latent hole and repaired no live
page. The technique's boundary was written from this seam, not from an incident.
Not measured: the cards grammar drops a fourth and later field silently, and no
authored block has one.

## What this realization cannot do

The shape test is a heuristic over the marker's look. A genuine continuation that
happens to begin with a bracketed word, or a numbered sentence at the start of a
wrapped line, is now reported instead of folded, which the author fixes by
rewording. The cost lands on the writer, loudly, instead of on the reader,
quietly. A closed label set is what makes the test possible; a grammar whose
marker is open-ended has no shape to test.
