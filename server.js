require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

/* =========================
   TESTE BANCO
========================= */
app.get("/api/teste", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ ok: true, hora: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   CADASTRO MODELO
========================= */
app.post("/api/register", async (req, res) => {
  try {
    const { nome, email, senha, cidade, estado, descricao, whatsapp, maior18 } = req.body;

    if (!maior18) {
      return res.status(400).json({ error: "Obrigatório ser maior de 18 anos" });
    }

    const hash = await bcrypt.hash(senha, 10);

    await pool.query(
      `INSERT INTO models
      (nome, email, senha, cidade, estado, descricao, whatsapp, maior18)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [nome, email, hash, cidade, estado, descricao, whatsapp, maior18]
    );

    res.json({ ok: true });

  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Erro ao cadastrar (email pode já existir)" });
  }
});

/* =========================
   LISTAR MODELOS
========================= */
app.get("/api/models", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, nome, cidade, estado, descricao, whatsapp FROM models ORDER BY id DESC"
    );

    res.json(result.rows);

  } catch (err) {
    console.error("Erro ao buscar modelos:", err);
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   SERVIDOR
========================= */
app.listen(process.env.PORT || 3000, () => {
  console.log("Servidor rodando...");
});
