---
layer: technique
type: technique
subject: agent-runtime-assembly
technique: command-guard-judges-command-positions
status: forged
laws: [gate-sees-target, unknown-is-not-a-value]
shared_with: []
use_when: [writing a pre-tool hook that refuses dangerous shell commands, a guard refuses a search, an echo or a commit message that only names a dangerous command, agents rephrase commands to get past a guard, enabling a new command rule on a machine several agent sessions share]
---

# A command guard judges command positions

A pre-tool guard over shell commands exists to stop a small set of actions: killing
processes by name on a shared machine, rewriting history, deleting recursively, reading a
secret. The quick implementation matches patterns against the command text. That text is
mostly not commands. It holds search patterns, messages sent to another process or device,
commit messages, heredoc bodies written to files, documentation being edited. A guard that
matches the whole string refuses all of them whenever they mention the action, and two
independent guards built that way on one machine refused exactly that class: a search
pattern naming a recursive delete, a string meant for a remote device that named a
process-kill command, heredoc bodies and commit messages read as commands.

The cost is not the one refusal. An agent that is refused for a search learns to rephrase
until the guard is quiet, and a guard that teaches rephrasing has trained its subject to
treat refusals as noise. The opposite failure sits right beside it: a guard that simply
ignores everything in quotes misses the commands quotes *execute*.

> **Judge the positions a shell will execute, and only those. Text in a data position is
> data; text the shell will run is a command wherever it appears.**

## Procedure

1. **Split with a quote-aware tokenizer.** Quotes group their contents into one token;
   `;`, `&`, `|`, newlines and parentheses separate segments only outside quotes. A `|`
   inside a quoted search pattern is an alternation, not a pipe.
2. **Skip data positions.** The quoted arguments of an ordinary command, a heredoc body fed
   to anything that is not a shell, and comments are data. Judge the first token of each
   segment and the arguments the rule is about (the target of a delete, the flags of a
   kill).
3. **Recurse into what quotes execute.** The body after a nested shell's command flag
   (`-c`, a command parameter, `/c`, `eval`), a command substitution or backtick inside a
   double-quoted string, and a heredoc fed to a shell are commands and are judged as such.
   A body the splitter cannot decompose is judged whole, never waved through: an unparsed
   command is not an allowed one
   ([unknown-is-not-a-value](../../../../_laws.md#unknown-is-not-a-value)).
4. **End verb rules at a token boundary, not at a regular-expression word boundary.** A
   hyphen ends a regex word, so a rule for a mutating verb also matches its read-only
   sibling that shares the prefix (a merge verb and a merge-base query). Match whole tokens.
5. **Replay the draft over the machine's recorded commands before enabling it.** Agent
   session transcripts hold every command run there. Count the matches, then read every
   matched row: the count says how often the guard would fire, and only the rows say
   whether those were hazards ([gate-sees-target](../../../../_laws.md#gate-sees-target)).
   Keep the guard's own deny and allow cases as the floor: a change that removes false
   refusals and loses one true refusal is not better.
6. **Name the reachable remedy in the refusal.** Say what to do instead: kill by the
   identifier you hold, free the port you opened. A refusal without a remedy invites the
   rephrasing this technique exists to prevent.

## Decision rules

- **When a rule's word can appear in a search, a message or a document, the rule must be
  position-aware.** A rule over words nobody writes as data (a destructive flag spelling)
  can stay a plain pattern, and the replay shows which is which.
- **When splitting is uncertain, refuse the whole command and say why**, as the
  [rewriting-under-a-foreign-gate](./rewriting-under-a-foreign-gate.md) splitter does for a
  rewrite. Precision here means not refusing data, never allowing what was not parsed.
- **When a replay finds a false refusal, add it to the guard's allow cases before fixing
  the rule**, so the fix is held by a test and not by memory.

## When not to use it

A guard that receives a parsed argument vector (an exec-level hook, a tool whose inputs are
typed fields) has no quoting to interpret and should judge the fields directly. A guard
whose rules name only spellings that never occur as data needs the replay, not the parser.

## Evidence status

Two guards on one shared workstation, written independently. The first, drafted from an
incident record and replayed over 39,940 recorded commands before it was enabled, judged
heredoc bodies and commit messages as commands until the replay moved three of its rules by
30 to 40 percent; its search rule gained matches once a quoted `|` stopped splitting
segments. The second, a process-kill guard in another project, anchored kill words at
"command position" including after any `|`, and refused a search whose quoted alternation
named the kill command, as well as a string meant for a remote device. A third project's
git-verb and delete guard, replayed over 1,509 distinct recorded commands, refused 189:
one was a read-only search whose quoted pattern named a recursive delete, removed by
position-aware judging with all 25 deny and 12 allow cases of its own test held; two more
were a verb rule matching a read-only sibling verb at a hyphen, which step 4 addresses and
position-awareness does not. In that guard set the false-refusal class was rare (one in
1,509 commands); its cost grows with how often the guarded words appear as data.
