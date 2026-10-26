export function initWip() {
  const wip = document.getElementById("wip");
  if (!wip) return;

  let lastFocus = null;

  const open = (e) => {
    e.preventDefault();
    lastFocus = e.currentTarget;
    wip.hidden = false;

    const btn = wip.querySelector(".wip__btn");
    if (btn) btn.focus();
  };

  const close = () => {
    wip.hidden = true;
    if (lastFocus) lastFocus.focus();
  };

  document.querySelectorAll("[data-wip]").forEach((a) => {
    a.addEventListener("click", open);
  });

  wip.querySelectorAll("[data-close]").forEach((b) => {
    b.addEventListener("click", close);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !wip.hidden) close();
  });
}