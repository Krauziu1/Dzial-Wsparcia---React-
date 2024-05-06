import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Home() {
  const [levelId, setLevelId] = useState('');
  const [name, setName] = useState('');
  const [reportText, setReportText] = useState('');
  const [reportSubject, setReportSubject] = useState('');
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(''); // Stan dla wybranego użytkownika
  const [selectedReport, setSelectedReport] = useState('');
  const [selectedReportId, setSelectedReportId] = useState('');
  const [responseText, setResponseText] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(''); // Stan dla wybranego tematu zgłoszenia
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:8081', { withCredentials: true })
      .then(res => {
        if (res.data.valid) {
          setName(res.data.name);
          setLevelId(res.data.levelId);
          fetchReports();
          fetchUsers(); // Zawsze pobieramy listę użytkowników, aby mieć dostęp do moderatorów
        } else {
          navigate('/login');
        }
      });

    axios.get('http://localhost:8081/userId')
      .then(response => {
        const { userId } = response.data;
        sessionStorage.setItem('userId', userId);
      });
  
    axios.get('http://localhost:8081/levelId')
      .then(response => {
        const { levelId } = response.data;
        sessionStorage.setItem('levelId', levelId);
        setLevelId(levelId);
      });
  }, []);

  const fetchReports = () => {
    axios.get('http://localhost:8081/reports')
      .then(res => {
        setReports(res.data);
      });
  };

  const fetchUsers = () => {
    axios.get('http://localhost:8081/users')
      .then(res => {
        setUsers(res.data);
      });
  };

  const handleLogout = () => {
    axios.post('http://localhost:8081/logout')
      .then(() => {
        navigate('/login');
        sessionStorage.clear();
      });
  };

  const handleSubmitReport = (event) => {
    event.preventDefault();
    if (levelId === 3) {
      // Użytkownik z poziomem 3 może tylko dodawać zgłoszenia
      axios.post('http://localhost:8081/reports', { report_text: reportText, subject: reportSubject, user_id: sessionStorage.getItem('userId') }) // Dodajemy przekazanie user_id
        .then(() => {
          setReportText('');
          setReportSubject('');
          fetchReports();
        })
        .catch(error => console.error(error));
    }
  };

  const handleAssignUser = (event) => {
    event.preventDefault();
    if (!selectedUser || !selectedSubject) {
      // Jeśli nie wybrano użytkownika lub tematu zgłoszenia, zakończ funkcję
      return;
    }
  
    // Przygotowanie danych do wysłania na serwer
    const requestData = {
      userId: selectedUser,
      subject: selectedSubject
    };
  
    // Wywołanie odpowiedniego endpointu na serwerze w celu przypisania moderatora do zgłoszenia
    axios.post('http://localhost:8081/assignModerator', requestData)
      .then(res => {
        // Jeśli przypisanie moderatora zakończyło się sukcesem, odśwież listę zgłoszeń
        fetchReports();
        // Możesz także wykonać inne czynności, np. wyświetlić powiadomienie o sukcesie
      })
      .catch(error => {
        // Obsługa błędów w przypadku niepowodzenia przypisania moderatora
        console.error("Błąd podczas przypisywania moderatora:", error);
        // Możesz wyświetlić odpowiednie powiadomienie dla użytkownika
      });
  };
  

  const handleReplyReport = (event) => {
    event.preventDefault();
    if (!selectedReportId) {
      console.error("Nie wybrano zgłoszenia");
      return;
    }
    const user_id = sessionStorage.getItem('userId'); // Przykładowe pobranie user_id z sesji
    axios.post('http://localhost:8081/response', { report_id: selectedReportId, response_text: responseText, user_id: user_id })
      .then(() => {
        setResponseText('');
        fetchReports();
      })
      .catch(error => console.error(error));
  };

  const handleSelectReport = (event) => {
    const selectedId = event.target.value;
    setSelectedReportId(selectedId);
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container-fluid">
          <span className="navbar-brand">Witaj {name}</span>
          <button className="btn btn-light" onClick={handleLogout}>Wyloguj</button>
        </div>
      </nav>
      <div className="container">
        <h1>Witaj {name}</h1>
        {levelId === 3 && (
          <>
            <h2>Dodaj nowe zgłoszenie:</h2>
            <form onSubmit={handleSubmitReport}>
              <div className="mb-3">
                <label htmlFor="reportSubject" className="form-label">Temat zgłoszenia:</label>
                <input type="text" className="form-control" id="reportSubject" value={reportSubject} onChange={(e) => setReportSubject(e.target.value)} />
              </div>
              <div className="mb-3">
                <label htmlFor="reportText" className="form-label">Treść zgłoszenia:</label>
                <textarea className="form-control" id="reportText" rows="3" value={reportText} onChange={(e) => setReportText(e.target.value)}></textarea>
              </div>
              <button type="submit" className="btn btn-primary">Dodaj zgłoszenie</button>
            </form>
          </>
        )}

        {levelId === 1 && (
          <div>
            <h2>Przypisany moderator:</h2>
            <form onSubmit={handleAssignUser}>
              <div className="mb-3">
                <label htmlFor="assignedUser" className="form-label">Wybierz moderatora:</label>
                <select className="form-select" id="assignedUser" onChange={(e) => setSelectedUser(e.target.value)}>
                  <option value="">Wybierz moderatora</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="reportSubject" className="form-label">Wybierz temat zgłoszenia:</label>
                <select className="form-select" id="reportSubject" onChange={(e) => setSelectedSubject(e.target.value)}>
                  <option value="">Wybierz temat zgłoszenia</option>
                  {reports.map(report => (
                    <option key={report.id} value={report.subject}>{report.subject}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn btn-primary">Przypisz moderatora</button>
            </form>
          </div>
        )}

        {levelId === 2 && (
          <div>
            <h2>Odpowiedź na zgłoszenie:</h2>
            <form onSubmit={handleReplyReport}>
              <div className="mb-3">
                <label htmlFor="reportList" className="form-label">Wybierz zgłoszenie:</label>
                <select className="form-select" id="reportList" onChange={(e) => setSelectedReportId(e.target.value)}>
                  <option value="">Wybierz zgłoszenie</option>
                  {reports.map(report => (
                    <option key={report.id} value={report.id}>{report.subject}</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="responseText" className="form-label">Treść odpowiedzi:</label>
                <textarea className="form-control" id="responseText" rows="3" value={responseText} onChange={(e) => setResponseText(e.target.value)}></textarea>
              </div>
              <button type="submit" className="btn btn-primary">Dodaj odpowiedź</button>
            </form>
          </div>
        )}

        <div>
          <h2>Zgłoszenia:</h2>
          <ul>
            {reports.map(report => (
              <li key={report.id}>
                <strong>Temat:</strong> {report.subject}<br />
                <strong>Treść:</strong> {report.report_text}
                {/* Dodaj warunek sprawdzający, czy report.responses jest zdefiniowany */}
                {report.responses && report.responses.length > 0 && (
                  <div>
                    <strong>Odpowiedzi:</strong>
                    <ul>
                      {report.responses.map(response => (
                        <li key={response.id}>
                          {response.response_text}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Home;
