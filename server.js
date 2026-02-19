require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Criar tabela completa
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
      maior18 BOOLEAN,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
})();

// Cadastro
app.post("/api/register", async (req, res) => {
  const { nome, email, senha, cidade, estado, descricao, whatsapp, maior18 } = req.body;

  if (!maior18) {
    return res.status(400).json({ error: "Obrigatório ser maior de 18 anos" });
  }

  const hash = await bcrypt.hash(senha, 10);

  try {
    await pool.query(
      `INSERT INTO models(nome,email,senha,cidade,estado,descricao,whatsapp,maior18)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8)`,
      [nome, email, hash, cidade, estado, descricao, whatsapp, maior18]
    );

    res.json({ ok: true });

  } catch (err) {
    res.status(400).json({ error: "Email já cadastrado" });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Servidor rodando...");
});
