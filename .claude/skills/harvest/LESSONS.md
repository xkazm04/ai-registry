# Lessons - harvest

Append-only reflection lane. One entry per pass that taught something, newest last.
Format: `## <version used> - <YYYY-MM-DD> - <scope>` followed by `- ` bullets.

This file exists because a change needed one and there was none: the skill whose own
stop rule is a memory across passes carried no record of what any pass taught. Phase 6's
report now has a lane to land in.

## 0.4.1 - 2026-09-23 - ai-registry (bumped to 0.5.1 across the same change)

- **This skill's three halt rules were written for a reader and could not be computed.**
  Two consecutive passes landing nothing but leads and catches; the same failure
  signature surviving three passes; an evaluation debt of three or more. Every one of
  them is a comparison across passes, and until now no pass left behind a field to
  compare. In `auto` and `loop` mode, where nobody is present, the stop rule was
  effectively unenforceable - which is the mode it exists for.
- **`failure_signature` is an identity, and the schema enforces it as one.** The rule
  this skill already states - "attempt count is not the signal; failure identity is" -
  only works if the same failure produces the same string next pass. The helper refuses
  a signature with no letters in it, so a pass cannot satisfy the field with a counter
  and quietly reset its own halt rule.
- **The gaps in the file are load-bearing.** A parked row is not a decline and has no
  count of its own; an unsettled evaluation is not `unmeasurable` and stays out of
  `verdicts[]`, so the debt guard reads the *gap* between content landings and settled
  verdicts rather than a field that could be filled optimistically. Every place this
  skill refuses to conflate two outcomes, the schema refuses too.
- **`mined` and `parked` are queue states, not outcomes**, which the closed vocabulary
  settled rather than debated. A parked row never reaches a subject row at all - parking
  is a judgment about timing and the result file has nothing to say about it - and a
  mined row's outcome is whatever it landed. The queue keeps its own words.
