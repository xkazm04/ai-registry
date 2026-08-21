---
layer: technique
type: technique
subject: pipeline-stage-modelling
technique: stage-role-vocabulary-not-stage-names
status: forged
laws: [meaning-does-not-live-in-a-label, absence-of-evidence-is-not-evidence]
shared_with: []
use_when: [writing any rule that depends on where a candidate is, making a board's columns team-editable, auditing existing code for stage string matches]
---

# Stage role vocabulary, not stage names

Every stage carries a **role** drawn from a closed vocabulary the product
defines, alongside the free-text **label** the team owns. Product logic
resolves through the role. Human display uses the label. The two never swap
jobs.

The rule is absolute because the failure is silent. A rule that matches a
display string does not break when the string changes — it keeps running and
starts answering a different question, and it does so at exactly the moment a
team is most confident in their board, having just tidied it
([meaning does not live in a label](../../_laws.md#meaning-does-not-live-in-a-label)).

## The vocabulary

Six values, and the count matters more than the exact names:

- **entry** — the arrival point.
- **screening** — first-pass judgment on submitted evidence.
- **scoring** — a produced assessment awaiting ratification.
- **interview** — human evaluation in progress.
- **offer** — terms under decision.
- **terminal** — the process is over; absorbing.
- **custom** — a real step the vocabulary does not model, which participates
  in ordering and in nothing else.

The vocabulary is *closed*: a value not in it is not a smaller role, it is an
unresolvable one. Closure is what lets a consumer write an exhaustive branch
and be told at authoring time when a new role appears. An open vocabulary —
free-text "type" fields, or "any string a workspace supplies" — reintroduces
the exact problem the role was invented to solve, one layer down.

## Choosing the roles: three tests for whether a step deserves one

When a team argues that their step is special, apply the tests that
distinguish a role from a label:

1. **Does the product do distinct work here?** If generating, transcribing,
   fetching or computing happens at this step, it is a candidate for a role.
2. **Does a human ratify something distinct here?** A step where a person
   approves an artifact rather than a person is a different decision with a
   different actor.
3. **Does a candidate genuinely wait here?** If someone can sit in this step
   for three days and be forgotten, it has dwell, it can stall, and it needs
   to be visible as its own queue.

A step passing all three is a role. A step passing none is a label — give the
team the label and map it to the nearest role, or to custom. This is the
reasoning that makes an assessment-production step its own role rather than a
flag on an interview: work, ratification and a real wait, all three.

## Applying it: resolve, never match

The mechanical rule for every consumer:

- **Legal moves** are computed from roles and ordering. "Not backwards past a
  gate", "never out of a terminal", "offer approval extends rather than
  concludes" are role statements.
- **Automated actions** are permitted per role, not per stage. What an
  automated screen may do at an entry-role stage differs from what it may do
  at a screening-role stage, and the permission table is indexed by role so a
  new stage inherits a defined answer rather than an accident.
- **Notifications and candidate-facing copy** select on role. Telling
  someone at the offer stage that their application has been received is the
  canonical label bug, and it is prevented by never letting copy see a name.
- **Filters, saved views and deep links** persist role plus stage identity,
  never the label. A label persisted into a saved filter is a stale copy of
  a mutable string.
- **Metrics** resolve through role and position, and say which roles they
  folded.

## The audit procedure for an existing system

Making columns editable in a system that already string-matches is where this
technique earns its keep, and the audit is mechanical:

1. Grep for every literal stage name in the codebase — including in copy,
   templates, saved queries, test fixtures and analytics definitions. Expect
   more hits than anyone predicts; the honest starting assumption is that
   *almost everything* derives meaning from the name, because that was free
   when there was one board.
2. For each hit, classify: display (fine, leave it), or logic (must be
   rewritten to a role). A comparison, a filter, an index lookup, an
   exclusion from a menu and a template condition are all logic.
3. Rewrite each logic hit as a role predicate, and check the *shape* changed
   too — an index comparison against a named stage becomes a comparison
   against a role-derived boundary, not a comparison against the index of a
   role-matched stage, because a board can have several stages of one role.
4. Only then unlock the rename.

Doing step 4 first is the incident. The rename ships, nothing errors, and the
fairness dashboard quietly measures something else for a quarter.

**Triage the rewrites by how they fail, not by how many there are.** A
name-coupled site degrades in one of two ways, and the difference is an order
of magnitude:

- *Degrades to a wrong number.* A metric, a gate, a benchmark, a permission
  check. It keeps producing an answer, the answer is wrong, and nobody can
  tell. These are rewritten before the rename ships, without exception.
- *Degrades to a wrong placement.* A creation default that files a candidate
  into whichever column it was told about, a cohort filter that selects the
  wrong set for a batch. A human sees it, on the board, in ordinary work, and
  fixes it. These can be sequenced later, deliberately and in writing.

Recording that triage is what makes a partial migration honest rather than
half-finished. Every remaining literal should be a named, justified entry —
"correct on the shipped axis, degrades to placement, needs its own plumbing"
— not an unswept remainder. A list of known couplings is a plan; an unwritten
one is a set of ambushes.

## Decision rules

- When a rule needs to know *where* a candidate is, it asks for the role;
  when it needs to *show* where they are, it asks for the label. If a call
  site wants both for one purpose, one of the two is wrong.
- When a board has several stages of the same role, rules act on the role and
  ordering decides among them. Never assume role-to-stage is one-to-one.
- When a stage arrives with no role, refuse the write. Do not default it: a
  guessed role is invisible and is wrong precisely on unusual processes
  ([absence of evidence is not evidence](../../_laws.md#absence-of-evidence-is-not-evidence)).
- When a team asks for a role that does not exist, give them custom and log
  the request. Three teams asking for the same custom step is the evidence
  that justifies opening the vocabulary; one team's preference is not.
- When a custom stage is proposed as a gate, a terminal or an automation
  trigger, refuse. The escape hatch is inert by design; powers granted to it
  are powers granted to arbitrary user input.

## When not to use this

Do not introduce a role vocabulary for a taxonomy nothing branches on. If a
field is genuinely display-only — a colour, an icon, a card accent — a stable
identifier is overhead with no payoff, and inventing one invites someone to
start branching on it later.

Do not use roles to *restrict* what a team may express. The vocabulary
exists to make arbitrary boards safe, not to force every team onto a
canonical funnel. A model that refuses a team's genuine seventh column
because no role fits has failed at its actual job; that is what custom is
for.
