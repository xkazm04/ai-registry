---
layer: technique
type: technique
subject: voice-io
technique: voice-setup-experience
status: forged
laws: [gate-sees-target, failure-not-empty-success, absent-guard-is-loud, one-authority-per-vocabulary, identity-survives-reuse]
shared_with: []
use_when: [building first-run voice onboarding, a second app needs the same voice setup, choosing what the default voice is, an install that downloads hundreds of MB inside a setup flow, a settings page and an onboarding flow both choose the voice, letting a person pick a speech recognizer, a voice picker stores a numeric speaker id, two apps on one machine install the same local voice engine]
---

# The voice setup experience

The other techniques in this subject cover the parts: the engine interface,
placement, the install states, the compare surface, the shared engine home.
This one covers the first time a person meets all of them together, in the
flow that turns a product with no voice into one that speaks in a voice the
person chose and hears through a recognizer they picked. That flow decides
more than it seems to. Whatever default it offers is what most installations
keep. Whatever it hides is what the person never learns can be changed. If it
fails halfway through a large download, the person concludes that voice
"doesn't work" and does not try again.

The flow is short. It has three parts: **her voice** (engine, install, pick
by ear), **your voice** (one take, every ready recognizer side by side), and
**ready**. Seven rules keep it honest.

## 1. The default is local and private, and cloud is never the silent fallback

First-run setup recommends a **local synthesis engine with one voice that
someone has verified by ear**. It does not recommend the engine that sounds
best in a vendor demo, and it does not recommend the first entry in a list of
fifty voices nobody has heard. The recommendation is a curated decision with
a recorded reason ("light, fast, runs here, chosen in a measured
comparison"). The catalog exposes only voices whose identity has been
confirmed (rule 6). Which engine and which voice fill this slot is an
application decision that will change. That the slot holds *one heard, local
voice* is the rule.

A cloud engine can appear in the same flow, but only **opt-in and labelled**:
its card says in words that text or audio leaves the machine, it asks for its
own credential, and it is never chosen for the person. The labelling rule
binds hardest on the **hearing** side. A recognizer's card states where the
audio goes. "Browser" and "system" are not residency labels, because the
platform may send the audio to a server and the card has then told the person
nothing ([on-device-vs-cloud](./on-device-vs-cloud.md) owns the asymmetry).

When the local engine is absent or broken, the flow stops at that step with
the reason. It never drops to the cloud engine because the cloud engine
happens to be ready. Falling back silently would turn a residency guarantee
into a disclosure event without anyone deciding it
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)).

## 2. Engine, install and pick are one guided flow with a resumable step

Choosing an engine, installing it and picking a voice are **three steps of one
flow**. They are not three settings on three pages. The step pointer is
persisted, so closing the window halfway through a download resumes at that
step and does not restart at "hello". Steps behind the pointer read as done
on resume, because the choices they recorded live in the real settings, not
in the flow's memory.

**Install is a visible state machine.** It is not a spinner. The states are
named and each has its own copy and its own next action:

| State | Shows | Next action |
| --- | --- | --- |
| `idle` | the size in plain units (hundreds of MB is a real cost) | install now |
| `downloading_engine` / `downloading_model` | which half, bytes received, percent when the total is known, an indeterminate bar when it is not | wait; leaving keeps it running |
| `extracting` | that the download is safe and work continues | wait |
| `completed` | the step's line changes to "done" | continue |
| `failed` | the error in one sentence | try again |
| `manual` | links, for platforms where automatic install is not offered | check again |
| `not_needed` | nothing; the step is passed over as done | — |

Three properties make it trustworthy:

- **Success is verified after extraction against the artifact.** The check is
  the engine binary resolving and the model files existing where the probe
  will look, or better, one sample synthesis. "The download finished" is not
  the check ([gate-sees-target](../../../../_laws.md#gate-sees-target)). A
  half-extracted tree reports `failed` with a reason. It never reports
  `completed` ([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).
- **Download addresses are constants in the installing process.** The client
  asks for a *component* ("the synthesis engine", "recognizer model M"). It
  never supplies a URL, because a setup route that fetches whatever address it
  is given is an open fetch proxy with a progress bar.
- **An already-installed engine skips its step.** The flow probes before it
  stops on install. A second app on a machine where the first already
  installed the engine walks past the step and records it as done (rule 7).
  If the probe has not answered yet, the flow waits on the step and leaves it
  automatically when the answer is "installed". It does not guess.

## 3. Compare by ear, and the first sound is a greeting

The person picks a voice by **listening to it**. A sample sentence on a
spec sheet does not do that job. Four rules shape the preview:

- **The first successful preview greets and selects.** The first thing the
  voice ever says is a greeting (time-of-day is enough), and hearing it
  completely selects that voice, because a person who heard one voice and
  liked it should not then have to find a "select" button. Selection happens
  on *completed* playback. A preview that failed or was stopped selects
  nothing.
- **Later previews use one fixed comparison line.** The same sentence in every
  voice, so the voice is the only variable. A greeting that changes with the
  hour is right for the first meeting and wrong for comparison.
- **Previews never overlap.** Starting a preview stops the one in flight, and
  a superseded synthesis that returns late is discarded unplayed (a
  latest-wins generation counter). Two local syntheses also halve each
  other's speed, so overlap is wrong for the processor as well as the ear.
- **Leaving stops playback.** Moving to another step, going back, or closing
  the flow silences the preview mid-sentence and releases its audio.

A local engine that loads its model per call takes seconds before the first
sound. The measured figure is about two and a half to three seconds for a
three-second line on a desktop processor, and about one and a half of those
seconds is the model load. So the preview control has a visible
*synthesizing* state distinct from *playing*. A play button that does nothing
for three seconds gets pressed again.

## 4. Hearing is set up beside speaking

Setup also covers how the product hears. The two pipelines are independent, so
their setup is too: a person can choose a local voice and a cloud recognizer
or the reverse, and each choice has its own step and its own receipt.

The hearing step is **one take, every ready recognizer, side by side**. The
person holds to talk, a live level meter shows the microphone hears them, and
on release each ready recognizer's transcript appears in its own column with
its **latency**, measured from release to text on screen. Then the person
picks. A recognizer that is not ready shows its column muted with the reason
("not installed", "needs a key"), so the comparison doubles as the install
diagnostic. Failure is per column: a refused microphone or a missing model
degrades the comparison to fewer columns, never to nothing.

Leaving the step mid-take closes the microphone. Two flows each holding a mic
open is a consent failure, not a cosmetic one.

## 5. Decisions fold into receipts that reopen their step; settings are the re-entry

Each answered step folds into a **one-line receipt** ("Her voice: Heart",
"I hear you with: local recognizer") with a *change* action that reopens that
step. The receipt is phrased from the **real stored setting**, never from a
copy the flow kept, so a receipt cannot disagree with what the product will
do ([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).
A skipped step leaves a "skipped" receipt, which is also a way back.

After setup, the settings page is the **re-entry to the same flow**, not a
second implementation of it. It shows the current choices with their states,
and it offers "run setup again" or a per-step *change* that opens the same
step. The failure this prevents is concrete. When the onboarding install and
the settings install are written twice, they drift: one gains the `manual`
state, a retry or the verify-after-extract, and the other does not. The person
then gets two different answers about one engine depending on which door they
came through.

## 6. Speaker ids are pinned by a test to the model version

Many local multi-voice engines select a voice by **integer speaker id** into
one model file. The id is only meaningful against the model package it was
read from. A re-packaged model can reorder speakers, and a wrong id does not
fail. It synthesizes a different voice, silently, under the name the person
chose ([identity-survives-reuse](../../../../_laws.md#identity-survives-reuse)).

So the friendly voice id → speaker id table is one record, pinned to the exact
model package the installer downloads, and a test asserts the curated pair
(`heart → 3` in the current application). The installer pins that same package
by name, not "latest". Upgrading the model package is then a change that has
to touch the table and its test.

**The known gap.** Today the table is verified by *convention*: it is checked
by hand against the package's published speaker list. Nothing reads the
order from the model data itself. The test pins the constant, not the truth.
A pin that would close the gap reads the speaker names from the package (or
its manifest) at install or test time and asserts the pair against them.
Until a project ships that, record the source the ids were read from and the
package version beside the table.

## 7. One per-user engine home across apps, with an install lock

Local engines are large: about 430 MB on disk for the synthesis engine and
model in the measured application, plus 75–466 MB per recognizer model. They
install into a **per-user engine home that every consuming app agrees on**,
with an override, never an app-private folder.
[portable-provider-package](./portable-provider-package.md) owns the home's
resolution ladder. What setup adds:

- the probe that decides `not_needed` reads that shared home, so the second
  app's setup finds the first app's install and skips the download;
- installs into the shared home take an **install lock that the other apps
  honour**. A per-process "install already running" guard stops one app
  double-clicking itself. It does not stop two apps writing the same
  directory at once, and a half-written model that both then probe as present
  is the worst state the table above can reach;
- a second install request while one runs is refused with a distinct answer
  ("already installing"), and the flow attaches to the running install's
  progress rather than starting another.

## When not to use this

A product with exactly one voice, nothing to install, and no recognizer choice
has nothing to set up. A settings toggle and the degradation ladder are
enough. The flow pays when there is a download, a choice by ear, or a privacy
decision the person should make knowingly. If any one of those is present,
build the flow; most products that add local voice have all three.
