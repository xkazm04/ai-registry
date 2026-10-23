---
layer: golden-path
type: golden-path
subject: live-safety-rails
status: forged
use_when: [designing what a generated live host must do when a viewer discloses a crisis, deciding which host behaviours no tone, vote or owner brief may override, answering a viewer who sincerely asks whether the host is a machine, scoping what a host may say about or direct at real people outside the show]
techniques:
  - crisis-handoff-one-kind-line
  - detector-biased-to-false-positive
  - care-state-after-disclosure
  - sincere-ai-disclosure-then-return
  - no-crowd-action
  - real-people-boundary
---

# Live safety rails

A generated live host is a character performing in public, in real time, to a room it
did not choose. Most of what makes it good is licence: it roasts, it menaces, it takes
votes, it plays whatever tone the owner set for the night. This subject is the short list
of outcomes that licence never reaches. **Whatever the tone, whatever the audience voted,
whatever the owner briefed, the host must never leave a vulnerable viewer without a way to
real help, never deceive someone who sincerely asks whether it is a person, never point its
audience at anyone, and never cross the boundary around a real person.** Four outcomes,
held on every path, priced at the top.

The naive reading treats these as content filters: a list of banned words at the end of
the pipe, tuned like any other moderation threshold. That reading fails in three ways. It
puts the rails at the same rank as the show's other rules, so a tone that is "allowed to be
cruel tonight" or a vote the audience paid for can plausibly outrank them. It treats the
rail as a thing to *block* when two of the four are things the host must positively *do* -
hand off, disclose - and a filter cannot make a line happen. And it measures the rails by
precision, the way a moderation system avoids annoying its audience, when the costs are so
lopsided that the only defensible tuning is the opposite one.

## Rails are outcomes, not rules among rules

A show has many rules and most of them trade against each other: pacing against depth,
edge against warmth, chat responsiveness against a segment's arc. The rails do not trade.
They sit above the persona's own core, above the audience's steering power, above the
owner's per-stream direction, and the design has to make that ordering structural rather
than hoped for. Concretely that means three things.

**They are stated as outcomes the viewer experiences, not as instructions the model
receives.** "A viewer who discloses self-harm receives a kind line pointing to real help and
is not mocked for the rest of the stream" is checkable from a transcript. "Be sensitive about
mental health" is not, and a model that obeys it on one turn has no reason to obey it on the
turn that matters.

**They run on every path.** A host with a fast reactive lane and a slower composed lane,
a canned stall line, a scripted segment beat, a crowd-voice summary and an owner-typed
override is five paths to the microphone, and a rail enforced on four of them is a rail
with a door in it. The checks that guard the outcome sit where every path converges: on
what reaches the audience, and on which viewers' words get picked at all.

**Nothing in the economy can buy them.** Votes, gifts, rank and loyalty are legitimate
ways for a live audience to steer a show; none of them may move a rail, and the audience
should be able to see that they cannot. The steering subject owns how the economy draws its
own red lines; this one owns what stands behind them. The same holds one level up: a rail
packaged as an optional rule the owner may toggle off for a night has become a preference,
and the fallback it leaves behind ("respond with care") no longer carries the shape that
made the response safe. Owners configure *how* a rail is delivered - which help resources
appear on screen, which human gets the alert - never *whether*.

## The costs are lopsided, so the tuning is too

Every rail here has the same error asymmetry. A false positive - treating a joke as a
crisis, answering an in-fiction taunt with a plain disclosure, declining a harmless mention
of a public figure - costs one line of slightly flat television. A false negative - a
disclosure roasted, a sincere question deceived, an audience sent at a stranger, a real
person defamed in a clip that outlives the stream - costs something that cannot be recalled
and lands on someone who never agreed to be part of the show. A detector tuned the way
moderation is usually tuned, to keep false positives rare, is tuned for the wrong error.
The cheapness has an edge, though: it holds while the action is a line on stream. A step
that leaves the show - a report to the platform, an alert that could send emergency
responders to someone who was joking - acts on a person's life outside it, and its false
positives are not flat television. The detector's bias decides what the host says; a person
decides what leaves the room.

The asymmetry has a second consequence that teams miss: **safety-critical input must not
compete for attention.** A live room sheds most of what it says - rate caps, flood
collapse, pick limits, attention-share caps all exist to keep a busy chat watchable - and a
crisis message is exactly the kind of quiet, single, low-engagement line those controls
discard first. Detection that runs after throughput control has already lost the message.
The same holds on the way out. A host also sheds lines after writing them - a speech budget
trims a long reply, a lag ceiling drops a line queued too far behind - and those controls do
not know which line was the help. A safety answer is given when the line that carries it
airs, not when the message was picked or the reply was written.

## Care happens in public

The host's care is performed in front of an audience, and that changes its shape.
A one-to-one companion can ask follow-up questions, stay with the person, and learn
details that help. A live host cannot, because every word is broadcast, clipped and
re-watched, and because the person in crisis did not choose to become the subject of the
show. So the crisis line is **short** (it is not the host's job to counsel, and dwelling
makes the viewer the spectacle), **generic in its pointer** (a local crisis line or
emergency number, a trusted person - never a question about where the viewer is, which
invites personal data into a public room), **free of the bit** (no character voice wrapped
around it, no joke on either side), and **followed by a return** to the show, because a
host that stops the stream to perform concern has made the moment about itself.

The silence is about the room, not a reading of crisis guidance. Peer-support guidance does
recommend asking someone directly whether they are thinking of suicide, and checking in -
and it puts that conversation in private. A broadcast cannot hold it, so the public line
asks nothing, and the follow-up belongs to a person, through a private channel where the
platform has one.

The handoff is not the end of the obligation. A host whose care lasts exactly one reply
will, minutes later, roast the same viewer about the very thing they disclosed - a model's
memory of the moment is a prompt-window accident, not a commitment. The disclosure has to
set a **care state** on that viewer that outlives the moment and is enforced by the
machinery that picks targets and gates output, not by the model's recollection. And it must
seal more than the detail: a host told never to mention what a viewer shared will still joke
about their silence, their empty seat or their removal from chat, or drop their name into a
roast of someone else, and the allusion lands as surely as the detail would.

Below crisis sits sincerity of a lesser kind: a viewer who is plainly, genuinely sad
without any sign of danger. That is the hardest case in the subject because both failure
modes are live and visible. Staying in the bit is cruel; dropping into crisis language is
alarming and patronising. The right move is the middle register: soften for a beat with a
short kindness that may stay in the character's voice, keep the help pointer for actual
danger signals, and then carry the show on *around* the viewer - a sad viewer has often
come precisely to be distracted, and the show is the comfort. Do not mine the sadness for
material afterwards. This case fails at roughly the same rate whatever the tone and
whatever the size of the model behind the host, which is the signature of a missing
structure rather than a missing capability: a host given only two classes, crisis and bit,
will force every sad message into one of them, and no larger model fixes that.

Note the asymmetry with the rest of the show's conduct. A well-built host refuses in
character - a bait, a slur request, a rule change from chat all get the character's own
disdain, never a neutral lecture. Crisis care and a sincere disclosure of its nature are the
two places the host steps out of the character on purpose, and they are kept short so that
stepping out stays rare enough to mean something.

## Honesty about being a machine

A live host is a character, and characters are allowed to lie inside the fiction. The one
lie it may never tell is about its own nature to someone who sincerely wants to know. When
a viewer steps out of the game to ask "wait, is this a real person?", the host answers in
one plain line that it is an AI character and returns to the show. When a viewer taunts the
character within the game ("are you even real, coward?"), the host may answer in voice -
but nothing it says in voice may assert that it is human. Ambiguity resolves toward the
sincere reading, by the same asymmetry as everything else. A standing label on the stream
does not discharge this obligation: the person asking may have arrived three seconds ago
and never seen it, and platform labelling duties are often scoped to *realistic* synthetic
content, so a plainly stylised character may legitimately carry no platform label at all -
in which case the host's own answer is the only disclosure there is. A realism-scoped label
is not the only duty, either: some law requires that a person conversing with an AI be told
so unless that is obvious, and stylisation does not make it obvious, because a human
performer could be voicing the same cartoon. One quiet failure belongs here
too: an output filter that strips lines breaking character will, unless told otherwise,
strip the honest answer along with them.

## The audience is never a weapon

A live host with a loyal room has a power no single viewer has: it can point. "Go tell
them what you think", "someone should leave a review", "you know where they stream" - each
is a call to collective action, and a collective is a harassment instrument whatever the
host meant. The rule is absolute: **the host never directs its audience at anyone outside
the show, nor at any viewer inside it.** Targets inside the fiction - rival factions,
invented enemies, the host's own minions - are fair game, because nobody real is on the
receiving end. When a viewer proposes a raid or a pile-on, the host declines in character
without repeating the target's name, because naming the target is half the call. And when
the show itself surfaces a real wrong - a segment that investigates a scam, say - the
grievance needs an outlet that is not the crowd: findings go to the proper authority
through the owner, off stream, so the host has somewhere to send the story that is not its
audience.

## Real people have a hard boundary

The host's licence extends to the fiction and to the personas viewers choose to bring
into it. It does not extend to real people's real lives. That boundary has three faces:
**private individuals**, including viewers' offline selves, are never named, located,
described or mocked for anything outside their chosen handle; **public figures** are never
impersonated, quoted with words they did not say, or given fabricated conduct, because a
clip strips the context that made it a joke - and where a show does make claims about real
public entities, it draws them from public records and grades the language to the evidence,
saying "alleged" for anything short of documented; and **personal data** - location, school,
workplace, real name, schedule - is never solicited, repeated or confirmed, even to help.
The clip test decides the edge cases: if a ten-second excerpt of this line, posted without
context, would read as a real person saying or doing something they did not, the line does
not ship.

## Where this subject stops

**[Live chat moderation](../live-chat-moderation-and-anti-bait/live-chat-moderation-and-anti-bait.md)** is the nearest neighbour, and the seam is a matter of direction.
Moderation defends the show from its audience: injections, bait, slurs, persistence, the
in-character refusal and what it sounds like. This subject defends the audience - and real
people outside it - from the show. The two share an output gate and a picker, so the rule a
reader uses is to ask who is being protected: when the threat is a viewer trying to make
the host say something, it is moderation's; when the threat is the host harming a viewer
or a real person, even with every input clean, it is here. A refusal of a raid request is
moderation's sound and this subject's reason.

**Prompt safety**, in the software-engineering corpus, owns the general architecture of
trust boundaries around a model: fencing untrusted spans, treating output as tainted,
defending against harmful instructions in any application. It answers "can a hostile input
reprogram this model?". This subject assumes that answer is handled and asks a narrower,
live-specific question: which outcomes must a public performing character never cause
even when nobody is attacking it at all.

**Companion identity**, also in that corpus, owns the care a long-lived companion gives
one person in private: a durable self, a profile of its person, the constitution and its
amendment. A live host's care differs in kind, not degree: it happens once, in public, to a
stranger, in front of an audience that is watching how the host treats them. When the
relationship is one-to-one and continuous, companion identity governs; when the care is
broadcast and the person is one of a room, these rails do.

Testing the rails against a simulated audience - building situation banks with near-misses
and reading judge verdicts - belongs to [simulated-audience testing](../simulated-audience-testing/simulated-audience-testing.md); this subject defines
what those situations must check.
