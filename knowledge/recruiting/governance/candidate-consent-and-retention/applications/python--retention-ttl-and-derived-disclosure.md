---
layer: application
type: application
subject: candidate-consent-and-retention
technique: retention-ttl-and-derived-disclosure
stack: python
status: forged
verified_on: 2026-10-21
verified_against: python@3.12
applied: code
ab_verdict: better
---

# A retention knob for CV-bearing debug captures, and the value float() let through

A hiring engine's Python logger can capture each model prompt and response to disk.
Those files hold a candidate's whole CV. Their retention is one environment variable,
read at kp `efa2089f1`, fixed in `47fd18d35`.

## What the module gets right

- **It discloses the default, including the unflattering part.** The docstring says
  the files are swept on `KP_LOG_PROMPTS_TTL_H`, and that
  `pipeline/jobfit/logger.py:16 "With the variable unset the artifacts are NEVER"`
  swept, calling that "the honest statement of the retention story, not a promise of
  one". The architecture doc repeats it. A disclosure that names an unbounded default
  is better than one that implies a clock.
- **The sweep needs no scheduler.** It runs before each write
  (`pipeline/jobfit/logger.py:131`), so a self-hosted install without a cron still
  enforces whatever window is set. This is the technique's point that a clock should
  not depend on a job somebody has to register.
- **It reads the knob per call**, so an operator can turn retention on for a running
  install (`pipeline/jobfit/logger.py:71`).

## The parse rule, and the value it missed

The module treats a malformed or non-positive value as unset. Its reason is that
a broken number "must not silently delete artifacts, nor silently look like a retention
policy that is not one". The parse used `float()`, which accepts `inf` and `nan`. Run
against the real function (Python 3.12, n = 8 values):

| `KP_LOG_PROMPTS_TTL_H` | before | after `47fd18d35` |
|---|---|---|
| unset, `""` | `None` | `None` |
| `48` | `48.0` | `48.0` |
| `72h`, `0`, `-1`, `nan` | `None` | `None` |
| `inf` | **`inf`** | `None` |

`inf` passed the `> 0` check and came back as a live TTL. The sweep's cutoff became
`-inf`, nothing was ever removed, and the function reported a retention window. That
is exactly the policy-that-is-not-one the docstring rules out. The fix treats a
non-finite value as malformed (`pipeline/jobfit/logger.py:90`). The existing
malformed-value test now includes `inf`, `nan` and `-inf`. It was seeded red on `inf`
before the change and passes 21/21 after it. That is the `code` / `better` verdict, for
the case kp's own stated policy already covers.

## Where it still deviates from the technique

The technique's condition is that a malformed **or absent** retention value on a store
holding candidate content resolves to the documented bounded default, never to
unbounded. This module resolves both to "never swept", deliberately. kp's 2026-09-22
low-risk drain deferred "Default a TTL when KP_LOG_PROMPTS is on" as "an intentional
policy choice", and the captures are an operator opt-in. That trade is defensible for a
debugging aid the operator turns on by hand. It stops being defensible when the
captures are left on in a deployment that tells candidates their data is erased
(see the python application under `one-transaction-scrub-across-linked-records`). Same
repository, opposite resolution: the consent TTL in `app/_lib/consent.ts` falls back to
365 days on a malformed value, while this knob falls back to forever.
