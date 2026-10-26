import type { MouseEvent } from "react";

export function navigate(path: string) {
  if (window.location.pathname !== path) {
    window.history.pushState({}, "", path);
  }
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Use on <a href onClick>. Ctrl/Cmd/middle-click still open a new tab normally.
export function handleLinkClick(
  e: MouseEvent<HTMLAnchorElement>,
  path: string,
) {
  if (e.defaultPrevented || e.button !== 0) return;
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  e.preventDefault();
  navigate(path);
}
