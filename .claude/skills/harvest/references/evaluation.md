# The A/B impact evaluation

The protocol behind `/harvest` Phase 5. One evaluation answers one question about one
content landing: **did a real project's agent do measurably better with this
knowledge than without it, on a task the knowledge itself claims to govern?**

It is deliberately narrow. It does not grade the technique's truth (corroboration
already did), its prose, or its transplantability. It grades *impact where we live* -
the thing intake cannot see because it ends at the merge.

## Routing

1. Read `.projects.local.json`. Candidate projects are those whose `domains` include
   the landing's bundle. Prefer, in order: a project whose `signals/` contributor file
   shows recent consults for the bundle (the knowledge is demonstrably in its loop);
   then the project with the most recent activity; then the repo overlay's pin
   (`.claude/harvest.local.md`), which overrides both when present.
2. No candidate project at all -> the verdict is **`unroutable`**, recorded, and the
   subject note says so. Unroutable is a demand signal (a bundle nobody consumes
   cannot be impact-tested), never a pass.
3. Never evaluate against the registry itself; the registry consuming its own
   knowledge proves recall, not impact.

## Building the probe

The probe task comes from the technique's own `use_when` lines - they are the
technique's claim about when it matters, so they are the fairest possible ground.

1. Take the landed technique's `use_when` triggers. Find, in the routed project, a
   real site where one applies: a file, a decision, a bug class, a review target.
   Real means the site exists in the checkout today - never a synthetic toy repo.
2. Write the probe as a task brief a session agent could receive cold: the site, the
   ask, and the deliverable (a fix, a review, a design call, a test). The brief must
   NOT quote or paraphrase the technique - a probe that smuggles the answer in
   measures reading comprehension.
3. One landing, one probe, unless the landing amended 3+ techniques in one subject -
   then one probe per distinct `use_when` cluster, cap 3.

## Running the arms

| | arm A | arm B |
| --- | --- | --- |
| registry state | HEAD (landing included) | the pre-landing commit (`git worktree` at the merge's parent) |
| everything else | identical | identical |

- Each arm is a fresh subagent session in the routed project's checkout, same model,
  same brief, instructed to run `/consult` for its declared bundles as the project's
  agent guide already says. Arm B's consult resolves to the pre-landing worktree.
- Run the arms concurrently; neither sees the other. The orchestrator never hints
  which arm is which, and neither arm is told an evaluation is happening.
- Arms propose; they do not commit. Capture each arm's full output as the artifact.

## Judging

- The judge is a third subagent that sees both outputs **blind** (A/B order
  shuffled, labels stripped) plus the probe brief - not the technique, and not which
  registry state produced which output. It scores each output against a rubric
  written *before* the arms ran: 3-5 checks derived from the probe's deliverable
  (correctness of the call, the failure mode addressed or missed, evidence cited,
  scope discipline). Never a single holistic number - a rubric the judge fills is
  auditable; vibes are not.
- The orchestrator then unblinds and writes the verdict:

| verdict | meaning | consequence |
| --- | --- | --- |
| `impact-positive` | A beat B on the checks the technique governs | note on the subject; the landing has its receipt |
| `impact-null` | no meaningful difference | count it; 2 nulls on the same landing -> mark the technique `unproven-in-project` in its vault note and stop evaluating it |
| `impact-negative` | B beat A, or A misapplied the technique | open a review: the landing may be wrong, mis-scoped, or badly worded; this is intake-decline-class evidence and goes to the operator, never auto-reverted |
| `unroutable` | no consuming project | demand signal; re-route when a project adopts the bundle |

## The ledger

`librarian/harvest/evaluations.md`, one row per evaluation, append-only:

```
| date | landing (subject/technique) | source (ledger link) | project (slug only) | probe (one clause) | verdict | note |
```

Slugs only for projects - the same privacy rule as `usage/` and `signals/`: this
lane is public, a consumer's paths and internals are not. The probe artifacts (arm
outputs, rubric, judge sheet) stay in the routed project's gitignored `.ai/` scratch,
referenced by date, never copied into the registry.

## Costs and honesty

- An evaluation is ~3 subagent sessions. That is the price of the word "boosting"
  meaning something; pay it for content, skip it for currency and leads.
- Never reuse a probe across landings (the second use is contaminated by the first
  evaluation's artifacts in your own context; a probe is one-shot).
- A verdict is a record of one probe in one project on one day. Two positives do not
  make a law; one negative does not make a revert. The ledger accumulates; the
  operator rules.
