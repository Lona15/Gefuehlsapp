// Für Kinderansicht
if (document.getElementById('gefuehlListe')) {
    fetch('/gefuehle.json')
      .then((res) => res.json())
      .then((gefuehle) => {
        const liste = document.getElementById('gefuehlListe');
        gefuehle.forEach((g) => {
          const el = document.createElement('div');
          el.className = 'gefuehl';
          el.innerHTML = `<div>${g.bild}</div><div>${g.text}</div>`;
          el.onclick = () => senden(g.id);
          liste.appendChild(el);
        });
      });
  
    function senden(gefuehl) {
      const code = document.getElementById('code').value.trim();
      if (!code) {
        alert('Bitte gib deinen Code ein!');
        return;
      }
  
      fetch('/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, gefuehl }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            alert('Danke! Dein Gefühl wurde gesendet.');
          } else {
            alert('Fehler beim senden. Überprüfe deinen Code.');
          }
        });
    }
  }
  // Für Admin-Ansicht
if (document.getElementById('liste')) {
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
  
    // Wenn neue Daten per WebSocket kommen: aktualisieren
    socket.on('update', (daten) => {
      zeigeDaten(daten);
    });
  }

