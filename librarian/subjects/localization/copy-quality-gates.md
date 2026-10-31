---
subject: copy-quality-gates
domain: localization
last_touched: 2026-09-14
touched_by: deepen (forge-sized: coverage hole)
dry_streak: 0
---

# copy-quality-gates

**Forged 2026-09-14** (`e86f41e8`) beside [[english]], as the craft sibling of
[[translation-quality-measurement]]: the pipeline that proves source-language copy meets its
language standard, for the case the fleet actually has — coding agents writing catalog copy.
6 techniques (5 `stage: solo`, calibration `team`), 2 applications. Depth rung **L2**, with two
L3 field observations measured in this run.

## The two measured incidents it carries

- **kp's gate skipped arrays.** `flatten()` stored arrays as leaves and every content check
  early-returned for non-strings: 14 arrays / 62 strings per locale outside the em-dash ban,
  message-syntax compile and placeholder parity; the catalog's only banned em dash sat in one
  of them (`landing.voice.transcript[0]`). personas' `check-escapes` recursed and printed a
  count; personas-web recursed without one. → `rendered-string-extraction`.
- **The registry's own rules never loaded.** Rule files installed as symlinks to the
  generated source outside each project were never loaded by the harness (2.1.270, paired
  InstructionsLoaded probe; kp 0 of 4), while the installer's `--check` called them healthy.
  Fixed `84f4b6aa` (copies + drift check); re-probe 4 of 4. → `enforcement-at-the-write-seams`.

## Worker corrections to the dossier

Antislop's ~2,000-pattern ceiling is decoding-time token banning, not prompt bans; the 23.5x
style-matching figure compares few-shot with zero-shot, not with rule summaries; IFScale kept
only the verified 68%-at-500; CheckEval's +0.45 and ISO 17100 clause numbers dropped as
unverified. The subject is better for each.

## Owed (from the applications, with return conditions)

1. `link-registry --check` sits at no seam — rule copies go stale silently after a rules
   rebuild. Return: next registry tooling pass; candidate a SessionStart or post-rebuild hook.
2. The load-telemetry probe is manual. Return: the next harness upgrade (script it then).
3. The installer's byte-exact `.gitignore` comparison rewrites CRLF checkouts (seen in two
   projects). Return: next edit to `link-registry.mjs`.
4. systedo-case's i18n gate tracks em dashes in the Czech column only — the English half of
   its "identical" dash rule is unenforced (second instance of "a gate checks less than it
   claims"). **Closed 2026-09-14** by its `native-copy` adoption (English half now gated).

## 2026-09-14 — waves 2 and 3: five techniques, and the review method run on a real tree

**Wave 2 (`900dad91`)**, 6 → 11 techniques: `format-aware-check-catalog` (with the
precondition graph — a failing check silently disables its dependents, the single largest
false-positive reducer the market has), `deterministic-repair-classes`,
`length-and-render-budgets`, `severity-as-declared-data`,
`source-defects-from-cross-language-agreement`; amendments to `layered-mechanical-gate`
(statistical verdicts never block; workflow-state checks) and `anchored-model-review` (the
deterministic veto layer; unique-span expansion). **A deliberate divergence from the market is
recorded in both files:** vendors keep even rule-based spelling and grammar checks at warning;
this subject lets such a rule block once its precision is counted at 95% on the catalog,
because a counted precision is the evidence the blanket rule lacks.

**Wave 3 built the instruments** (`ba65ad99`, native-copy 1.2.0: rule metadata as data, one
span one finding, the veto CLI, eight new rules; compatibility proven by diffing every finding
on all eight fleet trees) **and ran the method** on personas-web's money pages (`4445215`,
application `process--anchored-model-review`):

- 165 units, 1,784 words; a 72-question checklist over 65 rule IDs; three fresh reviewers raised
  35 / 28 / 31; 28 findings agreed at 2-of-3, 75% of them by all three; 11 language defects
  repaired, 17 escalated as claims or term decisions (10 need a fact the tree does not state);
  checker 276 → 270 errors with 0 new; baseline 601 → 596.
- **The veto layer's first real run suppressed four findings, and all four were the veto's
  own defects** hiding two findings the panel agreed on: a fix that kept one flagged word while
  deleting the empty claim was read as a synonym swap, and a keyless unit (a module-constant
  meta description) could never pass. Both sent to a fix pass the same session. The instrument
  meant to stop bad model findings needed its own calibration run — which is this subject's
  whole argument, turned on itself.
- **Idempotence failed its target for the wrong reason:** eight re-review findings, none on
  repaired text, no flip-backs, four new on untouched wording. The technique now splits the
  check into repair stability (target zero) and panel recall (expected above zero).
- **A brief overrode the skill:** the Director asked for every agreed language defect to be
  repaired; the skill's checklist leaves judgment-level minors unrepaired. The skill's rule is
  the one [clean strings stay untouched](../../../knowledge/localization/_laws.md) implies, and
  the exercise records the override as the Director's error, not the method's.

**Owed:** a gold set to measure reviewers' false-positive rate (none exists, so the review row
is `unmeasurable`); the precondition graph and repair ledger are described but not implemented
in the checker; page-level density rules cluster per unit instead of per page; the five
application count against the forge brief's 1–3 is read as a forging budget, not a ceiling.

## Impact (2026-09-14 map regeneration)

Joined to contexts in 5 projects - gravitone 2, politicas 1, personas 1, personas-web 1,
systedo-case 1 - all `unknown`. **Routing gap:** kp, the tree that supplied this subject's
own array incident, joins 0: its i18n gate context shares no vocabulary with the subject's
`use_when`. Return: the next deepen or librarian pass on this subject - widen `use_when`
toward catalog-gate wording and re-check the join, rather than hand-editing a map.

## Adoption findings that become conditions (from 8 trees)

- A new hook system beside an existing hook installer silently disables the installer's
  checks (personas-web) - extend what exists.
- Inline shell in a lefthook job fails on Windows; call a script.
- A fingerprint over a whole long-form string means editing one word re-opens every
  baselined finding in it (personas-web guide sections, blog posts) - candidate: span-level
  fingerprints for body-class units.
- A checker crash must not share the findings exit code (fixed: exit 2).
- Coverage reads "green" while a whole string class is unseen (dash-joined titles skipped as
  non-prose, 7 banned dashes in three trees) - the second sighting of this subject's own
  rendered-string-extraction lesson, in its own instrument, the same day.

## 2026-10-31 — architecture review

All 23 documents read. Primary sources re-opened for the instruction-density, decoding-ban and checklist claims, the harness hook and rule-loading behaviour, and the veto rule count. The Furuhashi et al. 2025 result was stated more strongly than its abstract supports; two internal counts do not add up (one applied, one owed).

<!-- architecture-review:v1 -->
```json
{
  "subject": "localization/copy-quality-gates",
  "date": "2026-10-31",
  "baseline": "4940dba1b",
  "digest": "sha256-b2:a18ac83ca9069a90",
  "disposition": "clarify",
  "coverage": "All 23 documents read in full (golden path, 11 techniques, 11 applications). Source checks cover the load-bearing unstable claims (instruction-density, decoding bans, checklist evaluation, harness hook and rule-loading behaviour, the veto rule count); application citations into private trees were not re-opened.",
  "trigger": "Pending: no architecture-review record existed for this subject.",
  "intended_benefit": "A source-copy gate that agents cannot route around, whose findings cite anchors and whose coverage is counted.",
  "failure_if_ignored": "Style standards stay in prompts, gates skip container shapes and report green, and unanchored model review drifts reviewed copy.",
  "boundary": "Runs the language subjects' rules on source copy; typology, estimation and sampling stay with translation-quality-measurement; persuasion strategy is marketing's.",
  "counterexamples": [
    "A team with an established human editorial desk and no agent writers may get more from review than from end-of-session seams.",
    "Selective checklists help pairwise judging but are inconsistent in direct scoring, so a checklist reviewer can be no better than direct scoring on a given surface.",
    "A harness change to rule loading would pass a content-drift check unseen; only load telemetry catches it.",
    "Cross-language agreement on targets from one engine run points at the engine context as much as the source.",
    "A ratio budget sized to the average passes the short labels most likely to overflow."
  ],
  "sources": [
    {
      "url": "https://arxiv.org/abs/2507.11538",
      "result": "Supports: 'even the best frontier models only achieve 68% accuracy at the max density of 500 instructions'; body s4.8: 'Models overwhelmingly err toward omission errors as instruction density increases.'"
    },
    {
      "url": "https://arxiv.org/abs/2510.15061",
      "result": "Supports: token banning 'unusable at just 2,000' patterns; the Antislop Sampler 'successfully suppresses 8,000+ patterns'."
    },
    {
      "url": "https://arxiv.org/abs/2410.03608",
      "result": "Supports: '(46.4% -> 52.2%) in the frequency of exact agreements between LLM judgements and human preferences'."
    },
    {
      "url": "https://aclanthology.org/2025.emnlp-main.538",
      "result": "Narrows the corpus wording: selective checklist use 'tends to improve' pairwise evaluation, 'less consistent in direct scoring'; six generation methods, eight model sizes."
    },
    {
      "url": "https://code.claude.com/docs/en/hooks",
      "result": "Supports: 'set \"onFailure\": \"block\" on a command or http hook'; 'The field has no effect on these hooks: Stop, SubagentStop, TaskCompleted, and TeammateIdle'; on most events a failed or timed-out hook lets the action go ahead."
    },
    {
      "url": "https://code.claude.com/docs/en/memory",
      "result": "Supports: memory files are 'context, not enforced configuration'; 'A path-scoped rule loads when Claude uses the Read, Write, or Edit tool on a matching file. It also loads when Claude views a matching file with a Bash command that counts as a read, such as cat or head on a single file'; out-of-directory rule symlinks are treated like external imports."
    },
    {
      "url": "https://github.com/languagetool-org/languagetool/blob/master/languagetool-language-modules/en/src/main/resources/org/languagetool/rules/en/remote-rule-filters.xml",
      "result": "Supports: 306 rule elements in the shipping filter file and 'set the <marker> so that it exactly covers the text underlined by the remote rule.'"
    },
    {
      "source": "Existing consumer applications",
      "result": "Dated private-tree reports retained; their citations were not re-executed and their verification dates are unchanged."
    }
  ],
  "documents": {
    "copy-quality-gates.md": {
      "disposition": "clarify",
      "reason": "Furuhashi et al. 2025 is overstated as 'the gain reliable in pairwise comparison' - the abstract says selective checklist use 'tends to improve' pairwise and is 'less consistent' in direct scoring. Path-scoped loading omits the single-file shell read (cat/head) the harness memory documentation names; the technique already carries it. Remaining citations checked (IFScale 68% at 500 and omission dominance; Antislop 2,000 vs 8,000+; TICK 46.4% to 52.2%) hold."
    },
    "techniques/copy-contract-before-drafting.md": {
      "disposition": "keep",
      "reason": "Count-before-declare and the writer/checker split follow the laws; the 23.5x figure is correctly labelled few-shot vs zero-shot and preprint. Not re-opened this run."
    },
    "techniques/rendered-string-extraction.md": {
      "disposition": "keep",
      "reason": "Independent string count, branch expansion, surface classing and planted-defect fixtures address distinct failures; the incident paragraph matches its application's counts (14 arrays, 62 strings)."
    },
    "techniques/layered-mechanical-gate.md": {
      "disposition": "keep",
      "reason": "Certainty-ordered dispositions, 95%/50% thresholds and fingerprint ratchet are internally consistent with severity-as-declared-data; the declared divergence from the market is stated in both files."
    },
    "techniques/anchored-model-review.md": {
      "disposition": "clarify",
      "reason": "Furuhashi 'held in pairwise comparison' overstates 'tends to improve'. The idempotence example says 'eight findings ... but four on untouched wording', while the application records all eight on untouched text (4 repeats, 4 new); panel recall is the four new. The 306 veto filter rules and the exact-marker instruction were re-checked against the open grammar checker's shipping rule file."
    },
    "techniques/reviewer-calibration-and-sampling.md": {
      "disposition": "keep",
      "reason": "Role separation matches the ISO 17100 revision/review line; seeded calibration and surface-weighted coverage are sound; stage team is coherent with its single-author exclusion."
    },
    "techniques/enforcement-at-the-write-seams.md": {
      "disposition": "keep",
      "reason": "Re-checked 2026-10-31 against the harness hooks and memory documentation: onFailure block exists for command/http hooks and has no effect on Stop hooks; path-scoped rules load on Read/Write/Edit and a single-file shell read. The technique states both correctly."
    },
    "techniques/format-aware-check-catalog.md": {
      "disposition": "keep",
      "reason": "Precondition graph, per-format syntax/structure/escape checks and identity-not-count literals are well bounded; the 'roughly thirty-five' suppressed checks figure is code-verified 2026-09 and was not re-counted this run."
    },
    "techniques/deterministic-repair-classes.md": {
      "disposition": "keep",
      "reason": "Deterministic/idempotent/skeleton-preserving/below-meaning criteria plus the ledger and detect-always repair-from-reference rule are coherent with its application."
    },
    "techniques/length-and-render-budgets.md": {
      "disposition": "keep",
      "reason": "Three budgets are genuinely distinct; band figures agree with pseudo-localization-readiness (2-3x short, about a third more over seventy); the 85% source margin is scoped to English sources. The unnamed tool's 85% value was not re-opened."
    },
    "techniques/severity-as-declared-data.md": {
      "disposition": "keep",
      "reason": "Cascade, statistical-never-blocks and rubric versioning are consistent with the layered gate; its own application confirms the guard is not yet implemented, which the technique does not claim."
    },
    "techniques/source-defects-from-cross-language-agreement.md": {
      "disposition": "keep",
      "reason": "Absolute two-language floor, shared-input caveat and owner-verdict register are correctly hedged as triage with no measured precision."
    },
    "applications/process--copy-contract-before-drafting.md": {
      "disposition": "keep",
      "reason": "Dated private-tree report; the exemption-list vs termbase distinction is the useful finding. Citations not re-opened; verified_on unchanged."
    },
    "applications/process--enforcement-at-the-write-seams.md": {
      "disposition": "keep",
      "reason": "Already re-read against harness documentation on 2026-10-31; the documented symlink-as-external-import behaviour and stop-hook exclusion match what it records."
    },
    "applications/process--length-and-render-budgets.md": {
      "disposition": "keep",
      "reason": "Arithmetic re-checked: short-band ratios 1.48-3.2 times the 21-70 band, all example multipliers (x4.0, x3.8, x3.2, x3.0, x4.5, x3.2, x2.78, x2.75) exact. Private-tree line numbers not re-opened."
    },
    "applications/process--format-aware-check-catalog.md": {
      "disposition": "keep",
      "reason": "A/B table and floor failure are coherent (7 keys x 3 locales = 21). It reports 14,673 strings per locale where the same-day kp application reports 14,676; cannot tell whether the same tree at different moments, so left as is."
    },
    "applications/process--source-defects-from-cross-language-agreement.md": {
      "disposition": "keep",
      "reason": "Seeded A/B with three controls; correctly states precision unmeasured and the return condition."
    },
    "applications/process--deterministic-repair-classes.md": {
      "disposition": "clarify",
      "reason": "Internal count conflict left owed: 32 strings carried the control character (31 colons + 1 semicolon restored), yet 'stripping leaves 33 strings with a missing colon or an orphaned space'. Which number is right needs the stripped-arm measurement, not reachable here."
    },
    "applications/process--anchored-model-review.md": {
      "disposition": "keep",
      "reason": "All arithmetic re-checked: 35+28+31=94, minus 4 vetoed = 90; 28 agreed + 13 singles = 41 clusters; 21/28=75%; 13/41=31.7%; 13/90=14.4%; 11+17=28; 17/28=61%; 614 = 276+338 = category sum; 155+1+9=165."
    },
    "applications/process--reviewer-calibration-and-sampling.md": {
      "disposition": "keep",
      "reason": "Honest unmeasurable verdict with a falsifier and return condition; simulation labelled as such."
    },
    "applications/process--rendered-string-extraction.md": {
      "disposition": "clarify",
      "reason": "Arithmetic error: the parenthetical says the catalogs grew from 8,491 to 8,553 string leaves between measurements, but 8,491 + 62 array strings = 8,553 exactly and the table itself reads '8,553 strings, 62 inside 14 arrays' - the gate's new unit count, not growth. Other counts (14 arrays, 62 strings, five legal arrays, 34,212 = 4 x 8,553) check out."
    },
    "applications/process--severity-as-declared-data.md": {
      "disposition": "keep",
      "reason": "Harness-only experiment, 0 of 2 refused, honestly unmeasurable; places the guard in the skill rather than the project."
    }
  }
}
```

## 2026-10-31 — architecture review, after apply

Three clarify items applied (golden path, anchored-model-review, process--rendered-string-extraction); the repair application's 32-vs-33 string count stays owed. Record against the post-apply digest.

<!-- architecture-review:v1 -->
```json
{
  "subject": "localization/copy-quality-gates",
  "date": "2026-10-31",
  "baseline": "4940dba1b",
  "digest": "sha256-b2:9aa08bb39847b36f",
  "disposition": "clarify",
  "coverage": "All 23 documents read in full (golden path, 11 techniques, 11 applications). Source checks cover the load-bearing unstable claims (instruction-density, decoding bans, checklist evaluation, harness hook and rule-loading behaviour, the veto rule count); application citations into private trees were not re-opened.",
  "trigger": "Pending: no architecture-review record existed for this subject.",
  "intended_benefit": "A source-copy gate that agents cannot route around, whose findings cite anchors and whose coverage is counted.",
  "failure_if_ignored": "Style standards stay in prompts, gates skip container shapes and report green, and unanchored model review drifts reviewed copy.",
  "boundary": "Runs the language subjects' rules on source copy; typology, estimation and sampling stay with translation-quality-measurement; persuasion strategy is marketing's.",
  "counterexamples": [
    "A team with an established human editorial desk and no agent writers may get more from review than from end-of-session seams.",
    "Selective checklists help pairwise judging but are inconsistent in direct scoring, so a checklist reviewer can be no better than direct scoring on a given surface.",
    "A harness change to rule loading would pass a content-drift check unseen; only load telemetry catches it.",
    "Cross-language agreement on targets from one engine run points at the engine context as much as the source.",
    "A ratio budget sized to the average passes the short labels most likely to overflow."
  ],
  "sources": [
    {
      "url": "https://arxiv.org/abs/2507.11538",
      "result": "Supports: 'even the best frontier models only achieve 68% accuracy at the max density of 500 instructions'; body s4.8: 'Models overwhelmingly err toward omission errors as instruction density increases.'"
    },
    {
      "url": "https://arxiv.org/abs/2510.15061",
      "result": "Supports: token banning 'unusable at just 2,000' patterns; the Antislop Sampler 'successfully suppresses 8,000+ patterns'."
    },
    {
      "url": "https://arxiv.org/abs/2410.03608",
      "result": "Supports: '(46.4% -> 52.2%) in the frequency of exact agreements between LLM judgements and human preferences'."
    },
    {
      "url": "https://aclanthology.org/2025.emnlp-main.538",
      "result": "Narrows the corpus wording: selective checklist use 'tends to improve' pairwise evaluation, 'less consistent in direct scoring'; six generation methods, eight model sizes."
    },
    {
      "url": "https://code.claude.com/docs/en/hooks",
      "result": "Supports: 'set \"onFailure\": \"block\" on a command or http hook'; 'The field has no effect on these hooks: Stop, SubagentStop, TaskCompleted, and TeammateIdle'; on most events a failed or timed-out hook lets the action go ahead."
    },
    {
      "url": "https://code.claude.com/docs/en/memory",
      "result": "Supports: memory files are 'context, not enforced configuration'; 'A path-scoped rule loads when Claude uses the Read, Write, or Edit tool on a matching file. It also loads when Claude views a matching file with a Bash command that counts as a read, such as cat or head on a single file'; out-of-directory rule symlinks are treated like external imports."
    },
    {
      "url": "https://github.com/languagetool-org/languagetool/blob/master/languagetool-language-modules/en/src/main/resources/org/languagetool/rules/en/remote-rule-filters.xml",
      "result": "Supports: 306 rule elements in the shipping filter file and 'set the <marker> so that it exactly covers the text underlined by the remote rule.'"
    },
    {
      "source": "Existing consumer applications",
      "result": "Dated private-tree reports retained; their citations were not re-executed and their verification dates are unchanged."
    }
  ],
  "documents": {
    "copy-quality-gates.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: Furuhashi et al. 2025 restated as selective checklist use tending to improve pairwise comparison and being less consistent in direct scoring; path-scoped instruction loading now includes the single-file shell read the harness documentation names."
    },
    "techniques/copy-contract-before-drafting.md": {
      "disposition": "keep",
      "reason": "Count-before-declare and the writer/checker split follow the laws; the 23.5x figure is correctly labelled few-shot vs zero-shot and preprint. Not re-opened this run."
    },
    "techniques/rendered-string-extraction.md": {
      "disposition": "keep",
      "reason": "Independent string count, branch expansion, surface classing and planted-defect fixtures address distinct failures; the incident paragraph matches its application's counts (14 arrays, 62 strings)."
    },
    "techniques/layered-mechanical-gate.md": {
      "disposition": "keep",
      "reason": "Certainty-ordered dispositions, 95%/50% thresholds and fingerprint ratchet are internally consistent with severity-as-declared-data; the declared divergence from the market is stated in both files."
    },
    "techniques/anchored-model-review.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: Furuhashi wording aligned with the abstract ('tended to help in pairwise comparison and was less consistent in direct scoring'); the idempotence example now says all eight findings sat on untouched wording, four of them repeats and four new - matching its application."
    },
    "techniques/reviewer-calibration-and-sampling.md": {
      "disposition": "keep",
      "reason": "Role separation matches the ISO 17100 revision/review line; seeded calibration and surface-weighted coverage are sound; stage team is coherent with its single-author exclusion."
    },
    "techniques/enforcement-at-the-write-seams.md": {
      "disposition": "keep",
      "reason": "Re-checked 2026-10-31 against the harness hooks and memory documentation: onFailure block exists for command/http hooks and has no effect on Stop hooks; path-scoped rules load on Read/Write/Edit and a single-file shell read. The technique states both correctly."
    },
    "techniques/format-aware-check-catalog.md": {
      "disposition": "keep",
      "reason": "Precondition graph, per-format syntax/structure/escape checks and identity-not-count literals are well bounded; the 'roughly thirty-five' suppressed checks figure is code-verified 2026-09 and was not re-counted this run."
    },
    "techniques/deterministic-repair-classes.md": {
      "disposition": "keep",
      "reason": "Deterministic/idempotent/skeleton-preserving/below-meaning criteria plus the ledger and detect-always repair-from-reference rule are coherent with its application."
    },
    "techniques/length-and-render-budgets.md": {
      "disposition": "keep",
      "reason": "Three budgets are genuinely distinct; band figures agree with pseudo-localization-readiness (2-3x short, about a third more over seventy); the 85% source margin is scoped to English sources. The unnamed tool's 85% value was not re-opened."
    },
    "techniques/severity-as-declared-data.md": {
      "disposition": "keep",
      "reason": "Cascade, statistical-never-blocks and rubric versioning are consistent with the layered gate; its own application confirms the guard is not yet implemented, which the technique does not claim."
    },
    "techniques/source-defects-from-cross-language-agreement.md": {
      "disposition": "keep",
      "reason": "Absolute two-language floor, shared-input caveat and owner-verdict register are correctly hedged as triage with no measured precision."
    },
    "applications/process--copy-contract-before-drafting.md": {
      "disposition": "keep",
      "reason": "Dated private-tree report; the exemption-list vs termbase distinction is the useful finding. Citations not re-opened; verified_on unchanged."
    },
    "applications/process--enforcement-at-the-write-seams.md": {
      "disposition": "keep",
      "reason": "Already re-read against harness documentation on 2026-10-31; the documented symlink-as-external-import behaviour and stop-hook exclusion match what it records."
    },
    "applications/process--length-and-render-budgets.md": {
      "disposition": "keep",
      "reason": "Arithmetic re-checked: short-band ratios 1.48-3.2 times the 21-70 band, all example multipliers (x4.0, x3.8, x3.2, x3.0, x4.5, x3.2, x2.78, x2.75) exact. Private-tree line numbers not re-opened."
    },
    "applications/process--format-aware-check-catalog.md": {
      "disposition": "keep",
      "reason": "A/B table and floor failure are coherent (7 keys x 3 locales = 21). It reports 14,673 strings per locale where the same-day kp application reports 14,676; cannot tell whether the same tree at different moments, so left as is."
    },
    "applications/process--source-defects-from-cross-language-agreement.md": {
      "disposition": "keep",
      "reason": "Seeded A/B with three controls; correctly states precision unmeasured and the return condition."
    },
    "applications/process--deterministic-repair-classes.md": {
      "disposition": "clarify",
      "reason": "Internal count conflict left owed: 32 strings carried the control character (31 colons + 1 semicolon restored), yet 'stripping leaves 33 strings with a missing colon or an orphaned space'. Which number is right needs the stripped-arm measurement, not reachable here."
    },
    "applications/process--anchored-model-review.md": {
      "disposition": "keep",
      "reason": "All arithmetic re-checked: 35+28+31=94, minus 4 vetoed = 90; 28 agreed + 13 singles = 41 clusters; 21/28=75%; 13/41=31.7%; 13/90=14.4%; 11+17=28; 17/28=61%; 614 = 276+338 = category sum; 155+1+9=165."
    },
    "applications/process--reviewer-calibration-and-sampling.md": {
      "disposition": "keep",
      "reason": "Honest unmeasurable verdict with a falsifier and return condition; simulation labelled as such."
    },
    "applications/process--rendered-string-extraction.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the parenthetical claiming the catalogs grew from 8,491 to 8,553 string leaves now records that 8,553 is the 8,491 string leaves plus the 62 array strings, unchanged catalogs."
    },
    "applications/process--severity-as-declared-data.md": {
      "disposition": "keep",
      "reason": "Harness-only experiment, 0 of 2 refused, honestly unmeasurable; places the guard in the skill rather than the project."
    }
  }
}
```
