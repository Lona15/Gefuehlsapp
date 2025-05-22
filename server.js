const express = require('express');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');
const db = require('./db');  // dein Datenbankmodul

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT;  // Wichtig: Nur process.env.PORT ohne Default!

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// POST-Route, wenn Kind ein Gefühl abschickt
app.post('/submit', (req, res) => {
  const { code, gefuehl } = req.body;
  if (!code || !gefuehl) {
    return res.status(400).json({ error: 'Code und Gefühlswert erforderlich' });
  }

  db.saveGefuehl(code, gefuehl);

  const daten = db.getAllGefuehle();
  io.emit('update', daten);

  res.json({ success: true });
});

// GET-Route für Lehrkraft, um Daten abzurufen
app.get('/data', (req, res) => {
  const daten = db.getAllGefuehle();
  res.json(daten);
});

// Server startet und hört auf Port von Render
server.listen(PORT, () => {
  console.log('✅ Server läuft auf Port:', PORT);
});
