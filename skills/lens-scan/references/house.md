# The house layer - company rules beside registry knowledge

Read from `SKILL.md` phase 0. The house layer lives **in the product repo**, at
`<repo>/.ai/house/` (overlay key `house`), and is tracked there:

```
.ai/house/
  profile.md                  # who this product is for and what it must respect
  standards/<subject>.md      # house rules for one registry subject, by technique slug
```

## Why it lives in the repo, not in the registry

Registry knowledge bundles are shared by every team that consumes them, and their gate
(`check-bundles`) bans product names, repo paths and company specifics on purpose: a
technique has to transplant to an unrelated team on a different stack. A company's
rules are the opposite - they are *about* one product, its users, its brand and its
constraints. Put them in a bundle and the bundle stops transplanting; put them nowhere
and every scan judges a regulated product by generic advice. So they live where the
product lives, are reviewed with its code, and override registry techniques by slug.
A house rule that turns out to be general is sent back as a registry lead (scan-sweep
§6, write side), never copied into a bundle by this skill.

## profile.md

Plain markdown with these `##` sections; any may be absent, and a missing section
means the scan uses no assumption for it (and says so).

| Section | What it carries | Used by |
| --- | --- | --- |
| `## Users` | Who uses the product, their expertise, devices, accessibility needs. | design judgement; `minTextPx` and state priorities |
| `## Industry` | Domain and regulation (for example: payments, health, public sector). | security severity, data-handling rules |
| `## Constraints` | Hard limits: supported platforms, performance budgets, severity definitions, data residency. | targets, severity, propagation scope |
| `## Brand` | Voice, design-system source, tokens location. | `rawLiterals`, design judgement |
| `## Stack` | Languages, frameworks, the runtime the product ships on. | which techniques apply at all |

## standards/<subject>.md

One file per registry subject the company has an opinion about. `<subject>` is the
registry subject slug exactly as the registry map names it, so a house file attaches
to the same contexts the subject governs.

```markdown
---
subject: data-tables
overrides: [client-side-sorting]
extends: [column-config]
---
# Data tables - house rules

- `server-sort`: when a table can exceed 200 rows, sort and page on the server, because
  the support tooling exports full result sets and client sorting truncates them.
- `sticky-actions`: when a row has more than two actions, put them in a trailing
  sticky menu, because operators work at narrow widths beside a second app.
```

(Example only: the subject, slugs and reasons are illustrative.)

- `subject` - the registry subject slug.
- `overrides` - technique slugs this file replaces. A scan judges the house lines and
  **not** the overridden technique.
- `extends` - technique slugs this file adds to. Both the technique and the house
  lines apply.
- Body: one rule per bullet, shaped **"when X, do Y, because Z"**, each opening with a
  stable **line id** in backticks. The id never changes once a scan has judged it,
  because coverage is tracked per line: a coverage or proposal `standard` for a house
  rule is `house:<subject>/<line-id>` (above: `house:data-tables/server-sort`). Rewording
  a rule keeps its id; changing what it demands takes a new id and retires the old one
  with a `retired:` prefix rather than deleting it, so old coverage rows still resolve.

## Precedence, once more

1. A house line beats the registry technique its file `overrides`.
2. A technique nobody overrides applies as written.
3. An `extends` file adds its lines; the technique still applies.
4. No house layer: `house: none` in the header, the run proceeds on registry techniques
   and the catalog's defaults, and the report warns that proposals may be out of touch
   with the company.

## Changing the house layer

The skill edits a house standard only through an approved `baseline-upgrade` proposal
(phase 6, [propagation.md](propagation.md)). It never edits `profile.md`; that is the
company's description of itself.
