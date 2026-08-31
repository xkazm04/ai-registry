# conformance-checking

Coverage notes for `software-engineering/engineering-assessment/maturity-and-conformance/conformance-checking`.

## 2026-08-31 — `whatwg-html-0831` (intake, `github:whatwg/html` @ `778afd9`)

Landed `declared-deviation-register` (7th technique) plus a golden-path section,
"Some failures are decisions, and they need their own class", and one application
(`rust--declared-deviation-register`, simulation, `better`).

**Found by a corpus-wide empty, not by a gap in this subject.** `research-map`
returned `PRIOR ART: none` for `"intentional nonconformance"` and for
`"why we deviate"` across 341 subjects in 8 bundles. The method warns that a
near-empty is more dangerous than an empty, so the four nearest subjects were
opened before believing it: `vendored-fork-ledger` in `supply-chain` covers
copying and patching somebody's code (the guards *end*), `standard-versus-consumer-split`
in `knowledge-registry` covers what publishes versus what stays local,
`ipc-contract` explicitly disclaims public-API economics, and
`generated-from-provenance` in `repo-manifest-standard` reserves manifest space
for "intent, exceptions, deliberate deviations and their reasons" as *human
fields a synthesizer must not overwrite* — which is a write-protection rule, not
a publication rule. None of them holds this. The empty was real.

The home was contested and the argument is worth keeping. This subject's own
boundary statement pushes contract *declaration* to `repo-manifest-standard`
("declared there, proven here"), which reads as an exclusion. It is not, because
the register's function is arithmetic rather than declarative: an accepted
deviation is a **third finding class** in a checker's output, never a suppression
(which inflates the pass ratio by exactly the number of failures the team
accepted — the incentive backwards) and never an ordinary failure (which
calibrates a team to a permanent non-zero floor, after which nothing new is
visible). That consequence lands directly on `pass-ratio-comparability`'s stated
concern, which is why it belongs here and not next door.

The golden path's four outcome kinds — hard failure, failure, warning, unable to
check — sort findings by what the checker *knew*. The fifth sorts by what
somebody *decided*, and the new section says so without disturbing the ladder.

Shared root with `fabrication-economics`, landed the same run into
`quality-gates`: both are a true, known violation that must be declared in band
and must not be reported as news. **They were deliberately not merged**, against
the standing preference for synthesis, because the decision rules do not overlap
— an author who could not comply versus a maintainer who chose not to, with
different failure modes (an undetectable fabrication; a repair that reintroduces
the avoided problem) and different required fields. The discriminator is stated
in both files.

Uncontended on the board for the whole run.
