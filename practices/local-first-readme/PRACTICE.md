---
id: local-first-readme
dimension: D5
applies-when: "The repo is an open-source app that can run on the reader's own machine, and its README does not get a non-developer from clone to a running instance in one screen."
---

# Local-first README

**What it gives you:** a front door that a non-developer can walk through - what the app does,
how to run it for free in two minutes, and what the hosted version buys them - so the decision
to run it themselves is made on the README, not on a support ticket.

**Dimension:** D5. **Starter:** [`starter/README.md`](starter/README.md).

## The shape

A conformant repo carries one root `README.md` with these six parts, in this order. This is the
*shape* - no repo's actual content travels with it.

1. **What it is.** Three sentences in the user's words: the job it does, who it is for, and what
   makes it different. Plus one real screenshot or short GIF of the product. Never a placeholder
   image - a reader who sees a wireframe assumes the product is one.
2. **Two-minute local start.** The genuinely free, key-free path first: clone, install, run,
   open. Stated as the default path, not the fallback. Any prerequisite (a runtime version) in
   one line. If the app needs a key to do anything at all, say so here in one sentence and link
   to part 5.
3. **Set it up with your AI.** A pointer to the `/onboarding` skill: run the agent CLI in the
   checkout and type `/onboarding`. One sentence on what it does - probes dependencies, asks
   what you want switched on, writes keys, verifies the app boots, and hands back a capability
   matrix.
4. **Local vs hosted, honestly.** A short table. Features are identical. Local: your data stays
   with you, you pay your own model cost, you run it. Hosted: zero ops, always on, support,
   priced on outcomes or operation. Include this sentence verbatim:
   "If the hosted version is ever better than this repository, that is a bug." Hosted plans buy
   operation, not capability.
5. **Capability / keys table.** One row per optional key: what it unlocks and what happens
   without it - works, degraded, or hidden. This table and the app's onboarding overlay describe
   the same facts; when one changes, the other changes in the same commit.
6. **Pointers.** Where developer material lives (`docs/`), how to contribute
   (`CONTRIBUTING.md`), and the license.

## Why this shape

The README is read by two audiences and written for one of them. The person deciding whether
to run the app is not a developer of it, and reads until the first thing they cannot follow.
So the free path comes before the AI path, the AI path before the pricing table, and everything
a developer needs to change the code goes to `docs/`. Part 4 is where trust is won or lost: a
reader who suspects the repository is a crippled demo of the hosted product stops reading, and
the invariant sentence is the cheapest way to say it is not.

## Rules

- Everything that is not one of the six parts moves to `docs/`: benchmarks, bibliographies,
  ops runbooks, architecture, changelogs.
- Every claim is true today. Nothing "will run locally" - if it does not yet, the README carries
  an explicit status line saying what does and does not run.
- English is the OSS front door. Product pages may be localized; the README is not.
- No telemetry or privacy claim beyond what the code does. "No data leaves your machine" is a
  claim about the code, and the code must be able to back it.
- Keep it under about 200 lines. Past that, the part being skipped is chosen by the reader.

## How to tell it is working

- Someone who has never seen the repo runs it from the README alone, and the first question
  they ask is about the product, not the setup.
- The capability table and the onboarding overlay have never disagreed. Diff them.
- A hosted-vs-local question has not been asked in issues since the table landed.
- The README shrinks when `docs/` grows, not the other way round.

## Adopting it

1. Copy `starter/README.md` over the repo's README (keep the old one open beside it).
2. Fill every `<...>` and `TODO:` from what the app does today. Take the screenshot from a
   running instance, not a design file.
3. Move every section the old README had beyond the six parts into `docs/`, and link it from
   part 6.
4. Run the two-minute path on a clean machine, with no keys set, and time it.
5. Copy the capability rows from the app's onboarding overlay, not from memory.

## Anti-patterns

- The hosted path first, the local path under "Advanced" or "Self-hosting". The repository is
  the product; the hosted version is a way of running it.
- A placeholder image, a logo instead of a screenshot, or a screenshot of the landing page.
- A local start that silently needs a key. Degraded is honest; a crash on first run is not.
- A capability table maintained by hand while the overlay is generated from code. One of them
  is wrong within a month.
- Localizing the README to the product's home market. The front door is for everyone who can
  clone it.
