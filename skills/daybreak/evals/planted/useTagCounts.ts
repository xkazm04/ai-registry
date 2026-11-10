// Planted: a memoized count for a picker. It is not a table and consumes nothing shared.
import { useMemo } from 'react';

export function useTagCounts(items: { tag: string }[]) {
  return useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of items) counts.set(item.tag, (counts.get(item.tag) ?? 0) + 1);
    return [...counts.entries()];
  }, [items]);
}
