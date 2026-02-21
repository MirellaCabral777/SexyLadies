const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const SECRET = "segredo_super_forte_123";
const express = require("express");
const { Pool } = require("pg");
const path = require("path");
const multer = require("multer");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static("uploads"));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// CONFIG UPLOAD
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

// ==========================
// CADASTRO COMPLETO
// ==========================
app.post("/api/cadastro", upload.single("foto"), async (req, res) => {
  const {
    nome,
    email,
    const senhaCriptografada = await bcrypt.hash(senha, 10);
    cidade,
    estado,
    descricao,
    whatsapp
  } = req.body;

  const foto = req.file ? "/uploads/" + req.file.filename : null;

  try {
    await pool.query(
      `INSERT INTO modelos 
      (nome, email, senha, cidade, estado, descricao, whatsapp, foto) 
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
     [ nome, email, senhaCriptografada, cidade, estado, descricao, whatsapp, foto ]
    );

    res.json({ sucesso: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao cadastrar" });
  }
});

// ==========================
// LISTAR MODELOS
// ==========================
app.get("/api/models", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, nome, cidade, estado, descricao, whatsapp, foto 
       FROM modelos ORDER BY id DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar modelos" });
  }
});

const PORT = process.env.PORT || 3000;
app.post("/api/login", async (req, res) => {
  const { email, senha } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM modelos WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Usuário não encontrado" });
    }

    const usuario = result.rows[0];

    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(400).json({ error: "Senha incorreta" });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro no login" });
  }
});
// ==========================
// MIDDLEWARE DE AUTENTICAÇÃO
// ==========================
function autenticar(req, res, next) {

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Token não enviado" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET);
    req.usuario = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido" });
  }
}
// ==========================
// ROTA PROTEGIDA (PERFIL)
// ==========================
app.get("/api/perfil", autenticar, async (req, res) => {

  try {
    const result = await pool.query(
      "SELECT id, nome, email FROM modelos WHERE id = $1",
      [req.usuario.id]
    );

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar perfil" });
  }

});
app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});