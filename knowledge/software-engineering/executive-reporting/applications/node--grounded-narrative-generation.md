---
layer: application
type: application
subject: executive-reporting
technique: grounded-narrative-generation
stack: node
status: forged
---

# A no-new-numbers gate around the one model-written paragraph in a board document

The repository at `C:\Users\kazda\kiro\ascent` puts exactly one LLM-written
paragraph into its executive briefing, and wraps it in
`src/lib/org/briefing-narrative.ts`. The module header (`:1-28`) states the
reasoning the technique generalizes: a briefing PDF is *"the surface most
likely to leave the building unedited"*, so a hallucinated sentence in it is
worse than no sentence, and the module is *"deliberately not a general 'ask the
model to summarize' call."* Three guarantees, all enforced in code rather than
in the prompt.

## Guarantee 1 — the model sees only the document

`narrativeFacts(b)` (`:50-59`) returns `briefingMarkdown(b)` — the briefing's
own serialization, the same figures already printed elsewhere in the same
document. No database handle, no repository contents, no history. The header
spells out the closed world: *"No DB access, no repo contents, no history."*

The detail worth stealing is the slicing. `narrativeFacts` cuts the markdown at
`"\n## Ask"` and drops everything after it, because that trailing block is an
instruction addressed to a *downstream* model — "here is what to do with this
report" — and the comment names the consequence of leaving it in: *"feeding it
here would be handing the model a second, competing task."* The grounding
payload is the facts region of the document, not the document.

## Guarantee 2 — every number in the prose is already in the data

`numericTokens` (`:62-64`) extracts every numeric run as a literal token, and
the comment states why comparison is on the token rather than a parsed value:
*"so '4' cannot satisfy a narrative that says '4.5'."*

`allowedNumbers` (`:73-75`) is the part a first implementation gets wrong. The
allowed set is the **union** of the tokens in `JSON.stringify(b)` — the
briefing object, including numbers embedded in level names, forecast headlines
and recommendation titles — and the tokens in `narrativeFacts(b)`, which the
serializer prints but the object does not directly contain (the comment cites
`up + down`, a display-only movement sum). Sourcing from the data and not only
from the prompt payload is *"what makes the claim 'no number that isn't in the
briefing data' literally true."*

`isGrounded` (`:81-83`) is then a one-line membership test over every token,
and rejection is total. The comment is explicit that discarding beats
repairing: *"a narrative that needed a number we can't vouch for is a narrative
we don't want on a board document at all."*

Ahead of the grounding gate, `isWellFormedNarrative` (`:89-95`) runs the cheap
shape checks: a floor and ceiling on length — the ceiling documented at
`:39-40` as *"a narrative longer than this is not an executive summary any
more — reject rather than truncate"* — rejection of any line beginning with
markdown structure, and rejection of any angle bracket as *"the cheap tell for
leaked internal tags or injected markup."* The escaping half of the same
concern lives at the other end of the pipeline: `cell()` in
`src/lib/report/llm-markdown.ts:29-31` collapses newlines and escapes pipes
*"so a model-written summary can't break out of a markdown table row."*

## Guarantee 3 — a fallback the caller cannot detect

`deterministicNarrative(b)` (`:98-125`) assembles the same executive read from
the briefing's own fields by template, and its docstring holds the rule that
keeps the fallback honest: *"it has to stand on its own as the briefing's
opening — it is not a placeholder."* Every rejection path — unconfigured,
disabled, timed out, refused, malformed, or ungrounded — returns it. The
header states the property: *"The caller cannot tell the difference
structurally, and there is no error state to render."*

The feature is off by default (`briefingNarrativeEnabled`, `:44-47`, requires
both an explicit flag and a key), so the default deployment, including CI,
performs no network I/O at all and ships the deterministic paragraph. That is
the degradation path exercised as the primary path rather than as an error
case.

## The economy the module leans on

`briefingMarkdown` is not written for this module. It is the same serializer
behind the "Copy for LLM" affordance and the briefing export
(`src/lib/org/briefing.ts:1-4`), the sibling of the single-generator rule
stated at `src/lib/report/llm-markdown.ts:1-7`: the copy button and the
endpoint import the same function so *"a script or agent fetching the endpoint
receives byte-for-byte what a human would have pasted out of the page."* One
serialization, three consumers — which means what the model saw, what the user
copied, and what a downstream agent ingested are provably the same document.

## Where the repo confirms and where it deviates

Confirmed: closed-world input, discard-don't-edit, indistinguishable
degradation, shape checks before the grounding gate, the single serialization.

Deviation worth naming: `isGrounded` treats any numeric token in the allowed
set as licensed anywhere in the prose. A narrative that pairs a real number
with the wrong subject — the correct figure attached to the wrong dimension —
passes. The technique's rule (the model may choose emphasis, never a quantity)
is upheld; binding a quantity to its *referent* is the harder check neither
this implementation nor the technique claims to solve, and it is the reason
the paragraph is one paragraph rather than a page.
