const COORD_WIDTH = 2560;
const COORD_HEIGHT = 1219;

const parasolCoords = [
  {"id":1,"x":343,"y":870},{"id":2,"x":450,"y":870},{"id":3,"x":557,"y":870},{"id":4,"x":663,"y":870},{"id":5,"x":770,"y":870},{"id":6,"x":877,"y":870},{"id":7,"x":984,"y":870},{"id":8,"x":1090,"y":870},{"id":9,"x":1197,"y":870},{"id":10,"x":1341,"y":870},{"id":11,"x":1468,"y":870},{"id":12,"x":1587,"y":870},{"id":13,"x":1706,"y":870},{"id":14,"x":1825,"y":870},{"id":15,"x":1943,"y":870},{"id":16,"x":2062,"y":870},{"id":17,"x":2181,"y":870},{"id":18,"x":2300,"y":870},
  {"id":19,"x":343,"y":755},{"id":20,"x":450,"y":755},{"id":21,"x":557,"y":755},{"id":22,"x":663,"y":755},{"id":23,"x":770,"y":755},{"id":24,"x":877,"y":755},{"id":25,"x":984,"y":755},{"id":26,"x":1090,"y":755},{"id":27,"x":1197,"y":755},{"id":28,"x":1341,"y":755},{"id":29,"x":1468,"y":755},{"id":30,"x":1587,"y":755},{"id":31,"x":1706,"y":755},{"id":32,"x":1825,"y":755},{"id":33,"x":1943,"y":755},{"id":34,"x":2062,"y":755},{"id":35,"x":2181,"y":755},{"id":36,"x":2300,"y":755},
  {"id":37,"x":343,"y":640},{"id":38,"x":450,"y":640},{"id":39,"x":557,"y":640},{"id":40,"x":663,"y":640},{"id":41,"x":770,"y":640},{"id":42,"x":877,"y":640},{"id":43,"x":984,"y":640},{"id":44,"x":1090,"y":640},{"id":45,"x":1197,"y":640},{"id":46,"x":1341,"y":640},{"id":47,"x":1468,"y":640},{"id":48,"x":1587,"y":640},{"id":49,"x":1706,"y":640},{"id":50,"x":1825,"y":640},{"id":51,"x":1943,"y":640},{"id":52,"x":2062,"y":640},{"id":53,"x":2181,"y":640},{"id":54,"x":2300,"y":640},
  {"id":55,"x":343,"y":525},{"id":56,"x":450,"y":525},{"id":57,"x":557,"y":525},{"id":58,"x":663,"y":525},{"id":59,"x":770,"y":525},{"id":60,"x":877,"y":525},{"id":61,"x":984,"y":525},{"id":62,"x":1090,"y":525},{"id":63,"x":1197,"y":525},{"id":64,"x":1341,"y":525},{"id":65,"x":1468,"y":525},{"id":66,"x":1587,"y":525},{"id":67,"x":1706,"y":525},{"id":68,"x":1825,"y":525},{"id":69,"x":1943,"y":525},{"id":70,"x":2062,"y":525},{"id":71,"x":2181,"y":525},{"id":72,"x":2300,"y":525},
  {"id":73,"x":1468,"y":410},{"id":74,"x":1587,"y":410},{"id":75,"x":1706,"y":410},{"id":76,"x":1825,"y":410},{"id":77,"x":1943,"y":410},{"id":78,"x":2062,"y":410},{"id":79,"x":2181,"y":410},{"id":80,"x":2300,"y":410}
];

const states = ["free", "occupied", "reserved", "maintenance"];

let status = {};
let notes = {};
let selectedId = null;

const parasolsEl = document.getElementById("parasols");
const selectedEl = document.getElementById("selected");
const noteInput = document.getElementById("noteInput");
const saveStatusEl = document.getElementById("saveStatus");
const summaryEl = document.getElementById("summary");

function labelFor(s) {
  return {
    free: "Libero",
    occupied: "Occupato",
    reserved: "Riservato",
    maintenance: "Manutenzione"
  }[s] || "Libero";
}

function getStatus(id) {
  return status[id] || "free";
}

function updateSaveStatus(text = "✓ Sincronizzato con Firebase") {
  saveStatusEl.classList.remove("dirty", "saved");
  saveStatusEl.textContent = text;
  saveStatusEl.classList.add("saved");
}

function saveCurrentParasol(id) {
  if (!window.saveParasolToFirebase) {
    alert("Firebase non è caricato. Controlla index.html.");
    return;
  }

  window.saveParasolToFirebase(id, {
    status: status[id] || "free",
    note: notes[id] || "",
    updatedAt: Date.now()
  }).then(() => {
    updateSaveStatus();
  }).catch((err) => {
    console.error(err);
    saveStatusEl.textContent = "Errore Firebase: dati non salvati.";
    saveStatusEl.classList.remove("saved");
    saveStatusEl.classList.add("dirty");
  });
}

function cycle(id) {
  selectedId = String(id);
  const current = getStatus(selectedId);
  const next = states[(states.indexOf(current) + 1) % states.length];

  status[selectedId] = next;
  saveCurrentParasol(selectedId);
  render();
}

function setSelectedStatus(newStatus) {
  if (!selectedId) return;

  status[selectedId] = newStatus;
  saveCurrentParasol(selectedId);
  render();
}

function updatePanel() {
  if (!selectedId) {
    selectedEl.textContent = "Tocca un ombrellone.";
    noteInput.value = "";
    return;
  }

  selectedEl.innerHTML = `<strong>Ombrellone ${selectedId}</strong><br>${labelFor(getStatus(selectedId))}`;
  noteInput.value = notes[selectedId] || "";
}

function updateSummary() {
  const total = parasolCoords.length;
  const occupied = Object.values(status).filter(v => v === "occupied").length;
  const reserved = Object.values(status).filter(v => v === "reserved").length;
  const maintenance = Object.values(status).filter(v => v === "maintenance").length;
  const free = total - occupied - reserved - maintenance;

  summaryEl.innerHTML = `
    <span><b>Liberi</b><b>${free}</b></span>
    <span><b>Occupati</b><b>${occupied}</b></span>
    <span><b>Riservati</b><b>${reserved}</b></span>
    <span><b>In manutenzione</b><b>${maintenance}</b></span>
    <span><b>Totale</b><b>${total}</b></span>
  `;
}

function render() {
  parasolsEl.innerHTML = "";

  for (const p of parasolCoords) {
    const id = String(p.id);
    const btn = document.createElement("button");

    btn.className = `parasol ${getStatus(id)} ${selectedId === id ? "selected" : ""}`;
    btn.textContent = id;
    btn.title = `Ombrellone ${id}: ${labelFor(getStatus(id))}`;
    btn.style.left = `${(p.x / COORD_WIDTH) * 100}%`;
    btn.style.top = `${(p.y / COORD_HEIGHT) * 100}%`;
    btn.onclick = () => cycle(id);

    parasolsEl.appendChild(btn);
  }

  updatePanel();
  updateSummary();
}

document.querySelectorAll("[data-status]").forEach(btn => {
  btn.onclick = () => setSelectedStatus(btn.dataset.status);
});

document.getElementById("saveNoteBtn").onclick = () => {
  if (!selectedId) return;

  notes[selectedId] = noteInput.value.trim();
  saveCurrentParasol(selectedId);
  render();
};

document.getElementById("saveBtn").onclick = () => {
  if (!selectedId) {
    alert("Seleziona prima un ombrellone.");
    return;
  }

  saveCurrentParasol(selectedId);
};

document.getElementById("undoBtn").onclick = () => {
  alert("Annulla non è disponibile con sincronizzazione live.");
};

document.getElementById("resetBtn").onclick = () => {
  if (!confirm("Impostare tutti gli ombrelloni come liberi e cancellare le note?")) return;

  status = {};
  notes = {};
  selectedId = null;

  const updates = {};
  for (const p of parasolCoords) {
    updates[p.id] = {
      status: "free",
      note: "",
      updatedAt: Date.now()
    };
  }

  if (window.db) {
    window.db.ref("parasols").set(updates);
  }

  render();
};

document.getElementById("shareBtn").onclick = async () => {
  const total = parasolCoords.length;
  const occupied = Object.values(status).filter(v => v === "occupied").length;
  const reserved = Object.values(status).filter(v => v === "reserved").length;
  const maintenance = Object.values(status).filter(v => v === "maintenance").length;
  const free = total - occupied - reserved - maintenance;

  const text = `Disponibilità Lido Caraibi Beach: ${free} liberi, ${occupied} occupati, ${reserved} riservati, ${maintenance} manutenzione. Totale ${total} ombrelloni.`;

  if (navigator.share) await navigator.share({ text });
  else window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
};

function startFirebaseSync() {
  if (!window.listenParasolsFromFirebase) {
    saveStatusEl.textContent = "Firebase non disponibile.";
    saveStatusEl.classList.remove("saved");
    saveStatusEl.classList.add("dirty");
    render();
    return;
  }

  window.listenParasolsFromFirebase(function(data) {
    status = {};
    notes = {};

    for (const [id, item] of Object.entries(data || {})) {
      status[id] = item.status || "free";
      notes[id] = item.note || "";
    }

    render();
    updateSaveStatus();
  });
}

render();
startFirebaseSync();
