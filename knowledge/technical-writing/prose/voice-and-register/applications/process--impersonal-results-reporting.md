---
layer: application
type: application
subject: voice-and-register
technique: impersonal-results-reporting
stack: process
status: forged
verified_on: 2026-10-10
---

# Process: a third-person sweep over an article and its research log

Witness: the two-round writing contest described in the `article-structure` application
(round two judged on 2026-10-05). Entry files are local run output; this records what they
show, read on 2026-10-05.

## The finding

The owner's round-one review included, verbatim: "We should not compose sentences from 'my'
perspective 'I did something', always try to speak in 3rd party view about topics or
results." Several round-one articles narrated their own research ("I translated", "I
counted", "my reading", "I would repeat"). The host's amendment for round two: no "I",
"my", "we found", "I measured"; state the article's own measurements impersonally
("measured with a named tokenizer library at a version, on a date") and keep the command in
the research log.

## How the winning revision realized it

- **Rewrites by subject, not by voice.** The revision's change log records "I translated",
  "I counted", "my reading" and "I would repeat" rewritten as "measured for this article"
  and "the reading offered here". The topic or the measurement became the subject.
- **Companion files swept too.** The notes file and the sources log were rewritten in the
  same register, so the first person could not leak back into captions or the sources list
  during later edits.
- **A deterministic check, logged.** The sources log records the check that verified it: a
  case-insensitive whole-word search for `I|my|me|we|our|us` over the page text, which
  "returned no prose hits".
- **Own measurements as a source.** Every count the article measured itself is cited as
  source [1], "Measurements for this article", with eight experiments, the library versions
  (`tiktoken 0.14.0`, `tokenizers 0.23.1`, Python 3.14.0), the download commands and the
  counting code described in the log.

## The same round's house decision

The host's editing checklist for round two also banned em dashes in the page. That is a
house rule adopted to curb a drafting habit, recorded as such in `house-style-consistency`.
A 2026 report on writers scrubbing em dashes quotes a content-marketing speaker at an
editing society's conference: cutting a dash that is the right mark for the point loses its
meaning (https://www.poynter.org/reporting-editing/2026/ai-changing-human-writing-editors-em-dash/,
re-read 2026-10-10; an earlier version of this line attributed the argument to editors).

## What this witness does and does not show

It shows a whole-word pronoun search is a workable presence check for this register, and
that a drafting agent can pass it in one revision. The revision's own replacement phrase,
"measured for this article", is a participial passive; it hides nothing here only because
it points at source [1], where the method is logged. The search does not catch a passive
that hides the method with no such pointer, so that still needs a reader.
