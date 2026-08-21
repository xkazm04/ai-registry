---
layer: golden-path
type: golden-path
subject: crash-forensics-attribution
status: forged
use_when: [a large engine crashed and someone must decide which team owns it, building automated crash triage, deciding whether two crash reports are the same crash, turning a confirmed root cause into a change request]
techniques:
  - weighted-evidence-directory-file-symbol
  - caller-chain-decay
  - confidence-gates-report-unknown
  - crash-signature-over-id-equality
  - engine-crash-vocabulary
  - root-cause-to-fix-prompt
---

# Crash forensics and attribution

A large real-time engine died. Somewhere in the wreckage — a fatal message, a call stack of
thirty frames, a module list, a thread dump — is the answer to one question a producer has to
answer within the hour: **which subsystem owns this defect, and who should be looking at it?**
This subject is the craft of extracting that answer from the evidence, and of refusing to
extract it when the evidence does not support one.

The refusal is the point. Everything else here is scaffolding around it.

## The seductive failure

Automated crash triage fails in a specific and flattering way: it always produces an answer.
Give a scoring function a stack and it will return a ranked list, and the top of a ranked list
looks exactly like a diagnosis whether or not the numbers underneath it separated anything. A
tool that says "rendering, 71%" on a crash whose evidence was three generic container frames
is not being helpful and is not being approximately right — it is being confidently wrong, in
a format that invites action.

The cost is asymmetric and the asymmetry is the whole design constraint. **No attribution
costs one triage meeting. A wrong attribution costs a team-week.** It sends the rendering
engineers spelunking through a stack whose defect lives in the ability system, and — worse —
it *inoculates* the real owner, because the ticket already carries a subsystem and nobody
re-opens the question. Investigators anchor on the first plausible cause offered, and an
automated tool offering one is the strongest anchor available, because it looks like evidence
rather than opinion.

So the design problem is not scoring. Scoring is arithmetic. The design problem is **earning
the right to answer**: building a scorer whose numbers are meaningful enough that a gate can be
placed on them, then placing the gate and honouring it. A triage tool's quality is measured by
its unknown rate being non-zero and honest, not by its coverage.

## Evidence is what a name tells you, not that a name appeared

A call stack is a list of locations. Each location carries up to three naming fragments: the
directory it lives in, the file it lives in, and the symbol that was executing. These are not
equally informative and treating them as equal is the first place naive triage goes wrong.

A **directory** is a deliberate organisational statement — somebody decided that this code
belongs with that code — and in a mature engine it is the closest thing to a declared subsystem
boundary that exists in the source. A **filename** is weaker but still authored: it names a
concept, and concepts cluster by subsystem, but files move, split and get renamed for reasons
unrelated to ownership. A **symbol name** is the weakest, because symbols are generic and
shared: an `Update`, a `Tick`, a `Destroy` appears in every subsystem ever written, and a symbol
match is very often a coincidence of English rather than a fact about ownership.

The ordering — directory over file over symbol — is the craft. The specific weights matter less
than the ordering being strict and the gaps wide enough that a directory hit is not outvoted by
a pile of generic symbol hits. Two mechanical rules ride along, worth stating here because their
absence has misfiled real crashes: **every rule is scored against every piece of evidence and
the winner is decided by score**, never by which rule sat earliest in a list; and **matching
happens on tokenised text**, not raw substrings, so a subsystem token matches a directory rather
than the same three letters buried inside an unrelated identifier.

What the fragments are matched *against* is a per-project dictionary: a mapping from naming
fragments to subsystems, built for the specific codebase in front of you. There is no
universal one and any tool that ships one is lying about a codebase it has not read. Building
that dictionary — and keeping it honest as the code moves — is craft in its own right, and it
is the same taxonomy that a per-subsystem review doctrine uses to route code review. Share
the taxonomy; a project with two subsystem vocabularies has neither.

## The crash site is not the fault site

The frame at the top of the stack is where execution stopped, which is frequently not where
the mistake was made. A null dereference in a container utility is the *symptom* of somebody
handing that utility a stale handle four frames up. So an attributor must consider the whole
caller chain, weighted by distance.

Two designs present themselves. A **window** — top N frames, ignore the rest — is the obvious
one and is wrong, because it produces a cliff: frame N counts fully, frame N+1 counts zero, and
N is arbitrary at exactly the depth where engine crashes vary most. A **decay** — every frame
counts, at a weight falling geometrically with distance from the crash site — has no cliff,
needs no cutoff, and degrades gracefully on both shallow and pathologically deep stacks. Deep
frames still contribute; they simply have to be numerous or specific to matter.

## Two gates, and the second one is the one nobody builds

A score can be high and still mean nothing. Both of these are unattributable, for different
reasons:

- **Nothing scored.** The top candidate's total is barely above noise — a couple of generic
  symbol hits on deep frames. There is no evidence here, only arithmetic.
- **Everything scored.** The top candidate is high, and so is the second. Two subsystems both
  have a strong claim. That is a real and common situation — subsystem boundaries in a live
  engine are crossed constantly — and a high top score conceals it completely.

The first needs a **minimum-score gate**; almost every triage tool has one. The second needs a
**minimum-margin gate** between the top two candidates, and almost none has one. This is the
single most valuable thing in the subject: a confidence figure reported without the margin that
produced it is not a confidence. It carries neither its unit nor its basis, and a producer will
read 71% as a probability when it is a normalised sum of hand-set weights that happens to land
in the same range.

When either gate fails the verdict is **unknown**, and unknown is a *result*: the evidence does
not separate these candidates, here are the top two and their scores, a human must look. That
is more useful than a guess and it is the only output that stays trustworthy over a year of
use. An unattributable crash is unknown — never "probably rendering".

## Two crashes are the same crash when they have the same shape

Triage compounds only if you can recognise a crash you have already diagnosed, and the wrong
way to do that is to match on any recorded identifier — a report id, a session id, a build hash,
a crash id assigned by whatever collected it. Those are identities of the *occurrence*, and
every occurrence is unique, so identifier matching gives a hundred percent miss rate against a
corpus that already contains the answer.

The right key is a **signature**: a derived, never authored description of the crash's shape —
the fault class, the culprit symbol and its file, the subsystem it was attributed to, the
vocabulary the failure used — with everything occurrence-specific stripped out. Addresses,
offsets, thread identifiers, instance numbers appended to object names, timestamps, build
numbers, session paths.

Then do not compare signatures for equality. Compare them for **graded similarity** over
weighted components that sum to one, so the result is a real fraction of the available
evidence rather than an arbitrary point total, and place a floor beneath which there is no
match at all. Exact equality is too brittle for reports that arrive with different amounts of
detail; similarity with a floor degrades correctly, and it lets a near miss be shown as a near
miss instead of vanishing. The governing rule inside the comparison is that **missing evidence
scores zero, never agreement** — two crashes that both failed to attribute a subsystem have
not thereby agreed on one, and two crashes sharing no vocabulary have not matched on the empty
set. `crash-signature-over-id-equality` names what must be normalised away, how to weight the
components, and why an under-normalised signature fails silently — it does not error, it
simply never matches, and the corpus looks empty when it is full.

## Whoever must act on this did not write the thing that crashed

Engine crash vocabulary is a dialect. Fatal-assertion phrasing, garbage-collection terminology,
handle staleness, archive version mismatches, stack exhaustion — precise terms that mean
something exact to the few dozen people who work on the engine core and are opaque to the
designer, producer or automated agent who has to act on the report. A diagnostic tool whose
users are not the authors of the thing it diagnoses owes them a translation layer: the raw term
preserved verbatim, a plain-English gloss beside it, and — keyed on the fault class rather than
the vocabulary — a one-line "what happened / what to do" so a report can open with a legible
story before any frame is shown.

Treat this as a general obligation, not a nicety. An untranslated diagnosis gets escalated to
someone who can read it, which erases the time the tool saved.

## A diagnosis is half the value

Naming the subsystem ends the triage question and begins the repair question. The second half
is turning a confirmed root cause into an instruction specific enough that someone — or some
automated change process — can act on it without re-deriving the diagnosis.

The root causes that recur in a large engine are **classes**, not incidents: an initialisation
ordering race between two systems that both assume the other is ready; an object collected by
the garbage collector while a cached reference elsewhere still points at it; a serialised
archive written by one version and read by another; a mutually recursive dependency that
exhausts the stack. Each class has a characteristic signature shape, a characteristic
misconception behind it, and a characteristic corrective shape. Cataloguing classes is what
makes forensics compound; cataloguing incidents is not.

The corrective instruction has hard limits. It must not invent a target value nobody measured,
and it must not assert that the defect is fixed — it has not been verified, and a generator's
claim about its own output is an input to a verdict, never the verdict. A confirmed class, once
written up, belongs in the project's corpus of known engine traps so the next occurrence is
caught before it crashes rather than after; that corpus is a neighbouring concern and this is
the pipeline into it.

## Seams

A **connection failure is not a crash**, and conflating them is expensive. When a tool driving a
live application loses its channel the process may be perfectly healthy; the diagnosis is a
transport taxonomy — is the target running, is the port bound, is the handshake completing, is
the protocol version matched — and it belongs to the discipline of driving a live application
safely. Crash forensics starts only once you have a corpse. Route on the presence of a fatal
record and a stack; hand anything else to the connection doctor. That doctor shares one
discipline with this subject and no evidence: it classifies each probe outcome into a small
**closed** set of failure kinds, so its remediation layer maps a classified symptom to a
plain-language cure instead of parsing free-form error strings. Same instinct, different
corpse.

Runtime observation evidence is the discipline for what a *live* run proves; a crash is the
degenerate case where the run ended. A per-subsystem review doctrine shares this subject's
subsystem taxonomy and consumes its recurring classes as review checklist items. Ship gating
decides whether a crash rate blocks a release; this subject only says who owns it.

## Failure modes of the naive reading

- **Coverage as the metric.** Optimising for "we attributed 98% of crashes" optimises directly
  against the only property that makes the tool worth having. Report the unknown rate as a
  headline number, not a defect.
- **Treating the score as a probability.** It is a weighted sum with hand-set constants. It is
  ordinal, not calibrated. Never present it without its margin and its basis.
- **Dictionary rot.** A subsystem dictionary built once and never revisited slowly attributes
  everything to whatever directory names have not changed. Review it whenever the code moves.
- **Matching on identifiers.** Discussed above; it is the failure that makes a corpus useless
  while appearing to work.
- **Demonstration crashes counted as observed ones.** Worked examples that ship with the tool
  must stay out of the project's real crash record — a sample that can inflate the observed
  history corrupts the one statistic the apparatus exists to produce. Tag every record with its
  provenance at the point of creation.
- **A tuned-to-the-corpus scorer.** Weights fitted until every historical crash lands
  correctly are fitted to the answers, not to the evidence. Keep the weights explainable in a
  sentence each; if a weight cannot be justified from what the fragment *is*, it is overfit.
