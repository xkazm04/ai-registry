---
layer: application
type: application
subject: quality-gates
technique: gate-liveness
stack: process
status: forged
verified_on: 2026-11-06
applied: experiment
ab_verdict: better
proof: ab-paired
---

# Process: a gate read through a reader, then a commit on the next statement

An agent lane in this registry committed with its full gate red and repaired the result a
minute and a half later. The lane's lesson said only that the command "did not stop on
failure", and two miners who looked could not say why. The transcript does. The command was,
in order: the full gate, piped to a last-lines reader and then a first-line reader; a
separator; a diff read; a separator; the lock; the staging; the commit, with the separator
before each. Two independent defects: the pipe discarded the status, and the separator would
have run the commit whatever the status said.

## Replay

Harness session transcripts for this repository, command strings that run the full gate.
25 distinct strings, some differing only by a leading directory change. 17 went through a
reader or filter. 1 of those 17 read a pipeline status. Across all project transcripts on the
box: 34 distinct, 24 through a reader, 1 reading status. At least three strings put a commit or
a stage on a later statement of a piped gate, the incident's among them. Two others ran the gate through a filter that deletes
the could-not-run lines before the tail. A search of the registry's skills, docs and scripts
finds no instruction to pipe it, so the shape comes from the habit of trimming long output
and no document can be blamed for it.

## Status matrix

Git Bash 5.3 and Windows PowerShell 5.1 on one machine. Target: a failing gate's status
reaches the reader. Floor: a passing gate is not reported red.

| Form | Producer | Status read |
|---|---|---|
| reader, no strict mode | exit 64 into a last-lines reader | **0** |
| reader, no strict mode | exit 64 into a first-lines reader | **0** |
| reader, strict mode | exit 64 into either reader | 64 |
| reader, strict mode | healthy large native producer into a first-line reader | **141** (false red) |
| reader, strict mode | same, into a quiet match | **141** (false red) |
| reader, strict mode | same, into a last-line reader | 0 |
| reader, strict mode | healthy large runtime producer into a first-line reader | 0 |
| redirect to a file | exit 64 | 64 |
| PowerShell pipe | exit 64 into a last-item select | status variable 64 |
| PowerShell pipe | large output, exit 64, into a first-item select | status variable **-1** |
| PowerShell separator | exit 64, then the next statement | next statement runs |

A source claimed that a producer writing 200,000 lines and then exiting 64, read by a
first-line reader, returns 141 under strict mode. That form was not reproduced: a subshell
producer and a runtime producer both returned 64. The bare native producer did return 141. So
the source's "strict mode is not the fix" is right about the false red and too wide as a
statement about all readers, since the reader that consumes to the end keeps the real code.

## Verdict

Redirecting to a run-unique file and reading the child's status moved the target, from 0 to
64, and held the floor, with no form tried returning a false red. `better`. The registry's
lander brief has forbidden the pipe since the same day. A brief is advisory in exactly the sessions
that skip it, so a command that owns the chain is the durable form of this rule. One landed the
same evening. Whether it ends the habit has not been read.
