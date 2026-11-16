---
subject: conversation-orchestration
domain: software-engineering
last_touched: 2026-11-16
touched_by: deepen
dry_streak: 2
---

# conversation-orchestration

The third companion subject. It covers what a long turn says while it runs, what
the turn leaves in the record, the memory the turn discloses, the next moves it
proposes, the shape of its answer, and which of the two surfaces carries what.
The librarian has never swept it. The domain ledger's companion table listed it as
"not swept" with 3 stale deviations from personas. Its applications had already
been re-read once, on 2026-09-29, by a pass that left no subject note.

## 2026-11-16 - /deepen loop (run `filler-deepen-20261116e`, /shift filler, first deepen with a subject note)

Round 1 landed, and rounds 2 and 3 were dry. `dry_streak: 2`, so the subject is
saturated. No application is expired or at risk, so it idles until an event (a
personas or kp change at one of the cited seams) or until the derived clocks run
out.

**Golden-path flip: a mid-turn addition is delivered into the running turn, not
only queued.**
- The old rule had two outcomes: a redirect interrupts, and an addition queues and
  drains in order. Two vendor runtimes now have a third, and they make it the
  default where it exists. The message is read inside the same turn at the next
  boundary, after the tool call or output item in progress, and it becomes the
  next turn only if the turn ends first.
- Sources: an agent SDK reference (priority `next`, with no field set, is read
  "in the same turn, as soon as the tool calls it is running finish"), and a
  second vendor's mid-turn steering guide (acceptance "means the input is queued,
  not that the model has acted on it"; steering "does not rewrite output already
  sent … or cancel tools that have already started").
- The same SDK reference says an interrupt leaves already-queued messages to run
  afterwards, and that resending one "delivers it to Claude twice".
- The blind lane reached "steer" before any search, so this converges. It landed
  as a golden-path amendment, because that section has no technique to amend.

**Corrections:**
- `two-surface-doctrine`, the leader is itself a binding: a higher-ranked binding
  that consumes the leader key kills the ambient keyboard path silently. Found by
  the read lane in personas, where it is the case today.
- `two-surface-doctrine`, "not now" is a third outcome: it is distinct from
  declined, and it re-offers the decision later.
- `model-proposed-quick-replies`: still no click-through data; re-dated to
  2026-11-16.

**Applications re-dated against real trees:**
- `rust--progress-beat-grammar`, `react--narration-promote-on-finish` and
  `react--two-surface-doctrine` at personas `8d076db46a`.
- `node--structured-visual-replies` and `react--structured-visual-replies` at kp
  `808eb83`.
- Every claim held except in `react--two-surface-doctrine`. There, the `;` leader
  has been unreachable since 2026-07-31: keyboard nav mode, at priority 30, takes
  `;` first.
- Skip and Later appeared there on 2026-09-18 and emit no signal.

**Confirmed untouched:**
- the provider's between-tool-call progress note: at most one before each tool
  call, skippable, fewer at high effort, omitted by default, beta for text;
- recall disclosure with a correction door. A major assistant shipped exactly
  this, after the response, with the caveat that it "may not show every factor".
  That caveat is count-carries-predicate;
- quick-reply restraint. A usability source says users often ignore suggestions
  that are not useful.

**Impact:** not computed. The map regeneration belongs to the Director.

**Banked:**
- Where a steered message renders in the transcript (at the point it was read,
  not at the end). Return: when the transcript subject is next deepened.
- The personas `;` leader defect. Return: `/conform` or an apply worker on
  personas.
- The narration hard-failure path (no trail, no outcome field). It is still open
  from 09-29.
