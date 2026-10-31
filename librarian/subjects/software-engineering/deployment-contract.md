---
subject: deployment-contract
domain: software-engineering
last_touched: 2026-09-03
dry_streak: 0
---

# deployment-contract

First touch: 2026-09-03, an `/intake` run over a doctrine corpus ([[2026-09-03-rusttraining]]).

## State

5 -> 6 techniques, +2 applications, +2 amendments.

**`cache-immutability-licensing`** (new) — marking a served asset immutable is
**licensed by content-addressed naming**, not chosen as a tuning level. Where the
same URL serves new bytes after a rebuild, an immutability directive is a
correctness bug: clients that never revalidate pin stale code indefinitely. Placed
here after verifying `client-fetch-cache` is entirely in-process (SWR, dedup, cache
keys — no HTTP directive doctrine), and that `packaging` owns artifact identity
for distribution while `release-pipeline` owns the publish door. What a *host tells
clients about the artifact it serves* is this subject's territory.

**Amendment to `platform-build-parity` — it enumerated too little.** Its "inputs
that diverge" list is build command, runtime version, install, build-time
environment, trigger: **every one a build-time input**. The same byte-identical
artifact served by two hosts whose request-resolution rules differ (extensionless
paths, directory index, trailing-slash redirect, not-found behaviour) yields links
valid in one and broken in the other — and the build-parity check *passes*, because
the artifact really is identical. The test must request the shape that fails.

**Amendment to `deployment-config-as-code`**: config-language override semantics
that *replace* rather than *merge* a parent's directive set make security headers
silently droppable, so every block repeats what it needs. An instance of
`silent-state-is-ungoverned` about a committed config file.

## The application is a refutation, and it is the run's best structural fact

`rust--platform-build-parity`: **there is a third host.** The serving config
resolves extensionless paths and the CI smoke test asserts one returns 200 — but
the repository's own local preview server (`xtask/src/main.rs:328-375`) implements
directory-index and trailing-slash redirect and has **no `.html` fallback**, so the
very links the other two hosts were aligned on 404 in local preview. Parity was
written pairwise instead of across the host set. Nobody designed that; it fell out
of the structure.

## Architecture review - 2026-10-31

First architecture review, against `5a1c8dbf6`. All 17 documents read in full. The
subject is sound; the changes owed are narrow. Two documents carry claims the primary
sources qualify: the cache technique treats the `immutable` token as the thing that pins
clients, where RFC 8246 scopes it to the freshness lifetime (the long lifetime is what
pins, the token removes reload revalidation), and it says no channel reaches a cached
client, where `Clear-Site-Data: "cache"` on a still-revalidated document is a partial
one. Vercel's current docs add two operational facts the node applications lack (major-only
runtime selection with self-rolled minors; a rollback turns off production auto-assignment
until a promote). Two internal inconsistencies: the rust parity application derives a
"enumerate every host, preview servers included" correction the technique never carries,
and the process application cites a gate "timebox" the technique does not have while
omitting a blocking check the technique calls a hole. The public applications' file
citations were re-read at their pinned commits and hold.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/deployment-contract",
  "date": "2026-10-31",
  "baseline": "5a1c8dbf6",
  "digest": "sha256-b2:dc1097a08c9022d9",
  "disposition": "clarify",
  "coverage": "All 17 documents (golden path, 9 techniques, 7 applications) read in full. Primary sources opened: RFC 8246, Docker build-context docs, the gcloudignore reference, git's gitignore reference, MDN Clear-Site-Data, Vercel's Node.js-versions and rollback CLI pages. Public application citations re-read at their pinned commits (afterlife 009c7893: 23 file:line quotes; RustTraining 9d19c48: nginx.conf, Dockerfile pins, docker.yml smoke lines, xtask resolver and response writer). Not evaluated: the private 2026-08 fleet audit behind three node/process applications, afterlife commit 0eff95e5 (code-host API not reachable this run), anything executed.",
  "counterexamples": [
    "A one-year max-age without the immutable token still pins clients on ordinary navigation for the whole freshness lifetime; dropping the token alone does not license fixed names.",
    "A server that keeps revalidating its entry document can send Clear-Site-Data: \"cache\" to ask returning clients to drop the origin's cache, so an unlicensed immutable is recoverable for clients that come back, not for those that never do.",
    "Two hosts can agree pairwise on resolution rules while a third serving surface (a local preview server) disagrees with both; a pairwise check passes.",
    "Vercel accepts only a major Node version and rolls minors itself, so an exact CI patch pin cannot be mirrored there and one-authority parity is unattainable for that input.",
    "After a Vercel rollback, a fix-forward push to the production branch does not reach production until a deployment is promoted, because rollback turns off auto-assignment of production domains."
  ],
  "sources": [
    {"url": "https://www.rfc-editor.org/rfc/rfc8246.html", "result": "immutable 'indicates that the origin server will not update the representation of that resource during the freshness lifetime of the response'; 'Clients SHOULD NOT issue a conditional request during the response's freshness lifetime (e.g., upon a reload) unless explicitly overridden by the user (e.g., a force reload)'. Qualifies cache-immutability-licensing: the lifetime pins, the token removes reload revalidation."},
    {"url": "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Clear-Site-Data", "result": "'cache': 'The server signals that the client should remove locally cached data (the browser cache...) for the origin of the response URL.' Baseline widely available since September 2023, with 'varying levels of support' for parts. Refutes 'no channel left to reach them' as absolute."},
    {"url": "https://docs.docker.com/build/concepts/context/", "result": "'Leading and trailing slashes in ignore patterns are disregarded'; /foo/bar and foo/bar equivalent; '**' 'matches any number of directories'. Supports build-context-filter-parity's root-anchored container dialect."},
    {"url": "https://git-scm.com/docs/gitignore", "result": "'If there is a separator at the beginning or middle (or both) of the pattern, then the pattern is relative to the directory level of the particular .gitignore file itself. Otherwise the pattern may also match at any level'. Supports the unanchored-bare-name trap."},
    {"url": "https://docs.cloud.google.com/sdk/gcloud/reference/topic/gcloudignore", "result": "Syntax 'borrows heavily from that of .gitignore'; some commands generate a default; '--ignore-file' overrides it; '#!include:.gitignore' example. Supports the dedicated, explicitly passed upload filter."},
    {"url": "https://vercel.com/docs/functions/runtimes/node-js/node-js-versions", "result": "engines.node overrides the project setting; '>=22.0.0' maps to the latest 26.x; 'Only major versions are available. Vercel automatically rolls out minor and patch updates'; 'The exact minor version can differ between the build and the function runtime.' Supports the loose-range claim in node--platform-build-parity and adds the major-only limit."},
    {"url": "https://vercel.com/docs/cli/rollback", "result": "rollback re-points at a previous deployment (Hobby: only the previous production one); promote 're-enables auto-assignment of production domains'. Supports node--environment-promotion's commands and adds the auto-assignment consequence."},
    {"source": "afterlife @ 009c7893 and microsoft/RustTraining @ 9d19c48 (raw files)", "result": "Every file:line quote in node--build-context-filter-parity, rust--platform-build-parity and rust--cache-immutability-licensing, and every file quote in node--public-build-inert-by-mode, matched. resolve_site_file has no .html fallback (lines 328-375); the response writer sets no cache header."}
  ],
  "documents": {
    "deployment-contract.md": {"disposition": "keep", "reason": "Thesis, neighbour boundaries and technique summaries agree with the techniques; laws cited resolve to the techniques that apply them."},
    "techniques/platform-build-parity.md": {"disposition": "clarify", "reason": "The rust application's correction (enumerate every surface that resolves requests against the artifact, preview servers included, before comparing any two) is not in the technique, which speaks only of 'two hosts'. Add it to the section and the decision rules."},
    "techniques/build-context-filter-parity.md": {"disposition": "keep", "reason": "Both dialect claims verified against Docker and git references; the gcloud --ignore-file and generated-default behaviour match the reference."},
    "techniques/cache-immutability-licensing.md": {"disposition": "clarify", "reason": "Per RFC 8246 the immutable token is scoped to the freshness lifetime: the long lifetime pins, the token removes reload revalidation, and force reload still overrides. 'No purge that reaches it' should admit Clear-Site-Data on a revalidated document as a partial recovery for returning clients only."},
    "techniques/deploy-gate-coupling.md": {"disposition": "keep", "reason": "Race, both resolutions and the address rule are coherent. A stray blank line splits the decision-rule list; cosmetic."},
    "techniques/replace-before-retire.md": {"disposition": "keep", "reason": "Order and vulnerable-revision additions are sound; consistent with the afterlife application's account."},
    "techniques/direct-push-delivery.md": {"disposition": "keep", "reason": "Preconditions coherent with deploy-gate-coupling's gate-ahead-of-push resolution."},
    "techniques/environment-promotion.md": {"disposition": "keep", "reason": "Promotion-not-rebuild, re-pointing rollback and the migration precondition are sound."},
    "techniques/deployment-config-as-code.md": {"disposition": "keep", "reason": "Declared/inventoried split and the replace-not-merge warning hold (nginx add_header inheritance is the canonical case)."},
    "techniques/public-build-inert-by-mode.md": {"disposition": "keep", "reason": "Mode, image, proof and audit rules are coherent and match the application."},
    "applications/node--build-context-filter-parity.md": {"disposition": "keep", "reason": "Every file:line quote re-read at 009c7893 and matched; verified_on may move to 2026-10-31."},
    "applications/node--environment-promotion.md": {"disposition": "clarify", "reason": "Commands verified against Vercel's rollback page, which adds that a rollback turns off production auto-assignment until a promote; the fix-forward step needs that sentence. The 2026-08 private fleet audit was not reopened."},
    "applications/node--platform-build-parity.md": {"disposition": "clarify", "reason": "The engines.node claim is verified (>=22 maps to the latest major). Add that Vercel takes only a major and rolls minors itself, so the CI's exact patch pin stays a deliberate second authority. The private fleet audit was not reopened."},
    "applications/node--public-build-inert-by-mode.md": {"disposition": "reverify", "reason": "All file quotes at 009c7893 matched; commit 0eff95e5 (the version bump and rename) could not be reached this run, so verified_on stays."},
    "applications/process--direct-push-delivery.md": {"disposition": "clarify", "reason": "Says the e2e suites 'fail the technique's timebox'; the technique has no timebox and calls a remotely blocking check absent locally 'a hole, not an optimization'. Reword as a recorded deviation with the after-push watch as compensation. Private fleet audit not reopened."},
    "applications/rust--cache-immutability-licensing.md": {"disposition": "keep", "reason": "nginx.conf comment, no-cache and expires 1d lines and the preview server's header-free writer re-read at 9d19c48 and matched."},
    "applications/rust--platform-build-parity.md": {"disposition": "keep", "reason": "nginx try_files and comment, docker.yml smoke requests, Dockerfile pins, and resolve_site_file's missing .html fallback re-read at 9d19c48 and matched."}
  }
}
```

## Architecture review - 2026-10-31 (clarify applied)

Applied the five clarify items the record above named, each from a source opened this
run or an internal inconsistency checked against the technique text. Three public
applications had every citation re-read and their `verified_on` moved. The three
applications resting on the private 2026-08 fleet audit keep `reverify`, which is now the
overall disposition; afterlife commit `0eff95e5` is still owed a look.

<!-- architecture-review:v1 -->
```json
{
  "subject": "software-engineering/deployment-contract",
  "date": "2026-10-31",
  "baseline": "5a1c8dbf6",
  "digest": "sha256-b2:66ef9f7ffefe7981",
  "disposition": "reverify",
  "coverage": "All 17 documents decided. The five clarify items of the first 2026-10-31 record were applied and the edited passages re-read; verified_on moved to 2026-10-31 on the three public applications whose every citation was re-read this run. Other documents are byte-unchanged and keep their dispositions. Not evaluated: the private 2026-08 fleet audit, afterlife commit 0eff95e5, anything executed. verified_against untouched.",
  "counterexamples": [
    "A one-year max-age without the immutable token still pins clients on ordinary navigation for the whole freshness lifetime; dropping the token alone does not license fixed names.",
    "A server that keeps revalidating its entry document can send Clear-Site-Data: \"cache\" to ask returning clients to drop the origin's cache, so an unlicensed immutable is recoverable for clients that come back, not for those that never do.",
    "Two hosts can agree pairwise on resolution rules while a third serving surface (a local preview server) disagrees with both; a pairwise check passes.",
    "Vercel accepts only a major Node version and rolls minors itself, so an exact CI patch pin cannot be mirrored there and one-authority parity is unattainable for that input.",
    "After a Vercel rollback, a fix-forward push to the production branch does not reach production until a deployment is promoted, because rollback turns off auto-assignment of production domains."
  ],
  "sources": [
    {
      "url": "https://www.rfc-editor.org/rfc/rfc8246.html",
      "result": "immutable 'indicates that the origin server will not update the representation of that resource during the freshness lifetime of the response'; 'Clients SHOULD NOT issue a conditional request during the response's freshness lifetime (e.g., upon a reload) unless explicitly overridden by the user (e.g., a force reload)'. Qualifies cache-immutability-licensing: the lifetime pins, the token removes reload revalidation."
    },
    {
      "url": "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Clear-Site-Data",
      "result": "'cache': 'The server signals that the client should remove locally cached data (the browser cache...) for the origin of the response URL.' Baseline widely available since September 2023, with 'varying levels of support' for parts. Refutes 'no channel left to reach them' as absolute."
    },
    {
      "url": "https://docs.docker.com/build/concepts/context/",
      "result": "'Leading and trailing slashes in ignore patterns are disregarded'; /foo/bar and foo/bar equivalent; '**' 'matches any number of directories'. Supports build-context-filter-parity's root-anchored container dialect."
    },
    {
      "url": "https://git-scm.com/docs/gitignore",
      "result": "'If there is a separator at the beginning or middle (or both) of the pattern, then the pattern is relative to the directory level of the particular .gitignore file itself. Otherwise the pattern may also match at any level'. Supports the unanchored-bare-name trap."
    },
    {
      "url": "https://docs.cloud.google.com/sdk/gcloud/reference/topic/gcloudignore",
      "result": "Syntax 'borrows heavily from that of .gitignore'; some commands generate a default; '--ignore-file' overrides it; '#!include:.gitignore' example. Supports the dedicated, explicitly passed upload filter."
    },
    {
      "url": "https://vercel.com/docs/functions/runtimes/node-js/node-js-versions",
      "result": "engines.node overrides the project setting; '>=22.0.0' maps to the latest 26.x; 'Only major versions are available. Vercel automatically rolls out minor and patch updates'; 'The exact minor version can differ between the build and the function runtime.' Supports the loose-range claim in node--platform-build-parity and adds the major-only limit."
    },
    {
      "url": "https://vercel.com/docs/cli/rollback",
      "result": "rollback re-points at a previous deployment (Hobby: only the previous production one); promote 're-enables auto-assignment of production domains'. Supports node--environment-promotion's commands and adds the auto-assignment consequence."
    },
    {
      "source": "afterlife @ 009c7893 and microsoft/RustTraining @ 9d19c48 (raw files)",
      "result": "Every file:line quote in node--build-context-filter-parity, rust--platform-build-parity and rust--cache-immutability-licensing, and every file quote in node--public-build-inert-by-mode, matched. resolve_site_file has no .html fallback (lines 328-375); the response writer sets no cache header."
    }
  ],
  "documents": {
    "deployment-contract.md": {
      "disposition": "keep",
      "reason": "Thesis, neighbour boundaries and technique summaries agree with the techniques; laws cited resolve to the techniques that apply them."
    },
    "techniques/platform-build-parity.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: added the host-set enumeration (every surface that resolves requests, local preview servers included, before comparing any two) to the parity section and as a decision rule."
    },
    "techniques/build-context-filter-parity.md": {
      "disposition": "keep",
      "reason": "Both dialect claims verified against Docker and git references; the gcloud --ignore-file and generated-default behaviour match the reference."
    },
    "techniques/cache-immutability-licensing.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: the pinning bullet now says the long freshness lifetime pins and the directive (scoped by RFC 8246 to that lifetime) removes reload revalidation, force reload excepted; admits a cache-clearing header on a revalidated document as a partial channel for returning clients only."
    },
    "techniques/deploy-gate-coupling.md": {
      "disposition": "keep",
      "reason": "Race, both resolutions and the address rule are coherent. A stray blank line splits the decision-rule list; cosmetic."
    },
    "techniques/replace-before-retire.md": {
      "disposition": "keep",
      "reason": "Order and vulnerable-revision additions are sound; consistent with the afterlife application's account."
    },
    "techniques/direct-push-delivery.md": {
      "disposition": "keep",
      "reason": "Preconditions coherent with deploy-gate-coupling's gate-ahead-of-push resolution."
    },
    "techniques/environment-promotion.md": {
      "disposition": "keep",
      "reason": "Promotion-not-rebuild, re-pointing rollback and the migration precondition are sound."
    },
    "techniques/deployment-config-as-code.md": {
      "disposition": "keep",
      "reason": "Declared/inventoried split and the replace-not-merge warning hold (nginx add_header inheritance is the canonical case)."
    },
    "techniques/public-build-inert-by-mode.md": {
      "disposition": "keep",
      "reason": "Mode, image, proof and audit rules are coherent and match the application."
    },
    "applications/node--build-context-filter-parity.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: every file:line quote re-read at 009c7893 and matched; verified_on moved to 2026-10-31."
    },
    "applications/node--environment-promotion.md": {
      "disposition": "reverify",
      "reason": "applied 2026-10-31: rollback turns off production auto-assignment until a promote, and the Hobby limit, from Vercel rollback docs. Still reverify: the 2026-08 private fleet audit was not reopened; verified_on unchanged."
    },
    "applications/node--platform-build-parity.md": {
      "disposition": "reverify",
      "reason": "applied 2026-10-31: Vercel maps >=22.0.0 to the latest 26.x, offers majors only and rolls minors itself, so the exact CI pin is a recorded second authority. Still reverify: the private fleet audit was not reopened; verified_on unchanged."
    },
    "applications/node--public-build-inert-by-mode.md": {
      "disposition": "reverify",
      "reason": "All file quotes at 009c7893 matched; commit 0eff95e5 (the version bump and rename) could not be reached this run, so verified_on stays."
    },
    "applications/process--direct-push-delivery.md": {
      "disposition": "reverify",
      "reason": "applied 2026-10-31: the non-existent technique timebox replaced by a recorded deviation (remote-only e2e suites are a hole the after-push watch compensates). Still reverify: the private fleet audit was not reopened."
    },
    "applications/rust--cache-immutability-licensing.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: citations re-read at 9d19c48 and matched; verified_on moved to 2026-10-31."
    },
    "applications/rust--platform-build-parity.md": {
      "disposition": "keep",
      "reason": "applied 2026-10-31: citations re-read at 9d19c48 and matched (workflow action majors not re-listed); verified_on moved to 2026-10-31."
    }
  }
}
```
