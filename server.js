const Database = require('better-sqlite3');
const db = new Database('datenbank.db');

// Tabelle erstellen (wenn nicht vorhanden)
db.prepare(`
  CREATE TABLE IF NOT EXISTS eintraege (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL,
    gefuehl TEXT NOT NULL,
    timestamp TEXT NOT NULL
  )
`).run();

function saveGefuehl(code, gefuehl) {
  const timestamp = new Date().toISOString();
  const stmt = db.prepare('INSERT INTO eintraege (code, gefuehl, timestamp) VALUES (?, ?, ?)');
  stmt.run(code, gefuehl, timestamp);
}

function getAllGefuehle() {
  const stmt = db.prepare('SELECT code, gefuehl, timestamp FROM eintraege ORDER BY timestamp DESC');
  return stmt.all();
}

module.exports = {
  saveGefuehl,
  getAllGefuehle
};
