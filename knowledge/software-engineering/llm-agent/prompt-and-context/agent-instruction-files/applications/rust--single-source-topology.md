---
layer: application
type: application
subject: agent-instruction-files
technique: single-source-topology
stack: rust
verified_on: 2026-09-04
verified_against: rust@1.93.1
applied: experiment
ab_verdict: better
proof: ab-paired
---

# Nine bytes: the link bridge that survives review and not the checkout

Sōzu (`github.com/sozu-proxy/sozu`, commit `cd023104`, 2026-08-28; toolchain
witness `rust-toolchain` = `1.93.1`) ships its agent instructions the way this
subject recommends. `CLAUDE.md` is the canonical 2,399-word file, and it says
so in its own second paragraph: "This file is the primary agent instruction
for the repo. It is symlinked to `AGENTS.md` so OpenAI Codex picks up the same
content." One document, two vendors, no copy — the strongest form of the
single-source rule, chosen deliberately and explained in writing.

On the machine this was read on, `AGENTS.md` is a **nine-byte regular file
containing the text `CLAUDE.md`**.

## The two arms

The measurable is the one that matters to a reader: **how many bytes of
instruction does an agent receive when it opens the bridge file by name?**
Same instrument on both arms — `git ls-files -s` for the recorded mode, `od
-c` for the materialised bytes, `wc -c` for the size.

**Arm A — the filesystem link.** A shallow clone of the repository on Windows
11, into a checkout where `git config core.symlinks` reports `false` (git set
this itself; the platform did not grant the privilege):

```
$ git ls-files -s AGENTS.md CLAUDE.md
120000 681311eb... 0    AGENTS.md
100644 1409c5e9... 0    CLAUDE.md
$ ls -la AGENTS.md
-rw-r--r-- 1 kazda 197610 9 Sep  4 18:55 AGENTS.md
$ od -c AGENTS.md
0000000   C   L   A   U   D   E   .   m   d
```

The index records the link faithfully. The working tree holds a regular file.
An agent that opens `AGENTS.md` receives **9 bytes** where 2,399 words were
intended — a 99.9% loss, and not a partial one: it gets a bare filename with
no newline, no directive, and no indication that anything is missing. Result:
**0 of 2,399 words delivered.**

**Arm B — the reader-resolved import bridge.** Six repositories in a
thirteen-project fleet on the same machine ship both filenames. Every one of
them uses a one-line import directive rather than a link, and every bridge
resolves:

| repo | `CLAUDE.md` | bridge | resolves |
|---|---|---|---|
| politicas | 17,740 B | `@AGENTS.md` line 1 | yes |
| kp | 4,655 B | `@AGENTS.md` line 1 | yes |
| systedo-case | 2,480 B | `@AGENTS.md` line 1 | yes |
| gravitone-gcloud | 17,833 B | `@AGENTS.md`, `@.claude/patterns/README.md` | yes |
| ascent | 11 B | `@AGENTS.md` (whole file) | yes |
| personas-web | 11 B | `@AGENTS.md` (whole file) | yes |

Seven import directives across six repositories, seven resolving to an
existing file, zero links in any index in the fleet. Result: **canonical
content delivered on both filenames, on this platform.**

## Why the failure is worse than the drift it was avoiding

The link regime is adopted on a promise: drift is not representable, so
nothing needs checking. That promise is what makes the failure expensive. A
drifted copy is wrong in places and is caught by the obligations the copy
regime forces on you; a materialised link is wrong *entirely* and carries no
obligations, because the regime was selected precisely to retire them.

And every cheap check passes. The file exists. It is readable. It is
non-empty. Its content is a plausible relative path — it is, in fact, exactly
the right path, which is the cruellest part: a human glancing at the file sees
the correct answer and an agent reading it as instructions sees nine bytes of
noise. Nothing in the repository is wrong; the repository is correct upstream
and the mode is right in the index. The defect lives entirely in the
materialisation, which is per-machine, invisible to review, and invisible to
CI on a platform that does materialise links.

## The structural fact

The fleet arm is not a control I constructed — it is six independent
repositories that converged on the import bridge without a written rule
telling them to, on a platform where the link regime silently fails. One of
them, `systedo-case`, even carries the failure mode as prose: its `CLAUDE.md`
opens "**If your reader did not resolve the `@AGENTS.md` import on the line
above, open `AGENTS.md` now**", a hand-written fallback for a bridge nobody is
checking mechanically.

That sentence is the finding stated from the other side. The fleet knows the
bridge can fail to resolve, has written a human-readable apology for it, and
has no assertion anywhere that it resolved. Seven directives, seven manual
verifications performed for the first time by this run.

## What this realization cannot do

It cannot generalise the platform boundary from one observation. `core.symlinks
= false` here is a Windows default without Developer Mode or elevation; the
same clone on a machine with the privilege materialises a working link and
every measurement above inverts. So the arms are not "link bad, import good" —
they are "the link regime's guarantee is conditional on a property of the
checkout that the repository cannot see, and the import regime's is not." A
team whose contributors are all on one platform loses nothing by linking. A
team that cannot enumerate its contributors' platforms is making a bet it has
no instrument for.

The cheap repair is the same in both regimes and neither had it: assert that
the bridge resolves to the canonical document, on every machine, in whatever
gate already runs. One line, and it is the only thing that distinguishes a
working bridge from nine bytes of text.
