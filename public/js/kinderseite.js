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
        var popup = document.getElementById("popup"); // Popup laden
        popup.style.display = "block";

      } else {
        alert('Fehler beim senden. Überprüfe deinen Code.');
      }
    });
}

function handleReden(willReden) {
  const code = document.getElementById('code').value.trim();

  fetch('/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, willReden }),
  })
    .then((res) =>res.json())
    .then((data) => {
      if (data.success) {
        var popup = document.getElementById("popup");
        popup.style.display = "none";

      } else {
        alert('Fehler beim senden. Wende dich an Frau Schreiber.');
      }
    });
} 