---
layer: application
type: application
subject: optional-dependency-degradation
technique: guarded-singleton-accessor
stack: python
verified_on: 2026-09-02
source_commit: 02201b8600df372cb425f2bb8e0cb7addd0df50f
verified_against: python@3.10
---

# A library whose optional imports return a stand-in that fails at the call, not at the import

A large open-source deep-learning toolkit is built on two mandatory packages and a few dozen optional ones: image-format readers, visualisation, compilation backends, tracking servers. Its contributing guide states the rule and the tree enforces it everywhere: **an optional dependency is imported lazily through one helper, and its absence is only an error at the moment the missing capability is actually called.**

## The mechanism

The helper takes a module name and returns a pair: the module and a boolean. When the import succeeds, the module is real. When it fails, the first slot holds a stand-in object that raises a descriptive error — carrying the original import failure and the version that was required — on any attribute access or call. A reader class can therefore be defined, registered and even instantiated on a machine that lacks its backend; the failure arrives only when `read` is invoked, with a message naming the missing package. The boolean is what tests and capability checks read.

Two rules keep the mechanism honest, and both are stated as contributor obligations:

- **The minimal install is proven, not declared.** A minimal-requirements test runner carries an explicit exclusion list of every test module that needs an extra (190 entries at this commit). A new test that needs a third-party package must either skip itself on the boolean or be added to that list, and the minimal lane runs in CI. That lane is the instrument that would catch an optional import promoted to a hard one.
- **The stand-in must not retain the failure's traceback.** The 1.6.0 changelog records a memory leak in exactly that path: keeping the exception object alive kept its frame chain alive. The fix says something about the design — a deferred failure is a long-lived object, and what it holds is held for the process's lifetime.

## What the tree says about the technique

The technique in this subject is written for a hosted dependency's client — construct it once, guard the construction, choose between a throwing accessor and a null client. The source tree is the same decision one level down, at the import: the stand-in *is* the throwing accessor, chosen over a null object because a null module would turn every missing capability into an attribute error far from its cause. The tree confirms the technique's central choice (throw, with a message that names the fix) and adds the proof obligation the technique does not state: a lane that runs with the dependency absent. That obligation is the one that makes the guard a guard rather than a comment.

## What this realization cannot do

It cannot tell a caller in advance whether a capability is present without importing; the boolean is the only pre-check, and code that branches on it has to be written to. And it is a library's realization: the "deployment" that lacks the dependency is a user's environment, not a fleet the author controls, so the refusal message is the whole degradation story — there is no fallback tier to route to.
