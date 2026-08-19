---
layer: application
type: application
subject: llm-forensic-gating
technique: structured-verdict-schemas
stack: node
status: forged
---

# The law-forensics verdict contract (Node)

The politicas repo runs Case ③ (law-change forensics): an analyst-army of
subagents researches one Czech legislative print each and returns one
`LawForensicVerdict`. The contract module `lib/analysis/law-verdict.ts` is the
single source of truth — interface, draft-07 JSON Schema, and deterministic
validator all built from the same constants, with the header stating the
domain posture verbatim: "FABRICATION IS THE WORST FAILURE — a made-up law
number or an uncited claim can defame" (`law-verdict.ts:1-13`).

## Schema and dual enforcement

`lawVerdictJsonSchema` (`law-verdict.ts:48-90`) is `additionalProperties:
false` at every level, with `severity` and citation `kind` enums spread from
the exported `LAW_FINDING_SEVERITY` / `LAW_CITATION_KINDS` constants,
`confidence` bounded 1–5, `citations` `minItems: 1`, and every prose field
`minLength: 1`. It is passed verbatim as the subagent's structured-output
schema; `validateLawVerdict` (`:223-325`) then re-checks everything
dependency-free for the plain-agent path — required keys, unexpected keys,
integer bounds — and `parseAndValidateLawVerdict` (`:334-344`) handles the
fenced-JSON extraction. A failing verdict is discarded/re-run, never
persisted; a passing one is written `pending_review`, "a lead for a human,
never a published verdict". The sibling analysis-sweep contract
(`lib/analysis/verdict.ts:19-33`) freezes six quality criteria identical to
the reference repo so scores stay cross-corpus comparable, and its comment
names `additionalProperties: false` as "the load-bearing constraint: it
rejects invented dimensions, which is the documented failure mode of an
unsupervised sweep."

## Gate scope ships with the payload

`prepare-batch.ts:103-112` assembles the anti-fabrication scope
deterministically before any model runs: `knownLawRefs` = the graph's law
nodes ∪ the e-Sbírka registry dump, `knownIds` = real company/person/law
urns — written into the payload JSON together with the counts
(`gateScope: { knownLawRefsCount, knownIdsCount }`), so the army sees the
same lists the gate will check. The gate side: every `č. N/RRRR Sb.` matched
anywhere in `JSON.stringify(verdict)` must be in `knownLawRefs`
(`citedLawRefs` + the anti-fabrication loop, `law-verdict.ts:216-221,
317-322`, reusing the ingest layer's `LAW_CITATION` regex rather than
restating it); every `graph_fact` source must be a known id; every
`web`/`bill_text` source must be an `https://` URL; every `unstatedEffect`
must carry evidence. `validateVerdict`'s `knownEntityIds` option
(`verdict.ts:195-216`) documents the second membership failure class: a
subagent putting "all 42261 rows" — a field name or slice summary — in an
entityId slot.

## Upward lessons the repo taught

- **Re-run the whole contract from stored artifacts.**
  `scripts/case-loops/law/gate-verdicts.ts:1-25` reloads every verdict JSON
  and re-runs the identical gate against the graph copy — it is "also the
  re-verify command the fleet orchestrator runs before writing to live"
  storage. A gate you can only run inline is a gate you cannot audit.
- **Membership is not scope.** batch-003's fix (`gate-verdicts.ts:35-70`):
  a `graph_fact` citing a real company urn asserted ownership/private-status
  — but company nodes only hold `{ico, subsidies_count, subsidies_total_czk}`.
  The gate now rejects claims whose substance exceeds the cited node's real
  props, with the keyword net deliberately restricted to `company:*` targets
  and the restriction documented as a scope limit, not a completeness claim.
- **Collapse divergent gate scopes.** batch-002 left the re-run gate narrower
  than the write-time gate; since a verdict passing only the wide scope was
  always going to be accepted, "canonical" measured nothing — batch-003
  merged to one scope matching the write path exactly.
- **Give behavioural rules observable outputs.** `docs/case-loops.md:262-267`:
  the handoff rule "failed as prose — four times", so every brief now names
  the handoff file and the run is unfinished unless the driver's last line is
  that path — "when a behavioural rule keeps being violated, stop restating
  it and give it an observable output."
