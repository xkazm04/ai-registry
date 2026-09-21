---
subject: generative-provider-auditing
domain: game-production
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# generative-provider-auditing

First touch: 2026-09-01, an `/intake` run on a sponsored faceless-channel walkthrough
([[../../sources/2026-09-01-faceless-channel-claude-code]]). The source authorized nothing
in this subject — every content candidate it raised was already covered, twice over in the
case that mattered — but verifying one of those catches found a live consumer that
violates the subject's central technique, and the run landed there instead.

## State

6 techniques unchanged, 3 -> 4 applications. The new one is the subject's **first
application of `never-the-account-default`**, which until now was the only technique in
the subject with no tree behind it — notable given the golden path opens by calling
Identity the first of its four audited properties.

Landed:

- `applications/node--never-the-account-default.md` — `applied: code`,
  `ab_verdict: better`, `proof: ab-paired`. Shipped to the consumer as `e3b3f09`
  (not pushed).

## What the tree said back

The application is a **negative** one and that is why it is worth keeping. The consumer had
independently derived this technique's first decision rule — *a request parameter is a
claim by the caller, only the echoed identity is a claim by the party that did the work* —
and implemented it for **cost**, with a `CostBasis` discriminator and a comment arguing
from a real incident. It never occurred to anyone that the same argument governs
**identity**, which sat one line above as a bare required string.

So of the four properties this subject enumerates, that tree had modelled the epistemic
status of three (cost, custody, re-routing) and of Identity none. Nobody designed the
asymmetry. It is the strongest evidence the run produced, and it is evidence *for* the
subject's framing: the four properties really are separable, and a team can win the
argument for one while never noticing it applies to its neighbour.

## Open

- **`undisclosed` is declared but unreached.** The new enum carries a state for a provider
  whose contract exposes no identifier at all — the case the technique's *When NOT to use
  this* governs — because that shape is now a marketed product category rather than a
  hypothetical (the source's one genuine currency signal). No vendor in the consumer's
  roster is in that state, so the branch is untested in any tree.
  **Return condition:** a connected project adopts a routing-owning provider.
- **Nothing refuses on the field yet.** The technique asks that unattributable output be
  kept out of shipping classes; the consumer now makes attribution status legible but no
  gate reads it. A future application could measure whether legibility alone changes a
  shipping decision, which is the honest open question about this whole class of change.
- The five recorded identities are all `requested`. Upgrading any to `vendor-reported`
  needs per-adapter response parsing — named in the application as its return condition.

## Watch

`never-the-account-default` is now applied once. A second consumer would be worth having
specifically because this one **agreed with the technique in three places and missed it in
the fourth** — a second tree showing the same partial adoption would promote "teams model
basis for numbers and not for identities" from an anecdote to a pattern worth stating in
the golden path.

## Architecture review - 2026-09-10

Read and assessed all 11 owned documents. **Reverify** records completed review
coverage, not a clean content verdict. Document decisions identify the repairs and
remaining work. Earlier observations are preserved as historical evidence; they are
not refreshed runtime witnesses and do not override the qualifications below.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/generative-provider-auditing",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:d6c9753d58921e7a",
  "disposition": "reverify",
  "coverage": "All 11 owned documents read and assessed. Eight techniques across this tranche were repaired. Other semantic findings, golden-path reconciliation and all historical application witnesses remain reverify work. No consumer checkout execution, engine run, provider benchmark, player study or maturity refresh. External source scope and access limitations are recorded below.",
  "counterexamples": [
    "Single outputs per class cannot establish general quality rankings. Use representative tasks, repeated independent generations, blinded comparison and declared resource/finishing budgets; raw and end-to-end objectives may select different models.",
    "Capability membership can equal registry membership. Attribution requirements do not imply noncommercial-only use: CC BY permits commercial use subject to conditions. Eligibility needs actual terms, plan, intended use and other rights, not a blanket boolean.",
    "A provider echo is provider-reported identity, not independent proof of exact weights or immutable aliases. Explicit audited environment configuration can identify a model; undisclosed identity must remain distinguishable from inferred identity."
  ],
  "sources": [
    {
      "url": "https://creativecommons.org/licenses/by/4.0/",
      "scope": "Official deed read: attribution conditions coexist with commercial-use permission; it also notes other rights may remain. This refutes attribution-equals-noncommercial, not any particular provider or asset eligibility."
    }
  ],
  "documents": {
    "generative-provider-auditing.md": {
      "disposition": "reverify",
      "reason": "Reverify requested versus reported identity, mutable model aliases, custody durability and blanket commercial eligibility. Benchmarks and license declarations are scoped evidence, not proof of every future output or use."
    },
    "techniques/arena-benchmark-protocol.md": {
      "disposition": "reverify",
      "reason": "Single outputs per class cannot establish general quality rankings. Use representative tasks, repeated independent generations, blinded comparison and declared resource/finishing budgets; raw and end-to-end objectives may select different models."
    },
    "techniques/capability-is-not-registry-membership.md": {
      "disposition": "reverify",
      "reason": "Capability membership can equal registry membership. Attribution requirements do not imply noncommercial-only use: CC BY permits commercial use subject to conditions. Eligibility needs actual terms, plan, intended use and other rights, not a blanket boolean."
    },
    "techniques/never-the-account-default.md": {
      "disposition": "reverify",
      "reason": "A provider echo is provider-reported identity, not independent proof of exact weights or immutable aliases. Explicit audited environment configuration can identify a model; undisclosed identity must remain distinguishable from inferred identity."
    },
    "techniques/pin-a-model-per-asset-class.md": {
      "disposition": "reverify",
      "reason": "Pin the full relevant configuration and evaluation objective, not just a name. A finishing-inclusive benchmark can legitimately prefer an output that exceeds a raw intermediate budget. Downloading into RAM does not establish durable local custody."
    },
    "techniques/record-negative-benchmarks-in-place.md": {
      "disposition": "reverify",
      "reason": "Keep negative results bound to versions, task, costs and evidence. Operational refusal and qualitative preference have different evidentiary requirements; new models do not erase old failures."
    },
    "techniques/refuse-with-reason-not-greyed-out.md": {
      "disposition": "reverify",
      "reason": "Structured error channels can carry nonretryable refusals without inevitable infinite retry. An authorized, declared fallback may be valid; repeated unsupported requests alone do not establish a benchmark result."
    },
    "applications/node--capability-is-not-registry-membership.md": {
      "disposition": "reverify",
      "reason": "The historical capability roster was not rechecked against current service plans. Commercial permission and attribution must be assessed from the applicable terms and use, not an unconditional provider flag. Preserve existing verification dates; no new consumer witness."
    },
    "applications/node--never-the-account-default.md": {
      "disposition": "reverify",
      "reason": "The historical five identity sites were not rerun. Type declarations alone do not establish adapter parsing, persistence or a shipping gate; preserve requested, vendor-reported and undisclosed states. Preserve existing verification dates; no new consumer witness."
    },
    "applications/node--pin-a-model-per-asset-class.md": {
      "disposition": "reverify",
      "reason": "The displayed download-then-delete sequence obtains an in-memory buffer before deleting the remote copy; that is not durable custody. Require verified durable storage and recovery before remote deletion. The historical consumer was not changed or rerun. Preserve existing verification dates; no new consumer witness."
    },
    "applications/process--arena-benchmark-protocol.md": {
      "disposition": "reverify",
      "reason": "The historical arena runs were not repeated. A small class sample and one chair comparison do not establish general model equivalence; weight-license claims do not settle all output rights. Preserve existing verification dates; no new consumer witness."
    }
  }
}
```
