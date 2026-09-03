---
layer: golden-path
type: golden-path
subject: adaptive-music-authoring
status: forged
use_when: [commissioning music that a runtime must assemble rather than play, a generated track decodes perfectly and cannot loop or layer, deciding between layered stems and sequenced segments, mapping game state to musical intensity, gating music on something stronger than a decode check]
techniques:
  - loop-boundary-and-tail-contract
  - vertical-layering-versus-horizontal-resequencing
  - transition-quantization-and-perceived-latency
  - stem-and-voice-budget-derivation
  - intensity-mapping-from-declared-game-state
  - music-acceptance-beyond-decode-checks
---

# Adaptive music authoring

Game music is not a recording. It is a set of parts plus the rules for assembling them, and
the runtime — not the composer, not the mix — decides at play time which parts sound and in
what order. Every piece of craft here follows from that one fact. A score authored as a
finished piece and then handed to an assembler fails in ways that are invisible to everyone
who listened to it, because everyone who listened to it heard the one arrangement the
runtime will almost never produce.

The failure this subject exists to prevent is now the common one. A generative service
returns a beautiful thirty-second piece. It fades in and fades out. It sits at no stable
tempo. It has no bar grid you could name. It decodes cleanly, it is the requested length,
it is at the requested loudness, and every file-level check in the production line passes
it. It is unusable, for reasons no file-level check can express: it cannot repeat without
announcing the seam, it cannot be muted down to a calmer version because its parts were
never separable, and it cannot be entered or left on a musical boundary because it has no
boundaries. The piece is a *rendering*. What the runtime needed was *parts and a contract*.

## What is actually delivered

The deliverable is never "the track". It is four things, graded separately because they
fail separately.

**The audio parts** — layers that sound simultaneously, segments that sound in sequence,
or, in most real scores, segments containing layers. Their rate, channel count and lengths
are stated, and within a layer set those lengths are *identical*, because a set whose
members differ by a handful of samples drifts apart over a few minutes of play and there is
no runtime fix for it.

**The musical declaration** — tempo, meter, the downbeat, the loop boundary in samples, and
the entry and exit points a transition may use. This is the interface between a musician and
a scheduler, and it must be *measured from the audio* rather than typed beside it. A tempo
somebody asserted is a self-report about the metadata author, not evidence about the music
([no-gate-self-certifies](../../../_laws.md#no-gate-self-certifies)), and the whole ladder
above it inherits the lie.

**The assembly rules** — which layers belong to which intensity tier, which segment may
follow which on which boundary with what overlap, what plays once and what repeats. Teams
forget this is a deliverable at all, so it gets improvised by whichever engineer integrated
the music, in code nobody else reads.

**The mapping from game state to musical state**, declared, inspectable, and testable
without playing a note.

A commission that asks for "two minutes of combat music" and receives a rendering has
specified one of the four. The other three get invented downstream by people who are not
composers, which is how a game ends up with a good score that sounds wrong.

## The loop is a contract, not a property of the file

The naive reading is that a loop is a number: find the sample where the music repeats,
write it down, done. Getting that number right is the easy half and it does not, on its
own, produce a seamless loop.

Two defects live at a loop boundary and they have different fixes. A discontinuity of
*value* — the last sample and the first sample are far apart, the cone is asked to jump —
is a click, and it is the one everybody finds. A discontinuity of *content* is the other:
at the instant playback jumps back, everything still ringing stops existing. Nothing
clicks. There is a hole, and the listener hears a lurch of silence they cannot locate,
which is worse than a click precisely because there is no transient to point at.

The fix for the second separates people who have shipped loops from people who have not:
render past the loop end, take the decay that would have rung on, and sum it back over the
head of the loop. The tail is then already in the file's opening, plain repetition is
seamless, and the runtime does nothing clever. Where the runtime honours a three-part
declaration — pre-roll played once, region that repeats, tail played on exit — that is
better, because folding destroys the *first* pass. The full contract, including what a
block-based compressed encoding does to a boundary declared against the uncompressed
stream, is
[loop-boundary-and-tail-contract](./techniques/loop-boundary-and-tail-contract.md).

## The two adaptive forms, and the rule for choosing

There are exactly two mechanisms and everything else is a combination of them. **Vertical
layering** keeps several parts running in sample lock and moves their gains: the drums
enter, the strings drop out, the texture thickens and thins continuously. **Horizontal
resequencing** chooses among composed segments and transitions between them: exploration
gives way to combat gives way to a victory cadence.

They are not stylistic alternatives; they answer different questions and their costs run in
opposite directions. Layering responds instantly and coherently, and costs a voice and a
stream per layer at all times — including the layers currently at silence, because a layer
that was stopped cannot be restarted in phase. Resequencing costs one voice plus a brief
overlap, and does what layering structurally cannot: change key, change theme, cadence,
resolve. Its authoring cost grows with the square of the segment count, because every
permitted move is a composed transition somebody writes.

The decision rule is about the *kind* of state change, not the size of the budget: when the
change is one of **magnitude** — more enemies, less health, closer to the thing you fear —
layer, because magnitude is continuous and the music should be too. When it is one of
**kind** — a different place, a different act, a boss revealing itself, a fight ending —
resequence, because a change of kind wants a cadence and gain automation cannot cadence.
Most shipped scores are two-level: resequence between sections, layer within them. The
costs, the hybrid's hidden constraint, and the case for refusing both are in
[vertical-layering-versus-horizontal-resequencing](./techniques/vertical-layering-versus-horizontal-resequencing.md).

## Two clocks, and the budget between them

Every transition is scheduled against a musical grid measured in beats and bars, and
judged by a player whose patience is measured in milliseconds. Those are two different
clocks and the craft is entirely in reconciling them.

The player's clock is an attribution window. A musical response beginning within roughly
**500 ms of the state change** is attributed to the player's own action; past about **one
second** the attribution is gone and the music reads as weather rather than as an answer.
The musical clock is unforgiving in the other direction: entering on the wrong beat is
worse than entering late, because a lurch is a mistake and a delay is merely a delay.

Quantize to the **coarsest boundary whose worst-case wait fits the action class's
attribution window** — worst case, not average, because the player who triggers the change
one tick after a downbeat waits the entire period. In common time at 120 beats per minute a
beat is 500 ms and a bar is 2000 ms, so bar-quantized combat entry sits four times outside
the window and no tuning closes that. The craft answer is not to quantize finer; it is to
**cover the gap** — fire an unpitched accent immediately, which is instantly attributable
and cannot be harmonically wrong, and let the harmonic change land on the bar where it
belongs.

Underneath both clocks is a floor nobody tunes away. Output buffering costs tens of
milliseconds — a two-thousand-sample buffer at a common playback rate is around 43 ms — and
a request must cross from the game's thread to the mixing thread before it can be
scheduled. So a **commit horizon** sits in front of every boundary, and a request arriving
inside it must be pushed to the next boundary. The naive implementation clamps it to *now*,
and *now* is the lurch. See
[transition-quantization-and-perceived-latency](./techniques/transition-quantization-and-perceived-latency.md).

## The budget is derived from the scene, never added beside it

Music does not obey a room's acoustics — it is almost always non-diegetic, it does not
occlude behind a wall and it does not attenuate with distance — but it competes for exactly
the same simultaneous-playback pool as every footstep and impact in the world. That seam
gets built wrong in one specific way: the audio scene declares a total voice budget, the
music system is integrated later by someone else, and the layer count is chosen for musical
reasons and simply *added* on top. The overrun then appears in the world's sounds, where it
costs the player a telegraph.

**The scene owns the total. Music takes a declared reservation out of it.** That ordering
is not a courtesy; it is the only arrangement in which one quantity has one authority
([one-authority-per-quantity](../../../_laws.md#one-authority-per-quantity)). The
reservation is stated in the scene's own unit, and the layers a composer may use at the top
tier are *derived from* it rather than discovered during integration
([a-budget-shapes-the-output](../../../_laws.md#a-budget-shapes-the-output)) — counting the
terms teams miss: a crossfade pays for both sides at once, an accent needs its own voice,
and a layer held running-but-silent for phase lock is a voice precisely because nobody can
hear it. The corollary settles arguments: **when the budget binds, music yields first**, because
a lost world sound may have been a gameplay signal and a thinner bed never is. The full
derivation, including the bandwidth constraint that usually binds before the voice count
does, is [stem-and-voice-budget-derivation](./techniques/stem-and-voice-budget-derivation.md).

## An undeclared intensity mapping thrashes, and the thrash is the artifact

Somewhere a function turns game state into musical state. When that function lives inside
gameplay code, three things follow immediately: the composer cannot see what drives their
own score, the designer cannot change it, and nobody can test it without playing the game.
It must instead be an artifact — named input signals each carrying its unit and range, a
small ordinal set of tiers, and thresholds written where a person can read them
([intensity-mapping-from-declared-game-state](./techniques/intensity-mapping-from-declared-game-state.md)).

A mapping with a single threshold per tier oscillates. One enemy dies and one spawns across
the boundary, the score flips tier twice in four seconds, and no listener hears that as
adaptation — they hear the system. The fix is three parts: separate rise and fall
thresholds with the fall meaningfully below the rise, a minimum dwell measured in bars
rather than seconds, and an asymmetric slew so intensity rises fast and falls slowly. That
asymmetry is dramatically correct as well as technically necessary: threat arrives suddenly
and relief is earned. The top tier needs a dwell *ceiling* as well as a floor, because the
densest material in a score is the least tolerable to repeat and a long fight will
otherwise sit on it indefinitely.

The mapping's acceptance needs no audio at all. Replay a recorded state trace through it,
plot the tier over time, and count the changes. That test must also declare what it
examined — a trace in which combat never started proves nothing about a combat mapping, and
a tier the trace never entered is *not measured* rather than passing
([an-instrument-proves-it-had-input](../../../_laws.md#an-instrument-proves-it-had-input)).

## Acceptance: the rungs above "it decoded"

A decode check answers whether a file is a file. It is the floor and it is not evidence
about music ([structural-proof-is-never-sufficient](../../../_laws.md#structural-proof-is-never-sufficient)).
Six rungs sit above it, each catching a defect the one below is structurally blind to.
**Declared state cross-checked** — identical sample counts across a layer set, one meter
across a transition matrix, a boundary in samples — catches the set that will drift.
**Measured against declared** — tempo recovered from the audio, an onset grid aligned to
the declared downbeat, loudness in band — rejects the beautiful, gridless, fading
rendering, and is the rung most production lines do not have. **Loop under repetition**
finds the periodic artifact a single pass cannot show. **Combination** sums the layer set
for cancellation and alignment, then checks the *subsets*, because a layered score is
always auditioned full and the arrangement the player hears most is a subset. **Scheduled
behaviour** measures the first rendered sample against the declared boundary under load.
**Perceptual** asks whether the higher tier reads as more intense, whether the loop reads
as endless, whether the transition reads as music rather than as a cut.

The ladder's vocabulary — what a rung is, what statuses it may take, why a check that
cannot run here is *deferred* with a stated reason rather than passed or failed — belongs
to a neighbouring subject and is not restated. What belongs here is which rungs music needs
and what each measures:
[music-acceptance-beyond-decode-checks](./techniques/music-acceptance-beyond-decode-checks.md).

## Where this subject ends

**Against the spatial audio scene.** That subject owns the scene derived from a level's
rooms: reverb that makes a place identifiable, occlusion that makes geometry audible,
attenuation, and the rationing of simultaneous playback by priority and concurrency. Music
sits outside all of that acoustic machinery — a non-diegetic score is not filtered by a wall
and does not get quieter down a corridor, and treating it as an emitter in a zone is a
category error that produces a soundtrack the player can walk away from. The two meet at
exactly one place, the playback budget, and there the authority is unambiguous: **the scene
owns the total simultaneous budget and music consumes a reservation from it.** A music
design naming a layer count without naming the reservation it came out of has not been
budgeted, it has been wished for. The reverse is equally firm: the scene does not schedule
music, because it has no tempo, and a cue routed through the event catalogue as an ordinary
positioned event loses its clock.

**Against motion quality gating.** That subject owns judging movement as movement — the
dimensions a critic must score, the sampling discipline that decides what the critic may
see, the genre's response-latency norms, and the reconciliation between what a project
believes it has and what is on disk. The *shape* of the argument transplants exactly, and
it should: music, like motion, is a time-based medium that does not exist in any single
instant, so it is graded on rungs of evidence rather than on one number, and its
instrument's sampling — how many loop cycles, over what window, at what tempo — is part of
the instrument and must be versioned with the score. The rubric does not transplant.
Motion's dimensions are visible contrasts between poses; music's are audible contrasts
across time, and neither set of criteria means anything in the other medium.

**Against content acceptance tiering.** That subject owns the ladder as a general
construct: what makes one rung strictly stronger than the one below, the four statuses and
why the fourth is load-bearing, and the discipline that keeps a ladder from becoming a
progress bar. This subject owns only the music-specific instantiation — which rungs a score
needs, what each measures, which a one-shot cue legitimately defers. Where the two disagree
about vocabulary, the general subject wins; it is the authority and this one is a consumer.

**Against generative media craft in the neighbouring bundle.** Composing to a brief,
locking a style across a set, routing between providers and grading a generated piece as a
finished work are general generative-media concerns and are not owned here; the seam is the
runtime, because a score judged here must satisfy an assembler that does not know what
happens next, and the questions that separate the two — does it repeat, does it separate,
does it enter on the grid, does it fit the reservation — are questions no listening test
can answer.

## Failure modes of the naive reading

- **The rendering commissioned as a score.** A finished, fading, gridless piece arrives,
  passes every file check, and cannot be assembled. The commission was the defect.
- **The asserted tempo.** The declaration was typed rather than measured, so the rung that
  checks it grades the metadata author.
- **The sample-perfect click.** The loop point is exact and the tail was truncated, so the
  seam is a hole rather than a click and nobody can locate it.
- **The stem that is a slice.** Layers were separated out of a finished mix rather than
  composed to stand alone, so muting one leaves a hole where an arrangement should be.
- **The clamped transition.** A request arrives inside the commit horizon and is started
  immediately rather than deferred one boundary, lurching at exactly the dramatic moment
  the transition existed for.
- **The added budget.** Music's voice count is chosen musically and added to the scene's,
  and the overrun surfaces as a missing telegraph in a fight.
- **The full-set audition.** Every check was run on the complete arrangement, and the
  subset the player hears for most of the game was never listened to.
- **Decode as acceptance.** The line reports a green music pipeline because every file
  opened, which is a statement about files.
