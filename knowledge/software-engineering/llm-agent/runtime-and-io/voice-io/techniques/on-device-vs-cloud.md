---
layer: technique
type: technique
subject: voice-io
technique: on-device-vs-cloud
status: forged
laws: [gate-sees-target, failure-not-empty-success]
shared_with: []
use_when: [deciding whether voice runs on-device or in the cloud, voice falls back to cloud without asking, settings say the model is ready but it fails, checking whether an open-weights engine's license permits shipping its output]
---

# On-device versus cloud

Every voice engine runs somewhere, and "where" is the highest-stakes
decision in the subject — usually framed as a quality/latency tradeoff and
actually, for the input direction, a **privacy decision about the most
sensitive sensor the product touches**. This technique owns the decision
framework, the states it creates (a local model is a thing that can be
absent, downloading, or corrupt), and the boundary with provisioning
mechanics. It does not own binaries or downloads — acquiring and supervising
local engine processes and model files is the sidecar-provisioning subject's
job; this technique decides *what should run where and what happens until it
can*.

## The two directions do not get the same default

The asymmetry from the golden path becomes policy here:

- **Capture/transcription default: on-device.** Raw microphone audio is the
  user's voice in the user's room — content of unbounded sensitivity,
  including speech never addressed to the product. Audio that never leaves
  the machine is a privacy property that no consent dialog, retention
  policy, or vendor agreement can match, because it removes the trust
  question instead of answering it. Cloud transcription is a legitimate
  *opt-in* — disclosed in plain words ("audio will be sent to a server"),
  chosen affirmatively, revocable in one step, and visibly active while in
  use.
- **Synthesis default: either, honestly.** Synthesis input is text the
  product already holds; sending it to a synthesis service adds exposure
  only when the text itself is sensitive — which is a property of the
  *content stream* being narrated, not of synthesis. The coherent-looking
  "inconsistency" of transcribing on-device while synthesizing in the cloud
  is in fact the correct reading of the asymmetry. One care: narrating
  private content through a cloud voice quietly exports that content;
  residency policy follows the sensitivity of what is spoken, not the
  direction of the pipeline.

Cloud engines mean credentials, and credentials mean the
[credential-vault](../../../../security/credential-vault/credential-vault.md) discipline:
keys held in the vault, attached at the engine adapter's egress, never
present in surface code or logs.

## The decision matrix

Seven axes decide placement per direction, and writing them down turns a vibe
into a review:

| Axis | On-device | Cloud |
| --- | --- | --- |
| **Residency / privacy** | audio and text stay local — the decisive axis for capture | data leaves; consent and disclosure become mandatory features |
| **Latency shape** | no network; floor set by local compute — steady but hardware-dependent | network round-trip on every call; variance follows the connection |
| **Quality ceiling** | fixed at the shipped model until re-provisioned | tracks the provider's frontier without shipping anything |
| **Cost shape** | one-time footprint (download, disk, memory while resident) | per-use metering that scales with adoption — success raises the bill |
| **Offline** | works in the airplane row and the locked-down network | absent exactly when connectivity is |
| **Footprint** | model weights are large; download, disk, and RAM are real UX costs | near-zero install cost |
| **Rights** | the weights' license governs what you may do with the *output*, and it is the one axis that can forbid shipping outright | the provider's terms are a contract already accepted at signup; output rights are usually granted and the exposure question moves to residency |

**The rights axis is not a trade-off, and that is why it is listed last and
checked first.** The other six are quantities to balance; this one is a gate.
An engine can win every other row — top of the open-weights leaderboards,
lowest time-to-first-audio, runs on hardware you already own — and still be
unusable, because its license permits research and evaluation and forbids
shipping the audio, or forbids distilling a smaller model from it, or both.
Nothing about the model's behaviour reveals this; it is the one placement
input that no probe can establish.

It also **inverts the matrix's central asymmetry**, which is the reason it
was missed. Residency is the axis on-device wins by construction: nothing
leaves the machine, so no consent, disclosure or vendor agreement is needed.
Rights is the axis on-device can lose by construction, and for the same
reason it wins the first — a hosted engine comes with terms accepted at
signup, and open weights on your own disk come with a license nobody was
forced to read. The most private placement available can be the one you are
least permitted to ship, and the two facts are not in tension: privacy is
about what leaves, rights are about what you may do with what stays.

Three consequences for how the axis is evaluated:

- **Read it per use, not per engine.** Evaluating, shipping the generated
  audio, and training or distilling from the outputs are three separate
  permissions, and a single license routinely grants the first while denying
  the other two. A placement record that says "licensed: yes" has recorded
  nothing.
- **It binds hardest on the direction that produces an artifact.** Synthesis
  emits something the product ships to its users; transcription emits text
  *about* the user's own speech. So the output-rights question is decisive on
  the synthesis side and close to vacuous on the capture side — the mirror of
  the residency asymmetry, which is decisive on capture and mild on synthesis.
  A product that evaluates both directions against one license has answered
  the wrong question on one of them.
- **Store the license and the version it was read at, beside the placement
  decision.** [engine-abstraction](./engine-abstraction.md) already names
  re-licensing as a cause of engine *retirement*, which is this axis arriving
  too late to help. Licensing is the placement input most likely to change
  with no technical signal whatsoever — the weights on disk are byte-identical
  before and after — so it is also the input the review trigger below cannot
  detect by probing, and must therefore carry as recorded state.

The matrix is evaluated **per direction, per installation** — not once per
product. A powerful desktop and a low-end laptop resolve the same policy
differently, which is why placement is expressed as a *preference chain*
(the [engine-abstraction](./engine-abstraction.md) fallback chain), not a
constant.

## A local model is a state machine, not a file

Choosing on-device creates states that cloud engines never have, and each is
a designed UX state: **absent** (never provisioned — the voice feature
advertises what a download would cost, in plain units, before starting),
**provisioning** (download/install in flight — progress visible, cancel
available, the feature honestly "not yet" rather than broken),
**ready**, and **corrupt/incompatible** (present but failing verification —
offer re-provisioning, never silently re-download on a loop). The
transitions are the provisioning subject's mechanics; the *states and their
copy* are this subject's obligation, because the user meets them inside the
voice feature.

Readiness is probed against the artifact, not the bookkeeping
([gate-sees-target](../../../../_laws.md#gate-sees-target)): "the settings record
says the model was downloaded" is a proxy, and it diverges from the truth
exactly when the disk was cleaned, the file moved, or the download was
truncated — the moments the check exists for. The gate that flips a voice
feature to available verifies the model file's presence and integrity, or
better, a sample invocation of the engine. The same law applies to the
cloud side: a stored "credential configured" flag is not a reachable,
authenticated service; probe the target, cache the result briefly, and mark
it stale on failure.

## The degradation ladder is the architecture

Placement policy is expressed as a ladder the product can walk at runtime,
per direction, with each rung a designed state:

1. preferred placement, ready → use it;
2. preferred placement not ready (model absent / service unreachable) →
   next rung in the chain, **visibly** — including the consent boundary:
   falling from on-device to cloud is never automatic, because it silently
   converts a residency guarantee into a disclosure event. That rung is
   crossed by stored user consent or an in-the-moment ask, never by
   fallback logic alone;
3. no engine ready → the direction's terminal degradation (text visible,
   typing accepted) with the one-sentence explanation and next step.

Distinguishing rung 2's two causes is the
[failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)
obligation again: "not installed" and "installed but failing" lead to
different user actions (provision versus repair), and a ladder that
collapses them strands the user at the exact moment they were willing to
fix things.

## Re-evaluate placement when the ground shifts

The matrix's inputs drift: hardware upgrades, a better small model ships,
the provider reprices, the user's privacy posture changes. Placement is
therefore configuration with a *review trigger*, not a constant: surface a
gentle prompt when the ground shifts materially (a newly available local
engine that would remove a cloud dependency is the canonical one). What the
product must never do is *silently* re-place a direction — moving the user's
audio from local to remote without their hand on the switch is the single
most trust-destroying move available to a voice feature, however good the
new engine is.
