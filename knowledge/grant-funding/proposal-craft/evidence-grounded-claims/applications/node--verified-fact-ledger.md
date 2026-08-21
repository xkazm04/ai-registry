---
layer: application
type: application
subject: evidence-grounded-claims
technique: verified-fact-ledger
stack: node
status: forged
verified_on: 2026-08-19
---

# Node: the verified org fact-ledger (grant-writing-nonprofits)

The `grant-writing-nonprofits` repo (a Next.js/TypeScript grant-writing
product) implements the ledger in `src/features/fact-ledger/`, whose header
comment states the mission verbatim: turn uploaded documents (990s, audited
financials, board rosters) "from inert bytes into a source-cited truth layer
that fills the bracketed [insert …] placeholders the draft prompts
deliberately emit" (`extract.ts:1-6`).

## The typed taxonomy and cardinality

`extract.ts:8-33` defines the closed `FactKind` union: five structured
identity/scale kinds (`ein`, `annual_revenue`, `people_served`,
`board_size`, `fiscal_year` — regex floor + LLM) and four
narrative-grounding kinds (`program_outcome`, `program_dosage`,
`demographic`, `partner`) added explicitly as "what move a draft from a
'good first draft' to submittable" (the Tiger drill-#2 data lever,
`extract.ts:15-17`). Cardinality is code, not convention: `MULTI_KINDS`
(`extract.ts:38-43`) names the kinds an org legitimately has several of
("reading AND math outcomes; several demographics/partners"); everything
else stays singular — one EIN, one revenue. The extraction parser enforces
it (`prompts.ts:81-104`): singular kinds keep the first match, multi kinds
keep up to `PER_MULTI_KIND_CAP = 3`, sixteen facts max.

## The entry shape carries provenance

`ExtractedFact` (`extract.ts:47-52`) is kind + label + verbatim value +
`FactConfidence`; `OrgFact` (`extract.ts:57-61`) extends it with
`sourceAttachmentId`, `sourceFilename`, and `via: "regex" | "llm"` — the
comment gives the reason: "every figure traces to a real file, which is
what skeptical program officers + auditors demand", with `via` recording
extraction method "for honest provenance".

## The injection contract, word for word

`renderVerifiedFactsBlock` (`extract.ts:85-96`) renders the ledger for the
drafting LLMs as a `## VERIFIED ORG FACTS` block, one line per fact with
its source filename, headed by the three-part authority claim the
technique requires: "These figures come from the organization's OWN
uploaded documents and are the authoritative source. Use the exact value
wherever one fits the narrative; do NOT state any other figure as fact,
and never round or alter these." It returns `""` when the ledger is empty
so callers interpolate unconditionally — an empty ledger degrades to the
placeholder discipline in the drafting prompts, not to a missing section.

## Two extractors, one ledger

The deterministic floor (`extractFacts`, `extract.ts:109-187`) is pure
regex over extracted document text — EIN by the canonical `NN-NNNNNNN`
shape at high confidence, revenue as a dollar amount adjacent to a
revenue/total-support cue at medium, people-served and board-size at
medium, fiscal year at low ("heuristic before AI", per the header). The
LLM pass (`prompts.ts:24-69`) enriches "the SAME text" with the kinds the
regex can't reach, under the extraction rules the sibling technique
documents; its defensive parser degrades to the regex facts on junk output
rather than throwing (`prompts.ts:74-78`).

## Closing the loop

`factKindForPlaceholder` (`extract.ts:192-206`) is the deterministic
placeholder→kind mapping (cue rules over lowercased placeholder text,
`null` for anything unmapped — "we never guess a value for an unmapped
placeholder"), and `suggestFactForPlaceholder` (`extract.ts:209-216`)
returns the resolving fact or `null`. The suggestion is surfaced to the
writer for acceptance; nothing substitutes silently.

## Why this is a faithful realization

Every technique commitment is present as enforced code rather than
guidance: closed taxonomy with per-kind cardinality caps, verbatim values,
graded confidence, per-figure source + method, an exclusive authority
claim in the injected block, and a null-returning resolution path. The one
deliberate scope choice worth copying: third-party statistics never enter
this ledger — it holds first-party org facts only, which is what keeps
the VERIFIED ORG FACTS authority claim honest.
