const express = require("express");
const router = express.Router();
const pool = require("../db");

// Endpoint pentru adăugarea unui student
router.post("/register", async (req, res) => {
  const { numePrenume, email, echipa_proiect } = req.body;

  if (!numePrenume || !email) {
    return res.status(400).json({ message: "Toate câmpurile sunt obligatorii!" });
  }

  try {
    const conn = await pool.getConnection();
    const query = "INSERT INTO student (numePrenume, email, echipa_proiect) VALUES (?, ?, ?)";
    await conn.query(query, [numePrenume, email, echipa_proiect || null]); // Poate fi NULL
    conn.release();
    
    res.status(201).json({ message: "Cont creat cu succes!" });
  } catch (error) {
    console.error("Eroare la crearea contului:", error);
    res.status(500).json({ message: "Eroare la server. Verificați consola." });
  }
});

// Endpoint pentru verificarea autentificării
router.post("/login", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email-ul este obligatoriu!" });
  }

  try {
    const conn = await pool.getConnection();
    const query = "SELECT * FROM student WHERE email = ?";
    const rows = await conn.query(query, [email]);
    conn.release();

    if (rows.length > 0) {
      res.status(200).json({ message: "Autentificare reușită!", user: rows[0] });
    } else {
      res.status(404).json({ message: "Email-ul nu există. Vă rugăm să vă creați un cont." });
    }
  } catch (error) {
    console.error("Eroare la autentificare:", error);
    res.status(500).json({ message: "Eroare la server. Verificați consola." });
  }
});
// Endpoint pentru preluarea echipei unui student
router.get("/team/:email", async (req, res) => {
  const { email } = req.params;

  try {
    const conn = await pool.getConnection();
    const query = "SELECT echipa_proiect FROM student WHERE email = ?";
    const rows = await conn.query(query, [email]);
    conn.release();

    if (rows.length > 0) {
      res.status(200).json({ echipa_proiect: rows[0].echipa_proiect });
    } else {
      res.status(404).json({ message: "Utilizatorul nu există." });
    }
  } catch (error) {
    console.error("Eroare la preluarea echipei:", error);
    res.status(500).json({ message: "Eroare la server. Verificați consola." });
  }
});


// Endpoint pentru preluarea numelui unui student
router.get("/name/:email", async (req, res) => {
  const { email } = req.params;

  try {
    const conn = await pool.getConnection();
    const query = "SELECT numePrenume FROM student WHERE email = ?";
    const rows = await conn.query(query, [email]);
    conn.release();

    if (rows.length > 0) {
      res.status(200).json({ numePrenume: rows[0].numePrenume });
    } else {
      res.status(404).json({ message: "Utilizatorul nu există." });
    }
  } catch (error) {
    console.error("Eroare la preluarea numelui:", error);
    res.status(500).json({ message: "Eroare la server. Verificați consola." });
  }
});

// Endpoint pentru preluarea student_id după email
router.get("/info/:email", async (req, res) => {
  const { email } = req.params;

  try {
    const conn = await pool.getConnection();
    const query = "SELECT id FROM student WHERE email = ?";
    const rows = await conn.query(query, [email]);
    conn.release();

    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: "Studentul nu a fost găsit!" });
    }
  } catch (error) {
    console.error("Eroare la preluarea student_id:", error);
    res.status(500).json({ message: "Eroare la server" });
  }
});



module.exports = router;
