---
layer: technique
type: technique
subject: on-stream-persona-continuity
technique: anti-repetition-window
status: forged
laws: []
shared_with: []
use_when: [a generated live host repeats openers, insults or catchphrases over a long stream, designing a catchphrase or signature line for a host, choosing where a repetition check runs]
---

# Anti-repetition window

A generated host talks for hours, and a model's phrasing narrows as it goes:
the same opener, the same insult shape, the catchphrase arriving every few lines.
Viewers read the narrowing as the character going stale well before they could
say why. The guard is a **rolling window of recent output, checked
deterministically outside the model**, with one distinction that keeps it from
flattening the character: a **signature** is rationed, a **tic** is removed.

## Signature versus tic

A signature is an intended recurrence: a catchphrase, a sign-off, a way of naming
the audience. It is part of the core or bible, it is what clips are made of, and
its power depends on scarcity. A tic is an unintended recurrence: the model's
prior showing through as a favoured phrase or structure. The two can be the same
words; what separates them is whether the persona documents declared it. A
declared signature gets a **budget** (so many uses per hour, never in consecutive
replies); anything else that recurs is a tic.

## The window

Keep the last N host lines for the stream, where N covers several minutes of
talk. Compare each candidate line against the window on more than exact match:

- whole-line similarity on character or word n-grams, because insults and jokes
  repeat as structures with one noun swapped;
- **sentence-level** near-verbatim match for any sentence above a short length,
  because the commonest repeat is a status sentence (the score, the poll, the
  plan) re-narrated inside a fresh line while the state it describes has not
  changed, and whole-line similarity misses it when the wrapper differs;
- the opening words, because openers repeat early and are the most audible;
- declared signature phrases, counted against their budget.

Compare the line that would actually air, after any output gate has rewritten it,
and record each suppression as an event so the rate is visible. A candidate that
trips the window is rewritten or replaced before it airs; dropping it outright is
acceptable only when something else fills the beat, because a suppressed line
with nothing behind it is dead air. The check is cheap string work and runs on
every path that produces generated host speech; an expensive semantic check may
sit behind it but never replaces it.

A looped status line is also a signal upstream: the host is re-narrating because
the prompt offers it nothing new. Feed it a change of state, a bit or a premise,
rather than relying on the guard to keep catching the loop.

## Feeding the window back

The window can also be shown to the model as "lines you have just said; do not
reuse their openings or punchlines". That reduces how often the deterministic
check fires, and it does not replace the check: the model's compliance with a
"do not repeat" instruction degrades over exactly the long stretches where
repetition happens.

## Across streams

Repetition across streams is a different problem. A callback to last week's bit
is continuity, and it should come from cited memory as a deliberate choice. The
same joke told every stream as if new is a tic at the scale of a season; keep a
per-bit record of when it last aired and treat a bit retold too soon as a repeat.

## Decision rules

- **When the guard fires often**, the window is not the fix; look at the tone's
  examples (a few example lines are copied far more than imagined) and widen the
  example set.
- **When the replacement path is slow**, a short in-character filler that is
  itself rotated is better than airing the repeat or going silent.
- **When a signature exceeds its budget**, drop it from the line rather than
  rewriting the whole reply.
- **When a viewer asks for the catchphrase**, the request may spend a budget unit;
  it does not lift the budget.

## When not to use it

Short-form recorded content reviewed by a human does not need a runtime window.
And the window is a guard against staleness, not a quality metric: a stream that
never trips it can still be dull.
