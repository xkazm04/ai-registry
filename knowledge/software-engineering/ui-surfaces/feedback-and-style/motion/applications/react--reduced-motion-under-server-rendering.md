---
layer: application
type: application
subject: motion
technique: reduced-motion-mechanics
stack: react
verified_on: 2026-08-28
---

# React application — reduced motion under server rendering

The technique states that a reduction mechanism reaches only the engine it
lives in, and that the preference is live: *"subscribe, and where the
platform's own reader does not subscribe, wrap it and forbid the raw one."*
Server rendering adds a second axis the technique does not name, and it has a
worse failure mode than a missed engine. Evidence below is from `personas-web`
(Next.js 16 App Router, React 19, framer-motion), scanned 2026-08-28.

## The reader is wrong on the server, not just stale

framer-motion's `useReducedMotion` is, in full:

```js
!hasReducedMotionListener.current && initPrefersReducedMotion();
const [shouldReduceMotion] = useState(prefersReducedMotion.current);
```

Two properties follow, and only the first is the one teams look for.

- **It never subscribes.** `useState` samples once; the source carries a
  standing `TODO` about whether anyone misses live updates. This is exactly the
  sample-once reader the technique says to wrap.
- **It answers wrong on the server.** `motion-dom`'s state module initialises
  `prefersReducedMotion = { current: null }` with the comment *"Returns `null`
  server-side"*, and `initPrefersReducedMotion` early-returns when `!isBrowser`.
  So the server always answers "motion is fine", while the client's first render
  — before `useState` samples — has already run `matchMedia` synchronously and
  answers with the truth.

A sample-once reader degrades gracefully: the user gets the accommodation on
the next reload. A reader that disagrees across the render boundary does not
degrade at all — it produces a **hydration mismatch**, and the recovery is the
expensive one.

## Branching markup on the preference inverts the accommodation

When the value decides *element shape* rather than animation values, the server
emits one tree and the client's first render produces another. React discards
the subtree and re-renders it on the client. The cost lands on precisely the
visitors who asked for less work:

> "the most work possible for precisely the visitors who asked for less"
> — the wrapper's own header comment, written after the bug shipped

The canonical shapes are `if (reduced) return null` and returning children
unwrapped instead of wrapped. In the scanned repo, 133 files read the
preference; 17 branched on shape; 4 of those server-rendered, and one of the
four wrapped **every route in the application**:

```tsx
// before — server emits the wrapper, a reduced-motion client's first render does not
if (prefersReducedMotion) return <>{children}</>;
return <motion.div key={pathname} variants={pageTransition} …>{children}</motion.div>;
```

Note the exemption that keeps the rule honest: a component rendered only behind
a client-only dynamic import or a viewport-gated mount never server-renders, so
shape-branching there is safe. The repo had independently reasoned this out in
one file's comment — *"This deck is mounted with `ssr: false` … so branching on
`reduced` during render cannot desync hydration"* — which is a good sign the
rule is discoverable, and a bad sign that it lived in one comment.

## The wrapper, made concrete

`useSyncExternalStore` is the right primitive, because React deliberately uses
`getServerSnapshot` for the **hydrating** render too. The first client paint
therefore agrees with the server by construction, and the true preference
arrives on the next commit:

```ts
const QUERY = "(prefers-reduced-motion: reduce)";
const subscribe = (cb) => { const m = matchMedia(QUERY); m.addEventListener("change", cb);
                            return () => m.removeEventListener("change", cb); };
const getSnapshot = () => matchMedia(QUERY).matches;
const getServerSnapshot = () => false;   // guess "motion", then correct
export const useStillMotion = () => useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
```

`getServerSnapshot` returning `false` is a deliberate asymmetry worth stating:
guessing "reduced" would ship a still page to every visitor for one frame,
which is a worse default than one corrected commit for some.

This single wrapper fixes both defects — SSR agreement *and* liveness — which
is why "wrap it and forbid the raw one" is the whole prescription rather than
half of it.

## Two placement rules that decide whether the fix holds

**Gate the props, not the element.** Once the reader is SSR-safe the mismatch
is gone, but a shape branch still costs a reflow on the correcting commit. Keep
DOM shape constant and vary `animate`/`variants`/`transition`, so the
accommodation costs a stopped animation instead of a re-layout. This is the
technique's "prefer gating an `animate` prop over dropping an element", and
under SSR it is what turns a full-page reflow into nothing visible.

**Build the merged pause signal on the wrapper.** Where a product implements
loop-pause-governance's merged signal, that coordinator reads the preference on
behalf of every consumer — so if *it* uses the raw hook, every downstream loop
inherits the SSR defect no matter how disciplined the call sites are. One edit
inside the coordinator fixed four deciders' worth of consumers in the scanned
repo. The corollary for auditors: check the coordinator's reader first; it is
the highest-leverage line in the system.

## The accidental shield, and why it needs writing down

The same repo's authenticated dashboard renders locale- and clock-dependent
values during render — the shape that mismatches — and does not break, because
an auth gate renders a skeleton until a client-only effect resolves. Server and
client agree on the skeleton, and the divergent content only ever mounts
post-hydration.

That is a real shield and it is entirely undocumented, which makes it a
liability of a specific kind: **a load-bearing invariant nobody named.** A
future change that resolves auth on the server, or removes the loading state,
silently reintroduces a whole bug class with no failing test and no reviewer
prompt. When an audit finds structural safety that no one designed, the
finding is not "this area is fine" — it is "this area is fine for a reason that
must be recorded before someone optimises it away."

## Enforcement

A lint rule that requires "a reduced-motion gate" must accept the wrapper and
the merged signal, or it fights the fix — the scanned repo's rule matched the
raw hook's identifier by name and began flagging files the moment they were
migrated to the safer reader. Keep the accepted-gate list in one named set, and
prefer the wrapper in the rule's message so the rule teaches the hierarchy
rather than merely permitting it.
