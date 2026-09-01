---
layer: application
type: application
subject: hitl-approval
technique: oracle-before-gate
stack: node
verified_on: 2026-08-31
verified_against: node@24
applied: experiment
ab_verdict: better
proof: ab-paired
---

# A localization gate stack that descended once and stopped (Node)

Thirteen locales, 20,162 keys each, and nobody in the room reads all thirteen
languages. That is the technique's unverifiable column in its purest form: the
consequence of a wrong string is low and the reviewer's ability to find out is
zero, so the delegation would be ungoverned by every trigger this subject owns.

The repo's answer is the fourth resolution, and it reached for it before the
technique named it. It did not gate on meaning; it built oracles at lower
altitudes and gates on those — key parity across catalogs, values that differ
from the English source, section-reference integrity, an error-registry parity
check, and a dead-key scan. That is descending, done well, and it is the right
move.

What the stack does not do is the amendment's second clause: **say what the
lower verdict does not cover.**

## The inheritance already happened once, at a cost, and is written down

The repo's own i18n contract records the failure in its own words. Key parity
reported zero missing across all thirteen locales while roughly a quarter of
the application rendered raw English — tens of thousands of live strings, whole
surfaces, invisible for as long as it took someone to look. Key parity is a
real oracle for a real property; it was read as a verdict on a property one
altitude up, and the deep-merge fallback made the gap silent by design.

The repair was correct and narrow: add the value-level gate that asks whether a
string differs from its English source. What did not happen is the
generalisation. The stack now passes clean — every locale green, zero
untranslated — and the checker's closing line reads *"Every locale renders in
its own language."* That sentence is one altitude above what the run measured.
What it measured is that each value differs from English or sits on an
allowlist of 3,688 entries. The identical inheritance that cost the app a
quarter of its surface is structurally free to recur one rung higher, and the
gate table lists what each gate catches without ever stating what the set of
them leaves uncovered.

## The paired comparison

**Measurable:** violations of a glossary rule, found on a catalog the shipped
gate stack pronounces green.

Both arms ran over the same catalogs at the same instant. Arm A is the shipped
stack. Arm B is Arm A plus one descent — a read-only harness that parses the
termbase's do-not-translate section and asks whether each protected term
survived byte-identical into each locale. The harness is not product code and
changed nothing; it asserts its own term list before reporting.

| arm | instrument | strings compared | violations |
| --- | --- | --- | --- |
| A | key parity + value-differs-from-English | 262,106 | **0** (green, both gates) |
| B | A, plus protected-term survival | 10,257 | **353** (3.4%) |

The B arm's spread is the interesting half: 0.3% on one locale and 9.9% on
another, over one shared English source. A single rate would have hidden that
entirely, and the two ends call for different work.

Not every one of the 353 is a defect a translator would accept — some are
casing drift on a term the glossary froze, and some are strings where an
example sentence was dropped wholesale and took its brand names with it. The
count is a candidate set, not a verdict, and that is the point: it is 353 more
candidates than the green produced.

## What the harness could not decide, and why that is the finding

The termbase's largest entry is a pair the glossary itself refuses to
mechanize: the product name and the common noun spelled the same way, which
its own callout resolves with *judge by the call site, never by the spelling*.
A first run of the harness took that callout's examples as protected terms and
reported a 29.6% violation rate — every correctly translated string counted as
a defect. The instrument was wrong, and the failure is the technique's own
lesson arriving from the other direction: an oracle built at the wrong altitude
does not go quiet, it produces confident numbers.

Excluding that pair drops the exposure from 1,354 keys to 789 and the rate to
3.4%. Those 565 keys are the honest remainder. They are the ones no string-level
oracle can decide, by the termbase's own instruction, and they are the ones
whose verdict must stay `no-oracle` rather than inherit either arm's green.

## What this realization cannot do

The B arm is not a meaning check and must not be read as one. It establishes
that a term the termbase froze is present, which is a property of the string
and not of the sentence — a locale can carry every protected term intact and
still say something wrong, and 46 of the 47 mechanized terms are brand and
acronym tokens that a bad translation preserves for free. What the arm proves
is narrower and sufficient: an oracle exists one altitude above where this
stack stopped, it is cheap, it fires on live data, and the shipped green did
not cover it.

The remainder above meaning is not reachable by any instrument in this repo.
The corpus of per-locale style guides, exemplars and a source-defect register
is the closest thing to one, and it is documentation a translator reads rather
than a check a run can fail.
