---
domain: game-production
subject: engine-pitfall-corpus
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# engine-pitfall-corpus

## Architecture review - 2026-09-10

Read and assessed all 9 owned documents. **Reverify** records completed review
coverage, not a clean content verdict. Document decisions identify the repairs and
remaining work. Earlier observations are preserved as historical evidence; they are
not refreshed runtime witnesses and do not override the qualifications below.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/engine-pitfall-corpus",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:b002bcea3b241e2a",
  "disposition": "reverify",
  "coverage": "All 9 owned documents read and assessed. Eight techniques across this tranche were repaired. Other semantic findings, golden-path reconciliation and all historical application witnesses remain reverify work. No consumer checkout execution, engine run, provider benchmark, player study or maturity refresh. External source scope and access limitations are recorded below.",
  "counterexamples": [
    "Unknown-domain fallback can overflow context or mix incompatible versions; unknown task kinds must not silently exclude relevant advice. Validate mapping keys and distinguish universal entries from unclassified ones.",
    "Structured incident shape helps routing but prose can be addressable too. Distinguish confirmed causes, documented restrictions and reported hypotheses; redact private incident evidence.",
    "Negative introspection and failed loading can share missing initialization or permission causes. Two agreeing failures do not prove absence; probing can itself mutate or crash a process."
  ],
  "sources": [
    {
      "path": "knowledge/game-production/engine-integration/engine-pitfall-corpus/engine-pitfall-corpus.md",
      "scope": "Owned golden path, every technique and every application read as primary local review evidence. Document decisions identify internal contradictions and explicit counterexamples. Historical external implementation and mutable provider claims remain unverified; no new witness is asserted."
    }
  ],
  "documents": {
    "engine-pitfall-corpus.md": {
      "disposition": "reverify",
      "reason": "Reverify the claim that injection alone prevents incidents, universal binary impossibility, unbounded safe-superset routing and categorical provenance ordering. The repaired capability technique narrows one of these claims; the golden path still needs reconciliation."
    },
    "techniques/binary-content-wall.md": {
      "disposition": "clarify",
      "reason": "Repaired capability declarations to bind operation, version, mode and prerequisites; finite failed probes and binary storage no longer imply universal impossibility."
    },
    "techniques/domain-scoped-injection-with-a-safe-superset.md": {
      "disposition": "reverify",
      "reason": "Unknown-domain fallback can overflow context or mix incompatible versions; unknown task kinds must not silently exclude relevant advice. Validate mapping keys and distinguish universal entries from unclassified ones."
    },
    "techniques/incident-entry-shape.md": {
      "disposition": "reverify",
      "reason": "Structured incident shape helps routing but prose can be addressable too. Distinguish confirmed causes, documented restrictions and reported hypotheses; redact private incident evidence."
    },
    "techniques/introspect-before-you-call.md": {
      "disposition": "reverify",
      "reason": "Negative introspection and failed loading can share missing initialization or permission causes. Two agreeing failures do not prove absence; probing can itself mutate or crash a process."
    },
    "techniques/known-asset-paths-over-invented-ones.md": {
      "disposition": "reverify",
      "reason": "Resolved asset paths need version, identity and availability context. A stale catalog is not proof of absence, and an author may abstain instead of inventing a path."
    },
    "techniques/provenance-on-every-entry.md": {
      "disposition": "reverify",
      "reason": "One successful or failed probe does not license a universal prohibition. Compare conflicting evidence within matched contexts; documented restrictions can be authoritative without a live probe."
    },
    "applications/node--domain-scoped-injection-with-a-safe-superset.md": {
      "disposition": "reverify",
      "reason": "The historical router and 42-entry claims were not rerun. The displayed plain-object lookup needs own-key validation: inherited keys such as constructor can select a non-array value. Recheck task filtering and context-budget behavior. Preserve existing verification dates; no new consumer witness."
    },
    "applications/process--incident-entry-shape.md": {
      "disposition": "reverify",
      "reason": "The historical incident corpus and source witnesses were not reread in the consumer. Machine-specific checkout roots should be removed from published evidence; retain reported versus confirmed distinctions. Preserve existing verification dates; no new consumer witness."
    }
  }
}
```

## 2026-09-10 — architecture re-review after the compression revert

Read the golden path, all six techniques and both applications at their reverted bytes,
then re-resolved every citation against the pof checkout at HEAD `d823bffe`. Reading only —
no probe was run, no engine session opened, no entry re-verified against a live platform.

**The subject's framing is its best asset and I keep it.** "The corpus is a routing problem
before it is a writing problem" is the sentence that separates this from documentation
advice, and the success criterion it produces — the entry that would have prevented this
failure was in front of the author at the moment of authoring — is falsifiable, which is
rare for a knowledge-engineering subject. The three supporting moves each earn their place:
an incident is not yet knowledge (the detail recounts the probe, not the rule, so the entry
can be re-verified and therefore retired); scoping is an optimisation that may not lose
correctness (the asymmetry table is the whole argument in four cells); and the corpus must
state the hard boundary, because nobody files an incident for a wall they walked around.
`introspect-before-you-call` is the technique I would transplant first — the two directions
in which introspection lies, and the observation that most "impossible" pipelines are
actually *split*, are both general beyond engines.

**The routing claim re-verified in the consumer, exactly.** `formatGotchas` at
`ue-gotchas.ts:592` is verbatim what the application quotes, down to the guard comment
`// module unknown/omitted → superset (relevant unchanged).` The four properties the
application claims are all present: the hard `appliesTo` filter runs first with `web`
short-circuiting; `!g.modules ||` keeps universal entries unconditionally; an unrecognised
module yields `undefined` and skips the narrowing filter; and an empty result emits nothing
rather than a bare heading. Both recorded deviations are also still live and I confirmed
each: `knownAssetDomainsForModule` still ends in `default: return []` and `formatKnownAssets`
still returns `''` for an empty domain list, so the identifier router still falls the way
its sibling forbids — which remains the sharpest thing in the application, because it is the
one payload whose absence directly recreates the confabulation it exists to prevent. And
nothing records that the fallback fired, so a routing table that has stopped being
maintained is still invisible.

**The finding that would justify a content change is a stale count in both applications.**
`process--incident-entry-shape.md` states "At the time of extraction it held **42
entries**", which is properly tensed, but `node--domain-scoped-injection-with-a-safe-superset.md`
carries the number in its title ("Routing 42 pitfalls to a module in ~15 lines of
TypeScript") and in its closing measurement ("Injection cost drops from all 42 entries to
the universal ones plus the handful tagged `materials`"), where it reads as current. At pof
HEAD the corpus holds **55** entries and the file is 606 lines rather than the 508 the
sibling subject's application quotes. Every cited line number has moved with it:
`MODULE_GOTCHA_DOMAINS` is at `:551` against a cited `:443`, and `formatGotchas` at `:592`
against `:484`. The corpus growing by thirteen entries in under three weeks is also, in
itself, the health signal `provenance-on-every-entry` asks a reader to watch — and neither
application can report it, because neither records a date beside its count.

**A boundary the techniques leave open.** `provenance-on-every-entry` prescribes an audit
triggered by the upgrade, not by the calendar, and gives four verdicts (still holds,
changed, retired, unverified). It has nothing to say about an entry whose *platform* has not
moved but whose *pipeline* has — the case where a wall is demoted because the team found a
code-side route, or where a probe's mode is no longer the mode anything runs in. The subject
treats staleness as a property of the platform version alone, and the consumer's own history
shows the other kind: `binary-content-wall` is answered in that tree by a BT-free controller
checklist item, which is a capability change on the team's side, not the platform's. Below
the bar for a rewrite; worth a clause in the audit procedure.

**Where the subject is honest about its own limits.** `known-asset-paths-over-invented-ones`
ends by saying a catalogue is a workaround for the absence of a reliable lookup rather than
an improvement on one, and `introspect-before-you-call` immediately explains why that lookup
is unreliable in exactly the case the catalogue exists for. That pair is the subject arguing
against itself correctly, and it is why I keep both without qualification.

**Not evaluated.** No capability probe was run in any execution mode, no entry's claim was
tested against Unreal 5.8 or any other release, no router was executed, and the corpus's
individual entries were assessed only as quoted by the applications. Every claim about the
platform in this subject remains, from this review's standpoint, unverified — which the
subject would call the honest state rather than a failure.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/engine-pitfall-corpus",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:3c6621c30d66cf18",
  "disposition": "reverify",
  "coverage": "All 9 owned documents read in full at their reverted bytes. Both applications' citations re-resolved by reading pof at HEAD d823bffe: knowledge/ue-gotchas.ts (entry count, router table, formatGotchas body and its fallback comment) and knowledge/ue-known-assets.ts (formatKnownAssets, knownAssetDomainsForModule and its default branch). Not evaluated: no capability probe in any execution mode, no entry tested against a live engine release, no router executed, and no individual corpus entry's platform claim independently verified.",
  "counterexamples": [
    "An entry whose platform version has not moved but whose pipeline capability has — a wall demoted because the team found a code-side route, or a probe whose execution mode nothing runs in any more — is stale in a way the upgrade-triggered audit never selects for, because that audit filters on platform version alone.",
    "A corpus that grows thirteen entries in three weeks is either a maturing capture pipeline or a platform churning underneath, and provenance-on-every-entry asks a reader to watch exactly that ratio — but neither application records a date beside its entry count, so the signal is unreadable from the corpus's own documents.",
    "The identifier router in the same folder as the pitfall router defaults an unrecognised module to the empty set, which is the fallback direction the technique forbids; the technique is right and the deviation is recorded, but it demonstrates that stating the asymmetry once does not propagate it to a sibling payload."
  ],
  "sources": [
    {"url": "file:///C:/Users/kazda/kiro/pof/src/lib/knowledge/ue-gotchas.ts", "result": "Read at pof HEAD d823bffe. The corpus now holds 55 entries in 606 lines, against the 42 both applications state. MODULE_GOTCHA_DOMAINS is at :551 (cited :443) and formatGotchas at :592 (cited :484); the function body and its unknown-module guard comment are verbatim as quoted. Establishes the router's behaviour by reading; establishes nothing about whether any individual entry's platform claim still holds."},
    {"url": "file:///C:/Users/kazda/kiro/pof/src/lib/knowledge/ue-known-assets.ts", "result": "Read at pof HEAD. formatKnownAssets (:198) still returns '' for an empty domain list and knownAssetDomainsForModule (:221) still ends in `default: return []`, so the empty-set fallback the application records as a deviation is unchanged. Confirms the two routers still disagree about the same question."}
  ],
  "documents": {
    "engine-pitfall-corpus.md": {"disposition": "keep", "reason": "Routing-before-writing as the framing, one falsifiable success criterion, and five sections that each hand a rule to a technique. The supplier relationship to root-cause analysis, with only confirmed causes admitted, and the seams to prompt architecture and the wiring contract are stated without designing either."},
    "techniques/binary-content-wall.md": {"disposition": "keep", "reason": "The general test (an artifact whose authoritative representation is opaque and tool-authored, where a partial shell passes structural checks) is stated rather than enumerated, each wall item carries its reason and its alternative, and the hand-off into the wiring contract closes the refusal. Promotion requires a proven impossibility and demotion is required on capability gain."},
    "techniques/domain-scoped-injection-with-a-safe-superset.md": {"disposition": "keep", "reason": "The five-step selection, the cost/visibility asymmetry table that decides step five, and the three-way distinction between nothing matched, descriptor unknown and router did not run. The requirement that an explicit empty domain set differ from an omission is implemented verbatim in the consumer."},
    "techniques/incident-entry-shape.md": {"disposition": "keep", "reason": "Five fields each justified by the failure that kills a corpus lacking it, two axes of scope with task kind as a hard filter, the summary-is-a-conclusion rules, and the three-layer entry kept whole because splitting it loses the lesson that fixing layer one produces a convincing wrong result."},
    "techniques/introspect-before-you-call.md": {"disposition": "keep", "reason": "The two directions in which introspection lies, each with its own remedy; assert the effect not the call; and the observation that most impossible pipelines are split rather than impossible, which converts a dead end into an architecture. The most transplantable technique in the subject."},
    "techniques/known-asset-paths-over-invented-ones.md": {"disposition": "keep", "reason": "Correctly diagnoses confabulation as completion under a missing fact rather than a defect to be prompted away, and removes the missing fact. Ends by conceding that a catalogue is a workaround for an unreliable lookup rather than an improvement on one, which its sibling technique then explains."},
    "techniques/provenance-on-every-entry.md": {"disposition": "keep", "reason": "Three visibly distinct strength grades with only the probed grade licensing a prohibition, the argument for why collapsing grades costs the strong entries their credibility, and unverified as a state rather than a pass. Silent only on staleness that originates on the team's side rather than the platform's."},
    "applications/node--domain-scoped-injection-with-a-safe-superset.md": {"disposition": "reverify", "reason": "The mechanism re-resolved verbatim and both deviations are still live, but the entry count is stale in the title and in the closing measurement — 55 at HEAD, not 42 — and both cited line numbers have moved by roughly a hundred lines. The standard is untouched; the witness needs refreshing."},
    "applications/process--incident-entry-shape.md": {"disposition": "reverify", "reason": "Properly tensed ('at the time of extraction'), and its structural deviation stands: provenance still lives in prose inside detail and in a free-text source string rather than in typed strength/version/mode/date fields, so the upgrade audit it prescribes still cannot be run by selection. Reverify because the corpus it describes has grown by thirteen entries and none of the quoted entries was re-read at HEAD."}
  }
}
```
