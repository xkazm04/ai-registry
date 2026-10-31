---
domain: civic-intelligence
subject: accountability-publishing-ethics
last_touched: 2026-10-31
touched_by: architecture-review
dry_streak: 0
---

# accountability-publishing-ethics

## Architecture review - 2026-09-09

Retain the subject and all six techniques. Clarify the publication gate,
uncertain lookup states, subscription privacy and accessible sample labels.
This review creates the subject's first librarian note; it does not promote
maturity or refresh application verification dates.

## Open leads

- Recheck public publication paths, cache invalidation and rejection/correction
  behavior with consumer runtime tests before claiming end-to-end enforcement.
- Require illustrative classification and labels at the component boundary;
  verify route status and reader comprehension before claiming the design works.
- Revisit the bundle-wide symmetry law when reviewing adjacent subjects; the
  clarification here scopes it to population comparisons, not all journalism.

<!-- architecture-review:v1 -->
```json
{
  "subject": "civic-intelligence/accountability-publishing-ethics",
  "date": "2026-09-09",
  "baseline": "8c670a6506aa87556b42bbf7535e63592cc66fc6",
  "digest": "sha256:9388e3ad0aa405ff",
  "disposition": "clarify",
  "coverage": "All nine owned documents read. Local consumer component definitions, candidate module header and feed contract inspected. No consumer runtime, route authorization, historical incident reproduction or legal compliance evaluation performed. Application witness dates unchanged.",
  "counterexamples": [
    "An outage occurs while looking up an identifier that never existed; neither existence nor absence is established.",
    "Deleting a locally stored feed address leaves shared copies and intermediary history usable.",
    "An illustrative tile omits its optional tag and defaults to the real variant.",
    "A caveated public flag still accuses a named person before editorial review.",
    "A relative independently holds a covered mandate; kinship must not exclude their official acts.",
    "Deleting the adjective alleged strengthens the claim instead of making it factual."
  ],
  "sources": [
    {
      "url": "https://www.rfc-editor.org/rfc/rfc9110.html#section-15.6.4",
      "result": "Temporary service failure can use 503; truthful outage copy does not establish successful retrieval."
    },
    {
      "url": "https://www.rfc-editor.org/rfc/rfc9110.html#section-17.9",
      "result": "Addresses can be copied into histories and intermediary logs; accountlessness does not establish revocation or anonymity."
    },
    {
      "url": "https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html",
      "result": "Information conveyed by color needs a visible alternative. No reader-comprehension result established."
    },
    {
      "url": "https://www.ifj.org/who/rules-and-policy/global-charter-of-ethics-for-journalists",
      "result": "Articles 2, 5, 6 and 8 support fact/comment separation, verification and reply, correction and privacy. Not a jurisdiction-specific legal determination."
    },
    {
      "source": "Local consumer source inspection",
      "result": "Optional real/illustrative classification and label are concrete deviations. Comments describing gated feeds and HTTP 200 do not establish all runtime paths; private pointers retained locally."
    }
  ],
  "documents": {
    "accountability-publishing-ethics.md": {
      "disposition": "clarify",
      "reason": "Scope symmetry to population comparisons, preserve outage uncertainty and separate repeatable framing from editorial and legal judgment."
    },
    "techniques/accountless-notification-privacy.md": {
      "disposition": "clarify",
      "reason": "Local deletion does not revoke copies; remove universal telemetry sampling claims and scrub sensitive malformed values too."
    },
    "techniques/honest-empty-states.md": {
      "disposition": "clarify",
      "reason": "Lookup failure proves neither existence nor absence; add not-found state and prohibit displaying unmeasured values as zero."
    },
    "techniques/lead-not-verdict-framing.md": {
      "disposition": "clarify",
      "reason": "A caveat cannot bypass the editorial gate; rejection notices differ from accusatory copy."
    },
    "techniques/public-role-scope-limit.md": {
      "disposition": "clarify",
      "reason": "Public-record availability is not automatic republication justification; relatives with independent mandates remain in scope."
    },
    "techniques/real-vs-illustrative-form-encoding.md": {
      "disposition": "clarify",
      "reason": "Remove unsupported eye-tracking assertion; require visible and accessible labels and distinguish modeled figures from samples."
    },
    "techniques/severity-free-factual-framing.md": {
      "disposition": "clarify",
      "reason": "Preserve qualifiers such as alleged and estimated; deleting every adjective can strengthen unsupported claims."
    },
    "applications/process--lead-not-verdict-framing.md": {
      "disposition": "reverify",
      "reason": "Inspected candidate header and feed contract; source snapshots, cache invalidation, authorization and runtime publication behavior remain to verify."
    },
    "applications/react--real-vs-illustrative-form-encoding.md": {
      "disposition": "reverify",
      "reason": "Inspected component definitions: variant defaults to real and label is optional. Historical counts, contrast, response status and comprehension not reproduced."
    }
  }
}
```

## Architecture re-review - 2026-10-31

Trigger: stale since 2026-09-09 - the clarify edits that record asked for landed in the
same commit, and three code applications were added on 2026-10-14. Every clarify item
of 2026-09-09 is now present in the documents, so the six techniques and the golden
path move to keep. The two applications that rested on unreopened consumer evidence
stay `reverify`; the three new ones are honestly scoped A/B records and are kept
without re-running them. Nothing was edited this run, so there is one record.

**Intended benefit:** the subject now says what a template can and cannot settle, and
its applications name their own residue. **Failure if ignored:** a reader would treat
the 2026-09-09 'clarify' as still open and re-litigate settled wording. **Boundary:**
this is an editorial and source review, not a legal determination and not a runtime
check of the consumer platform.

<!-- architecture-review:v1 -->
```json
{
  "subject": "civic-intelligence/accountability-publishing-ethics",
  "date": "2026-10-31",
  "baseline": "3f7e1dfbc",
  "digest": "sha256-b2:df5e3b3acc0625d6",
  "disposition": "keep",
  "coverage": "All 12 owned documents read: the golden path, six techniques, and five applications (three added 2026-10-14). IFJ charter and German press code read. No consumer runtime, route authorization, telemetry project, incident reproduction or legal compliance evaluation; the consumer tree is not in this session. Application verified_on dates unchanged.",
  "counterexamples": [
    "react--honest-empty-states.md states its own residue: a query that throws against a ready store still returns null and renders 'no tie' - the technique's discriminated-state step is not yet true in the application it cites.",
    "A keyword advisory (public-role-scope-limit) moves the private-life decision to a reviewer; with no staffed review it is the same liability shield lead-not-verdict warns about.",
    "An illustrative tile omits its optional tag and defaults to the real variant (carried from 2026-09-09; the react application still records that deviation).",
    "Deleting the adjective 'alleged' strengthens a claim instead of making it factual (carried; now handled in the adjective test)."
  ],
  "sources": [
    {
      "url": "https://www.ifj.org/who/rules-and-policy/global-charter-of-ethics-for-journalists",
      "result": "Article 2 'clearly distinguish factual information from commentary and criticism'; Article 5 urgency must not take precedence over 'the verification of facts, sources and/or the offer of a reply'; Article 6 'rectify any errors'; Article 8 'respect privacy'. Supports the golden path's fact/allegation separation, reply and correction duties, and the privacy boundary. The charter has no presumption-of-innocence article, so it does not by itself support lead-not-verdict's 'professional codes require' sentence."
    },
    {
      "url": "https://www.presserat.de/pressekodex.html",
      "result": "Ziffer 13: 'Der Grundsatz der Unschuldsvermutung gilt auch für die Presse', for reporting on investigations and formal proceedings. Supports 'professional codes require reporting to respect it on unadjudicated matters'; the technique's extension to unreviewed machine candidates is its own analogy ('here that means'), stated as such. Ziffer 8 opens with respect for private life, qualified by public interest - consistent with public-role-scope-limit."
    },
    {
      "source": "Diff since the 2026-09-09 baseline",
      "result": "Verified that every clarify item of the 2026-09-09 record landed in the documents (symmetry scoped to population comparisons; outage preserves uncertainty; local deletion does not revoke copies; malformed values scrubbed; not-found state and no zero for unmeasured; caveat cannot bypass the gate; independent-mandate relatives covered; eye-tracking claim removed; qualifiers preserved). Three applications were added 2026-10-14."
    }
  ],
  "documents": {
    "accountability-publishing-ethics.md": {
      "disposition": "keep",
      "reason": "The 2026-09-09 clarify landed: symmetry is scoped to declared population comparisons with targeted investigation as a separate product, outage copy preserves uncertainty about existence, and the standards section says rung labels support but do not establish truth or legal compliance. The fact/reply/correction/privacy duties match IFJ Articles 2, 5, 6 and 8."
    },
    "techniques/accountless-notification-privacy.md": {
      "disposition": "keep",
      "reason": "The clarify landed: deletion does not revoke copies, the universal telemetry-sampling claim became 'defaults and sampling vary by deployment', malformed values are scrubbed, and the key-shape rule plus container walk was added from the 2026-10-14 application and matches it."
    },
    "techniques/honest-empty-states.md": {
      "disposition": "keep",
      "reason": "The clarify landed: five-way discriminated state including not-found within checked scope, unavailability that asserts neither existence nor absence, and zero only when measurement and coverage establish it."
    },
    "techniques/lead-not-verdict-framing.md": {
      "disposition": "keep",
      "reason": "The clarify landed: a caveat does not authorize a public flag, any exception needs a recorded editorial decision, and correction/rejection notices are distinguished. The presumption-of-innocence sentence is supported by press codes such as Pressekodex Ziffer 13 (read today), with the extension to candidates stated as the technique's own reading."
    },
    "techniques/public-role-scope-limit.md": {
      "disposition": "keep",
      "reason": "The clarify landed: a primary record supports provenance, not automatic republication; relatives with an independent covered mandate are covered. The new keyword-advisory rule agrees with its application (1089 strings, two measured false-positive terms cut)."
    },
    "techniques/real-vs-illustrative-form-encoding.md": {
      "disposition": "keep",
      "reason": "The clarify landed: the eye-tracking assertion is now 'a design failure to test, not a measured reading-rate claim', labels must be visible and accessible, and modeled figures get their own treatment."
    },
    "techniques/severity-free-factual-framing.md": {
      "disposition": "keep",
      "reason": "The clarify landed: the adjective test now protects qualifiers such as alleged, former and estimated."
    },
    "applications/process--lead-not-verdict-framing.md": {
      "disposition": "reverify",
      "reason": "Unchanged since 2026-09-09; its own review-limits paragraph says source snapshots, cache invalidation, authorization and runtime publication were not verified. The consumer tree is not reachable here."
    },
    "applications/react--real-vs-illustrative-form-encoding.md": {
      "disposition": "reverify",
      "reason": "Unchanged since 2026-09-09; records the optional-variant and optional-tag deviations and the unreproduced counts and contrast. Editorially, its review-limits subsection sits under 'The transplantable shape' heading, which reads oddly but misleads no one. Consumer tree not reachable."
    },
    "applications/react--accountless-notification-privacy.md": {
      "disposition": "keep",
      "reason": "A dated A/B record (A 3 leaking shapes, B 0) whose 'not measured' paragraph names the live telemetry project and other egress paths it did not test; the technique's key-shape rule is consistent with it. Not re-run; verified_on unchanged."
    },
    "applications/react--honest-empty-states.md": {
      "disposition": "keep",
      "reason": "A dated A/B record (false no-tie claims A 2 of 2 routes, B 0) that states its own unclosed case (a throwing query on a ready store). Honest scoping; not re-run; verified_on unchanged."
    },
    "applications/react--public-role-scope-limit.md": {
      "disposition": "keep",
      "reason": "A dated A/B record (11 of 11 hits after removing two measured false-positive terms over 1089 strings). 'At least six distinct times' and '11 hit instances' count different things (distinct crossings vs term hits) and do not conflict. Not re-run; verified_on unchanged."
    }
  }
}
```
