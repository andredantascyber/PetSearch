const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const app = express();

const db = new sqlite3.Database('./database.db');

// Configuração do Multer
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueName + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Middleware
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Criar tabela
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS animais (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    status TEXT CHECK(status IN ('perdido', 'encontrado')) NOT NULL,
    foto TEXT,
    porte TEXT,
    cor TEXT,
    raca TEXT,
    genero TEXT,
    descricao TEXT,
    localizacao TEXT NOT NULL,
    tutor TEXT NOT NULL,
    email TEXT NOT NULL,
    telefone TEXT NOT NULL,
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
  );`);
});

// Rotas API
app.get('/api/animais', (req, res) => {
  const { status, nome, localizacao, porte } = req.query;
  
  if (!status) {
    return res.status(400).json({ error: "Parâmetro 'status' é obrigatório" });
  }

  let sql = 'SELECT * FROM animais WHERE status = ?';
  const params = [status];

  if (nome) {
    sql += ' AND nome LIKE ?';
    params.push(`%${nome}%`);
  }
  if (localizacao) {
    sql += ' AND localizacao LIKE ?';
    params.push(`%${localizacao}%`);
  }
  if (porte) {
    sql += ' AND porte = ?';
    params.push(porte);
  }

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/animais', upload.single('foto'), (req, res) => {
  const { nome, status, porte, cor, raca, genero, descricao, localizacao, tutor, email, telefone } = req.body;
  if (!nome || !status || !localizacao || !tutor || !email || !telefone) {
    return res.status(400).json({ error: "Campos obrigatórios faltando" });
  }
  const foto = req.file ? '/uploads/' + req.file.filename : null;
  const sql = `INSERT INTO animais (
    nome, status, foto, porte, cor, raca, genero,
    descricao, localizacao, tutor, email, telefone
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  db.run(sql, [
    nome, status, foto, porte, cor, raca, genero,
    descricao, localizacao, tutor, email, telefone
  ], function(err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({
      id: this.lastID,
      status: status,
      redirect: status === 'perdido' ? '/perdidos' : '/encontrados'
    });
  });
});

// Rotas HTML
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/perdidos', (req, res) => res.sendFile(path.join(__dirname, 'public', 'perdidos.html')));
app.get('/encontrados', (req, res) => res.sendFile(path.join(__dirname, 'public', 'encontrados.html')));
app.get('/cadastro', (req, res) => res.sendFile(path.join(__dirname, 'public', 'cadastro.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
