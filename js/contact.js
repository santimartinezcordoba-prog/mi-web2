import { MAIL } from "./config.js";

export function initContact() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  const ENDPOINT = form.action;

  const f = {
    name: document.getElementById("cfName"),
    email: document.getElementById("cfEmail"),
    msg: document.getElementById("cfMsg"),
    count: document.getElementById("cfCount"),
    err: document.getElementById("cfErr"),
    ok: document.getElementById("cfOk"),
    btn: document.getElementById("cfSubmit"),
    again: document.getElementById("cfAgain"),
    honey: form.querySelector('input[name="_gotcha"]'),
  };

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setErr(el, msg) {
    const p = document.getElementById(el.id + "Err");
    if (p) p.textContent = msg || "";
    el.setAttribute("aria-invalid", msg ? "true" : "false");
  }

  function validate() {
    let ok = true;
    let first = null;

    if (!f.name.value.trim() || f.name.value.trim().length < 2) {
      setErr(f.name, "Dime tu nombre (mín. 2).");
      ok = false;
      first = first || f.name;
    } else {
      setErr(f.name, "");
    }

    if (!EMAIL_RE.test(f.email.value.trim())) {
      setErr(f.email, "Email no válido.");
      ok = false;
      first = first || f.email;
    } else {
      setErr(f.email, "");
    }

    const m = f.msg.value.trim();

    if (m.length < 10) {
      setErr(f.msg, "Escribe al menos 10 caracteres.");
      ok = false;
      first = first || f.msg;
    } else if (m.length > 600) {
      setErr(f.msg, "Máx. 600.");
      ok = false;
      first = first || f.msg;
    } else {
      setErr(f.msg, "");
    }

    if (!ok && first) first.focus();

    return ok;
  }

  [f.name, f.email, f.msg].forEach((el) => {
    el.addEventListener("blur", validate);
  });

  f.msg.addEventListener("input", () => {
    const n = f.msg.value.length;
    f.count.textContent = n + "/600";
    f.count.style.color = n > 600 ? "var(--c1)" : "var(--muted)";
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (f.honey && f.honey.value) {
      f.ok.hidden = false;
      form.reset();
      f.count.textContent = "0/600";
      return;
    }

    if (!validate()) return;

    f.err.textContent = "";
    f.btn.disabled = true;

    const old = f.btn.textContent;
    f.btn.textContent = "ENVIANDO…";

    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        body: new FormData(form),
        headers: {
          Accept: "application/json",
        },
      });

      let json = {};

      try {
        json = await res.json();
      } catch (_) {}

      if (res.ok && json.success !== false) {
        form.reset();
        f.count.textContent = "0/600";

        [f.name, f.email, f.msg].forEach((el) => setErr(el, ""));

        f.ok.hidden = false;
        f.err.textContent = "";
      } else {
        let reason = "HTTP " + res.status;

        if (res.status === 404) {
          reason = "No encuentro el formulario: revisa el id del action.";
        } else if (res.status === 429) {
          reason = "Límite del plan gratuito este mes.";
        } else if (json && json.errors) {
          const v = Object.values(json.errors)[0];
          reason = Array.isArray(v)
            ? v.join(" ")
            : typeof v === "string"
            ? v
            : reason;
        } else if (json && json.message) {
          reason = json.message;
        }

        f.err.textContent =
          "No se pudo enviar: " +
          reason +
          " · Prueba otra vez o escríbeme a " +
          MAIL +
          ".";
      }
    } catch (err) {
      f.err.textContent =
        "Sin conexión o CORS. Revisa tu red o escríbeme a " + MAIL + ".";
    } finally {
      f.btn.disabled = false;
      f.btn.textContent = old;
    }
  });

  if (f.again) {
    f.again.addEventListener("click", () => {
      f.ok.hidden = true;
      f.name.focus();
    });
  }
}