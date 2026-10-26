import { ALBUMS } from "./albums.js";

export function initSearch() {
  const grid = document.getElementById("grid");
  if (!grid) return;

  const search = document.getElementById("search");
  const filtersBox = document.getElementById("filters");
  const byId = {};

  ALBUMS.forEach((a) => (byId[a.id] = a));

  const cards = Array.prototype.slice.call(grid.querySelectorAll(".album"));
  const tags = Array.from(new Set(ALBUMS.map((a) => a.tag)));

  let activeTag = "";

  function match(a, q) {
    if (activeTag && a.tag !== activeTag) return false;
    if (!q) return true;

    return (
      a.title +
      " " +
      a.tag +
      " " +
      a.desc +
      " " +
      a.yr +
      " " +
      a.tracks.join(" ")
    )
      .toLowerCase()
      .indexOf(q) > -1;
  }

  function apply() {
    const q = (search ? search.value : "").trim().toLowerCase();
    let shown = 0;

    cards.forEach((c) => {
      const a = byId[c.dataset.id];
      const ok = match(a, q);

      c.style.display = ok ? "" : "none";
      if (ok) shown++;
    });

    const empty = document.getElementById("noRes");
    if (empty) empty.hidden = shown > 0;
  }

  if (filtersBox) {
    filtersBox.innerHTML = tags
      .map((t) => `<button class="chip" data-tag="${t}">${t}</button>`)
      .join("");

    filtersBox.addEventListener("click", (e) => {
      const b = e.target.closest(".chip");
      if (!b) return;

      const t = b.dataset.tag;
      activeTag = activeTag === t ? "" : t;

      filtersBox.querySelectorAll(".chip").forEach((c) => {
        c.classList.toggle("is-on", c.dataset.tag === activeTag);
      });

      apply();
    });
  }

  if (search) {
    search.addEventListener("input", apply);
  }

  const clear = document.getElementById("clearBtn");
  if (clear) {
    clear.addEventListener("click", () => {
      if (search) search.value = "";

      activeTag = "";

      if (filtersBox) {
        filtersBox
          .querySelectorAll(".chip")
          .forEach((c) => c.classList.remove("is-on"));
      }

      apply();
    });
  }
}