---
layer: application
type: application
subject: agent-cli-transport
technique: permission-stance-enforcement
stack: claude-code
status: forged
verified_on: 2026-11-09
verified_against: claude-code@2.1.319
applied: experiment
ab_verdict: better
proof: ab-paired
---

# Claude Code: a path deny does not deny the bytes

The technique says a bare shell grant is a write grant with extra steps. This is
the same fact from the deny side. A rule such as `Read(./secret.txt)` reads like
a statement about a file. It is a statement about the routes the harness
recognises as reading that file.

## What the rule covers at this version

The vendor's permissions page states the boundary: "Read and Edit deny rules
apply to Claude's built-in file tools, to file commands Claude Code recognizes in
Bash, such as `cat`, `head`, `tail`, `sed`, and `tee`, and to the targets of Bash
redirections". And then: "They don't apply to a command that reads files without
naming them, such as `grep -r pattern .` run from the directory that holds the
file, or to arbitrary subprocesses that read or write files indirectly, like a
Python or Node script that opens files itself."
([permissions](https://code.claude.com/docs/en/permissions), fetched 2026-11-09).

So the shell's reach is narrower than a plain "the shell ignores deny rules",
and it moves between releases. Read the current page before relying on either
form. An older entry in this corpus's source note records the reach being
extended then reverted across 2.1.257 to 2.1.260. Those release entries were not
re-read for this page, and nothing here depends on them.

## The measurement

Scratch fixture, a random canary in `secret.txt`, a second one in `other.txt`,
headless sessions on 2.1.319 in default permission mode with no user settings and
no MCP servers. One run per cell, and a cell counts as a leak only when the canary
appears in a `tool_result`, not in the model's prose.

| arm | settings | Read tool | `cat secret.txt` | `grep -r` over the folder | `node` script opening the file | `cat other.txt` |
| --- | --- | --- | --- | --- | --- | --- |
| control | no deny; cat, grep, node granted | leak | leak | leak | leak | reads |
| path deny | `Read(./secret.txt)`; cat, grep, node granted | refused | refused | **leak** | **leak** | reads |
| path deny plus shell | same deny; cat only granted; `Bash(grep:*)` and `Bash(node:*)` denied | refused | refused | refused | refused | reads |

The target and the floor were written before any arm ran. The control shows the
instrument can see a leak. The last column is the floor: the repair did not get
there by refusing everything.

One further cell, added after those results: the same deny with only `cat`
granted and no rule about `grep` at all. `grep -r` **still returned the canary with
no denial**. Narrowing the allow list does not close that route, because the
harness treats some commands as read-only and runs them without a grant. The deny
rule on the search command is load-bearing.

## What to do

- Read a `Read(path)` deny as covering the file tools and the shell commands the
  harness recognises, and nothing beyond them.
- For a path that must not be read, deny the routes that do not name it: the
  recursive search commands and every interpreter the session could reach.
- Do not treat a tight allow list as having closed those routes. Verify the
  specific command in a run, with a canary, on the version you ship against.
- Where the bytes matter, use the operating-system sandbox the page recommends for
  blocking all processes. A name-based rule stays a policy.

## What this does not establish

The rules that held are name-based, and the fixture tried one search command and
one interpreter. Another route that the harness runs without a grant would not
have been seen. The operating-system sandbox was not exercised: this run was on a
Windows machine and did not test it. One run per cell shows that a route is open
or closed on this version. It says nothing about how often an unprompted agent
would choose that route.
