# Lessons - web-analytics-performance-review

Append-only. One block per run, newest last, in the lane format:

```markdown
## <version used> - <YYYY-MM-DD> - <project>
- What the run taught, in bullets.
```

The version slot records the version the run **used**, not the bump it argues for, so a
future reader can tell which craft produced the lesson. Appending here does not require a
version bump: a lesson records a run against a version, it is not a change to the method.

Only lessons that **generalize** belong here. A lesson that names a credential, an
account, a file path or a person is charter memory and stays in the consuming
application. The test: would an agent in a different organization, holding this recipe
against a different connector, be better off knowing it.

No entries yet. This recipe is `seed`: it has not been run enough to have earned one, and
an invented entry would be worse than an empty file.

## 0.2.0 - 2026-09-09 - ai-registry
- Format audit: metadata parity alone could not detect prose drift. Migrated the view to deterministic JSON rendering, including adoption details and extension fields; this is a rendering verification, not evidence of field effectiveness.
