---
domain: game-production
subject: learning-curve-and-teaching-design
last_touched: 2026-09-10
touched_by: architecture-review
dry_streak: 0
---

# learning-curve-and-teaching-design

## Architecture review - 2026-09-10

Read and assessed all 9 owned documents. **Reverify** records completed review
coverage, not a clean content verdict. Decisions identify repairs and remaining work.
Earlier observations remain historical evidence, not refreshed runtime witnesses;
the qualifications below govern this review.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/learning-curve-and-teaching-design",
  "date": "2026-09-10",
  "baseline": "78850ba51a9aa016dcfc62817d59581453c3d90d",
  "digest": "sha256:b5effb67785ed534",
  "disposition": "reverify",
  "coverage": "All 9 owned documents read and assessed. Eleven techniques across this tranche were repaired. Remaining semantic findings, golden-path reconciliation and historical application witnesses are explicit reverify work. No consumer checkout execution, engine run, provider benchmark, player study or maturity refresh.",
  "counterexamples": [
    "Scheduled introduction does not establish competence or a universal boredom floor. Prior knowledge, discovery, rest and skill retention vary; alternative paths need path-specific requirements rather than one taught-set estimate.",
    "Four beats per atom, costly tests and ten-minute spacing are design choices, not universal necessities. Require evidence for combination teaching and distinguish optional discovery from missing required instruction.",
    "An atom inventory is useful but normalized labels can collide. Cycles may reflect incorrect prerequisites rather than duplicate atoms; a runtime introduced flag does not establish competence."
  ],
  "sources": [
    {
      "path": "knowledge/game-production/balance-validation/learning-curve-and-teaching-design/learning-curve-and-teaching-design.md",
      "scope": "Local golden path and every owned technique/application read in full. Embedded code and reported observations assessed as historical evidence; consumer implementation was not independently refreshed."
    },
    {
      "url": "https://www.itl.nist.gov/div898/handbook/apr/section1/apr131.htm",
      "scope": "Official search evidence for incomplete time-to-event observations. Used to distinguish censored observation from attained events; no player study or new learning-rate measurement."
    }
  ],
  "documents": {
    "learning-curve-and-teaching-design.md": {
      "disposition": "reverify",
      "reason": "Reverify universal learning-as-fun claims, mandatory atom scheduling, scheduled exposure as taught competence and attribution of unused mechanics to teaching. The competence technique is repaired; related golden-path assertions still need reconciliation."
    },
    "techniques/flow-corridor-as-two-sided-envelope.md": {
      "disposition": "reverify",
      "reason": "Scheduled introduction does not establish competence or a universal boredom floor. Prior knowledge, discovery, rest and skill retention vary; alternative paths need path-specific requirements rather than one taught-set estimate."
    },
    "techniques/introduce-practise-test-spacing.md": {
      "disposition": "reverify",
      "reason": "Four beats per atom, costly tests and ten-minute spacing are design choices, not universal necessities. Require evidence for combination teaching and distinguish optional discovery from missing required instruction."
    },
    "techniques/skill-atom-inventory.md": {
      "disposition": "reverify",
      "reason": "An atom inventory is useful but normalized labels can collide. Cycles may reflect incorrect prerequisites rather than duplicate atoms; a runtime introduced flag does not establish competence."
    },
    "techniques/teaching-escalation-ladder.md": {
      "disposition": "reverify",
      "reason": "Teaching modality has no universal cost/reliability ordering. Accessibility, culture and task affect what works; explicit instruction can teach, and prior failed trials of every cheaper rung are not always necessary."
    },
    "techniques/time-to-competence-measurement.md": {
      "disposition": "clarify",
      "reason": "Repaired exposure versus attainment, clock and opportunity basis, repeated-window first hits, follow-up confirmation, incomplete observations and unsupported causal attribution of departures."
    },
    "techniques/unused-mechanic-detection.md": {
      "disposition": "reverify",
      "reason": "Low use is a symptom, not proof of teaching failure. Missing opportunities and incentives are alternative causes; static scheduling and simulation policies cannot establish what a human learned or rejected."
    },
    "applications/node--unused-mechanic-detection.md": {
      "disposition": "reverify",
      "reason": "The historical simulation average below 0.1 uses per fight is not an opportunity-conditioned human learning measure. Resource eligibility and simulated decision policy need inspection before routing the finding to teaching. Historical consumer code and runtime witnesses were not rerun; preserve existing verification dates."
    },
    "applications/process--skill-atom-inventory.md": {
      "disposition": "reverify",
      "reason": "The historical skip condition Introduced OR player_level >= 5 uses exposure and level as competence proxies. Derived atom tokens can collide; declarations about input restoration require runtime evidence. Historical consumer code and runtime witnesses were not rerun; preserve existing verification dates."
    }
  }
}
```

## Architecture review - 2026-09-10 (re-review after the compression revert)

Read all 9 documents at current bytes, and read (not executed) the four `pof` sites the
two applications cite. This supersedes the earlier 2026-09-10 record on this note, whose
digest the revert invalidated, and it retracts that record's `reverify` on both
applications: their citations are unusually precise and I checked them.

At source in the `pof` working tree, `src/lib/evaluator/module-eval-prompts.ts` carries
the flow-channel sentence at **line 256**, the four-term difficulty decomposition
including "Player raw skill cannot be set, only estimated" at **line 255**, and the
"at least one new decision for the player, not just a longer fight" clause at **line
182** — the exact three lines `node--unused-mechanic-detection` names.
`src/lib/combat/simulation-engine.ts` has `avgUses < 0.1` with `type: 'ability-unused'`
at 946 against the application's cited 944–956, which is two lines of drift.
`src/lib/catalog/gap-analysis/plugins/tutorial-beats.ts` is 9 lines, exactly as reported;
`src/lib/catalog/pipelines/tutorial-beats.ts` is 619 lines against the 612 recorded at
the pinned commit `9aa31407`. Reading those files is not running the simulator and says
nothing about whether the detector's threshold is right; what it establishes is that both
applications describe the tree accurately, including the deviation that matters — the
alert's cause list enumerates three balance levers and omits the teaching cause.

Two findings, both internal to the corpus.

**The golden path asserts a contested theory of fun as the settled one, without a
source.** "The account of fun that has held up best holds that fun *is* the act of
learning a pattern, and boredom is that pattern exhausted." That is one designer's
account, and the sentence does not merely adopt it — it ranks it against a literature it
never names, and then uses the ranking to promote the atom inventory from bookkeeping to
"the ordered list of the game's actual entertainment events". The subject does not need
the ranking: the inventory earns its place from the checkability argument two paragraphs
earlier. This registry holds a whole subject on criteria carrying named sources; an
unattributed "has held up best" is the failure that subject exists to name.

**The four-position rule and the definition of the fourth beat contradict each other.**
`introduce-practise-test-spacing` lists four beats — introduce, practise, test, combine —
and step 2 says "Give every atom four positions ... An atom with three positions is a
candidate finding; an atom with two is a finding." But the same document defines combine
as "a **new atom** [that] needs its own introduce and practise beats", and step 5 promotes
every combination to its own entry. So an atom that is never combined has exactly three
positions by design, and the rule flags it. Either the fourth position belongs to the
child atom (and the count for a leaf atom is three) or it belongs to the parent (and
combinations are not separate entries); the document says both.

The rest is strong and I would not touch it. The atom-versus-mechanic distinction is
argued from the failure it prevents rather than asserted, and the "confidently wrong is
worse than ignorant" observation is the sort of thing that changes what an inventory
looks like. Expert amnesia is given a mechanism and a direction — the hypothesis is
missing atoms and essentially never carries spare ones — which makes it a checkable claim
rather than a caution. The two-sided corridor's reframing against the *taught* set rather
than the population's ability is the subject's central move and it survives every
neighbouring-subject seam it draws. All law anchors used here resolve in
`knowledge/game-production/_laws.md`.

What I did not evaluate: no simulation run, no playtest, no telemetry, no population
measurement of any kind; no time-to-competence figure exists to check. The claim that a
static sweep would catch three of the four states is untested — nothing in the tree holds
an atom inventory to run it against, which the application says plainly.

<!-- architecture-review:v1 -->
```json
{
  "subject": "game-production/learning-curve-and-teaching-design",
  "date": "2026-09-10",
  "baseline": "44c8996585f2e5e3f36e0cb0bd1983c607cadfd7",
  "digest": "sha256:4a03fa93db7acb58",
  "disposition": "clarify",
  "coverage": "All 9 owned documents read at current bytes. module-eval-prompts.ts, simulation-engine.ts and both tutorial-beats files read (not executed) in the pof working tree; law anchors resolved against knowledge/game-production/_laws.md. Not evaluated: any simulation run, playtest, telemetry, population statistic or time-to-competence measurement.",
  "counterexamples": [
    "A leaf atom that combines with nothing has three positions by the subject's own definition of the combine beat, and is flagged as a candidate finding by the rule that demands four.",
    "The corridor check is drawn against the taught set, but for an open structure with no traversal order the subject says the floor 'is not meaningful at all' — which leaves the most common shape of modern content with only the wall the subject argues is the over-encoded one.",
    "An atom taught entirely by affordance has no teaching artifact to derive from its identity token — no flag, no cue id, no text key — so the traceability property the inventory rests on is unavailable at exactly the rung the ladder tells you to start at.",
    "The detector in the cited tree cannot distinguish 'never taught' from 'taught and declined' because its population is competent by construction; the subject's four-state classification therefore has no instrument for three of its states in any simulated harness."
  ],
  "sources": [
    {
      "path": "C:/Users/kazda/kiro/pof/src/lib/evaluator/module-eval-prompts.ts",
      "result": "Read, not executed. Confirms the flow-channel sentence at line 256, the four-term difficulty decomposition with 'player raw skill cannot be set, only estimated' at 255, and the 'at least one new decision' clause at 182 — the exact lines the application cites. Confirms by absence that nothing in the file asks where a mechanic is introduced or whether a demanded competence was granted."
    },
    {
      "path": "C:/Users/kazda/kiro/pof/src/lib/combat/simulation-engine.ts and src/lib/catalog/pipelines/tutorial-beats.ts",
      "result": "Read, not executed. Confirms the ability-unused detector with avgUses < 0.1 near line 946 (two lines' drift from the cited range), tutorial-beats.ts at 619 lines against 612 at the pinned commit, and the gap plugin at exactly 9 lines. Establishes that both applications describe the tree accurately; establishes nothing about the detector's threshold or about any player."
    }
  ],
  "documents": {
    "learning-curve-and-teaching-design.md": {
      "disposition": "clarify",
      "reason": "Ranks one unnamed account of fun as the one that 'has held up best' and derives the inventory's status from that ranking; attribute it as one account, or drop the ranking, which the checkability argument does not need."
    },
    "techniques/skill-atom-inventory.md": {
      "disposition": "keep",
      "reason": "Player-side naming test, split-until-single, merge-by-lesson, the identity token and the elicit-from-a-novice step are each specific and each derived from a named failure."
    },
    "techniques/introduce-practise-test-spacing.md": {
      "disposition": "clarify",
      "reason": "Step 2 requires four positions per atom while the same document defines the fourth beat as a separate new atom with its own beats; a leaf atom is flagged by a rule the subject's own model says it cannot satisfy."
    },
    "techniques/flow-corridor-as-two-sided-envelope.md": {
      "disposition": "keep",
      "reason": "Both quantities are defined against the schedule position, both breaches are reported at one severity, and the not-a-difficulty-verdict boundary is stated."
    },
    "techniques/teaching-escalation-ladder.md": {
      "disposition": "keep",
      "reason": "Seven rungs ordered by cost and durability with the compounding cost of the top rung argued; the announced-not-taught rule and the rung-budget rule are both non-obvious and correct."
    },
    "techniques/time-to-competence-measurement.md": {
      "disposition": "keep",
      "reason": "Four-part criterion with the absence-of-prompting clause, the opportunity denominator, the modal-completion critique and the bind-to-the-teaching rule are all sound."
    },
    "techniques/unused-mechanic-detection.md": {
      "disposition": "keep",
      "reason": "Static and behavioural families separated, four-state classification with routing, and the teaching-defect-until-proven-otherwise inversion stated with its cost."
    },
    "applications/node--unused-mechanic-detection.md": {
      "disposition": "keep",
      "reason": "Lines 255, 256 and 182 of module-eval-prompts.ts confirmed verbatim at source and the detector confirmed at simulation-engine.ts:946; the structural-blindness deviation is argued, not asserted, and the standard is held rather than softened."
    },
    "applications/process--skill-atom-inventory.md": {
      "disposition": "keep",
      "reason": "The 9-line gap plugin confirmed exactly and tutorial-beats.ts confirmed at 619 lines against 612 at the pinned commit; the identity-token realisation and the four named inventory gaps are both accurately reported."
    }
  }
}
```
