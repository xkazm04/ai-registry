---
domain: civic-intelligence
subject: beneficial-ownership-resolution
last_touched: 2026-10-10
touched_by: intake-apply
dry_streak: 0
---

# beneficial-ownership-resolution

## Architecture review - 2026-09-09

Retain the subject and its six techniques. Correct identity, uncertainty,
interval and checksum claims; distinguish historical implementation intent
from the actual inspected classifier. No maturity promotion or refreshed
application witness is asserted.

## Apply - 2026-10-10 (ia-n2id-1010)

name-to-identifier-discipline gained its first application (node, politicas, code,
better). The consumer already had the injected resolver, the exact pick and the
one-token blacklist; it had no attractor detection and did not count drops. The
attractor rule was replayed on the consumer's own pre-purge population and held
(49 of 49 junk ties flagged against 0 of 49 for the blacklist alone; 0 of 196
legitimate ties held back). The technique gained a boundary: distinct persons,
the whole population before the write, a threshold above the measured legitimate
maximum, register-unconfirmed is no signal, and namesakes are out of the rule's reach.
The single-stack attention point does not move: the fleet's one civic project is
node. A second stack needs a second consumer.

## Open leads

- Consumer fixtures and repairs for identity collisions, disjoint tenures,
  pre-role events and mixed dated/undated input; return when the runtime
  comparison passes, not merely when the header describes the desired rule.
- Retrieve the authoritative identifier algorithm and applicable historical
  access/retention contracts before certifying source-specific conformance.
- A live full-chamber ingest with the attractor detector: its held-back list and
  drop count are the live arm the 2026-10-10 replay stood in for.
- Adjacent attribution subjects must preserve signature/payment distinctions
  and avoid treating an outside-tenure event as causal exoneration.

<!-- architecture-review:v1 -->
```json
{
  "subject": "civic-intelligence/beneficial-ownership-resolution",
  "date": "2026-09-09",
  "baseline": "8c670a6506aa87556b42bbf7535e63592cc66fc6",
  "digest": "sha256:7be1b2d166c9ad7f",
  "disposition": "clarify",
  "coverage": "All nine owned documents read. Identifier expression and role reconciler implementation inspected in a clean set of local consumer source files. Schema reference checked; live registry access, archive retrieval, historical incidents and consumer runtime were not rerun. Application dates and maturity unchanged.",
  "counterexamples": [
    "Two different people share a birth date; exactly one date match in a partial payload does not prove identity.",
    "A contract before the role started passes a test that checks only the end date.",
    "One undated contract plus one later contract cannot establish that every contract postdates the role.",
    "Combining two disjoint tenures into one envelope falsely includes events in the gap.",
    "Two ownership edges with non-overlapping validity intervals do not form a contemporaneous path.",
    "A legitimate company has a short name or an identifier scheme with letters and no check digit.",
    "A historical export is unavailable or lacks the requested year; repeating a guessed partition cannot prove absence."
  ],
  "sources": [
    {
      "url": "https://standard.openownership.org/en/latest/standard/reference.html",
      "result": "Version 0.4 schema separates identifier schemes, person attributes and dated interests; birthDate permits year/month/day precision and does not provide uniqueness."
    },
    {
      "url": "https://www.gov.uk/government/uploads/system/uploads/attachment_data/file/370246/uniformResourceIdentifiersCustomerGuide.pdf",
      "result": "Identifier guide lists scheme-specific company-number prefixes; one national numeric checksum rule cannot be universal."
    },
    {
      "source": "Local consumer source inspection",
      "result": "Confirmed date-only matching, earliest/latest merging, end-only comparison and removal of undated events before classification. Identifier weights and wrap expression match the published example. Private source pin and pointers retained locally."
    },
    {
      "source": "Worked counterexamples and arithmetic",
      "result": "One accepted decimal final digit per prefix rejects nine of ten final digits; source-code reasoning establishes classifier counterexamples, not execution or population impact."
    }
  ],
  "documents": {
    "beneficial-ownership-resolution.md": {
      "disposition": "clarify",
      "reason": "Use scheme-qualified identity, distinguish inconclusive from contradicted, and preserve both tenure bounds and archive access limits."
    },
    "techniques/identifier-checksum-validation.md": {
      "disposition": "clarify",
      "reason": "Checksum applicability is scheme-specific; replace 10/11 random-token rejection with the conditional 9/10 derivation."
    },
    "techniques/name-to-identifier-discipline.md": {
      "disposition": "clarify",
      "reason": "Common corroborating attributes and short-name heuristics do not prove identity or invalidity."
    },
    "techniques/officer-record-reading.md": {
      "disposition": "clarify",
      "reason": "Birth date is not unique; ambiguous or incomplete matches are inconclusive rather than evidence against a tie."
    },
    "techniques/role-period-reconciliation.md": {
      "disposition": "clarify",
      "reason": "Check starts, ends, gaps and date precision; separate signature from payment and keep mixed undated coverage unresolved."
    },
    "techniques/ownership-chain-traversal.md": {
      "disposition": "clarify",
      "reason": "Require overlapping edge validity and bounded cycle handling; preserve distinct paths without double-counting edges."
    },
    "techniques/struck-off-entity-archives.md": {
      "disposition": "clarify",
      "reason": "Historical access, partitioning and retention are source-specific; inaccessible exports do not establish absence or legal reuse permission."
    },
    "applications/node--identifier-checksum-validation.md": {
      "disposition": "reverify",
      "reason": "Implementation and printed arithmetic inspected; independent current register specification and historical incident impact not verified."
    },
    "applications/node--role-period-reconciliation.md": {
      "disposition": "reverify",
      "reason": "Implementation contradicts claimed ambiguity and mixed-undated handling; source findings recorded, consumer repair and fixtures outstanding."
    }
  }
}
```

## Architecture review - 2026-10-31

The 2026-09-09 clarifies are in the text. Four applications added since then were read, and their arithmetic recomputes. Two items needed correcting. A live register query refutes "neither person shape" for a state's text-only shareholder entry. The archive application's "conformant on every rule" contradicts its own gap section.

<!-- architecture-review:v1 -->
```json
{
  "subject": "civic-intelligence/beneficial-ownership-resolution",
  "date": "2026-10-31",
  "baseline": "8432a5cfa",
  "digest": "sha256-b2:6ed2df0c3ed437c2",
  "disposition": "clarify",
  "coverage": "All thirteen owned documents read: the golden path, six techniques and six applications, four of them added since 2026-09-09. The 2026-09-09 clarify items are present in the text. Application arithmetic was recomputed. The live register was queried for the shareholder-collection and text-owner claims, and the ministry's bulk-export catalogue was listed. The consumer tree, its tests and its stored payloads were not reopened, and application dates stay as they were.",
  "counterexamples": [
    "A state that owns shares is listed under the register's natural-person key with only a text name, no identifier and no birth date. A reader that sorts owners by person shape files it as a malformed person and skips it.",
    "A conformance read whose sweep fetches only the current-year export still leaves a dissolved entity unchecked until someone routes it to the dissolution-year partition by hand.",
    "Two different people share a birth date. Exactly one date match in a partial payload does not prove identity (retained from 2026-09-09).",
    "One undated contract plus one later contract cannot establish that every contract postdates the role (retained from 2026-09-09).",
    "A namesake that draws two or three people stays below any fan-in threshold that spares legitimate shared boards."
  ],
  "sources": [
    {
      "url": "https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty-vr/28196678",
      "result": "Queried 2026-10-31. A joint-stock company's record carries an `akcionari` collection beside `statutarniOrgany` and `ostatniOrgany`, with the organ-member shape (`clenoveOrganu`, `typAngazma: AKCIONAR`). That supports the officer-record application's fourth-collection finding."
    },
    {
      "url": "https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty-vr/70994226",
      "result": "Queried 2026-10-31. The state railway's shareholder entry has `datumVymazu: 2012-01-30` and sits under `fyzickaOsoba` with only `textOsoba`/`prijmeni: \"Česká republika\"`: no identifier, no birth date. The 2012 date-out is confirmed. The phrase 'neither person shape' is refuted: the entry is filed under the natural-person key and has no natural-person identity attributes."
    },
    {
      "url": "https://dataor.justice.cz/api/3/action/package_list",
      "result": "Listed 2026-10-31: 9,496 datasets named <legal form>-<full|actual>-<court>-<year>, years 2005-2026. package_show for sro-full-praha-2012 lists 'právní důvod výmazu' and 'likvidátoři' among the optional fields. This supports the court/form/year partition the archive technique and application describe. Licence text was not retrieved."
    },
    {
      "url": "https://standard.openownership.org/en/latest/standard/reference.html",
      "result": "Version 0.4. Interest types separate 'shareholding' ('An economic interest ... gained by holding shares') from 'votingRights' ('A controlling interest') and 'appointmentOfBoard'. birthDate may be 'YYYY, YYYY-MM, or YYYY-MM-DD'. Supports the ownership-versus-control and partial-date claims."
    },
    {
      "url": "https://docs.rs/crate/recon-cli/0.93.0/source/src/checkdigit/vat/cz.rs",
      "result": "A community implementation (not an official specification) uses weights 8..2, mod 11, with remainder 0 mapping to 1 and remainder 1 to 0. Recomputed by hand: 07043694 gives sum 117, r=7, check 4; 03007740 gives sum 78, r=1, check 0. Both printed examples hold. An official register specification was still not found."
    },
    {
      "source": "Arithmetic in applications/node--name-to-identifier-discipline.md and node--role-period-reconciliation.md",
      "result": "Histogram 166+12+2+1 = 181 entities. Ties 166+24+6+49 = 245. 245-49 = 196 legitimate. 49/245 = 20%, matching the technique's 'a fifth'. Batch 001's head of 15 plus 245 = 260, which reconciles the role-period application's 260/260. 42/211 = 19.9%, matching 'a fifth of all ties'. 16+17 = 33 in the ownership application."
    }
  ],
  "documents": {
    "beneficial-ownership-resolution.md": {"disposition": "keep", "reason": "The 2026-09-09 clarifies landed: scheme-qualified identity, the four-outcome vocabulary, disjoint tenures and archive access limits."},
    "techniques/identifier-checksum-validation.md": {"disposition": "keep", "reason": "Scheme-specific applicability and the conditional 9/10 derivation are present. The 1/11 wrap-class impact is consistent with the remainder distribution."},
    "techniques/name-to-identifier-discipline.md": {"disposition": "keep", "reason": "The 2026-10-10 attractor boundary agrees with its application's numbers (a fifth = 49/245). Short names are review triggers, not proof."},
    "techniques/officer-record-reading.md": {"disposition": "keep", "reason": "Birth date is a non-unique candidate key. The four states are kept apart, and keyless-negative is inconclusive."},
    "techniques/role-period-reconciliation.md": {"disposition": "keep", "reason": "Both bounds, gaps, event type and mixed undated coverage are stated."},
    "techniques/ownership-chain-traversal.md": {"disposition": "clarify", "reason": "'Owner entries that carry neither a legal-person nor a natural-person shape' is contradicted by the live register, which files the state's text entry under the natural-person key with no identifier or birth date. Reword as missing identity attributes rather than a missing shape."},
    "techniques/struck-off-entity-archives.md": {"disposition": "keep", "reason": "The partition, retention and access caveats hold. The ministry catalogue confirms per form/court/year full and actual datasets."},
    "applications/node--identifier-checksum-validation.md": {"disposition": "reverify", "reason": "Printed examples recomputed and the algorithm corroborated by independent community code. No official register specification was retrieved and the consumer was not reopened."},
    "applications/node--role-period-reconciliation.md": {"disposition": "reverify", "reason": "Unchanged since 2026-09-09. The shared-birth-date, tenure-gap, pre-role and mixed-undated repairs and fixtures are still owed by the consumer."},
    "applications/node--name-to-identifier-discipline.md": {"disposition": "reverify", "reason": "Internally consistent: histogram, tie and floor arithmetic recomputed. It is a replay over a stored payload; the live full-chamber arm and the consumer commit were not reopened."},
    "applications/node--officer-record-reading.md": {"disposition": "reverify", "reason": "The `akcionari` collection and its organ-member shape were confirmed live. The paired 23-tie result and the consumer change were not reopened. Its `registry-unconfirmed` state also carries 'could not be attempted' in the role-period application; the distinct flag is what keeps inconclusive and not-attempted apart."},
    "applications/node--ownership-chain-traversal.md": {"disposition": "clarify", "reason": "The state-owner entry's 2012 date-out was confirmed live, but 'neither person shape' is wrong: the register files it under `fyzickaOsoba` with only a text name."},
    "applications/node--struck-off-entity-archives.md": {"disposition": "clarify", "reason": "The opening claims conformance 'on every rule the technique states', while its own gap section says the sweep fetches only the current-year export and routing to the dissolution-year partition is manual. Narrow the claim; case 1's fetch was the manual re-point."}
  }
}
```

### Applied - 2026-10-31

Phase B applied the three clarifies. The two application items keep `reverify`, because their consumer evidence was not reopened.

<!-- architecture-review:v1 -->
```json
{
  "subject": "civic-intelligence/beneficial-ownership-resolution",
  "date": "2026-10-31",
  "baseline": "8432a5cfa",
  "digest": "sha256-b2:85e59c93d448fae9",
  "disposition": "reverify",
  "coverage": "Second record, same session, against the digest after Phase B. All thirteen owned documents read: the golden path, six techniques and six applications, four of them added since 2026-09-09. The 2026-09-09 clarify items are present in the text. Application arithmetic was recomputed. The live register was queried for the shareholder-collection and text-owner claims, and the ministry's bulk-export catalogue was listed. The consumer tree, its tests and its stored payloads were not reopened, and application dates stay as they were.",
  "counterexamples": [
    "A state that owns shares is listed under the register's natural-person key with only a text name, no identifier and no birth date. A reader that sorts owners by person shape files it as a malformed person and skips it.",
    "A conformance read whose sweep fetches only the current-year export still leaves a dissolved entity unchecked until someone routes it to the dissolution-year partition by hand.",
    "Two different people share a birth date. Exactly one date match in a partial payload does not prove identity (retained from 2026-09-09).",
    "One undated contract plus one later contract cannot establish that every contract postdates the role (retained from 2026-09-09).",
    "A namesake that draws two or three people stays below any fan-in threshold that spares legitimate shared boards."
  ],
  "sources": [
    {
      "url": "https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty-vr/28196678",
      "result": "Queried 2026-10-31. A joint-stock company's record carries an `akcionari` collection beside `statutarniOrgany` and `ostatniOrgany`, with the organ-member shape (`clenoveOrganu`, `typAngazma: AKCIONAR`). That supports the officer-record application's fourth-collection finding."
    },
    {
      "url": "https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty-vr/70994226",
      "result": "Queried 2026-10-31. The state railway's shareholder entry has `datumVymazu: 2012-01-30` and sits under `fyzickaOsoba` with only `textOsoba`/`prijmeni: \"Česká republika\"`: no identifier, no birth date. The 2012 date-out is confirmed. The phrase 'neither person shape' is refuted: the entry is filed under the natural-person key and has no natural-person identity attributes."
    },
    {
      "url": "https://dataor.justice.cz/api/3/action/package_list",
      "result": "Listed 2026-10-31: 9,496 datasets named <legal form>-<full|actual>-<court>-<year>, years 2005-2026. package_show for sro-full-praha-2012 lists 'právní důvod výmazu' and 'likvidátoři' among the optional fields. This supports the court/form/year partition the archive technique and application describe. Licence text was not retrieved."
    },
    {
      "url": "https://standard.openownership.org/en/latest/standard/reference.html",
      "result": "Version 0.4. Interest types separate 'shareholding' ('An economic interest ... gained by holding shares') from 'votingRights' ('A controlling interest') and 'appointmentOfBoard'. birthDate may be 'YYYY, YYYY-MM, or YYYY-MM-DD'. Supports the ownership-versus-control and partial-date claims."
    },
    {
      "url": "https://docs.rs/crate/recon-cli/0.93.0/source/src/checkdigit/vat/cz.rs",
      "result": "A community implementation (not an official specification) uses weights 8..2, mod 11, with remainder 0 mapping to 1 and remainder 1 to 0. Recomputed by hand: 07043694 gives sum 117, r=7, check 4; 03007740 gives sum 78, r=1, check 0. Both printed examples hold. An official register specification was still not found."
    },
    {
      "source": "Arithmetic in applications/node--name-to-identifier-discipline.md and node--role-period-reconciliation.md",
      "result": "Histogram 166+12+2+1 = 181 entities. Ties 166+24+6+49 = 245. 245-49 = 196 legitimate. 49/245 = 20%, matching the technique's 'a fifth'. Batch 001's head of 15 plus 245 = 260, which reconciles the role-period application's 260/260. 42/211 = 19.9%, matching 'a fifth of all ties'. 16+17 = 33 in the ownership application."
    }
  ],
  "documents": {
    "beneficial-ownership-resolution.md": {
      "disposition": "keep",
      "reason": "The 2026-09-09 clarifies landed: scheme-qualified identity, the four-outcome vocabulary, disjoint tenures and archive access limits."
    },
    "techniques/identifier-checksum-validation.md": {
      "disposition": "keep",
      "reason": "Scheme-specific applicability and the conditional 9/10 derivation are present. The 1/11 wrap-class impact is consistent with the remainder distribution."
    },
    "techniques/name-to-identifier-discipline.md": {
      "disposition": "keep",
      "reason": "The 2026-10-10 attractor boundary agrees with its application's numbers (a fifth = 49/245). Short names are review triggers, not proof."
    },
    "techniques/officer-record-reading.md": {
      "disposition": "keep",
      "reason": "Birth date is a non-unique candidate key. The four states are kept apart, and keyless-negative is inconclusive."
    },
    "techniques/role-period-reconciliation.md": {
      "disposition": "keep",
      "reason": "Both bounds, gaps, event type and mixed undated coverage are stated."
    },
    "techniques/ownership-chain-traversal.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'neither a legal-person nor a natural-person shape' now reads 'neither a legal-person identifier nor a natural person's identity attributes', noting a register may file the text-only state entry under its natural-person key (live register record)."
    },
    "techniques/struck-off-entity-archives.md": {
      "disposition": "keep",
      "reason": "The partition, retention and access caveats hold. The ministry catalogue confirms per form/court/year full and actual datasets."
    },
    "applications/node--identifier-checksum-validation.md": {
      "disposition": "reverify",
      "reason": "Printed examples recomputed and the algorithm corroborated by independent community code. No official register specification was retrieved and the consumer was not reopened."
    },
    "applications/node--role-period-reconciliation.md": {
      "disposition": "reverify",
      "reason": "Unchanged since 2026-09-09. The shared-birth-date, tenure-gap, pre-role and mixed-undated repairs and fixtures are still owed by the consumer."
    },
    "applications/node--name-to-identifier-discipline.md": {
      "disposition": "reverify",
      "reason": "Internally consistent: histogram, tie and floor arithmetic recomputed. It is a replay over a stored payload; the live full-chamber arm and the consumer commit were not reopened."
    },
    "applications/node--officer-record-reading.md": {
      "disposition": "reverify",
      "reason": "The `akcionari` collection and its organ-member shape were confirmed live. The paired 23-tie result and the consumer change were not reopened. Its `registry-unconfirmed` state also carries 'could not be attempted' in the role-period application; the distinct flag is what keeps inconclusive and not-attempted apart."
    },
    "applications/node--ownership-chain-traversal.md": {
      "disposition": "reverify",
      "reason": "applied 2026-10-31: 'neither person shape' now reads 'filed under the natural-person key with only a text name: no identifier, no birth date' (confirmed live with the 2012 date-out). The 33-row report, the 2.5 bn CZK volume and the consumer flag were not reopened."
    },
    "applications/node--struck-off-entity-archives.md": {
      "disposition": "reverify",
      "reason": "applied 2026-10-31: 'conformant on every rule' narrowed to the outcome-state, provenance and personal-data rules, with dissolution-year routing named as manual; case 1's fetch is attributed to the re-point script. The partition scheme was confirmed in the ministry catalogue; the consumer's batches were not reopened."
    }
  }
}
```
