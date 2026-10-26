export function initGate() {
  const g = document.getElementById("gate");
  if (!g) return;

  const go = document.getElementById("gateGo");
  if (!go) return;

  let dest = "";

  document.querySelectorAll("[data-gate]").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      dest = a.href;
      g.hidden = false;
    });
  });

  go.addEventListener("click", () => {
    if (dest) location.href = dest;
  });

  g.querySelectorAll("[data-close]").forEach((b) => {
    b.addEventListener("click", () => {
      g.hidden = true;
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !g.hidden) {
      g.hidden = true;
    }
  });
}