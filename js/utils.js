import { BIRTH } from "./config.js";

export function fmt(s) {
  s = Math.max(0, Math.floor(s || 0));
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return m + ":" + String(ss).padStart(2, "0");
}

export function stripExt(s) {
  return String(s).replace(/\.[^/.]+$/, "");
}

export function songName(al) {
  if (al.song) return al.song;
  if (al.track) return stripExt(al.track).replace(/[-_]/g, " ");
  return al.title;
}

export function calcAge() {
  const n = new Date();
  let a = n.getFullYear() - BIRTH.year;
  const bd = new Date(n.getFullYear(), BIRTH.month - 1, BIRTH.day);
  if (n < bd) a--;
  return a;
}

export function setHeader() {
  const e = document.getElementById("age");
  if (e) e.textContent = calcAge();

  const b = document.getElementById("bday");
  if (b) b.textContent = String(BIRTH.day).padStart(2, "0") + " OCT";

  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
}