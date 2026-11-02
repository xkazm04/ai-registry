---
layer: technique
type: technique
subject: platform-extension-release-ladder
technique: bundled-static-code-only
status: forged
laws: []
shared_with: []
use_when: [building the front-end bundle for a platform extension, choosing libraries and a build pipeline for code that a platform reviewer will read, a dependency that loads script or evaluates strings at runtime]
---

# Bundled static code only

A platform extension's front end is the uploaded bundle and nothing else. Every script,
stylesheet, font and image it uses is inside the archive the reviewer received; no code
arrives from anywhere at runtime; no string becomes code; and the code is shipped in a
form a reviewer can read. The bundle is the version.

## Why

The platform reviews a version so that what runs in every viewer's player is what was
read. Any mechanism that lets the running code differ from the reviewed code — a script
tag pointing at a host, a dynamic import from a URL, an evaluated string, a template
compiled in the browser — voids that review, and reviewers are trained to look for
exactly those mechanisms. A team that relies on one is relying on a reviewer missing it,
and the extension's identity is the stake.

There is a second, quieter reason. Code fetched at runtime is code whose availability is
somebody else's uptime. A bundle served from the platform's own content network loads
when the platform loads; a script from a third-party host fails when that host does, and
the panel goes blank on every channel at once.

## Procedure

1. **Bundle every asset.** Fonts, icons, images and styles are files in the archive,
   referenced by relative path. A content network for a popular library is not an
   exception; vendor the file.
2. **Keep the output readable.** Ship code a reviewer can follow: unminified or with
   meaningful names preserved, one file per concern where practical. Where a third-party
   library is only available minified, ship it as its own file under its own name, never
   folded into the team's code, so the reviewer can match it to its published release.
3. **Ban runtime code paths at build time.** No evaluation of strings, no function
   constructors from text, no runtime template compilation, no dynamic import of a
   computed or remote specifier. Lint for them and fail the build; then search the built
   output for them, because a dependency can introduce one the source never wrote.
4. **Audit dependencies for what they do at runtime.** Some libraries load language
   packs, polyfills or analytics from a host on first use. Each such library is either
   configured to load from the bundle or replaced.
5. **Leave out what does not run.** Test pages, source maps the reviewer does not need,
   unused assets and development helpers are removed. Extra files are extra questions.
6. **Keep the content policy tight.** The front end runs under the platform's policy;
   do not ask it to be loosened. Anything that would need a wider script policy is a
   design problem, not a policy request.

## Decision rules

- **When a dependency evaluates strings or loads code**, replace it or configure it out;
  do not argue for an exception in review notes.
- **When readable output would expose something**, it was not a secret. The front end is
  public in every viewer's browser regardless of minification; secrets belong on the
  backend.
- **When a feature seems to need runtime code**, express it as a new named mode in the
  shell and select it from the design document.
- **When the build changes**, re-run the built-output search. A toolchain upgrade can
  introduce an evaluation path without a single source change.

## When not to use it

There is no platform extension for which this is optional. The only judgement is how
readable is readable enough, and the answer is: readable enough that a reviewer can
confirm what each file does without running it.
