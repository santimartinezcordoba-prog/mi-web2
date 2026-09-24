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
  { id:"compile", title:"LIFE", fmt:"LP", yr:"2008–hoy", tag:"ECOPILATORIO",
    cover:"la espalda del sol", track:"nuevo-duelo.mp3", song:"Nuevo Duelo - Diego 900",
    c:["#ff2d2d","#ff7a00"],
    desc:"Mi primer disco: la recopilación de todo lo que he sido hasta ahora. Nací en 2008 y aquí están todas mis demos, directos y descartes.",
    tracks:["Nacimiento (Intro)","Primeros pasos","La banda","CrossFit (volvere)","Pizzería de verano","Praga, 2024","1º DAM","Outro: seguiré componiendo"] },

  { id:"banda", title:"BANDA SONORA", fmt:"LP", yr:"2021–hoy", tag:"MÚSICA",
    cover:"san francisco", track:"Jovenes-cristianos-de-Bolbaie", song:"Jovenes cristianos de Bolbaie - Jose Antonio Boluda Ponce",
    c:["#1f6feb","#00c2ff"],
    desc:"Años en la banda de música del pueblo. Ensayos, conciertos y el directo más largo que he hecho nunca.",
    tracks:["Pasodoble","Ensayo general","Concierto de Navidad","Entradas","Director invitado","Bis"] },

  { id:"batukada", title:"BATUKADA", fmt:"EP", yr:"2022–hoy", tag:"PERCUSIÓN",
     cover:"bitukada", track:"batukada.mp3", song:"Ritmo base",
    c:["#ff7a00","#ffd400"],
    desc:"El EP más ruidoso. Tambor, ritmo y calle. Donde aprendí que el tempo lo manda el grupo.",
    tracks:["Ritmo base","Llamada","Musicorp","Desfile","Silencio (Outro)"] },

  { id:"praga", title:"PRAGA", fmt:"SGL", yr:"2024", tag:"FIN DE CURSO",
    cover:"altibajos", track:"a-mi-lao.mp3", song:"A mi lao' - JM y Tans",
    c:["#7c3aed","#ff2d2d"],
    desc:"Single de viaje de fin de curso. Puente Carlos, reloj astronómico y una foto que no voy a olvidar.",
    tracks:["#Llegadaaccidentada","Puente Carlos","Reloj astronómico","Late night talks","Última noche"] },

  { id:"crossfit", title:"CROSSFIT SESSIONS", fmt:"SGL", yr:"2022", tag:"ENTRENAMIENTO",
     cover:"tres creus", track:"tabata.mp3", song:"rocky tabata",
    c:["#00ff66","#0b0b0d"],
    desc:"Sencillo de sudor. WOD, barras y la satisfacción de terminar lo que empiezas.",
    tracks:["Estiramiento","Calentamiento","over head squads (asco type shit)","PR","AMRAP"] },

  { id:"pizza", title:"PIZZERIA TOPOGIGIO", fmt:"LP", yr:"3 veranos y sumando", tag:"HOSTELERÍA",
    cover:"mf doom", track:"tu-con-el.mp3", song:"Tú con el - Rauw Alejandro",
    c:["#d61f1f","#ffd400"],
    desc:"Tres veranos de camarero en la pizzería del pueblo. Propinas, pedidos y picos de trabajo.",
    tracks:["Apertura","cenas (hora punta)","placer de lotus x15","Limpieza","La clasica","Cierre",] },

  { id:"dam", title:"DAM (THE DEBUT)", fmt:"LP", yr:"curso actual", tag:"ESTUDIOS",
    cover:"la madruga", track:"nueva-season.mp3", song:"Nueva Season - Delaossa",
    c:["#00c2ff","#1f6feb"],
    desc:"Mi álbum de estudio actual: 1º DAM en el IES Simarro. Código, exámenes y explorando salidas profesionales.",
    tracks:["Hola Mundo","Programación","Sistemas Informáticos","Lenguaje de Marcas","Entornos de Desarrollo","Proyecto final (en producción)"] },

  { id:"player", title:"PLAYER 1", fmt:"EP", yr:"siempre", tag:"VIDEOJUEGOS",
    cover:"de la forman en que yo quiero", track:"marvel-spiderman.mp3", song:"Spiderman - imsoniac",
    c:["#ff2d2d","#00ff66"],
    desc:"EP gamer. Pokémon es el hilo conductor: la Kanto infinita.",
    tracks:["¡Elige tu inicial!","Dios de la guerra","Cazando Maquinas"," (Boss fight) - outro","Guardando…"] },

  { id:"screen", title:"SCREEN TIME", fmt:"LP", yr:"varios", tag:"SERIES & CINE",
    cover:"ted mosby", track:"In-the-pool.mp3", song:"In the pool - Kensuke Ushio",
    c:["#ffb000","#d61f1f"],
    desc:"Largo de pantallas. Cómo conocí a vuestra madre en serie, Baby Driver y Your Name en cine.",
    tracks:["It's gonna be legend…","Baby Driver ","Your Name (Kimi no Na wa)","Dandadan","la la land","Escena post creditos"] },

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
    markHeard(al.id);
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
/* ===== EASTER EGG: progreso + SNAKE // SESIÓN ===== */
const HEARD_KEY="santi-heard", UNLOCK_KEY="santi-snake-unlocked", BEST_KEY="santi-snake-best";
const egg=document.getElementById("egg"), toast=document.getElementById("toast");
function getHeard(){try{return new Set(JSON.parse(localStorage.getItem(HEARD_KEY)||"[]"))}catch(e){return new Set()}}
function saveHeard(s){try{localStorage.setItem(HEARD_KEY,JSON.stringify([...s]))}catch(e){}}
function isUnlocked(){try{return localStorage.getItem(UNLOCK_KEY)==="1"}catch(e){return false}}
function paintProgress(){if(!egg)return;const n=getHeard().size,t=ALBUMS.length;if(n===0){egg.hidden=true;return}egg.hidden=false;egg.innerHTML=isUnlocked()?`★ Sesión completa <b>${t}/${t}</b> · pulsa el logo o el mando`:`★ Álbumes escuchados <b>${n}/${t}</b>`}
function markHeard(id){const s=getHeard();if(s.has(id)){paintProgress();return}s.add(id);saveHeard(s);if(s.size===ALBUMS.length&&!isUnlocked()){try{localStorage.setItem(UNLOCK_KEY,"1")}catch(e){}document.body.classList.add("has-snake");paintProgress();showToast(`★ <b>EASTER EGG desbloqueado</b> · pulsa el logo`)}else paintProgress()}
function showToast(html){if(!toast)return;toast.innerHTML=html;toast.hidden=false;clearTimeout(showToast._t);showToast._t=setTimeout(()=>toast.hidden=true,4500)}

let actx=null;
function beep(freq,dur=.08,type="square",gain=.06){try{if(!actx)actx=new(window.AudioContext||window.webkitAudioContext)();const o=actx.createOscillator(),g=actx.createGain();o.type=type;o.frequency.value=freq;g.gain.value=gain;o.connect(g);g.connect(actx.destination);const t=actx.currentTime;o.start(t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.stop(t+dur+.02)}catch(e){}}
const SCALE=[261.63,293.66,329.63,392,440,523.25,587.33,659.25,783.99];

const snake=document.getElementById("snake"),canvas=document.getElementById("snakeCanvas"),ctx=canvas?canvas.getContext("2d"):null;
const snakeScoreEl=document.getElementById("snakeScore"),snakeBestEl=document.getElementById("snakeBest"),snakeOver=document.getElementById("snakeOver"),snakeOverMsg=document.getElementById("snakeOverMsg"),snakePause=document.getElementById("snakePause");
const GRID=21;let cell=20,snakeArr=[],dir={x:1,y:0},nextDir={x:1,y:0},food=null,score=0,speed=130,alive=false,paused=false,lastStep=0,rafId=0;
function cssVar(n){return getComputedStyle(document.documentElement).getPropertyValue(n).trim()||"#888"}
function hexToRgb(h){h=h.replace("#","");if(h.length===3)h=h.split("").map(c=>c+c).join("");const n=parseInt(h,16);return[(n>>16)&255,(n>>8)&255,n&255]}
function mix(a,b,t){const A=hexToRgb(a),B=hexToRgb(b);return`rgb(${Math.round(A[0]+(B[0]-A[0])*t)},${Math.round(A[1]+(B[1]-A[1])*t)},${Math.round(A[2]+(B[2]-A[2])*t)})`}
function sizeCanvas(){if(!canvas)return;const dpr=window.devicePixelRatio||1,rect=canvas.getBoundingClientRect(),px=Math.max(280,Math.min(rect.width||440,520));canvas.width=px*dpr;canvas.height=px*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);cell=px/GRID}
function placeFood(){let f;do{f={x:Math.floor(Math.random()*GRID),y:Math.floor(Math.random()*GRID)}}while(snakeArr.some(s=>s.x===f.x&&s.y===f.y));food=f}
function resetSnake(){snakeArr=[{x:10,y:10},{x:9,y:10},{x:8,y:10}];dir={x:1,y:0};nextDir={x:1,y:0};score=0;speed=130;paused=false;alive=true;if(snakeScoreEl)snakeScoreEl.textContent="0";if(snakeOver)snakeOver.hidden=true;if(snakePause)snakePause.hidden=true;placeFood()}
function setDir(d){const m={up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}},nd=m[d];if(!nd)return;if(nd.x===-dir.x&&nd.y===-dir.y)return;nextDir=nd}
function step(){dir=nextDir;const h={x:snakeArr[0].x+dir.x,y:snakeArr[0].y+dir.y};if(h.x<0||h.y<0||h.x>=GRID||h.y>=GRID)return gameOver();if(snakeArr.some(s=>s.x===h.x&&s.y===h.y))return gameOver();snakeArr.unshift(h);if(h.x===food.x&&h.y===food.y){score++;if(snakeScoreEl)snakeScoreEl.textContent=score;speed=Math.max(70,speed-3);beep(SCALE[Math.min(SCALE.length-1,2+(score%7))],.09,"square",.07);placeFood()}else snakeArr.pop()}
function drawVinyl(cx,cy,r){const dark=cssVar("--chip-bg"),ring=cssVar("--line"),c3=cssVar("--c3");ctx.fillStyle=dark;ctx.beginPath();ctx.arc(cx,cy,r,0,7);ctx.fill();ctx.strokeStyle=ring;ctx.lineWidth=1;for(let rr=r*.45;rr<r;rr+=r*.18){ctx.beginPath();ctx.arc(cx,cy,rr,0,7);ctx.stroke()}ctx.fillStyle=c3;ctx.beginPath();ctx.arc(cx,cy,r*.28,0,7);ctx.fill()}
function roundRect(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}
function render(){if(!ctx)return;const W=GRID*cell,bg2=cssVar("--bg2"),line=cssVar("--line"),c1=cssVar("--c1"),c3=cssVar("--c3");ctx.fillStyle=bg2;ctx.fillRect(0,0,W,W);ctx.strokeStyle=line;ctx.globalAlpha=.25;ctx.lineWidth=1;const cx=W/2,cy=W/2;for(let r=cell;r<W*.72;r+=cell*1.4){ctx.beginPath();ctx.arc(cx,cy,r,0,7);ctx.stroke()}ctx.globalAlpha=.12;ctx.beginPath();ctx.moveTo(0,cy);ctx.lineTo(W,cy);ctx.moveTo(cx,0);ctx.lineTo(cx,W);ctx.stroke();ctx.globalAlpha=1;if(food){const fx=food.x*cell+cell/2,fy=food.y*cell+cell/2;drawVinyl(fx,fy,cell*.42);ctx.strokeStyle=c3;ctx.globalAlpha=.5+.5*Math.sin(Date.now()/200);ctx.lineWidth=2;ctx.beginPath();ctx.arc(fx,fy,cell*.55,0,7);ctx.stroke();ctx.globalAlpha=1}const n=snakeArr.length;for(let i=n-1;i>=0;i--){const s=snakeArr[i],t=i/Math.max(1,n-1);ctx.fillStyle=i===0?c1:mix(c1,c3,t);const pad=cell*.12,x=s.x*cell+pad,y=s.y*cell+pad,sz=cell-pad*2;roundRect(x,y,sz,sz,i===0?sz*.45:sz*.3);ctx.fill()}const h=snakeArr[0];ctx.fillStyle="#fff";const ex=h.x*cell+cell/2+dir.x*cell*.18-cell*.06,ey=h.y*cell+cell/2+dir.y*cell*.18-cell*.06;ctx.fillRect(ex,ey,cell*.12,cell*.12)}
function gameOver(){alive=false;beep(140,.22,"sawtooth",.08);setTimeout(()=>beep(90,.3,"sawtooth",.08),120);let best=0;try{best=parseInt(localStorage.getItem(BEST_KEY)||"0",10)}catch(e){}if(score>best){best=score;try{localStorage.setItem(BEST_KEY,String(best))}catch(e){}}if(snakeBestEl)snakeBestEl.textContent=best;if(snakeOverMsg)snakeOverMsg.textContent=`Has sumado ${score} pista${score===1?"":"s"} · Récord ${best}`;if(snakeOver)snakeOver.hidden=false}
function loop(ts){rafId=requestAnimationFrame(loop);if(!alive||paused){render();return}if(ts-lastStep>=speed){lastStep=ts;step()}render()}
function openSnake(){if(!snake)return;snake.hidden=false;document.body.style.overflow="hidden";if(snakeBestEl){try{snakeBestEl.textContent=localStorage.getItem(BEST_KEY)||"0"}catch(e){}}sizeCanvas();resetSnake();cancelAnimationFrame(rafId);rafId=requestAnimationFrame(loop);if(actx&&actx.state==="suspended")actx.resume()}
function closeSnake(){if(!snake)return;snake.hidden=true;document.body.style.overflow="";cancelAnimationFrame(rafId);alive=false}
document.addEventListener("keydown",e=>{if(!snake||snake.hidden){if(e.key==="Escape"&&modal&&!modal.hidden)closeModal();return}const k=e.key.toLowerCase();if(k==="arrowup"||k==="w")setDir("up");else if(k==="arrowdown"||k==="s")setDir("down");else if(k==="arrowleft"||k==="a")setDir("left");else if(k==="arrowright"||k==="d")setDir("right");else if(k===" "){e.preventDefault();paused=!paused;if(snakePause)snakePause.hidden=!paused}else if(k==="escape")closeSnake()});
if(snake){snake.querySelectorAll("[data-dir]").forEach(b=>b.addEventListener("click",()=>setDir(b.dataset.dir)));snake.addEventListener("click",e=>{if(e.target.hasAttribute("data-close"))closeSnake()});const retry=document.getElementById("snakeRetry");if(retry)retry.addEventListener("click",()=>resetSnake());let sx=0,sy=0;canvas.addEventListener("pointerdown",e=>{sx=e.clientX;sy=e.clientY});canvas.addEventListener("pointerup",e=>{const dx=e.clientX-sx,dy=e.clientY-sy;if(Math.abs(dx)<20&&Math.abs(dy)<20)return;if(Math.abs(dx)>Math.abs(dy))setDir(dx>0?"right":"left");else setDir(dy>0?"down":"up")})}
const easterBtn=document.getElementById("easterBtn"),wordmark=document.getElementById("wordmark");
if(easterBtn)easterBtn.addEventListener("click",openSnake);
if(wordmark)wordmark.addEventListener("click",()=>{if(isUnlocked())openSnake()});
if(isUnlocked())document.body.classList.add("has-snake");
paintProgress();