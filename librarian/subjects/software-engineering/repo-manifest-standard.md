---
subject: repo-manifest-standard
domain: software-engineering
last_touched: 2026-09-23
dry_streak: 0
---

# repo-manifest-standard

First touch: [[2026-09-01-1]], the librarian sweep that drained the consumer-lead inbox.

## 2026-09-01 - inbox leads landed

Two leads (ascent). `generated-from-provenance` gains a second drift axis - the
producer/consumer boundary, where the producer's suite is silent by construction - and the
rule that every value the producer has already decided for itself is derived, never
retyped, and pinned by a test comparing the two. `spec-ships-with-artifact` gains the
second-reader requirement: a shipped reference reader implements a subset, so a suite whose
only reader is the reference is green forever; at least one independent full-format parser
must read the artifact. Corroborated by a platform's forced multi-step runtime migration of
generated action code and by the canonical bare-token boolean-coercion problem in a popular
config format. Applications at ascent `a57f272c`: `node--generated-from-provenance` extended
(every pre-existing citation in it was stale and was re-resolved; `verified_on` bumped) and
`node--spec-ships-with-artifact` new, which says plainly that the second reader is NOT yet in
the source repo's suite.
First touch: [[2026-09-02-monai-v2]] — the design read of a medical-imaging toolkit's
model-package contract. Class: EXTENDS (boundary candidate).

## 2026-09-02 — intake v2 design read, [[2026-09-02-monai-v2]]

**Source-tree application** `python--spec-ships-with-artifact`: a model package whose
metadata file names its own schema by URL (validated by the toolkit's own verify
command), whose version pins are floors ("later versions expected to work"), and whose
input constraints are shared-variable shape expressions (`"2**p*n"`) rather than example
shapes, with post-processed outputs declared apart from raw ones. Design decision D6's
metadata half. **Boundary candidate:** this subject's golden path scopes itself to "a
contract a repository carries about itself"; the tree applies the same three rules to a
*carried artifact* consumed by programs its author never meets. Whether the scope widens
or a sibling subject owns artifact self-description is a question for the forge run over
the handoff (`librarian/handoffs/2026-09-02-monai.md`), which also holds the config-language
half (`+key` merge markers, `_requires_`, consumer-checked required properties) that no
subject models.

## 2026-09-04 - [[2026-09-04-cargo-make]] (intake, run cargomake-0904)

Gained `version-gate-precedes-schema-gate` + `node--version-gate-precedes-schema-gate` (this registry's own taxonomy loader, A/B paired, shipped).

**This subject now carries both sides of a discriminator it previously held only one side of.** `must-ignore-unknown` is right for the many-reader contract this subject is named for; the new technique is the single-reader case, where rejecting unknown keys is correct and therefore a version declaration must be parsed in a pass of its own, before the schema, or a forward-written document reports as a pile of key errors. The discriminating question is *how many independently written programs read this document* - and the subject should be read as owning both answers, not as having contradicted itself.

**The apply step corrected the technique before the commit.** The obvious early return was wrong: the loader returns a triple whose callers guard on the parsed object, so an early return handing back a truthy object leaves them cross-checking against a subject map nobody populated - 191 spurious findings on this bundle. The version refusal must return the loader's existing *not-usable* signal. That paragraph exists in the technique because the tree refuted the first draft.

**Known gap in the shipped realization, stated in its application:** the check is a string equality against one schema id, not a floor comparison. The technique's "floor, not equality" rule is stated and not yet realized here; do not read this registry as evidence for it.

### 2026-09-17 - `/harvest backlog` wave 3, one technique + one application from a tension unit

`reserved-space-must-be-unusable`, from [[2026-09-16-squid]] (shape claim), [[2026-08-31-whatwg-html]] (invalid on purpose) and [[2026-08-31-verou-2026-blog]] (an experimental namespace preserves nothing). The subject owned the reader's half of the forward-compatibility promise (`must-ignore-unknown`) and what may change (`semver-additive-evolution`); nobody owned how an author reserves room. The tension resolved into three rungs ordered by what a writer loses today, with the third member confirmed as the bottom rung rather than contradicted. Measured on a free-form field a service had already carved two names out of by enumeration: a caller could write both and have them read as host policy, 2 to 0. The unhunted return is the timing rule - the shape half was no longer reachable at that seam, priced at one migration per key, because the space had been released free-form. The golden path gains a section (the room you keep is the room nobody can use) and a failure mode (the extension space was reserved by announcement).

## 2026-09-23 - [[2026-09-23-1]]

Lead drain (run lib-0923), L268 APPLICATION + AMEND. **Correction** to `must-ignore-unknown`: an in-place writer passes the foreign-key test by construction; the fixture must look owned and the assertion cover the whole file. Machine paths removed from four published applications.

**Impact** (stale verdicts before this landing, from the map rebuilt at the run start): none recorded.

## Architecture review - 2026-10-31

First architecture review, against `e3f00b8a4`. All 17 documents read in full.
The techniques are sound one by one. Four problems sit between documents or
against a primary source. (1) The golden path states *must ignore* as universal
and never links `version-gate-precedes-schema-gate`, even though its frontmatter
lists it, and `must-ignore-unknown` gives no single-reader exception. The
2026-09-04 entry above says the subject owns both answers, but the text does not
say so. (2) The version-gate Boundary says a multi-reader reader must not refuse
on "the version". `semver-additive-evolution` and `must-ignore-unknown` both
refuse on a higher contract major. These are two different fields (a reader-version
floor and the contract major), and the text runs them together. (3)
`generated-from-provenance` compares a fresh synthesis field by field against the
committed file, and the same file records when and at which revision it was
made. Those fields differ on every run, so the check can never be green. (4) The
YAML claims overstate their source. YAML 1.2 narrowed implicit booleans to
`true`/`false` but did not remove them, and js-yaml stopped coercing
`yes`/`no`/`on`/`off` at 1.0. The python application's "schema travels inside
the file" is really a download link, which is the location-as-identity this
subject's golden path warns against.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/repo-manifest-standard",
  "date": "2026-10-31",
  "baseline": "e3f00b8a4",
  "digest": "sha256-b2:ae86d5eb87b1c37f",
  "disposition": "clarify",
  "coverage": "All 17 current documents (golden path, 8 techniques, 8 applications) read in full. Every relative link resolves, including the _laws.md anchors. Primary sources were opened for the YAML typing claims, Node 20's end-of-life date, and the model-package specification at its pinned commit. Not evaluated: the private consumer trees the node, process and rust applications cite (none is available here). No verification date was refreshed.",
  "counterexamples": [
    "A tool's own configuration file has one reader. There, ignoring an unknown key turns a typo into a silent empty, so the golden path's unscoped 'a reader must ignore fields it does not recognize' is wrong for it.",
    "A multi-reader manifest declaring contract major 3, read by a major-2 reader, must be refused (semver-additive-evolution), even though the version-gate Boundary says multi-reader readers do not refuse on 'the version'.",
    "A synthesizer that writes its run date into the provenance block, then diffs a fresh run field by field against the committed file, reports drift on every run after the first day.",
    "A js-yaml 4 reader loads `name: no` as the string 'no', while PyYAML loads it as False. Both load `name: true` as a boolean. The disagreement depends on which library reads the file, not on the format's version alone.",
    "A model package whose 'schema' key holds a download URL cannot be validated in an offline clone unless the consumer has already vendored that exact file."
  ],
  "sources": [
    {
      "url": "https://yaml.org/type/bool.html",
      "result": "YAML 1.1 boolean type: 'y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF'. Supports the 1.1 ambiguity set in node--spec-ships-with-artifact."
    },
    {
      "url": "https://yaml.org/spec/1.2.2/",
      "result": "Core Schema 10.3.2: boolean 'true | True | TRUE | false | False | FALSE', null 'null | Null | NULL | ~'. The history section says 1.2 'removed many of the problematic implicit typing recommendations'. This refutes the application's 'YAML 1.2 (2009) removed implicit boolean typing': it narrowed it."
    },
    {
      "url": "https://github.com/nodeca/js-yaml/blob/master/CHANGELOG.md",
      "result": "1.0.0: '`y`, `yes`, `n`, `no`, `on`, `off` are not converted to Booleans anymore.' This refutes the unqualified 'the most-deployed libraries still implement 1.1' for the node ecosystem."
    },
    {
      "url": "https://pyyaml.org/wiki/PyYAMLDocumentation",
      "result": "The tutorial loads '[true, false, on, off]' as '[True, False, True, False]', so PyYAML still applies 1.1 resolution. That supports a scoped version of the claim."
    },
    {
      "url": "https://github.com/nodejs/Release",
      "result": "'20.x | End-of-Life | Iron | ... | 2026-04-30'. This confirms node--generated-from-provenance's 'maintenance window closed in April 2026'."
    },
    {
      "url": "https://raw.githubusercontent.com/Project-MONAI/MONAI/02201b8600df372cb425f2bb8e0cb7addd0df50f/docs/source/mb_specification.rst",
      "result": "Confirms 'later versions expected to work' for the three version pins, '\"2**p*n\" must be a multiple of a power of 2', and the optional 'post_processed_outputs'. The schema key is described as 'The download link of a JSON schema to verify this file', with example value 'https://github.com/Project-MONAI/MONAI-extra-test-data/releases/download/0.8.1/meta_schema_20220324.json'. So it is a location, not a name, and nothing about it is vendored."
    }
  ],
  "documents": {
    "repo-manifest-standard.md": {
      "disposition": "clarify",
      "reason": "The forward-compatibility section states must-ignore without scope and never links version-gate-precedes-schema-gate, which its frontmatter lists. Add the one-reader discriminator and the link. The drift sentence ('regenerate into a buffer, compare') should also exclude the provenance record's own when/revision fields."
    },
    "techniques/capability-not-tool-vocabulary.md": {
      "disposition": "keep",
      "reason": "Procedure, controls cross-check, exceptions and non-use cases hold together and agree with the golden path and the node application's control-placement section."
    },
    "techniques/pointers-not-embeds.md": {
      "disposition": "keep",
      "reason": "Resolution contract, never-point-at-unshipped and existence-is-not-resolution are consistent with each other and with node--pointers-not-embeds."
    },
    "techniques/must-ignore-unknown.md": {
      "disposition": "clarify",
      "reason": "'When not to use this' names closed accountings but not the single-reader artifact, which the sibling version-gate technique says inverts the rule. Add that boundary with the link."
    },
    "techniques/reserved-space-must-be-unusable.md": {
      "disposition": "keep",
      "reason": "The three rungs, shape versus enumeration and the install-at-opening rule are internally consistent. The rust application measures the enumeration cost it predicts."
    },
    "techniques/semver-additive-evolution.md": {
      "disposition": "clarify",
      "reason": "Content holds. Formatting only: a stray double blank line before the reader-reach bullet, and the next heading is glued to it with no blank line."
    },
    "techniques/spec-ships-with-artifact.md": {
      "disposition": "clarify",
      "reason": "'a conforming parser coerces it' is version-dependent. Under the YAML 1.2 core schema `no` stays a string, while `true` and `null` are typed under any version. Say which tokens coerce under which rules."
    },
    "techniques/version-gate-precedes-schema-gate.md": {
      "disposition": "clarify",
      "reason": "The Boundary's 'the version field is advisory ... do not refuse on the version' contradicts semver-additive-evolution's and must-ignore-unknown's refusal on a higher contract major. Scope it to the declared reader-version floor and name the contract major as a separate field."
    },
    "techniques/generated-from-provenance.md": {
      "disposition": "clarify",
      "reason": "The field-by-field drift comparison (step 2) would include the provenance block's own when/revision fields, which a fresh run rewrites. Exclude them explicitly, or the check can never be green."
    },
    "applications/process--spec-ships-with-artifact.md": {
      "disposition": "reverify",
      "reason": "Dated 2026-08-20 snapshot citing 'checks 1-6' at spec.ts:145, while node--spec-ships-with-artifact (2026-09-01) cites 'checks 1-7' at spec.ts:216. The private tree was not reopened, so which citation is current cannot be settled here."
    },
    "applications/python--spec-ships-with-artifact.md": {
      "disposition": "clarify",
      "reason": "The pinned spec confirms the floors, shape expressions and post_processed_outputs. But the 'schema' key is a download link, so the heading 'The schema travels inside the file' and the offline sentence overstate it. State that it realizes the per-artifact pointer, not offline resolution or name-not-location identity."
    },
    "applications/node--spec-ships-with-artifact.md": {
      "disposition": "clarify",
      "reason": "'YAML 1.2 (2009) removed implicit boolean typing' is refuted (the core schema keeps true/false). 'the most-deployed libraries still implement 1.1' is overstated (js-yaml dropped yes/no/on/off at 1.0; PyYAML keeps them). The code citations themselves were not re-checked."
    },
    "applications/node--generated-from-provenance.md": {
      "disposition": "reverify",
      "reason": "Node 20 end-of-life (2026-04-30) confirmed. The many line citations into the private tree were not reopened."
    },
    "applications/node--pointers-not-embeds.md": {
      "disposition": "reverify",
      "reason": "Internally consistent with the technique. Its citations into the private tree date from 2026-08-20 and were not reopened."
    },
    "applications/node--must-ignore-unknown.md": {
      "disposition": "reverify",
      "reason": "Consistent with the technique's in-place-writer paragraph. The four cited commits and test files were not reopened."
    },
    "applications/rust--reserved-space-must-be-unusable.md": {
      "disposition": "reverify",
      "reason": "Arms, floor and positive control are stated, and the 2 to 0 count matches the two keys. The consumer tree and its test runs were not reopened."
    },
    "applications/node--version-gate-precedes-schema-gate.md": {
      "disposition": "reverify",
      "reason": "Arm counts are internally consistent (5 / 1 / 1 plus the 191 naive-arm figure), and the floor-not-equality gap is disclosed. The registry loader at the cited version was not re-run in this pass."
    }
  }
}
```

## Architecture review - 2026-10-31 (clarify applied)

Applied the eight clarify items the earlier record named, against `2fbbde6db`.
The must-ignore and version-gate techniques now name their scopes and the field
each one refuses on. The provenance drift check leaves out the fields it
rewrites. The YAML claims now match YAML 1.2.2 and the two libraries' own
documents. The python application now says its schema pointer is a download
link. Seven applications keep `reverify` because their private trees were not
reopened, so `reverify` is now the overall disposition.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/repo-manifest-standard",
  "date": "2026-10-31",
  "baseline": "2fbbde6db",
  "digest": "sha256-b2:d3c28cc6f0a9145a",
  "disposition": "reverify",
  "coverage": "All 17 current documents decided. The eight clarify items the earlier 2026-10-31 record named were applied and the edited passages re-read. The edits rest on the sources opened that run (YAML 1.1 and 1.2.2, the js-yaml changelog, the PyYAML documentation, the pinned model-package specification) or on internal inconsistencies verified between the subject's own documents. The seven reverify applications are byte-unchanged; their private trees were not reopened. No verification date was refreshed.",
  "counterexamples": [
    "A tool's own configuration file has one reader. There, ignoring an unknown key turns a typo into a silent empty, so the golden path's unscoped 'a reader must ignore fields it does not recognize' is wrong for it.",
    "A multi-reader manifest declaring contract major 3, read by a major-2 reader, must be refused (semver-additive-evolution), even though the version-gate Boundary says multi-reader readers do not refuse on 'the version'.",
    "A synthesizer that writes its run date into the provenance block, then diffs a fresh run field by field against the committed file, reports drift on every run after the first day.",
    "A js-yaml 4 reader loads `name: no` as the string 'no', while PyYAML loads it as False. Both load `name: true` as a boolean. The disagreement depends on which library reads the file, not on the format's version alone.",
    "A model package whose 'schema' key holds a download URL cannot be validated in an offline clone unless the consumer has already vendored that exact file."
  ],
  "sources": [
    {
      "url": "https://yaml.org/type/bool.html",
      "result": "YAML 1.1 boolean type: 'y|Y|yes|Yes|YES|n|N|no|No|NO|true|True|TRUE|false|False|FALSE|on|On|ON|off|Off|OFF'. Supports the 1.1 ambiguity set in node--spec-ships-with-artifact."
    },
    {
      "url": "https://yaml.org/spec/1.2.2/",
      "result": "Core Schema 10.3.2: boolean 'true | True | TRUE | false | False | FALSE', null 'null | Null | NULL | ~'. The history section says 1.2 'removed many of the problematic implicit typing recommendations'. This refutes the application's 'YAML 1.2 (2009) removed implicit boolean typing': it narrowed it."
    },
    {
      "url": "https://github.com/nodeca/js-yaml/blob/master/CHANGELOG.md",
      "result": "1.0.0: '`y`, `yes`, `n`, `no`, `on`, `off` are not converted to Booleans anymore.' This refutes the unqualified 'the most-deployed libraries still implement 1.1' for the node ecosystem."
    },
    {
      "url": "https://pyyaml.org/wiki/PyYAMLDocumentation",
      "result": "The tutorial loads '[true, false, on, off]' as '[True, False, True, False]', so PyYAML still applies 1.1 resolution. That supports a scoped version of the claim."
    },
    {
      "url": "https://github.com/nodejs/Release",
      "result": "'20.x | End-of-Life | Iron | ... | 2026-04-30'. This confirms node--generated-from-provenance's 'maintenance window closed in April 2026'."
    },
    {
      "url": "https://raw.githubusercontent.com/Project-MONAI/MONAI/02201b8600df372cb425f2bb8e0cb7addd0df50f/docs/source/mb_specification.rst",
      "result": "Confirms 'later versions expected to work' for the three version pins, '\"2**p*n\" must be a multiple of a power of 2', and the optional 'post_processed_outputs'. The schema key is described as 'The download link of a JSON schema to verify this file', with example value 'https://github.com/Project-MONAI/MONAI-extra-test-data/releases/download/0.8.1/meta_schema_20220324.json'. So it is a location, not a name, and nothing about it is vendored."
    }
  ],
  "documents": {
    "repo-manifest-standard.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the forward-compatibility section now scopes must-ignore to many-reader documents and links version-gate-precedes-schema-gate for the one-reader case; the drift sentence now leaves the provenance record's own date and revision out of the comparison."
    },
    "techniques/capability-not-tool-vocabulary.md": {
      "disposition": "keep",
      "reason": "Procedure, controls cross-check, exceptions and non-use cases hold together and agree with the golden path and the node application's control-placement section."
    },
    "techniques/pointers-not-embeds.md": {
      "disposition": "keep",
      "reason": "Resolution contract, never-point-at-unshipped and existence-is-not-resolution are consistent with each other and with node--pointers-not-embeds."
    },
    "techniques/must-ignore-unknown.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'When not to use this' now names the single-reader document (reject unknown keys, gate on a version floor first) with a link to version-gate-precedes-schema-gate."
    },
    "techniques/reserved-space-must-be-unusable.md": {
      "disposition": "keep",
      "reason": "The three rungs, shape versus enumeration and the install-at-opening rule are internally consistent. The rust application measures the enumeration cost it predicts."
    },
    "techniques/semver-additive-evolution.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: formatting only; removed the stray double blank inside the look-additive list and put a blank line before 'The identity field beside the version'."
    },
    "techniques/spec-ships-with-artifact.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'a conforming parser' -> 'a full-format parser', plus a sentence saying which tokens coerce: true/null under any version, no/on only under the older rules some widely used libraries still apply."
    },
    "techniques/version-gate-precedes-schema-gate.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: in the Boundary, 'the version field is advisory' -> 'a declared reader-version floor is advisory', with a sentence that the contract major is a separate field a reader still refuses on (link to semver-additive-evolution); 'do not refuse on the version' -> 'on a reader-version floor'."
    },
    "techniques/generated-from-provenance.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: drift step 2 now also leaves out the provenance record's own date and revision, which a fresh run rewrites by construction."
    },
    "applications/process--spec-ships-with-artifact.md": {
      "disposition": "reverify",
      "reason": "Dated 2026-08-20 snapshot citing 'checks 1-6' at spec.ts:145, while node--spec-ships-with-artifact (2026-09-01) cites 'checks 1-7' at spec.ts:216. The private tree was not reopened, so which citation is current cannot be settled here."
    },
    "applications/python--spec-ships-with-artifact.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: heading 'The schema travels inside the file' -> 'The file names its own schema'; dropped the unsupported offline-vendored-copy sentence; added that the spec calls the value 'the download link of a JSON schema', so identity is a location and offline validation needs a pre-vendored copy. verified_on unchanged."
    },
    "applications/node--spec-ships-with-artifact.md": {
      "disposition": "reverify",
      "reason": "applied 2026-10-31: 'YAML 1.2 removed implicit boolean typing ... most-deployed libraries still implement 1.1' -> 1.2 narrowed booleans to true/false; PyYAML keeps the 1.1 set, js-yaml dropped yes/no/on/off at 1.0; true/null/~ stay typed under 1.2. Still reverify: its code citations into the private tree were not reopened, and verified_on is unchanged."
    },
    "applications/node--generated-from-provenance.md": {
      "disposition": "reverify",
      "reason": "Node 20 end-of-life (2026-04-30) confirmed. The many line citations into the private tree were not reopened."
    },
    "applications/node--pointers-not-embeds.md": {
      "disposition": "reverify",
      "reason": "Internally consistent with the technique. Its citations into the private tree date from 2026-08-20 and were not reopened."
    },
    "applications/node--must-ignore-unknown.md": {
      "disposition": "reverify",
      "reason": "Consistent with the technique's in-place-writer paragraph. The four cited commits and test files were not reopened."
    },
    "applications/rust--reserved-space-must-be-unusable.md": {
      "disposition": "reverify",
      "reason": "Arms, floor and positive control are stated, and the 2 to 0 count matches the two keys. The consumer tree and its test runs were not reopened."
    },
    "applications/node--version-gate-precedes-schema-gate.md": {
      "disposition": "reverify",
      "reason": "Arm counts are internally consistent (5 / 1 / 1 plus the 191 naive-arm figure), and the floor-not-equality gap is disclosed. The registry loader at the cited version was not re-run in this pass."
    }
  }
}
```
