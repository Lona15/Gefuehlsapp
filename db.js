const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'gefuehlsdaten.db');
const db = new sqlite3.Database(dbPath);

// Tabelle erstellen, falls sie noch nicht existiert
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS gefuehle (
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
    db.run(
      'INSERT INTO gefuehle (code, gefuehl) VALUES (?, ?)',
      [code, gefuehl],
      function (err) {
        if (err) return reject(err);
        resolve();
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

module.exports = {
  saveGefuehl,
  getAllGefuehle
};

function clearAllGefuehle() {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM gefuehle', [], function (err) {
      if (err) return reject(err);
      resolve();
    });
  });
}

module.exports = {
  saveGefuehl,
  getAllGefuehle,
  clearAllGefuehle // neu!
};