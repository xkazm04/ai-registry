/**
 * A deadline for every provider call the leonardo tools make.
 *
 * Why this exists: these tools called `fetch` with no signal, so a provider that
 * accepted the connection and then never answered (a stalled generation endpoint, a CDN
 * that stops mid-body) hung the process until a human killed it - with a paid generation
 * possibly still sitting in the cloud and, for generate-best, nothing reported. The
 * sibling fix for demo-film's postAudio (6a17c29e) put `AbortSignal.timeout` on that one
 * call; this is the same mechanism for the rest, as a helper so the sites stay one-liners.
 *
 * `withDeadline` wraps the WHOLE attempt - request and body read together - because
 * `AbortSignal.timeout` stays armed while the body streams, and a download that stalls
 * after the headers is the common hang. A timeout surfaces as `FetchTimeoutError`
 * (a named error, message "<label>: no response within <n> ms"), never as a bare
 * DOMException that reads like a network glitch. Retry policy is the caller's and is
 * unchanged: tools that did not retry before still do not.
 *
 * The default is generous (10 min - twice the figure postAudio uses for long music
 * cues) because image generation endpoints answer synchronously and slowly; set
 * LEONARDO_FETCH_TIMEOUT_MS to change it for every call in one run.
 *
 * Builtins only; no imports.
 */

export const DEFAULT_FETCH_TIMEOUT_MS = 600000;

export class FetchTimeoutError extends Error {
  constructor(label, timeoutMs) {
    super(`${label}: no response within ${timeoutMs} ms`);
    this.name = 'FetchTimeoutError';
    this.timeoutMs = timeoutMs;
  }
}

/** The deadline in ms: LEONARDO_FETCH_TIMEOUT_MS when it is a positive integer, else the default. */
export function fetchTimeoutMs(env = process.env) {
  const n = Number(env.LEONARDO_FETCH_TIMEOUT_MS);
  return Number.isInteger(n) && n > 0 ? n : DEFAULT_FETCH_TIMEOUT_MS;
}

/**
 * Run `fn(signal)` under a deadline. `fn` should pass `signal` to `fetch` and read the
 * body before it returns, so a stall in either is covered. Throws FetchTimeoutError when
 * the deadline fired; any other error passes through untouched.
 */
export async function withDeadline(label, fn, timeoutMs = fetchTimeoutMs()) {
  const signal = AbortSignal.timeout(timeoutMs);
  try {
    return await fn(signal);
  } catch (e) {
    if (signal.aborted && (e?.name === 'TimeoutError' || e?.name === 'AbortError')) {
      throw new FetchTimeoutError(label, timeoutMs);
    }
    throw e;
  }
}
