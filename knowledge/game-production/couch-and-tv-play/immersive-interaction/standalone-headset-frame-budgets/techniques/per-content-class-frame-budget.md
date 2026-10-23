---
layer: technique
type: technique
subject: standalone-headset-frame-budgets
technique: per-content-class-frame-budget
status: draft
laws: [a-budget-shapes-the-output, one-authority-per-quantity, a-number-carries-its-unit-and-basis]
shared_with: []
use_when: [setting authoring limits for a headset with a fixed refresh rate, one content class is consuming the whole frame, a budget is stated as one frame time for everything, one budget must hold on more than one headset]
---

# Per-content-class frame budget

The named concern: a headset frame is fixed by the display, and a budget written as that one
interval gives every content class the whole of it. The environment, the characters, the
effects, the interface and the hands each believe the frame is theirs, and the first capture
on the device is the first time anyone learns they were sharing it.

## When setting authoring limits for a headset with a fixed refresh rate, divide the interval by content class before anything is authored, because a limit nobody knows cannot shape the content

Start from the interval the refresh rate gives. Take the thermal reserve off the top first,
through [thermal headroom reserve](./thermal-headroom-reserve.md), and divide only what is
left. Give each content class a share on each stage it loads: environment, characters,
effects, interface and hands, and any class the game adds. The split by stage follows
[per-thread budgets, not one frame-time](../../../../engine-integration/perf-regression-gating/techniques/per-thread-budgets-not-one-frame-time.md);
this technique adds the split by class within each stage. Each share names its unit, the
refresh rate it was derived from and the device it binds on.

## When one content class is consuming the whole frame, give it a named owner and make it pay from its own share, because a frame with no owner per class has no one who must cut

Each class has one owner who holds its share. A class that needs more asks another owner for
part of theirs, in writing; it does not take it by shipping first. A share left unspent is
not free for the class beside it. It stays in reserve until an owner trades it.

## When a budget is stated as one frame time for everything, mark it incomplete rather than inventing the split, because a guessed split is read as a measured one

Leaving a split empty with its reason, until the first device reading, is honest. Filling it
with an even division that nobody measured is not. A desk figure may rank classes by work
counts, under [host-independent work counts](../../../../engine-integration/perf-regression-gating/techniques/host-independent-work-counts.md),
but it does not set a device share.

## When one budget must hold on more than one headset, bind each quantity on the device that finds it hardest, because the weakest device overall is rarely the weakest on every quantity

Write each limit once per quantity and name its binding device. Fill binds on the device that
renders the larger eye buffer, because the same GPU class then shades more pixels. That is not
always the device with the larger display. The runtime sets the eye buffer, and two headsets
on one chip can share a default eye buffer over different panels. They tie on fill until a
per-device pixel density breaks the tie, so write the tie and name the setting that would
break it. Submission binds on the device with the slower CPU. Memory binds on the device with the lower per-app ceiling,
set under [residency budget checked before decode](../../../../engine-integration/render-submission-economy/techniques/residency-budget-checked-before-decode.md).
Where the devices differ on more than one of these, a single "lower device binds" rule
silently picks the wrong device for at least one. Where they differ on none, it picks a tie
and gives no reason, and the first per-device setting moves the binding without anyone noticing.

## Decision rules

- **When the refresh rate changes, every share is re-derived.** A share is a fraction of an
  interval, not a fixed amount.
- **When a class is added, the reserve is not where its share comes from.**
- **When a class has its own count row, it still owes a share on every shared row it draws
  from.** Passing its own row says nothing about the draw, triangle or fill rows it also loads.
  A class can pass its own row while it adds cost to a shared row that is already failing.
- **When a fix for one row is paid in another row's headroom, write the trade.** Headroom on a
  shared row belongs to the classes that draw from it. Spending it to repay a different row is
  a trade between their owners, not a free margin.
- **When a share has never been read on the device, it is labelled a plan figure** in its
  application, never a measured one.

## When not to use it

For a single-scene prototype with one author, one frame time and one capture is enough. The
split pays from the moment more than one person adds content to the same frame.
