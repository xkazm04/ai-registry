---
domain: game-production
subject: ability-authoring-to-engine
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# ability-authoring-to-engine

## Architecture review - 2026-09-09

Read all ten documents. Corrected tag-set semantics, mapping boundaries,
refinement validation and observed code-generation evidence. All three applications
remain reverify work.

Consumer implementation claims and historical measurements remain reverify work.
The digest binds the reviewed working-tree content, not a new runtime witness.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/ability-authoring-to-engine",
  "date": "2026-09-09",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:7ca2116a0870c5cc",
  "disposition": "clarify",
  "coverage": "All 10 owned documents read and assessed. Source checks are scoped below. No consumer code, engine run, model evaluation or historical incident replay; no maturity or application witness refresh.",
  "counterexamples": [
    "With successful extraction, declared={} and referenced={Ability.Strike} gives overlap zero; the same arrays after parser failure are unmeasured.",
    "A Data Table declaration is invisible to a code-only parser but can be valid in the runtime dictionary.",
    "Separator substitution can conflate a literal underscore with a hierarchy separator and make reverse mapping ambiguous.",
    "A positive destination row count can consist entirely of artifacts predating this run.",
    "A callback can claim buildOk=true while missingTags is nonempty; type validation does not observe a successful build.",
    "Applying a validated patch to a pinned base permits full candidate schema checking; whole-object return does not prevent a stale overwrite."
  ],
  "sources": [
    {
      "url": "https://dev.epicgames.com/documentation/en-us/unreal-engine/using-gameplay-tags-in-unreal-engine",
      "scope": "Official current tag declaration methods; no verification of the historical consumer UE version or runtime."
    },
    {
      "url": "https://www.unrealengine.com/tech-blog/using-gameplay-tags-to-label-and-organize-your-content-in-ue4",
      "scope": "Official historical explanation of parent matching versus Exact variants; no consumer implementation check."
    },
    {
      "url": "https://www.rfc-editor.org/rfc/rfc6902",
      "scope": "Patch operations, test and error handling; full candidate validation and concurrency control remain application responsibilities."
    },
    {
      "url": "https://slsa.dev/spec/v1.1/provenance",
      "scope": "Versioned provenance model for build inputs, outputs and builder identity; not a certification of local receipts."
    }
  ],
  "documents": {
    "ability-authoring-to-engine.md": {
      "disposition": "clarify",
      "reason": "Qualify orphan severity, patch transport, value preservation and private immutable provenance."
    },
    "techniques/declared-vs-referenced-tag-audit.md": {
      "disposition": "clarify",
      "reason": "Distinguish observed empty sets from extraction failures, effective registry from code-only declarations and unreferenced from dead tags."
    },
    "techniques/few-shot-reference-plus-tag-registry.md": {
      "disposition": "clarify",
      "reason": "Pin retrieved exemplars, validate registry revisions and remove unsupported few-shot count/effect guarantees."
    },
    "techniques/refinement-mode-minimal-diff.md": {
      "disposition": "clarify",
      "reason": "Permit validated patches, enforce pinned-base concurrency and define semantic minimality and authorized change closure."
    },
    "techniques/server-derived-codegen-report.md": {
      "disposition": "clarify",
      "reason": "Bind trusted receipts to run and expected artifacts; distinguish private provenance, replayability and observer control boundaries."
    },
    "techniques/strict-output-schema-with-derived-dependents.md": {
      "disposition": "clarify",
      "reason": "Distinguish schema requests from enforcement and deterministic derivation from judgment-based estimates."
    },
    "techniques/tag-dialect-normalization.md": {
      "disposition": "clarify",
      "reason": "Guard ambiguous and noninvertible mappings; preserve source spelling and refuse silent convention fallback after parser failure."
    },
    "applications/node--declared-vs-referenced-tag-audit.md": {
      "disposition": "reverify",
      "reason": "Reverify empty-result interpretation, declaration-source coverage and identifier mapping."
    },
    "applications/node--server-derived-codegen-report.md": {
      "disposition": "reverify",
      "reason": "Reverify receipt trust, omitted missing-tag gate, expected artifact identity and zero-as-unknown scaffold."
    },
    "applications/process--few-shot-reference-plus-tag-registry.md": {
      "disposition": "reverify",
      "reason": "Reverify prompt extraction and UE integration; scope house rules and validated-patch alternative."
    }
  }
}
```

## Architecture review - 2026-09-10 (after the compression revert)

Read all ten documents at 44c89965. This subject is a mixed tree: the applications
carry the "Review boundary - 2026-09-09" sections the pass appended, and several
techniques carry that pass's inline hedges ("Schema instructions alone do not
enforce the shape", "an authenticated runner receipt bound to this input
revision"). Those are current committed bytes and I reviewed them as such. Two of
this subject's findings are consequences of that partial application.

**The golden path and its technique now disagree about the audit's central
stance.** `declared-vs-referenced-tag-audit.md` argues at length that weighting the
two divergence directions equally is "a deliberate stance worth arguing", and gives
the argument: an undeclared reference costs one bounded, eventually-observed bug,
while a dead declaration costs the reliability of the reference material every
future authoring pass depends on - unbounded and never observed. The golden path
now says the opposite: "An undeclared reference can block acceptance; an unused
declaration is a review lead... Equal set weighting is a reporting convention, not
an equal-risk judgment." Both cannot be the subject's position. The technique's
argument is the stronger of the two and is the one the corpus is actually built
around (it is why the subject exists), so the reconciliation should run toward the
technique; either way the subject cannot ship both sentences.

**The audit's step 1 rests on a premise that is false for the system it was forged
from.** The technique says "Collect the declared set from the owning declaration.
Parse the authoritative source - the one place the system says these names exist."
I read Epic's own gameplay-tag documentation. Tags are declared from four
independent places: the Gameplay Tag Manager in project settings,
`DefaultGameplayTags.ini` plus the `Config/Tags` folder when config import is on,
Data Table assets with `GameplayTagTableRow` rows, and the native macros
(`UE_DECLARE_GAMEPLAY_TAG_EXTERN`, `UE_DEFINE_GAMEPLAY_TAG`,
`UE_DEFINE_GAMEPLAY_TAG_COMMENT`, `UE_DEFINE_GAMEPLAY_TAG_STATIC`). "The one place"
does not exist here. The technique does carry a when-not-to-use bullet for
non-centralised declaration - "the orphan list is fiction... report only the
direction you can compute, labelled as partial" - but it is filed as the exception
when for this engine it is the default, and the worked application is a code-only
parse squarely inside it. Every config-declared or DataTable-declared tag the
content references is scored as `undeclared`, which the module's own comment labels
"used but never defined - a bug". The undeclared list is therefore not
interpretable without the extraction's source coverage stated beside it. Reading
the documentation is not running the engine: I did not open a UE project or execute
the tag manager.

The same source establishes that tags are hierarchical with arbitrary depth. A
parent used only as a prefix in a query need not be separately declared or
separately referenced, so both the orphan and undeclared sets over dotted names are
sensitive to how hierarchy is handled, and neither the technique nor the golden path
says anything about it.

**The subject's own worked example contains the anti-pattern its schema technique
forbids, and nobody records it as a deviation.**
`strict-output-schema-with-derived-dependents.md` says never ask a generator for a
value computable from its other answers, and the golden path names the exact
instance as a failure mode: "A profile score that disagrees with the numbers it
profiles." The radar profile is that field. The process application lists it as
house rule 5 ("Radar values consistent with existing abilities") with no deviation
note, and `refinement-mode-minimal-diff.md` step 4 treats the profile as an
authored value the refinement must re-derive by hand ("if the shape becomes an area
effect, the area axis of the profile rises"). So three documents treat the same
field three ways: forbidden, requested, and hand-maintained. The technique already
supplies the resolution - keep it, label it the author's claim, compute the real one
alongside, treat divergence beyond a tolerance as a finding - and the application
should record the gap rather than pass it over.

**One inserted requirement overshoots the subject's own honest version.**
`server-derived-codegen-report.md` step 2 now demands "an authenticated runner
receipt bound to this input revision, build target and run" for the build rung.
That is a supply-chain-grade bar. The technique's own application states the honest
correction more modestly and more usefully: read the build result and the DataTable
row count from the project itself, and keep the agent's booleans as a labelled
self-reported column beside them. A single bar that most projects cannot clear
teaches readers to skip the rung; a ladder (locally observed by the receiver /
attested by an independent runner) keeps the rung reachable and still names the
stronger form. The when-not-to-use section already softens it back
("independence is the evidence/control boundary, not necessarily a separate
process or person"), which is the tension in visible form.

Minor, verified: `few-shot-reference-plus-tag-registry.md`'s last decision rule has
an unindented lazy continuation line ("rather than adopting against stale
vocabulary.") that breaks the list item's indentation, and the golden path's
count-versus-null sentence lost its parallel structure in editing ("one is a missing
measurement, the other an observed count whose significance depends on the expected
output"). Neither changes a claim.

What I checked and found sound: the three-agreements frame; the normalise-at-the-
boundary rule and its generalisation beyond tags; the declared-pair-outranks-
convention rule, which is correct and non-obvious; the implicated-closure definition
of minimality and the insistence that the comparison, not the instruction, is the
enforcement; the not-reported-versus-zero distinction, which is stated identically
in the technique and the application.

All three applications remain `reverify`. They cite a PoF checkout by file and line
at `verified_on` 2026-08-20 and 2026-08-30 with no commit pinned; no checkout, no
build, no engine run, no generated artifact was evaluated.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/ability-authoring-to-engine",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:adc9d789d856c1af",
  "disposition": "clarify",
  "coverage": "All 10 owned documents read in full at 44c89965, and cross-read against each other for position conflicts introduced by the partially-applied 2026-09-09 pass. One primary-source check (Epic's gameplay tag documentation) on the audit's centralisation premise. Explicitly NOT evaluated: any PoF checkout, any Unreal project, the tag parser, the forge prompt in execution, any generated C++, any build, or the codegen callback.",
  "counterexamples": [
    "Unreal declares gameplay tags from four independent sources (tag manager, DefaultGameplayTags.ini plus Config/Tags, GameplayTagTableRow data tables, native macros), so a code-only parse scores every config- or table-declared tag the content uses as 'used but never defined - a bug'.",
    "Gameplay tags are hierarchical to arbitrary depth; a parent used only as a query prefix need be neither separately declared nor separately referenced, so it can land in the orphan set or the undeclared set depending purely on the extractor's treatment of hierarchy, which no document specifies.",
    "The golden path says equal set weighting is 'a reporting convention, not an equal-risk judgment'; the technique argues equal weighting is a deliberate stance and that the orphan direction is the costlier of the two. The subject holds both.",
    "The radar profile is forbidden by the schema technique (computable from primaries), requested by the process application's house rule 5, and hand-maintained by the refinement technique's step 4.",
    "Two empty sets score 100 by vacuous truth, and the guard lives in the caller - so a one-sided empty set, which is a real and different condition, is not covered by that guard at all.",
    "An 'authenticated runner receipt' is unavailable to most projects, while the application's own honest correction - the receiver reads the build result and the row count from the project - clears the rung's actual purpose."
  ],
  "sources": [
    {
      "url": "https://dev.epicgames.com/documentation/en-us/unreal-engine/using-gameplay-tags-in-unreal-engine",
      "result": "Established four declaration sources for gameplay tags (project-settings tag manager; DefaultGameplayTags.ini and the Config/Tags folder under config import; GameplayTagTableRow data tables; the native UE_DECLARE/UE_DEFINE macro family) and that tags are hierarchical to arbitrary depth. It did NOT establish whether a parent tag must be declared before a child, nor anything about this project's configuration; no engine or project was opened."
    }
  ],
  "documents": {
    "ability-authoring-to-engine.md": {
      "disposition": "clarify",
      "reason": "Its equal-weighting sentence now contradicts the technique it summarises, and the not-reported-versus-zero passage lost its parallel structure in editing. The three-agreements frame and everything else in it is sound."
    },
    "techniques/few-shot-reference-plus-tag-registry.md": {
      "disposition": "keep",
      "reason": "The naming-from-nothing versus naming-from-a-set framing, the extract-do-not-paste rule, the embed-versus-point delivery modes and the filter-never-truncate rule all hold. Only a stray unindented continuation line in the last decision rule."
    },
    "techniques/strict-output-schema-with-derived-dependents.md": {
      "disposition": "keep",
      "reason": "The primary/derived/foreign partition, the cross-field relationship checks and the unknown-must-be-representable rule are the strongest material here and nothing in it failed a check. The radar-profile conflict is a gap in the application and the golden path, not in this technique's rule."
    },
    "techniques/refinement-mode-minimal-diff.md": {
      "disposition": "clarify",
      "reason": "Step 4 instructs the author to re-derive the profile axis by hand, which treats as authored a field the schema technique classifies as derived. State which side owns the profile once, and let the other cite it."
    },
    "techniques/tag-dialect-normalization.md": {
      "disposition": "keep",
      "reason": "The generalisation beyond tags, the idempotence requirement, the normalise-at-the-boundary-not-at-the-comparison rule and the declared-pair-outranks-convention rule are all correct and unusually transferable. No claim here failed a check."
    },
    "techniques/declared-vs-referenced-tag-audit.md": {
      "disposition": "clarify",
      "reason": "Step 1 presumes a single owning declaration, which is false for the engine this was forged from - Unreal declares gameplay tags from four places. Promote the non-centralised case from a when-not-to-use bullet to a stated precondition, require the extraction's source coverage beside the undeclared list, and say how hierarchy is handled."
    },
    "techniques/server-derived-codegen-report.md": {
      "disposition": "clarify",
      "reason": "Step 2's authenticated-runner-receipt requirement is a single bar most projects cannot clear, and the when-not-to-use section already walks it back. Express the build rung as a ladder from receiver-observed to independently attested."
    },
    "applications/process--few-shot-reference-plus-tag-registry.md": {
      "disposition": "reverify",
      "reason": "Prompt and code citations at verified_on 2026-08-20 into a checkout that was not made. Its recorded deviation - KNOWN_TAGS hand-maintained while the extractor exists and is unwired - is well identified and stays; house rule 5 needs the radar deviation added beside it."
    },
    "applications/node--declared-vs-referenced-tag-audit.md": {
      "disposition": "reverify",
      "reason": "verified_on 2026-08-30, no commit pinned, module not executed. Its own review boundary already names the Epic declaration-sources problem; that finding belongs upstream in the technique, which this review moves it to."
    },
    "applications/node--server-derived-codegen-report.md": {
      "disposition": "reverify",
      "reason": "Same unverified checkout. Its deviation - the status is derived but the rungs it derives from are still the agent's booleans - is the correct and useful finding, and is a better statement of the standard than the technique's inserted receipt requirement."
    }
  }
}
```
