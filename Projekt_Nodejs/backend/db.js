import express from 'express'
import mysql from 'mysql'
import cors from 'cors'
import session from 'express-session';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';

const app = express();
app.use(cors({
    origin: ["http://localhost:3000"],
    methods: ["POST", "GET"],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
    cookie: {
        secure:false,
        maxAge: 1000* 60 * 60 * 24
    },
    debug: true
}))

const db = mysql.createConnection({
    host:"localhost",
    user: "root",
    password:"",
    database:"dzial_wsparcia"
})
app.get('/', (req, res) => {
    if(req.session.name) {
        return res.json({valid: true,name:req.session.name})
    }else {
        return res.json({valid:false})
    }
})

app.post('/signup', (req,res) => {
    const sql = "INSERT INTO users (name,email,password) values (?)";
    const values = [
        req.body.name,
        req.body.email,
        req.body.password
    ]
    db.query(sql,[values], (err,result) => {
        if(err) return res.json({Message: "Error in Node"});
        return res.json(result);
    })
})

app.post('/login', (req, res) => {
    const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
    db.query(sql, [req.body.email, req.body.password], (err, result) => {
        if (err) {
            return res.json({ message: "Error inside server" });
        }
        if (result.length > 0) {
            req.session.name = result[0].name;
            req.session.user_id = result[0].id; // Ustawiamy id użytkownika w sesji
            req.session.level_id = result[0].level_id;


            return res.json({ Login: true });
        } else {
            return res.json({ Login: false });
        }
    });
});



// Dodaj endpoint do wylogowywania użytkownika
app.post('/logout', (req, res) => {
    // Usuń sesję użytkownika
    req.session.destroy(err => {
        if (err) {
            console.log(err);
            return res.json({ message: "Error destroying session" });
        }
        // Przekieruj na stronę logowania po wylogowaniu
        res.json({ message: "Logout successful" });
    });
});

// Dodaj endpoint do pobierania zgłoszeń
// Dodaj endpoint do pobierania zgłoszeń wraz z odpowiedziami
app.get('/reports', (req, response) => {
    const sql = "SELECT r.*, GROUP_CONCAT(JSON_OBJECT('id', res.id, 'response_text', res.response_text)) AS responses FROM Reports r LEFT JOIN Responses res ON r.id = res.report_id GROUP BY r.id";
    db.query(sql, (err, results) => {
        if (err) {
            console.log(err);
            return response.status(500).json({ message: "Internal server error" });
        }
        // Przekształć wyniki z bazy danych, aby odpowiedzi były w formie tablicy obiektów
        const reportsWithResponses = results.map(report => {
            return {
                id: report.id,
                subject: report.subject,
                report_text: report.report_text,
                responses: report.responses ? JSON.parse(`[${report.responses}]`) : [] // Parsuj odpowiedzi do tablicy obiektów
            };
        });
        response.json(reportsWithResponses);
    });
});


// Dodaj endpoint do dodawania nowego zgłoszenia
app.post('/reports', (req, res) => {
    const { report_text, subject, user_id } = req.body; // Dodajemy odbiór user_id z ciała żądania
    const sql = "INSERT INTO reports (user_id, subject, report_text) VALUES (?, ?, ?)";
    db.query(sql, [user_id, subject, report_text], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Internal server error", error: err.message });
        }
        res.json({ message: "Zgłoszenie dodane pomyślnie" });
    });
});







app.get('/userId', (req, response) => {
    const userId = req.session.user_id;
    response.json({ userId });
});

app.get('/levelId', (req, response) => {
    const levelId = req.session.level_id;
    response.json({ levelId });
});

app.get('/users', (req, res) => {
    const sql = "SELECT id, name FROM users WHERE level_id = 2"; // Wybieramy tylko użytkowników z poziomem 2 (moderatorów)
    db.query(sql, (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" });
      }
      res.json(results);
    });
  });

  app.post('/response', (req, res) => {
    const { report_id, response_text } = req.body;
    const user_id = req.session.user_id;
  
    // Sprawdzenie, czy zgłoszenie jest przypisane do tego moderatora
    const sql = "SELECT * FROM reports WHERE id = ? AND moderator_id = ?";
    db.query(sql, [report_id, user_id], (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error", error: err.message });
      }
      if (result.length === 0) {
        // Zgłoszenie nie jest przypisane do tego moderatora
        return res.status(403).json({ message: "You are not assigned to this report" });
      }
      
      // Zgłoszenie jest przypisane do moderatora, więc możemy dodać odpowiedź
      const sqlInsert = "INSERT INTO responses (report_id, response_text, user_id) VALUES (?, ?, ?)";
      db.query(sqlInsert, [report_id, response_text, user_id], (errInsert, resultInsert) => {
        if (errInsert) {
          console.log(errInsert);
          return res.status(500).json({ message: "Internal server error", error: errInsert.message });
        }
        res.json({ message: "Response added successfully" });
      });
    });
  });

  

  // Dodaj endpoint do przypisywania moderatora do zgłoszenia
app.post('/assignModerator', (req, res) => {
    const { userId, subject } = req.body;
  
    // Sprawdzamy, czy użytkownik o podanym userId istnieje
    const checkUserSql = "SELECT * FROM users WHERE id = ?";
    db.query(checkUserSql, [userId], (userErr, userResults) => {
      if (userErr) {
        console.error("Błąd podczas sprawdzania użytkownika:", userErr);
        return res.status(500).json({ message: "Internal server error" });
      }
  
      if (userResults.length === 0) {
        // Jeśli użytkownik o podanym userId nie istnieje, zwracamy błąd
        return res.status(400).json({ message: "Użytkownik o podanym ID nie istnieje" });
      }
  
      // Sprawdzamy, czy zgłoszenie o podanym temacie istnieje
      const checkReportSql = "SELECT * FROM reports WHERE subject = ?";
      db.query(checkReportSql, [subject], (reportErr, reportResults) => {
        if (reportErr) {
          console.error("Błąd podczas sprawdzania zgłoszenia:", reportErr);
          return res.status(500).json({ message: "Internal server error" });
        }
  
        if (reportResults.length === 0) {
          // Jeśli zgłoszenie o podanym temacie nie istnieje, zwracamy błąd
          return res.status(400).json({ message: "Zgłoszenie o podanym temacie nie istnieje" });
        }
  
        // Aktualizujemy zgłoszenie, przypisując do niego wybranego moderatora
        const updateSql = "UPDATE reports SET moderator_id = ? WHERE subject = ?";
        db.query(updateSql, [userId, subject], (updateErr, updateResults) => {
          if (updateErr) {
            console.error("Błąd podczas aktualizacji zgłoszenia:", updateErr);
            return res.status(500).json({ message: "Internal server error" });
          }
          // Zwracamy odpowiedź po pomyślnym przypisaniu moderatora do zgłoszenia
          res.json({ message: "Moderator przypisany pomyślnie do zgłoszenia" });
        });
      });
    });
  });
  
  
  
  

app.listen(8081, ()=> {
    console.log("Connected to the server");
})