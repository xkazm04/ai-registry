# Gate kit - what the owner sees at a gate

The owner judges by eye. In the forging campaign he cut the metric card and the live walk-through from the gate
kit and kept exactly two things: **before/after screenshot pairs** and a **numbered decision list**. The numbers
stay in memory as the Director's instruments.

## The pairs

- The integrated page, not a component: the real shell, real widths.
- 1280x800, 1920x1080 and one tall view (1440x3200) - the standard sizes hid the half of a page with the worst
  type. Dark and light. When the repo's own shooter defines its sizes, the repo shooter's sizes win; keep one
  tall view among them.
- Before and after from the SAME data tape and the same renderer version (the pair tool refuses mixed versions).
- For a batch: one family image per view - every module after, side by side with a kit reference page. The
  gate's real question is "does this read as the same app?".
- For a finalist choice: a three-way image current | A | B.

## The decision list

Numbered, one line each, every visible change traceable to a line: "3. Kept the featured card's gradient over
the primary: it marks the one item in progress." Reversals from an earlier round are marked `R<n>`. Every colour
change says "theme-derived kept" or "raw -> <role> because <meaning>". The owner reverses by number.

## Asking

- **File paths go INSIDE the question text**, never in prose above it - prose above a question may not be read.
- One question for the verdict (improvement / one more pass / degradation), one multi-select for the open calls
  (phrased so a tick means CHANGE what was built), and at most two more for genuine forks. Never ask what the
  doctrine or the owner's earlier words already answer.
- Name the Director's own concern honestly in the question ("my concern: Activity may now be too dense") - the
  owner may approve anyway, and that is taste worth recording.
- A verdict that is an answer outside the options is a doctrine: capture it verbatim, re-scope, re-scout if it
  created a code question.

## Gate modes (`gate_mode` in the overlay)

- **`per-batch`** - everything above, once per batch. Right while the taste record is thin (the first
  campaign's first five gates each changed the doctrine).
- **`key-decisions`** - the default for a new overlay. The Director decides each batch; the owner is
  asked only KEY decisions, as they arise, and sees the decided batches at a **summary gate**.

Why it is the default: the owner of the forging campaign stopped the per-batch ritual himself
(2026-10-03, verbatim): "Do not use human gating rounds for each change from /kit, I will need to put
you notes with each module and do your per best decision, exchange only key decisions". Two other
campaigns under `per-batch` stalled the same way from the other side: one ran eight batches with five
gates left "pending owner", another stopped at its pilot "awaiting owner gate". A gate the owner does
not attend is not a gate; it is a queue.

### What counts as a key decision

A decision is KEY when it:

- **(a)** contradicts a recorded taste line (overlay `## Taste`, `gates.md`);
- **(b)** is irreversible or expensive to undo (deleting a surface, a data or routing change, removing
  a kit part other pages compose from, anything the next batches would build on);
- **(c)** rests on a premise the owner's note got wrong (he prescribed a fix whose measured cause is
  elsewhere: measure the perception before accepting its diagnosis, then ask);
- **(d)** is a genuine fork with no evidence favouring either side.

Everything else is the Director's call, made and reported. The owner's per-module notes, when he writes
them, are law in the builder briefs like any gate quote. Pairs and the family image stay the
Director's review instrument: they stop being a presentation ritual, not a check.

**Asking a key decision:** the same rules as above (paths inside the question, numbered options, the
Director's concern named), plus the letter that made it key ("key (b): removes the old filter bar that
two approved pages still use"). Several key decisions of one batch go in one sitting. A key decision
does not hold the whole batch: build what does not depend on it, and close the dependent module after
the answer. The answer goes verbatim into `gates.md`.

**Closing:** `coverage.mjs close-batch --verdict director-approved --text "<decision record>"
--decisions <file> --commits <sha,...>` (or `mixed` with `--director-approved` / `--sent-back` when the
Director sends a module back to its builder). `--decisions` is required: the numbered decision list
(`1. ...`, one decision per number, `key (a)`..`key (d)` on the ones the owner answered), stored on the
batch exactly as an owner gate would see it, so the summary gate can reverse by number.

### The summary gate (`/kit gate summary`)

- **When:** `coverage.mjs status --summary-every <summary_every>` prints `SUMMARY-DUE`, or at a session's
  end while any batch waits. At twice `summary_every` waiting batches, open no new batch: the flow would
  keep producing output and stop producing decisions.
- **What the owner sees:** ONE family image per view covering every waiting batch (`family.py` with one
  column per module after, plus the kit reference page), the batches' decision lists renumbered as one
  list, and the key decisions already answered listed as settled (not re-asked).
- **One question:** improvement / one more pass / degradation, per batch or per module allowed; one
  multi-select for the Director's calls he wants changed (a tick means CHANGE).
- **Record:** `coverage.mjs summary-gate --id summary-<n> --verdict approved|sent-back|mixed --text
  "<verbatim>"` (`--approved` / `--sent-back` for mixed; `--batches` for a subset). Only this moves
  `director-approved` to `approved`. Send-backs become the next batch's first modules; a correction is a
  taste line, and a correction of a Director call is evidence about the criteria above - if he reverses
  a call that was not flagged key, write which letter should have caught it.
