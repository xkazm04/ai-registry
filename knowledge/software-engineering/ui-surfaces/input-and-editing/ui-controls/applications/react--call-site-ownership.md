---
layer: application
type: application
subject: ui-controls
technique: call-site-ownership
stack: react
status: forged
verified_on: 2026-09-24
verified_against: react@19
applied: experiment
ab_verdict: better
proof: ab-paired
---

# React application — call-site ownership

*Verified against the project tree at `a056cdc06`. The stack version is
witnessed by the project's `package.json` (`react ^19.2.6`, `tailwindcss
^4.3.0`).*

This tree is the corpus's best specimen for
[token-enforcement](../../../feedback-and-style/design-tokens/applications/react--token-enforcement.md):
a contrast gate that recomputes every theme, custom lint rules per token
axis, and a census of ratcheted detectors. It is therefore the tree where the
ownership claim could most easily have been false. A mature token system
might already hold its controls, or its gates might already see the
restyles. The seam was chosen to falsify that.

## The control has the closed set

`src/features/shared/components/buttons/Button.tsx` is a textbook
[variant-discipline](../techniques/variant-discipline.md) primitive. It has
two enums, six tones (`primary`, `secondary`, `ghost`, `danger`, `accent`,
`link`) and seven sizes, each bound to class bundles in `VARIANT_CLASSES` and
`SIZE_CLASSES`, plus an `accentColor` enum of thirteen hues for the accent
tone. It also accepts `className`, the one named door.

## A and B

- **A, the project's own gate.** The full ESLint configuration (every custom
  token rule at its configured severity: text, radius and shadow at `warn`,
  spacing `off`, no rule about call-site restyling) run over the 29 files
  that hold the sites below.
- **B, an ownership classifier.** Every `<Button>` in files importing the
  shared button, with the static `className` split into *placement*
  (margin, size constraints, flex and grid child behaviour, position,
  visibility) and *appearance* (padding, color, type, border and radius,
  shadow, motion). Appearance is split again into *raw* (a palette hue or an
  arbitrary value, what a raw-value rule can see) and *token* (a semantic
  role or scale step).

Target: restyle sites visible to a gate. Floor: sites misclassified by B
(placement read as appearance).

## What was read

| | count |
| --- | --- |
| `<Button>` call sites (files importing the shared button) | 678 |
| sites passing their own `className` | 74 (67 static, 7 dynamic) |
| sites passing appearance classes | **34** |
| … of which only semantic roles and scale steps | **17** |
| sites A reports anything at, any severity | **0** |

B sees 34 and A sees 0. A reading of all 34 class strings found no
placement class read as appearance, so the floor held. That reading is the
director's and is labelled as such. Seventeen of the 34 would stay
invisible even if every token rule in this tree were raised to `error`,
because they contain no raw value. Examples: a secondary button handed
`bg-primary/15 text-primary/90 border-primary/25`, an input bar's button
handed `rounded-full`, a destructive-confirm modal's button handed
`px-4 py-2 typo-body text-foreground rounded-xl`.

**The counts are a floor.** The classifier reads a tag's attributes up to
the first nested element or arrow function, so a `className` written after
an `onClick={() => …}` or an `icon={<…/>}` prop is not counted. The first
pass of the instrument got this wrong the other way: it read classes from
icons nested in the `icon` prop as the button's own and reported 385 sites.
The correction is recorded because the inflated number was plausible.

## The structural fact

The census reads as a variant backlog, and it says something the tree's
token gates could not have been built to say. Thirteen sites override the
text color to the plain `foreground` role, which is one missing quiet
variant repeated. Sixteen of the seventeen raw-color sites use a hue the
button's own `danger` tone or `accentColor` enum already carries, often at a
different emphasis (colored text on a transparent ground where the variant
paints a tinted fill).
So the closed set exists and call sites route around it, and they do it in
the one channel no rule here classifies. The tree's census already names
the neighbouring defect class: a custom rule that "buys precision by NOT
LOOKING". This one is not looking in a different place: at the property
family, not at the value.

## What it cannot do here

- It judges nothing about whether an override is *right*. A reviewer still
  decides whether the thirteen foreground overrides are one missing variant
  or a real per-site need.
- It covers `<Button>` only. The same census over the shared `Badge`
  returned 0 appearance sites out of 14, so the drift is concentrated, not
  uniform.
- It does not see restyles made by a parent's descendant selector or in a
  stylesheet.

## Next change for the project

Not shipped: a new gate over 34 existing violations is a ratchet with a
baseline, and it belongs in the tree's own census format (baseline 34, fail
on increase) or as a custom rule that reads `VARIANT_CLASSES` and
`SIZE_CLASSES` for its remedy list. Filed in the project's
`.ai/applied.jsonl` as its next change.
