/**
 * Gefið efni fyrir verkefni 9, ekki er krafa að nota nákvæmlega þetta en nota
 * verður gefnar staðsetningar.
 */

import { el } from "./lib/elements.js";
import { weatherSearch } from "./lib/weather.js";

/**
 * @typedef {Object} SearchLocation
 * @property {string} title
 * @property {number} lat
 * @property {number} lng
 */

/**
 * Allar staðsetning sem hægt er að fá veður fyrir.
 * @type Array<SearchLocation>
 */
const locations = [
  {
    title: "Mín staðsetning (þarf leyfi)",
    className: "my-location",
    lat: 1000,
    lng: 1000,
  },
  {
    title: "Reykjavík",
    lat: 64.1355,
    lng: -21.8954,
  },
  {
    title: "Akureyri",
    lat: 65.6835,
    lng: -18.0878,
  },
  {
    title: "New York",
    lat: 40.7128,
    lng: -74.006,
  },
  {
    title: "Tokyo",
    lat: 35.6764,
    lng: 139.65,
  },
  {
    title: "Sydney",
    lat: 33.8688,
    lng: 151.2093,
  },
];

/**
 * Birta villu í viðmóti.
 * @param {Error} error
 */
function renderError(error) {
  // TODO útfæra
  console.log(error);


  const mainWeather = document.querySelector("main.weather");
  const errorText = document.createElement("p");
  errorText.textContent = "Villa kom upp: " + error;
  mainWeather.appendChild(errorText);
}

/**
 * Framkvæmir leit að veðri fyrir núverandi staðsetningu.
 * Biður notanda um leyfi gegnum vafra.
 */
async function onSearchMyLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Success callback
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        console.log(`Latitude: ${userLat}, Longitude: ${userLng}`);

        locations[0].lat = userLat;
        locations[0].lng = userLng;
      },
      (error) => {
        renderError(error.message);
      }
    );
  } else {
    console.log("Staðsetning er ekki studd á þessum vafra.");
  }

  console.log(locations[0]);    
}

/**
 * Birta biðstöðu í viðmóti.
 */
function renderLoading() {
  console.log("render loading");
  // TODO útfæra
  const mainWeather = document.querySelector("main.weather");

  // Eyða gömlum niðurstöðum ef til
  const previousResults = mainWeather.querySelector(".results");
  if (previousResults) {
    mainWeather.removeChild(previousResults);
  }

  // Tjékkar ef "nidurstodurText" er til
  let nidurstodurText = mainWeather.querySelector("h2.nidurstodurText");
  if (!nidurstodurText) {
    // Ef ekki til, þá búa til "nidurstodurText"
    nidurstodurText = document.createElement("h2");
    nidurstodurText.textContent = "Niðurstöður";
    nidurstodurText.classList.add("nidurstodurText");
    mainWeather.appendChild(nidurstodurText);
  }

  // Tjékkar ef "leita" er til
  let leita = mainWeather.querySelector("p.leitaText");
  if (!leita) {
    // Ef ekki til, þá búa til "leita"
    leita = document.createElement("p");
    leita.textContent = "Leita...";
    leita.classList.add("leitaText");
    mainWeather.appendChild(leita);
  }
}

/**
 * Framkvæmir leit að veðri fyrir gefna staðsetningu.
 * Birtir biðstöðu, villu eða niðurstöður í viðmóti.
 * @param {SearchLocation} location Staðsetning sem á að leita eftir.
 */
async function onSearch(location) {
  console.log("onSearch", location);

  // Birta loading state
  renderLoading();

  // Sækja ný gögn fyrir gefna staðsetningu
  const results = await weatherSearch(location.lat, location.lng);

  console.log(results);

  // Finna <main> með klasanum "weather"
  const mainWeather = document.querySelector("main.weather");

  // Fjarlægja "leita" eftir að niðurstöðurnar eru hlaðnar
  const leita = mainWeather.querySelector("p.leitaText");
  if (leita) {
    mainWeather.removeChild(leita);
  }

  // Búa til nýtt div fyrir niðurstöður
  const tableContainer = document.createElement("div");
  tableContainer.classList.add("results");

  // Búa til ytri div fyrir titla
  const titleContainer = document.createElement("div");

  // Búa til titill
  const title = document.createElement("h3");
  title.textContent = location.title;
  titleContainer.appendChild(title);

  // Búa til undirtitill
  const titleSubtext = document.createElement("p");
  titleSubtext.textContent =
    "Spá fyrir daginn á breiddargráðu " +
    location.lat +
    " og lengdargráðu " +
    location.lng;
  titleContainer.appendChild(titleSubtext);

  // Bæta titla div við tableContainer
  tableContainer.appendChild(titleContainer);

  // Búa til töflu
  const table = document.createElement("table");
  table.classList.add("forecast");

  // Búa til haus á töflu
  const headerRow = document.createElement("tr");
  const headers = ["Klukkutími", "Hiti (°C)", "Úrkoma (mm)"];
  headers.forEach((headerText) => {
    const header = document.createElement("th");
    header.textContent = headerText;
    headerRow.appendChild(header);
  });
  table.appendChild(headerRow);

  // Búa til tbody
  const tbody = document.createElement("tbody");
  table.appendChild(tbody);

  // Búa til línu í töflu fyrir hvern tíma
  results.hourly.time.forEach((dateTime, index) => {
    const row = document.createElement("tr");

    // Bæta við tíma
    const timeOnly = dateTime.split("T")[1];

    // Tími
    const timeCell = document.createElement("td");
    timeCell.textContent = timeOnly;
    row.appendChild(timeCell);

    // Hiti
    const tempCell = document.createElement("td");
    tempCell.textContent = results.hourly.temperature_2m[index];
    row.appendChild(tempCell);

    // Úrkoma
    const rainCell = document.createElement("td");
    rainCell.textContent = results.hourly.precipitation[index];
    row.appendChild(rainCell);

    // Bæta við línu í töflu
    tbody.appendChild(row);
  });

  // Bæta við töflu við tableContainer
  tableContainer.appendChild(table);

  // Bæta tableContainer við main.weather
  mainWeather.appendChild(tableContainer);
}



/**
 * Býr til takka fyrir staðsetningu.
 * @param {string} locationTitle
 * @param {() => void} onSearch
 * @returns {HTMLElement}
 */
function renderLocationButton(locationTitle, onSearch) {
  // Notum `el` fallið til að búa til element og spara okkur nokkur skref.
  const locationElement = el(
    "li",
    { class: "locations__location" },
    el("button", { class: "locations__button", click: onSearch }, locationTitle)
  );

  /* Til smanburðar við el fallið ef við myndum nota DOM aðgerðir
  const locationElement = document.createElement('li');
  locationElement.classList.add('locations__location');
  const locationButton = document.createElement('button');
  locationButton.appendChild(document.createTextNode(locationTitle));
  locationButton.addEventListener('click', onSearch);
  locationElement.appendChild(locationButton);
  */

  return locationElement;
}

/**
 * Býr til grunnviðmót: haus og lýsingu, lista af staðsetningum og niðurstöður (falið í byrjun).
 * @param {Element} container HTML element sem inniheldur allt.
 * @param {Array<SearchLocation>} locations Staðsetningar sem hægt er að fá veður fyrir.
 * @param {(location: SearchLocation) => void} onSearch
 * @param {() => void} onSearchMyLocation
 */
function render(container, locations, onSearch, onSearchMyLocation) {
  // Búum til <main> og setjum `weather` class
  const parentElement = document.createElement("main");
  parentElement.classList.add("weather");

  // Búum til <header> með beinum DOM aðgerðum
  const headerElement = document.createElement("header");
  const heading = document.createElement("h1");
  heading.appendChild(document.createTextNode("☀️ Veðrið 🌧️"));
  headerElement.appendChild(heading);
  parentElement.appendChild(headerElement);

  const subtext = document.createElement("p");
  subtext.appendChild(
    document.createTextNode("Veldu stað til að sjá hita- og úrkomuspá.")
  );
  parentElement.appendChild(subtext);

  const stadsetningar = document.createElement("h2");
  stadsetningar.appendChild(document.createTextNode("Staðsetningar"));
  parentElement.appendChild(stadsetningar);

  // TODO útfæra inngangstexta
  // Búa til <div class="loctions">
  const locationsElement = document.createElement("div");
  locationsElement.classList.add("locations");

  // Búa til <ul class="locations__list">
  const locationsListElement = document.createElement("ul");
  locationsListElement.classList.add("locations__list");

  // <div class="loctions"><ul class="locations__list"></ul></div>
  locationsElement.appendChild(locationsListElement);

  // <div class="loctions"><ul class="locations__list"><li><li><li></ul></div>
  for (const location of locations) {
    const liButtonElement = renderLocationButton(location.title, () => {
      onSearch(location);
    });
    locationsListElement.appendChild(liButtonElement);

    if (location.className === "my-location") {
      liButtonElement.addEventListener("click", onSearchMyLocation);
    }
  }

  parentElement.appendChild(locationsElement);

  // TODO útfæra niðurstöðu element

  container.appendChild(parentElement);
}

// Þetta fall býr til grunnviðmót og setur það í `document.body`
render(document.body, locations, onSearch, onSearchMyLocation);
