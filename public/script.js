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
        alert('Bitte gib deinen Zahlencode ein!');
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
            alert('Fehler beim Senden.');
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
    
      const codesMarkiert = new Set(); // Zum Merken, welche Codes schon markiert sind
    
      daten.forEach((eintrag) => {
        // Prüfen, ob Code schon markiert wurde
        const istLetzter = !codesMarkiert.has(eintrag.code);
    
        if (istLetzter) {
          codesMarkiert.add(eintrag.code);
        }
    
        const tr = document.createElement('tr');
    
        // CSS-Klasse für Hervorhebung nur beim letzten Eintrag je Code
        tr.className = istLetzter ? 'highlight' : '';
    
        const zeit = new Date(eintrag.timestamp).toLocaleString('de-DE', {
          timeZone: 'Europe/Berlin',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
    
        tr.innerHTML = `
          <td>${eintrag.code}</td>
          <td>${eintrag.gefuehl}</td>
          <td>${zeit}</td>
        `;
    
        tabelle.appendChild(tr);
      });
    }
  
    // Beim ersten Laden: aktuelle Daten holen
    ladeDaten();
  
    // Wenn neue Daten per WebSocket kommen: aktualisieren
    socket.on('update', (daten) => {
      zeigeDaten(daten);
    });
  }
    // Event-Listener für "Alle löschen"-Button
    const resetButton = document.getElementById('resetButton');
    if (resetButton) {
      resetButton.addEventListener('click', () => {
        const bestaetigt = confirm('Möchtest du wirklich ALLE Einträge löschen?');
  
        if (!bestaetigt) return;
  
        fetch('/reset', { method: 'DELETE' })
          .then(res => res.json())
          .then(() => ladeDaten()); // Nach dem Löschen neu laden
      });
    }
  