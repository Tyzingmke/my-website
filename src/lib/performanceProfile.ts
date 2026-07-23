export type PerformanceTier = "high" | "balanced" | "low" | "legacy";

type NavigatorHints = Navigator & {
  deviceMemory?: number;
  connection?: {
    saveData?: boolean;
    effectiveType?: string;
  };
  userAgentData?: {
    mobile?: boolean;
    platform?: string;
  };
};

export type PerformanceProfile = {
  tier: PerformanceTier;
  locked: boolean;
  source: "auto" | "override" | "session";
  signals: {
    memory: number | null;
    cores: number | null;
    effectiveType: string;
    saveData: boolean;
    androidMajor: number | null;
    webView: boolean;
    pixelLoad: number;
  };
};

const STORAGE_KEY = "antony-performance-tier-v2";
const tierRank: Record<PerformanceTier, number> = {
  high: 0,
  balanced: 1,
  low: 2,
  legacy: 3,
};

const isTier = (value: string | null): value is PerformanceTier => (
  value === "high" || value === "balanced" || value === "low" || value === "legacy"
);

const worseTier = (first: PerformanceTier, second: PerformanceTier) => (
  tierRank[first] >= tierRank[second] ? first : second
);

const readSessionTier = (): PerformanceTier | null => {
  try {
    const value = sessionStorage.getItem(STORAGE_KEY);
    return isTier(value) ? value : null;
  } catch {
    return null;
  }
};

const storeSessionTier = (tier: PerformanceTier) => {
  try {
    sessionStorage.setItem(STORAGE_KEY, tier);
  } catch {
    // Storage can be unavailable in hardened or private browser contexts.
  }
};

const readOverride = (): PerformanceTier | "auto" | null => {
  const value = new URLSearchParams(location.search).get("motion");
  if (value === "full") return "high";
  if (value === "auto") {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage can be unavailable in hardened or private browser contexts.
    }
    return "auto";
  }
  return isTier(value) ? value : null;
};

const androidVersion = (userAgent: string) => {
  const match = userAgent.match(/Android\s+(\d+)/i);
  return match ? Number(match[1]) : null;
};

export function detectPerformanceProfile(mobileViewport: boolean): PerformanceProfile {
  const hints = navigator as NavigatorHints;
  const memory = typeof hints.deviceMemory === "number" ? hints.deviceMemory : null;
  const cores = typeof hints.hardwareConcurrency === "number" ? hints.hardwareConcurrency : null;
  const effectiveType = hints.connection?.effectiveType ?? "unknown";
  const saveData = hints.connection?.saveData === true;
  const androidMajor = androidVersion(hints.userAgent);
  const webView = /\bwv\b|; wv\)|Version\/[\d.]+\s+Chrome\/[\d.]+\s+Mobile/i.test(hints.userAgent);
  const pixelLoad = Math.round(innerWidth * innerHeight * Math.pow(devicePixelRatio || 1, 2));
  const override = readOverride();
  const storedTier = override === "auto" ? null : readSessionTier();

  if (override && override !== "auto") {
    return {
      tier: override,
      locked: true,
      source: "override",
      signals: { memory, cores, effectiveType, saveData, androidMajor, webView, pixelLoad },
    };
  }

  let score = 0;
  if (memory !== null) {
    if (memory <= 1) score += 6;
    else if (memory <= 2) score += 4;
    else if (memory <= 4 && mobileViewport) score += 1;
  }
  if (cores !== null) {
    if (cores <= 2) score += 5;
    else if (cores <= 4) score += 1;
  }
  if (saveData) score += 3;
  if (effectiveType === "slow-2g") score += 6;
  else if (effectiveType === "2g") score += 4;
  else if (effectiveType === "3g") score += 2;
  if (androidMajor !== null) {
    if (androidMajor <= 7) score += 5;
    else if (androidMajor <= 9) score += 3;
    else if (androidMajor <= 11) score += 1;
  }
  if (webView) score += 2;
  if (pixelLoad > 4_500_000 && (memory === null || memory <= 4)) score += 2;
  if (typeof CSS === "undefined" || !CSS.supports("content-visibility", "auto")) score += 1;

  const detectedTier: PerformanceTier = score >= 9
    ? "legacy"
    : score >= 5
      ? "low"
      : score >= 2
        ? "balanced"
        : "high";
  const tier = storedTier ? worseTier(detectedTier, storedTier) : detectedTier;

  return {
    tier,
    locked: false,
    source: storedTier && tier === storedTier ? "session" : "auto",
    signals: { memory, cores, effectiveType, saveData, androidMajor, webView, pixelLoad },
  };
}

type MonitorOptions = {
  initialTier: PerformanceTier;
  onTierChange: (tier: PerformanceTier, reason: "startup" | "scroll") => void;
};

export function startAdaptivePerformanceMonitor({ initialTier, onTierChange }: MonitorOptions) {
  let currentTier = initialTier;
  let startupTimer = 0;
  let scrollProbeTimer = 0;
  let activeFrame = 0;
  let scrollProbeStarted = false;
  let disposed = false;

  const applyTier = (candidate: PerformanceTier, reason: "startup" | "scroll") => {
    const nextTier = worseTier(currentTier, candidate);
    if (nextTier === currentTier) return;
    currentTier = nextTier;
    storeSessionTier(nextTier);
    onTierChange(nextTier, reason);
  };

  const runProbe = (reason: "startup" | "scroll", duration: number) => {
    if (disposed || activeFrame) return;
    const frames: number[] = [];
    let started = 0;
    let previous = 0;
    const sample = (now: number) => {
      if (!started) started = now;
      if (previous) {
        const frameTime = now - previous;
        if (frameTime >= 8 && frameTime < 250) frames.push(frameTime);
      }
      previous = now;
      if (now - started < duration) {
        activeFrame = requestAnimationFrame(sample);
        return;
      }
      activeFrame = 0;
      if (frames.length < 24) return;
      const sorted = [...frames].sort((a, b) => a - b);
      const p90 = sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.9))];
      const slowShare = frames.filter((value) => value > 50).length / frames.length;
      const measuredTier: PerformanceTier = p90 > 64 || slowShare > 0.24
        ? "legacy"
        : p90 > 42 || slowShare > 0.1
          ? "low"
          : p90 > 25
            ? "balanced"
            : "high";
      applyTier(measuredTier, reason);
    };
    activeFrame = requestAnimationFrame(sample);
  };

  const onFirstScroll = () => {
    if (scrollProbeStarted) return;
    scrollProbeStarted = true;
    scrollProbeTimer = window.setTimeout(
      () => runProbe("scroll", 1500),
      activeFrame ? 1900 : 0,
    );
  };

  startupTimer = window.setTimeout(() => runProbe("startup", 1800), 280);
  window.addEventListener("scroll", onFirstScroll, { passive: true });

  return () => {
    disposed = true;
    window.clearTimeout(startupTimer);
    window.clearTimeout(scrollProbeTimer);
    if (activeFrame) cancelAnimationFrame(activeFrame);
    window.removeEventListener("scroll", onFirstScroll);
  };
}
