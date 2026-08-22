---
layer: application
type: application
subject: i18n
technique: completeness-gates
stack: react
verified_on: 2026-08-22
verified_against: react@19
---

# Key parity as a compile error — the colocated-catalog variant

A two-locale product (Czech home market, English source since the authoring
direction flipped 2026-08-05) with **no central message catalog for product
copy**. Each component owns its own locale table:

```ts
const T = { cs: { title: "…", cta: "…" }, en: { title: "…", cta: "…" } } as const;
```

consumed through `useT(T)` on the client (`src/lib/i18n/client.ts:24`) or
`await getT(T)` on the server (`src/lib/i18n/server.ts:24`). The central
dictionary (`src/lib/i18n/messages.ts`) carries only nav and footer chrome.

## The parity check is the type system

`TDict` (`src/lib/i18n/interpolate.ts:22`) is

```ts
export type TDict<K extends string> = Record<SupportedLocale, Record<K, string>>;
```

Because `K` is inferred from the whole literal and then required of *every*
locale, a key added to one column and not the other is a `tsc` error at the
component, in the same file, in the same diff — and `npm run check` is
typecheck + lint + build. The consequences are worth stating precisely:

- **Key parity cannot be reported green while being false.** The technique's
  central worry — a parity board reading 0 missing over a locale that is not
  complete — is unreachable for the key half, because there is no report; the
  build simply does not produce an artifact with a gap in it.
- **Extras are impossible, not merely failed.** The "stale key after a source
  rename" class does not exist: renaming a key in one column breaks the other
  column and every call site at once.
- **There is no parity script, and there must not be one.**
  `AGENTS.md` states it as a convention that bites — "i18n parity is the type
  system … There is no parity script — do not invent one." A second authority
  over the same fact would be the drift, not the coverage.

The trade is real and worth recording: this buys structural parity at the
cost of the *extract → fill → merge* pipeline the technique describes. There
is no gap file to hand a translator, because a gap cannot exist long enough
to be extracted; new copy is written in both columns by whoever writes the
component.

## What the type system cannot see

The runtime resolves `dict[locale] ?? dict.en`, so a key whose Czech value
was never actually written renders English while typechecking perfectly.
That is the value-parity half, and `scripts/i18n-audit.mjs` is the separate
scanner for it — its header (`:1-21`) states the doctrine verbatim: "`TDict`
makes structural parity a typecheck error … What typecheck CANNOT see is a
key whose translated value was never actually written."

It reports three things: coverage (hardcoded Czech rendered outside any `T`
table at all — the domain-coverage analogue here, since the "vocabulary
outside the catalog" is the component's own JSX), leftover (cs values
byte-identical to en), and register.

Two lessons are recorded inline and both are the technique's:

- **The tolerance list is built by escaping literals.** `DNT_LITERALS`
  (`:38-50`) holds ~40 entries — metric abbreviations, brand and product
  names, format shapes — and the comment says why the pattern is derived
  rather than hand-written: "`Fulfillment (3PL)` and `AOV {val}` contain
  metacharacters, and inlining them raw silently turns the whole alternation
  into a syntax error."
- **The parser must match the language, not a shape.** Many tables close with
  `} as const;`, not `};`; a parser looking for a literal `\n};` reported
  every string in those tables as hardcoded and "inflated the first run of
  this audit from 234 findings to 1 910" (`:18-21`). A false-positive rate
  that high is the precise mechanism by which gates get bypassed and then
  deleted.

## Ruled decisions: the ratchet and the parked guard

Because Czech here is *transcreated*, not translated, the second scanner
`scripts/i18n-gate.mjs` gates a wave (a working tree diffed against a git
ref) on the rulings themselves. Its header (`:11-19`) orders the findings by
severity — placeholder drift, key-set asymmetry, empty value, parked sweep as
failures; key add/remove, length blow-up and leftover source as warnings.

- `PARKED` (`:39-41`) holds decisions ruled "keep the current form", and
  compares **total occurrence counts in the cs column; any movement is a
  violation** — the zero-movement guard.
- `RATCHETS` (`:44-53`) holds decisions ruled "sweep it out", where "the
  count may only go DOWN. A rise means the removed form is creeping back,
  usually via a recast that reintroduced it." Three live entries: em dash in
  cs, an imperative phrasing, and a brand-first noun order.

The operating lesson is written into the code rather than a postmortem
(`:33-38`): a guard "is only valid while the decision is genuinely parked or
ruled 'no change'; once a decision is ruled *sweep*, it must move to RATCHETS
below or the gate fires on the very work the ruling asked for. (A1, A3 and A4
each sat here until they were ruled, and each one failed the gate on its own
sweep before being moved.)" Three of the four rulings failed their own
sanctioned wave before the classification moved — the transition is part of
acting on a ruling, learned the expensive way.

## Where they run

Nowhere. Neither `i18n-gate.mjs` nor `i18n-audit.mjs` has an npm alias, and
neither is referenced from `package.json`, `.github/`, `.husky/` or the
lint-staged config; `check:ci` is `check` → `seed:check` → `test:unit` →
`llm:gate:check`. Both scripts must be invoked by full path, by someone who
knows they exist. They are well-built checkers on no rung — the technique's
"gate at the door, not in a report" reduced further, to a report nobody runs.
