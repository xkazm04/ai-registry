---
domain: software-engineering
subject: executive-reporting
last_touched: 2026-09-29
touched_by: deepen
dry_streak: 0
depth: L2
---

# executive-reporting

Subject note. Part of [[index]]; graded against [[standard]].

## Touch log

### 2026-09-29 - `/deepen`, first pass (Curator dispatch, never swept)

Re-read the source tree behind all three applications (ascent, five weeks after
`verified_on` 2026-08-20); no web lanes, so L2 on those claims and L1 elsewhere.

**Verified, left untouched.** Heading-not-filter, one ranked source with no
fallback, discard-not-edit, the closed-world payload, expiry sized to cadence
(seven days).

**Corrected and widened.**
- `grounded-narrative-generation`: the application's recorded deviation (membership
  passes a true number on the wrong subject) had been closed in code with a referent
  gate; technique now says membership is necessary, not sufficient, with the gate's
  three restraints. Provider rule added (the org's own model or none).
- `expiring-share-links`: both recorded deviations resolved. Per-grant `jti` with an
  injected revocation predicate; snapshot-vs-re-render gains the retention/erasure
  exception (live re-render + signed figure fingerprint, three-state result);
  evolve payloads by superset.
- `denominator-naming`: empty-population average is a division guard; per-figure
  basis, not a uniform one; "unchanged" claims include the denominator. New
  application `node--denominator-naming`.
- Line citations in all three applications re-resolved (a presentation split moved
  them); `verified_on` 2026-09-29, `verified_against: node@24` where a tree was read.

**Banked.** `bad-news-labelling` and `provenance-caveats` techniques were not
re-attacked; the counter-evidence lane was code-vs-claim only. Return when currency
flags an application or a second project grows a briefing seam.

### Impact

None: ascent maps four pairs to this subject, none judged, none stale.

## Architecture review - 2026-10-31

First architecture review. All eleven documents read. The six techniques are
internally consistent with each other and with the golden path (the disjointness
cap, the data-versus-presentation degradation asymmetry and the membership-plus-
referent gate are stated the same way everywhere they recur). The W3C TAG draft on
capability URLs and RFC 7519 were opened for the share-link technique: they support
expiry, per-grant identity and owner revocation, and add two points the technique
does not make (an expired capability answers 410 Gone or 404, and a capability URL
leaks through the Referer header). One invented figure was found in
`single-ranked-next-move` ("a one-in-five chance"), which no source or arithmetic
supports and which sits in a subject whose whole thesis is that a document may not
introduce a quantity. The four applications cite line numbers and commits in a
private project tree that was not available to this run, so they are `reverify`;
no verification date was refreshed.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/executive-reporting",
  "date": "2026-10-31",
  "baseline": "5a1c8dbf6",
  "digest": "sha256-b2:a43eabdaa650ed07",
  "disposition": "clarify",
  "coverage": "All 11 current documents decided: the golden path, six techniques and four applications. Cross-document consistency checked for the disjointness cap (technique rule versus the application's Math.min(3, Math.ceil(n/2))), the degradation asymmetry, the referent gate's three restraints and the per-figure denominator rule. Primary sources opened this run: the W3C TAG capability-URLs draft and RFC 7519 section 4.1.7. The private project tree behind the applications was not reachable; no runtime was executed and no verified_on date was refreshed.",
  "counterexamples": [
    "A report whose every reader holds an account and reads it inside the tool needs no forwarded-document contract; the definitions are one click away, and the obligations return only when the report is exported.",
    "A stored snapshot is the simpler and more reproducible design wherever the rendered artifact carries no retention or erasure obligation; the live-re-render-plus-fingerprint answer is justified only by that constraint.",
    "A metric whose polarity flips with context (spend against a target versus against a budget) defeats a single direction-of-good field unless it is split into two metrics.",
    "A numeric-membership gate passes a true figure attached to the wrong subject; the referent gate narrows that but deliberately leaves distant mis-bindings unchecked."
  ],
  "sources": [
    {
      "url": "https://www.w3.org/TR/capability-urls/",
      "result": "Read 2026-10-31 (a 2014 First Public Working Draft, so advisory). Supports expiry and revocation: 'Capability URLs should expire.'; 'it should be possible for that user to revoke the capability URLs associated with the resource that they control'. Supports the sensitive-data exclusion: 'The use of capability URLs should not be the default choice ... because they are only secure in tightly controlled circumstances.' Adds two points the technique lacks: 'When capability URLs expire, servers should respond to the URL with either a 410 Gone or a 404 Not Found response', and links out of a capability page 'should include rel=\"noreferrer\" to prevent the Referer header from being set'; such URLs also 'appear within application logs ... and in browser history'."
    },
    {
      "url": "https://www.rfc-editor.org/rfc/rfc7519#section-4.1.7",
      "result": "Read 2026-10-31. 'The \"jti\" (JWT ID) claim provides a unique identifier for the JWT', assigned so there is 'a negligible probability that the same value will be accidentally assigned to a different data object'. Supports the per-grant identifier minted at issue time; the RFC frames jti as replay prevention, not revocation, so a revocation ledger keyed on it is the technique's design, not the standard's."
    },
    {
      "source": "Internal arithmetic and cross-reference check",
      "result": "The disjointness rule (lesser of the display maximum and half the population rounded up) reduces to naive top-N/bottom-N for populations of at least twice the display maximum, as the technique claims. 'A one-in-five chance' in single-ranked-next-move has no basis anywhere in the subject."
    }
  ],
  "documents": {
    "executive-reporting.md": {
      "disposition": "keep",
      "reason": "The scope seams (metrics-rollups, measurement-honesty, structured-output, judgment-guardbands, signed-artifacts) are precise, the five-obligation contract matches the techniques, and the facts-verdicts-prose order is the mechanism every technique leans on. No unstable external claim."
    },
    "techniques/denominator-naming.md": {
      "disposition": "keep",
      "reason": "Internally consistent; the empty-population guard, per-figure basis and frozen absolute window rules agree with the golden path and the share-link technique. Claims are design rules, not external facts."
    },
    "techniques/bad-news-labelling.md": {
      "disposition": "keep",
      "reason": "Direction-of-good as declared data, heading-not-filter, and the disjointness cap are stated precisely; the cap's arithmetic checks out."
    },
    "techniques/provenance-caveats.md": {
      "disposition": "keep",
      "reason": "The four caveat kinds, the mixture-keyed caveat trap and the data-versus-presentation asymmetry are consistent with grounded-narrative-generation and the golden path."
    },
    "techniques/single-ranked-next-move.md": {
      "disposition": "clarify",
      "reason": "'A section that has a one-in-five chance of telling the organization to fix its best thing' states an invented probability with no source; replace it with the unquantified claim (a section that can tell the organization to fix its best thing). The no-fallback rule itself stands."
    },
    "techniques/grounded-narrative-generation.md": {
      "disposition": "keep",
      "reason": "The three guarantees, the union-built allowed set, literal-token comparison, the referent gate and its restraints, and the provider rule are coherent and match the golden path."
    },
    "techniques/expiring-share-links.md": {
      "disposition": "clarify",
      "reason": "Supported by the W3C capability-URLs draft and RFC 7519 on expiry, per-grant identity and revocation. Owed: (1) the expiry-page rule should say the page is served with a 410 Gone status rather than presented as a not-found, which the draft names as the expiry response; (2) a smell for the token leaking through the Referer header, logs or history, which the draft names and the technique omits."
    },
    "applications/node--denominator-naming.md": {
      "disposition": "reverify",
      "reason": "Coherent with the technique and the sibling applications, but every claim rests on line numbers and commits (92129579, fb0c8ccd) in a private tree not reachable this run."
    },
    "applications/node--expiring-share-links.md": {
      "disposition": "reverify",
      "reason": "The design (frozen window, superset payload evolution, injected revocation predicate, three-state fingerprint) matches the technique; the line anchors and quoted comments in the private tree were not reopened."
    },
    "applications/node--grounded-narrative-generation.md": {
      "disposition": "reverify",
      "reason": "Consistent with the technique, including the closed referent-gate deviation; its line anchors and quotations in the private tree were not reopened."
    },
    "applications/process--bad-news-labelling.md": {
      "disposition": "reverify",
      "reason": "The disjointness formula and the heading fix agree with the technique; the verbatim reader verdicts and line anchors live in a private tree not reachable this run."
    }
  }
}
```

## Architecture review - 2026-10-31 (clarify applied)

Applied the two clarify items the record above named. The invented probability in
`single-ranked-next-move` is gone; `expiring-share-links` names 410 Gone for an
expired grant and gains a referrer/log/history leakage smell, both from the W3C
capability-URLs draft read this run. Applications were not touched and keep
`reverify`, which is now the overall disposition.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/executive-reporting",
  "date": "2026-10-31",
  "baseline": "5a1c8dbf6",
  "digest": "sha256-b2:f454ac83cee0509a",
  "disposition": "reverify",
  "coverage": "All 11 current documents decided. The two clarify items owed by the earlier 2026-10-31 record were applied (single-ranked-next-move, expiring-share-links) and the edited passages re-read; the W3C capability-URLs draft opened this run backs the share-link edits. Other documents are byte-unchanged and keep their dispositions. The private tree behind the applications was not reopened and no verified_on date was refreshed.",
  "counterexamples": [
    "A report whose every reader holds an account and reads it inside the tool needs no forwarded-document contract; the definitions are one click away, and the obligations return only when the report is exported.",
    "A stored snapshot is the simpler and more reproducible design wherever the rendered artifact carries no retention or erasure obligation; the live-re-render-plus-fingerprint answer is justified only by that constraint.",
    "A metric whose polarity flips with context (spend against a target versus against a budget) defeats a single direction-of-good field unless it is split into two metrics.",
    "A numeric-membership gate passes a true figure attached to the wrong subject; the referent gate narrows that but deliberately leaves distant mis-bindings unchecked."
  ],
  "sources": [
    {
      "url": "https://www.w3.org/TR/capability-urls/",
      "result": "Read 2026-10-31 (a 2014 First Public Working Draft, so advisory). Supports expiry and revocation: 'Capability URLs should expire.'; 'it should be possible for that user to revoke the capability URLs associated with the resource that they control'. Supports the sensitive-data exclusion: 'The use of capability URLs should not be the default choice ... because they are only secure in tightly controlled circumstances.' Adds two points the technique lacks: 'When capability URLs expire, servers should respond to the URL with either a 410 Gone or a 404 Not Found response', and links out of a capability page 'should include rel=\"noreferrer\" to prevent the Referer header from being set'; such URLs also 'appear within application logs ... and in browser history'."
    },
    {
      "url": "https://www.rfc-editor.org/rfc/rfc7519#section-4.1.7",
      "result": "Read 2026-10-31. 'The \"jti\" (JWT ID) claim provides a unique identifier for the JWT', assigned so there is 'a negligible probability that the same value will be accidentally assigned to a different data object'. Supports the per-grant identifier minted at issue time; the RFC frames jti as replay prevention, not revocation, so a revocation ledger keyed on it is the technique's design, not the standard's."
    },
    {
      "source": "Internal arithmetic and cross-reference check",
      "result": "The disjointness rule (lesser of the display maximum and half the population rounded up) reduces to naive top-N/bottom-N for populations of at least twice the display maximum, as the technique claims. 'A one-in-five chance' in single-ranked-next-move has no basis anywhere in the subject."
    }
  ],
  "documents": {
    "executive-reporting.md": {
      "disposition": "keep",
      "reason": "The scope seams (metrics-rollups, measurement-honesty, structured-output, judgment-guardbands, signed-artifacts) are precise, the five-obligation contract matches the techniques, and the facts-verdicts-prose order is the mechanism every technique leans on. No unstable external claim."
    },
    "techniques/denominator-naming.md": {
      "disposition": "keep",
      "reason": "Internally consistent; the empty-population guard, per-figure basis and frozen absolute window rules agree with the golden path and the share-link technique. Claims are design rules, not external facts."
    },
    "techniques/bad-news-labelling.md": {
      "disposition": "keep",
      "reason": "Direction-of-good as declared data, heading-not-filter, and the disjointness cap are stated precisely; the cap's arithmetic checks out."
    },
    "techniques/provenance-caveats.md": {
      "disposition": "keep",
      "reason": "The four caveat kinds, the mixture-keyed caveat trap and the data-versus-presentation asymmetry are consistent with grounded-narrative-generation and the golden path."
    },
    "techniques/single-ranked-next-move.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'a section that has a one-in-five chance of telling the organization to fix its best thing' now reads 'a section that can tell the organization to fix its best thing', removing an unsourced probability."
    },
    "techniques/grounded-narrative-generation.md": {
      "disposition": "keep",
      "reason": "The three guarantees, the union-built allowed set, literal-token comparison, the referent gate and its restraints, and the provider rule are coherent and match the golden path."
    },
    "techniques/expiring-share-links.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the expiry-page paragraph now names 410 Gone as the status of an expired link (the W3C draft's expiry response); a smell was added for the token leaking through the Referer header, server logs and browser history."
    },
    "applications/node--denominator-naming.md": {
      "disposition": "reverify",
      "reason": "Coherent with the technique and the sibling applications, but every claim rests on line numbers and commits (92129579, fb0c8ccd) in a private tree not reachable this run."
    },
    "applications/node--expiring-share-links.md": {
      "disposition": "reverify",
      "reason": "The design (frozen window, superset payload evolution, injected revocation predicate, three-state fingerprint) matches the technique; the line anchors and quoted comments in the private tree were not reopened."
    },
    "applications/node--grounded-narrative-generation.md": {
      "disposition": "reverify",
      "reason": "Consistent with the technique, including the closed referent-gate deviation; its line anchors and quotations in the private tree were not reopened."
    },
    "applications/process--bad-news-labelling.md": {
      "disposition": "reverify",
      "reason": "The disjointness formula and the heading fix agree with the technique; the verbatim reader verdicts and line anchors live in a private tree not reachable this run."
    }
  }
}
```
