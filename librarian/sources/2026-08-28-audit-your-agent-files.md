---
source: web
url: https://addyo.substack.com/p/audit-your-agent-files
title: "Audit your Agent files"
author: Addy Osmani
kind: second-hand practitioner listicle + first-party audit half (hybrid)
mined_on: 2026-08-28
words: 3046
skill_version: 0.14.0
extracted: 13
picked: 3
accepted: 2
currency: 0
leads: 2
already_covered: 4
declined: 0
untriaged: 3
dispatched: 0
fetches: 2 of 3
---

# Audit your Agent files, 2026-08-28 - the corpus had the admission test and not the expiry date

A newsletter essay on agent-configuration hygiene: instruction files bloat,
installed skills accrete, and both need periodic re-earning. Three empirical
papers relayed second-hand, one first-party account of the author's own audit,
and a comment thread that produced one of the two leads.

The class is a **hybrid the routing table already predicts**: the research half
is a listicle (lossy pointers to primaries that state the constraints it omits)
and the "What I found when I audited my own setup" half is a genuine
first-party account. The listicle row's tiebreaker decided the run - *items
that touch this registry's own machinery outrank items about bundle content* -
and every picked row was machinery.

## Expected yield, and what happened

Called low-to-moderate at triage, because `agent-instruction-files` was forged
2026-08-24 and covers this source's territory with six techniques. That was
right about the ceiling and wrong about where it sat: nine of thirteen
candidates were catches or unpicked, and the two that landed came from the one
question the subject had never asked.

## The finding: the subject audits the file against the repo, never against the model

`instruction-freshness` ends with "couple the file to change, not to
calendars," and its change list is *a stack major bump, a command rename, a
directory restructure, the deletion of anything the file names* - every trigger
an event in the artifact the file describes. Its audit's fourth check asks
whether a rule's failure mode still exists **in the repo**. Nothing asks
whether the **agent** still has that failure.

That is the missing stage, and the subject's own denial is what hid it: by
rejecting calendar cadence in favour of change-coupling, it ruled out the only
schedule that could catch substrate drift - because a model upgrade produces no
diff to couple to. The corrective is not "audit on a cadence" (the source's
version, and weaker) but **a second change list**: a model generation lands, a
harness ships natively what the file instructed around. Those are datable
triggers too.

`line-earning`'s second half is the same seam from the other side. It asks
whether removing a line would change behaviour and then concedes the
measurement - *"the honest way to know is the line's origin story."* An origin
story is evidence about the model that failed, and it is a proxy that diverges
exactly when the substrate has moved.

**The instrument was already in the subject, at the wrong polarity.**
`capability-before-steering` (landed by a parallel session mid-run) isolates a
capability gap by checking whether a failure "persists at the top of a fresh,
minimal file." Run the same rig with the rule *absent* and it measures
`line-earning`'s second half directly. The subject built one door of a
two-door apparatus and never noticed the other side.

## The fetch that beat the source

Osmani's framing: "instruction value can expire, so archive first." The primary
he was relaying carried a mechanism he had flattened out, and it changed the
technique twice over:

- The expired line is **disproportionately the restraint**. The vendor's own
  example was a guardrail ("default to writing no comments. Never write
  multi-paragraph docstrings") that was *correct* for older models and removed
  because newer ones "have better judgement and can handle these decisions well
  without explicit rules." So an expired restraint does not merely idle - it
  suppresses behaviour the current model would have got right, which is
  `restraint-amplifier-balance`'s loss arriving by a route that subject did not
  model: a file that *became* all-cage rather than one authored that way.
- Expired lines **contradict**. Reading its own transcripts the vendor found
  "several conflicting messages in a single request" - "leave documentation as
  appropriate" against "DO NOT add comments" - spanning system prompt,
  installed capabilities and user request. Two lines can each pass
  `line-earning` and be a defect as a pair, which no per-line audit can see.

Also worth recording for the class: **the primary states no removal
procedure.** It reports the 80% result and offers a tool; it does not say how
to decide what goes. The relay's protocol ("instruct the agent to use no local
skills, complete the task on raw model and harness") is the only candidate
procedure either source carries, and it is why the finding is written from the
corpus's own apparatus rather than from either one.

## Accepted (2)

**`substrate-coupled-expiry`** - `se/llm-agent/prompt-and-context/agent-instruction-files`
The second rot axis. Which lines expire (judgment-shaped ones; unreachability
never does, because the information was never in the tree), why restraints go
first, why expired lines contradict rather than idle, the held-out trial as the
direct measurement, archive-then-delete as the countermeasure to the real
blocker (irreversibility, not doubt), and stamping a rule with the substrate it
was minted against so the next upgrade sorts the file mechanically.
Absorbs picked rows 1 and 2 - row 2 (the removal experiment) is this
technique's instrument, not a separate claim.
Laws: `gate-sees-target`, `unknown-is-not-a-value`.

**`sibling-floor-ownership`** - same subject
The installed half of the always-loaded floor. The subject's opening names the
siblings and declines to govern them; the position it states ("paid, advisory,
always-loaded") holds for them word for word, and they are usually the larger
half. Covers the discovery budget nobody authored, install-versus-retain as two
decisions of which only one is ever made, the three aggregate failure modes no
per-entry review can detect (collision, contradiction with the file, provenance
drift), the four-move audit, and the governance boundary - the repo file has a
diff and a reviewer, the sibling floor has neither.
Laws: `creation-names-reaper`, `count-carries-predicate`.

Golden path took two new sections, two failure-mode bullets ("the cage without
its animal", "the unauthored floor") and the two technique entries.

## Already covered (4)

- **Context files change process, not correctness (288 runs / 17 tasks).**
  Verified catch - the golden path already cites this measurement and its twin
  ("the field measured this in 2026, twice"), and reads them more carefully
  than the source does.
- **Always-true rules belong in a test, hook or permission.** `enforcement-demotion`
  is the whole technique; the golden path states the rule verbatim.
- **Files grow past 200 lines by add-a-rule-per-error.** `line-earning` owns
  the dilution tax and the accretion mechanism; `restraint-amplifier-balance`
  owns what the accretion is made of.
- **Prose summaries answered 4 of 45 behavioural questions where source
  answered 27 of 45.** Principle covered by `line-earning`'s unreachability
  test and the golden path's "generated overview" failure mode. The *number* is
  unbanked - it is the sharpest quantification of that rule seen so far, and a
  later run that opens the primary should cite it into `line-earning`.

## Leads (2)

**Shared instruction corpora compound with consumers; individual ones do not.**
Source: enterprises report org-level skill sets capturing culture, compliance
and tooling quirks as compounding value, where individual skills are merely
useful. This is the discriminator drawn from the opposite side of this
registry's own single-owner doctrine, and it is currently one anecdote about
unnamed companies.
*Return when:* a second independent source measures or describes team-scale
instruction reuse, or a connected project acquires a second regular consumer.

**A self-writing memory with no eviction converges to contradiction.**
Source: a comment on the post - auto-memory turned off entirely, results
improved, because it had accumulated one-off corrections as durable
preferences and agents had written contradictory instructions for themselves.
n=1, anonymous, unmeasured. But it is the same shape as the vendor's
cross-layer clash finding and as the personalization result below, and
`agent-memory` has `decay-and-forgetting` and `consolidation` that would each
want it.
*Return when:* a second source reports removal-improves-results for a
self-written memory store, or a connected project's memory lane shows it.

## Untriaged (3)

Extracted, tabled, never picked. Nobody verified these; they carry no judgment.
Recorded with anchors so a later run does not re-derive them.

| Candidate | Anchor | Why it may matter later |
| --- | --- | --- |
| A personal skill performed about as well as one borrowed from a stranger; a generic skill built from many developers beat both. Personalization looked promising only when a preference recurred across similar tasks (LLM-simulated developer, so provisional). | "performed about as well as a skill borrowed from somebody else" | **Cross-run convergence candidate.** Shares a root with the 2026-08-22 pair ("observed repetition becomes a named skill") that `agent-memory/procedure-promotion` rests on. This is the *negative* result that pair never had: promotion should key on recurrence, and a one-off preference should not be promoted at all. A third sighting makes this a golden-path correction rather than a technique. |
| Harness facts: the configuration audit lives at an in-session command while the same word in a shell prints only installation diagnostics; installed-capability descriptions load within a listing budget defaulting to 1% of the context window. | "a listing budget defaulting to 1%" | Currency for the `claude-code-skill-resolution` memory, which records a 1536 cap. The two may be different measures of the same floor, or the harness may have changed. Cheap to check next time the harness is in front of us. |
| Configuration-smell prevalence across 100 popular repositories: lint leakage 62%, context bloat 42%, skill leakage 35%; most files carried at least one. | "a June study of 100 popular repositories" | The golden path's failure-mode list is entirely qualitative. These would date it - but they are second-hand here and the primary was not opened. Costs one fetch whenever a run has budget spare. |

## Run notes

- **Fetches: 2 of 3.** One wasted guessing a vendor URL (404); the search that
  corrected it was free. The successful one paid for itself twice over - see
  above. For this class the fetch *is* the extraction, exactly as the routing
  table says, and it should have been budgeted at triage rather than after.
- **Phase 4's "one moment" warning fired for real.** A parallel session landed
  `capability-before-steering` and `workspace-ancestry-isolation` into this
  exact subject between the map and the write. Re-reading was not bookkeeping:
  `capability-before-steering` supplied the instrument the accepted technique is
  built on, and had the run written against the pre-read state it would have
  minted a competing apparatus beside it.
- The checkout stayed shared throughout - `eval-harness` was also live in
  another session. Commit took a pathspec.
- Length is again not yield: 3,046 words, two landings, and the corpus's own
  files did more work than the source did.
