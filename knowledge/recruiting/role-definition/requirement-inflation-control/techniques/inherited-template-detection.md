---
layer: technique
type: technique
subject: requirement-inflation-control
technique: inherited-template-detection
status: forged
laws: [every-decision-names-its-actor, absence-of-evidence-is-not-evidence]
shared_with: []
use_when: [a requisition arrives as an edited copy of an old description, a requirement nobody can explain appears on the list, the role is a backfill for a specific departed person]
---

# Inherited-template detection

Most inflated requirements were never authored. They arrived — copied from the
last description for a similar title, from a peer company's posting, from the
departing person's own history, or from a corporate template written for a
different function. Sediment behaves differently from a real requirement in
one crucial way: **it has no author**, so it has no defender, and it can be
removed at almost no social cost — but only if it is identified *before*
someone adopts it. Once a requestor has read a line twice, they own it, and
removing it becomes an argument.

Detection is therefore a fast pass run early, ideally before the requestor has
walked the list.

## The fingerprints

Sediment is recognisable. Any two of these together make it near-certain.

- **No explanation on first ask.** "Where did this one come from?" answered
  with "it's standard", "that's what the band requires", "everyone asks for
  it", or a pause. A real requirement produces a scene; sediment produces a
  category.
- **No ninety-day outcome claims it.** The de-specification filter finds this
  as a matter of course, which is why the two techniques are usually run in
  the same pass.
- **Verbatim appearance in unrelated roles.** The same clause, word for word,
  in the postings for three different functions is a property of the template,
  not of any of the three jobs.
- **Wrong altitude for the role.** A generic competency list ("excellent
  communication skills; works well in a fast-paced environment") sitting above
  a highly specific role, or a highly specific tool clause on a role otherwise
  described in outcomes.
- **Register mismatch.** The requestor speaks in one vocabulary and one clause
  is in another — legal-department phrasing in an engineering brief, a
  marketing cadence in an operations list. Copied text keeps its origin's
  voice.
- **Anachronism.** A requirement referring to a system, a standard, a process
  or a team structure that no longer exists. This is the cleanest tell there
  is, and it is worth explicitly scanning for.
- **The portrait.** For a backfill, requirements that reconstruct the departed
  person rather than the work: their degree, their previous employer, their
  particular seniority path. A specification derived from a person imports
  that person's incidental characteristics — including protected ones —
  alongside the relevant ones.

## The procedure

1. **Diff before you discuss.** Where the requisition is visibly an edit of a
   prior document, compare them. What the requestor *changed* is what they
   actually thought about; what they left untouched is inherited until proven
   otherwise. This one move separates the two populations in about a minute
   and is the highest-yield step in the technique.
2. **Ask for provenance, once, per suspect line.** "Where did this one come
   from?" — asked neutrally, as a question about the document, not about them.
   The framing matters: a requestor who feels audited starts authoring
   justifications, and a justified line is no longer removable.
3. **Record the answer as the requirement's origin.** Requestor-stated,
   inherited-from-prior-description, template, unattributed. This is
   [every-decision-names-its-actor](../../../_laws.md#every-decision-names-its-actor)
   applied at the level of a single line: a requirement that will later filter
   people must be able to say who asserted it, and *nobody* is a valid answer
   that must be visible rather than absent.
4. **Offer removal, do not perform it.** "This one looks like it came across
   from the old description — nobody here has claimed it. Drop it, or is it
   real?" The offer costs a sentence and converts most sediment immediately.
   What survives has just acquired an author, which is a genuine improvement
   even when the line stays.
5. **For a backfill, re-anchor from the work.** Ask which specific things the
   departed person *did* mattered, and specify those. Never let the answer be
   the person.

## Decision rules

- **Unattributed is a state, not an empty field.** A requirement whose origin
  was never asked must render as *origin not recorded*, never as
  requestor-stated by default. Defaulting an unknown origin to the strongest
  attribution is the exact failure
  [absence-of-evidence-is-not-evidence](../../../_laws.md#absence-of-evidence-is-not-evidence)
  describes: it flatters the record, and the flattered version is the one that
  gets defended in a debrief three months later.
- **Detect early or not at all.** Run the pass before the requestor has
  reviewed the list line by line. After adoption the technique still works but
  the cost per line rises by an order of magnitude and the yield falls.
- **Sediment is not always wrong.** An inherited line can name a real
  requirement; the objection is to its *unexamined* authority, not to its
  content. Route it through the outcome filter like anything else. A control
  that treats inheritance as disqualifying will be right most of the time and
  will lose the argument the one time it matters.
- **A prior description is an input, never a starting point.** Editing last
  year's document is specification by inheritance with extra steps. Build the
  list from outcomes and use the old document as a checklist afterwards —
  "here are four things the old version had that we haven't mentioned; any of
  them real?" That ordering catches genuine omissions without importing the
  sediment.
- **Template requirements that survive are re-authored, not blessed.** When a
  requestor keeps an inherited line, restate it in their words and record it
  as theirs. A line that reads as boilerplate will be treated as boilerplate
  by every later reader, including the screener who is supposed to enforce it.

## When not to use it

- **On a genuinely standard organizational clause** — work authorization,
  location and travel expectations, mandated compliance training. These are
  supposed to be identical across roles; their uniformity is a feature, and
  interrogating them wastes the requestor's patience on lines that filter for
  legitimate stated reasons.
- **On a first-of-its-kind role**, where there is no prior document and
  nothing to inherit. The inflation there is aspirational, and the cap and the
  outcome filter are the right instruments.
- **As an accusation.** "This looks copied" invites a defence of the
  requestor's diligence. The question is always about the document's history,
  never about their care.
- **Retroactively, on a published requisition.** Once candidates have applied
  against a stated list, the fix is to correct it for the next round and judge
  the current pool on what they read. A candidate's process does not absorb
  the cost of the organization's cleanup.
