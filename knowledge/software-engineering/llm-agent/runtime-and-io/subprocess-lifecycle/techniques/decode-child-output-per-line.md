---
layer: technique
type: technique
subject: subprocess-lifecycle
technique: decode-child-output-per-line
status: forged
laws: [gate-sees-target, failure-not-empty-success]
shared_with: []
use_when: [a host turns a child process's captured bytes into text, child output shows replacement characters or box-drawing garbage where letters belong, one captured stream mixes tools that write different encodings, a parser or a model reads text decoded from a console program]
---

# Decode child output per line

A host that captures a child's output holds bytes, and every consumer
downstream - a parser that counts findings, a dashboard that shows a step's
output, a model that reads a tool result - holds text. The decode between them
is a decision, and it is almost always made by default: interpret the bytes as
the encoding the host itself uses, and substitute a replacement character for
anything that does not fit. That default is right for every child that writes
in the host's encoding and silently wrong for the rest, and nothing errors
when it is wrong. The parser reads a mangled line as a line; the model reads
it as what the tool said ([gate-sees-target](../../../../_laws.md#gate-sees-target)).

## The environment does not decide every child's encoding

[spawn-contract](./spawn-contract.md) pins locale and encoding settings in the
child's constructed environment so that output parsing does not vary by
machine. That holds wherever the environment is what decides the encoding. It
does not hold on a platform whose console programs write in the **console's
code page** - a property of the console, not of the environment - and whose
shell built-ins and many native tools ignore every locale variable a host can
set. On such a machine, a program the host spawned through the system shell
writes its own lines in a legacy code page whatever the child environment
says. Pin the environment anyway; it governs the children that read it. Then
decode as though some children did not.

The discriminator is one question: **does this child's encoding come from its
environment, or from something the host cannot set at spawn time?** Where the
answer is the second, decoding is the host's job and pinning cannot do it.

## The line is the unit

Three decoders are available and two of them are the ones teams reach for.

- **Decode the whole stream in the host's encoding, lossily.** Every
  legacy-encoded letter outside the shared ASCII range becomes a replacement
  character. Measured on a machine whose legacy page was a Central European
  one: a nine-letter word echoed by the system shell arrived with four of its
  letters replaced.
- **Decode the whole stream in the legacy page.** This is the obvious fix, and
  it fails on the first stream that mixes tools. A step that runs a modern
  tool and then a shell built-in writes lines in two encodings into one pipe;
  measured on the same machine, decoding that stream in the legacy page turned
  every non-ASCII letter of the modern tool's line into box-drawing glyphs. The
  fix moved the damage from one half of the output to the other.
- **Decode each line on its own.** Keep a buffer that is valid in the host's
  encoding as it is - the fast path, and the only path a host whose children
  all speak its encoding ever takes. Otherwise split on the newline, keep every
  line that is valid as it is, decode each line that is not in the legacy page
  **only if that decode is error-free**, and give whatever is left the lossy
  decode it would have had anyway. Measured on the mixed stream above, this is
  the only one of the three that returned every letter of both halves.

A line is the right unit because it is the unit tools write in: a program
emits whole lines in one encoding, and two programs sharing a pipe interleave
at line boundaries. A fixed run of bytes is the wrong unit for the same
reason - a double-byte legacy page splits characters across any boundary the
host did not choose - and a filter that stops at the first undecodable line
is worse than either, because it drops every line after it.

Two residues are worth stating rather than discovering. A legacy line that
happens to be valid in the host's encoding is read as the host's encoding; per
line that collision is rare, per buffer it was the rule. And a page the host
cannot map is not a reason to fail the call: fall back to the lossy decode for
that line and say so **once** on the operator's surface, because a replacement
character in a captured result is a loss presented as content
([failure-not-empty-success](../../../../_laws.md#failure-not-empty-success)).

## Which legacy page

The page a child writes in depends on what the child's console is, and the
host has to reason from its own position:

- **A host with a console** shares its page with the children that inherit
  it; the console's current output page is the answer, and it is the first
  thing to ask for.
- **A host without one** - a desktop application, a service, a detached
  daemon - gets an empty answer from that query. Measured from a parent with
  no console, the query returned zero, and the child shell, given a fresh
  console with no window, wrote in the system's default legacy page. That
  system default is the answer, and a host that only asks the first question
  falls straight through to the lossy decode on exactly the machines where it
  matters.

So the lookup is an ordered list - the console's page where there is one, the
system's legacy page otherwise - and it is the only part of this technique
that is platform-specific.

**Error-free is not evidence that the page was right.** A single-byte legacy
page maps every byte to some character, so a decode in the wrong single-byte
page never fails; it produces different letters. A source tree whose
console-less fallback was the platform's *other* legacy page - the one
graphical programs use, on the stated belief that a console program writing to
a pipe switches to it - decoded the measured bytes cleanly into a word with
four wrong letters, where the lossy decode it replaced had at least shown four
replacement characters. The wrong page is worse than no page: a replacement
character is visible, a plausible wrong letter is not. The check that catches
it is the one the decoder cannot run on itself - capture a known word from the
tools the host actually spawns, decode it under the chosen page, and compare.
Which page a given program writes in is a fact about that program; measure the
ones you spawn rather than reasoning from the platform's documentation.

## Gate the lookup, not the walk

Write the line walk to take the legacy decoder as a parameter, and keep only
the code-page lookup behind the platform condition. Then the walk compiles
and is tested on every platform the project builds on, with a stand-in
single-byte decoder, while the platform-specific half is a few lines that ask
one question. The alternative - the whole decode behind the platform
condition - is code that only one runner in the matrix ever compiles, on the
platform where the defects are; no machine in the matrix speaks the legacy
page by accident, so its tests have to be written against captured bytes
rather than discovered.

Capture the bytes once, from the real tool on a real machine with the legacy
page set, and pin them in the test. The paired assertion is cheap and it is
the regression test: the lossy decode of those bytes loses letters, and the
per-line decode returns them.

## Decision rules

- Treat the decode of a child's output as a decision, made in one place every
  capture site calls, not as an inline default at each site.
- Keep a buffer that is valid in the host's encoding untouched; walk lines
  only when it is not.
- Per line: keep valid lines, accept a legacy decode only when it is
  error-free, and fall back to the lossy decode for the rest.
- Never decode a whole mixed stream in the legacy page.
- Look the page up from the host's position: the console's page when the host
  has a console, the system's legacy page when it does not.
- Verify the chosen page with a captured known word from the tools the host
  spawns; an error-free single-byte decode proves nothing.
- Pass the decoder in; gate only the lookup on the platform.
- Report an unmappable page once, on the operator's surface.

## When not to use it

A host whose children all write in its own encoding, on a platform where the
environment decides the encoding, needs only the pinned environment that
[spawn-contract](./spawn-contract.md) already builds; the per-line walk would
never leave its fast path. Binary output is not text and is not decoded at
all. And a protocol stream with a declared encoding - a structured envelope a
child emits on purpose - is decoded by its declaration, not by guessing.
