---
layer: application
type: application
subject: prompt-assembly
technique: foreign-harness-history-folding
stack: rust
verified_on: 2026-09-15
verified_against: rust@1.80.0
applied: experiment
ab_verdict: better
proof: ab-paired
---

# A desktop agent runner that reads the operator's live CLI session as text, and why that shape holds

The version above is the `rust-version = "1.80.0"` floor that the Personas
engine crate's manifest pins (edition 2021, crate 1.1.0), read at commit
`cf54b904b` on 2026-09-15.

Personas runs agent personas over wrapped coding-agent CLIs. One engine
module lets a persona that fires from a trigger, a schedule or the daemon
*see* the operator's interactive CLI session while it is still in progress.
It locates the most recently active JSONL transcript under the CLI's projects
directory, reads the recent turns with a tolerant parser, and renders them
into the persona's system prompt as a block headed "Active Claude CLI
Session". Two opt-in gates guard it (per persona and app-wide, both off by
default), plus a ten-minute freshness cutoff. The module header states the
boundary: "read-only awareness, not resume-attachment". The operator's
session id is never used as a resume target.

## The structural fact: the tree already takes the text-projection branch

The transcript reader drops `thinking`, `tool_use`, `tool_result` and every
unrecognized block, keeping only text. A unit test pins this: a line
carrying all four block kinds yields only the visible reply. So the
awareness block never shows the persona the foreign harness's tool calls.
That is exactly the branch the technique prescribes for awareness.

The tree gives a different reason for the skip. Its doc comment calls those
blocks "noisy or sensitive", something to keep out so the block "stays
focused". Nothing records the reason that makes the skip load-bearing, and
that is the one worth preserving. A persona can run on a different wrapped
engine from the one that recorded the operator's session, and the natural
next improvement to an awareness block is "include what the session
actually ran".

## The paired proof

Measurable: the share of first continuation responses that call a tool
absent from the receiving roster. It uses the technique's fixture: a
three-call repair session recorded under one harness's tool names, a
continuation asking to re-run the tests, a native roster with different
names, and a 27B open-weight model served locally. Ten seeds per arm,
temperature 0.8.

- **A** (the same history replayed as native tool turns, which is the
  shape "include what the session ran" would drift toward): **10/10**
  responses called a foreign tool, and none called a native one.
- **D** (this module's render shape, meaning a system-prompt block with
  project, last activity and text-only turns in chronological order):
  **0/10** foreign calls. The first call was the native shell tool 10/10.
- Control (same turns as A, with names matching the roster): 0/10.

Verdict `better` for the shape the tree already has. No product code
changed: the seam already sits on the winning arm, and the run found nothing
in the tree that could see a difference. The finding is recorded in the
project's own applied ledger so the skip's reason is on file before anyone
revisits it.

## What this realization cannot do

- **It cannot continue work.** Text-only turns keep what an assistant
  sentence happened to restate and drop the evidence of what was read, run
  and edited. That is right for awareness and would be wrong if the module
  were ever asked to hand a session over. On a quota or session limit, the
  engine instead pauses admission for the affected engine and resumes on the
  same one. Nothing in the tree moves a task's history to a different engine.
- **It is blind to other harnesses.** Discovery reads one CLI's transcript
  layout. An operator working in a different agent is invisible, and a
  second adapter would bring in that harness's vocabulary with it, which
  the text-only reader already neutralizes.
