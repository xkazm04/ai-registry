# Lessons - project-populate

Append-only reflection lane. One entry per run that taught something. Format:
`## <version used> - <YYYY-MM-DD> - <project>` followed by `- ` bullets.

## 1.0.0 - 2026-08-23 - ai-registry (ported from the personas repo)

- **A consumer's security fix is an upstream obligation the moment the skill is shared.**
  The Personas app closed an unauthenticated local-HTTP hole (an RCE chain and a prompt
  injection): the dev-tools bridge this skill drives now gates every request on a shared
  secret plus a Host allowlist, with the port AND token in `~/.personas/local-http.json`.
  The skill's own copy in that repo was updated in the same commit - but three other
  projects consume this skill from the registry, and their copy still told an agent to
  call the bridge bare. A bare call now returns 401, which reads as "Personas is down"
  and sends the run down the wrong branch entirely.
- The lesson is about direction, not content: **the fleet's copy is the one that has to
  move first**, because every consumer inherits from it. A fix applied only in the repo
  where the defect was found leaves every other adopter running the pre-fix method with
  no signal that anything changed. Ported here with a minor bump so the version compare
  tells adopters to update.
