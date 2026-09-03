---
layer: technique
type: technique
subject: voice-io
technique: unattended-caller-attribution
status: forged
laws: [absent-guard-is-loud, record-precedes-effect]
shared_with: []
use_when: [an automated client can make the machine speak, exposing synthesis to callers the product does not host, someone asks for a headless or silent speech mode, a cloned voice can be driven by something other than a person]
stage: team
---

# Unattended caller attribution

Every consent rule in this subject is written for a requester the product can
see. Playback starts from a gesture or a standing preference; the arbiter
resolves contention between surfaces the product renders; the global mute
outranks toggles the product ships. All of that assumes the thing asking for
speech is **the user, or a surface inside the product acting for the user**.

A product that exposes synthesis to callers it does not host has left that
assumption behind. An automated client — a coding assistant, a shell script, a
scheduled job, another product on the same machine — reaches the channel
through a second door and asks for audio in a room the product cannot see,
possibly with nobody in it, possibly with several such clients taking turns.
Nothing about the request is a gesture, nothing about it expresses a live human
intent, and the output is not text on a screen the user can ignore: it is sound
in a shared physical space, in a voice that asserts a person.

The defect this technique names is **silence about causation**: audio happens,
and no artifact anywhere says who asked for it or whose voice it used.

## The discriminator: hosted or unhosted

Sort every caller by one question — *does the product control the code that
called?*

- **Hosted callers** are the product's own surfaces: a read-aloud button, a
  tour, an assistant reply. The existing rules suffice, because the surface
  that asked is on screen, is attributable by its own presence, and tears down
  its utterances when it unmounts.
- **Unhosted callers** are everything reaching the channel through the second
  door. They are not on screen, they do not unmount, they were not started by
  the person who will hear the result, and they may be running while that
  person is in another room or another meeting.

The distinction is not about protocol or transport; it is about whether an
attributable surface exists at the moment of output. A hosted caller *is* the
attribution. An unhosted one supplies none, so the product must manufacture it.

## The product raises the surface, never the caller

The obvious design — require callers to identify themselves in what they say,
or to render their own indicator — fails for a reason that is structural rather
than a matter of caller discipline: the caller is the party with the incentive
to be quiet, and it is not running inside the product's rendering. A disclosure
that depends on the disclosed party is not a disclosure.

So: **at the moment an unhosted request produces audio, the product raises a
synchronous, unsuppressible surface of its own** that names, at minimum, the
voice identity being spoken and that speech is in progress, and that offers the
stop. The surface is raised *before* the audio is audible, not alongside it and
not after — the record of the effect precedes the effect
([record-precedes-effect](../../../../_laws.md#record-precedes-effect)), and a
request whose attribution surface cannot be raised is refused rather than
spoken. That ordering is what makes the surface trustworthy under load: a
disclosure that races the audio it discloses will lose the race on exactly the
machines where it matters.

**There is no headless mode.** The optimisation is obvious, it will be asked
for in the first week, and it must be refused: an unattended background speech
daemon with the visibility switched off is precisely the artifact this technique
exists to prevent, and shipping the safe mode with an off switch is the same as
not shipping it
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)). The correct
answer to "I do not want the indicator" is the global mute — which produces no
audio at all — not audio without attribution. A product that ships both a
visible mode and a quiet mode has, in practice, shipped only the quiet one,
because a deployed fleet converges on whatever the automation defaults to.

## The mute and the arbiter outrank the automated caller

Nothing about arriving through the second door promotes a caller above the
user. Concretely:

- **The global mute is absolute over unhosted callers exactly as it is over
  surfaces.** A muted machine is silent, and the caller's request terminates in
  a *muted* outcome it can read — not in a silent success, and not in a queued
  utterance that erupts when mute is lifted an hour later.
- **The arbiter admits unhosted requests at the bottom of the priority order.**
  At-most-one-voice-audible is unchanged; a direct user request outranks an
  automated one; an automated request arriving while the user is being spoken
  to waits or is dropped by the same closed policy set, never mixed in.
- **Rate is bounded per caller.** A hosted surface cannot speak faster than a
  user can press it. An unhosted caller in a retry loop can, and the failure
  mode — a machine monologuing for minutes — is a support incident with no
  in-product stop other than the mute. A per-caller ceiling, enforced where the
  binding lives, is the cheapest available guard.
- **Capture is not symmetric with playback and does not travel through this
  door by default.** Synthesis speaks the product's own text; transcription
  opens the user's microphone. An unhosted caller that can start a capture has
  been handed the most sensitive sensor on the machine, and that is a separate,
  explicit, revocable grant — never a consequence of the speech surface being
  reachable.

## Impersonation raises the stakes, and it is the reason for the rule

When the voice is selected from an engine catalog, unattributed speech is rude.
When the voice is **cloned** — a likeness of a real person, in the sense
[authored-voice-identity](./authored-voice-identity.md) gives the word — the
output *asserts that person said something*, and the listener has no channel
through which to learn otherwise except the one the product raises. Two
consequences:

- The attribution surface names the **voice identity**, not merely that speech
  is happening. "Speaking" is not attribution; naming the voice is, because the
  voice is what the listener will attribute the words to.
- The consent record attached to a cloned voice is scoped by *use*, and
  "spoken by automated callers, unattended" is a different use from "spoken in
  the product by its owner". A clone approved for the second is not thereby
  approved for the first, and the capability to author a voice is not the
  capability to lend it to the second door.

A product that will not clone voices still owes the attribution surface; a
product that will owes it more, and owes the consent scope besides.

## Attribution needs an identity to name, and that identity is not a claim

The surface names the voice, and where the caller supplied an identifier, it
may name the caller too. That identifier is self-asserted and unverified — it
distinguishes callers from one another and does nothing else. Attribution built
on it is honest about the machine ("this request said it was X"), never about
authority. The binding it keys is owned by
[caller-scoped-voice-binding](./caller-scoped-voice-binding.md); the trust
question — whether the second door should admit this caller at all — belongs to
the transport that opened it, and this technique does not answer it.

## When not to use this

- **The only callers are hosted.** No second door, no unattributed audio; the
  existing consent and arbiter rules already cover the surface.
- **The channel produces no audio.** A caller that asks the product to render
  speech into a file it will retrieve later has not made the machine speak, and
  a live indicator for it is theatre. Attribution moves to the artifact and its
  record; the surface rule applies at *playback*, wherever that eventually
  happens.
- **The product is the operating system's own accessibility narrator.** A
  system narrator is attributable by its own existence and would be made
  unusable by a per-utterance disclosure. This technique is for products that
  are not that, which is nearly all of them.
