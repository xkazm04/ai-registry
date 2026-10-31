---
subject: probe-confirmed-model-proposals
domain: software-engineering
last_touched: 2026-10-31
dry_streak: 0
---

# probe-confirmed-model-proposals

## Architecture review - 2026-10-31

This is the first review of the subject. The golden path, all five techniques and both
node applications were read in full. Every citation in the two applications was
re-read against the public tree they pin (`xkazm04/afterlife` @ `009c7893`), and each
cited line says what the application quotes. Component paths are checked by
`relPath` in the proposal parser before the save step's `existsSync`, so they cannot
escape the root. The review found one source gap and two small text faults:

- **cross-engine-agreement** says "published audits" show agreement predicts
  correctness weakly and that the most consistent engines are the most
  over-confident. It cites nothing. The only audit found (Ding, arXiv 2607.08065) is
  one preprint, and it mostly measures *self*-consistency: its cross-model check is
  exploratory and covers three tiers of one family. The large study (Kim et al.,
  arXiv 2506.07962, more than 350 models) finds that errors are correlated, and that
  "larger and more accurate models have highly correlated errors" even across
  providers. So choosing independent families lowers the correlation but does not
  remove it.
- **The golden path** says "The model never sees a probe it can influence". That
  contradicts the paragraph just before it, which lets the model suggest probes.
  The intended rule is that a suggested probe never runs unvalidated, and a required
  one is never skipped.
- **node--isolated-proposer-call**: when `withPipelines` gets a failed prepared
  probe, it returns the facts unchanged (`propose.ts:76`). So the pack does not say
  the probe was attempted. The technique requires that, and the application's
  shortfall list omits it.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/probe-confirmed-model-proposals",
  "date": "2026-10-31",
  "baseline": "50d0478a0",
  "digest": "sha256-b2:5ac77076d62c75f1",
  "disposition": "clarify",
  "trigger": "First architecture review; subject pending since forging.",
  "intended_benefit": "Model-proposed configuration is saved only as probe observations, so a fluent wrong guess cannot become persisted belief.",
  "failure_if_ignored": "Schema-valid but nonexistent paths, commands or resources are saved and trusted silently by every later consumer.",
  "boundary": "Proposals persisted as configuration where a typed instrument can test each line; immediate model-driven actions belong to prompt-safety, banded nudges to judgment-guardbands, person-elicited flows to wizard-flows.",
  "coverage": "All 8 documents read in full; every application citation re-read at the pinned afterlife commit; agreement claims checked against two arXiv papers.",
  "counterexamples": [
    "A target understandable only by running it: a sealed single call cannot see enough, and an exploring agent with a recorded trajectory is the honest instrument (isolated-proposer-call's own exclusion).",
    "A test command can only be confirmed by executing target code; afterlife saves it as a runner gate unconfirmed (confirm.ts:54).",
    "Engines from different providers still share errors: larger, more accurate models are highly correlated across providers (Kim et al.), so cross-family agreement remains a weak signal.",
    "A thrown provider maps to the same `fail` status as a refuting listing (run.ts:40), so a two-verdict implementation can still save nothing wrong while misinforming the person."
  ],
  "sources": [
    {
      "url": "https://github.com/xkazm04/afterlife/tree/009c7893",
      "result": "Re-read run.ts, confirm.ts, facts.ts, propose.ts, seal.ts, save route, index.ts, followUp.ts, agree.ts, prompt.md, probeArgs.ts, runner/agent/permissions.ts at the pin; every application citation matches. propose.ts:76 drops a failed prepared probe silently (uncited deviation)."
    },
    {
      "url": "https://arxiv.org/abs/2607.08065",
      "result": "Ding 2026 preprint: 'Self-consistency is thus a conditional proxy for correctness, not a standalone confidence score'; frontier model over-confident yet no more accurate, agreement >=0.8 on 77% of GPQA entries with 48% of those wrong. Cross-model check exploratory over three Claude tiers only. Supports the self-consistency half; does not establish cross-family results."
    },
    {
      "url": "https://arxiv.org/abs/2506.07962",
      "result": "Kim et al.: across 350+ LLMs 'substantial correlation in model errors', agreeing 60% of the time when both err; 'larger and more accurate models have highly correlated errors' even across distinct architectures and providers. Supports shared priors; qualifies 'independent families' as reducing, not removing, correlation."
    }
  ],
  "documents": {
    "probe-confirmed-model-proposals.md": {
      "disposition": "clarify",
      "reason": "'The model never sees a probe it can influence' contradicts the preceding allowance that the model may suggest probes; restate as validated-or-dropped suggestions and required probes never skipped."
    },
    "techniques/deterministic-capped-fact-pack.md": {
      "disposition": "clarify",
      "reason": "'A fast, cheap engine at low reasoning effort is then usually enough' and 'well under a second' generalize from one project with no published measurement; the one cited realization's default is a mid-tier engine and its A/B exists to decide whether the cheaper one suffices. Hedge to a measured claim once a series exists. Owed: no source confirms the general claim."
    },
    "techniques/isolated-proposer-call.md": {
      "disposition": "keep",
      "reason": "Three independent doors (no tools on both lists, empty reaped cwd ignored by discovery, single shot) and unknown-as-absent are coherent and matched at the pinned source."
    },
    "techniques/probe-per-proposed-line.md": {
      "disposition": "keep",
      "reason": "Closed grammar, server-completed probes, finding-derived follow-ups, three verdicts and HMAC sealing over canonical JSON are each realized at the pin; no disputed claims."
    },
    "techniques/found-not-hinted.md": {
      "disposition": "keep",
      "reason": "Assembly rules and the execute-to-confirm edge are consistent with the golden path and with the application's disclosed deviations."
    },
    "techniques/cross-engine-agreement.md": {
      "disposition": "clarify",
      "reason": "Uncited 'published audits ... at scale' claim: the audit is one preprint centred on self-consistency (2607.08065); correlated errors at scale come from 2506.07962, which also shows cross-provider correlation, so independent families reduce rather than remove shared priors. Cite both and scope."
    },
    "applications/node--found-not-hinted.md": {
      "disposition": "keep",
      "reason": "Every citation re-read at 009c7893 and matches; shortfalls (component strings ride through, unconfirmed gates, thrown provider as fail) verified in source."
    },
    "applications/node--isolated-proposer-call.md": {
      "disposition": "clarify",
      "reason": "Citations match at the pin, but the shortfall list omits that a failed prepared probe leaves no trace in the pack (propose.ts:76), which the fact-pack technique requires."
    }
  }
}
```

### Re-record after apply - 2026-10-31

Three clarify items were applied: the golden-path sentence, the citations in
cross-engine-agreement, and the shortfall in node--isolated-proposer-call. Both
applications had every citation re-read, so their `verified_on` is now 2026-10-31. One
item is still owed: the deterministic-capped-fact-pack claim about engine cost and
speed. No measured source supports it in general.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/probe-confirmed-model-proposals",
  "date": "2026-10-31",
  "baseline": "50d0478a0",
  "digest": "sha256-b2:e95e9515e587a42d",
  "disposition": "clarify",
  "trigger": "First architecture review; subject pending since forging.",
  "intended_benefit": "Model-proposed configuration is saved only as probe observations, so a fluent wrong guess cannot become persisted belief.",
  "failure_if_ignored": "Schema-valid but nonexistent paths, commands or resources are saved and trusted silently by every later consumer.",
  "boundary": "Proposals persisted as configuration where a typed instrument can test each line; immediate model-driven actions belong to prompt-safety, banded nudges to judgment-guardbands, person-elicited flows to wizard-flows.",
  "coverage": "Second record after applying the clarify items; same reading and sources as the first record of this date.",
  "counterexamples": [
    "A target understandable only by running it: a sealed single call cannot see enough, and an exploring agent with a recorded trajectory is the honest instrument (isolated-proposer-call's own exclusion).",
    "A test command can only be confirmed by executing target code; afterlife saves it as a runner gate unconfirmed (confirm.ts:54).",
    "Engines from different providers still share errors: larger, more accurate models are highly correlated across providers (Kim et al.), so cross-family agreement remains a weak signal.",
    "A thrown provider maps to the same `fail` status as a refuting listing (run.ts:40), so a two-verdict implementation can still save nothing wrong while misinforming the person."
  ],
  "sources": [
    {
      "url": "https://github.com/xkazm04/afterlife/tree/009c7893",
      "result": "Re-read run.ts, confirm.ts, facts.ts, propose.ts, seal.ts, save route, index.ts, followUp.ts, agree.ts, prompt.md, probeArgs.ts, runner/agent/permissions.ts at the pin; every application citation matches. propose.ts:76 drops a failed prepared probe silently (uncited deviation)."
    },
    {
      "url": "https://arxiv.org/abs/2607.08065",
      "result": "Ding 2026 preprint: 'Self-consistency is thus a conditional proxy for correctness, not a standalone confidence score'; frontier model over-confident yet no more accurate, agreement >=0.8 on 77% of GPQA entries with 48% of those wrong. Cross-model check exploratory over three Claude tiers only. Supports the self-consistency half; does not establish cross-family results."
    },
    {
      "url": "https://arxiv.org/abs/2506.07962",
      "result": "Kim et al.: across 350+ LLMs 'substantial correlation in model errors', agreeing 60% of the time when both err; 'larger and more accurate models have highly correlated errors' even across distinct architectures and providers. Supports shared priors; qualifies 'independent families' as reducing, not removing, correlation."
    }
  ],
  "documents": {
    "probe-confirmed-model-proposals.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: replaced 'The model never sees a probe it can influence' with the validated-or-dropped / required-always-runs rule, consistent with the preceding paragraph."
    },
    "techniques/deterministic-capped-fact-pack.md": {
      "disposition": "clarify",
      "reason": "'A fast, cheap engine at low reasoning effort is then usually enough' and 'well under a second' generalize from one project with no published measurement; the one cited realization's default is a mid-tier engine and its A/B exists to decide whether the cheaper one suffices. Hedge to a measured claim once a series exists. Owed: no source confirms the general claim."
    },
    "techniques/isolated-proposer-call.md": {
      "disposition": "keep",
      "reason": "Three independent doors (no tools on both lists, empty reaped cwd ignored by discovery, single shot) and unknown-as-absent are coherent and matched at the pinned source."
    },
    "techniques/probe-per-proposed-line.md": {
      "disposition": "keep",
      "reason": "Closed grammar, server-completed probes, finding-derived follow-ups, three verdicts and HMAC sealing over canonical JSON are each realized at the pin; no disputed claims."
    },
    "techniques/found-not-hinted.md": {
      "disposition": "keep",
      "reason": "Assembly rules and the execute-to-confirm edge are consistent with the golden path and with the application's disclosed deviations."
    },
    "techniques/cross-engine-agreement.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: uncited 'published audits' sentence replaced with cited, scoped claims (Kim et al. 2506.07962 correlated errors incl. cross-provider; Ding 2607.08065 self-consistency as conditional proxy, single-family cross-model check); added that independent families reduce but do not remove correlation."
    },
    "applications/node--found-not-hinted.md": {
      "disposition": "keep",
      "reason": "Every citation re-read at 009c7893 and matches; shortfalls (component strings ride through, unconfirmed gates, thrown provider as fail) verified in source. verified_on moved to 2026-10-31 after the re-read."
    },
    "applications/node--isolated-proposer-call.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: added the silent failed-prepared-probe shortfall (propose.ts:76); all citations re-read at 009c7893, verified_on moved to 2026-10-31."
    }
  }
}
```
