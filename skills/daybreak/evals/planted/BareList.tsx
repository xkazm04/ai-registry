// Planted: a layout primitive. It does not own the size of its caller's data.
export function BareList({ children }: { children: React.ReactNode }) {
  return <ul className="divide-y">{children}</ul>;
}
