---
kind: procedural
confidence: 1.0
namespace: platform
source: incident-retro
---

# Rolling back a bad release

What worked, in order, the last four times a release had to be pulled. Follow it top to bottom;
the ordering is the part that was learned the hard way.

## The sequence

1. **Decide to roll back before you diagnose.** The decision is "is the current state worse than
   the previous state", nothing else. Diagnosis happens after traffic is safe. Every incident
   that ran long, ran long here.
2. **Roll back the deployment, not the code.** Re-deploy the previously known-good build
   artifact. Do not revert commits and wait for a build - that adds a full CI cycle to the
   outage and ships an artifact nobody has run.
3. **Check whether a migration is involved.** If the release included a schema change, stop and
   confirm the previous build runs against the current schema. Where it does not, the rollback
   is a forward fix, not a rollback, and it needs a second pair of eyes before it is applied.
4. **Announce with a timestamp.** One message: what was rolled back, from which version to
   which, at what time, and who is holding the incident. Everything else can wait.
5. **Revert the commit on the default branch afterwards.** Not before - a revert commit while
   the deployment rollback is in flight has repeatedly produced two people deploying different
   things at the same time.
6. **Write the retro entry the same day**, as an `episodic` memory note. Any later and the
   detail that mattered is gone.

## Preconditions that make this fast

- The previous artifact is still available and deployable (retention long enough to matter).
- Migrations are backward compatible for at least one release: add columns, never rename or drop
  in the same release that starts using them. This single rule is what makes step 2 safe.
- One documented command per environment for "deploy this specific version".

## Known failure mode

Rolling back a release that carried a destructive migration is not possible. The prevention is
the expand-then-contract discipline in the preconditions, applied when the migration is written,
not when the incident starts.
