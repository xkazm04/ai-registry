---
layer: technique
type: technique
subject: proposal-quality-review
technique: placeholder-and-jargon-detection
status: forged
laws: [never-fabricate-a-figure, clean-is-not-ready]
shared_with: []
use_when: [checking a draft for unfinished work before filing, drafting prompts that emit fill-in slots instead of invented figures, tuning detector patterns after a false pass or false alarm]
---

# Placeholder and jargon detection

Three different kinds of "unfinished" hide in proposal text, and the
technique's core insight is that they are *not one check*. They carry
different intent, deserve different messages, and sit at different
severities. Lumping them together makes an honest draft read as broken and a
broken draft read as merely unpolished.

## The three families

**1. Deliberate fill-in slots.** A drafting pipeline that obeys
[never fabricate a figure](../../_laws.md#never-fabricate-a-figure) emits a
bracketed slot — "[insert number served]", "[Organization Name]" — wherever
a real figure would strengthen the case and none was provided. These are
*expected scaffolding*: evidence the generator was honest, not evidence it
malfunctioned. Detection targets short bracketed content that reads as a
label (contains a letter, label-safe characters, bounded length — so a bare
numeric citation marker or a long legitimate bracketed aside is ignored).
Their finding says "complete these — replace each with a real figure before
filing", never "this output is broken". They are a quality flag during
drafting and a hard blocker only at the submission gate: you cannot file a
bracket, but you also must not punish the generator for refusing to invent.
The mirror rule matters just as much: a quantification check ("this section
should contain a figure") must **count a bracketed slot as satisfying it** —
otherwise the review pressures the pipeline toward inventing numbers to pass,
which is the exact failure the slots exist to prevent.

**2. Sloppy markers.** TODO, TBD, "lorem ipsum", the literal word
"placeholder", and masked-figure runs like a year written as "20XX" or an
amount as "$XX,XXX". These are abandonment residue a skeptical program
officer catches instantly, and they are blockers with a blunt message.

**3. Vague filler.** "Synergy", "leverage", "world-class", "cutting-edge",
"game-changing", "very unique". This is not unfinished work — it is finished
work that says nothing, and experienced reviewers read it as padding. It is
style-severity: squiggle it, name the better move ("say what you will
actually do", "show, don't claim"), never block on it. One or two terms may
additionally be banned outright in generation guidance, in which case their
presence in a *generated* draft is guidance drift worth a quality flag.

## Detector precision is earned incident by incident

Pattern-based detection lives or dies on its edge handling, and the edges are
discovered through failures. Lessons that recur:

- **False negatives hide in the character class.** A fill-in slot containing
  punctuation the pattern didn't allow — "[Insert outcome (e.g., 412
  students)]" — sails through as clean, and a clean verdict on a draft
  carrying a ship-blocking placeholder is the worst outcome the check can
  produce, a small local violation of
  [clean-is-not-ready](../../_laws.md#clean-is-not-ready). When widening a
  class, keep the bounds that cap false positives (require a letter, cap the
  length).
- **False positives hide in word boundaries.** A naive "two or more X's"
  pattern flags "XXL" and Roman numerals; the fix is anchoring on
  *non-letter* context so "20XX" and "$XX,XXX" fire and letter-embedded runs
  do not.
- **Deduplicate findings per pattern per section.** Five identical slots are
  one instruction to the writer, not five rows of noise; list the first few
  distinct matches in the detail.
- **Test the patterns as a corpus.** Every incident above becomes a fixture:
  the string that slipped through, the string that false-alarmed. A detector
  without a fixture file relearns its own history.

## When not to use it

Do not extend the vague-filler list toward a general style linter — dozens of
squiggles per section drown the three that matter, and tone is ultimately
the human tier's judgment. Do not run marker detection on the writer's
private notes fields, only on funder-facing sections. And do not auto-replace
anything: a placeholder is a question addressed to the writer, and only the
writer holds the answer — machine-filling it is fabrication with extra
steps.
