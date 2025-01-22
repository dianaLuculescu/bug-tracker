const express = require("express");
const router = express.Router();
const pool = require("../db");

// Endpoint pentru adăugarea unui proiect cu verificarea echipei
router.post("/add", async (req, res) => {
  const { repository_proiect, nume_echipa, email } = req.body;

  if (!repository_proiect || !nume_echipa || !email) {
    return res.status(400).json({ message: "Toate câmpurile sunt obligatorii!" });
  }

  try {
    const conn = await pool.getConnection();

    // Verificăm echipa utilizatorului logat
    const studentQuery = "SELECT echipa_proiect FROM student WHERE email = ?";
    const studentResult = await conn.query(studentQuery, [email]);

    if (studentResult.length === 0) {
      conn.release();
      return res.status(404).json({ message: "Utilizatorul nu există." });
    }

    const echipaUtilizator = studentResult[0].echipa_proiect;

    // Comparăm echipa utilizatorului cu echipa introdusă
    if (echipaUtilizator !== nume_echipa) {
      conn.release();
      return res.status(403).json({ message: "Numele echipei nu corespunde cu cel al utilizatorului!" });
    }

    // Adăugăm proiectul în baza de date
    const insertQuery = "INSERT INTO proiect (repository_proiect, nume_echipa) VALUES (?, ?)";
    await conn.query(insertQuery, [repository_proiect, nume_echipa]);
    conn.release();

    res.status(201).json({ message: "Proiect adăugat cu succes!" });

  } catch (error) {
    console.error("Eroare la adăugarea proiectului:", error);
    res.status(500).json({ message: "Eroare la server. Verificați consola." });
  }
});

// Endpoint pentru obținerea tuturor proiectelor
router.get("/all", async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const query = "SELECT * FROM proiect";
    const rows = await conn.query(query);
    conn.release();

    res.status(200).json(rows);
  } catch (error) {
    console.error("Eroare la obținerea proiectelor:", error);
    res.status(500).json({ message: "Eroare la server. Verificați consola." });
  }
});

router.post("/add-tester", async (req, res) => {
  const { email, proiect_id } = req.body;

  if (!email || !proiect_id) {
    return res.status(400).json({ message: "Date incomplete!" });
  }

  try {
    const conn = await pool.getConnection();

    // Verificăm echipa utilizatorului logat
    const studentQuery = "SELECT echipa_proiect FROM student WHERE email = ?";
    const studentResult = await conn.query(studentQuery, [email]);

    if (studentResult.length === 0) {
      conn.release();
      return res.status(404).json({ message: "Utilizatorul nu există." });
    }

    const echipaUtilizator = studentResult[0].echipa_proiect;

    // Verificăm echipa proiectului
    const projectQuery = "SELECT nume_echipa FROM proiect WHERE id = ?";
    const projectResult = await conn.query(projectQuery, [proiect_id]);

    if (projectResult.length === 0) {
      conn.release();
      return res.status(404).json({ message: "Proiectul nu există." });
    }

    const echipaProiect = projectResult[0].nume_echipa;

    // Comparăm echipa utilizatorului cu echipa proiectului
    if (echipaUtilizator === echipaProiect) {
      conn.release();
      return res.status(403).json({ message: "Ești membru al acestui proiect și nu poți deveni tester!" });
    }

    // Verificăm dacă utilizatorul este deja tester pentru acest proiect
    const checkTesterQuery = "SELECT * FROM tester_proiect WHERE student_email = ? AND proiect_id = ?";
    const testerResult = await conn.query(checkTesterQuery, [email, proiect_id]);

    if (testerResult.length > 0) {
      conn.release();
      return res.status(400).json({ message: "Ești deja tester la acest proiect!" });
    }

    // Adăugăm testerul în baza de date
    const insertQuery = "INSERT INTO tester_proiect (student_email, proiect_id) VALUES (?, ?)";
    await conn.query(insertQuery, [email, proiect_id]);
    conn.release();

    res.status(201).json({ message: "Acum ești tester pentru acest proiect!" });

  } catch (error) {
    console.error("Eroare la adăugarea testerului:", error);
    res.status(500).json({ message: "Eroare la server. Verificați consola." });
  }
});

// 🔹 Endpoint pentru proiectele unde utilizatorul este MP
router.get("/mp/:email", async (req, res) => {
  const { email } = req.params;

  try {
    const conn = await pool.getConnection();
    const query = `
      SELECT * FROM proiect 
      WHERE nume_echipa = (SELECT echipa_proiect FROM student WHERE email = ?)`;
    const rows = await conn.query(query, [email]);
    conn.release();

    res.json(rows);
  } catch (error) {
    console.error("Eroare la preluarea proiectelor MP:", error);
    res.status(500).json({ message: "Eroare la server" });
  }
});

// 🔹 Endpoint pentru proiectele unde utilizatorul este TST
router.get("/tst/:email", async (req, res) => {
  const { email } = req.params;

  try {
    const conn = await pool.getConnection();
    const query = `
      SELECT p.* FROM proiect p
      JOIN tester_proiect t ON p.id = t.proiect_id
      WHERE t.student_email = ?`;
    const rows = await conn.query(query, [email]);
    conn.release();

    res.json(rows);
  } catch (error) {
    console.error("Eroare la preluarea proiectelor TST:", error);
    res.status(500).json({ message: "Eroare la server" });
  }
});

module.exports = router;
