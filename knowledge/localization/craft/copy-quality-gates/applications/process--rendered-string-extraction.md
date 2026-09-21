---
layer: application
type: application
subject: copy-quality-gates
technique: rendered-string-extraction
stack: process
status: forged
verified_on: 2026-09-14
---

# A gated rule that 62 strings per locale never met (kp), and two walkers that did

Three catalog gates in three fleet trees, read on 2026-09-14: `kp` on `main` at
`d17c1c73` (2026-09-11; `scripts/i18n-check.mjs` last changed in `6fe92fd2`,
2026-09-04), `personas` on `master` at `028818013` (`scripts/i18n/check-escapes.mjs`
last changed in `f8daeaf79`, 2026-09-05), and `personas-web` on
`chore/remove-react-virtuoso` at `77454e8` (`scripts/check-i18n-coverage.mjs` last
changed in `391b644`, 2026-05-16). Every count below was measured by a read-only
walk of the catalogs that day, not taken from a gate's output.

## The contract says the rule is gated

`kp/docs/i18n/contract.md` §5 (line 83, "House style rule — no em dashes (adopted
2026-08-12)") bans U+2014 in every catalog value in every locale, and line 108
states: "**It is gated.** `npm run i18n:check` fails on any em dash in any
catalog". The gate's own comment (`scripts/i18n-check.mjs:245-251`) gives the
reason in the technique's own terms: "a rule with no gate decays: within hours of
the 2026-08-12 sweep clearing all four catalogs, a parallel session added four
new keys carrying em dashes".

## What the gate actually walks

`flatten()` at `scripts/i18n-check.mjs:131-139` recurses only into non-array
objects and stores everything else as a leaf:

```js
if (value && typeof value === "object" && !Array.isArray(value)) flatten(value, path, out);
else out[path] = value;
```

An array therefore becomes one dotted key whose value is the whole array. Every
content check then opens with an early return for non-strings:

| check | line | early return |
|---|---|---|
| `icuError` — full message-syntax compile | 121 | `typeof value !== "string"` → `null` |
| `argNames` — placeholder parity against `en` | 188 | → empty set |
| `braceError` — brace balance | 222 | → `null` |
| `dashError` — the §5 ban | 259 | → `null` |

So an array string is outside the house typography rule, the syntax compile and
placeholder parity at once. Key parity (`:287-291`) sees the array only as a key
that exists; array length is not compared across locales (read from the code,
not exercised).

## The measurement

Walking `messages/{en,cs,de,fr}.json` with full recursion:

| locale | string leaves | array leaves | strings inside arrays | em dash in string leaves | em dash in arrays |
|---|---|---|---|---|---|
| en | 8,491 | 14 | 62 | 0 | **1** |
| cs, de, fr | 8,491 | 14 | 62 | 0 | 0 |

`flatten()` yields 8,505 keys for `en` — the 8,491 strings plus the 14 arrays.
The fourteen arrays are `landing.marquee` (8), `landing.voice.bullets` (3),
`landing.voice.transcript` (3), the four `landing.pricing.tiers.*.features` (4
each), `landing.pricing.enterprise.capabilities` (6),
`landing.previews.schedule.days` (5), `legal.privacy.data.items` (6),
`legal.privacy.rights.items` (3), `legal.privacy.security.items` (4),
`legal.privacy.cookies.items` (4) and `legal.terms.use.items` (4). None holds a
non-string item. Five of them are legal copy, which is where placeholder parity
matters most.

The one surviving banned mark in the source locale is in an array,
`messages/en.json:838`, `landing.voice.transcript[0]`:

> "You shipped a React app for a school project — what broke first when real users hit it?"

It is exactly the string the gate's comment predicts: landing copy added by a
session that had no way to know the rule, in the one shape the gate cannot see.

## Why the output could not reveal it

The success line (`:639-643`) prints `` `${baseKeys.length} keys, ${files.length}
locale(s) in parity` `` — 8,505 "keys", with the 14 arrays counted as keys like any
other. Nothing in the output distinguishes strings checked from containers passed
over, so a green run was indistinguishable from a complete one. (On 2026-09-14
the gate is not green in any case: it exits 1 on one unrelated finding, an English
API-error leak at `app/features/setup-studio/useWizardSession.ts:660`.)

## The two walkers that recurse

`personas/scripts/i18n/check-escapes.mjs` is the technique's shape almost
entirely:

- `walk()` at `:54-62` descends strings, arrays (`:57-58`, addressing items as
  `path[i]`) and objects.
- `countStrings()` at `:118-123` is a separate recursion that counts every
  string, including those in arrays (`:120`), and the summary at `:130` prints
  `` `${files.length} locales, ${valuesScanned} values scanned` ``.
- A self-test (`:64-86`) runs before every scan, and a failed one refuses the run
  (`:90-93`): "the matcher no longer detects its own fixtures. Fix it before
  trusting a green run."
- An empty locale directory fails (`:100-102`): "looked at nothing, which is not
  the same as finding nothing."

Its one gap against the technique: the count is printed, not asserted. `walk()`
and `countStrings()` share their recursion shape, so they cannot disagree today,
but nothing fails if a future edit makes them.

`personas-web/scripts/check-i18n-coverage.mjs` recurses correctly for a
different purpose. `compareShape()` (`:55-102`) handles arrays explicitly
(`:67-80`), including a length comparison against English (`:72-74`), and
descends into each item. It checks shape and emptiness, not typography, and its
report is `` `${locale}: 100%` `` (`:121`) with no count of what was compared. It
is the counter-example for recursion only, not for counted coverage.

## The repair, applied the same day (`kp` `8450dbb1`)

The deviation was closed on 2026-09-14 by an apply pass, as a paired run:

| | before | after the walker change, before recast | final |
|---|---|---|---|
| units the gate reads per locale | 8,505 "keys" (arrays as one key) | 8,553 strings, 62 inside 14 arrays | same |
| independent string count, 4 locales | not reported | 34,212, equal | 34,212, equal |
| house dash findings | 0 | **4** | 0 |
| new syntax, placeholder or list-length findings in array strings | — | 0 | 0 |

(The catalogs had grown from 8,491 to 8,553 string leaves between the first
measurement and the fix; the 14 arrays and 62 array strings were unchanged.)

What changed: the array-aware walk moved into `scripts/i18n/catalog-check.mjs`,
addressing array strings as `landing.voice.transcript[0]` and adding a
cross-locale list-length check; the gate fails on zero strings, on any non-string
leaf, and when the walker's count differs from an independent recursion; the
coverage line prints on failure as well as success; fixtures in
`i18n/catalog-check.test.ts` (9 of 9) prove a banned dash inside an array and
inside an object inside an array, a placeholder mismatch in a list, a list-length
mismatch and a count mismatch all fail. The key list feeding key parity and two
plain-path lookups was left on container keys, so array addresses created no
false missing-key findings.

**The measurement undercounted, which is the technique's point made twice.** The
first walk looked for the em dash only. Once the gate itself saw the arrays it
reported four findings at `landing.voice.transcript[0]`: the English em dash, and a
prose en dash — also banned by §5 — in each of `cs`, `de` and `fr`. A one-off count
written for one character found one; the rule set run over every unit found the
rest. All four were recast with a full stop.
