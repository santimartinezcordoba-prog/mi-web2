import { initTheme } from "./theme.js";
import { setHeader } from "./utils.js";
import { initCoverHandlers, renderGrid } from "./albums.js";
import { initAudio, updateMuteIcon } from "./audio.js";
import { initModal, openModal } from "./modal.js";
import { initSearch } from "./search.js";
import { initContact } from "./contact.js";
import { initEgg } from "./egg.js";
import { initSnake } from "./snake.js";
import { initWip } from "./wip.js";
import { initGate } from "./gate.js";
import { initAI } from "./ai.js";
import { initWeather } from "./weather.js";

function init() {
  initTheme();
  setHeader();

  initCoverHandlers();
  initAudio();
  updateMuteIcon();

  initModal();
  renderGrid(openModal);

  initSearch();
  initContact();

  initEgg();
  initSnake();

  initWip();
  initGate();
  initAI();
  initWeather();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}