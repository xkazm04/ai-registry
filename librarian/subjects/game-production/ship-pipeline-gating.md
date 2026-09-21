---
domain: game-production
subject: ship-pipeline-gating
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# ship-pipeline-gating

## Architecture review - 2026-09-10

Review completed for every owned document. Reverify identifies remaining work, not a
clean content verdict. Earlier notes remain historical evidence; application dates
and maturity are unchanged.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/ship-pipeline-gating",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:01e349e0f587df06",
  "disposition": "reverify",
  "coverage": "All 10 owned documents read and assessed in table order. 3 document(s) repaired. Residual source, semantic and historical application checks are recorded per document; no consumer/runtime/field witness or maturity refresh.",
  "counterexamples": [
    "Inside #if WITH_EDITOR || SHIPPING, seeing WITH_EDITOR on the stack does not exclude code from Shipping.",
    "A valid success marker from an earlier run followed by the current run's crash is not current completion evidence.",
    "A missing required budget file cannot be interpreted as the user intentionally disabling its gate."
  ],
  "sources": [
    {
      "path": "knowledge/game-production/engine-integration/ship-pipeline-gating",
      "scope": "Every owned document read in full; embedded code assessed as displayed. Historical application implementations and observations were not independently rerun."
    }
  ],
  "documents": {
    "ship-pipeline-gating.md": {
      "disposition": "reverify",
      "reason": "Reverify exit status dismissed categorically, ascending-cost order versus failure probability/dependencies, validator logs as sole content authority and corrupt configuration evaluated on invented settings. Earlier source checks do not remove the need to check transformed artifacts. Required configuration absence is not evidence of intentional disablement."
    },
    "techniques/editor-only-api-audit-for-shipping.md": {
      "disposition": "clarify",
      "reason": "Repaired guard analysis as branch-condition implication, including else/elif, disjunction, macro value versus definedness and unsupported preprocessing. A stack containing an accepted token is not enough to prove shipping exclusion."
    },
    "techniques/fail-closed-on-corrupt-gate-config.md": {
      "disposition": "clarify",
      "reason": "Repaired absent optional versus required config, missing versus corrupt semantics, no invented conservative verdicts and preserving load-failure metadata with historical verdicts. A schema-defined default is legitimate policy; a missing file does not establish operator choice."
    },
    "techniques/post-cook-process-liveness-smoke.md": {
      "disposition": "reverify",
      "reason": "Process name plus appearance time is not sufficient ownership proof under concurrent launches or PID reuse. A readiness marker needs run identity and freshness, and end-of-window liveness does not prove uninterrupted survival. A staged smoke is not a clean-machine install test unless that environment was actually used."
    },
    "techniques/preflight-before-an-expensive-cook.md": {
      "disposition": "reverify",
      "reason": "The savings inequality assumes detector accuracy and independent placement costs; account for false positives and later checks. Known contracts can justify checks before an incident exists. Missing required input may itself be a content/configuration violation, and configured defaults may supply a valid entry point."
    },
    "techniques/size-budget-and-growth-baseline.md": {
      "disposition": "reverify",
      "reason": "Seven 10% increases yield about 1.95 times, not a full doubling. Scope baselines by project/platform/configuration and measurement method, handle zero sizes, missing paths, concurrency and symlinks. Historical identity may be recovered from reliable manifests rather than being inherently unreconstructable."
    },
    "techniques/validator-log-classification.md": {
      "disposition": "clarify",
      "reason": "Repaired combined protocol and execution outcomes, complete run identity, terminal evidence, error precedence, task-scoped diagnostic grouping and limits of truncation. Log and exit checks can complement one another without becoming competing authorities."
    },
    "applications/node--post-cook-process-liveness-smoke.md": {
      "disposition": "reverify",
      "reason": "Historical image-name lookup can count someone else's running game, and image-wide cleanup can terminate it. Even a dedicated agent can host unrelated processes. Boolean gameAlive collapses unresolved identity into fail; no consumer launch or cleanup executed."
    },
    "applications/node--preflight-before-an-expensive-cook.md": {
      "disposition": "reverify",
      "reason": "Historical preflight enum lacks unevaluated, as noted. Unset default map is warned despite technique calling it fatal; validate actual inherited defaults and target contract. The source's parseUbtResult uses log markers alongside exit territory, contradicting exclusive judgment modes. Consumer not rerun."
    },
    "applications/process--validator-log-classification.md": {
      "disposition": "reverify",
      "reason": "Historical empty parsed issues do not prove completed validation. Severity/message dedup can collapse distinct affected assets; retain per-asset counts. WaitMutex is not a general live-editor lease, and teardown faults are not automatically benign. Consumer and current tool behavior not reverified."
    }
  }
}
```

## Architecture re-review - 2026-09-10 (after the compression revert)

Read all ten documents at their reverted bytes and re-read every consumer file the three
applications cite (`C:/Users/kazda/kiro/pof`, `master`) as source. Reading source is not
executing it: no cook, no packaging run, no smoke test and no build was performed.

This subject came out of the re-review in better shape than any other in my group, and
the honest finding is that it needs almost nothing. The cost-ordering spine is stated as
a rule and then explicitly disclaimed as a worked instance rather than the rule ("Re-derive
this for any expensive build"); the `f · C > c` inequality is the argument that keeps the
cheap checks alive under review pressure and it is carried identically in the golden path
and in `preflight-before-an-expensive-cook`. The bound that stops "cost ordering" from
collapsing into "cheap first" — a gate's placement is bounded below by when its evidence
comes into existence — is stated in both places in the same words. The two-judgment-mode
distinction is the load-bearing idea and it is stated in the harder, less obvious
direction as well as the easy one: a process that outlives its task is uninformative when
it exits non-zero *and* when it exits zero. That second half is what separates this from
the folk version of the rule. The three-outcome discipline (pass / fail / could-not-
evaluate) is applied consistently across preflight rules, log classification, liveness
resolution and size baselines, and the four-outcome refinement for baselines — the
unattributed comparison, "a verdict indistinguishable from a real one" — is the subtlest
thing in the group and is stated in both the golden path and the technique without
drifting. `fail-closed-on-corrupt-gate-config`'s absent-versus-corrupt distinction is
carried in three places with the same asymmetry each time.

I looked specifically for the failure the compression pass would have manufactured — a
technique whose claim outruns what its own procedure supports — and did not find one
here. Where a claim is strong it is scoped: the liveness smoke's "What a liveness smoke
does not prove" section is longer than its decision rules, and it hands the ordering of
evidence off to a neighbouring subject by name rather than annexing it.

The applications are the part that has aged, and they have aged only in their line
numbers. I re-read each cited symbol against the live consumer. Every substantive claim
holds: `smoke-test.ts` still derives the game image from the configuration, still sets
`status` from `gameAlive` alone at `:132`, still records `bootstrapExitCode` without
judging it, still observes for `DEFAULT_OBSERVE_MS = 25_000` at `:55`, and still calls
`killImage` before `killPid` at `:128` with `defaultKillImage` running
`taskkill /IM <image> /T /F` at `:86` — so the broadcast-kill deviation the document
refuses to lower its standard for is still live. `preflight.ts` still has no
`unclassified` state and still does not load the size-budget configuration.
`canon-conformance.ts` and `ue-gates.ts` still carry the two independently-written
judgment-mode comments. The one factual drift worth fixing is a stated line count:
`node--preflight-before-an-expensive-cook.md` opens with "`src/lib/packaging/preflight.ts`
(443 lines)" and the file is now 482. A line count is a claim about a moving artifact
that buys the reader almost nothing; the smoke-test document's "(149 lines)" happens to
still be right, which is luck rather than a property of the citation style. The general
lesson — cite symbols, not line numbers — applies across the group and I have recorded it
against every subject I reviewed.

Nothing here earns a content change beyond that one number, and I am explicitly not
filing "this could be tighter" as a finding.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/ship-pipeline-gating",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:de0b345e898f6956",
  "disposition": "keep",
  "coverage": "All 10 owned documents read at reverted bytes. Every consumer symbol cited by the three applications was re-read against the live tree at C:/Users/kazda/kiro/pof (smoke-test.ts, preflight.ts, canon-conformance.ts, ue-gates.ts). Not evaluated: no cook, packaging run, smoke test, UnrealBuildTool invocation or asset-validation commandlet was executed; the claim that a 25-second observation window catches the mass of the initialisation-crash distribution is not verified here; no non-Unreal toolchain was checked against the generalisations the subject makes about launchers and log-judged tools.",
  "counterexamples": [
    "post-cook-process-liveness-smoke: an artifact whose real process is started under a service manager or container supervisor that reparents it, on a machine where the gate cannot enumerate descendants. Rung 1 fails, rung 2 (name match scoped to processes appearing after launch) races any concurrent build of the same configuration, and rung 4 requires changing the artifact. The technique's honest answer is 'unresolved', which is correct but leaves a whole deployment shape with no passing path.",
    "size-budget-and-growth-baseline: a pipeline whose only durable store is the build agent's local disk and whose agents are ephemeral. Every build is a first build, so the growth comparison is permanently unmeasured and the ratchet the absolute budget is supposed to backstop is the only gate in play - the technique names this in 'when not to use this' but gives no way to detect the difference between a genuinely new platform and a store that silently resets.",
    "validator-log-classification: a tool that is exit-code-honest for the failure classes it knows and swallows an unknown class into an informational line with no count. The procedure's step 9 catches counted summaries and step 4 requires an affirmative success marker, but a tool that emits its success marker and an uncounted informational anomaly classifies as pass, which is the correct verdict under the stated rules and the wrong one about the artifact."
  ],
  "sources": [
    {
      "path": "C:/Users/kazda/kiro/pof src/lib/packaging/smoke-test.ts",
      "result": "Confirmed the bootstrap-versus-game split (status derived from gameAlive alone at :132, bootstrapExitCode recorded and unjudged), deriveGameImage at :68, tasklist-based resolution at :77, DEFAULT_OBSERVE_MS = 25_000 at :55, and the broadcast kill (killImage at :128, taskkill /IM ... /T /F at :86). The file is still 149 lines. Read, not executed - no artifact was launched."
    },
    {
      "path": "C:/Users/kazda/kiro/pof src/lib/packaging/preflight.ts, src/lib/balance/canon-conformance.ts, src/lib/harness/ue-gates.ts",
      "result": "Confirmed preflight.ts still has no 'unclassified' state, still reduces to one status via overallStatus (:478), and still does not reference size-budgets; confirmed the judgment-mode comments in canon-conformance.ts and ue-gates.ts. Established that preflight.ts is now 482 lines against the document's stated 443. Did not run any gate or its tests."
    }
  ],
  "documents": {
    "ship-pipeline-gating.md": {
      "disposition": "keep",
      "reason": "Re-read in full against the six techniques it indexes. The cost/proof/placement triple, the cheapest-capable-observer bound, both directions of the exit-status argument, the four baseline outcomes including the unattributed comparison, and the absent-versus-corrupt asymmetry all appear here in the same terms as in the techniques, with no drift between them. Nothing found that is wrong, unsupported or ambiguous at a boundary."
    },
    "techniques/editor-only-api-audit-for-shipping.md": {
      "disposition": "keep",
      "reason": "Re-read in full. The three-outcome classification, the guard-stack requirement over a text match, the else-branch negation (the highest-value implementation detail in the document), the dependency-declaration scan and the unscannable-is-not-clean rule are each stated with the specific failure they prevent. The false-negative-versus-false-positive asymmetry is argued rather than asserted."
    },
    "techniques/fail-closed-on-corrupt-gate-config.md": {
      "disposition": "keep",
      "reason": "Re-read in full. The three-option ranking is argued from the observation that fallbacks are systematically laxer than the thresholds they replace; the absent-versus-corrupt distinction is the load-bearing half and is stated with its consequence (a corrupted file silently disabling a gate is indistinguishable from an operator turning it off); the marker-travels-with-the-verdict and marker-is-never-persisted consequences are both non-obvious and both correct."
    },
    "techniques/post-cook-process-liveness-smoke.md": {
      "disposition": "keep",
      "reason": "Re-read in full. The launcher problem is stated as three worlds a clean bootstrap exit is compatible with, the resolution ladder is ordered by strength with the derive-do-not-hardcode rule argued from configuration-dependent process names, and the terminate-only-what-you-identified rule refuses the convenient implementation for a stated reason. The 'what it does not prove' section is longer than the decision rules, which is the right proportion for a weak rung."
    },
    "techniques/preflight-before-an-expensive-cook.md": {
      "disposition": "keep",
      "reason": "Re-read in full. The f*C > c argument is stated once and told to live in the code comment so the check survives review; the three-part inclusion test ends with the evidence-existence bound that keeps preflight from annexing post-stage checks; the check-the-referent rule (a dangling default map is a harder failure than a blank one) and the do-not-auto-correct-inside-the-gate rule each name a distinct failure. Consistent with the golden path throughout."
    },
    "techniques/size-budget-and-growth-baseline.md": {
      "disposition": "keep",
      "reason": "Re-read in full. Two gates neither of which works alone, the basis requirement with an explicit refusal to compare across differing bases, the three-outcome comparison with the fourth unattributed state, the ratchet argument, and the inverted trap (a ceiling set far above the intended size is read as the intended size) are all stated with reasons. The 'record the baseline only when the build is green by the whole gate set' rule is the kind of detail that is only learned by being burned."
    },
    "techniques/validator-log-classification.md": {
      "disposition": "keep",
      "reason": "Re-read in full. Both directions of the exit-status argument are given, the mode is treated as a property established by observing real failure rather than read from documentation, the classifier is scoped to the emitting subsystem before severity, and step 9 (informational lines carrying a count) recovers a defect class a severity-only classifier discards. Total classification with unclassified as a distinct outcome is applied consistently."
    },
    "applications/node--post-cook-process-liveness-smoke.md": {
      "disposition": "keep",
      "reason": "Every cited symbol re-read against the live consumer and still accurate: gameAlive-only status (:132), the recorded-but-unjudged bootstrapExitCode, deriveGameImage (:68), tasklist resolution (:77), the 25s window (:55), and the killImage-before-killPid broadcast kill (:128, :86). The stated 149-line figure is still correct. No artifact was launched and verified_on is not refreshed."
    },
    "applications/node--preflight-before-an-expensive-cook.md": {
      "disposition": "clarify",
      "reason": "Its opening states 'src/lib/packaging/preflight.ts (443 lines)' and the file is now 482. Every substantive claim still holds - the three-valued PreflightStatus, the warn-versus-fail asymmetry on GameDefaultMap, the boolean|null|undefined third value, the scanner/wrapper split, the missing unevaluated state in overallStatus, and the size-budget configuration still not loaded in preflight. Drop the line count or replace it with symbol anchors; line numbers across this group have drifted while symbol names have not."
    },
    "applications/process--validator-log-classification.md": {
      "disposition": "keep",
      "reason": "The two independently-written judgment-mode comments were re-read in canon-conformance.ts and ue-gates.ts and still stand, as does the stated gap (neither subsystem has the unclassified outcome, while parseUbtResult does require an affirmative success marker and is named as the model to copy). Its citations are hedged as 'around line N', which has aged better than the exact line numbers elsewhere in this group. No commandlet or build was run and verified_on is not refreshed."
    }
  }
}
```
