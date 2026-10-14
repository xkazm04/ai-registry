---
layer: technique
type: technique
subject: native-shell-integration
technique: native-side-owns-the-target-set
status: forged
laws: [verdict-survives-boundary]
shared_with: []
use_when: [a destructive or executing command accepts a list of paths from the presentation layer, a native command takes a string and hands it to a shell, deciding between an allow-list and a deny-list for what a command may touch, a layered safety check has a layer that logs and carries on, a capability manifest is scoped tightly and every product command is still callable]
---

# The native side owns the target set

The presentation layer is a document runtime that renders data from disk, from
the network and from the user's own files. The native process is the only
place the host's privileges live. Every command the presentation layer can call
is therefore a **privilege boundary crossing**, and the question the
[ipc-contract](../../ipc-contract/ipc-contract.md) subject does not ask is the
one that decides the blast radius: *if the caller is hostile or merely
corrupted, what is the worst argument it can send?* For a read command the
answer is a wrong number. For a command that deletes, spawns or writes, the
answer is whatever the argument names.

## Rule one: send an identity, not a target list

A destructive command should take a **handle the native side issued** and
re-derive the targets itself. The scan that found the candidates is native
work; it already holds the full set. A command that accepts the paths back from
the presentation layer is asking the less trusted side to restate what the more
trusted side already knows, and then deciding whether to believe it.

A handle also fixes a second defect for free: results are shown a page at a
time, so a path list built from what is on screen covers the first page and
silently omits the rest. The native side restoring the whole category from its
own session is the only way the selection and the deletion mean the same thing.
Sessions expire, so the handle needs a stated failure posture: an expired
session either refuses, or degrades to the explicit current-page list **and
tells the user it did**. It never quietly acts on less than was asked.

## Rule two: where a path must cross, test it against an allow-list

Some commands need a user-chosen path. For those, the native side owns a
**positive rule** for what the command may touch (a set of cache directories, a
set of file classes) and refuses everything that does not match it. A
deny-list of protected locations is a backstop, never the gate: it can only
name the dangers someone thought of, and each new system location is an
unguarded hole until somebody adds it.

Two properties make either list worth having:

- **Normalise before comparing.** Separator style, case, dot segments and links
  are all different spellings of one location. A prefix test on the raw string
  holds for the spelling the product itself produces and fails for every other.
  Resolve first, compare second; a test that only feeds canonical spellings has
  not tested the list.
- **Match whole segments.** A prefix or marker test passes a sibling whose name
  merely begins with the same letters. Anchor at the root and require a
  separator or the end of the string after the match.

## Rule three: every layer must be able to say no

A layered check is only as strong as its weakest layer's *effect*, not its
count. The common decay is a layer written as a log line: it detects the
condition, records it, and lets the act proceed. It reads as defence in review
and contributes nothing in operation. Audit a layered check by asking of each
layer what it returns on a hit; a layer whose answer is a warning is a comment.
Either make it refuse or delete it, because the reader of the code will count
it.

## Rule four: the manifest only governs what it names

A capability manifest scopes the permissions of the host's built-in plugins.
It does not, by itself, scope the product's own commands: those are reachable
from the presentation layer unless the product declares them. A tightly written
manifest beside a hundred undeclared commands is a statement about window
controls. Count the commands the presentation layer can call, count the ones
the manifest mentions, and treat the difference as the real surface. Pair this
with the document policy of the presentation layer: with no content policy set,
one injected script is a full caller of every command.

## Rule five: never build a shell string from an argument

A command that opens or runs something should call the host's open primitive
with the path as one argument, not compose a command line that a shell then
parses. A quoted string handed to a shell is re-tokenised by the shell's own
rules, and quoting, metacharacters and separator mixes are the shell's to
interpret.

The rule inverts where the string **is** the product: a test runner or task
runner exists to execute whatever command its operator typed. There the shell
string cannot be removed, so the bound moves to who may call it (an
authenticated caller, a project root the native side resolved from its own
records, a working directory the caller cannot choose) and the audit row says
so explicitly instead of reading "unbounded string".

## Discriminator

If the caller can only ask the native side for **information**, none of this
applies; the contract subject owns the shape. If the caller can cause the
native side to **act on the filesystem, the registry, or another process**,
this technique applies command by command, and the audit is a table: one row
per command, naming what argument it takes, who produced that argument, and
which rule bounds it. The rows that read "the presentation layer, an
unbounded string" are the findings.
