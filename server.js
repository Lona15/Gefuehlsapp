const validCodes = require('./codes.json').map(c => c.toUpperCase());
const express = require('express');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');
const cron = require('node-cron');
const db = require('./db');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// Statische Dateien bereitstellen (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// POST /submit – Wenn ein Kind sein Gefühl abschickt
app.post('/submit', async (req, res) => {
  const { code, gefuehl } = req.body;

  if (!code || !gefuehl) {
    return res.status(400).json({ error: 'Code und Gefühlswert erforderlich' });
  }

  // Großschreibung vereinheitlichen
  const upperCode = code.toUpperCase();

  // Prüfen, ob der Code gültig ist
  if (!validCodes.includes(upperCode)) {
    return res.status(400).json({ error: 'Ungültiger Code' });
  }

  await db.saveGefuehl(upperCode, gefuehl);
  const daten = await db.getAllGefuehle();

  // an alle Admin-Clients senden
  io.emit('update', daten);

  res.json({ success: true });
});

// GET /data – Admin ruft aktuelle Daten ab
app.get('/data', async (req, res) => {
  const daten = await db.getAllGefuehle();
  res.json(daten);
});

// Archivdaten als JSON bereitstellen
app.get('/archivdaten', async (req, res) => {
  const daten = await db.getArchivDatenSortiert();
  res.json(daten);
});


// Server starten
server.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});

// Täglich um 23:59 alle Tagesdaten löschen
cron.schedule('59 23 * * *', async () => {
  console.log('🧹 Tagesdaten werden gelöscht...');
  await db.clearAllGefuehle();
  const daten = await db.getAllGefuehle();
  io.emit('update', daten);                             // Admin-Ansicht aktualisieren
},{
  timezone: 'Europe/Berlin'                             // explizite Zeitzone
});


// DELETE /reset – löscht alle Einträge Adminseite
app.delete('/reset', async (req, res) => {
  await db.clearAllGefuehle();
  const daten = await db.getAllGefuehle();
  io.emit('update', daten); // Live-Update senden
  res.json({ success: true });
});

// DELETE /reset – löscht alle Einträge Archiv 
app.delete('/resetarchiv', async (req, res) => {
  await db.clearAllGefuehlearchiv();
  const daten = await db.getArchivDatenSortiert();
  console.log(daten)
  io.emit('update', daten); // Live-Update senden
  res.json({ success: true });
});