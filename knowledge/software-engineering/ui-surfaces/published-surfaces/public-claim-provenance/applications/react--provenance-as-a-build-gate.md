---
layer: application
type: application
subject: public-claim-provenance
technique: provenance-as-a-build-gate
stack: react
status: forged
verified_on: 2026-08-24
verified_against: react@19
---

# Provenance as a build gate — politicas

Politicas is a Czech public-accountability product whose brand rule is that
every rendered number cites its source, and it is the clearest specimen of
this technique available: the rule is an error-level ESLint rule, the rule set
has been lifted out of the repository into a self-contained plugin, and the
severity ladder is measured rather than asserted.

## The rule set is a package, and the repository is its first consumer

`packages/eslint-plugin-civic-transparency/` is a dependency-free flat-config
plugin: `index.cjs`, eight rule modules under `rules/`, eight per-rule docs
under `docs/rules/`, and its own test runner. The in-repo `eslint-rules/*.cjs`
files that used to hold the implementations are now six-line re-exports —
`eslint-rules/require-source-citation.cjs` is a header naming the canonical
source and one `module.exports = require(...)` line — so the historical rule
paths keep resolving and there is exactly one implementation.

The preset ladder is at `index.cjs:61-93`, split on the axis the technique
names, with the rationale written above it at `:46-60`: `recommended` carries
"the generic discipline, adoptable by any TS/React repo" (five portable rules
at error, two whose fix paths name project conventions at warn), and `strict`
adds the two doctrine rules — `require-source-citation` and
`no-raw-number-display` — with an explicit admission that they are not generic
best practice: "Only adopt these two if your project has a formatting
chokepoint shaped like lib/format.ts and provenance components shaped like
SourceNote". `README.md:19-30` is the eight-rule table with per-preset
severity, and the paragraph at `:32-35` states the technique's documentation
obligation directly: each doc covers when it fires, its escape hatches, and
"which constants to map onto your project".

The repository consumes the package without the presets — `eslint.config.mjs`
imports it at `:14` and registers it under the historical `custom` prefix at
`:65`, with the reason in a comment at `:7-12`. That is the extraction working
as intended: the package owns the rules, the consumer owns the severities.

## The trigger set, precision over recall

`rules/require-source-citation.cjs:1-47` is the rule's contract, written in
the header before any code, and it states the principle in the technique's own
terms: "Precision over recall — every trigger requires positive evidence that
the value is a formatted domain number rendered to the reader." Three
triggers, all resolved at `Program:exit` (`:190-197`):

1. `X.dec(...)` / `X.int(...)` / `X.czk(...)` member calls (`NUMERIC_MEMBER_FORMATTERS`,
   `:49`) in JSX child position, **only** in a file that imports the
   formatting chokepoint — `CHOKEPOINT_SOURCE` at `:58` matches
   `lib/format`, `lib/i18n/useFormat` and `moneyTypes`, and the candidate is
   discarded at `:193` if no such import was seen. Any identifier may be the
   receiver, so `const f = useFormat()` and destructured renames all match.
2. Direct calls to formatter names imported from the chokepoint (`:50-57`),
   tracked by **local** name at `:152` so a renamed import still matches, and
   checked against that set at `:194`.
3. `<AnimatedScore/>` (`:181-183`) — the canonical score display.

The non-triggers are as deliberate as the triggers and are documented at
`:24-27`: dates ("context, not claims") are absent from both formatter sets;
formatter calls in JSX attributes are excluded by `isJsxChildExpression`
(`:71-96`), which walks up from the call and returns false the moment it meets
a `JSXAttribute` (`:78`) — so `aria-label={f.int(n)}` is silent; and raw
numeric literals are excluded outright, with the reason stated as a limit
rather than an oversight ("no way to distinguish a claim from an index or a
column count statically").

The chokepoint the rule stands on is enforced by its pair.
`rules/no-raw-number-display.cjs:1-18` bans `.toFixed()` and the
`.toLocale*()` family outside `lib/format.ts`, and its header supplies a
second reason for the chokepoint beyond provenance: `toLocaleString` output
differs between server and client ICU versions and breaks hydration. The two
rules ship together in `strict` because neither is decidable without the
other.

## File scope, and the annotation for what file scope cannot see

`fileSatisfied` (`:125`) is set by any of six provenance elements —
`SourceNote`, `SourceRef`, `DataUnavailable`, `LiveDataNotice`,
`CitableNumber`, `ProvenanceCapsule` (`:59-66`) — appearing anywhere in the
module, and `Program:exit` returns immediately when it is set (`:191`). The
header argues the choice at `:41-44`: "many surfaces render the figure in a
leaf element and the SourceNote as a sibling caption, and a subtree walk would
flag exactly those correct layouts."

The stated limit follows immediately — a file-level check cannot see a
citation in a parent component — and `// citation-ok: <reason>` is the
per-site exit for it. `hasInlineOptOut` (`:128-137`) accepts the comment on
the flagged line or the line above. It is a reason-carrying annotation rather
than an `eslint-disable`, which is the distinction this subject draws about
labels applied to suppressions.

## The escape hatch, disclosed to the reader

`data-undisclosed` as a JSX attribute satisfies the rule anywhere in the file
(`:185-189`), and the condition attached to it is the technique's central
move, stated at `:33-36`: an element carrying it "must render a visible 'bez
zdroje' badge so the missing source is disclosed to the READER, not just to
lint." The rule's own message repeats the condition to whoever hits it
(`:112-116`).

The header is also honest about the enforcement boundary — "documented here,
not yet machine-enforced on old code" — which is the right shape for a
condition a static rule cannot check. The technique asks for exactly that:
state the reader-visible obligation at the rule, in the same breath as the
hatch.

## The severity ladder is measured, and the exemptions shrink

`eslint.config.mjs:79-107` is the burn-down, with the inventory in the
comment: both doctrine rules run at `warn` over `features/**` and `app/**`,
and at `error` over `app/**` alone, because "`app/**` measured clean for BOTH
rules (2026-07-30 inventory: 29 warnings, all under features/**)". The clean
zone cannot regress while the rest burns down, and the count and date are on
the record so the burn-down is checkable. One `off` zone exists —
`features/labs/**`, the archived fixed-art-direction area (`:99-106`) — scoped
to a directory (`:99-107`) and justified as not reader-facing.

The zones-shrink rule is enforced culturally and has been paid for.
`CLAUDE.md:145-147` makes it a definition-of-done line: the custom rules pass
"unsuppressed … fix the code; do not disable a rule, add an `eslint-disable`,
or widen an exemption zone". `eslint.config.mjs:121-126` records the case
that proved it — a `features/graph/**` carve-out written as temporary "until
the in-flight round-4 rework lands" outlived its reason, "meanwhile the
exclusion hid a real class-2 site … which pinned an empty `/graf` for the
whole process lifetime". The zone was removed rather than renewed.

The rules are tested and gated: `package.json:12` runs the plugin's own suite
(`test:rules`), and `:13` puts it inside the composite `check` alongside
typecheck, lint, test and two census gates.

## Deviations

1. **The flagship rule is not yet at error where most of the surface is.**
   `features/**` runs at `warn`, so the doctrine is currently unshippable only
   under `app/**`. The inventory is dated 2026-07-30 and the burn-down has no
   recorded end state, which is the point at which a measured ladder starts to
   read as a permanent severity.
2. **The reader-visible half of the escape hatch is unchecked.** Nothing
   verifies that a `data-undisclosed` element renders the "bez zdroje" badge.
   The condition is documented at the rule and in the message, and a companion
   check — the badge component being the only thing allowed to set the
   attribute — would close it inside the same rule file.
3. **The contributor doc under-counts the gate.** `CLAUDE.md:104` still says
   "eslint incl. 4 custom rules", `:109-118` lists six, and the package ships
   eight — so the document a new contributor reads under-reports the gate they
   are about to hit, including the doctrine rule this application is about.
