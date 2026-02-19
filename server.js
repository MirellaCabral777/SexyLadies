require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Testar conexão banco
app.get("/api/teste", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ ok: true, hora: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Erro banco", detalhe: err.message });
  }
});

// Criar tabela models
(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS models (
        id SERIAL PRIMARY KEY,
        nome TEXT
      );
    `);
    console.log("Tabela criada/verificada");
  } catch (err) {
    console.log("Erro ao criar tabela:", err.message);
  }
})();

app.listen(process.env.PORT || 3000, () => {
  console.log("Servidor rodando...");
});
