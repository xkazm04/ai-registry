---
layer: technique
type: technique
subject: show-segment-format-design
technique: segment-portfolio-lifecycle
status: forged
laws: [unmeasured-is-not-pass]
shared_with: []
use_when: [deciding which live formats to keep, introducing a new format without risking the show, a format survives on habit rather than evidence]
---

# Segment portfolio lifecycle

A long-running show manages its formats as a portfolio with a lifecycle: a new
format enters as a **pilot**, earns its way to **trial** and then **regular**, and
leaves through **retirement** when the evidence turns against it. Movement between
stages is decided by rules written before the runs, on a score normalised against
the show's own baseline, and never on the impression of one good night.

## The score

Raw audience is the wrong measure. It tracks the hour, the day of the week, the
stream's age that night, and whoever arrived from another channel; a format slotted
at peak looks brilliant and one slotted at the tail looks dead, whatever their
merit. The working score compares a run to what the show normally does:

1. **Choose a small set of engagement signals** the format can move — retention
   across the segment, chat participation per viewer, use of the segment's own
   commands, new followers per viewer.
2. **Standardise each against the show's own baseline** for comparable airtime
   (the same position in the show, a rolling window of recent nights), giving a
   z-score per signal.
3. **Combine them with fixed, declared weights** into one segment engagement score.
   The weights are a design decision written down before anyone sees results;
   re-weighting after the fact until a favourite format wins is how a portfolio
   lies to its owner.

A run with a missing signal, an operator override, or an outage is marked, not
scored as zero; it does not count toward a promotion or a retirement. Signals that
mature after the run — how a clip of the segment performed over the following days —
are legitimate inputs, but they make the run's score provisional until the window
closes, and no verdict is drawn on a provisional score.

## The ladder

- **Pilot.** A new format airs in a short slot, in a position that would otherwise
  hold a regular, so its baseline is comparable. Its job is to prove it can run at
  all: the table is complete, the handover fires, the audience understands the
  premise. Every new format starts here — including the one its designer is certain
  will headline.
- **Trial.** A format that ran cleanly as a pilot gets a longer slot and a fixed
  number of runs over a fixed calendar span. Its score accumulates; no verdict is
  drawn until the run count is reached.
- **Regular.** A format whose trial score clears the promotion threshold joins the
  rotation with a full slot. Regulars stay under measurement — a format is promoted,
  not tenured.
- **Flagship.** Optionally, the single regular the show is built around, with the
  longest slot. The score may nominate a candidate (it clears the promotion bar and
  beats the current flagship's recent score), but only the owner awards the slot,
  and awarding it demotes the previous flagship to regular.
- **Retired.** A format whose score falls at or below the retirement threshold for
  several **consecutive** runs leaves the rotation — from any live stage, flagship
  included. Give the audience a short, in-world send-off rather than letting the
  format silently vanish; regulars notice a missing format, and a ceremony turns
  the loss into a moment. Retirement is reversible only by re-entering as a pilot
  with a changed table, never by quietly restoring it.

## Decision rules

- **Retirement wins over promotion.** When a format's history satisfies both rules
  — a strong average with a recent run of failures — it retires. A format that is
  currently failing the audience is not rescued by its past.
- **Consecutive, not cumulative, for retirement.** Three bad runs scattered across a
  month are variance; three in a row are a trend. Consecutive counting also means
  one good run resets the clock, which is the right bias for a format that is
  merely uneven.
- **Minimum runs before any verdict.** A format with fewer runs than the trial
  length has no verdict, and the portfolio says "unmeasured" rather than ranking it.
- **Judge each stage on its own runs.** The history that decides a promotion or a
  retirement is the runs since the format's last change of stage. A trial format
  promoted on the strength of its pilot's premiere has been judged on a different
  slot and a different audience.
- **One rule set, written once.** Promotion and retirement thresholds live in one
  place with one meaning; a portfolio whose stages each grew their own slightly
  different thresholds cannot explain any single verdict. Every threshold is
  labelled an assumption until the first season has calibrated it.
- **The score proposes; the owner confirms.** Promotions and retirements are
  computed automatically between shows and presented to the owner as a short list
  to accept or override. Within a run, nothing waits for the owner (see
  metric-gated-handover); across runs, nothing changes a format's standing without
  a human having seen it.
- **Bound the pilot budget.** The share of airtime given to pilots at once is
  capped, so an ambitious season cannot turn the show into a string of unproven
  experiments.
- **Change the table, restart the ladder.** A material change to a format's states,
  commands or clock is a new version; it re-enters as a pilot or trial, and its old
  scores do not carry over.
- **Keep the live reflex separate from the verdict.** Extending a segment that is
  spiking tonight (see metric-gated-handover) is a within-run decision; it must not
  feed back into tonight's score as if the format had earned the extra time on
  its own.

## Rehearsal before pilot

A format can be rehearsed against a simulated audience before it airs, which
catches tables that never hand over and premises the host cannot run. Rehearsal
proves the machine; only live runs measure appetite. A format that passes rehearsal
still enters as a pilot.

## When not to use it

A show with a handful of nights a season cannot accumulate enough runs for the
ladder to say anything; there the owner's judgement, stated as judgement, is more
honest than a score built on two samples. The ladder starts paying when formats
recur weekly or more.

## Failure modes

- **The immortal format** — kept because it was first, with no retirement rule.
- **Promotion on the premiere** — one strong night moves a pilot to regular before
  its slot's luck can be separated from its merit.
- **Raw-audience scoring** — the format that owns the peak slot always wins.
- **Pooled versions** — a changed table inherits the old table's scores, and nobody
  knows which version the audience liked.
