---
source: youtube:wi-Pj3OUWiM
kind: practitioner build-walkthrough (tour-dominant; seven numbered steps, one sponsor segment)
url: https://www.youtube.com/watch?v=wi-Pj3OUWiM
title: This Video Edited Itself (Claude Code + Codex + ElevenLabs)
author: Coding Crash Courses
words: 496
extracted: 11
accepted: 1
declined: 0
leads: 2
already_covered: 8
untriaged: 1
dispatched: 0
applied: 0
shipped: 0
run_id: intake-1004-wipj
siblings: 0
---

# The proudest segment named the wrong unit, and the vendor's own reference said so

A 496-word, 3:01 produced piece — **the thinnest source this skill has mined**
(previous floor 1,565 words) — narrating a fully generated video pipeline:
script in sections, cloned voice, timing from returned timestamps, code-rendered
visuals, a second vendor's agent as an illustrator, generated music, automated
upload.

## Class, and the expected yield said before the table

**Practitioner build-walkthrough**, tour-dominant. Six of its seven steps are
feature demo; the operating half is about six sentences. Expected yield declared
at Phase 2: *mostly catches, one or two leads, at most one technique* — and, by
this class's own rule, the boundary would be missing wherever the creator was
proudest. It was. Step three is introduced as "the clever part", and it is the
one claim in the source that is factually wrong.

Container check: 496 words over a 3:01 runtime is an honest count, not a decode
failure. No repository, so Phases 2b–2d do not apply (`routing=n/a`,
`directions=n/a`). 0 siblings live on the board.

## The one landing

**`alignment-names-its-text`** — new technique in
`media-generation/production-ops/video-assembly`, plus
`process--alignment-names-its-text`.

The source says: *"Every word comes back with a timestamp, so the video doesn't
guess when I say something, it knows."* The corpus already owns that claim, and
owns it better: `derived-turn-markers` has a whole section on the word-timed
transcript, including *"the stat card fires when its figure is spoken, wherever
that moment now is."* So the headline claim was a **catch**.

The landing came from two things the source got wrong, both confirmed against
the vendor's own reference in-run:

1. **The unit is not the word.** The timestamped synthesis contract returns
   **per-character** start/end times. "Word timings" is a grouping the consumer
   computes — so the grouping rule (does the trailing space belong to the word?
   is a hyphenated name one anchor or three?) is a decision the source's framing
   hides entirely.
2. **There is not one alignment, there are two.** The response carries
   `alignment` (indexed to the authored text) *and* `normalized_alignment`
   (indexed to the text the engine actually spoke). Normalisation is on by
   default and is a rewrite: the vendor's own example reads `$1,000,000` as "one
   million dollars" — ten characters becoming twenty. The two arrays therefore
   agree up to the first expanded token and nowhere after it.

The resulting defect is nastier than a simple mistake because of where it
points. Its error is zero at the head and grows in **steps at the expanding
tokens** — which is close enough to the profile `drift-correction` names as
*rate mismatch* ("clean at the head, a hundred-plus milliseconds out by the
tail") that the documented remedy there, conform the rate at the source, is a
correct diagnosis of the wrong system. And a script with no numbers, currency or
dates normalises to itself, so both alignments are identical and the pipeline
that picked the wrong one passes every test it has: `derived-turn-markers`' own
**coincidence trap**, moved down to the index.

**The second engine family is what made the application worth writing.** A
word-boundary event stream reports word/punctuation/sentence granularity and
offsets into the *input* text only — one index space, chosen for you. So the
risk is **asymmetric by engine family**, and a pipeline ported from the
word-boundary family to the character-alignment family silently converts a
decision the engine was making correctly into a decision nobody is making. A
boolean "supports word timing" capability probe reports parity across that gap.

### Corroboration and the seam that is missing

Authorized by a primary fetched in-run (V2 satisfied), not by the source: 3 of 3
fetches spent, all on vendor API references, two of them correcting the source
rather than confirming it. This is the method's preferred case — *a source that
implements a good idea badly is worth more than one that implements it well* —
and the corrected premise is the reusable half.

**No fleet seam exists, and the search was negative with a positive control.**
Two projects declare `media-generation`. The closer one has a music-cue plan and
is already structurally correct at its own granularity — its scene times are
copied verbatim from the project's scene record, and its own code comment names
the defect it fixed ("a literal somebody typed next to a literal somebody else
typed on the timeline, free to disagree with it forever"), which is this
technique's parent principle at scene granularity. But its voice lane is not
synthesised at all: the vendor is wired for **music only**. So the technique
lands `unapplied` rather than taking a simulation — three *real* cases do not
exist for the index-space claim, and inventing two would be the anti-pattern.

## Phase 6b was considered and ruled out, with the argument

`production-ops/video-assembly` is explicitly inside the render-bound scope, so
this is recorded rather than skipped. The phase does not fire here because **the
arms do not differ in generation**: the audio is byte-identical under both, and
the only difference is which array a cue's time is read from. The observable is
a signed offset in seconds, not an appearance — so the operator's blind "is it
better" pick, which Phase 6b reserves for findings whose only observable is the
output, has nothing to discriminate that arithmetic cannot. Recorded as a
judgment with its reasoning, not as an exemption.

## Already covered (8)

| # | Source claim | Owned by |
| --- | --- | --- |
| 1 | Cues fire from returned word timings | `video-assembly/derived-turn-markers` — states it, plus the consumer family and the coincidence trap |
| 2 | Music "gets quieter whenever I talk" | `video-assembly/music-spotting-against-picture` — "the voice lane always wins; music under narration ducks by a fixed..." |
| 3 | One command, script in / video out | `live-system-demo-film/retake-without-an-edit-session` |
| 4 | "This video is code" — re-render on data change | `live-system-demo-film/script-as-single-source`, `summary-rendered-from-the-run` |
| 5 | Script sections carry IDs (`hook`, `pipeline`) | `script-as-single-source`; `game-dialogue-voice-pipeline/line-id-catalog-and-revision-diff` |
| 6 | A second vendor's agent attached as an MCP illustrator | `llm-agent/runtime-and-io/agent-cli-transport` (9 techniques, codex-cli among its stacks); `mcp-tools/first-party-agent-is-a-principal` |
| 7 | Human gate: "making sure nothing is made up" | `review-iteration-loops/follow-up-that-can-kill-a-fact`, `hitl-approval`, law `never-invent-proof` |
| 8 | Voice cloned once, reused per section | `voice-io/authored-voice-identity`, `creator-voice-and-tone/voice-profile-from-accepted-work` |

The source's one measured datum — **three hours of editing for three minutes of
video** — is a first-party n=1 figure that corroborates the premise
`live-system-demo-film` is built on ("an editing session is the cost this subject
exists to abolish"). Recorded here as corroboration; it needs no landing.

## Leads (2)

- **A boolean capability cannot express an index-space contract.**
  `voice-io/engine-abstraction` (software-engineering) models "word-level
  timestamps" as one of the axes a caller branches on. Verified by reading it:
  the axis is boolean, and it cannot distinguish *returns two index spaces,
  consumer chooses* from *returns one, engine chose*. A capability probe
  therefore reports parity exactly where the migration risk lives. Cross-bundle,
  so stated here as a discriminator rather than linked.
  **Return:** when a second independent source draws the same distinction, or a
  fleet project puts two engine families behind one voice abstraction.
- **One credential, several destinations is not the single-seat lane.** The
  source's most reliable sentence is its only stated pain — *"the hardest part
  of the whole project? Convincing Google which of my two channels I meant."*
  `mcp-tools/ambient-selection-is-not-an-argument` obligation 3 already names the
  failure class ("several items are selected, and this operation takes one" is
  a typed refusal, not a default), but its `use_when` is scoped to single-seat
  interactive applications, where **exclusivity** is the force holding the
  invariant. A credential whose scope is broader than its intended target has no
  exclusivity story at all. The source gives one sentence, no mechanism and no
  resolution, so it cannot authorize the boundary.
  **Return:** when a source describes the resolution mechanism, or a fleet
  project publishes to one of several destinations under one credential.

## Untriaged (1)

| Claim | Anchor | Why untriaged |
| --- | --- | --- |
| Title, description with chapters, tags and thumbnail all generated at upload | `[00:02:34]` "Claude writes the title, the description with chapters and the tags, renders this thumbnail" | Mapped to `marketing/on-page-and-metadata-craft` and `marketing/grounded-marketing-generation`; neither opened. The source carries no mechanism — one sentence of tour — so its impact reads `none`, which is why this run's declared focus (a neighbour read on every `partial` row whose impact is `new-technique`) did not bind it. Nobody verified this; it is not declined. |

## This run's declared focus, and whether it moved

Focus inherited from the 2026-10-02 (yoagent) row: *before Phase 9, spend one
neighbour read on every `partial` row whose impact is `new-technique`.*

**Applied, and it is what produced the landing.** Three rows came up `partial`
and all three got their read: the word-timing row (read `derived-turn-markers`
in full → catch, and the provenance clause inside it became the accepted
technique), the capability row (read `engine-abstraction` → lead), and the
publishing row (read `ambient-selection-is-not-an-argument` in full → lead). The
one row left untriaged is untriaged because its impact is `none`, not because its
blocker was a read away. Zero rows banked with a read-sized blocker, against
four in the run that set the focus.
