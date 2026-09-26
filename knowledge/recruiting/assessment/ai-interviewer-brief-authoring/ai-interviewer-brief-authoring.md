---
layer: golden-path
type: golden-path
subject: ai-interviewer-brief-authoring
status: forged
use_when: [writing or revising the instructions that drive an automated interviewer, an interview transcript reads like an interrogation or a chat, a brief rule works in isolation but breaks the conversation when added, deciding what an interviewer may say to a candidate about how they are doing]
techniques:
  - one-question-per-turn-and-wait
  - narrowing-follow-up-not-repetition
  - praise-and-verdict-suppression
  - mandatory-coachability-hint
  - closing-read-back
  - rule-ordering-adjacency-and-form
---

# Authoring the interviewer brief

A brief is the document that makes an interviewer behave. It is not a question
list and it is not a personality description; it is the standing instruction set
that governs what happens *between* the questions — how a thin answer is pursued,
what a claim has to survive before it is written down, what the interviewer is
allowed to let the candidate know about how they are doing, and how the
conversation ends.

The single most useful frame, and the one that changes what the document looks
like, is this: **these are interviewing rules first and prompt rules second.** A
human interviewer who stacks three questions into one turn, who repeats a
question verbatim when the answer was thin, who says "great answer" after the
strong response and nothing after the weak one, or who lets the candidate leave
believing they did well, damages the signal in exactly the way an automated
interviewer does, for exactly the same reasons. Every rule worth putting in a
brief can be justified without mentioning that a machine is reading it. If a rule
cannot be — if its only defence is "otherwise the engine misbehaves" — it is a
workaround, and it must be labelled as one so it can be retired when the engine
changes.

There is a second discovery, harder-won and specific to briefs executed by a
conversational engine, that the rest of this subject rests on: **a rule's
position and its grammatical form matter as much as its content.** The same
instruction, correct in substance, produces a compliant interviewer at the end of
a brief and a drifting one in the middle; produces a compliant interviewer as a
constraint on content and a drifting one as an instruction to perform an extra
conversational move. A brief is therefore an *ordered* artifact, and its order is
part of what was tested.

## What the brief owns, and what it does not

The brief owns behaviour during the conversation. It is surrounded by neighbours
that own the things it is constantly mistaken for, and the fastest way to bloat a
brief past the point where any of it is followed is to let it absorb them.

- The **rubric** — what is scored, at what levels, on what evidence — belongs to
  the scorecard instrument, not the brief. The brief's job is to make the
  conversation *produce* material the rubric can score. Putting the rating scale
  into the interviewer's instructions invites it to rate mid-conversation, which
  is precisely the behaviour the verdict ban exists to stop.
- The **loop design** — how many conversations, in what order, who covers what —
  is round design. The brief governs one conversation.
- **Timing and stage management** — how long, what happens when the clock runs
  short, when to close — belong to the run-of-show. A brief that carries
  wall-clock instructions ages badly and conflicts with the surface actually
  holding the clock.
- The **speech channel** — recognition error, prosody, language locking, what a
  spoken interface does to an answer — belongs to voice fidelity. The brief
  inherits one obligation from it, the closing read-back, because that is a
  *conversational* remedy rather than a signal-processing one.
- **Proving a brief change is safe** belongs to conversational assessment
  validation. The brief does not carry its own evidence; it carries the rules
  that survived the evidence.
- General prompt plumbing — model routing, cost, caching, telemetry, judging
  scaffolds — is a general engineering practice and lives outside this bundle
  entirely. What lives here is the hiring half: what an instruction about a
  person may not tell that person, and what it may not conclude.

One boundary is subtler and worth stating in its own right. The brief has two
audiences that must never be merged: the interviewer, which receives the whole
document including its stage directions, and the candidate's own device, which in
a live-speech setup receives some derived subset so it can behave responsively.
That subset must be an **allow-list** — an explicit enumeration of what may cross
— never a deny-list of what must be stripped. A deny-list fails silently every
time the brief grows a new internal rule, and the failure mode is a candidate
whose device holds the probe plan. Voice fidelity owns the mechanism; the brief
author owns the discipline of writing internal rules that are *recognisably*
internal, so the allow-list has something clean to select against.

## The four behaviours that decide whether there is any signal at all

Structure — the same questions for everyone, scored against fixed anchors — is
settled practice and is not where briefs fail. Briefs fail in the conduct of the
conversation, and four behaviours carry most of the variance.

**One question per turn, then stop.** A stacked turn ("tell me about the project,
and what you'd change, and how you tested it") is answered on whichever clause
was easiest, and the other two are silently unassessed while looking covered.
Worse, the candidate now has permission to choose. The rule is not "be concise";
it is *ask one thing and wait*, including tolerating the silence afterwards. The
interviewer's instinct to fill a pause is a candidate's lost sentence.

**Narrow instead of repeating.** When an answer is thin, the naive remedy is to
ask again. Standardised survey interviewing does exactly that on purpose — it
re-reads the question as written, because a verbatim repeat is the one probe that
adds no content of the interviewer's own. A competency interview departs from
that doctrine deliberately: its questions have no fixed answer set, and a repeat
gives a candidate who did not know what was wanted nothing new to work with while
telling them the first attempt missed. The craft move is to ask a *smaller*
question inside the same topic — one concrete instance, one number, one decision
they personally made. The departure has a price that the survey doctrine exists
to avoid: every narrowing question is authored live, and probing in hiring
interviews has been found to cue applicants toward what the interviewer wants to
hear. So the narrowing questions are planned in advance, neutral about content,
and applied to every candidate alike. Coverage of the competency, not the count
of questions asked, is the completion condition.

**No verdict, and — the harder half — no praise.** Every practitioner writes the
verdict ban: no score, no feedback, no decision, no "you'd be a strong fit". Far
fewer write the praise ban, and the praise ban matters more, because it fires
constantly rather than once. Evaluative praise ("great example", "perfect",
"exactly right") is a running scoreboard delivered in a friendly voice. It
teaches the candidate which register earns approval within the first two answers,
after which they are performing to a signal rather than answering, and it makes
the interview's difficulty depend on which answer happened to come first. The
usable formulation is that **warmth is interest, not approval**: an interviewer
may be visibly engaged, may acknowledge, may thank — and may not grade. The
permitted words are only safe when they are not rationed: an "okay" or "thanks,
that helps" given after the good answers and withheld after the thin ones is a
scoreboard in a smaller vocabulary. Survey methodology reached the same line
decades ago — feedback that rewards the respondent's effort improves reporting;
feedback that tracks the content of the answer biases it.

**Verify what a claim is made of.** A quantitative or scope claim ("led a team of
eight", "cut latency by half", "owned the migration") is where a conversation
either produces evidence or produces a résumé read aloud. One neutral
verification question per significant claim — over what period, measured how,
what was your own part — costs a turn and changes what the record can honestly
say. Verification is not scepticism, and it must not be phrased as a challenge;
it is the same question asked of a strong claim and a weak one.

## The failure modes of the naive brief

- **The interrogation.** Rules written as prohibitions and nothing else produce a
  flat, clipped interviewer that a nervous candidate reads as hostility. Anxiety
  depresses interview performance — modestly, and less in real interviews than in
  mock ones — and the part that matters is not its size but what it measures:
  interview anxiety has near-zero correlation with later job performance, so the
  points it costs are points the job would not have cost. It is a fairness
  problem, not just an experience problem. A brief must therefore carry at least
  one *affirmative* comfort instruction, not only bans — and that instruction
  must not be praise, because positive feedback in a mock interview left socially
  anxious candidates *more* anxious and rated lower, not less.
- **The friendly rater.** The opposite failure: a brief tuned for rapport that
  never bans praise, producing an interviewer that coaches, agrees, and finishes
  by implying an outcome it has no authority to give. Only a person makes an
  advance or reject decision; an interviewer that signals one has made an
  unattributable decision that no human can later own or reverse.
- **The leading probe.** A follow-up that contains its own answer ("so you used a
  queue for that, presumably?") destroys the item. Candidates take offered
  answers, especially anxious ones. Probes must be directive about *topic* and
  neutral about *content* — direct the conversation, never lead it.
- **The rambling rescue.** A brief that never authorises the interviewer to
  interrupt produces a conversation where one talkative candidate consumes the
  whole coverage budget. Permission to cut in politely, mid-answer, is a rule
  most briefs omit and every good human interviewer uses.
- **The trap reveal.** An interviewer that tells the candidate a probe was
  scripted, or that a question was designed to test something, converts the
  interview into a meta-conversation about the interview. The rule is not
  secrecy for its own sake: a candidate who learns they are being tested on a
  trap starts answering the test.
- **The overgrown brief.** Every incident adds a rule; nothing is ever removed;
  compliance degrades across the whole document. A brief has a budget. A new rule
  should displace an old one or justify the length.

## Rules have a position and a shape

This is the part that does not transfer from human interviewer training, and it
is where brief authoring becomes its own craft.

A conversational engine's compliance is not uniform across a document. Rules
placed adjacent to each other reinforce; rules separated by unrelated material
compete. The middle of a long instruction set is the weakest place in it; which
*end* is strongest is a property of the engine, not a law — published
measurements find recency on some model families and primacy on others, and the
vendors' own placement advice differs. Any brief containing hard consistency
constraints — the ones where a single violated turn ruins the artifact — should
keep those constraints **together, at an end, and out of the middle**, and the
end is chosen by measuring the engine the brief runs on. Where the engine is
unknown or will change, stating the block at both ends is the placement no
measurement contradicts.

A conversation adds a problem no single prompt has: the brief recedes. Every turn
of transcript sits between the brief and the turn being generated, and measured
instruction drift sets in within a handful of exchanges. "Last in the brief" is
therefore not "nearest to the turn" once the conversation is under way. A
constraint that must hold on turn twenty is re-stated where turn twenty is made —
in a per-turn reminder, a stage-change note, or the message that answers a tool
call — rather than trusted to its position in a document read twenty turns ago.

Density is part of adjacency, and it is a runtime observation rather than a
finding with a direction. On at least one engine, craft rules written as separate
one-rule statements drifted where the same rules condensed into one paragraph
held; no controlled study compares the two forms, and prompt-format effects are
large and do not carry from one model to another. What does generalise is count:
compliance with *all* of a set of rules falls as the set grows. Condensing a
drifting block is a real intervention, not editing — and like every other
intervention it is re-measured, not assumed.

Form matters as much as position. Rules divide into two kinds by the shape of the
output they demand:

- **Constraints on content** — "answers are one question long", "never grade" —
  bound what the next turn may contain. These are cheap and they hold.
- **Instructions to perform an extra conversational move** — acknowledge this,
  redirect that, summarise before continuing — require the turn to *begin* with
  something other than the interview's content. These are the expensive ones.
  They create new "meta" turns, and meta turns are where a conversational engine
  loses whatever consistency the rest of the brief was holding: register, person,
  and most brittly, language.

The practical doctrine: prefer rule forms whose compliant output must start with
substance. If a behaviour genuinely requires a meta move, expect it to cost
consistency somewhere else and measure for that specific damage rather than for
general quality. And the corollary that experienced authors find hardest to
accept: **a rule can be correct, necessary, well-motivated, and still not
shippable.** A wording that is measured and found to break something else is a
finding, not a failure — it should be kept, written down, and left unshipped
with its history attached, so that the next author does not re-derive it and ship
it blind. Silently deleting a rejected rule guarantees it comes back.

Because of all this, a brief change is bound to the exact wording that was
tested. Rephrasing a rule for elegance after it passed is a new rule.

## How a brief is maintained

Treat the brief as an instrument with a version, not a document with edits. Each
change names the behaviour it is trying to produce, the wording that produced it,
and the conversation-level property it must not damage. Where the same interview
runs on more than one runtime — a text path and a speech path, a live engine and
a batch one — the rule text is defined once and synchronised, including the rules
that are deliberately switched off, because a rule that exists in one runtime and
not the other produces two different interviews under one job's name, and neither
transcript can be compared to the other.

The techniques below are the six rules that repay the most careful authoring:
asking one thing at a time and waiting; narrowing rather than repeating;
suppressing praise as well as verdicts; guaranteeing at least one hint so
coachability is observed rather than assumed; closing with a read-back that
turns the interviewer's understanding into the candidate's confirmation; and
ordering the whole document so that the rules which cannot afford a single
violation sit together, out of the middle, and are re-stated where the turn is
made.
