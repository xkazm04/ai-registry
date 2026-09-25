"use client";

/*
 * Illustration variant switcher - a TEMPLATE. Adapt it to the project: swap the
 * class names for the project's tokens (or use its own segmented/tab component and
 * keep only the state logic), and delete this comment.
 *
 * Contract (the capture instrument relies on it):
 *   - the section root carries data-illustrate="<section-slug>"
 *   - each tab carries data-illustrate-tab="<variant-key>"
 *   - "current" is the first tab and the default
 *   - the selection is mirrored to ?illustrate=<section>:<key> so a variant can be linked
 *   - each variant marks its illustration root data-illustrate-art (the text budget is
 *     measured inside it; the section heading and lede sit outside)
 *
 * It renders the same markup on the server and on the first client render
 * (current selected), then reads the query after mount. That keeps hydration
 * stable, and a visitor without script sees the current section unchanged.
 */

import { useId, useState, useSyncExternalStore, type ComponentType, type KeyboardEvent } from "react";

// The query is external state. Reading it through useSyncExternalStore keeps the server
// and hydration renders identical (null) without a setState inside an effect, which
// strict hook lint rules reject.
const subscribe = (onChange: () => void) => {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
};
const readQuery = () => new URLSearchParams(window.location.search).get("illustrate");
const noQueryOnServer = () => null;

export interface IllustrationVariant<P> {
  key: string;            // "current", "console", "relay", ...
  label: string;          // short tab label
  hint: string;           // one line: the central idea
  Component: ComponentType<P>;
}

export function IllustrationSwitcher<P extends object>({
  section,
  variants,
  props,
  visibility = "always",
}: {
  section: string;
  variants: IllustrationVariant<P>[];
  props: P;
  visibility?: "always" | "query";
}) {
  const uid = useId();
  const [picked, setPicked] = useState<string | null>(null);
  const wanted = useSyncExternalStore(subscribe, readQuery, noQueryOnServer);
  // One query param serves every switcher on the page: ?illustrate=<section>:<key>.
  const [sec, fromQuery] = (wanted ?? "").split(":");
  const linked = sec === section && variants.some((v) => v.key === fromQuery) ? fromQuery : null;
  const active = picked ?? linked ?? variants[0].key;
  const showTabs = visibility === "always" || wanted !== null;

  const select = (key: string) => {
    setPicked(key);
    const url = new URL(window.location.href);
    url.searchParams.set("illustrate", `${section}:${key}`);
    window.history.replaceState(null, "", url);
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const i = variants.findIndex((v) => v.key === active);
    const n = (i + (e.key === "ArrowRight" ? 1 : variants.length - 1)) % variants.length;
    select(variants[n].key);
    document.getElementById(`${uid}-tab-${variants[n].key}`)?.focus();
    e.preventDefault();
  };

  const Active = (variants.find((v) => v.key === active) ?? variants[0]).Component;

  return (
    <div data-illustrate={section}>
      {showTabs && (
        <div role="tablist" aria-label="Illustration variant" onKeyDown={onKey} className="illustrate-tabs">
          {variants.map((v) => (
            <button
              key={v.key}
              id={`${uid}-tab-${v.key}`}
              role="tab"
              type="button"
              aria-selected={v.key === active}
              aria-controls={`${uid}-panel`}
              tabIndex={v.key === active ? 0 : -1}
              data-illustrate-tab={v.key}
              title={v.hint}
              onClick={() => select(v.key)}
              className="illustrate-tab"
            >
              <span>{v.label}</span>
              <small>{v.hint}</small>
            </button>
          ))}
        </div>
      )}
      <div id={`${uid}-panel`} role={showTabs ? "tabpanel" : undefined}>
        <Active {...props} />
      </div>
    </div>
  );
}
