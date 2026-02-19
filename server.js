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

// Criar tabela
(async () => {
  try {
    await pool.query(`
      ALTER TABLE models
      ADD COLUMN IF NOT EXISTS email TEXT,
      ADD COLUMN IF NOT EXISTS senha TEXT,
      ADD COLUMN IF NOT EXISTS cidade TEXT,
      ADD COLUMN IF NOT EXISTS estado TEXT,
      ADD COLUMN IF NOT EXISTS descricao TEXT,
      ADD COLUMN IF NOT EXISTS whatsapp TEXT,
      ADD COLUMN IF NOT EXISTS maior18 BOOLEAN,
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
    `);
    console.log("Tabela models atualizada");
  } catch (err) {
    console.error("Erro atualizando tabela:", err);
  }
})();


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

// LISTAR MODELOS
app.get("/api/models", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, nome, cidade, estado, descricao, whatsapp FROM models ORDER BY id DESC"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar modelos" });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Servidor rodando...");
});
