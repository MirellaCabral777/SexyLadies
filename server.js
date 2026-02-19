require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.get('/', (req,res)=>{
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/api/teste', async (req,res)=>{
  res.json({status:"Servidor funcionando"});
});

app.listen(process.env.PORT || 3000, ()=>{
  console.log("Servidor rodando...");
});
