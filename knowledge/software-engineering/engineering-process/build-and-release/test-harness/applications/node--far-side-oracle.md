---
layer: application
type: application
subject: test-harness
technique: far-side-oracle
stack: node
verified_on: 2026-09-04
verified_against: node@22.21.1
applied: code
ab_verdict: better
---

# An oracle deployed onto the machine the product controls (Node, Playwright, Go agent)

A KVM-over-IP appliance exists to make a *host computer* believe a keyboard,
mouse and mass-storage device are plugged into it. Every claim worth testing is
therefore a claim about a machine the product does not own, and none of it is
observable from the product.

The near-side assertion is available and nearly worthless. The browser client can
confirm a keystroke was serialised into the data channel; the device can confirm
it wrote a report into the USB gadget. Both are true while the host receives
nothing — a gadget unbound, a descriptor the host rejected, a report format the
host's driver silently discards. The suite goes green and the product does not
work.

## The agent

The lane deploys a small Go daemon onto the host — the machine on the other side
of the cable — and asks *it* what happened. The daemon reads Linux input event
devices directly (the raw 64-bit event struct: type, code, value, with the
relative and absolute axis constants spelled out), enumerates USB devices, and
reads the mount table, exposing all of it over a flat unauthenticated HTTP API
for the tests.

The three properties the technique names are all visible in how it is built:

- **Substrate, not product vocabulary.** The agent reports `key_press`,
  `mouse_move_abs`, a bus/device/id triple, a mount entry — kernel facts. It
  contains no model of the product's protocol, so it cannot agree with a bug in
  it. Its API surface is the operating system's view, translated only into JSON.
- **Separately built and versioned.** It is its own Go module with its own
  `go.mod`, cross-compiled for the *host's* architecture, which is not the
  device's. The deploy script builds it, copies it over, restarts it, and polls a
  health endpoint before returning — deployment is a step in the lane's setup,
  not a prerequisite documented in a wiki.
- **Absence skips.** Every far-side spec begins by skipping when the host address
  is unset. Whether a second machine exists is a property of the environment, and
  a hard failure there trains people to ignore the lane.

## What the far side makes measurable

The lane's most interesting test is not functional. Repeatedly kicking the USB
gadget leaks kernel dentries on the host, and the leak is invisible from the
device — the device's own memory is fine. The test samples a host-side counter
over a minute and asserts against a **derived budget** rather than a flat
threshold: a per-rebind cost, times a permitted number of rebinds in the window,
plus a steady-state allowance, each named as its own constant.

That is the discipline this technique inherits from
[count-carries-predicate](../../../../_laws.md#count-carries-predicate), and the
reason to prefer it here is practical rather than stylistic: legitimate operation
*does* grow the counter, so "must not grow" would be a flake generator, and a
single bare number would be unmaintainable the moment the per-rebind cost
changed. With the factors separate, a failure says which one was violated.

The rebind count itself is read by grepping the device's log over SSH — the one
place the lane deliberately asks the near side, because the question is "how many
times did *we* do the thing", not "what happened to the host".

## The ordering fact, which is not about the far side at all

One spec in the same suite is prefixed `zz-` so it sorts last, with the reason in
a comment: it drives the login rate limiter, and the limiter's state is in-memory
on the device with no reset endpoint. Running it anywhere but last would require
rebooting the device between files.

That is worth recording beside the far-side lane because it is the same class of
problem seen from the other end — a test whose *cost* is a state change the
harness cannot undo. The cheap fix is ordering, and the honest version of the
cheap fix is a comment saying which irreversible state made the order load-bearing,
so the next person does not "fix" the filename.

## What this realization cannot do

The agent observes; it does not act. It cannot inject a host-side fault — unplug
a cable, refuse a descriptor, wedge a driver — so the lane proves that correct
input arrives and cannot prove what happens when the host misbehaves. Those cases
are driven from the test process over SSH instead, writing directly to the host's
sysfs, which works but puts far-side mutation in a different place from far-side
observation.

It is also unauthenticated and bound to a port on the host. That is acceptable
for a lab machine on a bench and would not be for anything else, and nothing in
the design prevents the lane from being pointed at a host where it is not
acceptable.
