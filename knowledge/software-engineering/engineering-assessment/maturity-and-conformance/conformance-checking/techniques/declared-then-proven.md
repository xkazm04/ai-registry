---
layer: technique
type: technique
subject: conformance-checking
technique: declared-then-proven
status: forged
laws: [gate-sees-target, one-authority-per-vocabulary]
shared_with: []
use_when: [designing what each check in a conformance run actually verifies, deciding whether presence is sufficient proof, auditing a checker that reads more than it executes]
---

# Declared, then proven

## The concern

A repository standard splits into two artifacts: a **declaration** the
project writes about itself, and a **checker** that turns declarations into
verdicts. The technique is the discipline of the second half — making each
check state, explicitly and in its own output, *what act of verification it
performed*. Without that discipline a checker drifts, one convenient
shortcut at a time, into a transcriber: it reports the declaration back to
the reader, dressed as a result.

## The proof ladder

Every check sits on exactly one of three rungs. Assign the rung when the
check is written, and carry it into the finding, because it is the reader's
only defence against over-reading a green mark.

**Presence.** The named artifact resolves: the path exists, the entry is in
the manifest, the command name is defined somewhere. Cost: near zero.
Claim: "the project has not forgotten this." Nothing more. Presence is the
right rung for checks whose absence is itself the whole failure — a missing
licence declaration, an unnamed entry point.

**Shape.** The artifact parses, matches the expected structure, and is
*wired* — the declared command resolves to a real definition, the declared
schema validates, the declared document contains the sections the standard
names rather than only their headings. Cost: low. Claim: "this is a
plausible instance of the thing, not a placeholder." Shape is the default
rung; most checks that people believe are proving something are, correctly,
shape checks.

**Execution.** The declared command was run in a controlled environment and
its exit status observed. Cost: high — time, sandboxing, and a security
model (see below). Claim: "at this moment, in this environment, it worked."
Execution is the only rung whose verdict decays predictably with time, which
is exactly why it is the rung worth writing back
([claim-write-back](./claim-write-back.md)).

## Decision rules

- **Choose the lowest rung that makes the finding actionable, then check
  whether the reader will over-read it.** If a presence check would be
  rendered with the same green mark as an execution check, either raise the
  rung or label the finding with its rung. Undifferentiated green is the
  defect.
- **Never accept a self-declared verification flag as evidence.** A contract
  field that says a claim is verified is an *input to be checked*, not an
  output. The checker's own execution result is the authority for that field
  ([one-authority-per-vocabulary](../../../../_laws.md#one-authority-per-vocabulary));
  where the two disagree, the checker wins and says so.
- **Prove the wiring, not the string.** "A script named X exists" and "the
  declared command X is reachable from the project's entry points" are
  different claims. Resolve declarations through the project's own
  indirection — its task runner, its manifest, its configuration — rather
  than pattern-matching text, so a rename breaks the check instead of
  fooling it.
- **A check that cannot reach its target reports that, not a verdict.** The
  target is behind a network boundary, the tool is not installed, the
  command needs credentials the run does not have: that is *unable to
  check*, a distinct outcome ([finding-severity-ladder](./finding-severity-ladder.md)).
- **Execution implies untrusted code.** Running commands a repository
  declared means the repository chooses what your checker executes. Run
  with the least privilege that still produces the proof: no write
  credentials in the environment, no network unless the check is about the
  network, a timeout on every invocation, and output captured rather than
  streamed into a shared log. A conformance run that can be turned into a
  credential exfiltration by editing a manifest is not a checker, it is an
  exploit primitive.
- **Bound every execution, publish the budget, and name the kill in the
  finding.** An unbounded declared command hangs the run; a bounded one
  turns a slow-but-passing suite into a failure, which is a *correct*
  verdict only if the reader can tell it apart from a real one. State the
  per-command budget in the standard, and when a command is killed, say so
  in the finding — a timeout reported as a bare failure with no message
  sends the owner hunting a bug that does not exist.
- **A declared command still carrying a placeholder is not executed.** It is
  reported as unfilled, at warning severity. Executing a template's stub
  produces a meaningless failure and, worse, executes whatever the template
  author left there.

## Procedure

1. Enumerate the standard's clauses. For each, write the sentence "this
   clause is satisfied when ___", in the *world*, not in the declaration.
2. Pick the highest rung you can afford for that sentence. Where you cannot
   afford execution, write down what the shape check does *not* prove — that
   sentence becomes part of the check's published description.
3. Give the check a stable identifier that survives rewording. Findings are
   compared across runs and quoted in disputes; an identity that changes
   when the message is edited destroys both.
4. Emit findings that name: the clause, the rung, the observed evidence, and
   the remediation. A finding without remediation is a complaint.
5. Where execution succeeded, hand the result to the write-back path.

## When not to use it

- **Do not force execution into environments that cannot honour it.** A
  checker meant to run over many repositories from the outside — read-only,
  no install step, no sandbox — is legitimately a shape-and-presence
  instrument. The failure is not the low rung, it is claiming the high one.
- **Do not execute commands whose side effects escape the run.** Anything
  that publishes, deploys, mutates shared state, or costs money is checked
  for shape and never executed, regardless of how much better the proof
  would be.
- **Do not build an execution rung before the fixture suite exists.** A
  checker that runs arbitrary declared commands and has never been tested
  against a hostile fixture will eventually run something regrettable
  ([fixture-repo-testing](./fixture-repo-testing.md)).
