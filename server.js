const multer = require("multer");
const path = require("path");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

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

/* Atualiza estrutura da tabela */
(async () => {
  try {
    await pool.query(`
      ALTER TABLE models
      ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;
    `);
    console.log("Coluna views pronta");
  } catch (err) {
    console.error(err);
  }
})();

/* CADASTRO */
app.post("/api/register", upload.single("foto"), async (req, res) => {
  try {
    const { nome, email, senha, cidade, estado, descricao, whatsapp, maior18 } = req.body;

    if (!maior18) {
      return res.status(400).json({ error: "Obrigatório ser maior de 18 anos" });
    }

    const hash = await bcrypt.hash(senha, 10);

    const foto = req.file ? "/uploads/" + req.file.filename : null;

    await pool.query(
      `INSERT INTO models
      (nome, email, senha, cidade, estado, descricao, whatsapp, maior18, foto)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [nome, email, hash, cidade, estado, descricao, whatsapp, maior18, foto]
    );

    res.json({ ok: true });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

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
    res.status(400).json({ error: err.message });
  }
});

/* LISTAR */
app.get("/api/models", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, nome, cidade, estado, descricao, whatsapp, views FROM models ORDER BY id DESC"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* BUSCAR PERFIL + SOMAR VISUALIZAÇÃO */
app.get("/api/model/:id", async (req, res) => {
  try {
    const id = req.params.id;

    await pool.query("UPDATE models SET views = views + 1 WHERE id = $1", [id]);

    const result = await pool.query(
      "SELECT id, nome, cidade, estado, descricao, whatsapp, views FROM models WHERE id = $1",
      [id]
    );

    res.json(result.rows[0]);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Servidor rodando...");
});
