# Local messaging as the `messaging` connector

What was learned mapping this recipe onto the consuming application's own local message
channel. Nothing here is part of the recipe: swap the connector and this file stops
applying while the recipe does not change.

## What the mapping has to decide

**This is the one channel where the recipe is genuinely event-driven, and that changes
less than it looks.** It is the only connector in the catalog that declares an inbound
event at all, so it is the only one where the recommended trigger is met literally rather
than approximated by a poll. It still needs a resumable position, because the events that
arrive while nothing is listening leave nothing behind for anyone to notice later. An
event-bearing channel makes the poll unnecessary in the good case and makes the watermark
more important in the bad one, not less.

**A local channel has no network between the write and the read, which removes the
skew and hides the lesson.** Timestamps here are taken from one clock, so the overlap
window this recipe insists on will never demonstrate its value in testing. That is a trap:
the same triage bound to a remote channel alongside this one has real skew, and an
implementation tuned against the local channel's behaviour will be wrong there. Size the
overlap for the worst source in the set, not for this one.

**Mixing an event channel and polled channels means one pass is not one moment.** The
local channel delivers immediately and a mail account is read every few minutes, so the
coverage report has to be per channel and cannot carry a single "as of" time. A single
timestamp across a mixed set is a claim the pass cannot support.

**Everything arriving here is already inside the trust boundary, which is the wrong
lesson to generalize.** Messages on a local channel come from the operator or from the
application, so intent classification tuned on them meets nothing adversarial and nothing
automated. A classifier calibrated only here will be badly calibrated on the first public
inbox it sees.

## What transfers to any messaging connector

- An event-bearing source still needs a resumable position. Events missed during downtime
  are the ones nobody goes looking for.
- Size the overlap window against the least reliable source in the set, not the one you
  developed against.
- A mixed event-and-poll set has no single moment. Report coverage per channel.
- Calibrating a classifier on a friendly channel produces confidence values that do not
  survive contact with a public one.
