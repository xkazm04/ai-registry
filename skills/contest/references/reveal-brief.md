# {{title}} - reveal

The first round is over, and you can now see the whole field. Every variant every seat
delivered is in this directory: your own under `own/`, everyone else's under `others/`, with
the makers' names removed. Nobody has chosen a winner yet.

This round is for your own judgement. **Choose one of your own variants, cut the rest, and
master the one you keep, now that you know what the others built.** The reveal ends with one
variant per seat, and each seat has argued in its own report why its survivor is the better
choice.

## The idea, as first briefed

{{brief}}

## What is in front of you

```
own/        your {{own_count}} variant(s), exactly as you delivered them
{{own_list}}
others/     every other seat's variants, blinded
{{others_list}}
data/       the same material as the first round
```

Read every other variant before you choose, not only the one that looks like yours. Some of them
found things in `data/` that you did not. Some of them are wrong in ways you can check against
`data/`. Both kinds are useful to you.

## What you must deliver

Exactly **one** directory, named after the own variant you keep: if you keep `own/variant-2`,
deliver `variant-2/index.html` and `variant-2/NOTES.md` at the top level of this directory.
Start from your own variant. This is the same bet, mastered; it is not a new idea, and not a
copy of someone else's.

The mastered report must contain everything the first brief asked for, improved, plus a new
section with `id="reveal"` titled **Why this design**. That section must hold:

1. **The approaches, side by side.** Before any scoring, a brief comparison of concept and
   philosophy: for your variant and every competing seat's strongest variant, one row with the
   bet it makes, the unit it treats as the thing that can be wrong, and what it refuses to do.
   A reader who opens only this section should understand how the field split and where your
   design sits in it.
2. **A comparison matrix.** Rows are your variant and the strongest competing variants (at least
   three, from at least two other seats, cited by their label, e.g. `B/2`). Columns are the
   criteria this problem is actually decided on. Choose those yourself and say why they are the
   deciding ones. Every cell is a short claim, not a tick mark, and a claim about another variant
   cites where in that variant you read it.
3. **Where another variant is better than yours**, named plainly, and what that costs your design.
   A matrix in which you win every row will be read as advocacy, not analysis.
4. **What you took from the field.** An idea, a mechanism, a diagram approach, or a defect you
   found in someone else's variant and made sure yours does not have. Credit each one by label.
   Borrowing is allowed and expected, as long as it is credited and your bet stays yours.
5. **Why you cut your other variants**, one short paragraph each, in terms of what the field
   showed you.

`NOTES.md` keeps the first round's headings and adds `## Reveal`: which variant you kept, what
changed, and the one sentence that says why it should win.

## The bar

The first round's rubric still holds, and so do the first brief's hard constraints. Two things
are judged harder in this round:

- **Honesty in the comparison.** Misreporting another variant, citing a section it does not
  have or dismissing a strength it plainly has, is a craft failure. The owner will open both
  reports side by side.
- **Defects closed.** If the field showed you that one of your mechanisms is wrong about
  `data/`, fix it or cut it. Carrying a known defect into the reveal is worse than the defect
  was in round one.

## How to work

- You have about {{timeout}} minutes. Spend the first part reading the field.
- Decide everything yourself; there is no one to ask.
- Never modify `own/`, `others/` or `data/`. Leave nothing at the top level except the one
  `variant-<n>/` directory.
- Do not name yourself, your model or your vendor anywhere in the files.

Your final message is three lines: the variant you kept, the variant in the field you consider
the strongest competitor, and the one sentence that says why yours should still win.
