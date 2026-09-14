# Lessons - native-copy

Append-only reflection lane. One entry per run that taught something. Format:
`## <version used> - <YYYY-MM-DD> - <project>` followed by `- ` bullets.

## 1.0.0 - 2026-09-14 - ai-registry

- **The first real catalog found the rule set's false positives, not its defects.** A read-only run against an 8,540-string US catalog produced 163 findings, and about 46 were wrong: "analyses" (the US noun plural) read as the UK verb, "Czech Labour Office" (a proper name) read as UK spelling, 30 of 33 "actual(ly)" hits were the native "real(ly)" sense, "robust" was a statistics term, and "simply" meant "merely". Each rule now carries the narrowing and a negative control named after the incident. A wordlist rule is not done until it has met a catalog it did not come from.
- **Rich-text placeholders manufacture defects when deleted.** An empty ICU tag (`<path></path>`, filled at the call site) stripped to nothing left a double space that EN-SPACING reported as an error. Expansion now samples empty tags like placeholders.
- **The dossier's measured defect had already been fixed upstream the same day.** The em dash the fleet dossier located inside a catalog array was gone by the time the checker ran (0 em dashes in the raw file, confirmed by a separate raw count, not by the checker). Zero findings from a gate is only evidence when a second instrument agrees.
