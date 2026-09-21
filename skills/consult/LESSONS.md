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

## 1.2.1 - 2026-09-09 - ai-registry

- Architecture review: the shared reflection clause assumed a writable registry link in every installation. Replaced that assumption with installation-aware scope and explicit adoption. This records an instruction audit, not a field effectiveness result.

## 1.3.0 - 2026-09-09 - ai-registry

- Routing audit found a stale seven-bundle fallback and an unconditional logging write. Resolve the current catalog and honor read-only tasks when recording consults. This is a scope correction, not a measured improvement in retrieval quality.

## 1.4.0 - 2026-09-17 - skillbench

Benchmark of 414 judged runs; 14 verdicts on this skill mention the overlay artifact and ~22
fault unanchored claims about the repository. Applied in 1.5.0.

- **The runs that cited the code scored highest, and the skill never asked them to.** ~22
  verdicts fault claims about the repository asserted from the task description rather than from
  a file. Added the bar: every claim about this repo carries `<path>:<line>`, repo-root-relative,
  for a file opened in this run; an unanchored deviation is a hypothesis and must be labeled or
  dropped.
- **"The repo's own gap register (whatever it uses)" produced six destinations in six runs**, and
  judges read the invented ones as scope creep - correctly, since the skill authorized the
  invention. `## Project overlay` now names the register in a fixed order (registry map ->
  declared defect file -> none), says a repo with none gets the deviation in the response and the
  log, and forbids renumbering or restructuring a human-maintained document to make room.
- **A conditional log is a log that does not happen.** `.ai/consults.jsonl` is gitignored
  telemetry, not a repo edit, yet the write was gated on "local writes are within scope" - so
  runs skipped it and the signals lane lost the demand it exists to count. Made unconditional,
  with the membership rule stated: one row per bundle, `subjects` listing every golden path
  opened *including rejected ones*, because a rejected read is exactly the routing signal.
- **`deviations: <n>` was a number with nothing behind it.** A count with no prose is the one
  signal the registry cannot verify. The response must now list each deviation as "standard says
  X; this repo does Y at `path:line`".
