---
domain: game-production
subject: engine-integration-safety
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# engine-integration-safety

## Architecture review - 2026-09-10

Read and assessed all 10 owned documents. The subject remains
**reverify**: a current review decision is not a clean content verdict. The
document decisions below identify concrete unresolved claims and the repairs made.
Historical application evidence and earlier librarian observations are preserved;
they are not new runtime witnesses.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/engine-integration-safety",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:91e7e767f4e397d2",
  "disposition": "reverify",
  "coverage": "All 10 owned documents read and assessed. Four techniques across this ten-subject tranche were repaired; other findings remain explicit reverify work. Primary-source checks have only the scope recorded below. No consumer source checkout, engine execution, player study, model evaluation or historical incident replay; no maturity or application witness refresh.",
  "counterexamples": [
    "A command can complete remotely while its response is lost.",
    "A run can emit a genuine passing subtest marker before crashing during another required phase.",
    "An expired lease or a failed process probe does not establish safe editor ownership."
  ],
  "sources": [
    {
      "url": "https://httpwg.org/specs/rfc9110.html#idempotent.methods",
      "scope": "HTTP retry semantics distinguish repeatable effects from uncertain response delivery. Applied here to transport guidance, not as verification of an editor bridge implementation."
    }
  ],
  "documents": {
    "engine-integration-safety.md": {
      "disposition": "reverify",
      "reason": "Reverify timeout, process-lifecycle and marker conclusions. A completed subtest and a later crash are separate observations; elapsed waiting does not establish stopped execution."
    },
    "techniques/editor-thread-timeout-budgeting.md": {
      "disposition": "reverify",
      "reason": "Reverify fixed elapsed-time claims of a wedge and cancellation disabling default deadlines. Cheap probes may queue on the same busy thread; bound waiting without asserting termination."
    },
    "techniques/judge-by-log-markers-not-exit-code.md": {
      "disposition": "reverify",
      "reason": "Reverify trust and completeness of markers, malformed structured output fallback and fatal-after-pass handling. Preserve subtest outcome alongside overall lifecycle failure; a nonce is not protection from an untrusted producer."
    },
    "techniques/pid-scoped-teardown.md": {
      "disposition": "reverify",
      "reason": "Reverify ownership against identifier reuse and descendant lifetime. Capture process identity or handles and creation context; a bare numeric identifier can later name another process."
    },
    "techniques/refuse-dont-kill-a-live-editor.md": {
      "disposition": "reverify",
      "reason": "Reverify fail-open behavior when probing is unavailable and the probe-to-launch race. Require atomic exclusivity or proven isolation; do not infer safety from missing visibility."
    },
    "techniques/single-instance-lease-and-drain.md": {
      "disposition": "reverify",
      "reason": "Reverify one-process versus one-host scope, ownership of the actual instance, fencing and bounded drain. Ending a wait cannot release a still-active resource safely."
    },
    "techniques/transport-failure-taxonomy.md": {
      "disposition": "clarify",
      "reason": "Rewrote failure kinds and independent execution certainty, including ambiguous socket errors, cancellation, intermediary responses, redaction and idempotency-aware retry."
    },
    "applications/node--editor-thread-timeout-budgeting.md": {
      "disposition": "reverify",
      "reason": "Historical consumer witness and measurements were not rerun; preserve existing verification dates. Reinspect this implementation against the reviewed editor-thread-timeout-budgeting contract. Reverify fixed elapsed-time claims of a wedge and cancellation disabling default deadlines. Cheap probes may queue on the same busy thread; bound waiting without asserting termination."
    },
    "applications/node--transport-failure-taxonomy.md": {
      "disposition": "reverify",
      "reason": "Historical consumer witness and measurements were not rerun; preserve existing verification dates. Reinspect this implementation against the reviewed transport-failure-taxonomy contract. Rewrote failure kinds and independent execution certainty, including ambiguous socket errors, cancellation, intermediary responses, redaction and idempotency-aware retry."
    },
    "applications/process--refuse-dont-kill-a-live-editor.md": {
      "disposition": "reverify",
      "reason": "Historical consumer witness and measurements were not rerun; preserve existing verification dates. Reinspect this implementation against the reviewed refuse-dont-kill-a-live-editor contract. Reverify fail-open behavior when probing is unavailable and the probe-to-launch race. Require atomic exclusivity or proven isolation; do not infer safety from missing visibility."
    }
  }
}
```

## Touch log

### 2026-10-01 - `/intake` (run `in-aura-1001`)

Landed technique `crash-truncated-batch-resume` (a batch carried by one launch that dies partway: completed /
culprit / unreached; resume the unreached without the culprit, bounded, each resume making progress; a single crash
is an observation) with application `node--crash-truncated-batch-resume`, and amended `judge-by-log-markers-not-exit-code`
step 3: an enumeration line cannot separate "nothing matched" from "cut short" because a run that crashed after
enumerating carries it too; the cut (a fatal marker, or the watchdog firing) does. The correction came from executing
the connected project's own batch path, not from the source. Source note
`librarian/sources/2026-10-01-aura-documentation.md`.

Applied against the connected project: paired on a simulated editor, tests with a real verdict 2 -> 5, existing tests
labelled planned 4 -> 0, launches 3 -> 4, a clean batch still one launch. **No real crash log exists in the tree**, so
the culprit-identification half is unmeasured. Step 7a (a resume assumes the interrupted launch's teardown never ran)
is corroborated by the engine's own automation-framework guidance, read verbatim. This subject's existing review block
above predates the landing and is not a verdict on it.

## Architecture review - 2026-10-31

Re-review against `b005a97cb`. **Retraction:** the 2026-09-10 record's `clarify`
for `transport-failure-taxonomy` says the technique was rewritten around execution
certainty. That rewrite was reverted with the compression pass, and the current text is
the original: it still files "socket error" under *unreachable* and says the instruction
"provably never ran". RFC 9110 contradicts that directly, so the item is owed again.
Since the old record the subject gained `crash-truncated-batch-resume` and its node
application, and `judge-by-log-markers-not-exit-code` step 3 was amended. The engine
quote step 7a relies on was re-found verbatim on the vendor's page. A new internal
tension: judge-by-log's "a fatal marker outranks a pass marker" reads as a whole-run
rule, while the new technique keeps the results of items that completed before the cut.
No verification date was refreshed.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/engine-integration-safety",
  "date": "2026-10-31",
  "baseline": "b005a97cb",
  "digest": "sha256-b2:84df39fc68d416ee",
  "disposition": "clarify",
  "coverage": "All 12 current documents read in full. Two primary sources opened this run (RFC 9110 section 9.2.2, the engine vendor's automation test framework page). Not evaluated: any consumer tree, any editor run, the 30-60 s healthy band, any crash log. No verification date was refreshed.",
  "counterexamples": [
    "A client sends an instruction and the connection closes before any response: the request may have succeeded (RFC 9110 9.2.2), so 'socket error' is not evidence that the instruction never ran.",
    "In a batch, item 2 completes with a pass marker and item 3 crashes the launch: a whole-run 'fatal outranks pass' rule would void item 2's result, which crash-truncated-batch-resume says stands.",
    "A probe that cannot run reports nothing found and the run proceeds; a live editor it could not see is then hit by the launch (fail-open, retained from 2026-09-10).",
    "A resume runs in a launch where the culprit's leftover file still exists; a resumed item that depends on that state passes on dirty ground (7a names this and weakens the result)."
  ],
  "sources": [
    {
      "url": "https://www.rfc-editor.org/rfc/rfc9110.html#section-9.2.2",
      "result": "Read 2026-10-31: 'if a client sends a PUT request and the underlying connection is closed before any response is received, then the client can establish a new connection and retry the idempotent request. It knows that repeating the request will have the same intended effect, even if the original request succeeded'; 'A client SHOULD NOT automatically retry a request with a non-idempotent method unless it has some means to know that the request semantics are actually idempotent ... or some means to detect that the original request was never applied.' Refutes 'socket error ... provably never ran'; supports 'connection refused / name resolution' as known-not-started only because nothing was sent."
    },
    {
      "url": "https://dev.epicgames.com/documentation/en-us/unreal-engine/automation-test-framework-in-unreal-engine",
      "result": "Read 2026-10-31. Test Design Guidelines: 'Assume the test was left in a bad state the last time it ran.' 'A good habit is generating and deleting files before the test starts.' Confirms the quote in crash-truncated-batch-resume step 7a and its node application verbatim."
    }
  ],
  "documents": {
    "engine-integration-safety.md": {
      "disposition": "keep",
      "reason": "Guest framing, identity-not-class, refusal as a first-class outcome and the batch paragraph agree with the techniques. Its two-axes section stays at the level of reached/fault-location and does not repeat the 'provably never ran' claim."
    },
    "techniques/crash-truncated-batch-resume.md": {
      "disposition": "keep",
      "reason": "Three populations, culprit identification by single-item line, progress-guarded capped resume and the 'single crash is an observation' rule are coherent. Step 7a's engine quote verified verbatim this run."
    },
    "techniques/judge-by-log-markers-not-exit-code.md": {
      "disposition": "clarify",
      "reason": "Step 3's amendment is consistent with the new technique. The decision rule 'a fatal-error marker ... outranks a pass marker in the same log' must be scoped to the run's overall verdict; per item, a result that completed before the cut stands (crash-truncated-batch-resume, three populations)."
    },
    "techniques/editor-thread-timeout-budgeting.md": {
      "disposition": "reverify",
      "reason": "Derivation discipline is sound. The 30-60 s band and two-minute wedge threshold rest on one consumer's measurements, not re-run; a 'cheap probe' can still queue behind a busy thread (retained)."
    },
    "techniques/pid-scoped-teardown.md": {
      "disposition": "keep",
      "reason": "Its decision rules already cover identifier reuse ('verify before signalling, or accept the no-op') and a missing tree kill. The 2026-09-10 reverify asked for handles plus creation context; step 1's 'handle obtained at spawn' is that."
    },
    "techniques/refuse-dont-kill-a-live-editor.md": {
      "disposition": "reverify",
      "reason": "Probe-unavailable proceeds (fail-open) and the probe-to-launch race is not addressed; both are design questions this run cannot settle from a source."
    },
    "techniques/single-instance-lease-and-drain.md": {
      "disposition": "keep",
      "reason": "One-process versus one-host scope is stated in its decision rules and When-not-to-use; stale reclaim requires positive evidence of holder death. Drain on shutdown carries no bound, noted, below the bar for a change."
    },
    "techniques/transport-failure-taxonomy.md": {
      "disposition": "clarify",
      "reason": "Unreachable lists 'socket error' and says the instruction 'provably never ran'; RFC 9110 9.2.2 says a connection closed before any response may follow a request that succeeded. Only failures before anything was sent (refused, resolution) are known-not-started; a socket error after sending is outcome-unknown like a timeout, and the retry policy line must follow. Also owed: 'Malformed body ... it will answer identically' ignores intermediaries (not confirmed this run)."
    },
    "applications/node--crash-truncated-batch-resume.md": {
      "disposition": "reverify",
      "reason": "Internally consistent paired table (2->5 verdicts, 4->0 planned, 3->4 launches). The engine quote verified; the private tree and its 528-test run were not reopened."
    },
    "applications/node--editor-thread-timeout-budgeting.md": {
      "disposition": "reverify",
      "reason": "Unchanged; consumer constants and line anchors not reopened."
    },
    "applications/node--transport-failure-taxonomy.md": {
      "disposition": "reverify",
      "reason": "Unchanged; consumer not reopened. Its 'unreachable' is 'no response at all', which inherits the technique's socket-error ambiguity."
    },
    "applications/process--refuse-dont-kill-a-live-editor.md": {
      "disposition": "reverify",
      "reason": "Unchanged; consumer not reopened. It logs probe-unavailable to the debug log, not the run record the technique asks for: a recorded deviation to recheck."
    }
  }
}
```

## Architecture review - 2026-10-31 (clarify applied)

Applied the two clarify items the earlier 2026-10-31 record named, against `f7a53ecb6`. RFC 9110 was opened this run and supports the transport change; the judge-by-log change resolves an internal tension between two techniques. The malformed-body intermediary point stays owed. Applications were not touched and keep `reverify`, now the overall disposition.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/engine-integration-safety",
  "date": "2026-10-31",
  "baseline": "f7a53ecb6",
  "digest": "sha256-b2:05b68997e279caeb",
  "disposition": "reverify",
  "coverage": "Second 2026-10-31 record. The clarify items applied are listed per document; each edited section was re-read after the edit. All other documents are byte-unchanged from the first 2026-10-31 record and keep its dispositions. All 12 current documents read in full. Two primary sources opened this run (RFC 9110 section 9.2.2, the engine vendor's automation test framework page). Not evaluated: any consumer tree, any editor run, the 30-60 s healthy band, any crash log. No verification date was refreshed.",
  "counterexamples": [
    "A client sends an instruction and the connection closes before any response: the request may have succeeded (RFC 9110 9.2.2), so 'socket error' is not evidence that the instruction never ran.",
    "In a batch, item 2 completes with a pass marker and item 3 crashes the launch: a whole-run 'fatal outranks pass' rule would void item 2's result, which crash-truncated-batch-resume says stands.",
    "A probe that cannot run reports nothing found and the run proceeds; a live editor it could not see is then hit by the launch (fail-open, retained from 2026-09-10).",
    "A resume runs in a launch where the culprit's leftover file still exists; a resumed item that depends on that state passes on dirty ground (7a names this and weakens the result)."
  ],
  "sources": [
    {
      "url": "https://www.rfc-editor.org/rfc/rfc9110.html#section-9.2.2",
      "result": "Read 2026-10-31: 'if a client sends a PUT request and the underlying connection is closed before any response is received, then the client can establish a new connection and retry the idempotent request. It knows that repeating the request will have the same intended effect, even if the original request succeeded'; 'A client SHOULD NOT automatically retry a request with a non-idempotent method unless it has some means to know that the request semantics are actually idempotent ... or some means to detect that the original request was never applied.' Refutes 'socket error ... provably never ran'; supports 'connection refused / name resolution' as known-not-started only because nothing was sent."
    },
    {
      "url": "https://dev.epicgames.com/documentation/en-us/unreal-engine/automation-test-framework-in-unreal-engine",
      "result": "Read 2026-10-31. Test Design Guidelines: 'Assume the test was left in a bad state the last time it ran.' 'A good habit is generating and deleting files before the test starts.' Confirms the quote in crash-truncated-batch-resume step 7a and its node application verbatim."
    }
  ],
  "documents": {
    "engine-integration-safety.md": {
      "disposition": "keep",
      "reason": "Guest framing, identity-not-class, refusal as a first-class outcome and the batch paragraph agree with the techniques. Its two-axes section stays at the level of reached/fault-location and does not repeat the 'provably never ran' claim."
    },
    "techniques/crash-truncated-batch-resume.md": {
      "disposition": "keep",
      "reason": "Three populations, culprit identification by single-item line, progress-guarded capped resume and the 'single crash is an observation' rule are coherent. Step 7a's engine quote verified verbatim this run."
    },
    "techniques/judge-by-log-markers-not-exit-code.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the fatal-outranks-pass rule is scoped to the run's overall verdict; per item, a result that completed before the cut stands, pointing at crash-truncated-batch-resume."
    },
    "techniques/editor-thread-timeout-budgeting.md": {
      "disposition": "reverify",
      "reason": "Derivation discipline is sound. The 30-60 s band and two-minute wedge threshold rest on one consumer's measurements, not re-run; a 'cheap probe' can still queue behind a busy thread (retained)."
    },
    "techniques/pid-scoped-teardown.md": {
      "disposition": "keep",
      "reason": "Its decision rules already cover identifier reuse ('verify before signalling, or accept the no-op') and a missing tree kill. The 2026-09-10 reverify asked for handles plus creation context; step 1's 'handle obtained at spawn' is that."
    },
    "techniques/refuse-dont-kill-a-live-editor.md": {
      "disposition": "reverify",
      "reason": "Probe-unavailable proceeds (fail-open) and the probe-to-launch race is not addressed; both are design questions this run cannot settle from a source."
    },
    "techniques/single-instance-lease-and-drain.md": {
      "disposition": "keep",
      "reason": "One-process versus one-host scope is stated in its decision rules and When-not-to-use; stale reclaim requires positive evidence of holder death. Drain on shutdown carries no bound, noted, below the bar for a change."
    },
    "techniques/transport-failure-taxonomy.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: Unreachable now covers only failures where nothing was sent (refused, resolution); a socket error after sending is named as outcome-unknown with the timeout's ambiguity, citing RFC 9110 9.2.2, and the retry-policy line follows. Still owed, not confirmed this run: 'Malformed body ... it will answer identically' ignores intermediaries."
    },
    "applications/node--crash-truncated-batch-resume.md": {
      "disposition": "reverify",
      "reason": "Internally consistent paired table (2->5 verdicts, 4->0 planned, 3->4 launches). The engine quote verified; the private tree and its 528-test run were not reopened."
    },
    "applications/node--editor-thread-timeout-budgeting.md": {
      "disposition": "reverify",
      "reason": "Unchanged; consumer constants and line anchors not reopened."
    },
    "applications/node--transport-failure-taxonomy.md": {
      "disposition": "reverify",
      "reason": "Unchanged; consumer not reopened. Its 'unreachable' is 'no response at all', which inherits the technique's socket-error ambiguity."
    },
    "applications/process--refuse-dont-kill-a-live-editor.md": {
      "disposition": "reverify",
      "reason": "Unchanged; consumer not reopened. It logs probe-unavailable to the debug log, not the run record the technique asks for: a recorded deviation to recheck."
    }
  }
}
```
