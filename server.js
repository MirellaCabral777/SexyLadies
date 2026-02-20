const express = require("express");
const path = require("path");

const app = express();

// 🔥 ESSA LINHA É O QUE FAZ FUNCIONAR
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/teste", (req, res) => {
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});