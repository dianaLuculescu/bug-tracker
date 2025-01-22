import React, { useState, useEffect } from "react";
import axios from "axios";

const Dashboard = ({ user }) => {
  const [showForm, setShowForm] = useState(false);
  const [repo, setRepo] = useState("");
  const [echipa, setEchipa] = useState("");
  const [proiecte, setProiecte] = useState([]);
  const [echipaUser, setEchipaUser] = useState(null);
  const [proiecteMP, setProiecteMP] = useState([]);
  const [proiecteTST, setProiecteTST] = useState([]);
  const [view, setView] = useState("all"); // Vizualizarea curentă // Stocăm echipa utilizatorului

  const [selectedProject, setSelectedProject] = useState(null);
  const [severitate, setSeveritate] = useState("");
  const [prioritate, setPrioritate] = useState("");
  const [descriere, setDescriere] = useState("");
  const [commitLink, setCommitLink] = useState("");

  const [selectedBugs, setSelectedBugs] = useState([]); // Bug-urile proiectului selectat
  const [selectedProjectName, setSelectedProjectName] = useState(""); 

  const [rezolvariAlocate, setRezolvariAlocate] = useState([]);

  const [selectedBugForResolve, setSelectedBugForResolve] = useState(null);
  const [commitSolution, setCommitSolution] = useState("");
  

  useEffect(() => {
    fetchProiecte();
    fetchEchipaUser();
  }, []);

  // Funcție pentru preluarea proiectelor din baza de date
  const fetchProiecte = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/projects/all");
      setProiecte(response.data);
      setView("all");
    } catch (error) {
      console.error("Eroare la preluarea proiectelor:", error);
    }
  };

  // Funcție pentru preluarea echipei utilizatorului logat
  const fetchEchipaUser = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/students/team/${user}`);
      setEchipaUser(response.data.echipa_proiect);
    } catch (error) {
      console.error("Eroare la preluarea echipei utilizatorului:", error);
    }
  };

 

  // Preluăm proiectele unde utilizatorul este MP
  const fetchProiecteMP = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/projects/mp/${user}`);
      setProiecteMP(response.data);
      setView("mp");
    } catch (error) {
      console.error("Eroare la preluarea proiectelor MP:", error);
    }
  };

  // Preluăm proiectele unde utilizatorul este TST
  const fetchProiecteTST = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/projects/tst/${user}`);
      setProiecteTST(response.data);
      setView("tst");
    } catch (error) {
      console.error("Eroare la preluarea proiectelor TST:", error);
    }
  };

  const fetchBugsForProject = async (proiect_id, proiect_name) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/bugs/project/${proiect_id}`);
      setSelectedBugs(response.data);
      setSelectedProjectName(proiect_name);
      setView("bugs");
    } catch (error) {
      console.error("Eroare la preluarea bug-urilor proiectului:", error);
    }
  };

  // Funcție pentru adăugarea unui proiect nou cu verificarea echipei
  const handleAdaugaProiect = async () => {
    if (!repo || !echipa) {
      alert("Completați toate câmpurile!");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/projects/add", {
        repository_proiect: repo,
        nume_echipa: echipa,
        email: user
      });

      alert(response.data.message);
      fetchProiecte();
      setShowForm(false);
      setRepo("");
      setEchipa("");
    } catch (error) {
      if (error.response && error.response.status === 403) {
        alert("Numele echipei nu corespunde cu cel al utilizatorului!");
      } else {
        console.error("Eroare la adăugarea proiectului:", error);
        alert("Eroare la adăugarea proiectului. Verificați consola.");
      }
    }
  };

  const fetchRezolvariAlocate = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/bugs/assigned/${user}`);
      setRezolvariAlocate(response.data);
      setView("rezolvari");
    } catch (error) {
      console.error("Eroare la preluarea rezolvărilor alocate:", error);
    }
  };

    // Funcție pentru alocarea unui bug
    const handleAssignBug = async (bug_id) => {
      try {
        const response = await axios.post("http://localhost:5000/api/bugs/assign", {
          bug_id,
          student_email: user
        });
    
        alert(response.data.message);
    
        // Reactualizăm lista bug-urilor pentru a reflecta că a fost alocat
        setSelectedBugs((prevBugs) =>
          prevBugs.map((bug) =>
            bug.id === bug_id ? { ...bug, alocat: true } : bug
          )
        );
      } catch (error) {
        if (error.response) {
          if (error.response.status === 400) {
            alert("Acest bug este deja alocat unui MP!");
          } else {
            alert("Eroare la alocarea bug-ului: " + error.response.data.message);
          }
        } else {
          alert("Eroare la alocarea bug-ului. Verificați consola.");
        }
      }
    };      
    

  // Funcție pentru a deveni tester la un proiect
  const handleDevinoTester = async (proiect_id, nume_echipa) => {
    if (echipaUser === nume_echipa) {
      alert("Ești membru al acestui proiect și nu poți deveni tester!");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/projects/add-tester", {
        email: user,
        proiect_id
      });

      alert(response.data.message);
      fetchProiecte();
    } catch (error) {
      if (error.response && error.response.status === 400) {
        alert("Ești deja tester la acest proiect!");
      } else {
        console.error("Eroare la adăugarea testerului:", error);
        alert("Eroare la adăugarea testerului. Verificați consola.");
      }
    }
  };

  const handleShowBugForm = (proiect_id) => {
    setSelectedProject(proiect_id);
    setView("bug");
  };

  const handleInregistreazaBug = async () => {
    if (!severitate || !prioritate || !descriere || !commitLink) {
      alert("Toate câmpurile sunt obligatorii!");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/bugs/add", {
        proiect_id: selectedProject,
        student_email: user,
        severitate,
        prioritate,
        descriere,
        link_commit: commitLink
      });

      alert("Bug înregistrat cu succes!");
      setView("tst");
      setSeveritate("");
      setPrioritate("");
      setDescriere("");
      setCommitLink("");
      fetchProiecteTST();
    } catch (error) {
      alert("Eroare la înregistrarea bug-ului.");
      console.error("Eroare la înregistrarea bug-ului:", error);
    }
  };

  const handleAdaugaRezolvare = async () => {
    if (!commitSolution) {
      alert("Introduceți link-ul commit-ului!");
      return;
    }
  
    try {
      await axios.post("http://localhost:5000/api/bugs/resolve", {
        bug_id: selectedBugForResolve,
        commit_link: commitSolution
      });
  
      alert("Statusul rezolvării a fost înregistrat!");
      setView("rezolvari");
      fetchRezolvariAlocate(); // Reîncărcăm lista
      setCommitSolution("");
      setSelectedBugForResolve(null);
    } catch (error) {
      alert("Eroare la înregistrarea rezolvării.");
      console.error("Eroare la înregistrarea rezolvării:", error);
    }
  };
  

  return (
    <div>
      <h2>Bun venit, {user}!</h2>
  
      {/* Butoane pentru navigare */}
      <button onClick={fetchProiecteMP}>Vezi Proiectele MP</button>
      <button onClick={fetchProiecteTST}>Vezi Proiectele TST</button>
      <button onClick={fetchProiecte}>Vezi toate proiectele</button>
      <button onClick={fetchRezolvariAlocate}>Vezi rezolvările alocate</button>
  
      {/* Formular pentru înregistrarea proiectului */}
      {showForm ? (
        <button onClick={() => setShowForm(false)}>Anulează</button>
      ) : (
        <button onClick={() => setShowForm(true)}>Înregistrează un proiect</button>
      )}
  
      {showForm && (
        <div className="form-container">
          <input
            type="text"
            placeholder="Repository proiect"
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
          />
          <input
            type="text"
            placeholder="Echipă"
            value={echipa}
            onChange={(e) => setEchipa(e.target.value)}
          />
          <button onClick={handleAdaugaProiect}>Înregistrează proiect</button>
        </div>
      )}
  
      {/* Vizualizare Proiecte MP */}
      {view === "mp" && (
        <>
          <h3>Proiectele la care ești MP:</h3>
          <ul>
            {proiecteMP.map((p) => (
              <li key={p.id}>
                <strong>Repository:</strong> {p.repository_proiect} <br />
                <strong>Echipă:</strong> {p.nume_echipa} <br />
                <button onClick={() => fetchBugsForProject(p.id, p.repository_proiect)}>
                  Vezi bug-urile înregistrate
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
  
      {/* Vizualizare Proiecte TST */}
      {view === "tst" && (
        <>
          <h3>Proiectele la care ești TST:</h3>
          <ul>
            {proiecteTST.map((p) => (
              <li key={p.id}>
                <strong>Repository:</strong> {p.repository_proiect} <br />
                <strong>Echipă:</strong> {p.nume_echipa} <br />
                <button onClick={() => handleShowBugForm(p.id)}>Înregistrează bug</button>
              </li>
            ))}
          </ul>
        </>
      )}
  
      {/* Vizualizare toate proiectele */}
      {view === "all" && (
        <>
          <h3>Toate proiectele disponibile:</h3>
          <ul>
            {proiecte.map((p) => (
              <li key={p.id}>
                <strong>Repository:</strong> {p.repository_proiect} <br />
                <strong>Echipă:</strong> {p.nume_echipa} <br />
                {echipaUser !== p.nume_echipa ? (
                  <button onClick={() => handleDevinoTester(p.id, p.nume_echipa)}>Devino tester</button>
                ) : (
                  <p style={{ color: "red" }}>Ești MP și nu poți deveni tester</p>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
  
      {/* Vizualizare Bug-uri */}
      {view === "bugs" && (
        <>
          <h3>Bug-urile pentru proiectul: {selectedProjectName}</h3>
          <ul>
            {selectedBugs.length > 0 ? (
              selectedBugs.map((bug) => (
                <li key={bug.id}>
                  <strong>Severitate:</strong> {bug.severitate} <br />
                  <strong>Prioritate:</strong> {bug.prioritate} <br />
                  <strong>Descriere:</strong> {bug.descriere} <br />
                  <strong>Link Commit:</strong>{" "}
                  <a href={bug.link_commit} target="_blank" rel="noopener noreferrer">
                    {bug.link_commit}
                  </a>{" "}
                  <br />
                  <button onClick={() => handleAssignBug(bug.id)}>Alocă rezolvarea bug-ului</button>
                </li>
              ))
            ) : (
              <p>Nu există bug-uri pentru acest proiect.</p>
            )}
          </ul>
          <button onClick={fetchProiecteMP}>Înapoi la proiectele MP</button>
        </>
      )}
  
      {/* Vizualizare Rezolvări Alocate */}
      {view === "rezolvari" && selectedBugForResolve === null && (
        <>
          <h3>Rezolvările tale alocate:</h3>
          <ul>
            {rezolvariAlocate.length > 0 ? (
              rezolvariAlocate.map((rezolvare) => (
                <li key={rezolvare.id}>
                  <strong>Bug #{rezolvare.id}</strong> -{" "}
                  <a href={rezolvare.link_commit} target="_blank" rel="noopener noreferrer">
                    {rezolvare.link_commit}
                  </a>{" "}
                  <br />
                  <button onClick={() => setSelectedBugForResolve(rezolvare.id)}>Adaugă rezolvare</button>
                </li>
              ))
            ) : (
              <p>Momentan nu ai rezolvări alocate.</p>
            )}
          </ul>
          <button onClick={fetchProiecteMP}>Înapoi la proiectele MP</button>
        </>
      )}
  
      {/* Formular pentru adăugarea unei rezolvări */}
      {view === "rezolvari" && selectedBugForResolve !== null && (
        <div className="form-container">
          <h3>Adaugă rezolvare pentru Bug #{selectedBugForResolve}</h3>
          <input
            type="text"
            placeholder="Link la commit"
            value={commitSolution}
            onChange={(e) => setCommitSolution(e.target.value)}
          />
          <button onClick={handleAdaugaRezolvare}>Trimite rezolvare</button>
          <button onClick={() => setSelectedBugForResolve(null)}>Anulează</button>
        </div>
      )}
  
      {/* Formular pentru înregistrarea bug-urilor */}
      {view === "bug" && (
        <div className="form-container">
          <h3>Înregistrează un bug</h3>
          <input
            type="text"
            placeholder="Severitate"
            value={severitate}
            onChange={(e) => setSeveritate(e.target.value)}
          />
          <input
            type="text"
            placeholder="Prioritate"
            value={prioritate}
            onChange={(e) => setPrioritate(e.target.value)}
          />
          <input
            type="text"
            placeholder="Descriere"
            value={descriere}
            onChange={(e) => setDescriere(e.target.value)}
          />
          <input
            type="text"
            placeholder="Link la commit"
            value={commitLink}
            onChange={(e) => setCommitLink(e.target.value)}
          />
          <button onClick={handleInregistreazaBug}>Înregistrează bug</button>
          <button onClick={() => setView("tst")}>Anulează</button>
        </div>
      )}
    </div>
  );
  
  
};  
export default Dashboard;