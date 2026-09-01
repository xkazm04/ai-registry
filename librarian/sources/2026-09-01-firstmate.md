---
source: github:kunchenguid/firstmate
kind: repository - OSS tool repository behaving as a first-party practitioner account
url: https://github.com/kunchenguid/firstmate
title: "firstmate - Talk to one agent. Ship with a crew."
author: kunchenguid
commit: a5f3cbeeb71768bca2ac54c6926d314b6d27b836
words: 2434 landing / 174027 in-tree markdown (112362 in docs/, 42018 in .agents/)
loc: 218026 across 344 shell files plus Node and Python
extracted: 14
accepted: 4
declined: 0
leads: 2
already_covered: 2
untriaged: 8
applied: 4
shipped: 0
dispatched: 0
run_id: intake-firstmate
siblings: 2
---

# firstmate - a multi-harness agent supervision layer

## Class, and the yield it predicted

Read as an **OSS tool repository behaving as a first-party practitioner
account in repository form** - the pgrust shape, and the ratio is the most
extreme this ledger has recorded: **2,434 rendered words against 174,027
words of in-tree markdown**, a 76:1 inversion. A run that mined the ingest
would have mined an advertisement and produced nothing.

What the class does not predict is the `docs/verification/` lane: eight
documents whose entire job is recording *what was measured, against which
version, on which date, and what remains uncovered*. They read like a
maintainer's evidence file rather than documentation, and they are where the
whole yield came from. Expected yield was stated before the triage table as
**above the class norm, 3-5, mostly amendments**. Four landed - two
techniques and two amendments - which is the call.

**0 of 3 fetches**, the fourteenth consecutive zero-fetch run on a source
carrying its own primary material. Corroboration was corpus-internal plus
training-data convergence, and for all four landings it was stronger than a
fetch would have been, because every finding is a gap in *our* model rather
than a fact about the world.

Two siblings were live at Phase 1 (`voltagent-w4` holding agent-chaining,
plan-review and fleet-orchestration; `slideops-readme` holding
repository-landing-document and docs-sync). Neither held any subject this run
routed to; both had committed and released before the first write. The gate
was found red at Phase 1 on the slideops sibling's untracked subject - named,
not touched, and green by the time this run regenerated.

## What landed

**1. `context-reset-redelivery`** (new technique, agent-instruction-files) -
the subject's opening sentence says the harness injects the instruction file
at session start, and every one of its eleven techniques audits **the file**.
Nothing audits the **copy**. `instruction-freshness` couples the file to repo
change; `substrate-coupled-expiry` adds the model axis; a third divergence
leaves the file innocent - the agent holds a snapshot, and a clear or a
compaction re-delivers whatever the injector cached rather than what the file
now says. `compact` returns **zero** prior art corpus-wide in this sense; every
hit is an unrelated meaning of the word. The signature: an instruction obeyed
early in a session and not late, with no edit in between - a delivery question
that no amount of rewriting the line will touch. The expensive case is not a
new rule ignored but a **correction** ignored, minted mid-session into a file
the agent will not re-read.

**2. `unmeasurable-criteria`** (amendment, quality-gates) - the technique's
three honest resolutions are correct for a gate standing **beside** the work,
and one branch inverts for a gate standing **in** it. The corpus says a hole in
the gate's own instrument must fail closed; the source's shell-command guard
deliberately fails **open** on a missing runtime and closed on unclassifiable
syntax. The discriminator: when the remedy path runs through the capability the
gate controls, fail-closed on a dead instrument is not strictness, it is a
deadlock whose exit is outside the system. The pairing is what keeps it safe -
an in-path gate may open on its own breakage precisely because it still closes
on every input it can see and dislikes.

**3. `child-observed-posture`** (amendment, agent-cli-transport) - the
technique enumerates three seams plus a fourth, and every one is read from the
child's **setup**: argv received, environment received, binary exists, sandbox
came up. Context *arrival* is a seam whose only possible witness is the model,
because the model's context is the destination and nothing else can see it. The
subject already half-knows this and only in the suppressing direction: the
`generate` mode's neutral working directory exists *so the tool loads no
ambient project instructions*. One direction gets a whole mode; the inverse -
where the host intends context to arrive - gets no probe and no row.

**4. `self-reported-gate-inputs`** (new technique, quality-gates) - a fifth way
a gate is unfireable, beside the three in `severity-by-construction` and the
derived condition in `vacuous-by-evaluation`: the severity is real, the exit
code depends on it, the evaluation is honest, and **the input is supplied by
the thing being judged**. The sharp form is not evasion but structural
inertness - the guard evaluates correctly against an empty set and permits -
and the recovery instinct cannot work, because no check keyed on the record can
detect the absence of the record. Carries the override half: where the gated
party is machinery, after-the-fact attribution is circular, so the hatch needs
a property of the **channel** - it must live where the gated party cannot write
it during the run it would authorize.

## Applied: 4 rows, 4 `better`, 1:1 with landings

Two arms every time, same instrument, one variable.

- **`context-reset-redelivery`** -> `experiment`/`better`. Live harness, two
  injectors, file edited between opens. Caching arm delivered `RULE-V1` twice;
  re-reading arm delivered `RULE-V1` then `RULE-V2`. **All four opens produced
  an identical producer signal.** Honest bound written in: the mechanism is
  proven, the *trigger* is not - a compaction cannot be forced headlessly, so
  re-delivery was driven by a fresh open. Fleet position is the useful half:
  **no project ships a session-start injector at all**, so none holds the
  defect, and every project's floor is delivered by native re-injection whose
  per-event behaviour nobody has verified.
- **`child-observed-posture`** -> `experiment`/`better`. Same hook, same bytes,
  same exit 0, one variable: the stream. stdout arm quoted the token back;
  stderr arm answered `NO_TOKEN`. Producer evidence byte-identical in both. The
  **negative arm is the half worth paying for** - it is what shows the probe is
  necessary rather than that the wiring happens to be right today. A second
  harness was installed and did not complete inside its budget; recorded **not
  exercised**, not as a negative.
- **`unmeasurable-criteria`** -> `experiment`/`better`, and **the apply
  refuted the amendment's own wording before commit**. A fleet turn-end hook
  already ships the split: three exit codes, with could-not-check routed to the
  operator as non-blocking while the actor proceeds. The draft had said
  "fail-open, silently and deliberately"; silence is what `absent-guard-is-loud`
  forbids, and the correct form is **open to the actor, loud to the operator, on
  a code of its own** - because the two audiences differ and only one can repair
  an instrument. Arm A (two states) turns three distinct instrument failures
  into the same green as an honest pass, which the file's own header records as
  having actually happened.
- **`self-reported-gate-inputs`** -> `experiment`/`better`, against this
  registry's own concurrency board. An unclaimed writer was simulated under an
  unheld subject path: the shipped check returned `clear: no live sibling holds
  1 target(s)`, exit 0 - **the exact bytes it produces when the board is
  genuinely empty**. Asked of the act instead of the record, the same path reads
  contended. The method's own prose already names running without a claim as an
  anti-pattern and it was never mechanised, which is `prose-rule-drift` with the
  reason this technique supplies.

**Ship 0**, and three of the four are `declined: no change warranted` rather
than blocked - no project holds the caching-injector defect, the turn-end hook
already implements the amendment (which is why it could validate it), and the
delivery probe is an instrument rather than a change. The fourth is a real open
decision put to the operator: a small backstop in the board's `check` so a
contended path with no claim behind it reads contended-unclaimed.

## Already covered (2)

- **A verified version is evidence, not a compatibility bound.**
  `dated-capability-matrix` already carries this as a staleness trigger - "a
  version the matrix has not seen" makes rows stale without gating - and
  `adaptive-fidelity-tiers/measured-not-declared-capability` holds the probe
  discipline. The source's framing ("those versions remain verification evidence
  rather than compatibility bounds") is a good sentence and not a new rule.
- **The refresh command travels with the dated measurement.**
  `derivation-names-recomputation` as a law, plus the matrix's own
  "Recomputation is named and triggered" section. The source states it more
  concretely - each table names the exact command that re-dates it - but the
  corpus owns the rule.

## Leads (2)

- **Installing a handler is an exposure condition its off-switch does not
  cover.** The source proved, with a smallest-counterfactual, that a feature's
  *loaded* input handler duplicated model turns whether the persisted toggle was
  on or off - "extension loading, not the active toggle, was the required
  exposure condition". Generalizes to any plugin whose registration has effects
  its enable flag does not gate, and it inverts the usual debugging instinct
  (turn it off and retest, which here reproduces the bug). No clean home: not
  quality-gates, not agent-instruction-files. **Return condition**: a subject on
  extension or plugin lifecycle, or a managed project shipping a plugin with a
  load-time side effect.
- **A defect record that states what would have refuted its own conclusion.**
  The source uses one fixed schema across three unrelated regressions -
  initiating trigger, exposure condition, visible symptom, earliest divergence,
  smallest counterfactual, and an explicit falsifier ("the leading cause would
  have been falsified if the row or height remained... none occurred"). The
  corpus has nothing on defect-record form. **Return condition**: a debugging or
  incident-analysis subject is forged, or a managed project adopts a postmortem
  template worth measuring against.

## Untriaged (8) - reached the table, never picked, nobody verified

Recorded with anchors so a later run does not re-derive them. **No judgment is
implied**; these were not declined.

| Candidate | Where in the tree | My read at triage |
| --- | --- | --- |
| A design decision carries the observation that would retire it and the fallback it flips to | `docs/arm-pretool-check.md`, "Tripwire: if a third strict-superset gap is ever found... the decision flips to Option B" | partial |
| A prefilter before a policy owner must be a provable one-sided superset, its marker set coupled to the owner's decoders as a change rule | `docs/arm-pretool-check.md`, "the prefilter stops being a strict superset" | partial |
| Live-verified, portable-test-covered and uncovered are three statuses, never inferred across | `docs/verification/supervision.md`, "remains uncovered rather than inferred from direct wrapper invocation" | partial |
| A test that asserts a deferred surface stays unregistered so it cannot return unnoticed | `docs/verification/supervision.md`, "asserts `preCompact` stays unregistered" | partial |
| Exclusion lists whose justifications differ must not be merged even when they behave identically | `docs/subagent-guard.md`, "Folding the two lists together would be the drift risk" | thin (folded into `self-reported-gate-inputs` as one clause) |
| A denial must name a remedy that exists in this installation, degrading when the preferred path is absent | `docs/subagent-guard.md`, "rather than pointing at a script that is not there" | thin |
| A stub designed so an escaped call reproduces the bug loudly rather than passing vacuously | `docs/verification/supervision.md`, "rather than passing vacuously" | partial |
| One host loading another's config surface delivers the event twice; discriminate from the payload, not the environment | `docs/arm-pretool-check.md`, harness wiring table | partial |

## Method notes

- **The `docs/verification/` lane is a source class signal worth naming.** When
  a repository carries a directory whose documents are dated measurement records
  rather than instructions, that directory is the source and everything else is
  context. It outproduced the operating documents here by a wide margin, and it
  is cheap to spot: look for version numbers and observed output in fenced
  blocks.
- **Three of the four landings came from an enumeration that declares its own
  completeness** - "three honest resolutions", "one shape at three seams", and a
  subject whose eleven techniques all audit one artifact. The hunt keeps paying.
- **The apply step corrected a landing for the second consecutive run**, and the
  correction came from a tree that had already solved the problem better than
  the draft prescribed. Reading a project that *agrees* with a finding is not a
  wasted apply row; it is where the finding's wording gets fixed.
