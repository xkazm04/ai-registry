# measurement-honesty

## 2026-09-06 — intake sofka-0906

Added `control-failure-is-not-a-datum-state`, plus one paragraph in the golden
path beside the existing "outside the seven states" paragraph.

The finding came from walking a real withheld measurement against the
seven-state enumeration and the eighth mechanism, and finding no home. The
structural reason is worth keeping: **every state in the model is a property
of one value** — its relationship to its instrument, to co-published numbers,
or to its own subject. A comparison can fail in a way that is a property of
the *pair*, with both values clean. That is a confound, and the model was
built for data.

The golden path's claim "a datum has seven states, not two" stays true and was
not touched; a contrast is not a datum. The append mirrors the shape the file
already uses for `unelidable-measurement`.

Boundary drawn explicitly against `noise-band-and-hysteresis`: a difference
inside the measured band is a *valid comparison finding nothing*; a failed
control is *no comparison at all*. The two must not share wording, because
they send a reader to opposite next actions.

Attention: this subject has ten techniques and is not in `librarian-scan`'s
top 15 — the landing was scored GAIN 3 on the refutation of a stated
enumeration, not on the subject's attention points.
