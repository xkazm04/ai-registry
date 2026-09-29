---
layer: application
type: application
subject: executive-reporting
technique: grounded-narrative-generation
stack: node
status: forged
verified_on: 2026-09-29
verified_against: node@24
---

# A no-new-numbers gate around the one model-written paragraph in a board document

The repository at `ascent` puts exactly one LLM-written
paragraph into its executive briefing, and wraps it in
`src/lib/org/briefing-narrative.ts`. The module header (`:1-45`) states the
reasoning the technique generalizes: a briefing PDF is *"the surface most
likely to leave the building unedited"*, so a hallucinated sentence in it is
worse than no sentence, and the module is *"deliberately not a general 'ask the
model to summarize' call."* Three guarantees, all enforced in code rather than
in the prompt.

## Guarantee 1 — the model sees only the document

`narrativeFacts(b)` (`:86`) returns `briefingMarkdown(b)` — the briefing's
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

`numericTokens` (`:94`) extracts every numeric run as a literal token, and
the comment states why comparison is on the token rather than a parsed value:
*"so '4' cannot satisfy a narrative that says '4.5'."*

`allowedNumbers` (`:105`) is the part a first implementation gets wrong. The
allowed set is the **union** of the tokens in `JSON.stringify(b)` — the
briefing object, including numbers embedded in level names, forecast headlines
and recommendation titles — and the tokens in `narrativeFacts(b)`, which the
serializer prints but the object does not directly contain (the comment cites
`up + down`, a display-only movement sum). Sourcing from the data and not only
from the prompt payload is *"what makes the claim 'no number that isn't in the
briefing data' literally true."*

`isGrounded` (`:114`) is then a one-line membership test over every token,
and rejection is total. The comment is explicit that discarding beats
repairing: *"a narrative that needed a number we can't vouch for is a narrative
we don't want on a board document at all."*

Ahead of the grounding gate, `isWellFormedNarrative` (`:227`) runs the cheap
shape checks: a floor and ceiling on length — the ceiling documented at
`:64` (`MAX_NARRATIVE_CHARS`) as *"a narrative longer than this is not an executive summary any
more — reject rather than truncate"* — rejection of any line beginning with
markdown structure, and rejection of any angle bracket as *"the cheap tell for
leaked internal tags or injected markup."* The escaping half of the same
concern lives at the other end of the pipeline: `cell()` in
`src/lib/report/llm-markdown.ts:124` collapses newlines and escapes pipes
*"so a model-written summary can't break out of a markdown table row."*

## Guarantee 3 — a fallback the caller cannot detect

`deterministicNarrative(b)` (`:239`) assembles the same executive read from
the briefing's own fields by template, and its docstring holds the rule that
keeps the fallback honest: *"it has to stand on its own as the briefing's
opening — it is not a placeholder."* Every rejection path — unconfigured,
disabled, timed out, refused, malformed, or ungrounded — returns it. The
header states the property: *"The caller cannot tell the difference
structurally, and there is no error state to render."*

The feature is off by default (`briefingNarrativeEnabled`, `:76`, requires
an explicit flag alone; it once also required a platform key, which locked out orgs on their own model), so the default deployment, including CI,
performs no network I/O at all and ships the deterministic paragraph. That is
the degradation path exercised as the primary path rather than as an error
case.

## The economy the module leans on

`briefingMarkdown` is not written for this module. It is the same serializer
behind the "Copy for LLM" affordance and the briefing export
(`src/lib/org/briefing-markdown.ts:1`), the sibling of the single-generator rule
stated at `src/lib/report/llm-markdown.ts:1-7`: the copy button and the
endpoint import the same function so *"a script or agent fetching the endpoint
receives byte-for-byte what a human would have pasted out of the page."* One
serialization, three consumers — which means what the model saw, what the user
copied, and what a downstream agent ingested are provably the same document.

## Where the repo confirms and where it deviates

Confirmed: closed-world input, discard-don't-edit, indistinguishable
degradation, shape checks before the grounding gate, the single serialization.

Where the repo first deviated, and how it closed: the original `isGrounded` treated
any numeric token in the allowed set as licensed anywhere in the prose, so a
narrative pairing a real number with the wrong subject — the correct figure
attached to the wrong dimension — passed. That was the gap this application
recorded on 2026-08-20; by 2026-09-29 the module had closed it with a second
gate (below), which is why the deviation is now a guarantee.

## Guarantee 2b — a number is bound to its subject, not just to the document

The header now reads *"NO NEW NUMBERS, AND NO BORROWED ONES"* and names the
error class: *"'security scored 62' passes [membership] when 62 is the OVERALL
score, because 62 is somewhere in the briefing. Every number true, the sentence
false — the hardest error class for a reader to catch, and the one a board
reader is least equipped to."*

`figuresByReferent(b)` (`:145`) builds a map from a subject word — a dimension
label's last word, its id, "overall", "adoption", "rigor", "percentile" — to
every figure that subject legitimately carries in this briefing: current,
prior and delta, by absolute value because prose writes a −4 as "down 4".
`referentGrounded` (`:200`) then walks the prose and, for each standalone
figure, finds the nearest subject word within three words and never across a
sentence boundary; the figure must be one of that subject's.

Three restraints keep it from deleting the feature, each recorded in the code
with its reason:

- **Only figures with a home are judged.** A repo count or forecast horizon
  belongs to no subject, so it is left to `isGrounded`; a violation is claimed
  only where the true location of the number is known.
- **The window is three words, not a clause.** A clause-wide window binds a
  figure to a dimension merely *mentioned* nearby ("strongest on Testing (80)
  and its corpus average is 54") and rejects valid prose until the deterministic
  fallback ships most of the time — *quietly deleting the feature*. The
  accepted trade-off is in the safe direction: a figure attached to a distant
  subject goes unchecked rather than a true sentence being discarded.
- **Ambiguity widens, never narrows.** Key collisions union their sets, so the
  gate cannot invent a violation out of an ambiguous word. Identifiers glued to
  letters ("L3", "D9") are not quantities and are skipped.

## Provider seam: the org's own model

`resolveTextRunnerForOrg` (imported at `:58`) replaced a raw platform-key call
after it was noticed that a tenant on a self-hosted model had its fleet
briefing posted to a third-party API anyway. The rule the header states: an org
whose own provider is *active but unresolvable* gets the deterministic
template, never the platform provider — *"'couldn't tell' is not 'no BYOM', and
guessing routes a tenant's content to a vendor it never connected."* The
closed-world payload is still the whole briefing, so where it is sent is part of
the guarantee.
