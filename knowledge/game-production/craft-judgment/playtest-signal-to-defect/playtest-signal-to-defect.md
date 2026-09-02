---
layer: golden-path
type: golden-path
subject: playtest-signal-to-defect
status: forged
use_when: [turning a play session into defects somebody owns, designing a session or bug-report schema, an automated agent that plays the build is filing findings, a complaint queue has become entirely balance tickets]
techniques:
  - observation-before-interpretation
  - session-instrumentation-contract
  - repro-minimization-protocol
  - frequency-and-severity-as-separate-axes
  - complaint-to-owning-subject-routing
  - unreproducible-is-a-state-not-a-dismissal
---

# Playtest signal to defect

Somebody played the build for ten minutes. Nothing crashed, no assertion fired, every gate in
the pipeline is green, and the session was bad: they spent four minutes looking for the exit,
never once used the ability the whole encounter was built around, killed the boss by standing
in a corner where it could not path to them, and said afterwards that the game felt slow. None
of that is in any log. The entire evidence for it is a person's memory — or a machine's
narration of its own play — and by tomorrow morning most of it will be gone.

This subject is the craft of getting what happened to a player into a defect somebody owns,
**without losing the signal on the way and without inventing one that was not there**. Those
two failures pull in opposite directions, which is why no single rule prevents both. Discipline
aimed only at loss produces a queue full of confident fabrications; discipline aimed only at
invention produces a queue that is empty because everything ambiguous was thrown away.

## The material is the class where nothing failed

The industry is well equipped for failures that announce themselves. A process that dies leaves
a corpse: a fatal record, a stack, a module list, machine evidence that exists whether or not
anyone was watching. Everything downstream of that — deduplication, attribution, ownership — is
hard, but it is hard in the way arithmetic is hard, and it is somebody else's subject.

Here there is no corpse. The build ran correctly by every definition it holds of itself. The
only instrument that registered anything was a person, or an agent standing in for one, and the
reading that instrument produced is a sentence in a natural language. That is the material, and
its properties are unlike log evidence in three ways worth stating plainly. It is **perishable**
— an unrecorded observation has a half-life measured in minutes, and the specifics go first
while the summary survives. It is **compressed at the source** — the instrument reports a
conclusion, not a trace. And it is **unfalsifiable by inspection** — nothing in the report can
be checked against the build, because the build's own view is that everything is fine.

A production line that generates content faster than anyone can play it will nonetheless be
judged on this class, because this is the class players actually experience. Structural gates
catch what stops the program. Nothing except a session catches a game that runs perfectly and
is not worth playing.

## Two compressions, and the second one is irreversible

The oldest rule in playtesting practice is that you watch what they do rather than asking them
what to change, and the modern phrasing of it is sharper: **a tester is a reliable instrument
for where the problem is and an unreliable one for what the fix is.** If they say something is
wrong they are usually right; if they say what to change they are usually wrong.

The reason is mechanical, and it is not a comment on testers. A person narrating an experience
compresses it to the most available cause, and the compression happens *before* the report
exists. Once "the boss is too hard" is written down, the observation underneath it — that they
never picked up the second weapon at minute four, and therefore fought the boss with a third of
the intended output — is gone, and nobody can decompress it back out. The first compression,
from experience to observation, is unavoidable and lossy. The second, from observation to
proposed cause, is avoidable and *irreversible*, and it is the one that costs.

So an observation and an interpretation are two different fields in the record, filled by two
different acts, and the router that decides who owns the finding reads the observation. A
proposed fix is not worthless — a room where every tester reaches for the same fix is real
evidence about what the game *appears* to afford — but it is evidence about a different subject
and it belongs where it can be read on purpose rather than absorbed by accident. Keeping the
fields apart is `observation-before-interpretation`, and it is the load-bearing rule of the
whole subject: everything else here is a way of protecting an observation long enough for
somebody to act on it.

## An agent playing a build is a playtester whose report is machine-generated

Once a machine can play the build, most sessions will be machine sessions, and it is tempting
to treat those reports as a higher grade of evidence because they came from a program. They are
not. They are testimony with different biases, and knowing which way each one leans is the
whole of the craft here.

An automated observer is better than a person in ways that matter: it does not get bored, it
does not tire on the fortieth repetition, it reports without embarrassment — it will state that
it could not find the exit for four minutes, which a human quietly omits out of pride — and it
plays the same route in the same order until somebody changes the route. It is worse than a
person in exactly one way, and the one way is fatal to this subject: **it hallucinates causes
with perfect confidence.** Ask a language model what happened and it answers with why. Causal
prose is its default output shape, not a decision it makes, so every rule written above about a
tester's theory being data about the tester applies to it more sharply rather than less. A
human tester at least knows they are guessing.

The consequence is that a discipline a person can hold as a habit must be imposed on a machine
as a **schema constraint**: separate fields, filled by separate requests, an observation field
that is rejected when it contains a causal connective, and no path by which the interpretation
field reaches the router. And a machine's observation is worth exactly the rung it was observed
at — an agent reporting "the enemy never attacked" from reading its own narration has produced
a theory about a run, not an observation of one. What an automated observer is entitled to
conclude, and from which kind of reading, is settled next door by the runtime-evidence
discipline; this subject inherits that ladder and does not restate it.

## A finding without a repro is a rumour

A report that cannot be re-experienced on demand cannot be fixed on purpose, and cannot be
proven fixed afterwards. Turning a session into a defect therefore means turning it into the
smallest reliable trigger somebody else can pull: `repro-minimization-protocol`.

Minimization is systematic and old, and its cost is entirely the number of re-runs — which is
precisely why an automated observer that can replay a session deterministically is worth more to
this technique than to anything else in the subject. The half practitioners underrate is that **the minimization is itself evidence**.
Everything you removed while the failure survived is a statement about the fault's scope: "it
happens with no second character present, without the buff, on a fresh profile, and on the
lowest difficulty" narrows ownership further than any theory anybody could have written. A
minimized repro that eliminated the entire progression layer has told the progression team they
are not involved, and told it in a form they can check.

The rule that keeps it honest is that a repro reports its **attempt count** with every claim.
"Reproduces three times in five" and "reproduces once in twenty" are different defects wearing
the same steps, they get different responses, and a repro stated without its denominator has
stated nothing about reliability at all.

## Frequency and severity are two axes and never one number

How often it happens and how bad it is when it happens are independent properties, and the
enduring temptation is to multiply them into one priority so a queue can be sorted. Resist it,
for three separate reasons.

Severity levels and frequency bands are **ordinal labels**, and a product of two ordinal
categories is not a quantity. A composite **cannot be inverted**: one number cannot distinguish
"rare and catastrophic" from "constant and mild", and those get opposite treatment. And a
composite **conceals an unmeasured term** — a frequency nobody measured, folded into a product,
arrives at the reader as a number rather than as the absence of one, which is the most common way
a triage board comes to believe it knows something it does not.

Each axis has its own honesty requirement. **Frequency needs a denominator and the basis of
that denominator** — "three of five sessions on this build, all on a gamepad, all by players
who had not played before" is a frequency; "often" is a mood. **Severity is a claim about
consequence**, and this subject does not own the ladder that grades it: severity comes from the
review doctrine that already defines it by what happens if the finding is never fixed, and a
playtest finding is graded on that same ladder rather than on a parallel one invented for
player reports. Two severity vocabularies in one project mean the project has none.
`frequency-and-severity-as-separate-axes` carries both requirements and the roll-up rules that
survive them.

## Routing is the move that makes this subject pay

Here is the finding as it arrives: *"the second fight dragged and I got lost afterwards and I
never used the shield."* Here is what a triage queue usually does with it: files it as balance,
because balance is where complaints about difficulty go, and difficulty is what the sentence
sounds like.

That is one finding routed as one defect when it is three, and every one of the three belongs to
a different owner. **"I got lost"** is a legibility finding before it is a level-layout finding
— the space may be laid out correctly and read wrongly. **"I never used the shield"** is a
teaching finding before it is a balance finding — an ability nobody was taught to use is not
weak, it is absent, and buffing it changes nothing for the player who never pressed the button.
**"The fight dragged"** is a pacing finding before it is a numbers finding — an encounter with
correct totals and a flat middle is a structure problem, and lowering health only shortens the
flat part.

The routing question is not "what is the player complaining about" but **"what would have to
change for this not to happen"**, and it is answered from the observation, never from the
interpretation. Route to the subject that owns the defect *class*, which is what makes the
finding land in front of somebody who has a method for it.

The failure mode has a name and it is universal: **a router with a default bucket sends
everything to the default.** Balance is the usual default because it accepts anything phrased as
a number, and a project whose complaint queue is ninety percent balance tickets has not
discovered that its balance is uniquely bad — it has discovered its router. The fix is to have
no default: an unroutable complaint is a named state, it goes into a queue that gets reviewed as
a queue, and the size of that queue is a measurement of the routing table rather than an
embarrassment to be hidden. And because a route is a claim, a *wrong* route is worse than no
route: a finding that arrives with an owner stops being re-opened, and it inoculates the real
owner exactly the way a wrong crash attribution does.

## Everything above degrades to a rumour without the session contract

Every technique in this subject assumes facts about the session that only exist if somebody
recorded them at the time, and this is the one part of the subject that cannot
be retrofitted. A session that has already happened cannot be instrumented afterwards. The
contract in `session-instrumentation-contract` states the minimum: **what was played** (a build identity precise enough that two
people cannot disagree about it), **what world it was played in** (the scenario, the seed, the
starting state, the difficulty and options in force), **what the state was at the moment**
(measured values, not remembered ones), and **the input timeline** against a clock shared with
everything else recorded.

A fifth record earns its place the first time somebody asks whether a finding is gone: **what the
session set out to cover**, declared before it ran and in the same vocabulary the findings are
classified in. Absence of a finding is evidence of a fix only inside the ground a session actually
covered; outside it, absence is nothing at all, and a queue that does not know the difference
manufactures fixes and then reports regressions against them.

Without build identity a finding cannot be aged and cannot be closed, because nobody can say
whether the thing that changed was the game or the tester. Without world identity it cannot be
minimized, because there is nothing to hold fixed. Without state at the moment every number in
the report is a recollection. Without the input timeline nobody can tell an input the player
made from one they meant to make. A report missing all four is not a weak report; it is a
rumour, and no amount of downstream triage recovers what was not recorded.

## Not reproducing is a finding, not the end of one

The last state in the pipeline is the one most systems do not have. A finding that has been
attempted and did not reproduce is **unreproducible**, and unreproducible is a durable state
carrying its attempt count and the conditions that were tried — not a silent close, and never a
conversion to "works as intended".

The asymmetry is the point and it runs one way only: failing to reproduce is weak evidence
against a defect, while reproducing is strong evidence for one. Ten failed attempts do not
disprove a report; they bound its frequency and say something about the conditions nobody has
found yet. So the state persists, it is searchable, a later report matching it strengthens it
rather than opening a second rumour, and a new build makes it a fresh question rather than a
settled one. `unreproducible-is-a-state-not-a-dismissal` gives the vocabulary and the rule for
when a finding may finally be retired, which is on a stated policy and never on fatigue.

## Boundaries

**Against crash forensics.** That subject owns the corpse: whether two crash reports are the
same crash, which subsystem a stack implicates, and how a confirmed root cause becomes a change
request. The picking rule is one sentence: **when the build produced machine evidence of its own
failure, it is crash forensics; when the build kept running and a person or an agent is the only
instrument that noticed anything, it is this subject.** The two meet in exactly one place — a
player whose session ended in a crash produces both a crash record, which routes to forensics,
and a session context that routes here as frequency evidence and as the story of what they were
doing. They meet at the report and they do not merge into one pipeline, because the evidence
underneath them has nothing in common: one is a machine artifact that exists whether or not
anyone was watching, the other exists only because somebody was.

**Against subsystem review doctrine.** That subject owns the review of an implementation and the
grading of a finding's severity by consequence. This one feeds it. A playtest finding routed to
a subsystem becomes an input to that subsystem's review and, when it recurs, an entry in that
subsystem's check set — a session is one of the few sources of check-set entries that did not
come from a previous defect. The severity ladder is borrowed wholesale and never re-derived
here; where this subject adds anything to severity it is the *frequency* axis beside it, which
review does not need because a review finding is a property of the code rather than an event
with a rate.

**Against quality verdict integrity.** A playtest finding ages exactly the way a verdict ages,
and for the same reason: it speaks for the build it was observed on, and when the build moves it
becomes evidence about the past rather than a statement about the present. The bindings,
standings and asymmetries are that subject's and are cited, not repeated. The one thing worth
saying here is that the asymmetry transfers unchanged — an unrepeated complaint still complains,
while a build that nobody replayed has not thereby been cleared.

**Against runtime observation evidence.** That subject owns what a behaviour claim requires and
which rungs an automated observer may conclude at. The session contract in this subject sits
directly on top of it: the instrumentation that makes a report actionable is the same
instrumentation that makes an observation admissible, and where an agent is the tester, the rung
its report was observed at is a required field of the report. Do not restate the ladder here;
name the rung and let the neighbour define it.

**Against the operator's view of model traffic.** When the tester is a machine, its session is
also a stream of model calls with a cost, a latency and a trace, and scoring those traces as
operational telemetry is a separate discipline with its own home. The seam is the subject of the
claim: there, the trace is the thing being judged; here, the trace is a witness and the game is
the thing being judged. Metering, spend attribution and stream plumbing belong to that
discipline and are not duplicated here.

## Failure modes of the naive reading

- **The solution log.** A backlog of testers' proposed fixes with the observations discarded. It
  reads as a rich source of player insight and contains no facts about the game, so every entry
  has to be re-derived — usually by guessing what the tester must have seen.
- **The composite priority.** Frequency times severity as one sortable number. The queue looks
  orderly, the rare catastrophe and the constant annoyance are adjacent, and no reader can tell
  which term was measured and which was assumed.
- **The default bucket.** Everything ambiguous filed as balance, or as polish, or as "feel". The
  bucket grows, nobody who owns anything in it recognises it as theirs, and the routing table
  looks fine because it never reports a miss.
- **Anecdote inflation.** One vividly told session outweighing six quiet ones because it was
  narrated well. Frequency exists to prevent this and only works if it is measured with a
  denominator rather than felt.
- **Retrofit instrumentation.** Building the session record after the first painful triage, then
  discovering that every finding older than the record is unusable. The contract is cheap before
  the sessions and impossible after them.
- **The confident narrator.** An automated tester's causal explanation entering the record as an
  observation, because it was fluent and it was in the same paragraph. This is the failure that
  scales: one tester's bad theory costs an afternoon, a fleet of agents' bad theories become the
  project's picture of itself.
- **The silent close.** A finding nobody could reproduce, deleted. The next report of it is a
  new rumour, and the third one too, and the project never learns it is on its fourth sighting.
- **Fixing the report.** Rewording a complaint until it matches a defect somebody already knows
  how to fix. The queue gets tidier and the game does not change.
