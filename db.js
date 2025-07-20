const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'gefuehlsdaten.db');
const db = new sqlite3.Database(dbPath);

// Tabelle erstellen, falls sie noch nicht existiert - NEU: Archiv-Tabelle
db.serialize(() => {
  db.run(`DROP TABLE IF EXISTS gefuehle`);
  db.run(`DROP TABLE IF EXISTS archiv_gefuehle`);

  db.run(`
    CREATE TABLE IF NOT EXISTS gefuehle (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL,
      gefuehl TEXT NOT NULL,
      reden BOOLEAN NOT NULL DEFAULT FALSE,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS archiv_gefuehle (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL,
      gefuehl TEXT NOT NULL,
      reden BOOLEAN NOT NULL DEFAULT FALSE,
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

// Gefühl aktualiseieren bei Angabe des Redebedarfs
function updateGefuehl(code, willReden) {
  return new Promise((resolve, reject) => {
    // Gefühl zuerst in Live Tabelle speichern
    db.run(
      'UPDATE gefuehle SET reden = ? WHERE id = (SELECT id FROM gefuehle WHERE code = ? ORDER BY timestamp DESC LIMIT 1);',
      [willReden, code],
      function (err) {
        if (err) return reject(err);

        // Gefühl zusätzlich in Archiv Tabelle speichern
        db.run(
          'UPDATE archiv_gefuehle SET reden = ? WHERE id = (SELECT id FROM archiv_gefuehle WHERE code = ? ORDER BY timestamp DESC LIMIT 1);',
          [willReden, code],
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
      SELECT code, gefuehl, timestamp, reden
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
      SELECT code, gefuehl, timestamp, reden
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
  clearAllGefuehlearchiv,
  updateGefuehl, // neu!
};