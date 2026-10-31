---
layer: application
type: application
subject: repository-landing-document
technique: input-channel-distinction
stack: node
verified_on: 2026-10-31
verified_against: node@22
applied: code
ab_verdict: better
proof: ab-paired
---

# Two shells, one fence: a desktop app's installer commands

`github.com/xkazm04/personas` @ `460d9e0b4e` is a desktop app built from a
node toolchain (the version witness is the tree's `.nvmrc`, which pins 22;
`package.json` `engines` admits `>=20.0.0`). Its `README.md` sends readers to
**two shells**: the setup section opens with `### Windows setup` (line 227)
and five PowerShell blocks, then gives macOS and Linux their own `bash`
blocks. No block in the document is addressed to a conversational agent, so
the destination the technique is usually read for is absent here. The second
destination is a second shell dialect, and this tree shows that the fence
cannot tell the two apart.

## The seam

Before this change, the tier-locked installer block was a `bash` fence
holding `VITE_APP_TIER=starter npm run tauri build`. A leading environment
assignment is POSIX shell syntax. In PowerShell it is parsed as a command
name and fails. Nothing in or directly above the block named a shell. The
fence's `bash` info string was the only signal, and a code host does not
display a fence's language tag. Syntax colouring is the only trace it leaves,
and no reader treats colouring as an instruction. So the reader the README
had just walked through PowerShell setup reached a block whose single
distinguishing mark renders nowhere, on any surface.

The rest of the setup section already passes the technique. The headings
carry the destination: every PowerShell block sits under `### Windows setup`
and every POSIX block under a macOS or Linux heading. The one failure was
the block that sat under `### Build tiers`, a heading that names a feature
and not a shell.

## A and B

The instrument was a scratch detector run once per arm over the same file.
It flags a fenced block that would run in one dialect the document sends
readers to and fail in the other, when no text inside the block or on the
line or heading directly above it names the destination. Before reporting,
it checked itself against six fixtures with hand-counted answers.

| | target: misroutable blocks | floor: landing-document findings | floor: command lines removed |
| --- | --- | --- | --- |
| A, as shipped | 1 (`README.md` installer block) | 2 (prose budget, uncanaried badges) | n/a |
| B, `460d9e0b4e` | 0 | 2, the same two | 0 |

Arm B adds 11 lines and changes one. The intro sentence now names its
shells. The block opens with a one-line lead-in naming the POSIX shell and
pointing PowerShell readers to the next block (lines 315-320). The new
sibling `powershell` block opens with its own lead-in (lines 324-330). Its
third line clears the variable before the default build, because in
PowerShell an `$env:` assignment persists for the whole session, so the
POSIX block's implicit "unset means everything" would otherwise not hold.
Every command line from arm A is byte-identical in arm B. The floor was read
from the registry's `check-readmes` instrument over both arms in one
scratch layout, so its badge check saw the same link targets on each side.

## What the fleet survey said about the rule

The same detector ran over fifteen landing documents: fourteen fleet
projects and this registry's own front page. Two readings of the
technique's first clause were compared.

- **Strict.** The fence belongs to the shell, so any fence holding something
  else counts as a shared channel, and in a multi-shell document so does any
  block without an in-block lead-in. This reading flagged **32 of 53**
  fences.
- **Hazard.** Flag only a block that would visibly fail in another
  destination the document names. This reading flagged **5**: one here, two
  in another project's "first tracked event" block (POSIX continuations and
  a heredoc, placed after PowerShell install lines), and two `irm` blocks in
  a README that also points readers at a Linux build.

A hand read confirmed all five. The 27 the strict reading added were
directory trees, ASCII diagrams, source code, and portable lines such as
`npm install`, which run identically in both shells.

Three structural facts came out of this:

- No landing document in the fleet carries a block of agent speech. The
  technique's second destination is reached by shell dialect first.
- Layout content cannot leave the fence. Monospace alignment is the only
  thing a tree or a box diagram needs, and the fence is the only channel
  that preserves it. A tree's content announces itself, so the shared
  channel costs nothing there.
- A lead-in placed in a heading survives the strip just as well as one
  placed inside the block. This README's setup section depends on that.

## What this cannot show

No reader was observed. The verdict says the misroutable block is gone and
nothing else moved; it does not say a PowerShell reader would have failed
without the change, and that is the technique's premise, not this tree's
evidence. The hazard detector's recall was checked against the same author's
hand read, which shares its blind spots. The hazard reading was ported into
the registry's `check-readmes` in the same run, and it reproduces the five
flags above exactly. Nothing runs that instrument on a clock, so the next
edit to this README is gated only when someone sweeps.
