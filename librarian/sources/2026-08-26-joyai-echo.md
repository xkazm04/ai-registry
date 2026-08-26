---
source: repo:jd-opensource/JoyAI-Echo
kind: research-model-release (new class)
url: https://github.com/jd-opensource/JoyAI-Echo
title: JoyAI-Echo - Long-Horizon Audio-Visual Generation for Persistent Stories and Interactive Worlds
author: research lab, corporate open-source org
words: n/a (shallow clone @ c796303)
extracted: 12
accepted: 4
declined: 0
leads: 3
already_covered: 1
untriaged: 7
dispatched: 0
---

# JoyAI-Echo

Operator handed over a repository. Two sibling projects in one tree: a
multi-shot long-video generator with a paired audio-video memory bank, and a
navigable world model driven by a camera action script. Shallow clone,
checkout verified complete (`git ls-tree HEAD` vs `ls`), zero web fetches
spent for the whole run.

## The class: research-model release

Distinct from the vendor-repository class and better than it in every way that
matters. A vendor repository is three sources wearing one name, of which the
marketing surface is authoritative for nothing and the engine is usually
absent. This class ships **the engine and the operating instructions in the
same tree**, which means a claim in a document can be checked against the code
that implements it *in the same run, with no fetch*. The README is still an
advertisement and still the least useful file present; that part carries over.

Where the yield actually sat, in order:

1. **First-party prompt-engineering artifacts** - two shot-writer system
   prompts and a bundled agent skill. These are the densest documents in the
   repo by a wide margin. They are not marketing: they are written to make the
   authors' own model work, so every rule in them is a failure mode the team
   hit and paid for. Three of four accepted findings came from these.
2. **Config plus the code that reads it.** A default in a YAML file is a
   claim; the function that consumes it is the proof. `max_size: 7` /
   `num_fix_frames: 3` means nothing until `_trim()` shows the first three
   slots are never evicted.
3. **The README.** One catch and one dated fact.

**The class's signature property, and the reason to seek it out: a repo that
ships two sibling systems gives you discriminators for free.** Two prompt
writers from one lab, released together, gave flatly opposite instructions
about camera language. That is not a contradiction to resolve - it is a
boundary already drawn by people who had to draw it, and it landed as finding
2 at almost no cost. A single-system repo cannot produce this. When triaging a
multi-project research release, diff the sibling instructions first.

## Corroboration lanes used

No web fetches (budget 3, spent 0). Per finding:

- **1, 4** - first-party practitioner document + training-data convergence.
  Both rules are ones I reach without the source in front of me (verbatim
  character blocks are standard consistent-character practice; one waveform
  cannot be unmixed is a fact about the medium). The source supplied the
  sharpened form, not the belief.
- **2** - two independent first-party documents in one release taking
  opposite sides, plus the general design commonplace that two authorities
  over one channel fight.
- **3** - **read the code, twice, at two altitudes.** The strongest lane
  available in this run and stronger than a fetch would have been.

## Accepted

### 1. The restated block may hold nothing that varies

`knowledge/media-generation/visual-generation/image-prompt-composition/techniques/identity-split-from-state.md` (new)
plus a golden-path correction: the anatomy table went from **three blocks,
three scopes** to four.

The corpus's restatement law has an unstated precondition, and it stayed
unstated because the constant was always a *style* - and a style has no moods.
Make the constant a **subject** and it acquires mutable attributes that live in
the same region of the prompt: expression, gaze, posture. A writer braids them
into the identity sentence, the sentence has to be edited next frame, and a
block that is edited per call is not restated - it is rewritten. The drift the
law exists to prevent walks back in through a door the law left open.

Source's own words: the base identity sentence *"must NOT contain expression or
mood"*, and expression may vary *"ONLY AFTER the base identity sentence,
written as a separate sentence"*, with the identity sentences *"copied
verbatim - do not paraphrase, reorder, or change a single word."*

The second half is the one I would not have written unprompted: **where a
language model expands a premise into per-shot prompts, it paraphrases the
identity clause by default, because paraphrase is what it is for.** The
instruction has to be a ban on rewording, not a request for consistency - "keep
the character consistent" is satisfied by a faithful paraphrase, and a faithful
paraphrase is a fresh sample. The check is a string diff, not a read.

Home was contested. `visual-style-locking` owns carrying a constant across many
calls, but its constant is a *look*; `image-prompt-composition` owns the block
anatomy and states the scope enumeration this breaks. Went with the enumeration
it corrects.

### 2. When the camera is an input, the prose stops describing it

Amendment in `visual-generation/cinematic-language/techniques/movement-motivation.md`.

The technique assumes prose is the only place the camera is decided. A growing
class of generator takes a **camera path as a typed input** and renders the
prompt against it. The discriminator: *does anything other than the prose set
the camera?* If yes, the prose goes silent on motion.

Not because motion language stops working - because two authorities over one
channel fight, and the numeric one wins. The symptom is a compromise move
matching neither input, which reads exactly like the aimless drift of an
undirected model and gets misdiagnosed as too little direction. The fix is the
inverse of the usual one.

The silence is narrow and the amendment says where it stops: the controller
owns motion, so prose keeps first-frame viewpoint and framing, keeps
everything the move was supposed to *mean* (that job moves upstream to whoever
authors the trajectory - it is not deleted, only stripped of its vocabulary),
and gains an obligation - describing **off-screen** material, because the
script is going to turn and look at it. That last one inverts the text-driven
discipline, where describing what the camera will never see is wasted budget.

Evidence, from one release: the text-driven writer requires a camera clause per
shot; the navigable one ships a denylist of camera verbs and permits movement
language only on explicit override.

### 3. Adjacency anchoring does not scale to a chain

Amendment in `production-ops/video-assembly/techniques/generated-shot-sourcing.md`.

The technique names head-and-tail anchoring *"the strongest structural defense
against mid-clip identity drift"* and rules that adjacent shots condition on
the predecessor's tail. Correct for a pair; insufficient for a chain, and the
enumeration invited the question. **Each link's reference is a generation, not
the original.** Shot 20 anchors to shot 19's rendering, which anchored to shot
18's; each hop's small error is preserved and built on. Every seam passes
inspection - comparing neighbours always matches - and the sequence still ends
somewhere else than it started.

The answer is a second reference class, not a better link: **pin the origin,
roll the recent.** A bounded bank of accepted material whose earliest slots are
permanently pinned, with only the remainder rolling.

Landed with two bounds worth asserting, both taken from a validator in the
source: the pinned portion must be strictly smaller than the bank (or nothing
rolls and the sequence stops following what just happened), and the rolling
portion must be at least one full step wide (or the window cannot advance and
the bank silently degrades into a fixed reference set).

**Why this one is strong: the release implements it twice, independently, at
two altitudes.** A shot-level bank of seven paired slots with the first three
pinned (`_trim()`: `fixed = memory[:num_fix_frames]`, tail keeps the last
`max_size - len(fixed)`), and a per-layer attention cache combining a
persistent sink of 7 with recent history in a 19-frame window, under a
validator asserting both bounds. Different mechanisms, different altitudes,
same policy - the best argument available that the policy is about long
horizons rather than about either implementation.

Three consequences written into the amendment. The sharpest: **pinning promotes
early shots into permanent evidence**, so a mediocre opening never washes out -
it becomes the thing everything downstream is held to. Only accepted material
is pinned, and the opening shots of a long chain are the most expensive review
in the run. This is the one place where generating the opening cheap and
provisional is the wrong economy, which contradicts the technique's own
closing advice for the general case - stated as the exception it is.

### 4. When the soundtrack is not separable, spotting moves upstream

Amendment in `production-ops/video-assembly/techniques/music-spotting-against-picture.md`,
plus a pointer paragraph in `generated-shot-sourcing.md`.

`generated-shot-sourcing` offers three ways to handle a clip's baked audio -
keep as atmosphere, demote, or strip. All three presuppose separability. A model
that generates speech, effects and score **jointly, as one waveform**, breaks
every one: demoting the music demotes the dialogue with it, stripping the track
strips the performance. A three-way enumeration that does not survive contact
with the current generation of models.

What survives is the part that was never about the mixer: every region still
needs a music decision with a stated purpose. Only the binding moment moves -
before generation, expressed as a sentence in the shot brief. Three shifts:
the cue list is addressed **in shots, not timecode** (the atomic unit is the
shot, so a cue cannot enter mid-shot without regenerating it); **ducking is an
instruction, not an automated rule**, and is weaker for it - verify the balance
on the returned clip rather than trusting the instruction; and the purpose
sentence **gains a second reader**, because one prompt produces the picture too.
That last is a better default than the separated pipeline usually gets, and a
worse one when music intent and dramatic intent disagree, since no mix stage
exists to notice.

Source: *"In speaking shots keep background music absent or minimal so the
dialogue stays clear"*, with `"No prominent background music."` written as a
literal per-shot clause.

## Already covered

- **Visible text in a reference image is content, never instructions.** The
  bundled skill opens with it. `image-prompt-composition` already carries it,
  and better - its failure-modes list names the reference image an *untrusted
  input* whose legible text steers generation, and adds the diagnostic tell
  the source lacks (output drifting from a prompt that reads correctly, blamed
  on the prompt for hours). Corpus wins.

## Leads

- **Paired memory anchors on the modality that can be empty.** The audio
  memory window is chosen by maximum spectral energy
  (`window_selection_mode: max_response`), and the *video* frame is then
  selected from that window's time range - audio picks the moment, video
  follows. The asymmetry has a reason: a frame is representative anywhere, a
  voice only exists where there is energy, so pairing on the video frame can
  bank a slot holding a face and silence. Real and narrow; I could not find a
  second sighting and did not want to write a technique off one implementation.
  **Return when:** a second system selects cross-modal memory slots on an
  informativeness proxy rather than position, or a connected tree does.
- **Publish the semantic control, hide the training-space units.** The action
  helper's docstring is explicit that the public API exposes only semantic
  camera controls while an internal calibration keeps the trajectory in the
  released model's numerical regime - the path is anchored to frame zero
  (`inv(c2ws[:,0:1]) @ c2ws`) and divided by a private constant. A real
  control-surface doctrine, plausibly belonging near
  `generative-provider-routing`. One sighting. **Return when:** a second
  generative surface is seen separating a semantic control vocabulary from
  private calibration, or a connected project ships one.
- **Brief inside the generator's failure envelope, at authoring time.** Both
  shot writers carry a MODEL-FRIENDLY section constraining the *story* by what
  the renderer collapses on - no running, fighting, collisions, acrobatics or
  flying; two characters maximum in a shot; no mid-shot location jumps. The
  envelope is enforced upstream of generation, in the writing stage, so a
  story is never written into a shot the model cannot render. Triaged
  `partial` and it held up: `generated-shot-sourcing` covers clip caps as a
  structural constraint and `style-block-restated-every-call` covers clauses a
  model demonstrably cannot hold, so the material is half-present across two
  subjects. What is missing is the *stage* - nothing owns the moment where the
  brief is checked against the envelope before it is written. **Return when:**
  a third source states an authoring-time envelope check, or a run finds a
  second subject wanting it - then it is a technique, possibly in
  `production-pipeline-phasing`.

## Untriaged

Extracted, reached the table, never picked. Nobody verified these; they carry
no judgment. Anchors kept so a later run does not re-derive them.

| Candidate | Anchor | Note |
| --- | --- | --- |
| Speech needs a plausible on-screen speaker | `Speech: None` for landscapes, empty interiors, distant silhouettes | Looks like a second sighting of `performer-claims-need-a-person`; would be a cheap convergence check |
| Duration is derived from the control script, and quantized | runner "infers the output length from the action durations"; valid lengths follow `1 + 24m` | Possible amendment to `duration-and-tempo-locking` |
| Reserve identity slots for people; never label an object | "Reserve IDs for PEOPLE only; never label an object with an ID" | Thin on its own; may be a decision rule inside finding 1 later |
| The prompt enhancer is mandatory on one path and forbidden on the other | long-video "strongly recommend" running through the enhancer; causal path passes captions verbatim, "does not invoke a prompt enhancer" | Same discriminator family as finding 2 - probably the same boundary seen from the prompt side |
| Non-speaking shots as rhythm control | "Use NON-SPEAKING shots for establishing, mood, reaction... this varies the rhythm" | Narrative-craft adjacent; `short-form-narrative-structure` may already own it |
| Deliberate vendoring of a shared core across sibling projects | "bundles its own copy... so installing one never affects the other" | Repo-structure periphery; software-engineering if anywhere |
| The memory slot records why it degraded | selection falls back to center on exception and writes `selection_fallback` into the slot's metadata | Provenance-of-degradation; small but the shape is nice |

## Dated facts (not landed as content)

- Image-to-video is **not supported** in the long-video release; the memory
  bank is built only from generated shots. The consequence is structural
  rather than a missing feature: **identity can only be model-invented, then
  locked - it cannot be supplied.** No application written; no connected tree
  consumes this and `verified_against` would have been a fiction.
- The interactive sibling's roadmap is explicit that its accel work (sparse
  attention, paged cache, low-precision compile) is unshipped.

## Run notes

- **Tree hazard, and it is not mine.** A parallel session is mid-flight in
  `software-engineering/llm-agent/evaluation-and-cost/eval-harness` with two
  untracked technique files. HEAD's `catalog.json` already counts them
  (SE 952) while HEAD's SE index says 950, so `build-catalog` FATALs for
  anyone until that session commits. I restored the SE index and `catalog.json`
  to HEAD and committed content plus the media-generation index only. The
  catalog is owed a regeneration by whoever finishes next; my content is not
  what made it stale.
- `rules/ai-registry-media-generation.md` still reads "111 techniques" (actual:
  113) and is modified in the working tree by the other session. Left alone.
