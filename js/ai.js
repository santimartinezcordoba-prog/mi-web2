import { AI_ENDPOINT } from "./config.js";

export function initAI() {
  const root = document.getElementById("aiChat");
  if (!root) return;

  const fab = document.getElementById("aiFab");
  const close = document.getElementById("aiClose");
  const log = document.getElementById("aiLog");
  const form = document.getElementById("aiForm");
  const input = document.getElementById("aiInput");
  const send = document.getElementById("aiSend");
  const quick = document.getElementById("aiQuick");

  const endpoint = AI_ENDPOINT;

  let history = [];
  let typingEl = null;

  function add(text, who) {
    const div = document.createElement("div");
    div.className = "ai-chat__msg ai-chat__msg--" + who;
    div.textContent = text;

    log.appendChild(div);
    log.scrollTop = log.scrollHeight;

    return div;
  }

  function showTyping() {
    typingEl = add("Pensando...", "bot");
    typingEl.classList.add("ai-chat__typing");
  }

  function hideTyping() {
    if (typingEl) {
      typingEl.remove();
      typingEl = null;
    }
  }

  function setOpen(open) {
    root.classList.toggle("is-open", open);
    fab.setAttribute("aria-expanded", String(open));

    if (open) {
      input.focus();
    }
  }

  async function ask(text) {
    text = String(text).trim();
    if (!text) return;

    add(text, "user");
    history.push({ role: "user", content: text });
    history = history.slice(-6);

    showTyping();
    send.disabled = true;
    root.classList.add("is-thinking");

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: history
        })
      });

      const data = await res.json();
      hideTyping();

      if (!res.ok) {
        throw new Error(data.error || "HTTP " + res.status);
      }

      const reply = data.reply || "No pude generar una respuesta.";
      add(reply, "bot");
      history.push({ role: "assistant", content: reply });
    } catch (err) {
      hideTyping();
      add(
        "No pude consultar la IA ahora mismo. Prueba en un momento o usa el formulario de contacto.",
        "bot"
      );
    } finally {
      send.disabled = false;
      root.classList.remove("is-thinking");
    }
  }

  fab.addEventListener("click", () => {
    setOpen(!root.classList.contains("is-open"));
  });

  close.addEventListener("click", () => {
    setOpen(false);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const value = input.value.trim();
    if (!value) return;

    input.value = "";
    ask(value);
  });

  if (quick) {
    quick.addEventListener("click", (e) => {
      const button = e.target.closest("[data-q]");
      if (!button) return;

      setOpen(true);
      ask(button.dataset.q);
    });
  }

  add(
    "Hola. Soy el asistente de la web de Santi. Puedes preguntarme por su discografía, proyectos, estudios o contacto.",
    "bot"
  );

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && root.classList.contains("is-open")) {
      setOpen(false);
    }
  });
}