---
layer: technique
type: technique
subject: model-routing
technique: mode-saving-has-a-domain
status: forged
applied: blind-ab
ab_verdict: better
laws: [count-carries-predicate]
shared_with: []
use_when: [a provider offers a cheaper processing mode for the same call, a headline saving is the reason to switch a call site, an efficiency mode that loops or plans before it answers, deciding whether to route short and long inputs through one mode]
---

# A mode's saving has a domain

A cheaper mode for the same call is advertised with one figure, and the figure was
measured on the inputs where the mode wins. A mode that plans, navigates or loops
before it answers buys its saving by doing less bulk work later, and it pays a fixed
overhead up front in reasoning, round trips and tool calls. So the saving is a function
of input size, not a property of the mode.

## Read the saving on every axis the class budgets

- **Below the crossover the saving reverses.** Fixed overhead on a small input can
  raise total tokens as well as first-token time. Do not assume only latency moves.
- **Above it the bill can move to duration.** Repeated passes over a long input may
  cost fewer tokens and take longer. A job under a request ceiling is bound by that
  ceiling, however long the input is and however much it saves.
- **A class that nobody waits on does not pay first-token time.** Refusing the mode there
  on latency grounds is the opposite error. Name which axis binds this class first.

## The precondition is a number on a measurable input

State the mode's domain as a routing rule keyed to something known before the call, such
as duration, size or part count, with the class and any posture that changes its ceiling.
Take the number from the provider's own documentation if it prints one, and date it, or
measure it at the site's real input sizes. Record first-token time, total time and total
tokens per mode. An announcement's figure is not that number: it carries the predicate of
its own test population
([count-carries-predicate](../../../../_laws.md#count-carries-predicate)).

Record the served mode on the routing decision so that a moved vendor boundary can be
found and the rule re-measured.
