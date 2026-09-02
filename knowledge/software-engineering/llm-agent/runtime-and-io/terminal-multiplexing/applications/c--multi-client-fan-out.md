---
layer: application
type: application
subject: terminal-multiplexing
technique: multi-client-fan-out
stack: c
status: forged
verified_on: 2026-09-02
---

# tmux — how the reference multiplexer bounds fan-out to many attached clients

*Citations are against `tmux/tmux` on GitHub at commit `1dd1717` (master,
2026-09-02; `configure.ac` declares `next-3.8`). External tree, so the pin
is in prose rather than `verified_against`, a stack runtime version. Version
attributions come from the tree's own `CHANGES` file.*

tmux is the field's canonical server-owned runtime: "Any number of tmux
instances may connect to the same session" (`tmux.1:67`), and the server
holds one grid per pane while each client holds a tty. It is therefore the
best available reading of the technique's claims, and it confirms every
mechanic the technique states — with the split between screen-derived and
byte-faithful subscribers visible as two different files.

## The screen-derived client: discard and redraw, per client

`tty.c` owns the per-client output side. The block thresholds are stated in
the client's own screen area (`tty.c:81-83`):

```c
#define TTY_BLOCK_INTERVAL (100000 /* 100 milliseconds */)
#define TTY_BLOCK_START(tty) (1 + ((tty)->sx * (tty)->sy) * 8)
#define TTY_BLOCK_STOP(tty) (1 + ((tty)->sx * (tty)->sy) / 8)
```

`tty_block_maybe` (`:219-245`) is the slow-client policy in twenty lines:
when the client's `out` buffer reaches eight screensful, it logs
`"%s: can't keep up, %zu discarded"`, drains the entire queue
(`evbuffer_drain(tty->out, size)`), adds the size to `c->discarded`, sets
`TTY_BLOCK`, and arms a 100 ms timer. The timer callback (`:196-216`)
re-checks how much was discarded in the interval; once it is below an
eighth of a screen it clears `TTY_BLOCK`, sets `CLIENT_ALLREDRAWFLAGS` and
calls `tty_invalidate(tty)` — the full redraw from the grid. The pane, the
child, and every other client are untouched by any of this; the discard is
a per-client fact counted against that client (`c->discarded`), which is
the technique's "dropped and redrawn, never allowed to stall the session"
as shipped.

## The byte-faithful subscriber: paused, told, or disconnected

Control-mode clients receive the pane's bytes as `%output` lines and cannot
be redrawn from the grid, and `control.c` treats them accordingly. Each
control client carries its own offset into the pane's buffer
(`control_pane_offset`, `:312-333`), with `CONTROL_BUFFER_LOW 512` and
`CONTROL_BUFFER_HIGH 8192` (`:126-127`) as the watermarks on the client's
write queue. `control_check_age` (`:523-553`) measures how long the oldest
undelivered block has waited and then forks on the client's declared
policy:

```c
if (c->flags & CLIENT_CONTROL_PAUSEAFTER) {
        if (age < c->pause_age)
                return (0);
        cp->flags |= CONTROL_PANE_PAUSED;
        control_discard_pane(c, cp);
        control_notify_write(c, "%%pause %%%u", wp->id);
} else {
        if (age < CONTROL_MAXIMUM_AGE)
                return (0);
        c->exit_message = xstrdup("too far behind");
        c->flags |= CLIENT_EXIT;
        control_discard(c);
}
```

With `pause-after=seconds` set (`refresh-client -f`, `tmux.1:1124-1127`),
the pane is paused *for that client*, its queued output discarded, and
`%pause %<pane>` sent; the client resumes with `refresh-client -A
'%<pane>:continue'`, at which point `control_continue_pane` (`:364-375`)
resets the client's offset to the pane's current offset and sends
`%continue` — the gap is real and announced, never papered over. While the
flag is set, `%output` is replaced by `%extended-output`, whose `age`
argument "is the time in milliseconds for which tmux had buffered the
output before it was sent" (`tmux.1:9097-9105`; the `read-only` flag
sits at `:1128-1129`), so a subscriber can see
itself falling behind before it is paused. Without the flag, a client more
than `CONTROL_MAXIMUM_AGE` (300 000 ms, `:133`) behind is exited with
`"too far behind"`. `CHANGES` dates the pause mechanism to 3.2 ("Add
support for pausing a pane when the output buffered for a control mode
client gets too far behind").

## The child is throttled last, and the buffer drains to the slowest reader

`server_client_check_pane_buffer` (`server-client.c:2017-2101`) is the
shared-buffer rule. It computes `minimum` as the smallest `used` offset
across the pane's own consumer, its pipe, and every control client that is
neither off nor paused, then `evbuffer_drain(evb, minimum)` — the buffer is
freed only up to what *all* un-paused readers have consumed. The decision
to stop reading the pseudo-terminal is at the end, with its comment:

> If there is data remaining, and there are no clients able to consume it,
> do not read any more. This is true when there are attached clients, all
> of which are control clients which are not able to accept any more data.

Any ordinary tty client present (`~c->flags & CLIENT_CONTROL`) forces
`off = 0`, so a single screen-derived viewer that is keeping up keeps the
child running regardless of how far behind the byte subscribers are. The
manual states the same rule from the other side: `refresh-client -A
'%<pane>:off'` means tmux "will not send output from the pane to the client
and if all clients have turned the pane off, will stop reading from the
pane" (`tmux.1:1507-1511`).

## Size arbitration is a named option, and control clients do not vote

`window-size` takes `largest | smallest | manual | latest`
(`tmux.1:6223-6238`): largest or smallest attached session, a fixed
`default-size`, or "the size of the client that had the most recent
activity". `CHANGES` records the option arriving in 2.9 with the
clipped-viewport behaviour spelled out — "If a window is in a session
attached to a client that is too small, only part of the window is shown.
tmux attempts to keep the cursor visible, so the part of the window
displayed is changed as the cursor moves (with a small delay, to try and
avoid excess redrawing when applications redraw status lines or similar
that are not currently visible)" — together with the cost warning:
"Drawing windows which are larger than the client is not as efficient as
those which fit … it is recommended to avoid using this on slow machines
or networks (set window-size to smallest or manual)". `latest` was added
and made the default in 3.1. `aggressive-resize` (`tmux.1:5662-5673`)
narrows the arbitration to sessions "for which it is the current window",
which is the per-surface rule. `default_window_size` (`resize.c:284-305`)
takes the `latest` client's `tty.sx`/`tty.sy` directly and, per its
comment at `:307-309`, ignores the client when it is a control client.

## Write permission is per client

`attach-session -r` is "an alias for `-f read-only,ignore-size`"
(`tmux.1:1137-1140`) and makes an attachment that receives output and sends
nothing; `server-access -r`/`-w` (`:1587`) sets read or write access per
user. The keyboards of every writable
client merge at the pane's input, exactly as the technique says they must.

## What this tree does not show

- **No measurement of the fan-out multiplier itself.** The thresholds are
  in cells, not in bytes per second per client, and nothing here says what
  M costs on a real link; that number would come from an instrumented
  deployment, not from this tree.
- **The 8× / ⅛-screen thresholds are constants, not tuned values.** No
  comment justifies them beyond the `can't keep up` log line, so a
  transplant should treat them as one working choice rather than a
  measured optimum.
- **History is in lines** (`history-limit` is documented "Ar lines",
  `tmux.1:5284`), which follows from the server-owned grid and is not
  evidence for or against the byte-bounded ring the subject's other
  design uses.
