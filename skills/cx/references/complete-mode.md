# Complete mode - walking an unfinished product to its ending

Loaded by `/cx complete` before its map, and by any run whose next stop is a seam or graded
`absent` (see SKILL.md, **Modes**). Everything here overrides only what it names; every other phase
runs as SKILL.md writes it.

The default walk polishes what exists. `complete` mode is for the majority state of real products,
which is *unfinished*: the map is the **path to the product's final output**, the handoffs between
screens are stops, and a stop that is absent is designed and built rather than deferred.

## The two units it adds

- **A SEAM is a stop too.** A seam is the handoff between two consecutive stops: what step A
  produced and step B is supposed to consume. It has no screenshot, because the failure is not on
  either screen - it is that B never reads A's output and the user's work silently stops
  travelling. Read a seam by following the DATA, not the pixels: name the payload, the writer, the
  reader, and which of the three is missing. A product can have every screen built and still be
  broken end to end; the seams are where that hides, and no screen-by-screen walk will find it.
- **Every stop carries a state grade**, set when the map is built and re-checked when the stop is
  walked:

  | grade | means | what the stop does |
  |---|---|---|
  | `built` | exists and does its job | read and polish - the ordinary walk |
  | `thin` | exists, but a fraction of its siblings | ask what is missing before proposing polish |
  | `fixture` | renders convincing data it did not compute | honesty first: what would make it real |
  | `absent` | does not exist | design it, and build it |

  Grade from evidence a reader can recheck - file and line counts against sibling surfaces, which
  fixtures a screen imports, whether anything downstream reads what it writes - never from
  impression. Recheckable is necessary and **not sufficient**: the evidence must answer *does this
  step do its job*. "A reader exists" and "28 files exist" are real evidence about the wrong
  question, and both have graded a broken step `built`. The gradient across a journey is itself a
  finding: state it in the map.

**A grade set from the map is a hypothesis; a grade set from walking the stop is a measurement.**
A stop may regrade its neighbours. The correction is made visible on the journey line - the old
grade, the new one, the stop that found it and the evidence - never silently edited (SKILL.md,
Phase 7).

## Phase 2 - the map

Build it in this order, and do the measuring before the drawing:

1. **Name the final output first** - the artefact the user leaves with, in their words ("a cut they
   would show someone", "a filed return", "a booked trip"). Everything else is judged by whether it
   carries the work toward that. If the product cannot yet produce it, THE ENDING is stop one of the
   backlog, not a footnote.
2. **Grade every existing stop** from recheckable evidence, and put the grade in the line. The
   gradient is usually the story: a front half at `built` and a back half at `fixture` is a product
   that was demoed, not finished.
3. **Insert the seams** between consecutive stops and grade each one too. For every seam, follow
   the data: does B read what A wrote? Name the payload and the reader. A seam nobody reads is
   `absent` however good both screens look.
4. **Absent stops get a line like any other**, with `✗` for their grade and a one-line statement of
   what the user gets instead today (an empty screen, a fixture, a dead end, nothing at all).

Present the map with the grades visible and say plainly how much of the path is real. Then take the
user's answer as usual. **Ask where to start after grading, not before**: the user picks, and
starting at the break rather than at the front is often the right call, because polish upstream of a
severed seam is spent twice.

Seam lines are written `[ ] S<n> · J<k>.<i> · seam <a>→<b> · <the payload that should cross>`.

## Phase 3 - arriving where there is nothing to photograph

A seam or an `absent` stop has nothing to photograph, and that is the finding. Capture what the
user meets *instead* - the screen that shows a fixture, the dead end, the step that starts empty -
into `<id>-before.png`, and say in one line what a working stop would have shown there. For a seam,
capture BOTH screens it fails to connect (`<id>-before-a.png` / `-before-b.png`): the two side by
side are the evidence that the user's work stopped travelling. Then read the data path in code and
name the payload, its writer, its reader, and which of the three is missing.

## Phase 4 - the read of an absent stop or a seam

There is no screen to run heuristics against, so the read has a different shape:

- (a) **the design** - what this stop should be, in five lines, and what it must carry from upstream
  and hand downstream;
- (b) **the smallest thing that proves the chain** - the end-to-end path real data would take,
  which is what gets built first;
- (c) **the proposals**, graded as always, but now they are the pieces of that build.

Heuristics still apply and are still named - `the payload crosses`, `honesty`, `orientation` -
because a new surface obeys the same list as an old one. What is forbidden is designing the whole
feature: the stop builds the path to the final output and stops there.

## Phases 6-7 - building, and what building reveals

- **Expect a stop to yield a new blocking stop upstream of itself.** The deepest findings have
  come from an executor trying to make a seam work end to end - invisible to a read of either
  screen and of the seam. Phase 7's "did this stop change the map?" exists for this.
- **A built `absent` stop gets a second round.** The first read of an unbuilt screen is only a
  spec; the real read is taken of the built thing.

## The one inverted rule

In the default modes a stop that needs a new capability records it as `deferred - new feature` and
moves on, because the job is the experience of what exists. `complete` mode inverts exactly this one
rule and nothing else: the product is unfinished, the absent stops ARE the work, and deferring them
would defer the whole point. Everything else holds - the heuristics, the user's expectation
outranking the read, the gates, one commit per stop. A `complete` run that starts inventing
capability nobody asked for has stopped being this skill; the map is the contract, and a capability
that is not on the path to the product's stated final output is still `deferred - new feature`.
