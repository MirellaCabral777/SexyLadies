const express = require("express");
const { Pool } = require("pg");
const path = require("path");

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// Conexão com banco
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ==========================
// ROTA TESTE
// ==========================
app.get("/api/teste", (req, res) => {
  res.json({ ok: true });
});

// ==========================
// CRIAR TABELA (usar 1 vez)
// ==========================
app.get("/api/setup", async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS modelos (
        id SERIAL PRIMARY KEY,
        nome TEXT NOT NULL,
        descricao TEXT
      );
    `);

    res.send("Tabela criada com sucesso ✅");
  } catch (err) {
    console.error("Erro ao criar tabela:", err);
    res.status(500).send("Erro ao criar tabela");
  }
});

// ==========================
// INSERIR MODELO (TESTE)
// ==========================
app.get("/api/teste-insert", async (req, res) => {
  try {
    await pool.query(
      "INSERT INTO modelos (nome, descricao) VALUES ($1, $2)",
      ["Modelo Teste", "Descrição de teste"]
    );

    res.send("Inserido com sucesso ✅");
  } catch (err) {
    console.error("Erro ao inserir:", err);
    res.status(500).send("Erro ao inserir");
  }
});

// ==========================
// LISTAR MODELOS
// ==========================
app.get("/api/models", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, nome, descricao FROM modelos ORDER BY id DESC"
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Erro ao buscar modelos:", err);
    res.status(500).json({ error: "Erro ao buscar modelos" });
  }
});

// ==========================
// CADASTRAR MODELO (FORM)
// ==========================
app.post("/api/cadastro", async (req, res) => {
  const { nome, descricao } = req.body;

  if (!nome) {
    return res.status(400).json({ error: "Nome é obrigatório" });
  }

  try {
    await pool.query(
      "INSERT INTO modelos (nome, descricao) VALUES ($1, $2)",
      [nome, descricao]
    );

    res.json({ sucesso: true });
  } catch (err) {
    console.error("Erro ao cadastrar:", err);
    res.status(500).json({ error: "Erro ao cadastrar" });
  }
});

// ==========================
// START SERVIDOR
// ==========================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});