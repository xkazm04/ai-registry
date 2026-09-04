---
layer: technique
type: technique
subject: native-shell-integration
technique: layout-resolved-input-synthesis
status: forged
laws: [one-authority-per-vocabulary, unknown-is-not-a-value]
shared_with: []
use_when: [a synthesized command chord works for the author and fires the wrong command for users on other keyboard layouts, deciding whether to hardcode a key constant when synthesizing input into a foreign application, a synthesized chord is delivered and the target ignores it, the user switches keyboard layout mid-session and injection starts failing]
---

# Layout-resolved input synthesis

Synthesizing input into an application the product does not own is the one act
in this subject where being *technically correct* and being *right* come apart.
The product can emit a perfectly well-formed event that the host delivers
faithfully and the target ignores, because the target resolves that event
through an interpretation layer the product neither owns nor can inspect. The
technique is not "send the right key". It is: **identify which layer the target
matches on, resolve at that layer, and hardcode only where the target matches
on something that cannot vary.**

## Two hosts, two opposite correct answers

The defect that motivates this looks like a rare-locale bug and is not; it is a
category error about where matching happens.

On one host, an application's command chords are matched against the
**layout-translated character** the event produces — what the user would have
typed. A product that emits the *physical key position* that produces the
desired character on the default layout is emitting the wrong character on
every other layout: the same position, translated by the user's actual layout,
is a different letter, and the target dutifully performs whichever of its
commands that letter names, or none. The user sees an unrelated command fire.

On another host, the target receives the **raw virtual key** the product named,
regardless of the layout in effect, and applications match on that. Here
hardcoding the constant is not laziness — it is the correct answer, and
"resolving" the key against the active layout would introduce the bug that does
not exist on this host.

Two hosts, two opposite implementations, and no way to pick between them from
first principles about keyboards. The discriminator is always the same
question, asked per host: **what does the target compare against?** Answer it
from the host's own documentation of how applications register command chords,
write the answer in a comment beside each implementation, and let the code
diverge. A shared "portable" key resolution that runs on both is wrong on one
of them.

## Resolve once, off the hot path, into a cell the hot path reads

Where resolution is required, it is a search: ask the host for the active
layout's data and walk the key space for the position whose translation is the
character wanted. That is not expensive, but it has two properties that decide
where it runs.

- **It is constrained to one execution context.** The host's layout services
  are typically main-thread-only, and calling them from the worker that handles
  input is either undefined or a deadlock. So the resolution cannot be lazy
  inside the injection path, which is exactly where a first implementation puts
  it.
- **The answer changes while the process runs.** Users switch layouts
  mid-session, and a value resolved once at startup and never refreshed is
  correct until the moment it silently is not.

The shape that satisfies both: resolve at startup from the process's main
context, register for the host's own **layout-changed notification** and
re-resolve there, and store the result in a lock-free cell the injection path
reads without synchronisation. The injection path then costs one atomic load
and stays as fast as the hardcoded version it replaced — which matters, because
a technique that makes delivery measurably slower gets reverted.

That cell is the single authority for the resolved key
([one-authority-per-vocabulary](../../../_laws.md#one-authority-per-vocabulary));
a second resolution anywhere — a debug path, a settings preview, a test helper
that recomputes it — will disagree with the live one under exactly the
conditions this technique exists for.

## The fallback constant is a decision, not a default

Resolution can fail to produce an answer: the host reports no active layout
source, the source carries no usable layout data, or the walk finds no position
that produces the character. Returning "unknown" to the injection path is not
available — something must be emitted — so the fallback is a *chosen* constant,
and it is chosen to be the position that is correct on the most common layout.
That makes the failure mode explicit: when resolution cannot run, behaviour
degrades to exactly the naive implementation, which is right for most users and
wrong for the rest, rather than to no injection at all.

Two obligations attach. The constant is named and commented as the fallback,
not left as a bare number, so nobody reads it as the general answer. And the
fallback path is **distinguishable in logs from a successful resolution** — the
product knows it is guessing, and "we could not read the layout" is a fact
worth being able to see when a user reports the wrong command firing
([unknown-is-not-a-value](../../../_laws.md#unknown-is-not-a-value)).

## Emit an event the target believes came from hardware

Matching the right key is necessary and not sufficient. Targets track modifier
state from the modifier events themselves, and a synthesized sequence that sets
the modifier flag only on the letter event — without a modifier-down event
carrying the same flag — is dropped by any target that maintains its own
modifier bookkeeping, which includes most of the ones users care about. Emit
the full sequence with the modifier flag present on every event in it, and
inject at the lowest entry point the host offers, so intermediate consumers see
the events as the hardware would have produced them.

The chord's timing is a second knob — some targets drop a modifier released too
quickly — and it is tuned **separately, after** the resolution is proven.
Changing the key resolution and the chord timing in one release makes a
regression unattributable to either.

## Where this sits

This technique answers only *which event to emit*. The obligations created by
publishing content to a shared host channel before that event is sent — the
receipt that proves a reader took it, the conditional restore, the ownership
check that abandons the restore when the user has since acted, the empty case —
belong to the delivery discipline that owns that channel, and nothing here
restates or replaces them. A product doing both applies them in order: resolve
what to emit, then deliver under that discipline.

## Decision rules

- Per host, establish what the target matches on before writing any key
  constant. Comment the answer next to the implementation.
- Resolve where the target matches on translation; hardcode where it matches on
  the raw key. Do not unify the two.
- Resolve on the main context at startup and on the host's layout-change
  notification; never inside the injection path.
- One cell holds the resolved value; nothing else recomputes it.
- The fallback is a named constant, correct for the default layout, and visible
  in logs when it is used.
- Prove resolution before tuning chord timing; one variable per release.

## When not to use this

- **The target is the product's own surface.** Insert directly; no synthesis,
  no layout, no chord.
- **The host delivers raw keys to targets.** Resolution is a bug generator
  there; hardcode and comment why.
- **The chord has no character to translate.** Function keys, navigation keys
  and media keys carry no layout-dependent translation on any host worth
  supporting; resolving them is work with no possible effect.
