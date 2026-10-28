---
layer: technique
type: technique
subject: agent-cli-transport
technique: derived-bash-allowlist
status: forged
laws: [one-authority-per-vocabulary, one-validation-door, gate-sees-target]
shared_with: []
use_when: [an unattended editing agent must run the project's own checks, writing shell allow rules for a headless session per repository, an allow rule with spaces arrives mangled on one platform]
---

# Derived shell allowlist

An unattended editing session has nobody to answer a prompt, so every shell
command it may run must be granted ahead of time as a rule. The commands it
genuinely needs are few and already written down: the project's setup command
and the gates that decide whether its change is good. The agent needs to run
those itself, to see its test go red and then green. This technique derives the
session's shell grants **from those configured commands**, so the allowlist
and the project's command vocabulary cannot drift apart
([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary)).
A hand-written allowlist per repository is a second copy of the gate list,
and it goes stale the first time a gate changes.

The read-only and planning stances are owned by
[permission-stance-enforcement](./permission-stance-enforcement.md), which
removes the shell from those modes or scopes it to named read-only
subcommands. This technique is the edit mode's shell. A shell is needed there,
and the open question is which entry points to grant.

## Deriving a prefix

For each configured command:

1. **Split on control operators.** Sequencing, conjunction, disjunction and
   pipes each start a new command, and each part gets its own prefix. Granting
   the first word of a compound line grants nothing useful. Granting the whole
   line grants a string the agent will never type exactly.
2. **Keep leading plain words only.** Stop at the first flag, quote, glob,
   redirection or variable. What remains is the program and its subcommands.
   Arguments are not part of a prefix, because a rule that pins arguments
   breaks the first time the agent narrows a test run to one file.
3. **Take two words, or three after a launcher.** A launcher is a first pair
   that runs another named thing: a package manager's run or exec verb, or a
   project tool's run verb. After a launcher the prefix includes the script or
   program name, so the grant is "run the lint script", not "run any script".
4. **Never grant a bare launcher or interpreter on its own word.** A package
   manager, an interpreter, a shell, an environment wrapper or a privilege
   wrapper runs whatever it is handed, so a one-word grant on it is a bare
   shell grant. A command that reduces to such a word yields **no prefix**.
   The derivation reports that, so the operator can add an explicit extra
   instead of the gate silently being unrunnable.
5. **Add explicit extras, through the same checks**, whitespace-normalized,
   from a list the operator configures for tools the gates do not mention.
   Extras are where the bare-launcher rule leaks. A gate written as
   "package manager, directory flag, path, script" derives no prefix, because
   the flag ends the plain words. The operator then adds the package manager
   plus its directory flag as an extra, and that grant runs any script in any
   directory. A prefix that ends at a flag which only relocates the launcher is
   a bare launcher. The fix belongs in the gate (a named script per directory)
   or in the derivation (skip relocation flags and their value, then apply the
   launcher rule), never in a wider extra.
6. **Filter the result through the deny list.** Programs that move state the
   host owns, such as version control (the host owns history, branches and
   commits), and programs that fetch or push over the network are denied even
   when a gate command happens to start with them. The deny is written as rules
   as well as filtered, so it holds against the tool's own matching too. Deny
   beats allow.

## Transport: the rules travel in a file, never in argv

Rules contain spaces, colons, parentheses and wildcards. On a platform where
the agent's launcher is a script wrapper re-parsed by the command interpreter,
the argument vector is concatenated and re-parsed, and a rule can arrive split,
truncated or empty. That is the silent "the stance never arrived" route in
[permission-stance-enforcement](./permission-stance-enforcement.md). So the
adapter writes the rules to a settings file **per call**, in a fresh temporary
directory, and passes only the file's path. The path must itself be a plain
token, which means the temporary root is chosen, not assumed. The directory names
its reaper: it is removed after the call. Removal is retried, and a failure is
logged and never thrown, because a just-killed child may still hold the file,
and a cleanup error must not discard the call's result or its cost.

Restrict at both levels. Cut the session's **tool list** to what the mode
uses, so that a denied tool is never offered at all, and load no ambient
tool servers the operator's own configuration would add. The allow rules are
the second level.

Choose the settings sources as carefully as the rules. The operator's personal
scope is excluded, because its hooks and allow rules would reach a lane's tool
calls and widen the profile. A settings scope that lives **inside the
workspace** is configuration the agent can write, and a resumed turn may load
what the previous turn wrote there. Load such a scope only where deny-wins
holds for every rule the host wrote, and treat any allow rule it adds as
widening, not as project preference.

## What the allowlist does not close

A prefix grant bounds **which entry points** the agent may run, not what they
do. Granting "run the test script" grants whatever the agent wrote into the
test script one edit earlier. A derived allowlist therefore does not close
the network or the filesystem, and the technique's documentation must say so
where the stance is displayed. The containment that actually holds sits below
the shell. The children of the agent hold no secret (subprocess-lifecycle's
two environment tiers), and where it is available, an operating-system sandbox
with a network allowlist confines the agent's commands. Most tools also run
commands they judge harmless (directory listings, identity queries) without
any rule. So the allowlist is not the complete set of what runs, and the
record of the stance should not claim it is.

## Verification

Pin the derivation with a table test: compound lines, quoted arguments, flags
in the middle, a launcher with a script, a bare interpreter, a denied program
at the head of a gate. Then verify from the child
([gate-sees-target](../../../../_laws.md#gate-sees-target)): on each platform the
product supports, run a session in which an allowed prefix succeeds, a bare
launcher is refused, a denied program is refused, and an edit outside the
working directory is refused. Read the outcomes from the tool's own events,
not from the rules the host believes it sent.

## When not to use it

When a person is within reach of the turn, route the approvals instead
([host-routed-approval-round-trip](./host-routed-approval-round-trip.md)). A
derived allowlist is for the case where nobody can answer. When the edit
session needs no shell at all (pure file edits checked by the host after the
run), grant none. The smallest derived set is still larger than the empty
one.
