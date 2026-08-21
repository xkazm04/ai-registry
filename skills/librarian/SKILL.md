---
name: librarian
description: "Maintain the registry as a whole: sweep every bundle for structural and quality decay, rank what needs work by measured attention points, and dispatch scoped /deepen or forge workers at it. Keeps coverage memory in an Obsidian vault under librarian/ so each run knows what the last one touched, what is saturated, and what is owed. Run manually; a scheduler is a later wrapper. Use when nobody has looked at the registry in a while."
category: ai-native
memory: project
version: 1.1.0
tags: registry, maintenance, coverage, dispatch, quality
---

# Librarian

The registry has three content engines and they are good. `domain-knowledge-forge`
creates a bundle from a repository's ceiling. `deepen` raises one subject above any
repository, with research lanes and a saturation ledger. `research` runs inward: it
mines a source somebody handed us for what it changes here, and banks what it cannot
prove as a dated lead.

**This skill is none of them.** It is the layer that decides *what to run, where, and
whether it was worth running* - a warden over structure and a dispatcher over the
engines. It keeps the coverage memory that lets run N+1 know what run N did.

Say that out loud in every session, because the failure mode for a skill like this is
re-implementing deepen's research lanes badly under a new name. **If the answer is
"research this subject", the answer is `/deepen`, dispatched from here.** If it is
"mine this link", the answer is `/research`, and a human has to bring the link.

## Invocation

```
/librarian              # sweep + report, writes no content
/librarian run [domain] # the full loop, dispatches workers
/librarian structure    # the mechanical pass only - cheap enough for every merge
/librarian status       # read the vault, touch nothing
/librarian reflect      # update the standard + this skill from what the last runs taught
```

## Never count anything yourself

`node scripts/librarian-scan.mjs --json` is the instrument. It emits, per subject:
technique and application counts, stack diversity, missing `use_when`, body mass,
oldest `verified_on`, expired and at-risk applications, version witness, consumer
demand where it exists, last-swept date, dry streak, and an attention score with its
reasons. `node scripts/check-currency.mjs --json` adds the decay detail.

This registry once reported a content gap at 0/267 over a corpus that was at 267/267,
because a counter read a different shape than the parser emitted. **Verify the
instrument before reporting a gap**: spot-check one number against one real file every
run. A model that counts its own corpus produces a confident number nobody can check.

## The loop

**1. Prove the instrument.** `check-bundles`, then `build-index`, then `build-catalog`
(that order - the catalog hash covers the index). Then the scan. Confirm one figure by
opening one file. If a gate is red, stop: you are about to rank a corpus that does not
parse.

**2. Sweep and score.** Read the scan fresh. **Never carry forward last run's derived
numbers** - deepen learned this the expensive way, and the vault stores what was DONE,
never what was computed.

**3. Structure pass.** Cap breaches, taxonomy drift, orphan techniques, dead links,
file health. All mechanical, all fixable in-session, none needing a worker. A cap
breach is fixed by editing `taxonomy.json` and running
`node scripts/apply-taxonomy.mjs <bundle> --to nested --apply` - never by moving a
folder, because relative links encode depth and the mover is what rewrites them.

**4. Rank.** The scan orders by attention points. Then apply the three judgments a
script cannot:

- **Demand outranks structure.** A consumer deviation or a citation reported `gone`
  beats any structural gap. But when `demandKnown` is false, demand is UNKNOWN, not
  zero - say so in the report rather than ranking as though nobody needs anything.
- **Suppress the saturated.** A subject with `dry_streak >= 2`, no expired clock and
  no event to point at does not get re-run. That is deepen's law and it is what stops
  the loop burning tokens on settled ground.
- **Systemic beats individual.** When one defect dominates the worklist across dozens
  of subjects, the fix is one systematic pass, not forty dispatches. Notice this
  before you dispatch, not after.
- **A due lead is cheaper than a fresh scan.** `librarian/sources/` holds findings a
  research run proved real and could not land, each with a return condition. Read them
  before ranking: a lead whose condition has arrived is work somebody already scoped.

**5. Dispatch.** A fleet of scoped workers, **cap 10 concurrent, topped up one per
completion** - the number both existing skills converged on across measured runs. Each
worker owns exactly one subject folder and **resolves its path from
`knowledge/<bundle>/index.json`, never constructs one**. Cross-subject findings come
back as proposals for you to place; a worker that writes outside its folder is the
collision the scope rule exists to prevent.

Choose the engine by what is missing:

| finding | engine |
| --- | --- |
| subject is thin, stale, or contradicted | scoped `/deepen` |
| subject does not exist but should | forge wave (`domain-knowledge-forge`) |
| a banked lead in `sources/` came due | scoped `/deepen` at the subject the lead names |
| missing `use_when`, dead link, bad frontmatter | fix in-session; no worker |
| cap breach, misplaced subject | `apply-taxonomy.mjs`; no worker |

**6. Review diffs, not reports.** Purity grep over the upper layers, read every new
technique, check corrections against the file's prior voice. Not delegable, and it is
what sets the batch ceiling near 8 per sitting.

**7. Commit, write the vault, reflect.** Atomic commits per subject. Then update
`librarian/subjects/<domain>/<subject>.md` for everything touched, the domain note,
and one run note. **Record what you declined and why** - a decline nobody wrote down
gets re-proposed every run forever.

## The vault

```
librarian/index.md                        map of content
librarian/standard.md                     the bar every sweep grades against
librarian/projects.md                     which connected project relates to which bundle
librarian/domains/<domain>.md             per bundle: last swept, shape, what is owed
librarian/subjects/<domain>/<subject>.md  last touched, dry streak, open leads, declines
librarian/runs/<YYYY-MM-DD>-<n>.md        what one run swept, dispatched, accepted, declined
librarian/sources/index.md                the ledger of external sources /research mined
librarian/sources/<YYYY-MM-DD>-<slug>.md  what one source yielded, and what it did not
```

Obsidian-navigable: wikilinks between notes, one fact per note. It lives in the
registry because it is reviewed like everything else here and readable with no tool.

Subject notes are created when a subject is first touched, not up front - 186 empty
notes would be noise, and "no note" already means "never swept", which the scan reads.

**The lane is public.** Scores, slugs and dates only. Never a consumer's paths - the
same rule as `usage/` and `signals/`.

## Rules that are not negotiable

- **Open a pull request; never push to `main`.** Merging is adopting and it is a human
  act - the whole governance model of this repository. This matters most when a
  scheduler eventually runs the loop unattended: build it in now, or the scheduler is
  the change that quietly breaks the model.
- **Work on a branch**, and verify `git log -1` is your commit before reporting.
- **Unknown is not zero.** An unwitnessed bundle is not a current one; an unswept
  subject is not a healthy one. Report absence as absence.
- **Dry is a result.** A sweep that finds nothing worth dispatching is a finding.
  Write it in the run note and stop. Do not pad a worklist to look productive.
- **Never edit the upper layers with product names.** The gate catches it; do not make
  it work.

## Scheduling (not yet built)

The loop is idempotent and its whole state is files, so a cron wrapper is small. What
that wrapper must preserve: the pull-request rule above, a token budget per run, and
`check-currency.mjs --fail-on-expired` as the trigger worth waking up for. An
unattended run that finds nothing should write a one-line run note and exit, not
invent work.
