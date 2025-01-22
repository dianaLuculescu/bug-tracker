import React, { useState } from "react";
import axios from "axios";

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [numePrenume, setNumePrenume] = useState("");
  const [echipaProiect, setEchipaProiect] = useState("");

  const handleLogin = () => {
    onLogin(email);
  };

  const handleRegister = async () => {
    if (!numePrenume || !email) {
      alert("Toate câmpurile sunt obligatorii, exceptând echipa!");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/students/register", {
        numePrenume,
        email,
        echipa_proiect: echipaProiect.trim() || null
      });

      alert(response.data.message);
      setIsRegistering(false);
    } catch (error) {
      console.error("Eroare la înregistrare:", error);
      alert("Eroare la înregistrare. Verificați consola.");
    }
  };

  return (
    <div className="login-box">
      {isRegistering ? (
        <>
          <h2>Creare Cont</h2>
          <input
            type="text"
            placeholder="Nume și Prenume"
            value={numePrenume}
            onChange={(e) => setNumePrenume(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="text"
            placeholder="Numele echipei (opțional)"
            value={echipaProiect}
            onChange={(e) => setEchipaProiect(e.target.value)}
          />
          <button onClick={handleRegister}>Creează cont</button>
          <button onClick={() => setIsRegistering(false)}>Înapoi la login</button>
        </>
      ) : (
        <>
          <h2>Autentificare</h2>
          <input
            type="email"
            placeholder="Introduceți email-ul"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button onClick={handleLogin}>Login</button>
          <p>Nu ai cont?</p>
          <button onClick={() => setIsRegistering(true)}>Creează cont</button>
        </>
      )}
    </div>
  );
};

export default Login; 