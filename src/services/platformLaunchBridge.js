const LEGACY_LAUNCH_KEY = "elboton_legacy_platform_launch";
const LEGACY_KINDS = new Set(["classic", "balloons", "notes", "dodge"]);

export function markLegacyPlatformLaunch(kind) {
  if (!LEGACY_KINDS.has(kind)) return;
  try {
    sessionStorage.setItem(LEGACY_LAUNCH_KEY, kind);
  } catch {
    // Best effort only. Gameplay should never depend on browser storage.
  }
}

export function installPlatformReturnBridge() {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const launchedFromPlatform = () => {
    try {
      return sessionStorage.getItem(LEGACY_LAUNCH_KEY);
    } catch {
      return null;
    }
  };

  const clearLaunch = () => {
    try {
      sessionStorage.removeItem(LEGACY_LAUNCH_KEY);
    } catch {}
  };

  const goBackToPlatform = () => {
    clearLaunch();
    window.location.reload();
  };

  const ensureBackButton = () => {
    const kind = launchedFromPlatform();
    if (!kind) return;
    if (document.getElementById("elboton-platform-return")) return;

    const button = document.createElement("button");
    button.id = "elboton-platform-return";
    button.type = "button";
    button.textContent = "← Juegos";
    button.setAttribute("aria-label", "Volver a juegos");
    Object.assign(button.style, {
      position: "fixed",
      top: "16px",
      right: "16px",
      zIndex: "2147483647",
      border: "1px solid rgba(255,255,255,.18)",
      borderRadius: "999px",
      padding: "10px 14px",
      color: "white",
      background: "rgba(0,0,0,.42)",
      backdropFilter: "blur(10px)",
      fontFamily: "Inter, system-ui, sans-serif",
      fontWeight: "900",
      cursor: "pointer",
      boxShadow: "0 10px 28px rgba(0,0,0,.25)",
    });
    button.addEventListener("click", goBackToPlatform);
    document.body.appendChild(button);
  };

  const oldMenuVisible = () => {
    const kind = launchedFromPlatform();
    if (!kind || kind === "classic") return false;
    const text = document.body?.innerText || "";
    return text.includes("Elige tu juego") || text.includes("Choose your game") || text.includes("Categorías para todos") || text.includes("Categories for everyone");
  };

  const check = () => {
    if (!launchedFromPlatform()) return;
    ensureBackButton();
    if (oldMenuVisible()) goBackToPlatform();
  };

  window.addEventListener("pageshow", check);
  const observer = new MutationObserver(check);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(check, 250);
}
