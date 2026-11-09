# Build brief template

The Director writes this in its own words after opening the code. It is never the
surveyor's text with a header on it.

---

You are implementing one fully specified change. The design is decided; do not redesign it.

**Repository conventions:** {{the digest from the project's AGENTS.md or CLAUDE.md}}

**The problem:** {{what goes wrong, and the trigger, verified by the Director}}

**The change:** {{exact, per file, naming the functions and the behavior after}}

**Change only these files:** {{list}}

**Proof:** {{the test to add or the command to run, and the result it must give}}

Rules:

1. Change only the files listed. If the change needs another file, stop and say which and why.
2. Never edit, skip, or delete an existing test to make it pass. If one fails because of this change, stop and report it.
3. Do not add catch-alls, type escapes, or lint suppressions.
4. Do not refactor, rename, or reformat anything the change does not require.
5. Do not run git commit, and do not install packages.
6. If the code does not match this description, change nothing and say what you found. That is a useful result.

End your final message with: files changed, the proof command and its actual output, and anything you could not do.
