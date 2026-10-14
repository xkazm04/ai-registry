---
layer: application
type: application
subject: czech
technique: gender-neutral-forms
stack: process
status: forged
verified_on: 2026-10-14
applied: code
ab_verdict: better
---

# Process · Bracket forms left behind in a catalog that had already adopted the slash (kp)

The technique's rule is one style per catalog: slash (*postoupil/a*), never the
bracket (*navrhl(a)*). The product's Czech style guide states the same rule and its
2026-08 review wave listed `navrhl(a)` to `navrhl/a` as a fix. Opened on 2026-10-14,
the shipped Czech catalog (14,673 strings) still held **13 strings in bracket form**
across 11 keys: status toasts with an interpolated name (*{name} zamítnut(a)*,
*přidán(a)*, *odebrán(a)*), a wave-reason trio (*ponechán(a)*), a plural branch,
a scorecard byline, and three first-person acknowledgement checkboxes
(*Přečetl(a) jsem*). Beside them sat 114 slash-form strings, so the catalog was
exactly the mixed-style case the decision rule calls a terminology-class defect.

## A and B

- **A:** the catalog as shipped. Target measure: strings matching a word followed by
  `(a|ka|la|á|ou)`: 13.
- **B:** the same 13 strings with the bracket replaced by the slash, nothing else
  touched (no recast, no wording change). Target: 0.
- **Floor:** the product's own catalog check (key parity, placeholder parity, brace
  balance, list length, dash rule) must report byte-identically before and after.
  It did, including its pre-existing failures, which are not in Czech gender strings.

Verdict `better`: target 13 to 0, floor held, one file, 13 lines. Shipped to the
project's default branch.

## What was deliberately not done

The review log still lists ~10 bare-masculine or role-noun cases (a generic
*kandidát* in a meta note, *Tazatel informován* in an event chip, the anonymous
vocative *kandidáte*) each marked "needs a native ruling" because the slash is heavy
there and an impersonal recast changes the sentence. The technique's preference order
(impersonal first) would favour recasting some of the converted toasts too
(*Zamítnuto: {name}*); that was not done because recasting changes wording a native
has not approved, and the conservative conversion already satisfies the rule. These
are the next seam, owed to a native reviewer, not to a mechanical sweep.

## Reading for the technique

The technique held. Its one gap seen here: it states "one style" but gives a reviewer
no cheap detector. A single pattern (word-attached bracket suffix) found every
violation in this catalog; worth stating as the audit regex beside the slash rule.
