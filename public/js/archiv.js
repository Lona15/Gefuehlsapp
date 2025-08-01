function ladeArchivDaten() {
    fetch('/archivdaten')
      .then(res => res.json())
      .then(daten => {
        const tbody = document.querySelector('#archivTabelle tbody');
        tbody.innerHTML = '';

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

        daten.forEach(eintrag => {
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
          tbody.appendChild(tr);
        });
      });
  }
  
  ladeArchivDaten();

  // Filter einmal aktivieren
  const suchfeld = document.getElementById("suchfeld");
    suchfeld.addEventListener("input", function () {
      const filter = this.value.toLowerCase();
      const zeilen = document.querySelectorAll("#archivTabelle tbody tr");

      zeilen.forEach(zeile => {
        const text = zeile.textContent.toLowerCase();
        zeile.style.display = text.includes(filter) ? "" : "none";
      });
    });

  function resetArchivDaten() {
    if (confirm('Willst du wirklich alle Einträge löschen?')) {
      fetch('/resetarchiv', {
        method: 'DELETE',
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) 
            ladeArchivDaten();
          else {
            alert('Fehler beim Löschen.');
          }
        });
    }
  }


  // Diagramm erstellen 

  function countGefuehle(array) {
    const counts = {};
    array.forEach(g => {
      counts[g] = (counts[g] || 0) + 1;
    });
    return counts;
  }

  const container = document.getElementById('diagramme');

  fetch('/archivdaten')
    .then(res => res.json())
    .then(async daten => {

      const groupedByCode = {};

      daten.forEach(data => {
        if (!groupedByCode[data.code]) {
          groupedByCode[data.code] = [];
        }
        groupedByCode[data.code].push(data.gefuehl);
      });

      const gefuehle_all = await fetch('/gefuehle.json').then(res => res.json())

      Object.entries(groupedByCode).forEach(([code, gefuehle], index) => {
        const counts = countGefuehle(gefuehle);

        const labels = Object.keys(counts);   // Gefühle
        const data = Object.values(counts);   // Anzahl

        // Sucht für jedes Gefühl aus der Datenbank die Farbe aus der gefuehle.json Zeile
        const colors = labels.map(gefuehl => {
          const found = gefuehle_all.find(value => value.id == gefuehl) // value ist immer eine Zeile aus gefuehle.json
          return found.color
        });


        // Create wrapper div
        const chartWrapper = document.createElement('div');
        chartWrapper.id = code; 
        chartWrapper.style.width = '300px';
        chartWrapper.style.height = '300px';

        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.id = `chart_${index}`;
        canvas.width = 300;
        canvas.height = 300;

        chartWrapper.appendChild(canvas);
        container.appendChild(chartWrapper);


        const ctx = canvas.getContext('2d');

        // Create Chart
        new Chart(ctx, {
          type: 'doughnut', // or 'bar', 'pie'
          data: {
            labels: labels,
            datasets: [{
              label: `Gefühle von ${code}`,
              data: data,
              backgroundColor: colors
            }]
          },
          options: {
            plugins: {
              title: {
                display: true,
                text: `Gefühle von ${code}`, // angezeigter Titel des Diagramms
                font: {
                  size: 18
                }
              },
              legend: {
                position: 'top' // Position des Titels
              }
            }
          }
        });
      });

      
    });


// Suchfunktion 
document.getElementById("suchfeld").addEventListener("input", function () {
    const filter = this.value.toLowerCase();
    const zeilen = document.querySelectorAll("#liste tr");

    zeilen.forEach(zeile => {
      const text = zeile.textContent.toLowerCase();
      zeile.style.display = text.includes(filter) ? "" : "none";
    });

    const diagramme = document.querySelectorAll('#diagramme div');

    diagramme.forEach(diagramm => {
      const id = diagramm.id.toLowerCase();
      diagramm.style.display = id.includes(filter) ? "" : "none";
    });
  });