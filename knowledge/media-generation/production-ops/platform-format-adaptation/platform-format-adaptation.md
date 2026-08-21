---
layer: golden-path
type: golden-path
subject: platform-format-adaptation
status: forged
use_when: [adapting a factual piece to a shorter or vertical format, deriving a clip from a longer parent video, designing a format template for a production pipeline, diagnosing a short that loses viewers in the first seconds]
techniques:
  - format-as-measured-template
  - derived-short-contract
  - hook-shape-selection
  - image-led-vs-narration-led
  - one-anchor-per-clip
  - sound-off-first-design
---

# Platform format adaptation

The same factual craft ships in different containers, and the container is not a
detail. A vertical sixty-second short, a three-minute explainer, and an
eighteen-minute essay are not one video at three lengths — they are three formats,
each with its own physics: an aspect ratio, a duration band, a word budget, a hook
deadline, a closing move, and a retention economy that punishes different mistakes.
Format adaptation is the discipline of moving content between containers without
pretending the container doesn't exist. The naive readings — *compress the long
version*, *crop the wide version*, *cut out the best bit* — all fail the same way:
they carry the shape of the source format into a container that cannot hold it.

## A format is a set of measured parameters, not a vibe

The professional posture is that a format is a **template with numbers behind it**:
a duration band that was measured on real successful work, a word budget expressed
as a range with the reason for the range, a hook deadline in seconds, a canonical
closing move, and a named anti-pattern list. Each number carries its provenance —
measured, observed, inferred, or assumed — and its sample size, because a format
template is exactly the kind of artifact that gets copied forward for years, and an
estimate laundered into it is worse than a gap: the gap is fixable and the estimate
is invisible (format-as-measured-template). Where no measurement exists, the
template says so out loud and refuses to invent one. Unmeasured is not pass.

The physics worth knowing for the dominant short container today: vertical
short-form platforms standardize on a **9:16 frame** (a tall canvas around
1080×1920). Platform UI occludes three regions, not two: a strip along the top, a
deeper block along the bottom (caption and interaction chrome), and a **column of
controls down the right edge** — so load-bearing text and faces live in a centered
middle band, and the practical cross-platform safe area is meaningfully smaller
than the canvas. Platform ceilings for "a short" have meanwhile drifted upward by
an order of magnitude — from around a minute to several minutes, and to tens of
minutes on some platforms — while the work that actually succeeds in the format
still clusters in the tens of seconds. The ceiling is a policy fact; the band is a
craft fact; only the band belongs in a template — and the widening gap between
them makes conflating the two more expensive every year, because both drift, on
different clocks, for different reasons: record each with its own date.

Duration now has a second force on it besides retention: **monetization
thresholds**. Platforms attach revenue eligibility to minimum durations and
distribution penalties to maximums, and those lines rarely coincide with the
measured engagement band — a clip stretched past a revenue threshold can earn
eligibility while bleeding completion. A template records the monetization lines
the way it records the ceiling: as dated policy facts in their own fields, never
silently folded into the band. Whether to author for the band or for the
threshold is a per-piece business decision the template must expose, not resolve.

## Retention is decided in the first seconds, and the curve has shapes

Short-form viewing is a continuous re-decision at near-zero switching cost, and
the distribution of that decision is brutally front-loaded: the large majority of
abandonment happens in the **first three seconds**, and a viewer who survives them
is disproportionately likely to survive to ten and thirty. Practitioners read the
retention curve by shape: a **cliff** (a steep early drop, then flat) means the
hook failed and the body was fine; a mid-video cliff marks a specific broken
moment — a topic switch without a bridge, a pace collapse; a **plateau** held high
with a loop-friendly ending is what the format's distribution machinery rewards.
The diagnostic value is the point: the curve tells you *which* craft element
failed, and the first-seconds region is almost always where the money is.

This is why the hook is not an ornament but the format's admission fee. In the
shortest container, the whole hook is **one sentence, delivered at second zero**
— no branding, no wind-up, no "in this video". There are three opening shapes
that cover the useful space — contradiction, scenario, stake — chosen by a
property of the subject, not by taste; and one shape is banned outright, the
announced fact ("did you know…"), because it signals that a fact is coming and
hands the viewer a clean exit (hook-shape-selection).

## Derivation is authorship, not surgery

Most short-form output in a factual studio is **derived** — scoped from a
mid-length or long parent. The reliable failure here is the **amputated clip**:
a segment cut from the middle of the parent, whose hook is a mid-argument
sentence and whose payoff was established minutes before the cut. It reads as
complete to the person who made it, because they carry the parent's context in
their head, and as noise to everyone else, who don't. The fix is a contract,
not a knife: the derived clip is *re-authored* as a self-contained piece that
answers one real question fully, withholds a **different** question (never the
missing half of the one it just closed), and ends with an explicit pointer to
the parent (derived-short-contract). A viewer who never clicks through has
still received something whole. Derivation done right also runs upstream: a
parent produced with derivation in mind speaks in self-contained passages with
clean entry points, so its clips are found rather than manufactured.

The same authorship rule governs the frame. Carrying a wide composition into a
tall container by center-cropping loses whatever lived at the edges — hands,
charts, second subjects. A vertical derivation is a **reframe**: the subject is
re-composed for the tall canvas, punched in tighter than wide-format instinct
allows, with data-bearing elements re-laid rather than cropped through.

## One container, one idea, one anchor

The shortest formats cannot afford a second mental model. A clip carries **one
idea on one anchor** — a single concrete object or metaphor established in the
first two seconds and never replaced. This is stricter than "one topic": a good
short can demonstrate five variations, but they are five rungs on one ladder,
each linked to the last by *but* or *therefore*, all played out on the same
object. Introducing a second metaphor mid-clip is the most expensive mistake
the format offers, because the viewer must rebuild their model with no runtime
to spare (one-anchor-per-clip). The close is format-specific too: where a long
piece earns a reframe, the shortest container ends on a single beat that buys
memorability — often a joke — and even that beat still carries information.

## Rate belongs to the visual plan, not to taste

Inside one short format, measured narration rates spread by **2×** between two
delivery modes. In an **image-led** clip the pictures make the argument and the
narration only labels them, at a slow rate that lets each image land; in a
**narration-led** clip the words carry everything and the visuals follow, at
roughly double the pace. Both are correct; guessing wrong by 2× is the
difference between a clip that breathes and one nobody can follow. The mode is
therefore not a pacing preference but a *derivable property* of how much of the
argument the visuals carry — and the script stage, which cannot yet know the
final visual density, must emit its word budget as a **range** and hand the
declared mode downstream rather than committing to a number it cannot defend
(image-led-vs-narration-led).

## The default viewer is silent

The feed's default viewing condition is **sound off** — across published
measurements a large majority of short-form viewing starts muted, with the sound
turned on only after the clip has already earned attention. So audio is an
enhancement layer, not the delivery layer: the hook must land as *read* text in
the safe band at second zero, captions are a designed, load-bearing text surface
rather than an accessibility afterthought, and any beat whose argument lives only
in the narration is a beat most viewers never receive. Because captions are text a
viewer checks word-for-word, they are drawn deterministically and composited —
never left to a generative model's typography. The image-led/narration-led sound-off
test ("could a viewer with the sound off follow the argument?") is the same
physics read from the other side: here it is not a diagnostic but the design
starting point (sound-off-first-design).

## The failure modes of the naive reading

- **Compression as adaptation** — shrinking a long script proportionally, which
  preserves the long format's structure (slow open, layered questions, reframe
  close) inside a container whose viewers left during the wind-up.
- **The crop as adaptation** — same content, same composition, sliced to 9:16;
  edges gone, text under platform UI, wide-format pacing at vertical attention.
- **The amputated clip** — see above; the single most common derived-short
  defect, and invisible to its author by construction.
- **The ceiling as the target** — writing to the platform's maximum allowed
  duration instead of the measured band where the format's successful work
  lives.
- **Unmeasured parameters shipped as authority** — a template that states a
  word budget or duration nobody measured, which downstream tooling will then
  enforce as if it were knowledge.
- **Rate by taste** — choosing narration pace before the visual plan exists,
  then discovering the clip is 2× too dense or too thin at the edit.

Adaptation, done properly, is the same craft every time: know the container's
measured physics, author for it natively, and let every parameter you publish
carry the evidence it stands on.
