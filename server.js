const express = require("express");
const path = require("path");

const app = express();

// servir arquivos da pasta public
app.use(express.static(path.join(__dirname, "public")));

// teste simples
app.get("/api/teste", (req, res) => {
  res.json({ ok: true });
});

// 🔥 ESSA LINHA É OBRIGATÓRIA NO RENDER
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});