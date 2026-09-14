# Lessons - native-copy

Append-only reflection lane. One entry per run that taught something. Format:
`## <version used> - <YYYY-MM-DD> - <project>` followed by `- ` bullets.

## 1.0.0 - 2026-09-14 - ai-registry

- **The first real catalog found the rule set's false positives, not its defects.** A read-only run against an 8,540-string US catalog produced 163 findings, and about 46 were wrong: "analyses" (the US noun plural) read as the UK verb, "Czech Labour Office" (a proper name) read as UK spelling, 30 of 33 "actual(ly)" hits were the native "real(ly)" sense, "robust" was a statistics term, and "simply" meant "merely". Each rule now carries the narrowing and a negative control named after the incident. A wordlist rule is not done until it has met a catalog it did not come from.
- **Rich-text placeholders manufacture defects when deleted.** An empty ICU tag (`<path></path>`, filled at the call site) stripped to nothing left a double space that EN-SPACING reported as an error. Expansion now samples empty tags like placeholders.
- **The dossier's measured defect had already been fixed upstream the same day.** The em dash the fleet dossier located inside a catalog array was gone by the time the checker ran (0 em dashes in the raw file, confirmed by a separate raw count, not by the checker). Zero findings from a gate is only evidence when a second instrument agrees.

## 1.1.0 - 2026-09-14 - ai-registry

- **A whole-file rewrite of the rule module silently dropped three invisible characters.** The mask blank U+E000 and two no-break spaces did not survive being read back and rewritten, so masking became deletion and every offset after a URL or accepted term shifted. The paired run on the eight fleet trees went from 73 errors to 529 on one catalog (455 new) before a single rule had changed; only the before/after comparison exposed it, not the unit tests (62 of 63 still passed). Non-printing characters in a checker are now `\u` escapes, and a rewrite is followed by a code-point diff against HEAD.
- **Eight new rules met eight real catalogs: 152 findings, 148 of them one word.** EN-DIALECT-LEXIS flagged "CV" in every string of a hiring product whose market says CV. A vocabulary form is a catalog-wide ruling, so the rule now reports each form once per file with the count. One real false positive ("Advance warning" as a feature label) became a guard. Three rules had zero hits on every tree, which proves nothing about their recall.
- **Existing-rule findings were compared finding by finding, not by count.** Before and after matched exactly on all eight trees (rule, severity, file, key, offset, span), which is what "new 0" cannot show by itself: a count can hold while a finding moves.
