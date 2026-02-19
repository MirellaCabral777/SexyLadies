require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

app.use('/uploads', express.static('uploads'));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS perfis (
      id SERIAL PRIMARY KEY,
      nome TEXT,
      cidade TEXT,
      estado TEXT,
      descricao TEXT,
      whatsapp TEXT,
      imagem TEXT,
      visualizacoes INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
})();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

app.post('/api/perfis', upload.single('imagem'), async (req, res) => {
  const { nome, cidade, estado, descricao, whatsapp } = req.body;
  const imagem = req.file ? `/uploads/${req.file.filename}` : null;

  await pool.query(
    `INSERT INTO perfis(nome,cidade,estado,descricao,whatsapp,imagem)
     VALUES($1,$2,$3,$4,$5,$6)`,
    [nome, cidade, estado, descricao, whatsapp, imagem]
  );

  res.json({ ok: true });
});

app.get('/api/perfis', async (req, res) => {
  const result = await pool.query('SELECT * FROM perfis ORDER BY created_at DESC');
  res.json(result.rows);
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Servidor rodando...');
});
