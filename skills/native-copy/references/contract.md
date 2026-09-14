# The copy contract - `docs/i18n/copy-contract.json`

The contract is the project's DECLARED English: the choices on which authorities genuinely
disagree (spelling variant, dash system, quotes, case per element class), the termbase, and
which rules block. It lives in the consuming project, is committed, and is read by
`scripts/copy-check.mjs` on every run. A different path is passed with `--contract <path>`.

Two principles shape it:

- **Declare and hold.** No evidence says US beats UK, sentence case beats title case, or
  curly quotes beat straight ones. The defect is mixing. So the checker enforces only what
  the contract declares; an undeclared mechanic defaults to `"any"` and is never guessed.
- **Count before declaring.** `copy-check --init` counts every string in scope and prints
  the counts beside each proposed choice. A catalog that "looks US" to someone sampling
  a handful of files can be genuinely mixed.

Keys starting with `_` are notes and are ignored (the `--init` proposal carries its counts
in `_notes`). Any other unknown key is a config failure (exit 2), so a typo such as
`"quote"` cannot silently leave quotes unchecked.

## Schema

| key | type | default | meaning |
| --- | --- | --- | --- |
| `variant` | `"US"` or `"UK"` | required | Spelling variant held on every surface. EN-SPELLING flags the other variant's forms. |
| `spelling` | `"standard"` or `"oxford"` | `"standard"` | `"oxford"` (UK only) accepts `-ize`/`-yze` with British spelling otherwise. |
| `sources` | array of `{ path, kind }` | required | `path` is a file or glob relative to the project root (`**`, `*`, `?`, `{a,b}`); `glob` is accepted as an alias. The first source to match a file claims it. |
| `sources[].kind` | `json-catalog`, `ts-module`, `jsx`, `mdx`, `markdown` | required | Which extractor reads the file (below). |
| `exclude` | array of globs | `[]` | Removed after source expansion (`**/*.test.tsx`, `src/legacy/**`). |
| `dash.emDash` | `"allow"`, `"density"`, `"ban"` | `"density"` | `ban`: every U+2014 is an error. `density`: warn when a string under ~60 words carries more than one. `allow`: no em-dash findings. A spaced hyphen used as a dash is warned in every mode. |
| `quotes` | `"curly"`, `"straight"`, `"any"` | `"any"` | Double-quote glyph in rendered copy (EN-QUOTES). |
| `ellipsis` | `"char"`, `"dots"`, `"any"` | `"any"` | `char` flags `...`; `dots` flags U+2026 (EN-ELLIPSIS). |
| `case.style` | `"sentence"`, `"title"`, `"any"` | `"any"` | Case for heading- and button-class strings (EN-CASE). |
| `case.headingKeys` | regex source | see below | Tested against the LAST key segment (`landing.hero.title` tests `title`). JSX/MDX `h1`-`h6` are heading-class regardless. |
| `case.buttonKeys` | regex source | see below | Same, for buttons and CTAs (EN-CASE, EN-END-PUNCT). JSX `<button>` is button-class regardless. |
| `case.errorKeys` | regex source | see below | Tested against the WHOLE key; error-class strings may carry no `!` (EN-EXCLAIM). |
| `terms.accept` | array of strings | `[]` | Product and third-party names, matched as whole words. Masked before spelling, false-friend and case rules run, so `Colour Labs` or `Google Ads` never flag. |
| `terms.reject` | array of `{ term, use }` | `[]` | Forbidden variants: each occurrence is an EN-ONE-TERM error suggesting `use`. |
| `rules` | object `{ "EN-XXX": "error" or "warn" or "off" }` | `{}` | Per-rule severity override. Unknown IDs are a config failure; `--list-rules` prints the implemented set. |
| `baseline` | path | `.ai/copy-baseline.json` | Fingerprint file for the ratchet (below). |

Default key patterns (case-sensitive, so camelCase boundaries count):

```
headingKeys  ^(title|heading|headline|eyebrow|h[1-6])\d*$|[a-z0-9](Title|Heading|Headline|Eyebrow)\d*$
buttonKeys   ^(cta|button|btn|submit)\d*$|[a-z0-9](Cta|CTA|Button|Btn)\d*$
errorKeys    (^|\.)(errors?)(\.|$)|(^|\.)error[A-Z]\w*$|[a-z](Error|Failed|Failure)\w*$
```

Read the `--init` heading share before trusting it: if this repository names its CTAs
`heroStartFree`, the default `buttonKeys` sees none of them, and the contract should say so.

## What each kind extracts

| kind | extracts | skips |
| --- | --- | --- |
| `json-catalog` | every string leaf, recursively, **including arrays and objects inside arrays**; key path `a.b[2].c`; exact line | numbers, booleans, null, strings with no letter |
| `ts-module`, `jsx` | (one lexer for both) string and template literals that read as prose, or any lettered value inside a dictionary shape (an `en:` branch, or a root object named `T`, `copy`, `strings`, `messages`, `labels`, `dict`...); JSX text with inline children joined (`Welcome to <strong>Acme</strong>` is one string); `alt`, `title`, `aria-label`, `placeholder`, `label` attribute values | non-English locale branches (`cs:`, `de:`...), imports, `className`/`href`/`src`/`style`-like keys and attributes, `t()`/`cn()`/`clsx()`/`console.*`/`Error()` arguments, URLs, utility-class strings, identifiers, tagged templates |
| `mdx`, `markdown` | headings, paragraphs (joined across lines), list items, table cells, blockquotes, image alt text | frontmatter, fenced code, inline code (kept as the word `code`), `import`/`export` blocks, tag-only lines, HTML comments |

Before any rule runs, ICU is expanded: `{name}` becomes `Alex`, a count-like name
(`count`, `n`, `total`, `days`...) becomes `3`, plural/select render the `other` branch and
every other branch is linted as an extra variant, rich-text tags keep their inner text, and
an empty rich tag (`<path></path>`, filled at the call site) becomes a sample. Each string is
then a `fragment` (fewer than 5 words, or no terminal `.` `!` `?`) or a `sentence`;
sentence-level rules never run on fragments.

`copy-check --strings` prints exactly the strings the rules would see. Compare its count with
the catalog before trusting a green result.

## The baseline (ratchet)

`copy-check --baseline write` stores one fingerprint per finding:
`rule | file | key | sha1(raw text)`. A normal run exits 1 only for **error-severity findings
whose fingerprint is not in the baseline**. Warnings never block. Editing a baselined string
changes its hash, so the edit is gated like new copy. A fixed defect leaves an orphan
fingerprint; the run says how many, and rewriting the baseline tightens the ratchet.
Fingerprints, not counts: fixing one defect while adding another in the same file is visible.

`--baseline write` requires a full scan (never `--changed`). `--baseline ignore` checks as if
no baseline existed.

## Exit codes

- `0` - no new error-severity findings, every file readable.
- `1` - new error findings, or a source file could not be parsed (coverage incomplete).
- `2` - config or usage failure: missing or invalid contract, a source list that matches
  nothing, an unresolvable `--changed` base. The message says which.

## A filled example

```json
{
  "_notes": [
    "2026-09-14 --init: US forms 212, UK forms 9 (cancelled x4, colour x3); declared US.",
    "em 0, en 3; ban declared as a house ruling, see docs/i18n/style-en.md"
  ],
  "variant": "US",
  "sources": [
    { "path": "messages/en.json", "kind": "json-catalog" },
    { "path": "src/components/marketing/**/*.tsx", "kind": "jsx" },
    { "path": "content/blog/**/*.mdx", "kind": "mdx" }
  ],
  "exclude": ["**/*.test.tsx", "**/*.stories.tsx"],
  "dash": { "emDash": "ban" },
  "quotes": "curly",
  "ellipsis": "char",
  "case": {
    "style": "sentence",
    "headingKeys": "^(title|heading|eyebrow)\\d*$|[a-z0-9](Title|Heading)\\d*$",
    "buttonKeys": "^(cta|button)$|[a-z0-9](Cta|Button|Start\\w*)$"
  },
  "terms": {
    "accept": ["Google Ads", "GitHub", "Acme Cloud"],
    "reject": [
      { "term": "sign on", "use": "sign in" },
      { "term": "e-mail", "use": "email" }
    ]
  },
  "rules": {
    "EN-LATIN": "off",
    "EN-AMPERSAND": "error"
  },
  "baseline": ".ai/copy-baseline.json"
}
```

Record the reason for every `rules` override and every house ruling (a dash ban, a
title-case element class) in `docs/i18n/style-en.md`, citing the EN rule ID it overrides.
