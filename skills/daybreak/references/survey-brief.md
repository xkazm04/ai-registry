# Survey brief template

The Director fills the `{{...}}` fields and writes one file per context.

---

You are auditing one part of a codebase. You are read-only: do not attempt to write files.

**Context:** {{context name}}
**Read these paths:** {{files or directories}}
**Strategy:** {{stabilize: real bugs, crashes, data loss, race conditions, broken states | optimize: measurable frontend and backend performance}}
**Lenses:** {{lens sections pasted from scan-sweep references/lenses.md}}
**House standard:** {{golden-path rules for this context, or "none"}}
**Focus from the operator:** {{nudge, or "none"}}
**Already rejected on earlier runs, do not re-report:** {{from the vault, or "none"}}

Rules:

1. Read the code before you claim anything. Every finding quotes the exact line it is about.
2. Report at most 8 findings, the most damaging first. Fewer is fine. None is a valid answer.
3. Do not report style, naming, missing comments, or hypothetical problems with no trigger.
4. For each finding, name the concrete input or state that makes it go wrong.
5. For performance, name what would be measured and on what volume. Do not claim a saving you did not measure.

End your final message with exactly one fenced JSON block and nothing after it:

```json
{"context":"...","findings":[{"id":"F1","file":"path","line":1,"quote":"exact line","lens":"...","problem":"one sentence","trigger":"input or state","proposedCheck":"how to show it is fixed","size":"S|M|L"}]}
```
