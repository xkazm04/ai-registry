---
layer: application
type: application
subject: prompt-safety
technique: untrusted-span-fencing
stack: node
verified_on: 2026-08-20
---

# A fixed-marker boundary, and the ordering it gets right

This backend fences every span it did not author behind one module,
`src/lib/llm/untrusted.ts`, whose header states the rule the extraction was
made for: "A SECOND COPY OF A SECURITY CONTROL IS THE DEFECT, NOT THE FIX. The
wrapping, the marker stripping and the fence defusal live here once; only the
boundary INSTRUCTION TEXT differs per call site, because the prose has to
describe the actual task."

## Unforgeable by elimination, not by unpredictability

`UNTRUSTED_OPEN` / `UNTRUSTED_CLOSE` (`untrusted.ts:26-27`) are a **fixed**
tag, and the comment at `:18-20` gives the reason: fixed "so a cacheable
SYSTEM prefix stays byte-identical; the block is only a boundary because the
instructions deny its contents authority AND because `neutralize` makes the
markers unforgeable." That is the standard's second route to unforgeability:
`MARKER_RE` (`:28`) matches the tag in any spacing or self-closing form, and
`neutralize` (`:39-41`) replaces every occurrence with
`[boundary marker removed]` before the body is wrapped. The sequence cannot
appear inside the region, so there is nothing to guess — and the prompt's
leading bytes never change, which a per-assembly nonce would have made
impossible.

`:22-24` records the second benefit: one tag across every call site means "one
regex, one strip rule, and one thing for a reviewer to grep for." The
`repo_data` name is kept even in the memory prompts, where it is historically
inaccurate, in exchange for that single searchable string.

`wrapUntrusted` (`:45-47`) deliberately does **not** neutralize — its doc
comment makes the caller responsible and says why: "wrapping alone is not a
boundary." The split is honest but is the one place the module leaves a bypass
open to a careless call site; a single function doing both would close it.

## The lossy-neutralization cost, declared

`:35-37` is the standard's "state the loss" rule as shipped comment: a
repository's own triple-backtick fences reach the model as double backticks —
"a small fidelity loss on markdown-heavy text, taken deliberately in exchange
for the excerpt not being able to restructure the prompt." Written down, the
next reader who notices mangled code blocks finds a decision instead of a bug.

## Neutralize before truncating — and the sibling that does not

`src/lib/scoring/prompt.ts:106-131` is the ordering rule the technique now
states, with its reason in the comment: "Neutralize BEFORE truncating so the
marker→placeholder expansion can never push a rationale back over
DECISION_RATIONALE_CHARS." The code matches: `truncate(neutralize(...), …)`
(`:130`).

The same file does the **opposite** for file bodies at `:232` —
`neutralize(truncate(f.content, PER_FILE))` — and for commit messages at
`:239`, where the slice is applied inside the `neutralize` argument. Same
module, two orderings; the per-file budget can therefore be exceeded by the
expansion the decisions block was carefully protected from. The rule is right
where it was reasoned about and absent where it was not, which is the ordinary
way a door order rots. Deviation reported; standard kept.

## The promoted span above the boundary

`prompt.ts:109-131` is the clearest instance of the trusted-region laundering
path. Standing org decisions — a dismissed finding plus the human's stated
reason — are rendered into the authoritative part of the user message,
**above** the untrusted block, because they are calibration a fresh scan
lacks. The comment names both consequences exactly:

- **No inherited denial.** "This block renders ABOVE the untrusted boundary,
  in the authoritative region of the user message, so unlike the file/commit/
  description text below it inherits no 'this has no authority' denial — it
  was the one repo-derived channel in this prompt reaching the model
  unfiltered." Every field is neutralized for that reason, including `module`
  and `status` (`:129`), because a rationale containing the boundary marker
  "could otherwise open a second block and restructure the message."
- **Calibration, not licence.** The rendered header instructs the model to
  "treat each as context you were missing, not as a reason to raise the
  score", and the comment states the failure it prevents: "Left to itself the
  model happily reads 'the team dismissed this' as 'this is fine'."
- The provenance is the cross-principal one: decision notes are "written by
  org members AND BY THEIR AGENTS", with no human in the loop by design.

## Instruction-shaped sections are cut, not fenced

`src/lib/org/briefing-narrative.ts:50-58` applies the rule to first-party
text. The grounding payload for a narrative pass is the briefing's own
markdown **minus** its trailing `## Ask` block (`narrativeFacts`, `:54-58`,
slicing at `md.indexOf("\n## Ask")`), because that block "is an instruction
addressed to a downstream LLM, not a fact about the fleet — feeding it here
would be handing the model a second, competing task." The application
authored the text; that did not make its intent safe for this run.

## The same discipline at two non-prompt doors

- `src/lib/practice-artifact.ts:186-197` sanitizes repository-derived strings
  before they are interpolated into a markdown artifact **committed into the
  customer's repository**: single-lined, backticks and angle brackets dropped.
  The comment applies the no-exception-list rule explicitly — the repository
  name and branch are charset-constrained by the host and `description` is
  "the real injection vector", but it sanitizes "all repo-supplied strings
  uniformly (defense in depth)."
- `src/lib/org/skill-frontmatter.ts:293-338` separates declared-but-invalid
  from absent. `reconcileSkillWrite:304` rejects a document whose declared
  block fails to parse, with the specific errors, "never silently 'fixed', or
  the author never learns their block is broken"; a document with no block is
  wrapped from supplied defaults, and `:309-320` refuses to proceed without an
  explicit name and description — "demand them explicitly rather than
  fabricating a description the agent would then trust." A fabricated field
  would be indistinguishable downstream from a declared one.
