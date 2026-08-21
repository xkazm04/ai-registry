---
layer: technique
type: technique
subject: crash-forensics-attribution
technique: root-cause-to-fix-prompt
status: forged
laws: [no-gate-self-certifies, unmeasured-is-not-a-pass, structural-proof-is-never-sufficient]
use_when: [turning a confirmed root cause into an actionable change request, feeding a diagnosis to an automated change process, cataloguing recurring engine defect classes]
shared_with: []
---

# Root cause to corrective instruction

The concern: a diagnosis is half the value. The other half is an instruction specific enough
that a person — or an automated change process — can act on it without re-deriving the
analysis, and constrained enough that acting on it cannot make things quietly worse.

## Classes, not incidents

Cataloguing individual crashes does not compound; cataloguing **classes of engine misuse**
does. A class has three parts: a characteristic signature shape, a characteristic
misconception behind it, and a characteristic corrective shape. Four that recur in every large
engine, and which transplant across engines because they are consequences of the architecture
rather than of the product:

- **Initialisation ordering race.** Two systems each assume the other is ready. A component
  reads from a subsystem during construction or early activation, and the subsystem is
  populated a frame later. The stack shows a null or default read in early lifecycle code. The
  correction is never "add a null check" — that hides the race and produces a silently
  wrong-valued object. It is to move the read to the point after which the dependency is
  guaranteed initialised, or to declare the dependency so the ordering is enforced.
- **Collected object still referenced.** A managed object is reclaimed while something outside
  the collector's view still holds a pointer to it — most often a cached reference held by a
  user-interface widget or a subscription list that was never cleared. The stack shows a fault
  through a stale handle, frequently on the frame after a level transition. The correction is
  to hold the reference in a form the collector can see, or to clear the cache on the
  lifecycle event that invalidates it.
- **Serialised archive version drift.** Data written by one version is read by another whose
  layout differs. The stack shows a read past the end of a buffer, or a type mismatch during
  load. The correction is a version tag with an explicit upgrade path and a refusal on
  unreadable versions — never a best-effort partial read, which produces a corrupted world
  that crashes somewhere unrelated hours later.
- **Mutually recursive dependency exhausting the stack.** Two content items each require the
  other's resolution. The stack is one short cycle repeated hundreds of times — the most
  visually distinctive of all crash shapes. The correction is cycle detection at authoring or
  load time with a refusal naming the cycle, not a recursion depth limit, which only moves the
  failure and loses the diagnosis.

Each class earns its entry by recurring. When a fifth appears twice, write it up the same way;
when a confirmed class stabilises, it belongs in the project's corpus of known engine traps so
the next occurrence is caught before it crashes rather than after.

## What a corrective instruction must contain

- **The observed failure**, stated as measurement: the fault kind, the signature, the frames
  that carried the evidence. Not the interpretation — the evidence, so a reader can disagree.
- **The class it was assigned to**, named, so the reader can pattern-match against the
  catalogue instead of reading the stack.
- **The specific location or contract at fault**, as precisely as the evidence supports and no
  more. "The ability's activation reads the attribute set" is supportable; "line 412 is wrong"
  usually is not.
- **The corrective shape** — what kind of change resolves this class, in the terms of the
  class, so it is checkable against the diagnosis.
- **The verification** the change must pass before anyone claims it is fixed: what to run,
  what to observe, what result counts. A repair with no stated verification is a hypothesis
  wearing a completion label, and structural proof that the code now compiles proves nothing
  about the behaviour that crashed.

## What it must NOT do

Three prohibitions, and they are the reason this technique exists rather than being obvious:

**It must not invent a target value.** If the correction requires a number nobody measured — a
timeout, a pool size, a depth limit, a threshold — the instruction states that the number must
be measured and by what method. It does not supply a plausible one. A fabricated constant is
indistinguishable in the diff from a derived one, and it will be treated as authoritative for
years by everyone who reads it afterwards.

**It must not assert that the defect is fixed.** The instruction proposes; verification
disposes. A generator's claim about its own output is an input to a verdict, never the
verdict, and the party that produced the change may not be the authority that passes it. Write
the instruction so the claim it makes is "this should resolve the observed fault, verified
by X", never "this resolves the fault".

**It must not widen its scope beyond the evidence.** A crash diagnosis licenses a change to
the thing that crashed. It does not license refactoring the subsystem, and an instruction that
invites one produces a change too large to attribute if the crash recurs.

## Procedure

1. Confirm the root cause — attribution alone is not confirmation; a gated verdict names an
   owner, a confirmation names a mechanism.
2. Match the mechanism to a catalogued class, or open a new class if it recurs.
3. Compose the instruction with the five required parts above.
4. Strip anything the evidence does not support: invented numbers, asserted outcomes, scope
   creep, adjacent cleanups.
5. State the verification explicitly, at the rung of evidence the claim needs — behavioural
   for a behavioural defect.
6. On confirmed repair, write the class back to the trap corpus with its signature, so the
   next occurrence matches before triage begins.

## Decision rules

- When the diagnosis is a gated `unknown`, do not produce a corrective instruction at all. An
  instruction built on an unattributed crash is a guess with a work order attached.
- When two corrective shapes are plausible, state both and the evidence that would distinguish
  them. Choosing arbitrarily and presenting the choice as the diagnosis is the failure this
  whole subject is organised against.
- When the correction is "add a defensive check", stop and re-derive. Defensive checks convert
  a loud crash into a silent wrong state, which is a strictly worse outcome and defers the
  same defect to a place with no stack.
- When the instruction is consumed by an automated change process, keep the prohibitions in
  the instruction text itself. An automated author asked for a fix will otherwise supply a
  confident constant and a confident claim of success, because both are what the shape of the
  request implies.

## When not to use

Do not produce corrective instructions from a matched prior diagnosis without re-confirming
against the current code. The stored class was bound to the content it was derived from; if
that content changed, the match is evidence about the past.

Do not use this for crashes whose cause is environmental — driver faults, out-of-memory on an
under-specified machine, hardware. Those need an environment finding and a configuration
change, and forcing them into a code-defect instruction produces a change to blameless code.
