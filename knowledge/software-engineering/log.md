# Log — software-engineering bundle

Audit trail (OKF reserved file). Public-safe by rule.

## 2026-08-20 — deepen round 1: model-routing (LLM-provider topic)

Scope: one subject, operator-directed. Specimen: FreeLLMAPI
(`github.com/tashfeenahmed/freellmapi`, MIT, ~19k stars) read at commit
`20d41b3`, plus LiteLLM / OpenRouter / Portkey as convergence checks and a
training-data-blind lane.

Landed in model-routing (6 → 9 techniques):
- **model-identity** — the routing unit is the logical model, not the
  provider-qualified endpoint; in-group vs cross-group substitution are
  different events; grouping is a heuristic derivation with an operator
  merge/split override channel; capability lives on the member, and the group
  advertises the intersection. Convergence: specimen `model-groups` +
  LiteLLM `model_group` + OpenRouter's provider-vs-model split (3 independent).
- **failover-horizon** — substitution is free only before the first delivered
  byte; the *unusable success* (empty completion, prose where structure was
  requested, cap-truncated structure, schema-invalid tool arguments,
  unparseable tool dialect, stalled stream) is a routing signal, not an
  application error; a deterministic failure eliminates the model, not the
  credential. Boundary held: transport/status taxonomy stays with retry-backoff.
- **candidate-ranking** — ranking terms (normalized, convex, Σw=1) vs guardrail
  factors (multiply, never reorder); reliability as a posterior with a prior so
  nothing freezes out after a bad afternoon; strategy = weight vector, not a
  second engine; exploration suspended under sustained degradation with
  asymmetric entry/exit grace.
- Golden path **corrected**: the decision record must carry the *served* model,
  not only the selected one — presentation normalization of the upstream model
  field destroys the only evidence of silent provider substitution. Cites
  gate-sees-target.
- Dated application `process--candidate-ranking` (refresh_by 2026-11-20) with
  the field study and an explicit trust verdict.

Cross-subject proposals, landed the same session at operator direction:
- **retry-backoff/circuit-breakers** — an open carries provenance (heuristic /
  escalated / stated); only a heuristic open is probeable; never shorten a
  stronger open (it also launders the provenance). Scope must match the
  evidence in both directions.
- **rate-limiting/key-design** — an egress key is a copy of someone else's
  boundary, not a choice; providers meter on **pools** coarser than the
  credential and orthogonal to the operation, so the default per-credential key
  over-permits silently; remote-limit observations rank by source
  (header/quota-endpoint > error body > local counting > documentation).

Counter-evidence lane, honest results:
- rate-limiting's egress stance ("a local model of a remote authority; the
  provider's refusals are corrections") — **verified, left untouched**.
- model-routing's "no call site names a model" — **survives**, sharpened: an
  inbound model name on a compatibility surface is an alias to resolve, not a
  target to obey.
- circuit-breakers' "successes offset evidence, they do not purge it" —
  **survives against a live counter-example**; the specimen purges its failure
  window on any success. Recorded in the application as an instance of the
  defect, not folded into the rule.
- The specimen's own sticky-session premise (mid-conversation model switches
  cause a hallucination spike) is **uncited anywhere in its repository**. The
  mechanism was kept (a token-costing mitigation is charged against the budget
  routing already checked); the quality claim was **not** promoted — no
  technique rests on it.
- Secondary coverage of the specimen (dev.to, blog round-ups, Aug 2026) is
  **stale and contradicted by the tree**: "16 providers / 800M tokens / no tool
  calling or vision" vs 29 providers with tool-call rescue and vision fusion.
  Primary source only.

Declined: sticky sessions as a technique (single-sourced, premise uncited) —
banked; return condition is a published measurement of quality loss across a
mid-conversation model switch.

Instrument note, unresolved: `catalog.json` content hashes are computed over
on-disk bytes, so a checkout with `core.autocrlf=true` produces different
hashes than an LF checkout for byte-identical content. Every bundle's hash
churns on regeneration from a Windows tree. Not fixed here — flagged.

Gate green (`check-bundles.mjs`): 106 subjects · 632 techniques · 239
applications, 4208 links checked.
