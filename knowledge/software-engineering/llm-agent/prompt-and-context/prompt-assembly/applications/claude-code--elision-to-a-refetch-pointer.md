---
layer: application
type: application
subject: prompt-assembly
technique: elision-to-a-refetch-pointer
stack: claude-code
status: forged
verified_on: 2026-09-08
verified_against: claude-code@2.1
applied: code
ab_verdict: better
proof: ab-paired
---

# Whole-file reads at the tool boundary: size is the wrong axis, measured (Claude Code)

The technique says that a size threshold is policy only while the material is
homogeneous, and that once outputs have classes with different re-read
probabilities the rule must class by **what produced the output** and let size
act only inside a class. That was written about transcript compaction. This
application tests it one boundary earlier — at the `Read` tool call, before the
bytes enter the window at all — against 30 days of one machine's Claude Code
session transcripts, and against a vendor plugin that made the opposite bet.

## The prompt: a plugin that blocks by size

A developer-portal vendor's official coding-agent plugin ships a `PreToolUse`
hook pair that blocks any whole-file `Read` (and any `cat`/`head`/`tail`) over
350 lines and redirects the agent to a script that sends the files to a cheaper
delegate model and returns only its answer. The tree is a clean instance of
hook → script → skill layering, with a 51-case decision table over the hooks
and the transport. Its benchmark reports 82-94% "token savings" — measured as
the lead model's context only; the delegate's tokens are moved, not saved, and
the blocked turn is not counted. That number is a context number wearing a
spend number's name (count-carries-predicate).

## The instrument, and what it found

`measure-large-reads.mjs` (registry `scripts/`, dependency-free) walks every
session transcript, finds each `Read` with no offset or limit, measures the file
as it exists today, and buckets reads over 350 lines by producer class:
`harness-overflow` (the harness's own `tool-results/*.txt` spill files),
`generated-artifact` (a generator or ledger banner in the first eight lines),
and `source`.

Fleet-wide, 2026-08-09 to 2026-09-08, 5,957 sessions, 5,932 `Read` calls:

| class | large whole reads | ~tokens (chars/4, first 2,000 lines) | per read |
| --- | ---: | ---: | ---: |
| source | 175 | 1,711,546 | 9,780 |
| harness-overflow | 25 | 315,755 | 12,630 |
| generated-artifact | 8 | 783,177 | 97,897 |

Three facts the shape gives that the size rule cannot see:

- **The heaviest reads are the generated ones**, by an order of magnitude per
  read — a 3,952-line run ledger read whole five times, a 7,615-line context
  snapshot twice — and they are the reads a pointer or a grep would have
  served. This is the technique's "the rule fires hardest where it is most
  wrong" sentence with numbers on it.
- **A size-only rule at 350 lines lands 84% of its blocks on source** (175 of
  208), the working set a session reads because it intends to reason over the
  bytes — the class the technique says is not compressible at any size.
- **Editing after a whole read is rare enough to ignore**: 3 of 208 large
  reads were followed within four calls by an edit of the same file. The
  plugin's "targeted reads pass" exemption protects a case that barely occurs.

## The paired proof

The same 208 recorded reads (43 in the project that shipped the change) were
replayed through three arms: **A** the seam as it is (no rule, no hook — 43
whole reads happened), **B-size** the vendor's rule, **B-class** a guard that
blocks only the two non-source classes when read whole over the threshold.

| arm, one project (n=43) | blocked | of which source | tokens recovered | blocked-then-edited |
| --- | ---: | ---: | ---: | ---: |
| A: as-is | 0 | — | 0 | — |
| B-size (the plugin's rule) | 43 | 20 | ~1,187k | 0 |
| B-class (shipped) | 23 | 0 | ~870k (73%) | 0 |

B-class recovers three quarters of the tokens B-size does while blocking none
of the working set. Fleet-wide the ratio is lower (39%) because the other
projects' large reads are mostly source; that is the same finding from the
other side — a project whose large reads are code has nothing for a size rule
to do but harm.

**Verdict `better`, mode `code`**, for the class-based guard in the project
with the highest large-read rate (1 in 4 sessions). **Verdict `not-better`**
for the plugin's size-only shape, on every project measured. The guard is a
30-line script with a 15-case decision table and a fail-open-loudly path,
registered as a `PreToolUse` `Read` hook in the project's committed settings —
the first hook registration in that repository that travels in a clone.

## What the realization cannot do

It measures file sizes today, not at read time; deleted scratch files (1,844
of 3,707 whole reads) are excluded rather than guessed. It does not measure
the redirect: what the agent does after a block — a targeted read, a grep, a
subagent, or the override — is the number that decides whether the recovered
tokens were free, and it is the return condition. And it says nothing about
delegation to a cheaper model, which is the half of the plugin this fleet did
not adopt: the harness already has subagents for that, and the measurement
found no read where the delegate would have been the right instrument rather
than a pointer.
