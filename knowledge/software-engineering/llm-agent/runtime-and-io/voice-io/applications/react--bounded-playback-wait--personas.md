---
layer: application
type: application
subject: voice-io
technique: bounded-playback-wait
stack: react
status: forged
verified_on: 2026-10-14
verified_against: react@19.2.6
applied: experiment
ab_verdict: not-better
proof: ab-paired
---

# A desktop companion whose playback runs inside a browser engine

The tree is the desktop application personas, read at commit `89f31de41a`; its
interface is a web view, and the witness for the stack is the interface package.s
framework dependency, `package.json:175 "react"` at 19.2.6. The companion speaks replies sentence by sentence, and one
helper plays every clip: `src/features/companions/athena/voicePlayback.ts:41 "Play an audio URL through a transient"`
media element, and resolves when the clip finishes. Ten callers use it, and the chat
reply queue waits on it before playing the next sentence. That queue is the
technique's case: a wait that is the contract.

## The seam, chosen to falsify

The technique was written from a tool that talks to the audio device directly. This
seam was chosen because the device is two layers away here, behind a browser media
engine, and because the element can be paused by the operating system's media
controls. A caught outcome would teach that the technique does not transfer to a
mediated, pausable channel, which would change what the technique says. It did.

## What the engine does with a missing device and a pause

The engine the web view embeds was driven headless on this machine with a one-second
generated clip, five launches:

| Launch | End event fired at |
| --- | --- |
| default output, twice | 1,470 ms and 1,115 ms |
| audio output disabled (substitute sink) | 1,258 ms |
| audio muted | 1,204 ms |
| paused for 2,000 ms at 300 ms, then resumed | 3,181 ms |

With no real output the engine still ended the clip on time, so the device half of
the technique, the half that hung the source tool, is already bounded by the engine
here; there is no device stall for the product to guard against. And a pause stretched
the clip's end by the length of the pause. The literal port of the technique, a
deadline at the clip's length plus a grace on the wall clock, would have rejected a
clip that was paused and then finished normally whenever the pause outlasted the
grace.

## What the tree already does about pause

The helper settles its promise on the end event and on an error, and on a pause it
only unsubscribes the live volume,
`src/features/companions/athena/voicePlayback.ts:65 "audio.addEventListener('pause', () => unsubVolume(), { once: true });"`.
A paused clip is a suspension that a resume can finish, which is the right reading of
pause. The chat queue knows the wait does not settle on a pause and retires itself by a
generation counter instead of a timeout,
`src/features/companions/athena/chat/athenaChatVoice.ts:80 "never settles for a paused clip,"`.
That is the technique's amended rule, already in the tree: a pause nobody resumes is a
lifecycle state retired by identity, not a timeout. One reader of the same helper
believes otherwise: the read-aloud button's comment says a stop makes the wait fail,
`src/features/companions/athena/BubbleReadAloud.tsx:79 "Playback aborted (user clicked Stop, or browser rejected mid-"`,
when a stop pauses and the wait simply never returns. Its stop handler resets the
state itself, so nothing breaks; the comment is wrong about the helper it calls.

## Verdict

`not-better` for adding a playback deadline to this helper: the engine already
bounds the device, and a wall-clock deadline would break the pause the tree handles
correctly. The target (waits that hang on a device fault) was zero in arm A on every
launch; the floor (a paused clip that resumes still completes) would have fallen in
the literal-port arm. The technique gained the two conditions this seam showed: count
stall on the playback position where a channel can pause, and measure whether a
mediated engine has already bounded the device before adding a watchdog.

## What this realization cannot do

The launches used the engine headless with generated audio, not the packaged
application on a machine whose headset disconnects mid-reply; a device change on the
real web view was not exercised. The comment in the read-aloud button was left as it
is: this run changed no code in the tree.
