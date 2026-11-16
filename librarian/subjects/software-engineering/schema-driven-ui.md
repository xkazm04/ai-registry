---
subject: schema-driven-ui
domain: software-engineering
last_touched: 2026-11-16
dry_streak: 2
---

# schema-driven-ui

Forged 2026-08-18 from the personas tree. Six techniques, and two `react`
applications: the cockpit widget registry against the SurfaceSpec switch,
and the SurfaceSpec validation door. The librarian scan picked it on
2026-11-16 because it had one stack and had never been swept. First touch:
the `/deepen` loop below. That pass added a `python` application from a
public CMS tree, which clears the single-stack debt, and a third `react`
application for action consent.

## 2026-11-16 - `/deepen` loop (run `filler-deepen-20261116c`, /shift filler)

Dispatched by the librarian scan: a single stack (`react`), never swept, and
two applications dated 2026-08-18 with no `verified_against`.
`check-currency --volatile --subject schema-driven-ui` found no dated or
vendor-set figures in any of the nine documents.

#### Round 1 (survey round)

**Not dry. No new technique. Two rules flipped (each gained a condition).
Both applications were re-resolved and corrected; two new applications.**
The lanes were a read lane over personas at HEAD `8d076db46a` (read through
`git show`, so the working tree was never touched); a counter-evidence web
lane; a blind lane written down before any search; and the volatile facts.

- `registry-mapping` **flipped (condition added)**: "make the miss
  detectable" now says what detectable takes. The lookup answers only for
  registered kinds, so a registry on a structure with inherited default keys
  is wrong: key it on one with none, or test own membership. Side tables and
  spec-supplied data keys are covered too. Three lanes converged. The blind
  lane named prototype keys. The read lane found the cockpit registry as a
  plain object, looked up in three hosts whose miss check passes `toString`
  and `constructor`, while `compose_cockpit` stores kinds unvalidated. MDN's
  Map page says an Object "contains default keys that could collide with
  your own keys" and that a Map "is safe to use with user-provided keys".
- `node-vocabulary-design` **flipped (condition added)**: a text kind
  carrying a markup sub-language is a fourth escape hatch. An image source
  is fetched on render with no click, so URLs inside rich text are an
  allowlisted feature, backed by the host's content policy. The closure test
  gained "and unable to make the surface issue any request just by being
  rendered". Three lanes converged. The blind lane named markdown-image
  exfiltration. The read lane found the SurfaceSpec `markdown` block passing
  any image `src`, with the webview CSP as the only net. The web lane:
  Checkmarx, 2025-12-04: the renderer fetches the image and "the GET request
  is still sent even when the image isn't displayed", and the mitigations are
  stripping or blocking images and a strict CSP. PromptArmor and Simon
  Willison (2023) record the same class. The golden path was amended in one
  sentence. That sentence also adds a scope note: arbitrary markup in an
  isolated frame is a different pattern, safe by isolation, not by closure.
  MCP Apps (SEP-1865, Final; mandatory iframe sandboxing, auditable
  messages, consent for UI-initiated tool calls) is the standardized case.
- `action-consent-wiring`: confirmed, one sentence added to make it concrete
  (a display that truncates the payload or omits the target is a proxy).
  This is not counted as a flip, because the rule already forbade proxies.
- Applications:
  - `react--registry-mapping` was re-pinned: the panel split moved every
    anchor, and the dispatcher split moved `dispatcher.rs:1492-1523` to
    `dispatcher/dispatch.rs:968-989`. Per-node containment
    (`WidgetBoundary`) now exists. It gained these gaps: the inherited-key
    lookup; four hand copies of the kind list; and the chat column's
    `if`-chain second dispatch path.
  - `react--spec-validation-and-repair`: `surfaceSpec.ts` is byte-stable,
    and the renderer anchors were re-pinned. The disclosure string had been
    misquoted. It reads "{count} invalid block(s)", and it also counts
    over-cap valid blocks, a count-carries-predicate defect present since
    forging. The second entry to the door (markdown directives, 2026-09-22)
    was added, and the "one door" claim was narrowed to "one block schema,
    two entry functions".
  - New `react--action-consent-wiring`: the persona-run confirm truncates
    the prompt to 400 characters while sending up to 20,000, and never
    names the spec-chosen target persona. The dispatch chooser shows the
    whole prompt, editable.
  - New `python--spec-validation-and-repair--load-time-filter`: a public
    CMS tree at `3002dd0` filters unknown block kinds silently at load and
    deletes them on the next save. Its docs say renaming a block without a
    migration "can result in old data being lost". All four applications
    are `verified_on` 2026-11-16.
- Volatile facts: none stated (the locator found zero).

Confirmed and left untouched: validate at dispatch and report errors back
to the emitter (A2UI v0.9.1: validate against the schema, report
`VALIDATION_FAILED` back to the LLM); version handshake between emitter and
renderer (A2UI: the server "must generate messages that conform to the
catalog understood by the client"); storage change only by versioned
migration (the second stack's documented remedy); per-node containment (now
realized in personas).

Applied: two simulations against personas, both **better**. See the
ledger fragment.

#### Round 2

Dry. Probes: store-free renderer (`SurfaceRenderContext` holds; cockpit
widgets that fetch on mount are an application gap, not a refutation);
dropping unknown kinds and disclosing them in aggregate, against the
A2UI text that invalid references are skipped (a protocol permitting a
skip does not refute the UX rule; the technique already carves out the
operator placeholder); recomposition dedupe of pinned nodes (no
counter-evidence). All confirmed.

#### Round 3

Dry. Probes: one edit site per new kind as the health metric (both trees
miss it in the predicted way); zero drops renders no line (`dropped > 0`
guard, SurfaceRenderer.tsx:162); normalization never invents kinds (no
fuzzy kind matching in either stack). All confirmed. dry=2, so the loop
idles until a clock or an event.

Banked leads (with return conditions):
- A2UI's flat adjacency list with id references, so that a renderer can
  draw a partial document while it streams. No technique covers partial
  vs dropped nodes in a streamed spec. Return: a project that streams specs
  into a renderer, or a second source on partial-render semantics.
- `host-capability-injection` has no application. The cockpit widgets that
  fetch on mount (`template_suggestions`, `recent_decisions`) are the
  ready seam. Return: the next pass that writes one.
- The A2UI v1.0 text was not opened (v0.9.1, Closed, was). Return: a
  pass on emitter-registry-sync that cites the current version.

Impact: not computed. The map regeneration is owed (Director's step 4).
