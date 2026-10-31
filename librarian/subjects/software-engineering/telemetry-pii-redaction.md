---
subject: telemetry-pii-redaction
domain: software-engineering
last_touched: 2026-08-27
dry_streak: 0
---

# telemetry-pii-redaction

First touch: [[2026-08-22-4]] — the 2026-08-22 harvest wave. Class: NEW.

## State

6 techniques, 2 react applications. Web-hardened before drafting. Golden path 286 lines. The technique layer was read in full by the director at review; it is the wave's quality reference.

## Open leads (banked, with return conditions)

- **guard-failure-is-not-consent** (proposed law, not added). When a control cannot complete, the safe direction denies rather than forwards. THREE sightings, two of them in EXISTING subjects outside this wave (`audit-logging`/write-path-sanitization, `data-retention`/destructive-override-floor). The strongest law proposal of the wave on external evidence. Return next sweep with a cross-domain check against `llm-observability`.
- Cross-subject finding: `one-authority-per-vocabulary` has no stated answer for a vocabulary that CANNOT be shared — here a denylist mirrored into a second-language runtime. The worker wrote a local reconciliation rule; the law may want the general statement.

---

## Touch 2 — 2026-08-27, `/intake` from [[../../sources/2026-08-27-openwiki-self-correcting-memory]]. Class: EXTENDS.

6 -> 7 techniques. Golden path gains one section before "Where this subject
stops". Applications unchanged at 2.

## Why the home was contested, and the argument that settled it

The candidate — *an input exclusion is not an output guarantee* — mapped to no
subject cleanly. `prompt-safety` frames every technique around hostile spans
attacking the model, which this is not. `prompt-assembly` owns what goes *into*
a prompt, and disclaims safety explicitly. `retrieval` has scope leakage but in
the vector sense. Four candidate homes, none obviously right, which the method
says is the signature of an interesting finding rather than a bad one.

What settled it: **every existing technique in this subject rests on an
assumption the finding breaks.** Keyed drops, pattern passes, caps and absence
assertions all require the sensitive value to *pass through* the pipeline as a
value. A composed artifact — a generated report, a written summary — never
contains one: the fact is reconstructed from other material, so there is nothing
for a scrubber to match and nothing for `redaction-invariants-as-tests` to assert
the absence of. The subject's stated job is *where the control must sit*, and the
finding answers exactly that for a new emitter class. That is the test the method
prescribes — whose stated job does this answer — and it beat slug proximity.

## What landed

**`exclusion-bounds-reads-not-output`** — the two guarantees an exclusion list
is read as making (*this material was not read* is what it delivers; *this
material is not described* is what the reader assumes), and why the second needs
a control at the publish boundary. `gate-sees-target` in pure form: the control
is applied to inputs, the artifact is what anyone cares about, and the gate never
observes the artifact at all. The absence assertion cannot carry it, because an
absence assertion needs a value to assert the absence of — so a suite that pins
known secrets and passes reports something far narrower than its summary line
implies. The replacement is a classifier or a reviewer, which makes it a sampling
control with a false-negative rate rather than a proof, far more expensive per
artifact, and dependent on the exclusion list as its *input* — the two are a pair
rather than alternatives, and an exclusion list with no publish-side check is a
half-built control that looks finished.

## Honest limits

- No realization. Both applications here are telemetry scrubbers with values in
  hand; nothing in reach exercises a composed-artifact emitter. The technique
  rests on the source's own stated limitation plus redaction-versus-inference
  convergence, not on a tree anybody opened.
- The scope sentence was written carefully because the subject's opening frames
  itself around a record changing custodian. A generated artifact that ships is
  argued to be the same crossing; a reviewer who disagrees would move this to a
  future agent-scoping subject, and that would be a defensible call.

---

## Architecture review - 2026-10-31

All ten documents read in full against `733004b51`. The structure holds: seven
techniques, each owning one decision, with seams to observability-telemetry,
data-retention and audit-logging stated rather than assumed. One load-bearing
claim is refuted by primary source: the golden path and `hook-coverage-gaps`
say that in most implementations a throwing outbound callback is treated as
consent to send the original, and `redact-at-the-cap` says many hooks do that and
a few drop. The two SDKs opened this run (the JavaScript core client and the
Python client of one widely used hosted error tracker) both **drop** the event
and record a `callback_error` loss. The prescription (guard the scrubber, never
let the exception reach the transport) is unaffected; the stated reason is not.
This also bears on the banked `guard-failure-is-not-consent` lead above: the
vendors checked already fail closed at this point, so it is a corroborating
sighting, not a counterexample.

A second, softer finding: the EU's highest court held on 2025-09-04 (EDPS v SRB)
that pseudonymised data is not personal data for every recipient in every case.
The subject's claim is made from the key-holding team's side, where it still
stands, but the primary judgment text could not be fetched this run, so that
qualifier stays owed.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/telemetry-pii-redaction",
  "date": "2026-10-31",
  "baseline": "733004b51",
  "digest": "sha256-b2:291ed63388cf9602",
  "disposition": "clarify",
  "coverage": "All 10 documents read in full (golden path, seven techniques, two react applications). Primary sources opened for the throwing-callback claim (two SDK client sources) and the vendor's option and data-collected docs. The pseudonymisation ruling was reached only through secondary commentary. The private tree behind both applications was not reopened; no verification date was refreshed.",
  "trigger": "Pending: subject had no architecture-review record.",
  "intended_benefit": "An outbound telemetry boundary with an enumerated payload, two-pass scrubbing, keyed pseudonyms, fail-closed caps, named hook gaps and absence-plus-survival tests asserted on the serialised form.",
  "failure_if_ignored": "A team flips the vendor's default-PII switch, scrubs the message, and ships identifiers in frame variables, contexts, routes and sibling channels to a store it can only ask to delete from.",
  "boundary": "The instant before a record is handed to a third-party operated sink. Stores the team can delete from belong to observability-telemetry; lifecycle and erasure to data-retention; internal append-only trails to audit-logging.",
  "counterexamples": [
    "The two SDKs opened this run drop an event whose beforeSend/before_send throws and count it as a callback_error loss; neither treats the throw as consent to send the original.",
    "Since the vendor's JavaScript SDK v10/v11 a dataCollection option replaces sendDefaultPii and by default collects user identity, request bodies and stack-frame variables; data set explicitly with setUser is always sent. The golden path's spelling-agnostic 'vendor switch' section survives this, which is why it avoided naming the option.",
    "Pseudonymised data is not personal data for every recipient (EDPS v SRB, 2025-09-04, via secondary commentary); for the team holding the key it remains so.",
    "A composed artifact has no value to scrub, so the exclusion-bounds technique sits at the edge of this subject's custody framing; the original note already records that moving it to an agent-scoping subject would be defensible."
  ],
  "sources": [
    {
      "url": "https://raw.githubusercontent.com/getsentry/sentry-javascript/develop/packages/core/src/client.ts",
      "result": "processBeforeSend wraps beforeSend in safeCallback with the label 'The `beforeSend` callback threw an error, dropping the event:' and onDrop('callback_error'); other pipeline errors log 'original event will not be sent. Details have been sent as a new event.' Refutes 'most implementations treat a throwing callback as consent to send'."
    },
    {
      "url": "https://raw.githubusercontent.com/getsentry/sentry-python/master/sentry_sdk/client.py",
      "result": "before_send runs inside capture_internal_exceptions; new_event stays None on a raise, 'before send dropped event' is logged and a lost event recorded with reason callback_error. Same direction as the JavaScript client."
    },
    {
      "url": "https://docs.sentry.io/platforms/javascript/configuration/options/",
      "result": "dataCollection 'Controls which categories of data the SDK collects automatically'; sendDefaultPii is 'deprecated'; 'Data you set with Sentry.setUser() is always sent.' Supports the golden path's reading that the switch governs only automatic collection."
    },
    {
      "url": "https://docs.sentry.io/platforms/python/data-management/data-collected/",
      "result": "send_default_pii gates IP, cookies, logged-in user and headers; 'the names and values of local variables that were set when the errors occurred are sent'. Supports the frame-variables claim in the inventory."
    },
    {
      "url": "https://www.cliffordchance.com/insights/resources/blogs/talking-tech/en/articles/2025/09/pseudonymized-data-after-edps-v-srb.html",
      "result": "Secondary: pseudonymised data need not be personal 'in all cases and for every person'; may become personal 'when made available to parties who do have such means'. The primary judgment (EUR-Lex, CURIA) returned empty or redirected, so not applied."
    },
    {
      "source": "Private consumer tree behind both react applications",
      "result": "Not reopened. Line anchors and the 24-vs-8 call-site count stand as dated 2026-08-22."
    }
  ],
  "documents": {
    "telemetry-pii-redaction.md": {
      "disposition": "clarify",
      "reason": "Sound and well bounded. The hook section's 'in most implementations a callback that throws is treated as consent to send the original' is refuted by both SDK sources opened; reword to 'implementations differ' with the checked direction. Owed, not applied: qualify 'the derivative is still personal data' as the key-holding team's position after EDPS v SRB, pending the primary judgment."
    },
    "techniques/emit-site-inventory.md": {
      "disposition": "keep",
      "reason": "Four-author enumeration, closed three-value disposition vocabulary and construction-over-enumeration are coherent; frame local variables confirmed captured by default in the Python SDK docs."
    },
    "techniques/denylist-plus-pattern-pass.md": {
      "disposition": "keep",
      "reason": "Key and value passes with stated blind spots, precise-before-coarse ordering and the named cross-language reconciliation rule are consistent with the application that sourced them."
    },
    "techniques/correlation-preserving-redaction.md": {
      "disposition": "clarify",
      "reason": "Keyed derivative, collision budget and rotation cost are sound. Owed, not applied: 'still personal data under the regimes that matter' should say 'for the team that holds the key', since EDPS v SRB (2025-09-04) makes the recipient's status depend on realistic re-identification. Only secondary commentary reached this run."
    },
    "techniques/redact-at-the-cap.md": {
      "disposition": "clarify",
      "reason": "Direction rule, distinguishable markers and the guarded scrub are sound. 'Many outbound hooks treat a thrown callback as send the original; a few treat it as drop the event' inverts what the two SDKs checked do; reword so the guard rests on not inheriting the transport's choice."
    },
    "techniques/hook-coverage-gaps.md": {
      "disposition": "clarify",
      "reason": "Gap enumeration, wrapper-over-hook, channel disabling and one shared config are sound. Same refuted 'in most implementations ... consent to send the original record' sentence; reword with the checked direction."
    },
    "techniques/redaction-invariants-as-tests.md": {
      "disposition": "keep",
      "reason": "Whole-string absence on the serialised form, distinct planted values, clean survival, a case per cap and the positive instrument test close each other's gaps."
    },
    "techniques/exclusion-bounds-reads-not-output.md": {
      "disposition": "keep",
      "reason": "Coherent and honest about having no realization. Its home is defensible by the 'where the control must sit' test the note records; a later agent-scoping subject could take it, which is a placement question, not a defect."
    },
    "applications/react--denylist-plus-pattern-pass.md": {
      "disposition": "reverify",
      "reason": "Internally consistent (thirteen domain keys counted; deviations stated plainly). The private tree was not reopened."
    },
    "applications/react--hook-coverage-gaps.md": {
      "disposition": "reverify",
      "reason": "Deviations are stated plainly. 'whose documented behaviour on a throwing beforeSend is not drop the event' conflicts with the current JavaScript client source, which drops and counts callback_error; whether the tree's pinned SDK version behaved the same was not established, and the private tree was not reopened, so the sentence is owed a recheck rather than an edit."
    }
  }
}
```

## Architecture review - 2026-10-31 (clarify applied)

Applied the throwing-callback correction in the golden path, `hook-coverage-gaps`
and `redact-at-the-cap`, each from the two SDK client sources opened this run.
The pseudonymisation qualifier in the golden path and
`correlation-preserving-redaction` stays owed (only secondary commentary
reached), and both applications stay `reverify`. Overall disposition remains
`clarify` because of the owed qualifier.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/telemetry-pii-redaction",
  "date": "2026-10-31",
  "baseline": "733004b51",
  "digest": "sha256-b2:da14ad745314b65d",
  "disposition": "clarify",
  "coverage": "All 10 documents read in full (golden path, seven techniques, two react applications). Primary sources opened for the throwing-callback claim (two SDK client sources) and the vendor's option and data-collected docs. The pseudonymisation ruling was reached only through secondary commentary. The private tree behind both applications was not reopened; no verification date was refreshed. Second record: three sentences edited after the first record; the rest of the bundle is byte-identical.",
  "trigger": "Pending: subject had no architecture-review record.",
  "intended_benefit": "An outbound telemetry boundary with an enumerated payload, two-pass scrubbing, keyed pseudonyms, fail-closed caps, named hook gaps and absence-plus-survival tests asserted on the serialised form.",
  "failure_if_ignored": "A team flips the vendor's default-PII switch, scrubs the message, and ships identifiers in frame variables, contexts, routes and sibling channels to a store it can only ask to delete from.",
  "boundary": "The instant before a record is handed to a third-party operated sink. Stores the team can delete from belong to observability-telemetry; lifecycle and erasure to data-retention; internal append-only trails to audit-logging.",
  "counterexamples": [
    "The two SDKs opened this run drop an event whose beforeSend/before_send throws and count it as a callback_error loss; neither treats the throw as consent to send the original.",
    "Since the vendor's JavaScript SDK v10/v11 a dataCollection option replaces sendDefaultPii and by default collects user identity, request bodies and stack-frame variables; data set explicitly with setUser is always sent. The golden path's spelling-agnostic 'vendor switch' section survives this, which is why it avoided naming the option.",
    "Pseudonymised data is not personal data for every recipient (EDPS v SRB, 2025-09-04, via secondary commentary); for the team holding the key it remains so.",
    "A composed artifact has no value to scrub, so the exclusion-bounds technique sits at the edge of this subject's custody framing; the original note already records that moving it to an agent-scoping subject would be defensible."
  ],
  "sources": [
    {
      "url": "https://raw.githubusercontent.com/getsentry/sentry-javascript/develop/packages/core/src/client.ts",
      "result": "processBeforeSend wraps beforeSend in safeCallback with the label 'The `beforeSend` callback threw an error, dropping the event:' and onDrop('callback_error'); other pipeline errors log 'original event will not be sent. Details have been sent as a new event.' Refutes 'most implementations treat a throwing callback as consent to send'."
    },
    {
      "url": "https://raw.githubusercontent.com/getsentry/sentry-python/master/sentry_sdk/client.py",
      "result": "before_send runs inside capture_internal_exceptions; new_event stays None on a raise, 'before send dropped event' is logged and a lost event recorded with reason callback_error. Same direction as the JavaScript client."
    },
    {
      "url": "https://docs.sentry.io/platforms/javascript/configuration/options/",
      "result": "dataCollection 'Controls which categories of data the SDK collects automatically'; sendDefaultPii is 'deprecated'; 'Data you set with Sentry.setUser() is always sent.' Supports the golden path's reading that the switch governs only automatic collection."
    },
    {
      "url": "https://docs.sentry.io/platforms/python/data-management/data-collected/",
      "result": "send_default_pii gates IP, cookies, logged-in user and headers; 'the names and values of local variables that were set when the errors occurred are sent'. Supports the frame-variables claim in the inventory."
    },
    {
      "url": "https://www.cliffordchance.com/insights/resources/blogs/talking-tech/en/articles/2025/09/pseudonymized-data-after-edps-v-srb.html",
      "result": "Secondary: pseudonymised data need not be personal 'in all cases and for every person'; may become personal 'when made available to parties who do have such means'. The primary judgment (EUR-Lex, CURIA) returned empty or redirected, so not applied."
    },
    {
      "source": "Private consumer tree behind both react applications",
      "result": "Not reopened. Line anchors and the 24-vs-8 call-site count stand as dated 2026-08-22."
    }
  ],
  "documents": {
    "telemetry-pii-redaction.md": {
      "disposition": "clarify",
      "reason": "applied 2026-10-31: the hook section no longer says most implementations treat a throwing callback as consent to send; it says the meaning is the transport's choice and the widely used clients checked drop the event. Still owed: qualify 'the derivative is still personal data' as the key-holding team's position after EDPS v SRB, pending the primary judgment."
    },
    "techniques/emit-site-inventory.md": {
      "disposition": "keep",
      "reason": "Four-author enumeration, closed three-value disposition vocabulary and construction-over-enumeration are coherent; frame local variables confirmed captured by default in the Python SDK docs."
    },
    "techniques/denylist-plus-pattern-pass.md": {
      "disposition": "keep",
      "reason": "Key and value passes with stated blind spots, precise-before-coarse ordering and the named cross-language reconciliation rule are consistent with the application that sourced them."
    },
    "techniques/correlation-preserving-redaction.md": {
      "disposition": "clarify",
      "reason": "Keyed derivative, collision budget and rotation cost are sound. Owed, not applied: 'still personal data under the regimes that matter' should say 'for the team that holds the key', since EDPS v SRB (2025-09-04) makes the recipient's status depend on realistic re-identification. Only secondary commentary reached this run."
    },
    "techniques/redact-at-the-cap.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: 'many hooks send the original, a few drop' replaced by 'hooks differ; the widely used clients checked drop it, still not a default to inherit unread'. Direction rule, markers and guarded scrub unchanged."
    },
    "techniques/hook-coverage-gaps.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the throwing-callback paragraph now says the meaning is the transport's decision, with the checked direction (drop and count), and the guard rests on not inheriting it. Rest unchanged."
    },
    "techniques/redaction-invariants-as-tests.md": {
      "disposition": "keep",
      "reason": "Whole-string absence on the serialised form, distinct planted values, clean survival, a case per cap and the positive instrument test close each other's gaps."
    },
    "techniques/exclusion-bounds-reads-not-output.md": {
      "disposition": "keep",
      "reason": "Coherent and honest about having no realization. Its home is defensible by the 'where the control must sit' test the note records; a later agent-scoping subject could take it, which is a placement question, not a defect."
    },
    "applications/react--denylist-plus-pattern-pass.md": {
      "disposition": "reverify",
      "reason": "Internally consistent (thirteen domain keys counted; deviations stated plainly). The private tree was not reopened."
    },
    "applications/react--hook-coverage-gaps.md": {
      "disposition": "reverify",
      "reason": "Deviations are stated plainly. 'whose documented behaviour on a throwing beforeSend is not drop the event' conflicts with the current JavaScript client source, which drops and counts callback_error; whether the tree's pinned SDK version behaved the same was not established, and the private tree was not reopened, so the sentence is owed a recheck rather than an edit."
    }
  }
}
```
