---
layer: application
type: application
subject: design-tokens
technique: token-taxonomy
stack: react
status: forged
verified_on: 2026-09-20
verified_against: react@19
---

# React application — token taxonomy in a single-theme product

*Verified against the `ascent` tree at `62c252dd`.*

A dark-only product (one binding set, no theme switch) whose entire vocabulary
lives in one stylesheet, maintained by sweeps and authored notes rather than by
a gate. That makes it a clean specimen of the naming layer on its own: every
taxonomy decision here was made without enforcement holding it up, and what
survived is visible in the file.

## 1. Every role records the drift it replaced

The role block is `src/app/globals.css:7-66`, and almost every binding carries
its own before-state in the comment beside it:

- `--color-on-accent` (`:15`) — "previously hardcoded as `#04070e` across
  connect/onboarding/auth".
- `--color-danger` / `-soft` (`:18-19`) — "was raw red-500/300 literals".
- `--color-warn` (`:21`) — "was raw `#f97316` in inline styles".
- `--color-success` / `-soft` (`:26-27`) — "was raw emerald-500/400/300
  literals reinvented per surface", with the call sites named.
- `--color-surface`, `--color-surface-strong`, `--color-divider` (`:32-34`) —
  "replaces the slate-800/slate-700 drift", and `divider` is declared as *the*
  single hairline token for card borders and rules.

The names are intents, never values or addresses: `surface`, `divider`,
`on-accent`, `tone-rising/-falling/-flat`. The recorded before-state is the
part worth transplanting — it is what tells the next author that the decision
already has an answer, and it converts the role block into an audit trail of
how many anonymous decisions each name absorbed. A role whose comment cannot
name what it replaced is usually a role that has not earned existence yet.

## 2. The ramp is the repair site, not the call sites

Two rebinding events, one per axis, both done at the primitive ramp:

**Text sizes.** `:104-128` re-bases every size token one step over the
framework default (xs 12→13, sm 14→15, base 16→17 …) with line-heights moved
with them. The stated reason (`:73-78`): the reading sizes measured too small
at 100% zoom, and a single re-base "lifts every surface at once while keeping
every relative relationship".

**Muted text.** `:43-66` re-bases two steps of the neutral ramp —
`--color-slate-600: #64748b`, `--color-slate-500: #77879d` — because the app
writes de-emphasised text with the stock ramp, which the note measures against
the canvas at 2.56:1 and 4.08:1 where AA body text needs 4.5:1. The note states
1061 `text-slate-500` and 338 `text-slate-600` occurrences; re-counted at
verification: 1063 and 339 in `src/`. The re-base keeps the ramp's *order*
intact (600 stays a step under 500) so nothing that relies on the hierarchy
inverts.

The file rejects the alternative for exactly the right reason: a sweep of the
utilities "would churn 300 files and the next `text-slate-500` anyone types
would be unreadable again". That is the golden path's rebinding case stated
from the inside — **a rebinding fixes the future; a sweep only fixes the
past** — and it is the strongest argument in this tree for the indirection.

It is also a measurement of how far raw-scale consumption had spread. What was
re-based is a *primitive* ramp step, not a role, so the repair worked by
redefining the framework's own primitives underneath ~1400 call sites that had
skipped the role layer. Under this subject's standard that is an emergency
move done well, not the destination: the same note draws the role boundary it
is compensating for — "anything darker than the ramp's new floor is a BORDER
token (`--color-divider`), not text" — and the de-emphasised-text role that
would make the ramp step unnecessary at those sites still does not exist.

## 3. Type recipes that decline properties on purpose

`:69-193` is the technique's two-layer type design: the re-based size tokens,
then semantic `@utility type-*` classes named by voice, not size — `type-label`
the mono eyebrow, `type-caption` mono metadata, `type-body` paragraph copy,
`type-figure` the typeset stat (`:130-193`). `:88-103` carries the full mapping
from each raw utility combination to its recipe, which is both the migration
table for the sweep that introduced them and the lookup a new author needs.

The recipes set size, line-height, family and numeric variant — and
deliberately **no weight, colour or tracking**. The definition states why
(`:80-86`): those vary per site, and a recipe that fixed them "would be
overridden everywhere" — except that it would not be, which is the actual
finding. The note is precise about the mechanism: the compiled stylesheet emits
`tracking-*` *before* a multi-declaration custom utility, so a `type-label`
that fixed letter-spacing "would silently beat the explicit
`tracking-[0.22em]` beside it". The recipe cannot lose, so it declines the
property and states the obligation it hands back: "a label always names its
tracking".

Measured against the technique, this is half a compliance and half a debt. The
declining is correct and is the amended taxonomy's clause realized — a recipe
that would always win a property its call sites must control should not set it,
and saying so in the definition is what makes the omission a decision. The debt
is that weight, colour and tracking are then composed per site with nothing
gating them, so the axes the recipe declined are exactly the axes where drift
stays possible. The technique's answer — own the cluster *and* ban the loose
alternative beside it — needs an enforcement half this tree does not have (§5).

Worth noting for transplant: **declining is order-independent, owning is not.**
The reason this recipe declines tracking is the emission order of one major
version of one framework. Nothing in the tree pins that order — no test asserts
it — so a recipe built on "I will win this property" would silently invert on
an upgrade, while the declining recipe is correct under either order.

## 4. The same precedence fact, one layer up

`src/features/shared/knowledge/KnowledgeShared.tsx:99` — the `Spectrum` bar, a
shared primitive that takes a class string from its caller. It carried `w-full`
in its own class list while a caller passed `w-14`; the cascade, not the
composition, decided, full width won, and every subject label in that rail was
squeezed to zero. The fix moved the width out of the body and into the
parameter's default (`className = "w-full"`) and wrote the rule into the
parameter's doc comment — "the caller owns it (a `w-14` beside a `w-full` would
race in the cascade)" — commit `50d6ea2a1`, 2026-09-05.

Two things generalize. The default belongs in the parameter, never in the body,
whenever a primitive accepts styling for a property from its caller. And the
defect was found in a screenshot: the component's tests assert over composed
class strings, where both class names are present and everything looks right.
This tree has no rendered-output check in its pipeline, so this class of defect
is caught here only by someone looking at the screen.

## 5. Enforceability is available here and unused

`eslint.config.mjs` (77 lines) carries exactly two laws, both about the data
layer: `no-restricted-imports` on the database client module and
`no-restricted-syntax` on raw query APIs (`:52-72`). There is **no raw-value
rule of any kind** — no hex ban, no loose-size-utility ban, no role-membership
check — and `npm run verify` is lint + typecheck + coverage + build. The
vocabulary is held by the authored notes quoted above and by the sweeps that
introduced it (222 `type-label` occurrences in `src/` at verification).

What makes this tree interesting against the enforcement technique is that its
roles are **lexically distinguishable at the site a gate would read**. The
success role's values are byte-identical to the palette entries they replaced
(`#10b981` / `#6ee7b7` are the old emerald-500 / emerald-300 — stated in
`src/components/ui/chip.ts:1-9`), but the *artifact* still says
`border-success/50 bg-success/10 text-success-soft` (`chip.ts:16-20`), not the
palette names. Value-identity means an author cannot see a regression by eye;
it does not make the axis unenforceable. The rule that could fire here is
available and has not been written — which, on this subject's measured
correlation between an early-wired rule and adoption, is the risk this tree is
carrying.

## 6. What this realization cannot prove

- **No adoption census exists.** Nothing has counted role uses against raw uses
  per axis on this tree. The only counts here are the ones the stylesheet
  states about the ramp it re-based and the two greps repeated at verification;
  the ~222 `type-label` uses show a sweep landed, not what fraction of text
  sites speak the recipe vocabulary today.
- **The contrast figures are the file's, re-derived nowhere.** The 2.56:1 /
  4.08:1 / 5.30:1 ratios are stated in `globals.css:43-66` against a single
  canvas colour. No gate recomputes them, and no instrument here would notice
  a future binding that breaks the floor they were chosen to clear.
- **One binding set means the theming half of the taxonomy is untested.** Every
  role in this tree has been asked to answer exactly one question. Whether the
  names carry enough intent for a second binding set — the property the
  taxonomy exists for — cannot be known from a product that has never had one.
