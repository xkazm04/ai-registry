# Lessons - consult

## v-unversioned - 2026-09-08 - pof

- **The manifest's domain filter can exclude the bundle that OWNS the decision, and step 2
  gives no rule for that case.** Routing a "should we replace a commercial vision API with a
  local model" question in a repo declaring `[game-production, software-engineering]`, the
  single most on-point subject was `media-generation/visual-generation/
  generative-provider-routing` (its `extraction-model-bake-off` technique is written for
  exactly that decision and carries the measured 94%-local vs 75%-frontier result), with
  `llm-observability/quality-scoring/cross-provider-benchmark-operations` close behind. Both
  are out of the declared domains. Step 2 says `--bundle` wins, else the manifest, else all
  seven — so the letter of the procedure would have dropped the best evidence in the corpus.
  `research-map.mjs` scans all bundles regardless, which is what surfaced them; the skill
  should say what to do when the top-ranked subject is out-of-domain (read it, and flag the
  manifest as under-declaring) rather than leaving the agent to decide silently.

### Redesign proposal
- Step 2 could gain a fourth clause: *"If routing ranks an out-of-domain subject at or above
  the best in-domain hit, read it anyway and record the domain gap as a finding — a manifest
  is a declaration of interest, not a claim about where knowledge lives."* Not applied here
  because it is a step-semantics change (minor bump) and one observation is thin evidence for
  changing the resolution order every project runs.
