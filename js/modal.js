import { findAlbum, coverHTML } from "./albums.js";
import { songName } from "./utils.js";
import { setNow, playTrack } from "./audio.js";
import { markHeard } from "./egg.js";

let modal = null;

export function openModal(id) {
  if (!modal) modal = document.getElementById("modal");

  const al = findAlbum(id);
  if (!al) return;

  const mCover = document.getElementById("mCover");
  if (mCover) {
    mCover.outerHTML = coverHTML(al, true).replace(
      'class="modal__cover"',
      'class="modal__cover" id="mCover"'
    );
  }

  const setTxt = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  setTxt("mFmt", al.fmt + " · " + al.tag);
  setTxt("mTitle", al.title);
  setTxt("mMeta", al.yr);
  setTxt("mDesc", al.desc);

  const mTracks = document.getElementById("mTracks");
  if (mTracks) {
    mTracks.innerHTML = al.tracks.map((t, i) => {
      return `<li>${String(i + 1).padStart(2, "0")}. ${t} <span>${(2 + i % 3)}:${(10 + i * 7) % 60}</span></li>`;
    }).join("");
  }

  if (modal) {
    modal.hidden = false;
  }

  document.body.style.overflow = "hidden";

  setNow(songName(al), !!al.track);
  playTrack(al);
  markHeard(al.id);
}

export function closeModal() {
  if (!modal) modal = document.getElementById("modal");
  if (!modal) return;

  modal.hidden = true;
  document.body.style.overflow = "";
}

export function initModal() {
  modal = document.getElementById("modal");
  if (!modal) return;

  modal.addEventListener("click", (e) => {
    if (e.target.hasAttribute("data-close")) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) {
      closeModal();
    }
  });
}