import { THEME_KEY } from "./config.js";

export function applyTheme(t) {
  document.documentElement.dataset.theme = t;

  document.querySelectorAll(".theme").forEach((b) => {
    b.classList.toggle("is-on", b.dataset.set === t);
  });

  try {
    localStorage.setItem(THEME_KEY, t);
  } catch (e) {}
}

export function initTheme() {
  let saved = "vinilo";

  try {
    saved = localStorage.getItem(THEME_KEY) || "vinilo";
  } catch (e) {}

  applyTheme(saved);

  document.querySelectorAll(".theme").forEach((b) => {
    b.addEventListener("click", () => applyTheme(b.dataset.set));
  });
}