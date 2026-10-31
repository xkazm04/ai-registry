---
subject: import-normalization
domain: software-engineering
last_touched: 2026-09-03
dry_streak: 0
---

# import-normalization

First touch: [[2026-09-01-1]], the librarian sweep that drained the consumer-lead inbox. Never swept before; it sat 8th on the worklist on demand alone.

## 2026-09-01 - inbox leads landed

Two leads (personas, systedo-case). New technique `overlay-merge-absence-semantics`, written as
a stated design choice not a universal: three states (absent / present-and-empty / filled),
empty means "not mentioned", wholesale replacement needs an explicit marker; the vacuous
guard ("all of them are X" is an authorization the empty set always wins); integrity must
cover the merged result, not its ancestor. `intermediate-representation` gains "nothing
writes to the IR after the waist has run" (an override runs before the waist or re-applies
every guarantee by name; a guarantee attaches at a moment). Applications:
`node--overlay-merge-absence-semantics` (personas `b6dcf28aa`, the landed fix and three
honest divergences) and `node--intermediate-representation` (systedo-case `6279066f`, the
legitimate override form with guarantees re-applied in the caller rather than the override).
Proposals: the vacuous-guard rule belongs beside `gate-sees-target` in quality-gates;
"digest what lands" is a checksum-scope sighting for versioning-snapshots.
First touch: [[2026-09-02-1]]. Class: MATURE (6 techniques, 2 applications
node + rust; never swept before, 8 consumer deviations on the floor).

## State

6 techniques, 2 applications (node, rust). No version witness. Golden path
carries an "untrusted input" list that now names three cap axes.

## What run 2026-09-02-1 changed

- `import-validation` gained the section "Absent, null, and empty are three
  different words": a partial-document format declares which spelling means
  *untouched*; the merge tests presence before content; the replace-branch guard
  is "is the key present", never an all-of predicate (vacuously true on an empty
  collection). Anchored on RFC 7396 vs RFC 6902 vs the deep-merge convention.
- `import-validation` bounded-parsing rule gained the **expansion cap** as a
  third axis beside bytes and depth (CVE-2026-45304 as the gap).
- `format-detection` "bytes over labels" gained its condition: the outcome
  selects a parser, not an executable or rendering sink; the web platform's
  no-sniff rule reapplies the moment it would.
- `review-before-commit` and the golden path mirror the presence rule.

## Inbox ruling

The 2026-08-27 lead "empty collection in a patch means not mentioned, never
delete" was landed **restated** — RFC 7396 reads a present empty array as a
wholesale replace, so "empty means untouched" is one dialect's answer. The
mechanism (vacuous all-of, checksum-passed-before-merge blindness, fail-before
proof) is carried as the measured trap without the reporting project.

## Open leads (banked, with return conditions)

- **Proposed law "presence before content"** — a guard over a collection must
  test that the field was supplied before testing what it contains. Sibling of
  failure-not-empty-success ("nothing supplied" vs "supply nothing"). Three
  sightings, one subject. Return on a sighting outside integration.
- **Home-ambiguous technique: partial-document / overlay merge semantics.** The
  same rule for configuration layering, localization overlays and API PATCH
  handlers; landed here as a clause because re-import owns one instance. Return
  when a config-layering or i18n subject exists in this bundle.
- **Application follow-up**: the node application records a merge-sequence
  length cap that IS an expansion cap; tag it against the new clause on the next
  tree read, and check whether the rust side caps alias expansion at all.

## Declines

- A numeric threshold for "defaults favor the probable intent" — a number
  without measurement.
- The JSON deserializer's recursion-limit figure into the rust application — no
  tree read this run, no honest `verified_on` move.

### Impact (2026-09-02)

Stale verdicts after this landing: personas (1). Apply row: see `librarian/applied.md`.
## 2026-09-03 - `/intake` lightrag (run `intake-lightrag-0902`, intake 2.2.0, Opus workers)

New technique `durable-intermediate-representation`: the parsed IR persisted beside the source as a sidecar carrying parser identity and version, so re-chunking, re-extraction and parser unavailability never re-pay the parse. `intermediate-representation` says of itself that it is a staging shape, not the persistence model; this is the durable sibling, and the slug keeps the noun and changes the discriminating adjective. Golden path narrow-waist paragraph amended.

## 2026-10-31 - architecture review

Phase A judged all 14 documents against baseline `a2ac51c1c`. Two internal
inconsistencies: the golden path and the overlay technique each said a merge that
collapses absent and empty is broken, while declaring that both mean "not
mentioned"; and the disclosure table named the fourth grade `dropped` where the
capability table that assigns it says `unsupported`. One external claim was
refuted: the configuration-API merge dialect's own doc presents `null` and
`$patch: delete` as equivalent for maps, so the history of "two spellings of
delete producing different results" is not supported there. CVE-2026-45304,
RFC 7396 and both OWASP analogues were confirmed. The two open application leads
from 2026-09-02 (tag the merge-sequence cap as an expansion cap; check the rust
side's alias cap) are still owed and need tree reads.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/import-normalization",
  "date": "2026-10-31",
  "baseline": "a2ac51c1c",
  "digest": "sha256-b2:4981ff0ea8a59c1b",
  "disposition": "clarify",
  "coverage": "All 14 current documents read in full (golden path, 8 techniques, 6 applications); source checks cover the CVE, the two patch RFC/dialect claims and the two OWASP analogues, not the private application trees.",
  "counterexamples": [
    "A format whose overlay carries no delete at all may legitimately resolve absent, null and empty to one outcome (the node overlay application) - the invariant is that the distinction survives to the merge, not that the merge yields three outcomes.",
    "Under RFC 7396 a present empty array is a wholesale replace, so 'empty means not mentioned' is one dialect's answer, correctly stated as a declared choice.",
    "A small shallow YAML document passes byte and depth caps and still expands exponentially through collection aliases.",
    "A cheap deterministic parse makes the durable intermediate representation pure maintenance cost.",
    "A post-waist write can be a deliberate refusal of a guarantee (the ads-connector application) and still be legitimate when the compensation is stated."
  ],
  "sources": [
    {
      "url": "https://cveawg.mitre.org/api/cve/CVE-2026-45304",
      "result": "Confirms CVE-2026-45304 is the YAML component of a mainstream PHP framework: 'a small untrusted YAML input to expand into a multi-gigabyte structure and exhaust memory', fixed in 5.4.52/6.4.40/7.4.12/8.0.12. The 128 ceiling and the reject-all-aliases flag come from the vendor advisory summaries (GitLab advisory database), not the MITRE text."
    },
    {
      "url": "https://advisories.gitlab.com/composer/symfony/yaml/CVE-2026-45304/",
      "result": "Supports the import-validation clause: collection-alias resolutions capped at a default 128, scalar aliases uncapped, plus a flag that rejects all aliases for fully untrusted input."
    },
    {
      "url": "https://www.rfc-editor.org/rfc/rfc7396",
      "result": "Supports the three-spellings reading: 'Null values in the merge patch are given special meaning to indicate the removal of existing values in the target'; 'it is not possible to patch part of a target that is not an object, such as to replace just some of the values in an array'; unmentioned members stay 'untouched'."
    },
    {
      "url": "https://github.com/kubernetes/community/blob/master/contributors/devel/sig-api-machinery/strategic-merge-patch.md",
      "result": "Supports merge-by-key plus explicit directives ('replace directive indicates that the element that contains it should be replaced instead of being merged') and the motivation 'lists are always replaced. Often that isn't what we want.' Refutes the stated history: for maps, null and $patch: delete are presented as equivalent ('An equivalent way to delete this map'), so 'two documented spellings of delete produced different results' is not supported by this source."
    },
    {
      "url": "https://github.com/kubernetes/community/pull/620",
      "result": "retainKeys proposal; states no two-spellings-of-delete history either. Supports only that clients must send every field they want kept."
    },
    {
      "url": "https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html",
      "result": "Supports the intermediate-representation analogue verbatim: 'If you sanitize content and then modify it afterwards, you can easily void your security efforts.'"
    },
    {
      "url": "https://raw.githubusercontent.com/OWASP/ASVS/master/5.0/en/0x10-V1-Encoding-and-Sanitization.md",
      "result": "Supports the output-encoding half: requirement 1.1.2, encoding 'as a final step before being used by the interpreter'; 'Attempting to perform this too early may result in malformed content or render the encoding or escaping ineffective.'"
    },
    {
      "source": "Existing consumer applications",
      "result": "Private-tree citations and the live-install receipt count were not reopened; no application verified_on moved."
    }
  ],
  "documents": {
    "import-normalization.md": {
      "disposition": "clarify",
      "reason": "Overlay paragraph says a merge collapsing absent and empty 'has already lost the argument', contradicting the declared choice that both mean not mentioned; the invariant is that the parser must not collapse them before the merge decides. Otherwise a sound staged pipeline with clear borders and a correct when-not-to-build list."
    },
    "techniques/format-detection.md": {
      "disposition": "keep",
      "reason": "Three-outcome contract, honest speculative escalation and the parser-not-sink condition on sniffing are coherent and stable; no disputed external claim."
    },
    "techniques/adapter-capability-tables.md": {
      "disposition": "keep",
      "reason": "Specificity-sorted matching, one table for transformer/coverage/ledger, and the refusal of fabricating fallbacks are sound; its grade vocabulary (full/approximate/data-only/unsupported) is the authority the other documents should name."
    },
    "techniques/intermediate-representation.md": {
      "disposition": "keep",
      "reason": "Both outside analogues confirmed verbatim this run (OWASP XSS cheat sheet on modifying after sanitizing; ASVS 5.0 1.1.2 on encoding as the final step). Identity minting and no-post-waist-write rule are internally consistent with the applications."
    },
    "techniques/durable-intermediate-representation.md": {
      "disposition": "keep",
      "reason": "Discriminator is precise (temporal, not combinatorial), the four obligations and the optional-guard trap are well bounded, and the when-transient-is-right list supplies its counterexamples."
    },
    "techniques/import-validation.md": {
      "disposition": "clarify",
      "reason": "CVE-2026-45304 (128 collection-alias ceiling, reject-all-aliases flag) and RFC 7396 readings confirmed. The configuration-API dialect history ('grew replace and delete directives after its two documented spellings of delete were found to produce different results') is not supported: its own doc calls null and $patch: delete equivalent for maps. Restate to what the source supports."
    },
    "techniques/review-before-commit.md": {
      "disposition": "keep",
      "reason": "Staged state with a reaper, per-entity opt-in, explicit collision policy, staged-first receipt that must enumerate; consistent with the rust application's measured divergence."
    },
    "techniques/lossy-conversion-disclosure.md": {
      "disposition": "clarify",
      "reason": "Its grade table names the fourth grade 'dropped' while saying the grade is assigned in the capability table, which (with intermediate-representation and review-before-commit) names it 'unsupported'. One vocabulary, two spellings."
    },
    "techniques/overlay-merge-absence-semantics.md": {
      "disposition": "clarify",
      "reason": "Same self-contradiction as the golden path: 'a merge that collapses them into two is already broken' versus its declared choice that empty means not mentioned. The two patch conventions it describes are confirmed (RFC 7396 null removes / arrays replaced; merge-by-key with an explicit replace directive)."
    },
    "applications/node--format-detection.md": {
      "disposition": "clarify",
      "reason": "Owed from the 2026-09-02 run, still not done: tag the loader's maxMergeSeqLength against the import-validation expansion-cap clause - needs a tree read confirming what the option bounds and whether alias resolution is otherwise counted. Not applied: no tree read this run. No HEAD pin; citations not re-read, verified_on unchanged."
    },
    "applications/node--import-validation.md": {
      "disposition": "keep",
      "reason": "Dated before-after experiment (n=9) with its limits stated (predicates copied, Rust side walked not run); internally consistent with the overlay application."
    },
    "applications/rust--import-validation.md": {
      "disposition": "reverify",
      "reason": "Private-tree citations and the live-install receipt count (155 of 155 empty) were not reopened. Owed lead from 2026-09-02: check whether the rust side caps alias/reference expansion at all."
    },
    "applications/node--intermediate-representation.md": {
      "disposition": "keep",
      "reason": "HEAD-pinned; a legitimate deliberate post-waist refusal with the compensation and its weakness (caller-held, single call site) stated honestly."
    },
    "applications/node--overlay-merge-absence-semantics.md": {
      "disposition": "keep",
      "reason": "HEAD-pinned incident with fix, ordering table and regression test; divergences (no replace marker, no membership count, digest before transform) honestly stated."
    }
  }
}
```

Phase B applied the four confirmed clarify edits (golden path, overlay technique,
import-validation, lossy-conversion-disclosure). The record below is against the
new bytes; the application items stay owed.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/import-normalization",
  "date": "2026-10-31",
  "baseline": "a2ac51c1c",
  "digest": "sha256-b2:e4903b0af5df591d",
  "disposition": "clarify",
  "coverage": "All 14 current documents read in full (golden path, 8 techniques, 6 applications); source checks cover the CVE, the two patch RFC/dialect claims and the two OWASP analogues, not the private application trees. Second record after applying four confirmed clarify edits.",
  "counterexamples": [
    "A format whose overlay carries no delete at all may legitimately resolve absent, null and empty to one outcome (the node overlay application) - the invariant is that the distinction survives to the merge, not that the merge yields three outcomes.",
    "Under RFC 7396 a present empty array is a wholesale replace, so 'empty means not mentioned' is one dialect's answer, correctly stated as a declared choice.",
    "A small shallow YAML document passes byte and depth caps and still expands exponentially through collection aliases.",
    "A cheap deterministic parse makes the durable intermediate representation pure maintenance cost.",
    "A post-waist write can be a deliberate refusal of a guarantee (the ads-connector application) and still be legitimate when the compensation is stated."
  ],
  "sources": [
    {
      "url": "https://cveawg.mitre.org/api/cve/CVE-2026-45304",
      "result": "Confirms CVE-2026-45304 is the YAML component of a mainstream PHP framework: 'a small untrusted YAML input to expand into a multi-gigabyte structure and exhaust memory', fixed in 5.4.52/6.4.40/7.4.12/8.0.12. The 128 ceiling and the reject-all-aliases flag come from the vendor advisory summaries (GitLab advisory database), not the MITRE text."
    },
    {
      "url": "https://advisories.gitlab.com/composer/symfony/yaml/CVE-2026-45304/",
      "result": "Supports the import-validation clause: collection-alias resolutions capped at a default 128, scalar aliases uncapped, plus a flag that rejects all aliases for fully untrusted input."
    },
    {
      "url": "https://www.rfc-editor.org/rfc/rfc7396",
      "result": "Supports the three-spellings reading: 'Null values in the merge patch are given special meaning to indicate the removal of existing values in the target'; 'it is not possible to patch part of a target that is not an object, such as to replace just some of the values in an array'; unmentioned members stay 'untouched'."
    },
    {
      "url": "https://github.com/kubernetes/community/blob/master/contributors/devel/sig-api-machinery/strategic-merge-patch.md",
      "result": "Supports merge-by-key plus explicit directives ('replace directive indicates that the element that contains it should be replaced instead of being merged') and the motivation 'lists are always replaced. Often that isn't what we want.' Refutes the stated history: for maps, null and $patch: delete are presented as equivalent ('An equivalent way to delete this map'), so 'two documented spellings of delete produced different results' is not supported by this source."
    },
    {
      "url": "https://github.com/kubernetes/community/pull/620",
      "result": "retainKeys proposal; states no two-spellings-of-delete history either. Supports only that clients must send every field they want kept."
    },
    {
      "url": "https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html",
      "result": "Supports the intermediate-representation analogue verbatim: 'If you sanitize content and then modify it afterwards, you can easily void your security efforts.'"
    },
    {
      "url": "https://raw.githubusercontent.com/OWASP/ASVS/master/5.0/en/0x10-V1-Encoding-and-Sanitization.md",
      "result": "Supports the output-encoding half: requirement 1.1.2, encoding 'as a final step before being used by the interpreter'; 'Attempting to perform this too early may result in malformed content or render the encoding or escaping ineffective.'"
    },
    {
      "source": "Existing consumer applications",
      "result": "Private-tree citations and the live-install receipt count were not reopened; no application verified_on moved."
    }
  ],
  "documents": {
    "import-normalization.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: overlay paragraph no longer says a merge that maps absent and empty to one outcome has 'lost the argument' - that contradicted its own declared choice; the loss is collapsing them before the merge decides."
    },
    "techniques/format-detection.md": {
      "disposition": "keep",
      "reason": "Three-outcome contract, honest speculative escalation and the parser-not-sink condition on sniffing are coherent and stable; no disputed external claim."
    },
    "techniques/adapter-capability-tables.md": {
      "disposition": "keep",
      "reason": "Specificity-sorted matching, one table for transformer/coverage/ledger, and the refusal of fabricating fallbacks are sound; its grade vocabulary (full/approximate/data-only/unsupported) is the authority the other documents should name."
    },
    "techniques/intermediate-representation.md": {
      "disposition": "keep",
      "reason": "Both outside analogues confirmed verbatim this run (OWASP XSS cheat sheet on modifying after sanitizing; ASVS 5.0 1.1.2 on encoding as the final step). Identity minting and no-post-waist-write rule are internally consistent with the applications."
    },
    "techniques/durable-intermediate-representation.md": {
      "disposition": "keep",
      "reason": "Discriminator is precise (temporal, not combinatorial), the four obligations and the optional-guard trap are well bounded, and the when-transient-is-right list supplies its counterexamples."
    },
    "techniques/import-validation.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: configuration-API dialect sentence restated to what its own doc says (merges lists by key because whole-list replacement was 'often not what we want', carries explicit replace/delete directives); the unsupported history that two spellings of delete produced different results was removed. CVE-2026-45304 and RFC 7396 claims confirmed unchanged."
    },
    "techniques/review-before-commit.md": {
      "disposition": "keep",
      "reason": "Staged state with a reaper, per-entity opt-in, explicit collision policy, staged-first receipt that must enumerate; consistent with the rust application's measured divergence."
    },
    "techniques/lossy-conversion-disclosure.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: grade table's last row renamed from 'dropped' to 'unsupported' (meaning: dropped), matching the capability-table vocabulary the section says assigns the grade."
    },
    "techniques/overlay-merge-absence-semantics.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'a merge that collapses them into two is already broken' restated as a pipeline collapsing them before the merge decides, since the technique's own declared choice maps absent and empty to one outcome. Patch-convention descriptions confirmed against RFC 7396 and the strategic-merge-patch doc."
    },
    "applications/node--format-detection.md": {
      "disposition": "clarify",
      "reason": "Owed from the 2026-09-02 run, still not done: tag the loader's maxMergeSeqLength against the import-validation expansion-cap clause - needs a tree read confirming what the option bounds and whether alias resolution is otherwise counted. Not applied: no tree read this run. No HEAD pin; citations not re-read, verified_on unchanged."
    },
    "applications/node--import-validation.md": {
      "disposition": "keep",
      "reason": "Dated before-after experiment (n=9) with its limits stated (predicates copied, Rust side walked not run); internally consistent with the overlay application."
    },
    "applications/rust--import-validation.md": {
      "disposition": "reverify",
      "reason": "Private-tree citations and the live-install receipt count (155 of 155 empty) were not reopened. Owed lead from 2026-09-02: check whether the rust side caps alias/reference expansion at all."
    },
    "applications/node--intermediate-representation.md": {
      "disposition": "keep",
      "reason": "HEAD-pinned; a legitimate deliberate post-waist refusal with the compensation and its weakness (caller-held, single call site) stated honestly."
    },
    "applications/node--overlay-merge-absence-semantics.md": {
      "disposition": "keep",
      "reason": "HEAD-pinned incident with fix, ordering table and regression test; divergences (no replace marker, no membership count, digest before transform) honestly stated."
    }
  }
}
```
