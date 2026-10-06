---
source: youtube:XaYubuLtW8M
kind: video
url: https://www.youtube.com/watch?v=XaYubuLtW8M
title: Claude Mods - The Biggest Claude Code Upgrade!
author: Prompt Engineering
words: 1822
extracted: 12
accepted: 1
declined: 0
leads: 4
already_covered: 3
untriaged: 3
dispatched: 0
applied: 1
shipped: 0
run_id: intake-1005-xayu
siblings: 0
fetches: 0
---

# The audit the review recommended is real; the question it told viewers to ask is the wrong one

**Class:** second-hand practitioner review (a demo of someone else's release) with a thin
operating half: the creator's own lab mods (a local-model status bar, a destructive-command
guard, an account check before publishing). 1,822 words, one caption track, one speaker.
**This is the second review of the same release this ledger has mined**:
[2026-10-02-claude-mods](2026-10-02-claude-mods.md) (Chase AI, run `in-cccustom-1002`)
already holds the release's currency row, three catches, and the session-mining lead.
The two are different authors, so convergence between them counts, deduped by author. The
one exception is the session-mining prompt, which this creator says came from an X post.
The earlier creator's similar prompt may share that upstream, so the two count as one
observation there.

**Expected yield, said before the table:** currency and leads, with the fetch doing the
extraction. In practice the primary was not fetched at all. The harness build in use
(2.1.289) ships its own authoring reference and API declaration, and **the harness itself
is an opened tree**: `claude plugin validate` and `claude plugin test` were run against 13
probe plugins and three plugins in daily use. 0 of 3 fetches.

**Siblings:** 0 live at claim. Two arrived mid-run (`intake-1005-kgl`, media-generation
image-prompt-composition; `intake-1005-z8xh`, game-production mesh-finishing), neither in
this run's subject. The shared tree held their uncommitted work at regeneration time, so the
generated artifacts were built in a detached worktree of HEAD.

**Declared focus (2026-10-04):** run the fleet-consumer check before Phase 5 when a home is
in `media-generation`. It does not apply: no candidate here is homed in media-generation. The
check that matters here, run before scoring, was the same in spirit. The landing's home
(`untrusted-extension-host`) has six fleet consumers in the map, and the seam hunt opened
personas before falling back to the operator's harness (below).

## Triage (v2.5 score; currency and leads under the corroboration table)

| # | Lane | Shape | Eff | Title | Prior art | Impact | G/R/C | Read | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | K | technique | M | Derive the capability inventory, refuse what it cannot read | untrusted-extension-host (canonicalizable-privilege-declaration); supply-chain/permission-manifest-scoping | new-technique | 3/0/2 | real gap | accept, landed |
| 2 | K | correction | - | Read the inventory by its strongest grant: a spawn escapes the fetch policy | same | corrects-claim (source) | folded into #1 | real | landed inside #1 |
| 3 | K | technique | S | Display-only redaction protects the viewer, not the model | prompt-safety/output-sanitization ("four doors; masked on screen but stored raw") | none | - | catch | already covered |
| 4 | K | technique | M | Hot reload resets module scope; durable values live with the host | untrusted-extension-host/declared-schema-extension-storage (no reload clause); agent-runtime-assembly; module-design | new-technique | 2/1/2 | partial | untriaged (home contested) |
| 5 | T | lead | S | Mine your own sessions for repeated questions, nervous commands, how you check its work; ideas before builds | 2026-10-02-claude-mods row 7 | none | table | partial | lead (second carrier, likely one upstream) |
| 6 | K | technique | M | Pick the extension mechanism by lifetime and surface (hook, skill, tool server, in-process plugin) | agent-runtime-assembly/semantic-hook-placement | new-technique | 2/2/2 | thin | untriaged (V2: source prose only) |
| 7 | K | - | S | The host builds its own features on the public extension API | untrusted-extension-host/isolation-tier-independent-extension-api ("same hook names, same context object") | none | - | catch | already covered |
| 8 | K | technique | S | Check the publishing identity before an outward action | concurrency-guards, identity-and-access (weak) | new-technique | 2/2/1 | thin | untriaged (V2: source prose only) |
| 9 | X | currency | S | The plugin API now ships `validate` and `test` (2.1.289) | 2026-10-02-claude-mods row 8 | resets-clock | table | real | lead (second carrier; return condition unchanged) |
| 10 | - | lead | S | Another vendor's harness makes the model wrapper, tools and loop all plugins | agent-runtime-assembly | none | table | thin | lead |
| 11 | - | - | - | "Marketplaces in weeks, then the first mod that misbehaves" | - | none | - | - | nothing (future tense) |
| 12 | K | technique | M | Pass, rewrite-then-pass, or answer in place of the action | agent-runtime-assembly/observer-and-mutator-surfaces | none | - | catch | already covered (as on 2026-10-02) |

`auto=1/3/0 fp=0` (row 1 accepted; rows 4, 6 and 8 rejected; rows 5, 9 and 10 ran under the
corroboration table; row 2 folded into row 1 because it is the same mechanism's reading
rule, with one home).

### Row 1 - the landing, and the seam chosen to falsify it

The review said `claude plugin validate` "lists every event that the mod listens to, and
every call it makes" [00:09:04]. The build's own reference calls validate an authoring check
("the quickest check that the engine sees what you meant"), not a security audit. A static
reader over source code is ordinarily a lower bound, so the claim was the one most likely to
be wrong, and it was tested first.

Thirteen probes, with literal-call and empty-module controls. Binding a noun, computed
access, `Reflect.get`, `new Function`, an array wrapper, a spread and dynamic `import()`
were all **refused**. A renamed parameter and a same-file helper were **traced** (`(via
go)`). A global `fetch` passed with "nothing on $", and the build's test kit showed why:
no `fetch`, `XMLHttpRequest`, `WebSocket`, `require` or `process` on the global object, and
"Code generation from strings disallowed". The claim held. It holds because the host
refuses every spelling its reader cannot follow, which is a design decision the corpus did
not have. `permission-manifest-scoping` owns the extractor that chases a codebase's
spellings. This is the inverse, available only where the host owns the language.

**The correction (row 2) came from the vendor's own types, not from the review.**
`$.process.run` is "local execution, not a network path: what a command of its own
reaches is its own", while the organization's web-fetch policy binds `$.http.fetch`. The
review's audit heuristic ("if a mod you don't know is making network calls, you want to know
why" [00:09:21]) reads for the wrong noun. Of the three plugins in daily use, one lists
`$.process.run` and no `$.http`, so it passes the review's question while holding the
session user's full authority.

Corroboration: code read in a tree (the harness itself, probed), the vendor's shipped
reference and types read in-run, and training-data convergence. Capability-safe language
subsets have long restricted how an authority object may be spelled so that its reach is
analyzable.

### Apply (Phase 7.5) - `experiment`, `better`

- **Seam hunt, fleet first.** The fleet map puts six projects on this subject. Personas'
  `capability_contract` is the nearest structural relative: a requirement list derived
  from tool definitions. It is a readiness contract (credentials, connectors, chained
  personas), not a privilege list, and a `script`-category tool yields **zero rows** (its
  own test, `collect_tool_requirements_skips_empty_credential_type`). That is correct for
  readiness. It becomes the review's misreading only if that list is ever shown as what a
  persona can reach, and nothing does that today. The n8n import re-authors a persona
  instead of executing the workflow, so no foreign code runs there. **No fleet project
  hosts foreign code with a derived inventory.**
- **The seam taken: the operator's harness.** The run-board band's only spawn resolved the
  git common directory. B resolved it through `$.fs` (walk to `.git`, follow `gitdir:` and
  `commondir`). Target: `$.process.run` left the derived inventory. Floor: 6 of 6
  locations agreed with `git rev-parse --git-common-dir` (primary checkout, subdirectory,
  two linked worktrees, another repository, outside any repository), and the plugin's two
  existing tests stayed green. Applied to the live plugin and re-validated. The plugin
  folder is not a repository, so there is no commit, and `ship` is 0 fleet commits.
- **What the seam refuted:** nothing in the landing. It refuted the review's audit
  question, on a real artifact.

The original four lines B replaced, kept here because the plugin folder has no history:
`const common = await $.process.run(['git', 'rev-parse', '--git-common-dir']).catch(() =>
null)`; `if (!common || common.exitCode !== 0) return next(e)`; `const dir =
common.stdout.trim()`; `const root = <dir if absolute, else cwd/dir>`.

## Leads

- **Row 5 (second carrier of the 2026-10-02 row 7 lead).** The prompt reads "the question
  you keep asking, the commands that make you nervous, how you check its work; show me the
  ideas first, don't build until I pick" [00:07:49-00:08:14]. That lead's return condition
  (a second guard set derived from an incident record, its false-positive classes compared)
  is **not** met by this source: no guard set was replayed. Unchanged.
- **Row 9 (currency).** 2.1.289 ships `claude plugin validate` with refusal semantics and
  `claude plugin test` with a kit. Return condition unchanged from 2026-10-02: when the
  plugin API leaves early access, re-check the claude-code applications that describe the
  harness's extension points as command hooks only.
- **Row 10.** The review says another vendor's open harness treats the model wrapper, the
  tools and the agent loop itself as swappable plugins [00:00:51]. Return condition: when
  that harness's repository or documentation is read in-run. Then it is an
  `agent-runtime-assembly` comparison, not a claim from a relay.
- **Personas readiness contract (from the seam hunt).** Return condition: when personas
  shows a persona's derived requirements as what the persona can reach (a consent or
  summary surface). Then a `script`-category tool must read as unrestricted, per
  `derived-capability-inventory`'s strongest-grant rule.

## Untriaged, with anchors (nobody verified these)

- **Row 4** [00:05:58-00:06:20]: "a reload restarts your code fresh, so everything you want to
  keep has to be stored in Claude Code, not in your file". Confirmed by the build's
  reference ("Values in `$.state` ... and `$.store` ... are the host's and stay; the
  module's own variables start over"). Home contested between three subjects. Promote with
  a home decision and a fleet seam that hot-reloads code.
- **Row 6** [00:09:30-00:09:55]: hook for blocking with a script you have, skill for
  instructions, tool server to reach another service, in-process plugin for screen, memory,
  or stop-and-ask. Source prose only.
- **Row 8** [00:08:36]: "a guard that checks which account I am about to publish from".
  Source prose only. Note that this fleet's repository-visibility memory (all repositories
  but one are public) is the local force that would make it matter.

## Directions

`directions=n/a`: no design record (a video).

rescan_when: n/a (a video).
