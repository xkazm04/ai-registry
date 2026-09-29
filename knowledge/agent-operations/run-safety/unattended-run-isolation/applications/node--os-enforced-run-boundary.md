---
layer: application
type: application
subject: unattended-run-isolation
technique: os-enforced-run-boundary
stack: node
status: forged
verified_on: 2026-09-29
verified_against: node@22
---

# A deny list over a bash pattern, and eleven of seventeen commands that walk past it (TypeScript, agent runtime)

Stack version from the tree's `engines` field; commit `ae87280a`. This is the technique's
premise as a counter-example: an unattended agent session whose boundary is a permission
mode plus a short list of denied command patterns, not anything the operating system
enforces. The tree is candid about it in one comment and quietly relies on it in the rest.

## The boundary as built

Every unattended session in the tree (five phases of a background feature, and every
scheduled task) runs in the permission mode that auto-allows tool calls and cannot prompt
(`src/permission/decision/PermissionRuntime.ts:312 "if (context.canPrompt === false) {"`
is the fallthrough for a mode that is not auto-allow; the auto-allow branch sits above it).
The execution phase adds four deny rules that "override `bypassPermissions` because deny
rules always win" (`src/always-on/runtime/DiscoveryFire.ts:75 "pattern: "git push*""` and its
`git remote*` siblings), and three interactive tools are removed from the session. The
other phases and the scheduler have no deny rules at all. The workspace boundary itself is
stated to the model as prose: the copy is the safety boundary.

## Executed: the matcher against commands that do the same work

The deny patterns are compiled by a wildcard function that escapes the pattern, turns `*`
into `.*` and anchors it
(`src/permission/policy/matchPermissionRule.ts:93 "return new RegExp(`^${escaped}$`);"`).
The real matcher was run against the four rules:

| Command | Result |
| --- | --- |
| `git push origin main` | denied |
| `cd x && git push` | denied |
| `GIT_TRACE=1 git push` | denied |
| `/usr/bin/git push` | denied |
| `(git push)` | denied |
| `git remote add x y` | denied |
| `git -C . push` | **allowed** |
| `git -c a=b push origin` | **allowed** |
| `git  push` (two spaces) | **allowed** |
| `git<TAB>push` | **allowed** |
| `echo hi<LF>git push` | **allowed** |
| `git push<LF>foo` | **allowed** |
| `g=git; $g push` | **allowed** |
| `git config remote.origin.url foo` | **allowed** |
| `git send-pack origin` | **allowed** |
| `gh pr create` | **allowed** |
| `curl -X POST https://x` | **allowed** |

The multi-line rows are a property of the compiled expression: `.` does not match a line
break and the anchors are not per-line, so a command that puts the word on a second line
is invisible to every pattern. The rest are the general shape: a pattern over a command
string denies *spellings*, and a shell has more spellings than a list has patterns.

## What the technique says this is

This is the technique's first paragraph, complete: an arrangement, not a boundary. The
deny list is a suggestion the agent would have to be uninterested in evading, and the
sessions it guards are the ones a model drives with no human present. The tree's own
comment names the correct property ("deny rules always win") and it is true; the trouble
is what the rules are patterns *of*. A boundary that held would be at the process or the
credential: no write credential inside the run, no egress to the destination, so that the
spelling of the command stops mattering
([disposable-run-environments](../techniques/disposable-run-environments.md) says the
same about a removed remote: it stops the accident, not the deliberate push).

## Cannot say

Whether the model that runs in these sessions has ever emitted a spelling from the second
half of the table. The rows show the matcher's coverage, not any model's behaviour. The
user's own permission rules do reach these sessions, so a project can add its own denials;
no built-in rule goes beyond push and remote.
