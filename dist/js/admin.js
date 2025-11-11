// Firebase модулі
import { auth, db } from "./firebase-config.js";
import {
  collection, doc, setDoc, getDoc, getDocs, deleteDoc
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

let editInstrumentId = null;
let editLocationId = null;
let editConcertId = null;

// ===================== Instruments =====================
const instrumentForm = document.getElementById("instrumentForm");
const instrumentsTable = document.querySelector("#instrumentsTable tbody");

async function refreshInstruments() {
  instrumentsTable.innerHTML = "";
  const snapshot = await getDocs(collection(db, "instruments"));
  snapshot.forEach(docSnap => {
    const d = docSnap.data();
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${d.name}</td><td>${d.brand}</td><td>${d.model}</td><td>${d.category}</td>
      <td>${d.pricePerDay}</td><td>${d.status}</td>
      <td>
        <button class="btn btn-sm btn-warning" onclick="editInstrument('${d.instrumentId}')">Редагувати</button>
        <button class="btn btn-sm btn-danger" onclick="deleteInstrument('${d.instrumentId}')">Видалити</button>
      </td>
    `;
    instrumentsTable.appendChild(row);
  });
}

window.editInstrument = async function(id) {
  const docSnap = await getDoc(doc(db, "instruments", id));
  if (!docSnap.exists()) return;
  const d = docSnap.data();
  document.getElementById("instrumentName").value = d.name;
  document.getElementById("instrumentBrand").value = d.brand;
  document.getElementById("instrumentModel").value = d.model;
  document.getElementById("instrumentCategory").value = d.category;
  document.getElementById("instrumentDescription").value = d.description;
  document.getElementById("instrumentPrice").value = d.pricePerDay;
  document.getElementById("instrumentStatus").value = d.status;
  document.getElementById("instrumentImages").value = d.images.join(", ");
  editInstrumentId = id;
  instrumentForm.querySelector("button").textContent = "Оновити інструмент";
}

window.deleteInstrument = async function(id) {
  if (confirm("Видалити інструмент?")) {
    await deleteDoc(doc(db, "instruments", id));
    refreshInstruments();
  }
}

instrumentForm.addEventListener("submit", async e => {
  e.preventDefault();
  const data = {
    instrumentId: editInstrumentId || crypto.randomUUID(),
    name: document.getElementById("instrumentName").value,
    brand: document.getElementById("instrumentBrand").value,
    model: document.getElementById("instrumentModel").value,
    category: document.getElementById("instrumentCategory").value,
    description: document.getElementById("instrumentDescription").value,
    pricePerDay: document.getElementById("instrumentPrice").value,
    status: document.getElementById("instrumentStatus").value,
    images: document.getElementById("instrumentImages").value.split(",").map(i => i.trim())
  };
  await setDoc(doc(db, "instruments", data.instrumentId), data);
  instrumentForm.reset();
  editInstrumentId = null;
  instrumentForm.querySelector("button").textContent = "Додати інструмент";
  refreshInstruments();
});

// ===================== Locations =====================
const locationForm = document.getElementById("locationForm");
const locationsTable = document.querySelector("#locationsTable tbody");
const concertLocationSelect = document.getElementById("concertLocation");

async function refreshLocations() {
  locationsTable.innerHTML = "";
  concertLocationSelect.innerHTML = "";
  const snapshot = await getDocs(collection(db, "locations"));
  snapshot.forEach(docSnap => {
    const d = docSnap.data();
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${d.name}</td><td>${d.address}</td><td>${d.city}</td><td>${d.coordinates}</td>
      <td>
        <button class="btn btn-sm btn-warning" onclick="editLocation('${d.locationId}')">Редагувати</button>
        <button class="btn btn-sm btn-danger" onclick="deleteLocation('${d.locationId}')">Видалити</button>
      </td>
    `;
    locationsTable.appendChild(row);
    const opt = document.createElement("option");
    opt.value = d.locationId;
    opt.textContent = d.name;
    concertLocationSelect.appendChild(opt);
  });
}

window.editLocation = async function(id) {
  const docSnap = await getDoc(doc(db, "locations", id));
  if (!docSnap.exists()) return;
  const d = docSnap.data();
  document.getElementById("locationName").value = d.name;
  document.getElementById("locationAddress").value = d.address;
  document.getElementById("locationCity").value = d.city;
  document.getElementById("locationCoordinates").value = d.coordinates;
  editLocationId = id;
  locationForm.querySelector("button").textContent = "Оновити локацію";
}

window.deleteLocation = async function(id) {
  if (confirm("Видалити локацію?")) {
    await deleteDoc(doc(db, "locations", id));
    refreshLocations();
  }
}

locationForm.addEventListener("submit", async e => {
  e.preventDefault();
  const data = {
    locationId: editLocationId || crypto.randomUUID(),
    name: document.getElementById("locationName").value,
    address: document.getElementById("locationAddress").value,
    city: document.getElementById("locationCity").value,
    coordinates: document.getElementById("locationCoordinates").value
  };
  await setDoc(doc(db, "locations", data.locationId), data);
  locationForm.reset();
  editLocationId = null;
  locationForm.querySelector("button").textContent = "Додати локацію";
  refreshLocations();
});

// ===================== Concerts =====================
const concertForm = document.getElementById("concertForm");
const concertsTable = document.querySelector("#concertsTable tbody");

async function refreshConcerts() {
  concertsTable.innerHTML = "";
  const snapshot = await getDocs(collection(db, "concerts"));
  snapshot.forEach(docSnap => {
    const d = docSnap.data();
    const row = document.createElement("tr");
    const locationName = concertLocationSelect.querySelector(`option[value="${d.locationId}"]`)?.textContent || "";
    row.innerHTML = `
      <td>${d.title}</td><td>${d.description}</td><td>${d.dateTime}</td><td>${locationName}</td>
      <td>
        <button class="btn btn-sm btn-warning" onclick="editConcert('${d.concertId}')">Редагувати</button>
        <button class="btn btn-sm btn-danger" onclick="deleteConcert('${d.concertId}')">Видалити</button>
      </td>
    `;
    concertsTable.appendChild(row);
  });
}

window.editConcert = async function(id) {
  const docSnap = await getDoc(doc(db, "concerts", id));
  if (!docSnap.exists()) return;
  const d = docSnap.data();
  document.getElementById("concertTitle").value = d.title;
  document.getElementById("concertDescription").value = d.description;
  document.getElementById("concertDateTime").value = d.dateTime;
  document.getElementById("concertPosterUrl").value = d.posterUrl;
  document.getElementById("concertLocation").value = d.locationId;
  editConcertId = id;
  concertForm.querySelector("button").textContent = "Оновити концерт";
}

window.deleteConcert = async function(id) {
  if (confirm("Видалити концерт?")) {
    await deleteDoc(doc(db, "concerts", id));
    refreshConcerts();
  }
}

concertForm.addEventListener("submit", async e => {
  e.preventDefault();
  const data = {
    concertId: editConcertId || crypto.randomUUID(),
    title: document.getElementById("concertTitle").value,
    description: document.getElementById("concertDescription").value,
    dateTime: document.getElementById("concertDateTime").value,
    posterUrl: document.getElementById("concertPosterUrl").value,
    locationId: document.getElementById("concertLocation").value
  };
  await setDoc(doc(db, "concerts", data.concertId), data);
  concertForm.reset();
  editConcertId = null;
  concertForm.querySelector("button").textContent = "Додати концерт";
  refreshConcerts();
});

// ===================== INIT =====================
refreshInstruments();
refreshLocations();
refreshConcerts();
