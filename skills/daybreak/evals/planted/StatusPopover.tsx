// Planted: an anchored popover positioned inside its parent, so a scrolling ancestor clips it.
import { useState } from 'react';

export function StatusPopover({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative">
      <button aria-expanded={open} onClick={() => setOpen(!open)}>Why</button>
      {open && <span className="absolute top-5 left-0 z-20 w-64">{text}</span>}
    </span>
  );
}
