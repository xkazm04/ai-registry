---
layer: technique
type: technique
subject: optional-dependency-degradation
technique: minimal-install-test-lane
status: forged
laws:
  - gate-sees-target
  - absent-guard-is-loud
shared_with: []
use_when: [a library declares extras and nobody has installed it without them lately, a lazily-imported dependency was quietly promoted to a hard one, deciding how a deferred import failure should be shaped, a proxy for a missing symbol lives as long as the process]
---

# The minimal-install test lane

A library that declares optional extras is making a claim about every one of
them: the core imports, constructs and runs with the extra absent, and the
extra is only an error at the moment its capability is actually used. That
claim is written in a manifest and a contributing guide, and it decays in the
one way a manifest cannot see. A contributor on a fully-provisioned
workstation adds a module-level import of an optional package because it was
there; every test passes, because every test machine has it too; the release
ships; and the first user with the minimal install finds that the top-level
import now fails on a package the manifest calls optional. Nobody lied. The
claim simply stopped being true and nothing was positioned to notice.

The rule: **the minimal install is proven, not declared.** A test lane exists
whose environment contains the mandatory dependencies and *nothing else*, and
it runs the suite in that environment on every change. A gate that runs the
suite on a machine where the extras happen to be present is observing a proxy
of the minimal install and passes exactly when the two diverge
([gate-sees-target](../../../../_laws.md#gate-sees-target)). The lane is the
only instrument that reads the target.

The lane has two halves, and the cheaper one runs first. Before any test is
collected, it **imports every module of the package** and asserts that none
failed — the direct proof that no optional import was promoted to a hard one,
failing on the offending module by name in seconds. Only then does it run the
suite, and its exit status is the suite's verdict, so a pipeline cannot read a
red lane as green.

## The exclusion list, and why it must police itself

A minimal environment cannot run the tests that exercise the extras, and there
are two ways to keep them out. At the test: a skip decorator keyed on the same
boolean the library's own import helper returns. At the lane: an explicit
**exclusion list** of the test modules that need an extra, read by the runner
before collection. Both are needed. The decorator serves a single case inside
an otherwise-portable module; the list serves a module whose every case needs
the backend, and a module that would fail at *collection* — an import at the
top of the test file — before any decorator could run.

The list is where this technique earns its place, because it is a second
document about the codebase and it rots in one direction. A test module is
renamed or deleted; its entry stays; the entry now excludes nothing, silently,
and a later contributor copies the stale line as a model. Or an entry is added
twice, and the duplicate is the one that gets edited. A list that can hold
entries matching nothing is a guard that has quietly stopped guarding
([absent-guard-is-loud](../../../../_laws.md#absent-guard-is-loud)), so the
lane validates its own list before it trusts it:

- **No duplicates.** Assert the list's length equals the length of its set. A
  duplicate means the list is being edited by search rather than by reading.
- **Every entry matches a real test file.** As the lane walks the test tree it
  records which entries it consumed; any entry left unconsumed is stale, and
  the lane **fails, listing the stale entries by name**. Not a warning — a
  warning on a nightly lane is a line nobody reads, and a failed lane on the
  renaming change is the only mechanism that reaches its author. Print the
  entry *as written*: an entry that matches no file is the commonest stale
  entry, and a listing that looks each one up on disk to print its path
  crashes on exactly that entry, turning a named failure into an anonymous
  one.

With both checks the list cannot drift from the tree. A missing entry fails
the lane with an import error naming the package; a surplus entry fails it
with the stale name. Either direction is loud, and lands on the change that
caused it. The contributor obligation is then one sentence in the guide — a
test that needs a third-party package either skips itself on the boolean or is
added to the list — and the lane is what checks that you did.

One class of extra needs more than the boolean. A package that backs onto
hardware — an accelerator library, a compiled kernel — can import cleanly on a
machine that cannot run it, and a test skipped on the import boolean then
fails for a reason unrelated to the code under test. For that class the skip
predicate **executes a small real operation** once, at collection, and skips
on its outcome; it is computed once per process and short-circuited in forked
test workers so the probe is not re-run per subprocess. This is
[probe-the-grant-not-the-config](./probe-the-grant-not-the-config.md) one
layer down: an import proves the package is present, not that it works.

## The deferred failure must fit the hole it fills

The lane proves the *absence* half of the claim. The other half — that the
missing capability fails only when used, with a message naming the package
and its install step — depends on the object the import helper hands back in
place of the module: a **deferred failure**, a proxy that raises the
descriptive error when touched. Two properties of it are not obvious until
the lane starts failing on code that looks right.

**The proxy is shaped for the syntactic role of the missing symbol.** A
module that imports an optional name and calls it later is served by a proxy
that raises on first call. A module that uses the name as a *decorator* is
not: decoration happens at definition time, while the module is still being
imported, so a proxy that raises on call raises at import, and the lane fails
on a module that never used the capability. That role needs a proxy whose
first call — the decoration — succeeds and returns another proxy, deferring
the raise to the decorated function's first invocation. A *base class* is a
third role: the interpreter accepts only a real type in a bases list and
rejects a callable instance at the class statement, so this role needs a
stand-in class whose constructor raises — the subclass can be defined and
registered, and fails only when something instantiates it. The helper cannot
see how the name will be used, so it takes the role as an argument and the
contributor picks it at the import site; the lane is what reveals a wrong
pick. The same reasoning decides which accesses the proxy intercepts:
attribute access and call are obvious, subscripting and iteration are the
ones forgotten, and a proxy that misses them lets `missing[0]` fail with a
type error that names nothing. Every access the language offers raises the
same descriptive error, because for a library that message is the whole
degradation story — there is no fallback tier, only the sentence saying what
to install.

**A long-lived deferred failure must not retain the live traceback.** The
proxy is constructed once at import and lives for the process lifetime,
referenced from a module namespace by every function that would have used the
package. If it holds the original exception with its traceback attached, it
holds every frame of the failed import chain and every local in those frames
for as long as the process runs — a leak that grows with the number of extras
absent, which is greatest on exactly the minimal install this lane proves.
Format the traceback to a string at construction, keep the string for the
message, and detach the traceback from the exception before storing either.
The message loses nothing a reader needed; the proxy stops pinning a stack.

## Warn-or-raise is the caller's choice

A second helper gates a whole function or class on a package rather than a
single symbol: a decorator that declares the requirement and, when the package
is absent, raises at first use or warns and proceeds. The default is to raise,
for the reason [guarded-singleton-accessor](./guarded-singleton-accessor.md)
throws rather than returning a stub. The warn-only form exists for one
situation — a non-essential accelerator whose absence changes speed and
nothing else — and the caller asks for it by name at the declaration, so a
reader can see which requirements are advisory. A warn-only default would
make every requirement advisory: the extension-seam mistake
[refusal-is-not-failure](./refusal-is-not-failure.md) names, moved to imports.

## Decision rules

- **Run the minimal lane on every change, in an environment built from the
  mandatory set alone.** A lane that inherits the developer image inherits
  the extras and proves nothing.
- **Exclude at the lane for whole modules and collection-time imports; skip
  at the test for single cases.** The skip reads the helper's own boolean,
  never a second import attempt.
- **The list validates itself, and stale entries fail with their names
  printed as written.**
- **Pick the proxy's role at the import site**, and read an import-time raise
  in the minimal lane as a wrongly-chosen role before reading it as a missing
  list entry.
- **A deferred failure that lives for the process carries a string, never a
  traceback.**
- **Warn-only requirements are opted into by name at the declaration.**

## When not to use this

A project with no optional dependencies has no lane to run: there is one
install and the ordinary suite already proves it, and a second identical run
teaches the team that lanes are decorative. The lane earns its place at the
first extra, and belongs in the change that adds it — the moment somebody
still knows which tests need it. The self-validating list is likewise overkill
at two entries; it becomes necessary at the size where nobody reads the whole
list before editing it, which arrives sooner than it seems.
