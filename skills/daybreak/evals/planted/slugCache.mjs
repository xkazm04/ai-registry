// Planted: a tiny pure memo over an immutable input. No registry standard should claim it.
const slugs = new WeakMap();

export function slugsFor(snapshot) {
  let found = slugs.get(snapshot);
  if (!found) {
    found = snapshot.names.map((n) => n.toLowerCase());
    slugs.set(snapshot, found);
  }
  return found;
}
