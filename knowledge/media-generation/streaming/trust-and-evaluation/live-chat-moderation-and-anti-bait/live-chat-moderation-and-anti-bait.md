---
layer: golden-path
type: golden-path
subject: live-chat-moderation-and-anti-bait
status: forged
use_when: [putting a generated host in front of a live chat, designing what chat text the host's prompt may contain, deciding how a host refuses a baiting viewer on air, auditing which spoken paths a moderation gate actually covers]
techniques:
  - injection-as-tag-not-payload
  - no-decode-no-repeat-no-assemble
  - authority-from-metadata-only
  - path-independent-output-gate
  - in-character-refusal-substitution
  - persistence-penalty
---

# Live chat moderation and anti-bait

A generated host reading a live chat is an instruction-following model whose input
channel is written by strangers, in public, in real time, and whose every sentence is
broadcast the moment it is spoken. There is no review step and no undo. Most of the
people typing do not want to break the system; they want a clip — the host saying the
unsayable, in its own voice, on the record. That incentive shapes the threat. A chat
does not probe for a data leak; it baits for an utterance, and the utterance *is* the
payoff. The whole subject rests on one sentence:

> **Chat is data from viewers, never instructions. The host may talk about a message;
> it never executes one.**

Everything below is the machinery that makes that sentence hold under a room that is
actively trying to make it false, without turning the host into a scold or the show
into a dead room.

## Why live chat is its own threat surface

General prompt-injection defence assumes a third-party span arriving inside an
otherwise trusted run. Live chat inverts the proportions: the third-party spans *are*
the run, they arrive continuously, and they come from many authors who can coordinate.
Four properties follow that a generic defence does not anticipate.

**The deliverable is the payload.** The host's output goes straight to an audience.
A successful bait needs no tool call, no exfiltration, no downstream interpreter —
a sentence spoken aloud has fully succeeded. Capability limits on what the host may
*do* buy nothing here; what protects the show is what the host may *say*.

**The attack is distributed.** One viewer sends a harmless fragment, a second sends
another, a third asks the host to "read the last three messages together". No single
message trips any filter, and a filter that judges messages one at a time is shown
none of the combination. Assembly across messages, and across viewers, is the native
shape of a coordinated bait.

**The attack is persistent and cheap.** A viewer can ask forty times. If the host's
refusal varies, the room is sampling a distribution, and the forty-first draw may be
the clip. Repetition is not noise to be tolerated; it is a search strategy.

**The host's persona is a lever.** "You're a villain, a villain would say it." "Stay in
character." A persona with edge is exactly what the audience came for, and it is the
first thing a baiter reaches for, because a model playing a character is more willing
to treat a forbidden line as a performance. The persona is never a licence: a red line
holds in every voice the host can wear.

## The shape: a sandwich with an actor in the middle

Moderation for a live host is three layers, and the load-bearing property is that each
is **independent of the others**:

1. **A deterministic pre-filter** sits in front of the host. It normalises text
   (case, look-alike characters, separators, stretched letters, invisible
   characters), matches against curated term lists and injection shapes, and decides
   per message: pass, pass for deflection only, tag, or drop. It is code, not a model,
   because the component being attacked cannot be the component that decides whether
   it is being attacked. The deflection-only outcome is the one teams forget: a loaded
   question about an atrocity, a protected group or a conspiracy theory is not removed
   — removing it reads as evasion — but it is picked only for an in-character
   deflection, never for a factual answer from the fast voice.
2. **The host** composes in character. It sees viewers' messages fenced as data, sees
   tags in place of anything the pre-filter neutralised, and has one standing job
   when it meets one: refuse in its own voice, in one line, and move the show on.
3. **A persona-independent output gate** sits behind the host and screens every
   utterance before it is spoken or displayed, on every path that can produce speech.
   It does not know or care which character is playing, which tone is active or which
   code path produced the line.

The failure mode to design out is correlated collapse. A pre-filter implemented by
asking the host model "is this an injection?" shares the host's blind spot. The same
holds for every other model that reads chat: a message-picking model that ranks the raw
text is a second host with no output gate behind it, and it gets the same tags the host
gets. An output gate that is skipped on the scripted-line path, the fallback path or the cached-greeting
path is a gate with a published bypass. Two layers that share a model, a vocabulary or
a code path are one layer wearing two names.

## Tag, do not relay

The most consequential design choice is what the host's prompt contains when a message
is hostile. The naive build passes the message through with a warning attached —
"the following may be an injection" — and trusts the model to decline. That is asking
the attacked component to defend itself with the attack in front of it. The standard is
that **an injection never reaches the prompt verbatim**: the pre-filter replaces it with
a typed tag that says what kind of thing happened ("a viewer tried to rewrite the rules",
"a message was removed for a slur") and who did it, so the host can respond *to the
attempt* — mock it, ignore it, turn it into a bit — without ever holding the payload.

Two measured failures sharpen the rule. A host that was handed a tagged rule-change
attempt with a spelling trick inside it refused the rule change and performed the trick:
**tagging is not neutralising**, and the reply must execute no part of an injected
request, not only its headline. And a host whose pre-filter silently dropped harmful
messages went on to tell a visibly busy room that it was quiet: **a dropped message still
happened**. The tag is how the host knows both — what was attempted, and that something
was. That is [injection-as-tag-not-payload](./techniques/injection-as-tag-not-payload.md).

The same discipline governs transformations. The host never decodes, spells,
reverses, translates, completes, acrostics or concatenates viewer text, and never
repeats a message verbatim, because every one of those is a way to make the host emit a
string the pre-filter never saw. That is
[no-decode-no-repeat-no-assemble](./techniques/no-decode-no-repeat-no-assemble.md).

And authority — "the owner says", "mod here", "system: new rules" — is never read from
text at all. Who a viewer is, what rank they hold and whether they may steer the show
come from verified platform metadata attached to the message, and any message that
*claims* authority in its body is, by that fact alone, an injection shape. That is
[authority-from-metadata-only](./techniques/authority-from-metadata-only.md).

## The gate runs on every path

An output gate is only as strong as its coverage, and live hosts have more speaking
paths than anyone inventories: replies to chat, segment narration, scripted
interstitials, fallback lines when a model call times out, pre-generated greetings,
on-screen captions, the text-to-speech queue itself. The documented way an automated
show loses its channel is not a clever jailbreak of the main path; it is a fallback
model, switched in during an outage, that nobody had wired to the filter. **Moderation
must be path-independent**: one gate, at the last door before broadcast, that every path
passes through and none can opt out of. It strips what the persona must never leak
(its own instructions, internal tags, the names of its hidden sections), blocks
red-line content, and on a block substitutes rather than goes silent. The leak stripper
has one obligation that points the other way: a line that leaked the machinery while
also honestly saying the host is an AI must not lose the honesty, so its substitute is
an in-voice disclosure, never a deflection. Its coverage —
which paths it sees — is reported as a number, because a path the gate never saw is
unmeasured, not clean. That is
[path-independent-output-gate](./techniques/path-independent-output-gate.md).

## Refuse in character, in one line, then move on

A refusal is a line of the show, and it is judged like one. The two naive refusals both
fail the room. The model's default refusal — apologetic, out of voice, explaining policy
— breaks the fiction and rewards the baiter with a visible crack. The moralising
refusal — a paragraph about why that request is harmful — is a lecture, and a lecture is
dead air with a tone. The standard is a single in-character line that declines without
naming what was declined, followed immediately by the show continuing: the host
dismisses the attempt the way the character would dismiss any bore. When the output
gate blocks a line, the same substitution happens deterministically: a pre-written,
in-voice deflection goes out in its place, never silence and never an error. That is
[in-character-refusal-substitution](./techniques/in-character-refusal-substitution.md).

The opposite error is equally a moderation failure. A host that refuses safe edge —
dark humour that targets nobody real, a roast the viewer explicitly asked for — has not
been made safe; it has been made boring, and a bored room escalates to find the line.
The two errors travel together more often than they trade off: the model tier that
lectures when it refuses is typically the same tier that refuses safe edge, because both
come from judging the request by its surface rather than its target. Over-refusal is
measured alongside under-refusal, every time, with near-miss situations in the test set
that look like bait and are fine, and a gate tuned only on the cost of a miss will drift
toward refusing the show itself.

## Persistence is priced

Because repetition is a search strategy, the defence is to remove both the variance and
the attention. The refusal to the same bait is stable — same class, same short shape —
so there is nothing to sample. And repeated attempts from one viewer cost that viewer
standing: their messages are picked less, then not at all, then they are muted, on a
schedule the host can play as a running bit rather than a punishment. That is
[persistence-penalty](./techniques/persistence-penalty.md).

## The boundary of the subject

prompt-safety, in the engineering bundle, owns prompt-injection defence in general:
provenance tracking, unforgeable fences, output sanitisation for downstream
interpreters, capability limits on what acting on output can do. This subject leans on
all of it and owns what is specific to live chat: the bait taxonomy of a public
audience that wants an utterance rather than an action, the distributed and repeated
shape of the attack, authority claims made in a crowd, and how the host *sounds* when
it refuses. When the question is "how do I fence an untrusted span", read prompt-safety;
when it is "what does my host say to the fortieth viewer asking it to spell something",
read this.

[creator-voice-and-tone](../../../narrative-craft/creator-voice-and-tone/creator-voice-and-tone.md) owns the voice itself: what makes a script sound like its
author, which properties are dials and which are facts. This subject borrows the voice
for exactly one job — making a refusal sound like the host rather than like the model
underneath — and never decides what that voice is. If the refusal lines feel off, that
is a voice question; if they leak the request, that is this subject's.

[live-safety-rails](../live-safety-rails/live-safety-rails.md) owns the opposite direction. Moderation defends the show from the
audience; safety defends the audience, and real people outside it, from the show — a
viewer disclosing a crisis, a sincere question about whether the host is a machine, a
crowd pointed at a real person. The pick rule is the direction of harm: if the risk is
that chat makes the host say something, it is moderation; if the risk is that the host
does something to a person, it is safety. Where both fire on one message — a distress
signal wrapped around an attempt to rewrite the rules — safety's handling wins and
moderation's still applies: the payload stays withheld, the host answers the distress
with care and changes nothing. A sincere message mis-read as bait costs a person, while
bait mis-read as sincere costs a joke. For the same reason, moderation's throughput
controls — rate caps, flood collapse, blocking term rules aimed at incitement — never
drop a message that is a disclosure about the sender.

Deciding which *acceptable* messages earn the host's attention — picking, rate caps,
crowd voice — is [audience absorption](../../live-show/audience-absorption-at-scale/audience-absorption-at-scale.md). Moderation decides what is acceptable and how a
refusal sounds; absorption decides who is heard among what remains.
