import { BEST_KEY } from "./config.js";
import { isUnlocked, paintProgress } from "./egg.js";

let actx = null;
const SCALE = [261.63, 293.66, 329.63, 392, 440, 523.25, 587.33, 659.25, 783.99];

const GRID = 21;
let cell = 20;
let snakeArr = [];
let dir = { x: 1, y: 0 };
let nextDir = { x: 1, y: 0 };
let food = null;
let score = 0;
let speed = 130;
let alive = false;
let paused = false;
let lastStep = 0;
let rafId = 0;

let snake, canvas, ctx, snakeScoreEl, snakeBestEl, snakeOver, snakeOverMsg, snakePause;

function cssVar(n) {
  return getComputedStyle(document.documentElement).getPropertyValue(n).trim() || "#888";
}

function hexToRgb(h) {
  h = h.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mix(a, b, t) {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  return `rgb(${Math.round(A[0] + (B[0] - A[0]) * t)},${Math.round(A[1] + (B[1] - A[1]) * t)},${Math.round(A[2] + (B[2] - A[2]) * t)})`;
}

function beep(freq, dur = 0.08, type = "square", gain = 0.06) {
  try {
    if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
    const o = actx.createOscillator();
    const g = actx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = gain;
    o.connect(g);
    g.connect(actx.destination);
    const t = actx.currentTime;
    o.start(t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.stop(t + dur + 0.02);
  } catch (e) {}
}

function sizeCanvas() {
  if (!canvas || !ctx) return;
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const px = Math.max(280, Math.min(rect.width || 440, 520));
  canvas.width = px * dpr;
  canvas.height = px * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  cell = px / GRID;
}

function placeFood() {
  let f;
  do {
    f = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
  } while (snakeArr.some((s) => s.x === f.x && s.y === f.y));
  food = f;
}

function resetSnake() {
  snakeArr = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ];
  dir = { x: 1, y: 0 };
  nextDir = { x: 1, y: 0 };
  score = 0;
  speed = 130;
  paused = false;
  alive = true;
  if (snakeScoreEl) snakeScoreEl.textContent = "0";
  if (snakeOver) {
    snakeOver.hidden = true;
    snakeOver.style.removeProperty("display");
  }
  if (snakePause) {
    snakePause.hidden = true;
    snakePause.style.removeProperty("display");
  }
  placeFood();
}

function setDir(d) {
  const m = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
  };
  const nd = m[d];
  if (!nd) return;
  if (nd.x === -dir.x && nd.y === -dir.y) return;
  nextDir = nd;
}

function step() {
  dir = nextDir;
  const h = { x: snakeArr[0].x + dir.x, y: snakeArr[0].y + dir.y };
  if (h.x < 0 || h.y < 0 || h.x >= GRID || h.y >= GRID) return gameOver();
  if (snakeArr.some((s) => s.x === h.x && s.y === h.y)) return gameOver();
  snakeArr.unshift(h);
  if (h.x === food.x && h.y === food.y) {
    score++;
    if (snakeScoreEl) snakeScoreEl.textContent = score;
    speed = Math.max(70, speed - 3);
    beep(SCALE[Math.min(SCALE.length - 1, 2 + (score % 7))], 0.09, "square", 0.07);
    placeFood();
  } else snakeArr.pop();
}

function drawVinyl(cx, cy, r) {
  if (!ctx) return;
  const dark = cssVar("--chip-bg");
  const ring = cssVar("--line");
  const c3 = cssVar("--c3");
  ctx.fillStyle = dark;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, 7);
  ctx.fill();
  ctx.strokeStyle = ring;
  ctx.lineWidth = 1;
  for (let rr = r * 0.45; rr < r; rr += r * 0.18) {
    ctx.beginPath();
    ctx.arc(cx, cy, rr, 0, 7);
    ctx.stroke();
  }
  ctx.fillStyle = c3;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.28, 0, 7);
  ctx.fill();
}

function roundRect(x, y, w, h, r) {
  if (!ctx) return;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function render() {
  if (!ctx) return;
  const W = GRID * cell;
  const bg2 = cssVar("--bg2");
  const line = cssVar("--line");
  const c1 = cssVar("--c1");
  const c3 = cssVar("--c3");
  ctx.fillStyle = bg2;
  ctx.fillRect(0, 0, W, W);
  ctx.strokeStyle = line;
  ctx.globalAlpha = 0.25;
  ctx.lineWidth = 1;
  const cx = W / 2;
  const cy = W / 2;
  for (let r = cell; r < W * 0.72; r += cell * 1.4) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 7);
    ctx.stroke();
  }
  ctx.globalAlpha = 0.12;
  ctx.beginPath();
  ctx.moveTo(0, cy);
  ctx.lineTo(W, cy);
  ctx.moveTo(cx, 0);
  ctx.lineTo(cx, W);
  ctx.stroke();
  ctx.globalAlpha = 1;
  if (food) {
    const fx = food.x * cell + cell / 2;
    const fy = food.y * cell + cell / 2;
    drawVinyl(fx, fy, cell * 0.42);
    ctx.strokeStyle = c3;
    ctx.globalAlpha = 0.5 + 0.5 * Math.sin(Date.now() / 200);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(fx, fy, cell * 0.55, 0, 7);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  const n = snakeArr.length;
  for (let i = n - 1; i >= 0; i--) {
    const s = snakeArr[i];
    const t = i / Math.max(1, n - 1);
    ctx.fillStyle = i === 0 ? c1 : mix(c1, c3, t);
    const pad = cell * 0.12;
    const x = s.x * cell + pad;
    const y = s.y * cell + pad;
    const sz = cell - pad * 2;
    roundRect(x, y, sz, sz, i === 0 ? sz * 0.45 : sz * 0.3);
    ctx.fill();
  }
  const h = snakeArr[0];
  ctx.fillStyle = "#fff";
  const ex = h.x * cell + cell / 2 + dir.x * cell * 0.18 - cell * 0.06;
  const ey = h.y * cell + cell / 2 + dir.y * cell * 0.18 - cell * 0.06;
  ctx.fillRect(ex, ey, cell * 0.12, cell * 0.12);
}

function gameOver() {
  if (!alive) return;
  alive = false;
  if (snakePause) snakePause.hidden = true;
  if (snakeOver) {
    snakeOver.hidden = false;
    snakeOver.style.removeProperty("display");
  }
  let b = 0;
  try {
    b = parseInt(localStorage.getItem(BEST_KEY) || "0", 10) || 0;
  } catch (e) {}
  if (score > b) {
    b = score;
    try {
      localStorage.setItem(BEST_KEY, String(b));
    } catch (e) {}
  }
  if (snakeBestEl) snakeBestEl.textContent = b;
  if (snakeOverMsg) snakeOverMsg.textContent = "Has sumado " + score + " pistas · Récord " + b;
}

function loop(ts) {
  rafId = requestAnimationFrame(loop);
  if (!alive || paused) {
    render();
    return;
  }
  if (ts - lastStep >= speed) {
    lastStep = ts;
    step();
  }
  render();
}

function openSnake() {
  if (!isUnlocked()) return;
  if (!snake) return;
  snake.hidden = false;
  document.body.style.overflow = "hidden";
  if (snakeBestEl) {
    try {
      snakeBestEl.textContent = localStorage.getItem(BEST_KEY) || "0";
    } catch (e) {}
  }
  sizeCanvas();
  resetSnake();
  cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(loop);
  if (actx && actx.state === "suspended") actx.resume();
}

function closeSnake() {
  if (!snake) return;
  snake.hidden = true;
  document.body.style.overflow = "";
  cancelAnimationFrame(rafId);
  alive = false;
}

export function initSnake() {
  snake = document.getElementById("snake");
  canvas = document.getElementById("snakeCanvas");
  ctx = canvas ? canvas.getContext("2d") : null;
  snakeScoreEl = document.getElementById("snakeScore");
  snakeBestEl = document.getElementById("snakeBest");
  snakeOver = document.getElementById("snakeOver");
  snakeOverMsg = document.getElementById("snakeOverMsg");
  snakePause = document.getElementById("snakePause");

  document.addEventListener("keydown", (e) => {
    if (!snake || snake.hidden) {
      return;
    }
    const k = e.key.toLowerCase();
    if (k === "arrowup" || k === "w") setDir("up");
    else if (k === "arrowdown" || k === "s") setDir("down");
    else if (k === "arrowleft" || k === "a") setDir("left");
    else if (k === "arrowright" || k === "d") setDir("right");
    else if (k === " ") {
      e.preventDefault();
      paused = !paused;
      if (snakePause) snakePause.hidden = !paused;
    } else if (k === "escape") closeSnake();
  });

  if (!snake) return;

  snake.querySelectorAll("[data-dir]").forEach((b) => b.addEventListener("click", () => setDir(b.dataset.dir)));
  snake.addEventListener("click", (e) => {
    if (e.target.hasAttribute("data-close")) closeSnake();
  });

  const retry = document.getElementById("snakeRetry");
  if (retry) retry.addEventListener("click", () => resetSnake());

  if (canvas) {
    let sx = 0,
      sy = 0;
    canvas.addEventListener("pointerdown", (e) => {
      sx = e.clientX;
      sy = e.clientY;
    });
    canvas.addEventListener("pointerup", (e) => {
      const dx = e.clientX - sx;
      const dy = e.clientY - sy;
      if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
      if (Math.abs(dx) > Math.abs(dy)) setDir(dx > 0 ? "right" : "left");
      else setDir(dy > 0 ? "down" : "up");
    });
  }

  const easterBtn = document.getElementById("easterBtn");
  const wordmark = document.getElementById("wordmark");

  if (easterBtn) easterBtn.addEventListener("click", openSnake);
  if (wordmark)
    wordmark.addEventListener("click", () => {
      if (isUnlocked()) openSnake();
    });

  if (isUnlocked()) document.body.classList.add("has-snake");
  paintProgress();
}