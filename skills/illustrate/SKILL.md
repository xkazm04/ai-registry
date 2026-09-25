---
name: illustrate
description: "Take an existing web component that explains a concept with conventional web design (a card grid, a bulleted feature list, a static diagram, decorative art) and give it an illustration layer that carries the claim: read what the section is trying to prove, think divergently about how to abstract it graphically, then prototype three directional illustration variants inside the component behind a tab switcher, with the original kept as the default tab. Use when a landing, marketing, onboarding or how-it-works section explains something in words that a picture or a short animation could prove, or when its current art is decorative. Not for dense data dashboards (layout variants) or single icons (use an icon/asset skill)."
category: workflow
memory: project
version: 1.2.0
tags: illustration, explainer, landing, prototype, variants, motion, design
argument-hint: "<component path | page route | --survey> [--variants 3]"
---

# Illustrate - give a concept section an illustration layer that proves its claim

Most explanatory web sections are built from the same few parts: a heading, three
cards, an icon per card, a gradient blob. Nothing is wrong with them, and they prove
nothing. The heading makes a claim, and the art would look the same if the claim were
false. This skill replaces that layer. It reads the section as an **argument**,
decides what picture or short animation would **evidence** it, prototypes three
genuinely different ways to do that inside the real component, and leaves all three
switchable behind tabs until the owner picks one.

Say the two rules once per run: **an illustration either carries the claim or it is
furniture, and furniture is rationed.** And: **picture and words are one argument;
a reader who has never seen the product must get it from the two together, in five
seconds.**

The skill is a specialization of directional variant prototyping. It differs in
what it varies (the *abstraction* of a concept, not the layout of data) and in what
it checks (whether each variant evidences the claim and survives being seen as a
still).

## Picture and words, balanced

The goal is a section a first-time reader **understands in five seconds**. The
picture shows the product doing the thing, and the words tell the reader what they
are looking at. Neither side carries the claim alone. The skill has failed both
ways, and both failures are the reason for the rules below:

- **Too many words (run 1).** Every variant said the claim in sentences inside the
  picture: 92 and 131 words, with 16-19 word runs. The owner kept the abstract
  original.
- **Too few words and too little picture (run 3, under 1.1's 30-word, 6-word-run
  budget).** In the owner's words: "huge illustrations representing very little,
  cutting all text, leading into no idea what is meant." Art filled a whole screen
  with five marks and two generic words ("Goal", "Shipped", "Everything", "$0").
  Metaphors like a puzzle, a balance scale or a mended bowl would fit any product in
  the category. Product-true mockups were skeleton bars with nothing real on them.

What the accepted illustrations share (memory "run 1 vs run 12", the AI-model router,
the nested vault): **one specific mechanism**, drawn at a size that fits its
content (23-33% empty); **every word a product noun or state** (Haiku, Sonnet, Opus,
Ollama, Run 1, Run 12, OS keychain, AES-256-GCM); labels at 14-19px; and a heading
and lede that state the claim in plain words.

### The balance, which the capture instrument checks

| | Rule | Flag |
| --- | --- | --- |
| Section copy | a heading that states the claim plus a lede of **1-2 plain sentences** saying what the reader is looking at and what they get. It is not shortened to make room for the art | TEXT-THIN below 14 words in the whole section |
| Words in the art | **labels and a short key**: name every part the reader must identify, with real product nouns, states and values. At most **40** words, runs of at most **8** (a label or a beat caption, never a sentence), text on at most **10%** of the art | TEXT-HEAVY |
| Word quality | each label names something **specific**. "Goal", "Done", "Everything", "Input" and "$0" alone are not labels; they are placeholders. Replace them with the real noun (the goal's name, the state the app shows, what the $0 buys) | reviewer check |
| Size | the art is **sized to its content, not to the space available**. A picture with five marks is small. Leftover space goes to whitespace or to the key, never to scaling the art up. At most about 45% of the art may be empty | SPARSE |
| Legibility | labels render at **12px or more** on desktop (10px on a phone). If a label would fall below that at the slot's size, the art has too many parts or is scaled wrong | TINY-LABELS |
| Numbers | only as labels on a shape (a count on a bar, a time on a dial), never in prose, never a metric-shaped number without a source | reviewer check |

### Three tests every candidate and every variant must pass

- **The mute test** (hide every word): the structure still reads from shape,
  position, colour, grouping and motion. If it does not, the illustration is a text
  layout.
- **The cold-read test** (hide nothing, know nothing): someone who has never seen the
  product looks at a still of the section for five seconds and says, specifically,
  what the product does here and what the reader would get. "Something about goals"
  fails. In Phase 7 a fresh reviewer runs it on the screenshot alone (see there).
- **The competitor-swap test**: put the picture on a competitor's page. If it still
  fits unchanged, it is generic and says nothing about this product. A puzzle, a
  scale, a staircase or a bowl fails unless its parts carry this product's real
  nouns and behaviour.

What this means per family:

- **Product-true** shows **real content in reduced quantity**: three real rows with
  their real names and states, not six skeleton bars. Structure, colours and motion
  are the app's own. Cut quantity, never meaning. A skeleton screen communicates
  "a screen", which the reader already assumed.
- **Mechanism and transformation** show change through position and motion, with a
  short caption per beat (at most 8 words) naming what happens at that beat.
- **Metaphors** earn their place only with the competitor-swap test: every part the
  reader must name is labelled with the product's real noun. An unlabelled or
  generic metaphor is decoration.
- **Real nouns** appear as words when the word is the information (a model, a
  connector, a state), and as icons or colours when the shape is.

## When to use / when not

Use it for sections whose job is to explain: how-it-works, feature explainers, "why
us", onboarding steps, pricing logic, architecture overviews, a hero that states what
the product does.

Do not use it for:
- dense data surfaces where the variant question is layout (tables, dashboards);
- a single icon, logo or empty-state glyph (an asset skill does that better);
- copy problems. If the claim itself is unclear, the fix is words first. Say so and
  stop.

## Project overlay

Reads `.claude/illustrate/config.md` in the consuming repo when present. Every key
has a default, and the skill runs without the file.

| key | meaning | default |
| --- | --- | --- |
| `design_doc` | the design-system document to read before drawing | first of `.claude/design.md`, `.claude/Design.md`, `DESIGN.md`, `docs/design*.md` |
| `tokens` | files that define colour, type, radius, motion tokens | discovered from the design doc and `globals.css` / theme files |
| `source_app` | a product whose real UI the illustrations should mirror ("app style"), as a path or URL, with the files that define its visual language | none: the web project's own style is the reference |
| `motion_lib` | the animation engine the project already ships, and its reduced-motion resolver | discovered from imports; prefer the project's own SSR-safe preference hook |
| `switcher` | an existing tab/segmented component to host the variant tabs | `${CLAUDE_SKILL_DIR}/references/switcher-template.tsx`, adapted to the project's tokens |
| `switcher_visibility` | `always` (tabs rendered for every visitor on the prototype branch) or `query` (tabs only with `?illustrate=1`) | `always` |
| `variants` | how many variants per section | `3` |
| `dev_url` | how to reach a running dev server | `http://localhost:3000` |
| `gates` | commands that must pass before a round is shown | `typecheck` + `lint` scripts from `package.json` |
| `worktree_root` | where prototype worktrees go (keep it short) | `.claude/worktrees/` |

## Phase 0 - Coordinate, and never prototype in a shared checkout

1. `git status --short` in the target repo. If a merge, rebase or cherry-pick is in
   progress, or files you will touch are modified by someone else, **do not work in
   that checkout**. Prototyping is multi-file by definition.
2. Create a worktree from the project's active branch:
   `git worktree add <worktree_root>/illustrate-<slug> -b illustrate/<slug>`.
   Keep the path short. Install dependencies there if the project needs it.
3. Read the knowledge sync section below: this skill proposes changes, so it reads
   the governing standard before proposing them.

## Phase 1 - Resolve what actually renders

The named file is a hint. Grep for its JSX usages and imports. A name with zero
usages is a library file: follow imports from the route entry point to the component
that renders. For a page route, list the sections it composes in order and treat each
as a candidate.

With `--survey`, score every section of the page (Phase 2's brief, abbreviated) and
propose which ones to illustrate, ranked by **illustration debt**: a high-value claim
carried by decorative art. Pick at most three sections per run. A page where every
section changes at once cannot be judged.

## Phase 2 - Read the section as an argument (the illustration brief)

Write a short brief per section before any creative work. It is the input every
variant is judged against.

- **The claim**, in one sentence, in the reader's terms. "Agents hand work to each
  other without you wiring every step." If you cannot write it, stop: the section
  has a copy problem.
- **The five-second answer**: the sentence a cold reader should be able to say back
  after five seconds with the section (it is what Phase 7's cold-read test checks).
  It names this product's specifics: "It routes each task to Haiku, Sonnet or Opus by
  weight, and keeps private ones on Ollama locally", not "it picks the right model".
- **The facts the picture must show**: at least three product-specific facts, each
  verified in the source app (a real state name, a real noun, a real limit, a real
  order of steps). These are what make the picture fail the competitor-swap test.
- **The evidence the reader needs.** What would convince a sceptic? The real screen?
  A before/after? The mechanism running? A number?
- **Process or state?** Does the claim describe a *process* (order, overlap, waiting,
  hand-off) or a *state* (what you get, what it looks like)? A process needs motion or
  a sequence of stills. A state needs a faithful picture.
- **The real artifact.** Which screen, record, message or output of the product does
  the claim refer to? With `source_app`, open that app's files and note its real
  visual language: surfaces, type scale, the shape of its cards, its signature
  controls. That is what "app style" means here: the illustration shows the product
  as it looks, reduced but not falsified.
- **Audit of the current art**, with three tests:
  - *would it change?* If the claim were false, would the picture be different?
  - *swap test*: move this art to the neighbouring section. Does anything read wrong?
  - *caption test*: write one line saying what the reader should notice. Does it only
    repeat the heading?
  Classify every graphic element as informative or decorative.
- **Degraded paths, observed.** Screenshot the section with reduced motion emulated
  and as a still frame before any interaction. Record blank areas, content stuck at
  opacity 0, loops that ignore the preference. A section that is already broken under
  reduced motion is fixed in the baseline first, separately, and that fix is reported
  as a finding.

## Phase 3 - The creative layer: diverge, then choose three directions

This is the phase the skill exists for. Do it in writing, before code.

**Diverge.** Generate six to eight candidate abstractions for the claim, at least one
from each family in
[`references/abstraction-ladder.md`](references/abstraction-ladder.md):

1. **Product-true** - a faithful reduced mockup of the real artifact in the app's own
   style, animated only where the product itself moves.
2. **Mechanism** - the process drawn as a diagram with a time axis or a short beat
   list: who hands what to whom, in what order.
3. **Transformation** - before/after, input to output, messy to structured.
4. **Spatial metaphor** - the concept mapped onto space: a map, a hub, layers, a
   pipeline, a workbench.
5. **Physical metaphor** - an object the reader already understands (a switchboard, a
   relay team, a loom) carrying the structure of the claim.
6. **Data-as-art** - the product's real data shape rendered as the illustration: a
   timeline of actual event types, a graph of real connector names.

For each candidate write: the claim it carries, what the reader notices first, what
it would cost, and **what it would teach that is false** (a metaphor always implies
more than the product does).

**Score** each candidate 0-3 on: carries the claim (the three tests), **structure
(does it pass the mute test?)**, **specificity (does it fail the competitor-swap
test - i.e. could only this product show it?)**, **cold read (would a stranger say
the five-second answer back?)**, fidelity (does it promise anything the product does
not do?), distinctness from the page's other sections, legibility as a still, and
cost. Discard anything that scores 0 on structure (its idea lives in its words: a
copy change), 0 on specificity (it is decoration), 0 on cold read, or 0 on fidelity.
The fidelity rule has no exceptions: a picture of a capability the product lacks
turns the page into a liability.

**Choose three directions that differ in abstraction strategy, not in styling.** The
default triad is **one mechanism or transformation, one product-true (real content,
reduced) and one spatial or data-as-art** direction. A **physical metaphor** enters
the triad only when it scored 3 on specificity - its parts carry this product's
nouns and behaviour; the generic metaphors (a puzzle, a scale, a staircase, a bowl)
were the weakest variants in every round they entered. Name each variant after its
central idea ("Live console", "Relay", "Switchboard"), and give each one sentence on
why it is not the other two. Two variants that differ only in palette or layout are
one variant. Replace one.

## Phase 4 - Specify each variant before building it

One short spec per variant, handed to the builder as-is:

- claim carried, and the five-second answer a reader should say back;
- central idea, carried through layout, shape language, motion and copy voice;
- **the section copy**: the heading (usually the current one) and a lede of 1-2 plain
  sentences that tell a stranger what the picture shows and what they get. Written
  out in full; it is part of the variant, not left over from the current section;
- **the label plan**: every word that will appear inside the art, written out, each
  attached to the element it names, within the budget above. Every part a reader
  must identify has a label; every label is a specific product noun, state or value
  (no bare "Goal", "Done", "Everything"). A spec without a label plan is not
  finished; this is where both text creep and text starvation are stopped cheaply;
- **the visual structure** in one sentence: what a reader sees in the first second
  (an exploded stack, a ring of ports, a track with marks), what the mute test
  leaves readable, and which of the brief's product facts each part shows;
- **the size plan**: the art's natural size for its content (how many elements, how
  much room each needs at a 12px-or-larger label), its aspect ratio, and its maximum
  size. The art never scales past what its content needs to fill a larger slot;
  leftover space stays empty or holds the key;
- **informative vs decorative inventory**. Informative elements use real product
  nouns (as icons, colours, counts and short labels) and plausible, obviously-sample
  values. Never a metric-shaped number without a
  source. Decorative elements are `aria-hidden`, carry no text, and one signature
  flourish at most;
- **motion plan**. Label each moving element *reveal* (its last frame says
  everything) or *mechanism* (its trajectory is the point). Mechanism motion is written
  as a short beat list (numbered states with captions) played as a function of time,
  and gets step controls or a filmstrip still. Motion is limited to transform and
  opacity, plays at most once when visible, and never loops without a pause control;
- **degraded forms**: what renders with reduced motion (the resolved end state for
  reveals; one frame with a time axis, a filmstrip, or the path with direction marks
  for mechanisms), with no script, and as a thumbnail;
- tokens and shared primitives it will use. Nothing hand-rolled that the design
  system already has;
- extractable pieces: named sub-components the rest of the app could reuse.

## Phase 5 - Scaffold the switcher

Keep the component's exported name and props. Consumers must not change.

1. Move the current body into `<Name>Current` in the same file (or a sibling).
2. Create sibling files `<Name>.<variant-slug>.tsx` (or the project's naming
   convention) for the three variants, all taking the same props.
3. The exported `<Name>` renders a small, labelled tab strip (Current plus three, each
   with a one-line subtitle naming its central idea) and the active variant. It uses
   the project's own segmented or tab component when one exists. Otherwise it adapts
   the template.
4. **Current is the default tab.** Loading the page changes nothing until someone
   clicks. The selection is kept in the query (`?illustrate=<section>:<variant>`, one
   parameter for every switcher on the page) so a variant can be linked in review, and
   it is keyboard-operable with arrow keys.
5. Give the section root `data-illustrate="<section-slug>"` and each tab
   `data-illustrate-tab="<variant-key>"`. The capture instrument uses those.
6. Under `switcher_visibility: query`, the strip renders only with `?illustrate=1`;
   the variants are still reachable by link.

## Phase 6 - Build the three variants in parallel

Dispatch one builder per variant (an agent, if the harness has one), all in the same
worktree, each writing only its own variant file(s). Each builder receives: the brief,
its spec, the design doc and tokens, the switcher contract (props, file name), and one
existing polished section of the same project as the quality reference. Builders run
no git commands. The director owns the switcher file and every commit.

Builder rules, stated in the brief. Tell builders to **verify every product noun
against the source app and override the brief when it is wrong**; a brief written from
a survey guesses at details the app states exactly.

Builder rules:

- **Picture and words together.** Build the spec's section copy and label plan
  exactly; stay inside the balance above. Mark the illustration root
  `data-illustrate-art`. Product-true art shows real content in reduced quantity,
  not skeleton bars. If a part cannot be understood without a sentence, report it
  rather than write the sentence; if a label would be generic ("Goal", "Done"), find
  the real noun in the source app.
- **Size to content, not to the slot.** Render the art at the spec's size plan, even
  when the container offers more room. A layout system that hands the art a large
  slot (a full-screen stage, a hero column) sets the art's **maximum**, never its
  size; centre the art and leave the rest empty. Labels render at 12px or more on
  desktop at the slot's smallest size.
- Semantic tokens only. No raw palette values where a token exists, no raw
  white/black overlays where the project defines surface tokens.
- Real text stays real text: headings, labels and captions inside the illustration
  are translatable DOM or SVG text, carried by the project's i18n if it has one.
- Server-render the resting state. Nothing that must be seen starts at opacity 0 in
  the served markup. The hidden start state, if any, is armed on the client after
  mount, and never under reduced motion.
- No layout shift: the illustration reserves its box (aspect ratio or fixed height)
  before assets or script arrive.
- Performance: transform/opacity animation only. Filters and noise textures on
  static layers only. No new dependency without saying why in the report.

## Phase 7 - Verify, then show all three at once

1. Run the project's gates in the worktree.
2. Start the dev server from the worktree and run the capture instrument:

   ```sh
   node ${CLAUDE_SKILL_DIR}/scripts/capture-variants.mjs --url <dev_url>/<route> \
     --section <section-slug> --tabs current,<a>,<b>,<c> --out <run-dir>
   ```

   It clicks each tab, captures desktop and phone widths with motion allowed and
   with reduced motion emulated (a section the layout hides at a width is recorded as
   hidden, not failed), flags **blank captures** (a near-uniform frame is a
   finding, not a harness error), counts infinite animations under reduced motion,
   flags **text-heavy art** (words, longest run and text area inside
   `data-illustrate-art`, against the budget; without the marker it measures the
   whole section and says so), flags the **floor side of the balance** - SPARSE art
   (share of empty cells in the art), TINY-LABELS (smallest rendered label) and
   TEXT-THIN (words in the whole section) -
   and writes `contact.html` beside the images. It resolves the browser automation
   library from the consuming project and has no dependencies of its own.
3. **Cold-read test.** For every variant, give a **fresh reviewer** - an agent with no
   brief, no spec and no knowledge of the product (a new subagent that can read
   images), or a person who has not seen the work - only the desktop capture of the
   section, and ask: "In one or two sentences: what does this product do, according to
   this section, and what would you get from it? Name anything you could not tell."
   Compare the answer with the brief's five-second answer. A vague answer ("something
   about goals"), a wrong one, or a list of unreadable parts fails the variant. Put
   each reviewer answer, verbatim, in the contact sheet beside its capture; the owner
   reads what a stranger took away before choosing.
4. Self-audit each variant against its spec before the owner sees it: the claim
   tests, **the mute, cold-read and competitor-swap tests**, the balance flags, the
   brief's product facts all visible, token grep, no text baked into art,
   reduced-motion capture not blank, no infinite animation under reduced motion. A
   variant that fails is fixed first. The owner chooses between directions, never
   between a working variant and a broken one.
5. Present: the contact sheet with the cold-read answers, one line per variant
   (central idea, what the reader notices, what it costs), your recommendation with
   its reason, and the tab links. Commit the round on the worktree branch with a
   pathspec. Never push.

## Phase 8 - Consolidate when the owner picks

Owners often pick parts of two variants. Treat that as a new spec, not a merge of
files. On a final pick: delete the losing variant files and the switcher, render the
winner directly, keep its extractable sub-components where the project keeps shared
components, run the gates, capture once more, and merge the branch with the
project's merge convention. A section left with a live switcher after a decision is
debt. Record the decision in the overlay's run log.

**Removing a worktree deletes through links.** If a skill was linked into the
worktree (a symlink or, on Windows, a junction into the registry checkout), a
recursive or forced worktree removal follows the link and empties the linked source.
It happened on the first run and emptied this skill's own directory. Unlink first
(remove the link itself, never with a recursive flag), confirm the source still
exists, then remove the worktree, without `--force` if you can.

## Anti-patterns

- **Explaining in the picture.** Sentences, descriptions and sample prose inside the
  art. The illustration shows, labels name, and the section heading claims.
- **Cutting words until the meaning goes.** A section a stranger cannot read back is
  worse than a wordy one. Labels name specific things; the lede says what the picture
  shows. Fewer words is not the goal; fewer *unnecessary* words is.
- **Filling the slot.** Scaling a five-element picture to a full screen because the
  layout offered the space. Size follows content.
- **Generic pictures.** A puzzle, a scale, a staircase, a bowl, skeleton bars in a
  window frame: anything that would fit a competitor's page unchanged.
- **A director's brief that dictates size or silence.** "Art at least 60% of the
  width", "fill the slot", "shorten the lede" in a brief override the balance above
  for every builder at once. State the section's constraints (slot, fit), never a
  target size or a word ceiling below the method's.
- **Three stylings of one idea.** Palette and layout are not directions.
- **Art that promises what the product does not do.** Fidelity 0 is disqualifying.
- **Decoration upgraded to more decoration.** A nicer gradient is still furniture.
- **Mechanism motion that cannot be stopped, stepped or seen as a still.**
- **A variant that is blank under reduced motion**, or starts at opacity 0 in the
  served markup.
- **Prototyping in a checkout another session is using**, or pushing a prototype
  branch.
- **Changing the component's props or its consumers** to fit a variant.

<!-- clause: knowledge-sync v1 - stamped by scripts/apply-skill-clauses.mjs from docs/skill-clauses/knowledge-sync.md; edit the template, then re-stamp -->
## Knowledge sync

This skill proposes and executes backlog items. Every item it proposes is judged against the standard this repo subscribes to, so a run moves the codebase toward the registry's golden paths and sends back what it learned - not toward a private notion of "better" that the next skill will undo.

**Subscription** - read once at the start of the run; degrade honestly, never invent a standard:
- `.ai/manifest.yaml` -> `registry.local` (default `../ai-registry`; `$AI_REGISTRY_DIR` wins) and `knowledge.domains` (the bundles this repo consumes - `software-engineering` for code, plus whatever else it declares). No registry declared -> skip this section and say `registry: none` in the run header.
- `.ai/registry-map.json` - the join between this repo's contexts and the bundle's subjects, with a per-pair state (`unknown` / `conformant` / `deviation` / `not-applicable`) that `/conform` fills in over time. Missing while `context-map.json` exists -> build it once, `node <registry>/scripts/build-registry-map.mjs --project <slug>`, and commit it: the map is the repo's subscription to the paths, and it is how a path improved for another project reaches this one. Missing both -> resolve through `<registry>/knowledge/<domain>/index.json` and say `registry: declared, unmapped`.
- The always-on rules `.claude/rules/ai-registry-*.md` carry the subject map. They orient; they do not replace the read below.

**Read before you propose.** For each context in scope, take its subjects from the map and read the golden path (`subjects[<slug>].file`, verbatim from the index - never a path built from a slug; bundles are nested) plus the techniques whose `use_when` matches what you are about to decide. Then every backlog item you emit names the technique it serves or violates - `standard: <subject>/<technique>` - or `standard: none` when nothing governs it. A pair the map already marks `deviation` is a pre-approved item with its fix described; a pair marked `conformant` is a regression guard on anything you change there. A deviation is a finding: never lower the standard to fit the code, and never present a technique's number as a rule - the technique carries the rule, the application carries the measurement.

**Log the read** - one line per context, append-only, gitignored, to `.ai/consults.jsonl`: `{"ts":"<ISO>","bundle":"<domain>","subjects":["<slug>"],"techniques":["<slug>"],"deviations":<n>}`, where `deviations` counts the items this run raised that a technique explicitly names. Bare slugs, never paths. The registry's `signals-collect.mjs` folds these into `signals/` as counts only; it is the only way the corpus learns which paths are load-bearing and which are decoration.

**Send back what a LANDED fix taught.** When a change you made and verified generalizes past this repo - a rule that would transplant to an unrelated team, a case where a technique's rule broke against real code, or a place this repo does it BETTER than the golden path - append one line to `.ai/registry-leads.jsonl`: `{"ts":"<ISO>","bundle":"<domain>","nearest":"<subject-slug or null>","kind":"technique|application|subject","claim":"<when X, do Y, because Z - one sentence>","because":"<what this run measured or broke and fixed>","confidence":"low|medium|high","from":"illustrate@<version>"}`. Earned only: it came from code you changed, not from a fix you proposed. A lead ORIGINATES a finding and never authorizes one - nothing here edits a bundle; the registry's `leads-collect.mjs` -> `librarian/inbox.md` -> `/intake` decides what survives. Say in the report that you filed one, and say plainly when you filed none. Verdicts on a pair's state belong to `/conform`: close by naming the contexts you touched so it can re-judge them.
<!-- /clause: knowledge-sync -->

<!-- clause: skill-reflection v5 - stamped by scripts/apply-skill-clauses.mjs from docs/skill-clauses/skill-reflection.md; edit the template, then re-stamp -->
## Skill Reflection

After the work, record only useful observations supported by this run. No lesson is
a valid result. Reflection inherits the task's authorization; it grants no additional
permission to edit another repository, send data, commit, or publish.

**Run log.** Unlike a lesson, this is written on every run that started work - failed and
aborted runs included; skip read-only info modes and runs cancelled before any work. Append
ONE line to `.ai/skill-runs.local.jsonl` at the root of the checkout you worked in: local,
gitignored run output inside the task's own repository, never a write into the registry.
The registry pulls it later (`/librarian skills` on the same machine). When a registry
checkout is reachable (`registry.local` in `.ai/manifest.yaml`), prefer its writer, which
stamps project, device and version for you:

```sh
node <registry>/scripts/log-run.mjs --skill illustrate --outcome <o> --difficulty <1-5> \
  --provider <claude|openai|xai|qwen|google|other> --model <your model id> [--effort <level>] \
  [--tokens-est <n>] --result "<one sentence>" --comment "<self-reflection>"
```

Otherwise write the line yourself: `{"ts":"<ISO, UTC Z>","skill":"illustrate","outcome":…,
"difficulty":…,"provider":…,"model":…,"effort":…|null,"tokensEst":…|null,"result":…,"comment":…}`.

- `outcome`: `shipped` (the goal landed) / `partial` / `no-op` (ran correctly, nothing to
  do) / `parked` (designed or staged, deliberately not landed) / `failed` / `aborted`.
- `difficulty` rates the task as this run met it: 1 trivial - mechanical; 2 routine - the
  method as written; 3 demanding - real judgment calls or one detour; 4 hard - dead ends,
  rework or an operator course-correction; 5 at the edge - partial or failed on the merits.
- `model`/`effort` as your harness states them (`null` effort when you cannot see it).
  `tokensEst` is the drop in the harness's remaining-token counter since this skill was
  invoked, or `null`; exact figures are measured later from transcripts - never guess one.
- `result` is one line (max 240 chars). `comment` (max 2000) is the self-reflection a
  reviewer reads: what worked, what the method made harder, where its instructions were
  wrong, missing or ignored. No filesystem paths or email addresses.
- Never read run logs during a run. They are evidence ABOUT this skill for its reviewer;
  an executor that reads its own diagnosis contaminates the next measurement.

**Project learning.** Only when this run produced an observation that would change how a
future run behaves. A run that went as the method describes writes nothing: an entry that
restates the procedure, records "no issues", or repeats the task is a defect, not a
deliverable. When there is such an observation and local edits are within scope, put one
dated line in the overlay this skill's `## Project overlay` section names, under
`## Skill improvement log`. **Write only into an overlay that already exists.** If the
project has none, put the observation in the response instead - creating a new tracked
file for a reflection is scope the task did not ask for, and a reader who never asked for
the skill has to review it. If the overlay is a structured config (YAML, TOML, JSON),
record the note as comments so the file keeps parsing, or use the response.
Use a supplied memory contract only when its destination and writes are authorized.
Keep project details out of the shared method.

**Method learning.** Identify the installation before editing anything. A local
`.ai/registry-installation.local.json` receipt can identify development versus release,
the registry revision, and selected skill versions. Verify any link's actual target;
do not assume a skill directory is a writable registry link.

- For a pinned release, marketplace cache, ordinary copy, or unknown installation,
  keep a proposal in the project overlay or response. Do not edit the installed method
  or silently relink it. Adoption and rollback are explicit installation operations.
- For a development link, edit the registry only when that checkout is already within
  the accepted task scope. Otherwise report a proposal. Authorized changes belong in
  the source checkout, followed by its gates; commit only when the task authorizes it.
- Record an actual lesson in `LESSONS.md` against the version **used**:
  `## <version-used> - <YYYY-MM-DD> - <project-name>` and concise bullets. A proposal
  must be labeled as such; structural checks are not evidence of field effectiveness.
- Applied skill changes require a version bump: patch for wording, minor for a step
  refinement, major for method redesign. A lesson alone needs no bump. Shared stamped
  clauses are edited in the registry's `docs/skill-clauses/` and regenerated with
  `scripts/apply-skill-clauses.mjs`, never patched in individual installed skills.

**Domain learning.** Follow `## Knowledge sync` when present, within the same scope
and privacy boundaries. A method lesson and a domain knowledge lead are different
artifacts; do not fabricate either to fill a reflection quota.
<!-- /clause: skill-reflection -->
