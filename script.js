/* ===== DATOS ===== */
const BIRTH = { year: 2008, month: 10, day: 11 };
const MAIL = "santimartinezcordoba@gmail.com";
const COVER_DIR = "covers/";
const TRY_EXTS = [".jpep", ".jpeg", ".jpg", ".png", ".webp"];
const AUDIO_DIR = "audio/";
const AUDIO_EXTS = [".mp3", ".ogg", ".m4a", ".webm", ".wav"];

const dj = document.getElementById("dj");
const playBtn = document.getElementById("playBtn");
const nowTitle = document.getElementById("nowTitle");
const nowProg = document.getElementById("nowProg");
const nowBar = document.getElementById("nowBar");
const nowTime = document.getElementById("nowTime");
const muteBtn = document.getElementById("muteBtn");
const vol = document.getElementById("vol");
let progTimer = null;
let audioList = [], audioIdx = 0;
let lastVol = 1;

function fmt(s){
  s = Math.max(0, Math.floor(s || 0));
  const m = Math.floor(s/60), ss = s%60;
  return m + ":" + String(ss).padStart(2,"0");
}
function setPlayIcon(playing){
  if (playBtn) playBtn.classList.toggle("is-playing", !!playing);
  const now = document.getElementById("now");
  if (now) now.classList.toggle("is-paused", !playing);
}
function updateMuteIcon(){ if (muteBtn) muteBtn.classList.toggle("is-muted", !!dj && (dj.muted || dj.volume === 0)); }
function audioMsg(msg){
  if (nowTitle) nowTitle.textContent = msg;
  if (nowBar) nowBar.style.width = "0%";
  if (nowTime) nowTime.textContent = "--:-- / --:--";
  setPlayIcon(false);
  clearInterval(progTimer);
}

function stripExt(s){ return s.replace(/\.[^/.]+$/,""); }
function songName(al){
  if (al.song) return al.song;
  if (al.track) return stripExt(al.track).replace(/[-_]/g," ");
  return al.title;
}
function audioCandidates(al){
  const base = al.track ? stripExt(al.track) : "";
  const list = [];
  if (al.track) list.push(AUDIO_DIR + encodeURIComponent(al.track));
  for (const e of AUDIO_EXTS) list.push(AUDIO_DIR + encodeURIComponent(base + e));
  return list;
}
function loadAudioSrc(){
  if (audioIdx < audioList.length) dj.src = audioList[audioIdx];
  else audioMsg("⚠ Pista no encontrada en audio/");
}

if (dj) {
  dj.volume = 1;
  dj.addEventListener("loadedmetadata", () => {
    if (nowTitle && nowTitle.textContent.startsWith("⚠")) {
      const cur = document.getElementById("mTitle");
      if (cur && cur.textContent) nowTitle.textContent = cur.textContent;
    }
  });
  dj.addEventListener("play",  () => setPlayIcon(true));
  dj.addEventListener("pause", () => setPlayIcon(false));
  dj.addEventListener("ended", () => {
    setPlayIcon(false);
    clearInterval(progTimer);
    if (nowBar) nowBar.style.width = "100%";
    if (nowTime) nowTime.textContent = fmt(dj.duration) + " / " + fmt(dj.duration);
  });
  dj.addEventListener("error", () => {
    audioIdx++;
    if (audioIdx < audioList.length) { loadAudioSrc(); dj.play().catch(()=>{}); }
    else { console.log("❌ No encontré la pista. Probé:", audioList); audioMsg("⚠ Pista no encontrada en audio/"); }
  });
}

function playTrack(al){
  if (!dj) { audioMsg('⚠ Falta <audio id="dj"> en index.html'); return; }
  if (!al.track) { stopTrack(); return; }
  audioList = audioCandidates(al);
  audioIdx = 0;
  loadAudioSrc();
  dj.currentTime = 0;
  dj.play().catch(()=>{});
}
function stopTrack(){
  if (!dj) return;
  dj.pause();
  dj.currentTime = 0;
  clearInterval(progTimer);
}
function togglePlay(){
  if (!dj || !dj.src) return;
  if (dj.paused) dj.play().catch(()=>{}); else dj.pause();
}
if (playBtn) playBtn.addEventListener("click", togglePlay);

function seekFromEvent(e){
  if (!dj || !dj.duration) return;
  const r = nowProg.getBoundingClientRect();
  let x = (e.clientX - r.left) / r.width;
  x = Math.min(1, Math.max(0, x));
  dj.currentTime = x * dj.duration;
  if (nowBar) nowBar.style.width = (x*100) + "%";
  if (nowTime) nowTime.textContent = fmt(dj.currentTime) + " / " + fmt(dj.duration);
}
if (nowProg) {
  nowProg.addEventListener("pointerdown", e => {
    if (!dj || !dj.duration) return;
    nowProg.setPointerCapture(e.pointerId);
    nowProg._drag = true; seekFromEvent(e);
  });
  nowProg.addEventListener("pointermove", e => { if (nowProg._drag) seekFromEvent(e); });
  const endDrag = () => { nowProg._drag = false; };
  nowProg.addEventListener("pointerup", endDrag);
  nowProg.addEventListener("pointercancel", endDrag);
}

if (vol) {
  vol.value = dj ? dj.volume : 1;
  vol.addEventListener("input", () => {
    if (!dj) return;
    const v = parseFloat(vol.value);
    dj.volume = v; dj.muted = false;
    if (v > 0) lastVol = v;
    updateMuteIcon();
  });
}
if (muteBtn) {
  muteBtn.addEventListener("click", () => {
    if (!dj) return;
    dj.muted = !dj.muted;
    if (!dj.muted && dj.volume === 0) { dj.volume = lastVol || 0.6; if (vol) vol.value = dj.volume; }
    updateMuteIcon();
  });
}

const ALBUMS = [
  { id:"compile", title:"THE COMPILE", fmt:"LP", yr:"2008–hoy", tag:"ECOPILATORIO",
    cover:"la espalda del sol", track:"nuevo-duelo.mp3", song:"Nuevo Duelo",
    c:["#ff2d2d","#ff7a00"],
    desc:"Mi primer disco: la recopilación de todo lo que he sido hasta ahora. Nací en 2008 y aquí están todas mis demos, directos y descartes.",
    tracks:["Nacimiento (Intro)","Primeros pasos","La banda","CrossFit en la sangre","Pizzería de verano","Praga, 2024","1º DAM","Outro: seguiré componiendo"] },

  { id:"banda", title:"BANDA SONORA", fmt:"LP", yr:"2021–hoy", tag:"MÚSICA",
    cover:"san francisco", track:"Jovenes-cristianos-de-Bolbaie", song:"Jovenes cristianos de Bolbaie",
    c:["#1f6feb","#00c2ff"],
    desc:"Años en la banda de música del pueblo. Ensayos, conciertos y el directo más largo que he hecho nunca.",
    tracks:["Pasodoble","Ensayo general","Concierto de Navidad","Atempo","Director invitado","Bis"] },

  { id:"batukada", title:"BATUKADA", fmt:"EP", yr:"2022–hoy", tag:"PERCUSIÓN",
     cover:"bitukada", track:"batukada.mp3", song:"Ritmo base",
    c:["#ff7a00","#ffd400"],
    desc:"El EP más ruidoso. Tambor, ritmo y calle. Donde aprendí que el tempo lo manda el grupo.",
    tracks:["Ritmo base","Llamada","Carnaval","Desfile","Silencio (Outro)"] },

  { id:"praga", title:"PRAGA", fmt:"SGL", yr:"2024", tag:"FIN DE CURSO",
    cover:"altibajos", track:"a-mi-lao.mp3", song:"A mi lao'",
    c:["#7c3aed","#ff2d2d"],
    desc:"Single de viaje de fin de curso. Puente Carlos, reloj astronómico y una foto que no voy a olvidar.",
    tracks:["Llegada","Puente Carlos","Reloj astronómico","Cerveza","Última noche"] },

  { id:"crossfit", title:"CROSSFIT SESSIONS", fmt:"SGL", yr:"2022", tag:"ENTRENAMIENTO",
     cover:"tres creus", track:"tabata.mp3", song:"rocky tabata",
    c:["#00ff66","#0b0b0d"],
    desc:"Sencillo de sudor. WOD, barras y la satisfacción de terminar lo que empiezas.",
    tracks:["Calentamiento","AMRAP","Metcon","PR","Estiramiento"] },

  { id:"pizza", title:"PIZZERIA TOPOGIGIO", fmt:"LP", yr:"3 veranos y sumando", tag:"HOSTELERÍA",
    cover:"mf doom", track:"tu-con-el.mp3", song:"Hora punta",
    c:["#d61f1f","#ffd400"],
    desc:"Tres veranos de camarero en la pizzería del pueblo. Propinas, pedidos y picos de trabajo.",
    tracks:["Apertura","Comida (hora punta)","Margherita x12","Limpieza","Cierre","Propinas"] },

  { id:"dam", title:"DAM (THE DEBUT)", fmt:"LP", yr:"curso actual", tag:"ESTUDIOS",
    track:"dam.mp3", song:"Hola Mundo",
    c:["#00c2ff","#1f6feb"],
    desc:"Mi álbum de estudio actual: 1º DAM en el IES Simarro. Código, exámenes y explorando salidas profesionales.",
    tracks:["Hola Mundo","Programación","Sistemas Informáticos","Lenguaje de Marcas","Entornos de Desarrollo","Proyecto final (en producción)"] },

  { id:"player", title:"PLAYER 1", fmt:"EP", yr:"siempre", tag:"VIDEOJUEGOS",
    track:"player.mp3", song:"Ruta 1",
    c:["#ff2d2d","#00ff66"],
    desc:"EP gamer. Pokémon es el hilo conductor: la Kanto infinita.",
    tracks:["¡Elige tu inicial!","Ruta 1","Gym de Brock","Mewtwo (Boss)","SALVANDO…"] },

  { id:"screen", title:"SCREEN TIME", fmt:"LP", yr:"varios", tag:"SERIES & CINE",
    track:"screen.mp3", song:"It's gonna be legendary",
    c:["#ffb000","#d61f1f"],
    desc:"Largo de pantallas. Cómo conocí a vuestra madre en serie, Baby Driver y Your Name en cine.",
    tracks:["It's gonna be legend…","Baby Driver ","Your Name (Kimi no Na wa)","Dandadan","la la land","Escena post cregitditos"] },

  { id:"chroma", title:"CHROMA", fmt:"SGL", yr:"estética", tag:"COLORES",
    track:"chroma.mp3", song:"Rojo",
    c:["#ff2d2d","#ffd400"],
    desc:"Sencillo visual: rojo, amarillo y naranja, y también el blanco y negro. Mi paleta de marca.",
    tracks:["Rojo","Naranja","Amarillo","Monocromo","Cyberpunk"] },
];

/* ===== EDAD + CUMPLE ===== */
function calcAge(){
  const n = new Date();
  let a = n.getFullYear() - BIRTH.year;
  const bd = new Date(n.getFullYear(), BIRTH.month - 1, BIRTH.day);
  if (n < bd) a--;
  return a;
}
function setHeader(){
  const e = document.getElementById("age"); if (e) e.textContent = calcAge();
  const b = document.getElementById("bday"); if (b) b.textContent = String(BIRTH.day).padStart(2,"0") + " OCT";
  const y = document.getElementById("year"); if (y) y.textContent = new Date().getFullYear();
}

/* ===== PORTADAS (auto-extensión) ===== */
function coverCandidates(al){
  const base = al.cover ? stripExt(al.cover) : al.id;
  const list = [];
  if (al.cover) list.push(COVER_DIR + encodeURIComponent(al.cover));
  for (const e of TRY_EXTS) list.push(COVER_DIR + encodeURIComponent(base + e));
  return list;
}
window.__tryNext = function(img){
  const arr = img.getAttribute("data-list").split("||");
  let i = parseInt(img.getAttribute("data-i") || "0", 10) + 1;
  if (i < arr.length){ img.setAttribute("data-i", i); img.src = arr[i]; }
  else { img.remove(); }
};
function coverHTML(al, big){
  const cls = big ? "modal__cover" : "cover";
  const arr = coverCandidates(al);
  const listAttr = arr.join("||");
  const init = al.title.replace(/[^A-ZÁÉÍÓÚ]/g,"").slice(0,1) || al.title[0];
  return `<div class="${cls}" style="--c1:${al.c[0]};--c2:${al.c[1]}">
      <span class="init">${init}</span>
      <img src="${arr[0]}" alt="Portada de ${al.title}" loading="lazy"
           data-i="0" data-list="${listAttr}"
           onload="this.parentElement.style.setProperty('--cover','url(&quot;'+this.src+'&quot;)');this.parentElement.classList.add('has-img')"
           onerror="__tryNext(this)">
      ${big ? "" : `<span class="badge">${al.fmt}</span><span class="disc" aria-hidden="true"></span>`}
    </div>`;
}
function renderGrid(){
  const g = document.getElementById("grid"); if(!g) return;
  g.innerHTML = ALBUMS.map(al => `
    <button class="album" data-id="${al.id}" aria-label="Abrir ${al.title}">
      ${coverHTML(al,false)}
      <span class="meta">
        <h3>${al.title}</h3>
        <span class="tag">${al.tag}</span>
        <span class="yr">${al.yr}</span>
      </span>
    </button>`).join("");
  g.querySelectorAll(".album").forEach(b =>
    b.addEventListener("click", () => openModal(b.dataset.id)));
}

/* ===== MODAL ===== */
const modal = document.getElementById("modal");
function openModal(id){
  const al = ALBUMS.find(a => a.id === id); if(!al) return;
  document.getElementById("mCover").outerHTML = coverHTML(al,true).replace('class="modal__cover"','class="modal__cover" id="mCover"');
  document.getElementById("mFmt").textContent = al.fmt + " · " + al.tag;
  document.getElementById("mTitle").textContent = al.title;
  document.getElementById("mMeta").textContent = al.yr;
  document.getElementById("mDesc").textContent = al.desc;
  document.getElementById("mTracks").innerHTML =
    al.tracks.map((t,i)=>`<li>${String(i+1).padStart(2,"0")}. ${t} <span>${(2+i%3)}:${(10+i*7)%60}</span></li>`).join("");
  modal.hidden = false;
  document.body.style.overflow = "hidden";
  setNow(songName(al), !!al.track);
  playTrack(al);
}
function closeModal(){
  modal.hidden = true;
  document.body.style.overflow="";
  /* la música sigue sonando; para parar usa el botón play, para callar el mute */
}
if (modal) {
  modal.addEventListener("click", e => { if (e.target.hasAttribute("data-close")) closeModal(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !modal.hidden) closeModal(); });
}

/* ===== NOW PLAYING ===== */
function setNow(name, hasTrack){
  if (nowTitle) nowTitle.textContent = name;
  if (nowBar) nowBar.style.width = "0%";
  if (nowTime) nowTime.textContent = "--:-- / --:--";
  clearInterval(progTimer);
  if (hasTrack && dj) {
    progTimer = setInterval(()=>{
      if (dj.duration) {
        if (nowBar) nowBar.style.width = (dj.currentTime / dj.duration * 100) + "%";
        if (nowTime) nowTime.textContent = fmt(dj.currentTime) + " / " + fmt(dj.duration);
      }
    }, 200);
  }
}

/* ===== TEMAS ===== */
const THEME_KEY = "santi-theme";
function applyTheme(t){
  document.documentElement.dataset.theme = t;
  document.querySelectorAll(".theme").forEach(b =>
    b.classList.toggle("is-on", b.dataset.set === t));
  try{ localStorage.setItem(THEME_KEY, t); }catch(e){}
}
document.querySelectorAll(".theme").forEach(b =>
  b.addEventListener("click", () => applyTheme(b.dataset.set)));

/* ===== COPIAR ===== */
const copyBtn = document.getElementById("copy");
if (copyBtn) copyBtn.addEventListener("click", async () => {
  try{ await navigator.clipboard.writeText(MAIL); }catch(e){}
  const old = copyBtn.textContent; copyBtn.textContent = "¡COPIADO!";
  setTimeout(()=> copyBtn.textContent = old, 1400);
});

/* ===== INIT ===== */
let saved = "vinilo";
try{ saved = localStorage.getItem(THEME_KEY) || "vinilo"; }catch(e){}
applyTheme(saved);
setHeader();
renderGrid();
updateMuteIcon();