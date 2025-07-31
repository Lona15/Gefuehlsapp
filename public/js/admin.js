const socket = io();
  
function ladeDaten() {
    fetch('/data')
    .then((res) => res.json())
    .then((daten) => zeigeDaten(daten));
}

function zeigeDaten(daten) {

    const tabelle = document.getElementById('liste');
    tabelle.innerHTML = '';

    // Nur die letzten Einträge je Code
    const letzterEintragProCode = new Map();

    daten.forEach((eintrag) => {
    if (
        !letzterEintragProCode.has(eintrag.code) ||
        new Date(eintrag.timestamp) > new Date(letzterEintragProCode.get(eintrag.code).timestamp)
    ) {
        letzterEintragProCode.set(eintrag.code, eintrag);
    }
    });

    daten.forEach((eintrag) => {
    const tr = document.createElement('tr');
    
    // Prüfen ob es der neueste Eintrag für diesen Code ist
    const istLetzter = letzterEintragProCode.get(eintrag.code) === eintrag;
    if (istLetzter) tr.classList.add('highlight');
    
    const time = new Date(eintrag.timestamp + 'Z'); // 'Z' kennzeichnet UTC-Zeit

    tr.innerHTML = `
        <td>${eintrag.code}</td>
        <td>${eintrag.gefuehl}</td>
        <td>${time.toLocaleTimeString('de-DE', {
        timeZone: 'Europe/Berlin',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        })}</td>
        <td>${eintrag.reden ? "Ja" : "Nein"}</td>
    `;
    tabelle.appendChild(tr);
    });
}

    // Einträge Löschen Admin live
function resetDaten() {
    if (confirm('Willst du wirklich alle Einträge löschen?')) {
    fetch('/reset', {
        method: 'DELETE',
    })
        .then((res) => res.json())
        .then((data) => {
        if (data.success) {
            ladeDaten(); // Tabelle neu laden
        } else {
            alert('Fehler beim Löschen.');
        }
        });
    }
}

// Beim ersten Laden: aktuelle Daten holen
ladeDaten();

// Filter einmal aktivieren
    const suchfeld = document.getElementById("suchfeld");
    suchfeld.addEventListener("input", function () {
    const filter = this.value.toLowerCase();
    const zeilen = document.querySelectorAll("#liste tbody tr");

    zeilen.forEach(zeile => {
        const text = zeile.textContent.toLowerCase();
        zeile.style.display = text.includes(filter) ? "" : "none";
    });
    });


// Wenn neue Daten per WebSocket kommen: aktualisieren
socket.on('update', (daten) => {
    zeigeDaten(daten);
});

// Filter-Funktion
document.getElementById("suchfeld").addEventListener("input", function () {
    const filter = this.value.toLowerCase();
    const zeilen = document.querySelectorAll("#liste tr");

    zeilen.forEach(zeile => {
      const text = zeile.textContent.toLowerCase();
      zeile.style.display = text.includes(filter) ? "" : "none";
    });
});