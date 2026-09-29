---
layer: application
type: application
subject: model-routing
technique: turn-classification
stack: claude-code
status: forged
verified_on: 2026-09-29
verified_against: claude-code@2.1.284
applied: experiment
ab_verdict: better
proof: ab-paired
---

# A harness moved its own silent default from cheap to expensive, and every unpinned scout call moved with it (Claude Code)

The technique says an unclassified call has no safe default: "defaulting cheap
quietly degrades the call someone forgot to label; defaulting expensive converts
every future omission into invisible spend." Both halves of that sentence happened
to one harness inside a single release, and the call sites did not change.

## What moved

Until release 2.1.198 (published 2026-07-01, per the package registry's publish
time) the built-in read-only search subagent ran on the small tier. The release
notes for that version say it plainly: the built-in search agent "now inherits
the main session's model (capped at opus) instead of running on haiku". A later
release (2.1.284, the version this application was verified on) still inherits;
it only fixes the case where the session's model id is not one the harness
recognises. Read verbatim from the maintainer's changelog on the day of the run.

Two workflow skills in this registry dispatch that subagent as a parallel fan-out
("one per target context", "very thorough") and describe it as cheap. Their
builders are pinned by name; their scouts named no model, so they were relying on
the harness's default being small. That is an unclassified call in the
technique's sense, and it stayed harmless exactly until the owner of the default
changed it. A director session on the largest tier now runs every scout on the
largest tier the cap allows.

The source that surfaced this was a video by a team that noticed the same change
and worked around it by replacing the subagent with a skill; the changelog, not
the video, is what this application rests on.

## The paired run

One brief, chosen because its ground truth is greppable: find every place in the
repository's scripts that defines, enforces or reports the child-directory cap,
with path, line, quoted text and a blocks-or-reports classification, plus a
line saying what was checked to rule out other sites. Truth is eight semantic
sites across four files (17 lines carry the constant). Three arms, two runs each,
identical prompt, same session:

| Arm | Model the scout ran on | Sites found (of 8) | Tokens (two runs) | Wall time |
| --- | --- | --- | --- | --- |
| A | inherited (this session's mid tier) | 8 and 8, quotes match | 34.6k, 36.6k | 24.7 s, 27.1 s |
| B | pinned to the small tier | 8 and 8, quotes match | 57.1k, 60.6k | 42.2 s, 49.9 s |
| C | pinned to the top tier the cap allows | 8 and 8, quotes match | 37.5k, 37.2k | 46.4 s, 37.6 s |

Measurable and floor, declared before reading: the target is cost of the scout;
the floor is anchor accuracy (a quoted line that is not on the cited line, or a
missed site, fails it). The floor held in all six runs. The target depends on
which session is directing.

Weighting tokens by the list prices in the same changelog (mid tier $2/$10,
top tier $4/$20, per million tokens; the small tier's price is **not** in that
source and is taken as half the mid tier, an assumption), against the mid tier at
1.00: arm A 1.00, arm B about 0.83, arm C about 2.10. The input/output mix of
each run was not visible, so these are total-token approximations. For a
director on the tier above the cap, arm C is what an unpinned scout costs and arm
B is the pinned alternative: roughly 0.4 of it, at about the same wall time. For
a mid-tier session inheriting is already cheap, and pinning the small tier saved
about a sixth of the money and cost about 1.8 times the time.

## What the arms did not equalise

The top-tier arm did unrequested work: both runs traced the callers of the
taxonomy errors to say which script exits and which only counts, and I re-read
four of those lines by hand and they were right. The mid-tier and small-tier arms
did not. The brief asked for sites, so the floor does not price that depth, and
the two skills' scouts are asked for exactly that kind of depth (trace every
surface to a mount point, enumerate other consumers). So the verdict is scoped:
**better for an enumerate-the-sites brief**, and **unmeasured for a tracing brief**,
which needs the same pair over a brief whose truth is a caller graph.

## What it cannot say

Two runs per arm over one brief in one repository. The small tier's price is an
assumption. The session ran on the mid tier, so arm A is the inherit case for
that tier, not for the top one; arm C stands in for the top-tier session by
pinning what the cap would produce. Nothing here says the small tier is unfit
for a tracing brief; it only records that it did not volunteer the tracing when
the brief did not ask.

## What it changes

The routing rule the technique states was already in the corpus, and the two
skills were on the wrong side of it. The landing is the smaller thing: the skills
now say the scout's model is a decision made per brief class (small tier for
enumeration, the inherited model when the brief asks for tracing), and the day
the default moved is written down beside the rule that predicted it.
