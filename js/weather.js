export function initWeather() {
  const tempEl = document.getElementById("wTemp");
  const iconEl = document.getElementById("wIcon");
  const condEl = document.getElementById("wCond");
  const geoBtn = document.getElementById("wGeo");

  if (!tempEl || !iconEl || !condEl || !geoBtn) return;

  const DEFAULT_CITY = { name: "Córdoba", lat: 37.88, lon: -4.77 };

  const WMO = {
    0: ["☀️", "Despejado"],
    1: ["🌤️", "Mayormente despejado"],
    2: ["⛅", "Parcialmente nublado"],
    3: ["☁️", "Nublado"],
    45: ["🌫️", "Niebla"],
    48: ["🌫️", "Niebla con escarcha"],
    51: ["🌦️", "Llovizna ligera"],
    53: ["🌦️", "Llovizna"],
    55: ["🌧️", "Llovizna intensa"],
    61: ["🌧️", "Lluvia ligera"],
    63: ["🌧️", "Lluvia"],
    65: ["🌧️", "Lluvia intensa"],
    66: ["🌧️", "Lluvia helada"],
    67: ["🌧️", "Lluvia helada intensa"],
    71: ["🌨️", "Nieve ligera"],
    73: ["🌨️", "Nieve"],
    75: ["❄️", "Nieve intensa"],
    77: ["❄️", "Granos de nieve"],
    80: ["🌦️", "Chubascos"],
    81: ["🌧️", "Chubascos"],
    82: ["⛈️", "Chubascos fuertes"],
    85: ["🌨️", "Chubascos de nieve"],
    86: ["❄️", "Chubascos de nieve fuertes"],
    95: ["⛈️", "Tormenta"],
    96: ["⛈️", "Tormenta con granizo"],
    99: ["⛈️", "Tormenta fuerte con granizo"]
  };

  function paint(data) {
    const t = Math.round(data.temperature_2m);
    tempEl.textContent = t + "°";

    const w = WMO[data.weather_code] || ["🌡️", "—"];
    iconEl.textContent = w[0];
    condEl.textContent = w[1];

    condEl.title =
      "Viento " +
      Math.round(data.wind_speed_10m) +
      " km/h · Humedad " +
      data.relative_humidity_2m +
      "%";
  }

  async function load(lat, lon) {
    const url =
      "https://api.open-meteo.com/v1/forecast" +
      "?latitude=" + lat +
      "&longitude=" + lon +
      "&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m" +
      "&timezone=auto";

    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error("HTTP " + r.status);

      const j = await r.json();
      paint(j.current);
    } catch (e) {
      condEl.textContent = "sin datos";
      iconEl.textContent = "⚠️";
    }
  }

  load(DEFAULT_CITY.lat, DEFAULT_CITY.lon);

  geoBtn.addEventListener("click", () => {
    if (!navigator.geolocation) {
      condEl.textContent = "geoloc no soportada";
      return;
    }

    geoBtn.disabled = true;
    geoBtn.textContent = "…";

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        load(pos.coords.latitude, pos.coords.longitude);
        geoBtn.disabled = false;
        geoBtn.textContent = "📍 Mi ubicación";
      },
      () => {
        condEl.textContent = "permiso denegado";
        geoBtn.disabled = false;
        geoBtn.textContent = "📍 Mi ubicación";
      },
      { timeout: 8000, maximumAge: 600000 }
    );
  });
}