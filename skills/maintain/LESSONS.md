## 1.0.0 - 2026-09-10 - ascent

- The first field batch found repeated tokenization inside pairwise clustering. Reusing per-call token sets preserved 20 saved outputs and reduced a synthetic 200-item benchmark median from 408.7 ms to 3.5 ms. This demonstrates one local improvement, not a universal net-benefit guarantee or production latency measurement.
- A source map can identify a context while only a subset of its files was inspected. Keep the actual read set and uninspected disciplines visible; a successful batch does not certify the whole context.
- Git-excluding evidence does not exclude it from a project's lint discovery. A local CommonJS benchmark triggered the application's import-style rule; preserving it as an evidence transcript restored validation without changing lint policy.
