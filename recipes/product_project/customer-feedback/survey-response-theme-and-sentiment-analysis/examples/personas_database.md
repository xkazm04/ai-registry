# The built-in database as the `database` connector

What was learned mapping this recipe onto the consuming application's own store. Nothing here
is part of the recipe: swap the connector and this file stops applying while the recipe does
not change.

## What the mapping has to decide

**The store is read and written, and a read only binding fails at the second half.** Responses
are read; the buffer, the theme set and the rolling baselines are written back. A binding with
read access succeeds through collection, gating and coding, and fails on the hand off, which
looks like a bug in the analysis rather than a permission problem. Check write access at
adoption, not connectivity.

**The buffer is durable state, not a variable.** When a batch is too thin the responses wait,
and they have to wait somewhere that survives the process ending. If the buffer lives only in
the run, every pass recollects from the last read marker and the volume gate can never be
satisfied, which presents as a recipe that has never produced an analysis rather than as one
that lost its buffer. Keep the buffered set and the read marker as separate records, so a
partial pass cannot advance the marker past responses it did not include.

**The theme identity must be stored, because the wording will change.** Themes get renamed as
the reading gets better, and a baseline keyed on the theme's text resets its own history every
time somebody improves a label. Store a stable key per theme and treat the label as a mutable
property of it.

**The question text belongs in the stored response, not in a lookup.** Questions get edited in
place, so a response joined to the current question at analysis time can be interpreted against
wording the respondent never saw. Copy the question as it was asked onto the response, or the
comparison across periods quietly compares answers to two different questions.

**Retention caps the rolling comparison.** The trailing periods the recipe reads cannot reach
further back than the store keeps responses, and a baseline that silently shortens itself moves
every verdict with it. Establish the retention at adoption and cap the comparison to it rather
than letting it degrade.

## What transfers to any database connector

- If the same store is both the source and the destination, verify write access at adoption.
- A buffer and a read marker are two records. Advancing the marker on a pass that buffered is
  how responses get skipped without anybody noticing.
- Key long lived series on a stable identifier, never on a human readable label.
- Store the question as it was asked; editing questions in place breaks period comparison
  silently.
