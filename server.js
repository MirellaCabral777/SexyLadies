const express = require("express");
const { Pool } = require("pg");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔥 IMPORTANTE — servir arquivos da pasta public
app.use(express.static(path.join(__dirname, "public")));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// ✅ Rota API modelos
app.get("/api/models", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, nome, descricao FROM modelos ORDER BY id DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar modelos" });
  }
});

// ✅ Rota cadastro
app.post("/api/cadastro", async (req, res) => {
  const { nome, descricao } = req.body;

  try {
    await pool.query(
      "INSERT INTO modelos (nome, descricao) VALUES ($1, $2)",
      [nome, descricao]
    );
    res.json({ sucesso: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao cadastrar" });
  }
});

// 🚀 Porta obrigatória do Render
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});