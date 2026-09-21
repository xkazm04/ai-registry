---
layer: technique
type: technique
subject: blind-judging-of-agent-runs
technique: provenance-scrubbing
status: draft
laws: [the-judge-never-grades-its-own-family]
shared_with: []
use_when: [building the material a model judge reads, checking that a judging packet leaks no producer identity, judging work whose subject matter is agent tooling]
---

# Provenance scrubbing

The concern: self-preference bias only operates when the judge can tell who produced the
work. Blinding is therefore a mechanical precondition of a usable verdict — and it is
harder than removing an author field, because provenance leaks through paths, phrasings,
banners and identifiers that nobody thinks of as attribution.

## Where provenance leaks

- **Working directory and artefact paths** that encode the configuration — a clone named
  after the model and its tier is an author line in every file header.
- **Runner banners and transcript framing** that name the tool.
- **Configuration echoes**: a settings file, an environment variable, a log line naming the
  model or the reasoning tier.
- **The run's own summary**, which may name its model, its tier or its vendor's tooling
  while explaining what it did.
- **Characteristic formatting** — a distinctive heading style or summary layout. This one
  cannot be scrubbed, which is why cross-family judging matters even with perfect scrubbing.

## The scrub, and its necessary exception

Replace vendor, model and tier tokens wherever they identify a producer. But a repository's
own files legitimately carry vendor words — guidance filenames, tool directories,
dependency names — and a task about agent guidance is *entirely* about such files. Scrubbing
them produces unreadable material and destroys the judge's ability to evaluate the work.

So the scrub is path-aware: a token that forms part of a filename or directory the
repository itself carries stays; the same token standing alone, or inside an artefact path
the harness created, goes. Getting this wrong in the safe direction (scrub everything) looks
conservative and quietly makes a whole task category unjudgeable.

## Verification

- **Grep every stored packet** for the token list after any change to the scrub, and treat a
  hit as a defect in the harness rather than in the packet.
- **Re-scrub when the token list grows** — a new model name in the fleet is a new leak in
  every packet built afterwards.
- **Treat a scrub change as cosmetic for re-judging purposes** where it only changes how a
  path renders: the judges saw the same run, and re-judging would resample noise rather
  than correct evidence.

## Decision rules

- **Blinding does not replace cross-family judging.** Style is unscrubbable; a judge of the
  same family recognises its own output without being told.
- **Never blind the harness's measured facts.** The facts are what the judge most needs and
  they carry no provenance; they are stated plainly as measured.
- **A packet that cannot be blinded is judged by a human or not at all.** Some material —
  a run whose whole output is its own tool configuration — cannot be anonymised, and
  pretending otherwise produces a verdict that is really a preference.
