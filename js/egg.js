import { HEARD_KEY, UNLOCK_KEY } from "./config.js";
import { ALBUMS } from "./albums.js";

let eggEl = null;
let toastEl = null;

export function getHeard() {
  try {
    return new Set(JSON.parse(localStorage.getItem(HEARD_KEY) || "[]"));
  } catch (e) {
    return new Set();
  }
}

export function saveHeard(s) {
  try {
    localStorage.setItem(HEARD_KEY, JSON.stringify([...s]));
  } catch (e) {}
}

export function isUnlocked() {
  return getHeard().size >= ALBUMS.length;
}

export function showToast(html) {
  if (!toastEl) return;

  toastEl.innerHTML = html;
  toastEl.hidden = false;

  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => {
    toastEl.hidden = true;
  }, 4500);
}

export function paintProgress() {
  if (!eggEl) return;

  const n = getHeard().size;
  const t = ALBUMS.length;

  if (n === 0) {
    eggEl.hidden = true;
    return;
  }

  eggEl.hidden = false;

  eggEl.innerHTML = isUnlocked()
    ? `★ Sesión completa <b>${t}/${t}</b> · pulsa el logo o el mando`
    : `★ Álbumes escuchados <b>${n}/${t}</b>`;
}

export function markHeard(id) {
  const s = getHeard();

  if (s.has(id)) {
    paintProgress();
    return;
  }

  s.add(id);
  saveHeard(s);

  if (s.size === ALBUMS.length && !document.body.classList.contains("has-snake")) {
    try {
      localStorage.setItem(UNLOCK_KEY, "1");
    } catch (e) {}

    document.body.classList.add("has-snake");
    paintProgress();
    showToast(`★ <b>EASTER EGG desbloqueado</b> · pulsa el logo`);
  } else {
    paintProgress();
  }
}

export function initEgg() {
  eggEl = document.getElementById("egg");
  toastEl = document.getElementById("toast");

  if (isUnlocked()) {
    document.body.classList.add("has-snake");
  }

  paintProgress();
}