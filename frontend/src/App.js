import React, { useState } from "react";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [studenti, setStudenti] = useState([]);
  const [proiecte, setProiecte] = useState([]);

  return (
    <div className="container">
      <h1>Bug Tracker</h1>
      {!user ? (
        <Login onLogin={setUser} studenti={studenti} setStudenti={setStudenti} />
      ) : (
        <Dashboard user={user} proiecte={proiecte} setProiecte={setProiecte} />
      )}
    </div>
  );
}

export default App;
