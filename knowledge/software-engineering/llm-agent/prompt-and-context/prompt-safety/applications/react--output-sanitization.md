---
layer: application
type: application
subject: prompt-safety
technique: output-sanitization
stack: react
verified_on: 2026-10-31
verified_against: react@19
---

# Output sanitization on the display side

The frontend's sanitizer family lives in `src/lib/utils/sanitizers/` and
treats everything that came out of an execution — model output, error
messages, connector metadata — as untrusted input to the screen, the crash
log, and the error tracker.

## Secret masking before display and telemetry

`maskSensitive.ts` carries both halves of the display-side masking pass:

- `maskSensitiveJson` (`maskSensitive.ts:62-71`) parses, walks, and
  re-serializes JSON, masking values whose keys match the sensitive-key
  vocabulary (`SENSITIVE_KEY_RE`, `:18-19`) — used by the execution list row,
  the execution detail modal, crash persistence, and the Sentry scrubber.
- `sanitizeErrorMessage` (`:146-182`) scrubs error text: URLs are parsed and
  their query/fragment (where tokens live) stripped *first*, stashed behind
  placeholders so the file-path pass cannot shred them (`:147-169` — the
  comment documents the real bug this ordering fixed), then paths, IPs,
  internal hostnames, emails, labeled key:value secrets, and prefixed token
  shapes are replaced.
- The token-class patterns (`PREFIXED_SECRET_RE`, `:124-125`) are the
  standard's precision story in the negative: the 2026-08-15 in-file
  correction (`:108-123`) records that the previous regex **could not match
  any token one issuer has ever issued** — the fix already existed in
  `src-tauri/core/src/redact.rs`, a different module in a different language,
  "which is why nothing noticed." The per-class forms are now copied from
  there, with the comment as the mirror marker; the shared cross-language
  test corpus the technique calls for still does not exist.

Re-checked 2026-10-31 at personas@22260d77: a shared corpus file now exists,
`fixtures/redact-text-v2.json`, but only the Rust side reads it
(`src-tauri/src/cloud/sync/redact.rs:669`); no TypeScript test loads it, so the
cross-language mirror is still unchecked from the frontend's side.

The backend sibling, `redact.rs`, additionally demonstrates the
precision-bias rule: its entropy sweep refuses pure-hex tokens (UUIDs, git
SHAs) and demands mixed character classes (`redact.rs:133-152`), because a
default-on masker that corrupts identifiers gets kill-switched
(`REDACT_TRACES_ENABLED`, `:29-45`).

## Link schemes: allowlist, parsed, checked before trim

`sanitizeUrl.ts` is the scheme-allowlist rule as shipped code:

- `sanitizeExternalUrl` (`sanitizeUrl.ts:148-170`) admits only `http:`/`https:`
  via the **parsed** protocol, rejects embedded credentials and hostless
  URLs, and — the detail worth stealing — runs `hasUnsafeCodepoints` on the
  *untrimmed* input (`:151-153`), because trim itself strips the BOM and
  zero-width characters an attacker uses to disguise a scheme, letting them
  "slip past the check."
- `hasUnsafeCodepoints` (`:90-111`) enumerates the disguise alphabet: C0/C1
  controls, zero-widths, bidi overrides and isolates, line separators, BOM.
- `sanitizeIconUrl` (`:117-137`) is stricter for image sources — `https:` only,
  private/local hostnames blocked (`isBlockedHostname`, `:75-81`, exported so
  other sanitizers share the one blocklist rather than growing copies).

Callers get `null` for anything unsafe and must fall back to a placeholder —
reject, not repair.

## The known gap this application confirms

The markup half of the technique is server-side here: `strip_html_tags`
(`src-tauri/core/src/validation/mod.rs:18-33`) strips tags via an allowlist
sanitizer with an *empty* allowlist, then decodes entities back **once** for
readability (now including `&nbsp;`). That is a single decode after the strip, not the fixpoint the
technique requires — once-encoded markup survives as live-looking text whose
safety depends on every downstream renderer escaping. Deviation reported;
standard kept.
