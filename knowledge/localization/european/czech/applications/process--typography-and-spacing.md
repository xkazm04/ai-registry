---
layer: application
type: application
subject: czech
technique: typography-and-spacing
stack: process
status: forged
verified_on: 2026-10-15
applied: code
ab_verdict: better
---

# Process · Number and unit left unglued in a catalog that glued some of them (kp)

The technique's CS-NBSP rule joins a number to its unit with U+00A0 so the value never
wraps away from it. Opened on 2026-10-15, the shipped Czech catalog (14,673 strings)
held **66 number-plus-unit spans, 16 glued and 50 with a plain space**: the same
construction (*7 dní*, *0 %*, *8 MB*, *2 s*, *0 Kč*, *6 let*) set both ways, which is
the mixed case the rule says a catalog must not contain. The catalog already used the
glue in 81 lines, so the convention existed and was applied by hand, unevenly.

## A and B

- **A:** the catalog as shipped. Target: plain-space number+unit spans, 50.
- **B:** the same spans joined with U+00A0 by one scripted replace, plus one of the
  catalog's two ASCII quote pairs — the one around a slug placeholder — turned into the
  Czech pair. Nothing else touched. Target: 0. The quote change sits outside the target
  measure: the target counts NBSP spans only, so the verdict says nothing about it.
- **Floor:** the product's catalog gate (key parity, ICU compile, placeholder parity, the
  no-dash rule, list parity). Its output was byte-identical before and after.

Verdict `better`: target 50 to 0, floor held, one file, 42 lines. Shipped to the
project's default branch.

## What was deliberately not done

- The other ASCII pair, around a literal config value (*population na "agent"*), was
  left: it is a value the user must type verbatim, a code literal, and the technique says
  to leave it. The slug pair was converted because it quotes a placeholder inside a
  running sentence (*neodpovídá „{slug}“*), so its marks are prose punctuation, not part
  of a value.
- One-letter prepositions: 4,204 spans are plain-space against 30 glued. The technique
  says to apply that glue where trivial and not to chase legacy strings, so a 4,200-edit
  sweep was not made; it is a decision for the owner, and a typesetting-level fix
  (a render-time rule) would reach all of them at once.
- The two three-period ellipses are in-progress labels; the technique's own text treats
  that check as optional.

## Reading for the technique

The technique's preference for a gate over review is confirmed from the negative side:
the project's gate polices dashes and ICU shape but has no NBSP predicate, and the gap
let 50 spans accumulate beside 16 correct ones. What this realization cannot do: the
gate it ran cannot see wrapping, so the improvement is a character-level fact, not a
rendered-line measurement.
