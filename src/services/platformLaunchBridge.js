const KEY = "elboton_legacy_platform_launch";
const LEGACY = new Set(["classic", "balloons", "notes", "dodge"]);

export function markLegacyPlatformLaunch(kind) {
  if (!LEGACY.has(kind)) return;
  try { sessionStorage.setItem(KEY, kind); } catch {}
}

export function installPlatformReturnBridge() {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const currentKind = () => {
    try { return sessionStorage.getItem(KEY); } catch { return null; }
  };

  const clearAndReload = () => {
    try { sessionStorage.removeItem(KEY); } catch {}
    window.location.reload();
  };

  const addBackButton = () => {
    if (!currentKind()) return;
    if (document.getElementById("elboton-platform-return")) return;
    const button = document.createElement("button");
    button.id = "elboton-platform-return";
    button.type = "button";
    button.textContent = "← Juegos";
    button.setAttribute("aria-label", "Volver a juegos");
    button.style.cssText = "position:fixed;top:16px;right:16px;z-index:2147483647;border:1px solid rgba(255,255,255,.18);border-radius:999px;padding:10px 14px;color:white;background:rgba(0,0,0,.42);backdrop-filter:blur(10px);font-family:Inter,system-ui,sans-serif;font-weight:900;cursor:pointer;box-shadow:0 10px 28px rgba(0,0,0,.25);";
    button.addEventListener("click", clearAndReload);
    document.body.appendChild(button);
  };

  const isOldMenuVisible = () => {
    const kind = currentKind();
    if (!kind || kind === "classic") return false;
    const text = document.body?.innerText || "";
    return text.includes("Elige tu juego") || text.includes("Choose your game");
  };

  const check = () => {
    if (!currentKind()) return;
    addBackButton();
    if (isOldMenuVisible()) clearAndReload();
  };

  window.addEventListener("pageshow", check);
  window.setInterval(check, 600);
  setTimeout(check, 200);
}
