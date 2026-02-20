require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

/* ===== BANCO ===== */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

/* ===== CONFIG UPLOAD ===== */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

/* ===== ATUALIZAR TABELA ===== */
(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS models (
        id SERIAL PRIMARY KEY,
        nome TEXT,
        email TEXT UNIQUE,
        senha TEXT,
        cidade TEXT,
        estado TEXT,
        descricao TEXT,
        whatsapp TEXT,
        foto TEXT,
        views INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("Banco pronto");
  } catch (err) {
    console.error(err);
  }
})();

/* ===== TESTE ===== */
app.get("/api/teste", async (req, res) => {
  res.json({ ok: true });
});

/* ===== CADASTRO ===== */
app.post("/api/register", upload.single("foto"), async (req, res) => {
  try {
    const { nome, email, senha, cidade, estado, descricao, whatsapp } = req.body;

    const hash = await bcrypt.hash(senha, 10);
    const foto = req.file ? "/uploads/" + req.file.filename : null;

    await pool.query(
      `INSERT INTO models
      (nome, email, senha, cidade, estado, descricao, whatsapp, foto)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [nome, email, hash, cidade, estado, descricao, whatsapp, foto]
    );

    res.json({ ok: true });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* ===== LISTAR ===== */
app.get("/api/models", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, nome, cidade, estado, descricao, whatsapp, foto, views FROM models ORDER BY id DESC"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ===== PERFIL INDIVIDUAL ===== */
app.get("/api/model/:id", async (req, res) => {
  try {
    const id = req.params.id;

    await pool.query("UPDATE models SET views = views + 1 WHERE id = $1", [id]);

    const result = await pool.query(
      "SELECT id, nome, cidade, estado, descricao, whatsapp, foto, views FROM models WHERE id = $1",
      [id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ===== SERVIDOR ===== */
app.listen(process.env.PORT || 3000, () => {
  console.log("Servidor rodando");
});