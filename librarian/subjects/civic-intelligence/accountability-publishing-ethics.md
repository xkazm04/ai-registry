---
domain: civic-intelligence
subject: accountability-publishing-ethics
last_touched: 2026-09-09
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
