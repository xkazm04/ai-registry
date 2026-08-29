---
name: onboarding
description: "Take a fresh clone of an app repo to a running, honestly-labelled install in one conversation: probe runtime deps, ask which connector capabilities the operator wants, collect keys into .env.local without ever echoing a secret, verify by booting the app, and hand back a capability matrix with three honest states per group (works / degraded with a stated fallback / hidden). Runs on generic defaults with no configuration (probe node, git and the Claude CLI; read .env.example; boot the dev script) and reads project specifics from .claude/onboarding/config.md. Invoke with /onboarding (full run), /onboarding <group> (one capability group), or /onboarding check (doctor pass, no questions)."
category: workflow
memory: none
version: 0.4.0
tags: onboarding, setup, env, secrets, capability-matrix, doctor, fresh-clone
argument-hint: "[<group>|check]"
---

# Onboarding — resolve every dependency, honestly

The job: a newcomer cloned this repo and wants it running. Walk them from clone
to a booted app whose capability story matches reality — every feature either
ON, or LIMITED with a stated reason and the exact variable that lifts it, or
HIDDEN because that is its designed keyless behavior. The output is not just a
running process; it is a capability matrix the operator can trust.

Hard rules, before anything else:

- **Never invent a command.** Commands come from the repo's own manifests
  (`package.json` scripts, `requirements.txt`, `Makefile`, `.env.example`) and
  from the project overlay below. If the overlay names a command that is gone
  from the repo, trust the repo, not the overlay, and say so.
- **Never echo a secret.** When the user pastes a key, write it to the env file
  and refer to it afterwards only as `<set>`. Never store keys in memory files,
  never put them in a commit, never print them back — not even partially, not
  even to confirm.
- **The env file is merged, never overwritten.** Preserve every existing line.
  Never change a variable that already has a value without asking first.
- **"Not configured" is a real outcome.** A keyless path is a product property,
  not a failure. Offer it as a first-class option in every group and label
  exactly what it means for the feature.
- **Do not block on what the user can skip.** Any group can be answered
  "later" — record it in the final matrix with the exact variables to set and
  the re-entry command that finishes it alone.
- **No machine paths in what you write.** Everything you create or edit resolves
  relative to the consuming repo. Never bake an absolute path from this machine
  into an env file, a doc, or your own output, except where the overlay itself
  says a variable must hold an absolute path (then derive it from the repo's
  location at the user's machine, and say why).

## Project overlay

Read `.claude/onboarding/config.md` in the consuming repo at the start of every
run. **The skill runs with no overlay present** — on the generic defaults listed
per key below — and when none exists, offer at the end to draft one from what
the run discovered, so the next onboarding starts warm.

Overlay shape: YAML frontmatter for scalars, markdown `##` sections for tables
and prose. Scalars (default in brackets):

```yaml
---
app: "<product name>"            # how to address the app in questions and the matrix  [repo directory name]
env_file: .env.local             # where keys are written, relative to the repo root  [.env.local]
env_example: .env.example        # the commented template merged from when env_file is new  [.env.example if present]
boot: "npm run dev"              # the boot-verify command  [npm run dev; else the manifest's obvious dev/start script]
boot_success: "GET / -> 200"     # the signal that boot worked: a probe and its expected answer  [any 2xx/3xx on the served root]
docs: ""                         # a repo doc explaining the install design, offered as further reading  [none]
---
```

Sections (each a `## ` heading inside `config.md`):

| Section | What it carries | Default when absent |
|---|---|---|
| `## Install modes` | Per-mode consequences for the step-0 question: which variables become required, which docs apply, what to skip. One row per mode; extra modes allowed. | The three generic modes in step 0, with no extra required variables. |
| `## Runtime prerequisites` | Table `tool \ min version \ probe command \ required or optional \ fix hint`. Include language runtimes, package installs, codegen steps that prove a toolchain end to end, and probes that should run only when a later choice needs them (mark those `conditional: <group>`). | Probe `node --version` (>= 20), `git --version`, and the Claude CLI as in step 1; run the manifest's install step if dependencies are absent. |
| `## Capability groups` | One `### <group-slug>` per group, each declaring: **unlocks** (what the user gets), **keys** (env variables, with aliases), **options** (each option: what to set, what it costs, what stays limited), **verify** (a read-only probe — a URL, a script, a variable now present), **without** (the honest keyless behavior: `fallback: <what runs instead>`, `hidden: <what disappears, by design>`, or `hard-required: <what fails loudly>`), and optional **helper** (a bundled script that finishes setup, e.g. one that provisions a remote agent and writes the resulting id back into the env file itself). | One generic group, **llm-engine**: Claude CLI if step 1 found it logged in / a local model server via its base-URL variable if `.env.example` names one / a provider API key if `.env.example` names one / none. Plus one group per remaining `.env.example` key cluster, options limited to `paste the value / later`, honesty text taken from the example file's comments. |
| `## Zero-key path` | What works with nothing configured at all — the guaranteed floor, stated as features, plus any demo/seed corpus that makes the empty app worth looking at. | "The app boots" is the only claim made; do not promise more than the boot verify proved. |
| `## Setup helpers` | Table `script \ what it does \ when to offer`. Doctor commands, seed scripts, key-provisioning helpers. Scripts are offered, never run unannounced. | None. |
| `## Boot verify` | The full step-4 recipe: pre-boot gate (typecheck/codegen), the boot command and its port discipline (how to learn the real port — a lock file, a banner, a config), the read-only probes per configured group, and restart caveats. | Run the manifest's typecheck script if one exists, boot `boot`, read the port from its output, probe the served root for `boot_success`. |
| `## Env notes` | Sharp edges of this repo's env handling: variables inlined at build time, variables that must be absolute paths (and why), secrets worth generating for the user (name + shape, e.g. "any 32-byte random hex"), rotation rules. | Only the generic reminder that build-time-inlined variables cannot reach an already-built client bundle. |
| `## Matrix rows` | The capability matrix's row list: `feature \ states it can be in \ what decides \ how to change`. Keeps the final table aligned with what the app's own UI claims. | One row per capability group from the groups section, states derived from each group's `without` field. |

A group's `without` field is the heart of the contract. Exactly one of three
honesties, never a shrug:

- `fallback:` — the feature still runs, on a stated cheaper path (deterministic
  logic, a queued-only outbox, link-based scheduling). Matrix state: degraded.
- `hidden:` — the feature removes itself rather than erroring; users never see
  a broken door. Matrix state: hidden, by design.
- `hard-required:` — the feature fails loudly without the key and says which
  one. Matrix state: off, with the variable named.

## Step 0 — mode

One question: "How will this install run?" Present the overlay's modes, or the
generic three:

| option | consequences |
| --- | --- |
| Developer laptop (just me) | open dev defaults are fine; recommend but do not require the repo's auth/secret variables |
| Self-host for a team | apply the overlay's team-mode requirements (auth secrets, public base URL, absolute data paths); still run the local flow so the env file ends up right |
| Just evaluating | fastest path: skip every key group, boot keyless, show whatever the zero-key path promises; print the matrix so they know what keys would unlock |

The mode shapes every later recommendation — say so when it does.

## Step 1 — runtime probe

Probe everything in the overlay's prerequisites table (or the defaults), and
report as a table — one row per tool: ok / FAIL / not found, plus the version
found. Fix what is fixable (install dependencies, run codegen), name what is
not. Do not skip the table even when all green — the green table is the record.

The generic floor, always probed even overlay-less:

1. `node --version` — or the runtime the repo's manifests imply; compare
   against the overlay's minimum or the manifest's `engines` field.
2. `git --version`.
3. The package install step, if the dependency directory is absent.
4. Claude Code CLI: `claude --version`; if present, a logged-in smoke with a
   short timeout:

   ```sh
   claude -p "say ok" --output-format json
   ```

   Present and logged in means an LLM engine exists on subscription billing
   with no key to collect. Absent is NOT a failure — say what the repo does
   instead (the llm-engine group's `without` answer).
5. Conditional probes (`docker --version`, a local model server such as
   `curl http://localhost:11434/v1/models`, cloud CLIs) run only if a later
   group choice needs them — do not spend the user's time on tools they will
   not pick.

## Step 2 — capability groups

Walk the overlay's groups (or the derived defaults). Ask in batched question
calls — at most 4 questions per batch — and phrase every option as a trade:
what you GET and what stays LIMITED. The "none / later" option is always
present and never shamed.

For each group the user engages with:

- Collect the keys (into memory only long enough to write them — hard rules
  above).
- Run the group's **helper** script if one is declared and the user agrees —
  helpers that write variables back into the env file themselves (a
  provisioning script that creates a remote resource and records its id) are
  preferred over asking the user to copy ids around.
- Note the group's `verify` probe for step 4.

For each group answered "later": record the exact variables and the group slug
for the matrix — nothing else to do now.

## Step 3 — write the env file

- If the env file does not exist, start from the relevant lines of the example
  file (keep its comments for the variables you set).
- Merge per the hard rules: preserve every existing line, ask before changing
  any variable that already has a value.
- Generate any secrets the overlay's env notes offer to generate (long random
  values in the stated shape) — generated locally, written directly, never
  echoed.
- Apply the mode's requirements from step 0 (team mode's required variables,
  absolute-path variables with the reason stated).
- Repeat the env notes' build-time caveat out loud when it applies: a variable
  inlined at build time cannot reach an already-built client bundle.

## Step 4 — verify by booting

1. Run the overlay's pre-boot gate (typecheck, codegen) if one is declared or
   the manifest has an obvious one — it proves the toolchain before the boot
   does.
2. Boot with the overlay's `boot` command, in the background. **Read the real
   port from the boot output or the overlay's port discipline** — never assume
   a default port; dev servers move, and some repos allow one server per
   checkout and print a banner naming the live one.
3. Probe `boot_success` against the live port.
4. Run each configured group's `verify` probe — read-only probes only. Verifying
   must not spend money or place live calls; a probe that reports
   ready / broken / absent as three different facts is the gold standard, and
   "broken" (installed but failing) deserves its reason named.
5. Restart note: env changes require a server restart to take effect. If a
   server was already running before step 3, tell the user to restart it —
   an old process quietly running old env is the classic false "it works".

## Step 5 — the capability matrix

Print one table, built from the overlay's matrix rows (or derived from the
groups), and make it match what the app's own UI will say — the matrix must
never out-promise the product:

| feature | state | why | to change |
| --- | --- | --- | --- |
| (zero-key floor) | on | needs nothing | - |
| (per group) | on / degraded (fallback named) / hidden (by design) / off (variable named) | the group's keys and mode | `/onboarding <group>` |

Three honest states per capability group, straight from its `without` field:
**works**, **degraded with the fallback named**, or **hidden by design**. A
`hard-required` group that was skipped shows **off** with its variable. Never a
bare "not working".

Close with: what the zero-key path already gives them, where the in-app
continuation of onboarding lives (if the overlay's docs name one), and that any
group answered "later" can be re-run alone.

If no overlay existed, offer to draft `.claude/onboarding/config.md` now from
what this run learned — the probes that mattered, the groups that emerged from
the example file, the boot recipe that worked. That draft is the operator's to
review and commit; do not commit it yourself.

## Re-entry

- `/onboarding <group>` — steps 2-5 for that group only.
- `/onboarding check` — steps 1 and 4-5 with no questions: a doctor pass that
  only reports. This is the cheap "is my install still honest?" loop.

---

<!-- clause: skill-reflection v2 - stamped by scripts/apply-skill-clauses.mjs from docs/skill-clauses/skill-reflection.md; edit the template, then re-stamp -->
## Skill Reflection

After the run's real work is done, reflect - autonomously, without asking the user. Be honest about volume: most runs produce NOTHING beyond lane 1. An empty reflection is a valid result; a forced lesson is pollution. Calibration: nothing (common) / one line (sometimes) / a lesson entry (occasionally) / a redesign proposal (rare).

**Lane 1 - PROJECT learnings** (what the next session in THIS repo needs). Repo-specific rules go to this skill's overlay in the consuming repo - a dated one-liner under `## Skill improvement log` in `.claude/onboarding/config.md`, or in the overlay/vault location this skill's `## Project overlay` section names (create the heading on first use). When the repo carries a `.personas/` directory, also write via the MEMORY BLOCK contract if this prompt carries one, else append node lines to `.personas/memory-outbox.jsonl` per that contract. Never into this file: a project's bytes in a shared method are exactly what made the fleet's copies diverge.

**Lane 2 - METHOD learnings** (what would improve THIS SKILL for every project):
1. If nothing generalizes beyond this repo, stop here.
2. Append to `LESSONS.md` in this skill's directory: `## <version-used> - <YYYY-MM-DD> - <project-name>` followed by `- ` bullets (create the file with a `# Lessons - onboarding` heading if absent). Record the version the run USED, not a bump target. Wrap a bullet in a `### Redesign proposal` sub-block when it argues for a redesign you are NOT applying now. A lesson alone needs no version bump.
3. Edit `SKILL.md` only together with a version bump, and bump only with an applied edit: patch for wording, minor for a step/prompt refinement, major for a methodic redesign. Update the `version:` frontmatter. Never edit inside a stamped `<!-- clause: ... -->` block: that text is shared by every skill in the lane and is changed in the registry's `docs/skill-clauses/` and re-stamped with `node <registry>/scripts/apply-skill-clauses.mjs`.
4. Where the edit lands: THE SKILL DIRECTORY IS A LINK INTO THE REGISTRY. `.claude/skills/onboarding` in a consuming repo is a symlink to `<registry>/skills/onboarding` (registry root = `registry.local` in `.ai/manifest.yaml`, default `../ai-registry`; `$AI_REGISTRY_DIR` wins). Editing it edits the one file every project runs, so there is nothing to propagate. Commit it IN THE REGISTRY checkout as a standalone commit containing only this skill's files: run `node <registry>/scripts/check-skills.mjs --since HEAD` first (shape + version discipline must pass), then `git -C <registry> add skills/onboarding` and `git -C <registry> commit -m "skill(onboarding): v<new> - <one-line reason>"`. Never stage the link from the project side.
5. NEVER copy this skill to `~/.claude/skills/onboarding/` or into another repo, and never "propagate" by copying. A copy in the personal tier shadows the lane for every project on the machine and freezes the method at that day's bytes with no version to compare (measured 2026-08-29: 11 such copies, all unversioned, all stale). If `.claude/skills/onboarding` is a real directory instead of a link, the fix is `node <registry>/scripts/link-registry.mjs`, not a copy in either direction.

**Lane 3 - DOMAIN knowledge** is a different artifact from a lesson: a lesson improves this METHOD, a lead proposes knowledge for a bundle. Skills that carry a `## Knowledge sync` section file leads there; a skill without one files none.
<!-- /clause: skill-reflection -->
