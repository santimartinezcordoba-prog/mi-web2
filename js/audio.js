import { AUDIO_DIR, AUDIO_EXTS } from "./config.js";
import { fmt, stripExt } from "./utils.js";

let dj;
let playBtn;
let nowTitle;
let nowProg;
let nowBar;
let nowTime;
let muteBtn;
let vol;

let progTimer = null;
let audioList = [];
let audioIdx = 0;
let lastVol = 1;

export function setPlayIcon(playing) {
  if (playBtn) playBtn.classList.toggle("is-playing", !!playing);

  const now = document.getElementById("now");
  if (now) now.classList.toggle("is-paused", !playing);
}

export function updateMuteIcon() {
  if (muteBtn) {
    muteBtn.classList.toggle("is-muted", !!dj && (dj.muted || dj.volume === 0));
  }
}

export function audioMsg(msg) {
  if (nowTitle) nowTitle.textContent = msg;
  if (nowBar) nowBar.style.width = "0%";
  if (nowTime) nowTime.textContent = "--:-- / --:--";

  setPlayIcon(false);
  clearInterval(progTimer);
}

function audioCandidates(al) {
  const base = al.track ? stripExt(al.track) : "";
  const list = [];

  if (al.track) {
    list.push(AUDIO_DIR + encodeURIComponent(al.track));
  }

  for (const ext of AUDIO_EXTS) {
    list.push(AUDIO_DIR + encodeURIComponent(base + ext));
  }

  return list;
}

function loadAudioSrc() {
  if (!dj) return;

  if (audioIdx < audioList.length) {
    dj.src = audioList[audioIdx];
  } else {
    audioMsg("⚠ Pista no encontrada en audio/");
  }
}

export function setNow(name, hasTrack) {
  if (nowTitle) nowTitle.textContent = name;
  if (nowBar) nowBar.style.width = "0%";
  if (nowTime) nowTime.textContent = "--:-- / --:--";

  clearInterval(progTimer);

  if (hasTrack && dj) {
    progTimer = setInterval(() => {
      if (dj.duration) {
        if (nowBar) {
          nowBar.style.width = (dj.currentTime / dj.duration * 100) + "%";
        }

        if (nowTime) {
          nowTime.textContent = fmt(dj.currentTime) + " / " + fmt(dj.duration);
        }
      }
    }, 200);
  }
}

export function playTrack(al) {
  if (!dj) {
    audioMsg('⚠ Falta <audio id="dj"> en index.html');
    return;
  }

  if (!al.track) {
    stopTrack();
    return;
  }

  audioList = audioCandidates(al);
  audioIdx = 0;
  loadAudioSrc();

  dj.currentTime = 0;
  dj.play().catch(() => {});
}

export function stopTrack() {
  if (!dj) return;

  dj.pause();
  dj.currentTime = 0;
  clearInterval(progTimer);
}

export function togglePlay() {
  if (!dj || !dj.src) return;

  if (dj.paused) {
    dj.play().catch(() => {});
  } else {
    dj.pause();
  }
}

function seekFromEvent(e) {
  if (!dj || !dj.duration || !nowProg) return;

  const r = nowProg.getBoundingClientRect();
  let x = (e.clientX - r.left) / r.width;
  x = Math.min(1, Math.max(0, x));

  dj.currentTime = x * dj.duration;

  if (nowBar) {
    nowBar.style.width = (x * 100) + "%";
  }

  if (nowTime) {
    nowTime.textContent = fmt(dj.currentTime) + " / " + fmt(dj.duration);
  }
}

export function initAudio() {
  dj = document.getElementById("dj");
  playBtn = document.getElementById("playBtn");
  nowTitle = document.getElementById("nowTitle");
  nowProg = document.getElementById("nowProg");
  nowBar = document.getElementById("nowBar");
  nowTime = document.getElementById("nowTime");
  muteBtn = document.getElementById("muteBtn");
  vol = document.getElementById("vol");

  if (dj) {
    dj.volume = 1;

    dj.addEventListener("loadedmetadata", () => {
      if (nowTitle && nowTitle.textContent.startsWith("⚠")) {
        const cur = document.getElementById("mTitle");
        if (cur && cur.textContent) {
          nowTitle.textContent = cur.textContent;
        }
      }
    });

    dj.addEventListener("play", () => setPlayIcon(true));
    dj.addEventListener("pause", () => setPlayIcon(false));

    dj.addEventListener("ended", () => {
      setPlayIcon(false);
      clearInterval(progTimer);

      if (nowBar) nowBar.style.width = "100%";
      if (nowTime) {
        nowTime.textContent = fmt(dj.duration) + " / " + fmt(dj.duration);
      }
    });

    dj.addEventListener("error", () => {
      audioIdx++;

      if (audioIdx < audioList.length) {
        loadAudioSrc();
        dj.play().catch(() => {});
      } else {
        console.log("❌ No encontré la pista. Probé:", audioList);
        audioMsg("⚠ Pista no encontrada en audio/");
      }
    });
  }

  if (playBtn) {
    playBtn.addEventListener("click", togglePlay);
  }

  if (nowProg) {
    nowProg.addEventListener("pointerdown", (e) => {
      if (!dj || !dj.duration) return;

      nowProg.setPointerCapture(e.pointerId);
      nowProg._drag = true;
      seekFromEvent(e);
    });

    nowProg.addEventListener("pointermove", (e) => {
      if (nowProg._drag) {
        seekFromEvent(e);
      }
    });

    const endDrag = () => {
      nowProg._drag = false;
    };

    nowProg.addEventListener("pointerup", endDrag);
    nowProg.addEventListener("pointercancel", endDrag);
  }

  if (vol) {
    vol.value = dj ? dj.volume : 1;

    vol.addEventListener("input", () => {
      if (!dj) return;

      const v = parseFloat(vol.value);
      dj.volume = v;
      dj.muted = false;

      if (v > 0) lastVol = v;

      updateMuteIcon();
    });
  }

  if (muteBtn) {
    muteBtn.addEventListener("click", () => {
      if (!dj) return;

      dj.muted = !dj.muted;

      if (!dj.muted && dj.volume === 0) {
        dj.volume = lastVol || 0.6;
        if (vol) vol.value = dj.volume;
      }

      updateMuteIcon();
    });
  }
}