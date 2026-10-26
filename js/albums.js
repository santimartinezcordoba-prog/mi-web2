import { COVER_DIR, TRY_EXTS } from "./config.js";
import { stripExt } from "./utils.js";

export const ALBUMS = [
/* ===== ÁLBUMES ===== */
  { id:"compile", title:"LIFE", fmt:"LP", yr:"2008–hoy", tag:"ECOPILATORIO", cover:"la espalda del sol", track:"nuevo-duelo.mp3", song:"Nuevo Duelo - Diego 900", c:["#ff2d2d","#ff7a00"], desc:"Me llamo Santiago. Este disco no tiene singles, tiene mi vida: nací en 2008, crecí entre un pueblo, una banda de música y un atril. Aquí va todo junto, sin editar mucho. Los demás álbumes son las caras; este es el espejo.", tracks:["Nacimiento (Intro)","Primeros pasos","La banda","CrossFit (volvere)","Pizzería de verano","Praga, 2024","1º DAM","Outro: seguiré componiendo"] },
  { id:"banda", title:"BANDA SONORA", fmt:"LP", yr:"2021–hoy", tag:"MÚSICA", cover:"san francisco", track:"Jovenes-cristianos-de-Bolbaie", song:"Jovenes cristianos de Bolbaie - Jose Antonio Boluda Ponce", c:["#1f6feb","#00c2ff"], desc:"Desde 2021 toco en la banda del pueblo. Ensayo los jueves, concierto en Navidad y uno grande en verano. Aprendí a leer partitura, a callarme cuando entra otro instrumento y a aguantar dos horas de pasodoble sin moverme. Eso último también es una habilidad.", tracks:["Pasodoble","Ensayo general","Concierto de Navidad","Entradas","Director invitado","Bis"] },
  { id:"batukada", title:"BATUKADA", fmt:"EP", yr:"2022–hoy", tag:"PERCUSIÓN", cover:"bitukada", track:"batutralla.mp3", song:"Ritmo batutralla", c:["#ff7a00","#ffd400"], desc:"Percusión de calle desde 2022. Tambor, bombo y un ritmo que se marca en grupo, no en solitario. Aquí aprendí que el tempo no lo mandas tú: lo manda el que va delante. Buen ejercicio para no creerte el centro de nada.", tracks:["Ritmo base","Llamada","Musicorp","Desfile","Silencio (Outro)"] },
  { id:"praga", title:"PRAGA", fmt:"SGL", yr:"2024", tag:"FIN DE CURSO", cover:"altibajos", track:"a-mi-lao.mp3", song:"A mi lao' - JM y Tans", c:["#7c3aed","#ff2d2d"], desc:"Viaje de fin de curso a Praga, 2024. Puente Carlos, reloj astronómico y una foto de grupo que me quedé mirando más de lo que debería. No es un álbum de turismo: es lo que sale cuando sales del pueblo por primera vez con tu clase.", tracks:["#Llegadaaccidentada","Puente Carlos","Reloj astronómico","Late night talks","Última noche"] },
  { id:"crossfit", title:"CROSSFIT SESSIONS", fmt:"SGL", yr:"2022", tag:"ENTRENAMIENTO", cover:"tres creus", track:"tabata.mp3", song:"rocky tabata", c:["#00ff66","#0b0b0d"], desc:"Entreno CrossFit desde 2022. WOD, barra y la parte que no sale en Instagram: las agujetas y el “ya no puedo más” del último round. Me enseñó a terminar las cosas, que aplicado a estudiar y a currar vale igual.", tracks:["Estiramiento","Calentamiento","over head squads (asco type shit)","PR","AMRAP"] },
  { id:"pizza", title:"PIZZERIA TOPOGIGIO", fmt:"LP", yr:"3 veranos y sumando", tag:"HOSTELERÍA", cover:"mf doom", track:"tu-con-el.mp3", song:"Tú con el - Rauw Alejandro", c:["#d61f1f","#ffd400"], desc:"Tres veranos de camarero en la pizzería del pueblo. Comanda, barra, sala y a veces caja. Aprendí a llevar cuatro mesas, a no discutir con el de la propina y a cerrar sin derramar nada. Hostelería: la carrera que no sale en el título pero te forma.", tracks:["Apertura","cenas (hora punta)","placer de lotus x15","Limpieza","La clasica","Cierre"] },
  { id:"dam", title:"DAM (THE DEBUT)", fmt:"LP", yr:"curso actual", tag:"ESTUDIOS", cover:"la madruga", track:"nueva-season.mp3", song:"Nueva Season - Delaossa", c:["#00c2ff","#1f6feb"], desc:"Curso actual: 1º de DAM en el IES Simarro. Código, sistemas, marcas y entornos. Esta web que estás leyendo la he escrito yo, a mano, con HTML, CSS y JavaScript, sin frameworks ni plantillas. Si algo funciona, es porque antes lo rompí.", tracks:["Hola Mundo","Programación","Sistemas Informáticos","Lenguaje de Marcas","Entornos de Desarrollo","Proyecto final (en producción)"] },
  { id:"player", title:"PLAYER 1", fmt:"EP", yr:"siempre", tag:"VIDEOJUEGOS", cover:"de la forman en que yo quiero", track:"marvel-spiderman.mp3", song:"Spiderman - imsoniac", c:["#ff2d2d","#00ff66"], desc:"Juego desde que tengo mando. Pokémon es el hilo: la Kanto infinita. Pero también Dios de la guerra y cualquier cosa que te haga pensar dos veces el botón de “seguir”. Los videojuegos me enseñaron a leer pantallas, patrones y a no rendirme en un boss.", tracks:["¡Elige tu inicial!","Dios de la guerra","Cazando Maquinas"," (Boss fight) - outro","Guardando…"] },
  { id:"screen", title:"SCREEN TIME", fmt:"LP", yr:"varios", tag:"SERIES & CINE", cover:"ted mosby", track:"In-the-pool.mp3", song:"In the pool - Kensuke Ushio", c:["#ffb000","#d61f1f"], desc:"Cine y series a discreción. Cómo conocí a vuestra madre, Baby Driver, Your Name, Dandadan, La La Land. Me fijo en la banda sonora casi tanto como en el guion, que viniendo de la banda no es casualidad.", tracks:["It's gonna be legend…","Baby Driver ","Your Name (Kimi no Na wa)","Dandadan","la la land","Escena post creditos"] },
];

export function findAlbum(id) {
  return ALBUMS.find((a) => a.id === id);
}

export function coverCandidates(al) {
  const base = al.cover ? stripExt(al.cover) : al.id;
  return TRY_EXTS.map((ext) => COVER_DIR + encodeURIComponent(base + ext));
}

export function coverHTML(al, big) {
  const cls = big ? "modal__cover" : "cover";
  const arr = coverCandidates(al);
  const listAttr = arr.join("||");
  const init = al.title.replace(/[^A-ZÁÉÍÓÚ]/g, "").slice(0, 1) || al.title[0] || "?";

  const badge = big
    ? ""
    : `<span class="badge">${al.fmt}</span><span class="disc" aria-hidden="true"></span>`;

  return `
    <div class="${cls}" style="--c1:${al.c[0]};--c2:${al.c[1]}">
      <span class="init">${init}</span>
      <img
        class="cover-img"
        src="${arr[0]}"
        alt="Portada de ${al.title}"
        loading="lazy"
        data-i="0"
        data-list="${listAttr}"
      />
      ${badge}
    </div>
  `.trim();
}

export function renderGrid(onOpen) {
  const g = document.getElementById("grid");
  if (!g) return;

  g.innerHTML = ALBUMS.map((al) => `
    <button class="album" data-id="${al.id}" aria-label="Abrir ${al.title}">
      ${coverHTML(al, false)}
      <span class="meta">
        <h3>${al.title}</h3>
        <span class="tag">${al.tag}</span>
        <span class="yr">${al.yr}</span>
      </span>
    </button>
  `).join("");

  g.querySelectorAll(".album").forEach((b) => {
    b.addEventListener("click", () => onOpen(b.dataset.id));
  });
}

export function initCoverHandlers() {
  function tryNextCover(img) {
    const list = String(img.dataset.list || "").split("||");
    const i = parseInt(img.dataset.i || "0", 10) + 1;

    if (i < list.length) {
      img.dataset.i = String(i);
      img.src = list[i];
    } else {
      img.remove();
    }
  }

  function handleCoverLoad(e) {
    const img = e.target;
    if (!img || img.tagName !== "IMG" || !img.classList.contains("cover-img")) return;

    const parent = img.parentElement;
    if (!parent) return;

    parent.style.setProperty("--cover", `url("${img.currentSrc || img.src}")`);
    parent.classList.add("has-img");
  }

  function handleCoverError(e) {
    const img = e.target;
    if (!img || img.tagName !== "IMG" || !img.classList.contains("cover-img")) return;

    tryNextCover(img);
  }

  document.addEventListener("load", handleCoverLoad, true);
  document.addEventListener("error", handleCoverError, true);
}