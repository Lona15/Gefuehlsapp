const express = require('express');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');
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

  await db.saveGefuehl(code, gefuehl);
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

// Server starten
server.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});

