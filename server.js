require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Criar tabela se não existir
(async () => {
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
      premium BOOLEAN DEFAULT false,
      ativa BOOLEAN DEFAULT false,
      visualizacoes INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
})();

// CADASTRO
app.post("/api/register", async (req, res) => {
  const { nome, email, senha, cidade, estado, descricao, whatsapp, maior18 } = req.body;

  if (!maior18) {
    return res.status(400).json({ error: "É obrigatório ser maior de 18 anos." });
  }

  const hash = await bcrypt.hash(senha, 10);

  try {
    await pool.query(
      `INSERT INTO models(nome,email,senha,cidade,estado,descricao,whatsapp)
       VALUES($1,$2,$3,$4,$5,$6,$7)`,
      [nome, email, hash, cidade, estado, descricao, whatsapp]
    );

    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: "Email já cadastrado." });
  }
});

// LOGIN
app.post("/api/login", async (req, res) => {
  const { email, senha } = req.body;

  const result = await pool.query(
    "SELECT * FROM models WHERE email=$1",
    [email]
  );

  if (result.rows.length === 0) {
    return res.status(400).json({ error: "Usuário não encontrado" });
  }

  const user = result.rows[0];
  const match = await bcrypt.compare(senha, user.senha);

  if (!match) {
    return res.status(400).json({ error: "Senha incorreta" });
  }

  const token = jwt.sign({ id: user.id }, "segredo_super");

  res.json({ token });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Servidor rodando...");
});
