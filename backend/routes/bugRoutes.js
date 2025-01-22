const express = require("express");
const router = express.Router();
const pool = require("../db");

// 🔹 Endpoint pentru adăugarea unui bug
router.post("/add", async (req, res) => {
  const { proiect_id, student_email, severitate, prioritate, descriere, link_commit } = req.body;

  if (!proiect_id || !student_email || !severitate || !prioritate || !descriere || !link_commit) {
    return res.status(400).json({ message: "Toate câmpurile sunt obligatorii!" });
  }

  try {
    const conn = await pool.getConnection();
    const query = `
      INSERT INTO bug (proiect_id, student_email, severitate, prioritate, descriere, link_commit) 
      VALUES (?, ?, ?, ?, ?, ?)`;
    await conn.query(query, [proiect_id, student_email, severitate, prioritate, descriere, link_commit]);
    conn.release();

    res.status(201).json({ message: "Bug înregistrat cu succes!" });
  } catch (error) {
    console.error("Eroare la înregistrarea bug-ului:", error);
    res.status(500).json({ message: "Eroare la server" });
  }
});

// Endpoint pentru bug-urile unui proiect specific
router.get("/project/:proiect_id", async (req, res) => {
  const { proiect_id } = req.params;

  try {
    const conn = await pool.getConnection();
    const query = `
      SELECT * FROM bug WHERE proiect_id = ?`;
    const rows = await conn.query(query, [proiect_id]);
    conn.release();

    res.json(rows);
  } catch (error) {
    console.error("Eroare la preluarea bug-urilor:", error);
    res.status(500).json({ message: "Eroare la server" });
  }
});


// Endpoint pentru alocarea unui bug
// Endpoint pentru alocarea unui bug unui MP
router.post("/assign", async (req, res) => {
  const { bug_id, student_email } = req.body;

  try {
    const conn = await pool.getConnection();

    // Verificăm dacă studentul există și luăm ID-ul său
    const studentQuery = "SELECT id FROM student WHERE email = ?";
    const studentResult = await conn.query(studentQuery, [student_email]);

    if (studentResult.length === 0) {
      conn.release();
      return res.status(404).json({ message: "Studentul nu a fost găsit!" });
    }

    const student_id = studentResult[0].id;

    // Verificăm dacă bug-ul este deja alocat
    const checkQuery = "SELECT * FROM rezolvare WHERE bug_id = ?";
    const checkResult = await conn.query(checkQuery, [bug_id]);

    if (checkResult.length > 0) {
      conn.release();
      return res.status(400).json({ message: "Acest bug este deja alocat unui MP!" });
    }

    // Alocăm bug-ul studentului
    const insertQuery = "INSERT INTO rezolvare (bug_id, student_id) VALUES (?, ?)";
    await conn.query(insertQuery, [bug_id, student_id]);

    conn.release();
    res.status(201).json({ message: "Bug-ul a fost alocat cu succes!" });
  } catch (error) {
    console.error("Eroare la alocarea bug-ului:", error);
    res.status(500).json({ message: "Eroare la server. Verificați consola." });
  }
});

// Endpoint pentru obținerea rezolvărilor alocate unui MP
router.get("/assigned/:student_email", async (req, res) => {
  const { student_email } = req.params;

  try {
    const conn = await pool.getConnection();

    // Căutăm ID-ul studentului
    const studentQuery = "SELECT id FROM student WHERE email = ?";
    const studentResult = await conn.query(studentQuery, [student_email]);

    if (studentResult.length === 0) {
      conn.release();
      return res.status(404).json({ message: "Studentul nu a fost găsit!" });
    }

    const student_id = studentResult[0].id;

    // Căutăm toate bug-urile alocate utilizatorului
    const query = `
      SELECT b.id, b.link_commit
      FROM rezolvare r
      JOIN bug b ON r.bug_id = b.id
      WHERE r.student_id = ?`;

    const result = await conn.query(query, [student_id]);
    conn.release();

    res.json(result);
  } catch (error) {
    console.error("Eroare la preluarea rezolvărilor:", error);
    res.status(500).json({ message: "Eroare la server. Verificați consola." });
  }
});

// Endpoint pentru adăugarea unei rezolvări și ștergerea bug-ului
router.post("/resolve", async (req, res) => {
  const { bug_id } = req.body;

  try {
    const conn = await pool.getConnection();

    // Ștergem întâi din tabela rezolvare
    await conn.query("DELETE FROM rezolvare WHERE bug_id = ?", [bug_id]);

    // Ștergem bug-ul
    await conn.query("DELETE FROM bug WHERE id = ?", [bug_id]);

    conn.release();
    res.status(200).json({ message: "Rezolvarea a fost înregistrată și bug-ul a fost eliminat." });
  } catch (error) {
    console.error("Eroare la rezolvarea bug-ului:", error);
    res.status(500).json({ message: "Eroare la server. Verificați consola." });
  }
});


module.exports = router;
