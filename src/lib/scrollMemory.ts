const prefix = "antony-scroll:";

export function scrollMemoryKey(pathname: string) {
  return `${prefix}${pathname || "/"}`;
}

export function readStoredScroll(pathname: string) {
  try {
    const value = Number.parseFloat(sessionStorage.getItem(scrollMemoryKey(pathname)) ?? "0");
    return Number.isFinite(value) ? Math.max(value, 0) : 0;
  } catch {
    return 0;
  }
}

export function writeStoredScroll(pathname: string, value: number) {
  try {
    sessionStorage.setItem(scrollMemoryKey(pathname), String(Math.max(Math.round(value), 0)));
  } catch {
    // Storage can be unavailable in strict privacy modes.
  }
}

export function isReloadNavigation() {
  const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  return navigation?.type === "reload";
}
