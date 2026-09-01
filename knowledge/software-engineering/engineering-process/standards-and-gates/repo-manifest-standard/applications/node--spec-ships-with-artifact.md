---
layer: application
type: application
subject: repo-manifest-standard
technique: spec-ships-with-artifact
stack: node
status: forged
verified_on: 2026-09-01
verified_against: node@24
---

# The one reader in the kit was the one reader that could not see the bug

The Ascent repo (`C:\Users\kazda\kiro\ascent`) ships its manifest standard as a
kit: a serializer (`src/lib/standard/manifest.ts`), a vendored specification
(`src/lib/standard/spec.ts`) and a zero-dependency reference runner emitted into
every adopting repo as `.ai/doctor.mjs`. The specification carries the
reimplementation clause verbatim — "a reimplementation in another language is
conformant if it performs checks 1–7 against this spec" (`spec.ts:216`); the check
contract is language-neutral and the runner is only the reference. The suite that
guards the kit is where the clause turned out to be unproven.

## The round trip that proves the pair agrees with itself

`src/lib/standard/standard.test.ts:431-440` states the coupling honestly and
closes it: the serializer and the runner's parsers are "an IMPLICIT, executable
contract," and the block that follows extracts the runner's *actual* pure parsers
out of `buildDoctor().body` (`standard.test.ts:441-474`) and feeds them real
`serializeManifestYaml(...)` output, field by field
(`standard.test.ts:476-500`). That is a genuinely strong test of the shipped
regexes — it exercises them verbatim rather than a hand-copy — and it is exactly
the test that cannot detect a portability defect.

## The defect it could not detect

The serializer's `scalar()` quoted on a character class alone: any token matching
`[\w./@-]+` went out bare. Among those tokens are the YAML 1.1 implicit booleans
and nulls — `on`, `No`, `yes`, `n`, `true`, `off`, `null`, `~` — and anything
number-shaped. A repository may legally be named any of them, so the generated
contract could emit `name: on`, which a conforming full-format parser reads as
the boolean `true` rather than the string. The fix's own commentary
(`manifest.ts:203-212`) names why nobody saw it: the manifest's premise is that
"an arbitrary tool must be able to read it," but the runner's regex reader
"treats every value as text and so never saw this."

This is the canonical interop case for the format, known widely as the *Norway
problem* — `NO` for Norway coerced to `false` — and it is not a parser bug: YAML
1.1 specifies `n|N|no|No|NO|off|…` as false, and although YAML 1.2 (2009) removed
implicit boolean typing, the most-deployed libraries still implement 1.1. So the
disagreement is permanent and predictable: a subset reader passes the token
through as text, a full parser coerces it.

The repair is one exported `yamlScalar` (`manifest.ts:214-221`) testing the
character class *and* the ambiguity set *and* a number shape, shared with the
guardrails generator (`guardrails.ts:14-17`, used at `guardrails.ts:45`), which
had inlined its own copy of the character-class test and would have kept the hole
after the manifest's copy was fixed. Ordinary tokens still go out bare, so every
existing manifest is byte-identical.

## What the suite gained, and what it still owes

`standard.test.ts:143-170` now pins the emitter: twelve ambiguous tokens must be
quoted, ordinary tokens must stay bare (so the common manifest remains
diff-friendly), and the runner must read a quoted value back as the original
string.

Those are assertions about *characters the serializer wrote* — a proxy for the
property the standard actually claims. The suite has no full-format parser in it;
`package.json` carries no such dependency, so the reference runner remains the
only reader in the test bed. The proxy holds only as long as the hand-maintained
ambiguity list in `manifest.ts:214-216` stays complete, and nothing in the suite
would notice if it were not. The reimplementation clause is a promise about
readers written elsewhere; testing it needs one of those readers present —
reading the real emitted artifact and comparing the parsed object against the
`ManifestData` the serializer started from.
