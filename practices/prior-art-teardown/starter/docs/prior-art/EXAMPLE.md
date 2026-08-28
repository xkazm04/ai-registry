# <OTHER PROJECT>: what we can learn from it

**Pinned at:** `<version, tag or commit>` - **read on:** `<YYYY-MM-DD>` - **read by:** `<who>`

<!--
Rename this file to the project's slug. Every citation below is `path:line` relative to THEIR
repository root, against the pin above. If the pin changes, the citations are suspect until
re-checked.
-->

## 1. What it is

TODO: one paragraph. What problem it solves, for whom, and the one architectural decision that
shapes everything else about it.

TODO: name the two or three documents in their tree that carry the most design intent. In most
projects these are not the README - they are the design notes, the architecture doc, or the
comments on the hardest subsystem.

## 2. How it works, by subsystem

<!-- Organize by OUR concerns, not by their directory layout. One subsection per concern that
matters here; delete the ones that do not apply. -->

### <Concern>

TODO: how they solve it (`<their/path.ext>:<line>`).

TODO: the decision inside that solution that could have gone the other way, and any evidence in
the tree about why it went this way - a comment, a test name, a commit message, a config default.
This is usually the most valuable line in the whole teardown.

## 3. What we take

| Idea | Copy or adapt | Answers which concern here | Notes |
| --- | --- | --- | --- |
| TODO | `copy` / `adapt` | TODO | TODO: if adapted, what changed and why |

## 4. What we explicitly do NOT take

<!-- The section that pays for this document. Be specific about the reason: "wrong for us
because X" outlives "not needed". -->

- **TODO: the idea.** Why not: TODO. What would have to change for this to be worth
  reconsidering: TODO.

## 5. Where they are ahead of us

TODO: state it plainly, with the citation. If this section is empty, the teardown is not finished
- an implementation worth studying is ahead somewhere.

## 6. Open questions

TODO: what could not be determined from the code, and what would answer it (running it, reading a
specific test, asking them).
