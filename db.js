const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'gefuehlsdaten.db');
const db = new sqlite3.Database(dbPath);

// Tabelle erstellen, falls sie noch nicht existiert - NEU: Archiv-Tabelle
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS archiv_gefuehle (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL,
      gefuehl TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

// Neues Gefühl speichern (INSERT)
function saveGefuehl(code, gefuehl) {
  return new Promise((resolve, reject) => {
    // Gefühl zuerst in Live Tabelle speichern
    db.run(
      'INSERT INTO gefuehle (code, gefuehl) VALUES (?, ?)',
      [code, gefuehl],
      function (err) {
        if (err) return reject(err);

        // Gefühl zusätzlich in Archiv Tabelle speichern
        db.run(
          'INSERT INTO archiv_gefuehle (code, gefuehl) VALUES (?, ?)',
          [code, gefuehl],
          function (err2) {
            if (err2) return reject(err2);
        resolve();
      }
    );
  }
);
});
}

// Alle aktuellen Gefühle abrufen (letzter Eintrag pro Code)
function getAllGefuehle() {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT code, gefuehl, timestamp
      FROM gefuehle
      ORDER BY timestamp DESC
    `;

    db.all(sql, [], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}


// Archiv-Daten sortiert abrufen
function getArchivDatenSortiert() {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT code, gefuehl, timestamp
      FROM archiv_gefuehle
      ORDER BY code ASC, timestamp DESC
    `;

    db.all(sql, [], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

function clearAllGefuehle() {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM gefuehle', [], function (err) {
      if (err) return reject(err);
      resolve();
    });
  });
}

function clearAllGefuehlearchiv() {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM archiv_gefuehle', [], function (err) {
      if (err) return reject(err);
      resolve();
    });
  });
}

module.exports = {
  saveGefuehl,
  getAllGefuehle,
  clearAllGefuehle,
  getArchivDatenSortiert,
  clearAllGefuehlearchiv // neu!
};