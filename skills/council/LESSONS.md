# Lessons - council

Append-only, newest first. One block per run, headed with the version the run **used** -
not the bump it argues for - then the date and the project, then concise bullets.

## 0.1.0 - 2026-09-20 - ai-registry

**Authoring run, not a field run.** The method has not yet been driven against a real
subject, so nothing below is evidence that it judges well; these are observations from
building it and running the lane's own gates, and they are recorded here because this
lane's gate requires a skill to ship with at least one entry rather than an empty file.

- **Adding a key to the `signals/` lane is three files, never one.** The council feedback
  path (`bundles.<bundle>.councils`) was specified as a change to `signals-collect.mjs`
  alone. `check-signals.mjs` holds CLOSED key sets for both the top level and a bundle, so
  the collector would have written a file the lane's own gate rejects on the next commit.
  The change is the writer, the gate and `docs/signals-lane.md` together - and it was
  proved in both directions with a throwaway contributor file: one that must pass, and one
  carrying a prose key and a path-shaped slug that must fail.
- **A council line carries subject slugs but no bundle**, unlike a consult line. Resolving
  the bundle from `knowledge/<domain>/index.json` and DROPPING a slug that resolves nowhere
  was the only honest option; defaulting to `software-engineering` would file a real human
  verdict under the wrong corpus and nothing downstream could detect it.
- **`meta` earns its place as a denominator, not a notes field.** A bundle with no
  `councils` key cannot otherwise be told from a machine where no council log was readable,
  which is the same absent-is-not-zero rule the method's own `unmeasured` state exists for.
- **The trigger gate's containment is over the SMALLER vocabulary**, so a short description
  collides more easily than a long one. A long, specific description naming the method's
  own boundary (one finished subject, bounded members, a human gate it may not pass)
  reported no near-collision at all at the 0.45 report floor against the four skills it was
  most at risk from.
- **`node --test skills/council/tests` does not work on Node 24**; the directory form
  resolves as a module and fails with `MODULE_NOT_FOUND` while still printing a test count.
  The glob form `node --test "skills/council/tests/*.mjs"` is what runs. The suite was also
  proved able to fail by breaking one assertion (exit 1, the named test red) before being
  reported green, and `NODE_TEST_CONTEXT` was scrubbed from the environment first.
