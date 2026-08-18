# Org memory index

A map of content for the notes under `memory/`. Every note carries frontmatter
`{kind, confidence, namespace, source}`; `kind` is one of `episodic`, `semantic`, `procedural`,
`summary`.

This file is a navigable MOC (it works as-is in Obsidian). Ascent regenerates it when it indexes
the registry; edit the notes, not the counts.

## By kind

### Semantic - durable facts about the org, its systems, its conventions

- [Service naming and ownership](semantic/service-naming-and-ownership.md) - `platform`,
  confidence 1.0. Domain-first repo names, one owning team per repo, never a person.

### Procedural - what worked: a workflow, a runbook, a tool sequence

- [Rolling back a bad release](procedural/rolling-back-a-bad-release.md) - `platform`,
  confidence 1.0. Decide before diagnosing; roll back the artifact, not the code.

### Episodic - what happened: an event, an incident, a decision on a date

- [2026-06-11: required checks](episodic/2026-06-required-checks-decision.md) - `engineering`,
  confidence 1.0. Four checks made blocking after a two-week grace period, and why the grace
  period was the reason it landed.

### Summary - rollups that consolidate other notes

- [2026 H1 delivery guardrails](summary/2026-h1-delivery-guardrails.md) - `engineering`,
  confidence 0.6. What the guardrails changed, what they did not, what to try next.

## By namespace

- `platform` - service naming and ownership, rolling back a bad release
- `engineering` - required checks decision, 2026 H1 delivery guardrails

## Conventions for a new note

- One idea per note. A note that needs an "and" in its title is two notes.
- `confidence`: `1.0` verified or decided, `0.6` probable but unverified, `0.3` a hunch that
  needs checking. Lower it rather than deleting a note that has aged.
- `source`: where the claim came from (`decision-record`, `incident-retro`, `architecture-review`,
  `half-year-review`, ...), so a reader can weigh it.
- `namespace`: the scope it applies to (`platform`, `engineering`, a domain). Leave it off only
  for something that is true org-wide.
- Supersede rather than rewrite history: add `supersedes: <path>` to the new note and leave the
  old one in place.
