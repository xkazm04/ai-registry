---
layer: technique
type: technique
subject: llm-forensic-gating
technique: citation-required-per-claim
status: forged
laws: [provenance-or-nothing, lead-not-finding]
shared_with: []
use_when:
  - a model hypothesizes effects or conflicts about named parties
  - structuring the citations block of a verdict contract
---

# Citation required per claim

The rule is absolute and structural: no uncited accusation. Every claim a
model makes that could harm a named party — a hypothesized unstated effect, a
who-benefits attribution, a conflict assessment — must carry at least one
citation, and the citation must be verifiable by code. "The verdict has a
citations section" is not the technique; the technique is the *per-claim
binding*: each accusatory unit names its evidence, and the gate checks the
binding, not just the section's existence.

## Procedure

1. **Type the citation.** Each citation is `{claim, kind, source}` with kind
   from a closed enum — fetched source document, open-web finding, store fact,
   legal instrument. The kind determines what the source slot must be and how
   it is verified: document and web kinds require a fetchable address; store
   facts require a known identifier (the membership gate); legal instruments
   require a real reference in the known set, normalized before comparison so
   formatting variants of one instrument compare equal.
2. **Bind accusations to citations by value.** A hypothesized effect's
   evidence field must be a source string that *also appears in the citations
   list* — not a paraphrase of it, the same string. This makes the binding
   checkable with a set lookup instead of a similarity judgment, and it
   forces the model to decide, per accusation, which specific evidence it is
   standing on.
3. **Require the citations list to be non-empty at the schema level.** A
   verdict with zero citations is a shape failure before it is an evidence
   failure — there is no analytical unit in this domain with nothing to cite.
4. **State the citation doctrine in the analyst contract, then enforce it in
   the gate.** The contract carries the ranking — primary registries outrank
   media; a web finding is a lead, never a fact; when in doubt about a
   reference, describe rather than cite. The contract shapes drafts; the gate
   bounds outputs. Both exist; neither substitutes for the other.

## Decision rules

- **When a claim's evidence is missing or unmatched, reject the verdict
  whole.** Dropping just the uncited effect would silently reshape the
  model's analysis into one it did not make — and would teach nothing, since
  the re-run never sees what was cut.
- **When a claim cites a store fact but asserts researched substance, demand
  re-grounding.** The fix is not to accept the citation because the claim is
  plausibly true; it is to require the claim re-tagged to the kind that can
  carry it, with the address of what was actually consulted.
- **When the model could not reach the primary source, the contract's honest
  path is disclosure plus capped confidence** — say plainly in the summary
  field that the source could not be fetched and keep confidence low. Never
  let it substitute a secondary paraphrase silently cited as the primary.
- **When symmetry is at stake, remember absence is citable.** "The sponsor
  holds money ties but none connect to this measure's subject" is a valid,
  valuable low-severity claim, and it cites the same store facts a conflict
  finding would. A citation regime that only rewards positive findings
  manufactures scandal by selection.
- **Rank sources in the doctrine, not in the gate.** Code can verify a source
  exists and has the right kind; it cannot verify a media story against a
  registry. Source-quality ranking lives in the analyst contract and in human
  review — pretending the gate enforces it overstates the gate.

## When not to use it

Do not require citations on the fields whose entire job is faithful summary of
the primary document under analysis — the "what the source says about itself"
field is implicitly cited to that document, and demanding a citation per
sentence there produces citation spam that buries the accusatory bindings the
gate actually protects. And do not treat a fully cited verdict as publishable:
citation verification proves each claim points at something real and
consultable, not that the claim is true or fair. The cited verdict is a
well-evidenced lead; the human review door decides what it becomes.
