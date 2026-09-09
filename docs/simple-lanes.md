# Practice and memory contracts

`node scripts/check-simple-lanes.mjs` validates both small lanes. The full gate and
unfiltered registry CI run it; catalog freshness alone does not validate these artifacts.

Practices live at `practices/<slug>/PRACTICE.md`. Required scalar frontmatter is `id`
(matching the kebab-case folder), `dimension` (`D` plus a positive integer), and
`applies-when` (a nonempty trigger). Any linked `starter/` target must exist within the
practice. A practice may explain an adoption without shipping a starter directory.

Memory lives at `memory/<kind>/<slug>.md`; `_index.md` is navigation. Required scalars
are `kind`, `confidence`, and `source`. Kind must match its directory and be `semantic`,
`episodic`, `procedural`, or `summary`. Confidence is a decimal between zero and one.
Namespace is optional for organization-wide notes and must be nonempty when supplied.

Both formats require nonempty bodies and unique, ASCII frontmatter keys/values. Prose
is UTF-8. Unknown metadata is allowed for additive compatibility; it is not discarded or
given semantics by this checker. Validation establishes format, not factual correctness,
adoption, or the calibration of a confidence value. Private evidence remains local.

The checker rejects wrong-depth note files rather than silently excluding them. Starter
templates remain templates; their placeholder text is not evidence of an adopted policy.
