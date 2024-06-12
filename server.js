
const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const app = express();
app.use(cors());
const bodyParser = require('body-parser'); 
const path = require('path');
// Middleware to parse JSON bodies
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "pfe"
})


// Route for handling admin login
app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;

    // Query the database to check if the username and password are correct
    const sql = `SELECT * FROM admin WHERE username = ? AND password = ?`;
    db.query(sql, [username, password], (err, result) => {
        if (err) {
            console.error('Error querying the database:', err);
            res.status(500).json({ message: 'Internal server error' });
            return;
        }
        if (result.length > 0) {
            // If the result contains rows, the login is successful
            res.status(200).json({ success: true, message: 'Login successful' });
           
        } else {
            // If the result is empty, the login is unsuccessful
            res.status(401).json({ success: false, message: 'Invalid username or password' });
        }
    });
});

// Route for handling admin login
app.post('/programmeur/login', (req, res) => {
    const { username, password } = req.body;

    // Query the database to check if the username and password are correct
    const sql = `SELECT * FROM programmeur WHERE username = ? AND password = ?`;
    db.query(sql, [username, password], (err, result) => {
        if (err) {
            console.error('Error querying the database:', err);
            res.status(500).json({ message: 'Internal server error' });
            return;
        }
        if (result.length > 0) {
            // If the result contains rows, the login is successful
            res.status(200).json({ success: true, message: 'Login successful' });
           
        } else {
            // If the result is empty, the login is unsuccessful
            res.status(401).json({ success: false, message: 'Invalid username or password' });
        }
    });
});
//change password
app.post('/programmeur/changepassword', (req, res) => {
    const { username, newPassword } = req.body;
  
    // Update password in the database
    const sql = `UPDATE programmeur SET password = '${newPassword}' WHERE username = '${username}'`;
  
    db.query(sql, (err, result) => {
      if (err) {
        console.error('Error updating password:', err);
        res.status(500).send("An error occurred while updating the password.");
        return;
      }
  
      console.log('Password updated successfully');
      res.status(200).send("Password updated successfully.");
    });
  });
app.get('/jours', (req, res) => {
    const sql = 'SELECT id_jour,nom_jour FROM jour';
    db.query(sql, (err, results) => {
      if (err) {
        console.error('Error fetching jours:', err);
        res.status(500).json({ error: 'Failed to fetch jours' });
        return;
      }
      res.json(results);
    });
  });
  
  app.post('/programmeur', (req, res) => {
    const { username, password } = req.body;

    // Check if username already exists
    db.query('SELECT * FROM programmeur WHERE username = ?', [username], (error, results) => {
        if (error) {
            console.error('Error checking username:', error);
            return res.status(500).json({ error: "Internal server error" });
        }

        if (results.length > 0) {
            return res.status(400).json({ error: "Username already exists" });
        }

        // Username doesn't exist, proceed with insertion
        db.query('INSERT INTO programmeur (username, password) VALUES (?, ?)', [username, password], (error, results) => {
            if (error) {
                console.error('Error adding programmer:', error);
                return res.status(500).json({ error: "Failed to add programmer" });
            }

            // Send a success response
            res.status(201).json({ message: "Programmer added successfully" });
        });
    });
});
//change password admin
app.post('/admin/changepassword', (req, res) => {
    const { username, newPassword } = req.body;
  
    // Update password in the database
    const sql = `UPDATE admin SET password = '${newPassword}' WHERE username = '${username}'`;
  
    db.query(sql, (err, result) => {
      if (err) {
        console.error('Error updating password:', err);
        res.status(500).send("An error occurred while updating the password.");
        return;
      }
  
      console.log('Password updated successfully');
      res.status(200).send("Password updated successfully.");
    });
  });
app.post('/admin', (req, res) => {
    const { username, password } = req.body;

    // Check if username already exists
    db.query('SELECT * FROM admin WHERE username = ?', [username], (error, results) => {
        if (error) {
            console.error('Error checking username:', error);
            return res.status(500).json({ error: "Internal server error" });
        }

        if (results.length > 0) {
            return res.status(400).json({ error: "Username already exists" });
        }

        // Username doesn't exist, proceed with insertion
        db.query('INSERT INTO admin (username, password) VALUES (?, ?)', [username, password], (error, results) => {
            if (error) {
                console.error('Error adding admin:', error);
                return res.status(500).json({ error: "Failed to add admin" });
            }

            // Send a success response
            res.status(201).json({ message: "admin added successfully" });
        });
    });
});

app.get('/disponibilites', (req, res) => {
    const sql = `SELECT enseignants.nom AS nom_enseignant,
                 enseignants.prenom AS prenom_enseignant, jour.nom_jour, disponibilite.plage_horaire 
                 FROM disponibilite 
                 INNER JOIN jour ON disponibilite.id_jour = jour.id_jour 
                 INNER JOIN enseignants ON disponibilite.id_enseignant = enseignants.id_enseignant`;
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Error fetching disponibilite data:', err);
            return res.status(500).json({ error: 'Failed to fetch data' });
        }
        res.json(result);
    });
});

// Route to add a new disponibilite entry
app.post('/disponibilite', (req, res) => {
    const { nom, prenom, jour, plage_horaire } = req.body;

    // Check if all required fields are provided
    if (!nom || !prenom || !jour || !plage_horaire) {
        return res.status(400).json({ error: "Please provide all required fields" });
    }

    // Fetch the ID of the enseignant based on nom and prenom
    const sqlFetchEnseignantId = "SELECT id_enseignant FROM enseignants WHERE nom = ? AND prenom = ?";
    db.query(sqlFetchEnseignantId, [nom, prenom], (err, rowsEnseignant) => {
        if (err) {
            console.error("Error fetching enseignant ID:", err);
            return res.status(500).json({ error: "Failed to fetch enseignant ID" });
        }

        if (rowsEnseignant.length === 0) {
            return res.status(404).json({ error: "Enseignant not found" });
        }

        const id_enseignant = rowsEnseignant[0].id_enseignant;

        // Fetch the ID of the jour based on nom_jour
        const sqlFetchJourId = "SELECT id_jour FROM jour WHERE nom_jour = ?";
        db.query(sqlFetchJourId, [jour], (err, rowsJour) => {
            if (err) {
                console.error("Error fetching jour ID:", err);
                return res.status(500).json({ error: "Failed to fetch jour ID" });
            }

            if (rowsJour.length === 0) {
                return res.status(404).json({ error: "Jour not found" });
            }

            const id_jour = rowsJour[0].id_jour;

            // Define the SQL INSERT statement
            const sqlInsertDisponibilite = "INSERT INTO disponibilite (id_enseignant, id_jour, plage_horaire) VALUES (?, ?, ?)";

            // Execute the SQL INSERT statement with the enseignant ID, jour ID, and plage_horaire
            db.query(sqlInsertDisponibilite, [id_enseignant, id_jour, plage_horaire], (err, result) => {
                if (err) {
                    console.error("Error inserting disponibilite:", err);
                    return res.status(500).json({ error: "Failed to insert disponibilite" });
                }
                console.log("Disponibilite inserted successfully");
                // Send a success response back to the client
                res.status(201).json({ message: "Disponibilite inserted successfully", disponibiliteId: result.insertId });
            });
        });
    });
});
// Route to delete a disponibilite entry
app.delete('/disponibilite/:nom/:prenom/:nom_jour/:plage_horaire', (req, res) => {
    const { nom, prenom, nom_jour, plage_horaire } = req.params;

    // Define the SQL DELETE statement
    const sqlDeleteDisponibilite = `
        DELETE FROM disponibilite 
        WHERE id_enseignant = (
            SELECT id_enseignant FROM enseignants WHERE nom = ? AND prenom = ?
        ) AND id_jour = (
            SELECT id_jour FROM jour WHERE nom_jour = ?
        ) AND plage_horaire = ?`;

    // Execute the SQL DELETE statement with the disponibilite ID
    db.query(sqlDeleteDisponibilite, [nom, prenom, nom_jour, plage_horaire], (err, result) => {
        if (err) {
            console.error("Error deleting disponibilite:", err);
            return res.status(500).json({ error: "Failed to delete disponibilite" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Disponibilite not found" });
        }
        console.log("Disponibilite deleted successfully");
        // Send a success response back to the client
        res.status(200).json({ message: "Disponibilite deleted successfully" });
    });
});

app.post('/disponibilites', (req, res) => {
    const { nom, prenom, jour, plage_horaire } = req.body;

    // Check if all required fields are provided
    if (!nom || !prenom || !jour || !plage_horaire) {
        return res.status(400).json({ error: "Please provide all required fields" });
    }

    // Fetch the ID of the enseignant based on nom and prenom
    const sqlFetchEnseignantId = "SELECT id_enseignant FROM enseignants WHERE nom = ? AND prenom = ?";
    db.query(sqlFetchEnseignantId, [nom, prenom], (err, rowsEnseignant) => {
        if (err) {
            console.error("Error fetching enseignant ID:", err);
            return res.status(500).json({ error: "Failed to fetch enseignant ID" });
        }

        if (rowsEnseignant.length === 0) {
            return res.status(404).json({ error: "Enseignant not found" });
        }

        const id_enseignant = rowsEnseignant[0].id_enseignant;

        // Fetch the ID of the jour based on nom_jour
        const sqlFetchJourId = "SELECT id_jour FROM jour WHERE nom_jour = ?";
        db.query(sqlFetchJourId, [jour], (err, rowsJour) => {
            if (err) {
                console.error("Error fetching jour ID:", err);
                return res.status(500).json({ error: "Failed to fetch jour ID" });
            }

            if (rowsJour.length === 0) {
                return res.status(404).json({ error: "Jour not found" });
            }

            const id_jour = rowsJour[0].id_jour;

            // Define the SQL INSERT statement
            const sqlInsertDisponibilite = "INSERT INTO disponibilite (id_enseignant, id_jour, plage_horaire) VALUES (?, ?, ?)";

            // Execute the SQL INSERT statement with the enseignant ID, jour ID, and plage_horaire
            db.query(sqlInsertDisponibilite, [id_enseignant, id_jour, plage_horaire], (err, result) => {
                if (err) {
                    console.error("Error inserting disponibilite:", err);
                    return res.status(500).json({ error: "Failed to insert disponibilite" });
                }
                console.log("Disponibilite inserted successfully");
                // Send a success response back to the client
                res.status(201).json({ message: "Disponibilite inserted successfully", disponibiliteId: result.insertId });
            });
        });
    });
});

// Route to delete a disponibilite entry
app.delete('/disponibilite/:nom/:prenom/:nom_jour/:plage_horaire', (req, res) => {
    const { nom, prenom, nom_jour, plage_horaire } = req.params;

    // Define the SQL DELETE statement
    const sqlDeleteDisponibilite = `
        DELETE FROM disponibilite 
        WHERE id_enseignant = (
            SELECT id_enseignant FROM enseignants WHERE nom = ? AND prenom = ?
        ) AND id_jour = (
            SELECT id_jour FROM jour WHERE nom_jour = ?
        ) AND plage_horaire = ?`;

    // Execute the SQL DELETE statement with the disponibilite ID
    db.query(sqlDeleteDisponibilite, [nom, prenom, nom_jour, plage_horaire], (err, result) => {
        if (err) {
            console.error("Error deleting disponibilite:", err);
            return res.status(500).json({ error: "Failed to delete disponibilite" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Disponibilite not found" });
        }
        console.log("Disponibilite deleted successfully");
        // Send a success response back to the client
        res.status(200).json({ message: "Disponibilite deleted successfully" });
    });
});

// Endpoint to fetch data from enseignants table
app.get('/enseignants/noms', (req, res) => {
    const sql = 'SELECT DISTINCT nom FROM enseignants';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching noms from enseignants table:', err);
            res.status(500).json({ error: 'Failed to fetch noms from enseignants table' });
            return;
        }
        // Extract noms from the results
        const noms = results.map(row => row.nom);
        res.json(noms);
    });
});

// Endpoint to fetch data from enseignants table for prenom
app.get('/enseignants/prenoms', (req, res) => {
    const sql = 'SELECT DISTINCT prenom FROM enseignants';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching prenoms from enseignants table:', err);
            res.status(500).json({ error: 'Failed to fetch prenoms from enseignants table' });
            return;
        }
        // Extract prenoms from the results
        const prenoms = results.map(row => row.prenom);
        res.json(prenoms);
    });
});


// Endpoint to fetch data from module table
app.get('/module', (req, res) => {
    const sql = 'SELECT nom_module FROM modules';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching data from module table:', err);
            res.status(500).json({ error: 'Failed to fetch data from module table' });
            return;
        }
        res.json(results);
    });
});




//code formation pour table 
app.get('/formation', (req, res) => {
    const searchQuery = req.query.search;
    let sql = 'SELECT id_formation, LIBELLE_FORMATION FROM formation'; // Assuming LIBELLE_FORMATION is the name field for formation

    if (searchQuery) {
        sql += ` WHERE LIBELLE_FORMATION LIKE '%${searchQuery}%'`; // Adjust the query to search by formation name
    }

    db.query(sql, (err, formationsData) => {
        if (err) {
            console.error('Error fetching formation:', err);
            return res.status(500).json({ error: 'Error fetching formation' });
        }
        return res.json(formationsData);
    });
});

//code niveau pour table 
app.get('/niveau', (req, res) => {
    const searchQuery = req.query.search;
    let sql = 'SELECT id_niveau, nom_niveau FROM niveau'; // Adjust field names according to your database schema

    if (searchQuery) {
        sql += ` WHERE nom_niveau LIKE '%${searchQuery}%'`; // Adjust the query to search by niveau name
    }

    db.query(sql, (err, niveauData) => {
        if (err) {
            console.error('Error fetching niveau:', err);
            return res.status(500).json({ error: 'Error fetching niveau' });
        }
        return res.json(niveauData);
    });
});

 // code dispo

app.get("/enseignantsss", (req, res) => {
    let sql = "SELECT  nom, prenom FROM enseignants"; // Select both prenom and nom columns
    const searchQuery = req.query.search; // Retrieve search query parameter

    // If search query parameter is provided, add a WHERE clause to the SQL query to filter results
    if (searchQuery) {
        // Assuming 'nom' and 'prenom' are the column names to search
        sql += ` WHERE nom LIKE '%${searchQuery}%' OR prenom LIKE '%${searchQuery}%'`; 
    }

    db.query(sql, (err, data) => {
        if (err) return res.status(500).json({ error: "Error fetching professors" });
        return res.json(data);
    })

  
})

app.get('/seance', (req, res) => {
   
    const section = req.query.section;
    const date = req.query.date;
    const sql = 'SELECT nom, nom_module,salle, jour, plage_horaire ,niveau,formation FROM seance WHERE section = ? AND id_seance = ?';

    db.query(sql, [section, date], (err, result) => {
        if (err) {
            console.error('Error fetching disponibilite data:', err);
            return res.status(500).json({ error: 'Failed to fetch data' });
        }
        res.json(result);
    });
});


app.get('/enseigner', (req, res) => {
    const sql = 'SELECT enseignants.nom, enseignants.prenom, modules.nom_module ' +
                'FROM enseinger ' +
                'INNER JOIN modules ON enseinger.id_module = modules.id_module ' +
                'INNER JOIN enseignants ON enseinger.id_enseignant = enseignants.id_enseignant';
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Error fetching data:', err);
            return res.status(500).json({ error: 'Failed to fetch data' });
        }
        res.json(result);
    });
});

app.post('/enseigner', (req, res) => {
    const { nom_module, nom, prenom } = req.body;

    // Check if all required fields are provided
    if (!nom_module || !nom || !prenom) {
        return res.status(400).json({ error: "Please provide all required fields" });
    }

    // Fetch the ID of the module based on its name
    const sqlFetchModuleId = "SELECT id_module FROM modules WHERE nom_module = ?";
    db.query(sqlFetchModuleId, [nom_module], (err, rows) => {
        if (err) {
            console.error("Error fetching module ID:", err);
            return res.status(500).json({ error: "Failed to fetch module ID" });
        }

        if (rows.length === 0) {
            return res.status(404).json({ error: "Module not found" });
        }

        const id_module = rows[0].id_module;

        // Fetch the ID of the enseignant based on name and surname
        const sqlFetchEnseignantId = "SELECT id_enseignant FROM enseignants WHERE nom = ? AND prenom = ?";
        db.query(sqlFetchEnseignantId, [nom, prenom], (err, rows) => {
            if (err) {
                console.error("Error fetching enseignant ID:", err);
                return res.status(500).json({ error: "Failed to fetch enseignant ID" });
            }

            if (rows.length === 0) {
                return res.status(404).json({ error: "Enseignant not found" });
            }

            const id_enseignant = rows[0].id_enseignant;

            // Define the SQL INSERT statement
            const sqlInsertEnseigner = "INSERT INTO enseinger (id_module, id_enseignant) VALUES (?, ?)";

            // Execute the SQL INSERT statement with the module and enseignant IDs
            db.query(sqlInsertEnseigner, [id_module, id_enseignant], (err, result) => {
                if (err) {
                    console.error("Error inserting enseigner:", err);
                    return res.status(500).json({ error: "Failed to insert enseigner" });
                }
                console.log("Enseigner inserted successfully");
                // Send a success response back to the client
                res.status(201).json({ message: "Enseigner inserted successfully", enseignerId: result.insertId });
            });
        });
    });
});


app.delete('/enseigner/:nom/:prenom/:nom_module', (req, res) => {
    const { nom, prenom, nom_module } = req.params;

    // Fetch the ID of the module based on its name
    const sqlFetchModuleId = "SELECT id_module FROM modules WHERE nom_module = ?";
    db.query(sqlFetchModuleId, [nom_module], (err, rowsModule) => {
        if (err) {
            console.error("Error fetching module ID:", err);
            return res.status(500).json({ error: "Failed to fetch module ID" });
        }

        if (rowsModule.length === 0) {
            return res.status(404).json({ error: "Module not found" });
        }

        const id_module = rowsModule[0].id_module;

        // Fetch the ID of the enseignant based on name and surname
        const sqlFetchEnseignantId = "SELECT id_enseignant FROM enseignants WHERE nom = ? AND prenom = ?";
        db.query(sqlFetchEnseignantId, [nom, prenom], (err, rowsEnseignant) => {
            if (err) {
                console.error("Error fetching enseignant ID:", err);
                return res.status(500).json({ error: "Failed to fetch enseignant ID" });
            }

            if (rowsEnseignant.length === 0) {
                return res.status(404).json({ error: "Enseignant not found" });
            }

            const id_enseignant = rowsEnseignant[0].id_enseignant;

            // Define the SQL DELETE statement
            const sqlDeleteEnseigner = "DELETE FROM enseinger WHERE id_module = ? AND id_enseignant = ?";

            // Execute the SQL DELETE statement with the module and enseignant IDs
            db.query(sqlDeleteEnseigner, [id_module, id_enseignant], (err, result) => {
                if (err) {
                    console.error("Error deleting enseigner:", err);
                    return res.status(500).json({ error: "Failed to delete enseigner" });
                }
                if (result.affectedRows === 0) {
                    return res.status(404).json({ error: "Enseigner not found" });
                }
                console.log("Enseigner deleted successfully");
                // Send a success response back to the client
                res.status(200).json({ message: "Enseigner deleted successfully" });
            });
        });
    });
});


app.post('/seance', (req, res) => {
    const { section, salle, module, teacher, day, time, startDate, selectedList,niveau,formation } = req.body;

    // Check if the salle is already booked for the given time slot
    const salleQuery = `SELECT * FROM seance WHERE salle=?  AND jour=? AND plage_horaire=? AND id_seance=? AND groupe=?`;
    db.query(salleQuery, [salle, day, time, startDate, selectedList], (err, salleRows) => {
        if (err) {
            console.error('Error querying salle database:', err);
            return res.status(500).json({ error: 'An error occurred while checking salle database' });
        }

        if (salleRows.length > 0) {
            console.log('Salle already booked');
            return res.status(409).json({ error: 'Salle already booked', conflictingSeances: salleRows });
        }

        // Check if the teacher is already booked for the given time slot
        const teacherQuery = `SELECT * FROM seance WHERE nom=? AND jour=? AND plage_horaire=? AND id_seance=? AND groupe=?`;
        db.query(teacherQuery, [teacher, day, time, startDate, selectedList], (err, teacherRows) => {
            if (err) {
                console.error('Error querying teacher database:', err);
                return res.status(500).json({ error: 'An error occurred while checking teacher database' });
            }

            if (teacherRows.length > 0) {
                console.log('Teacher already booked');
                return res.status(409).json({ error: 'Teacher already booked', conflictingSeances: teacherRows });
            }

            // Proceed with insertion if both salle and teacher are available
            const insertQuery = `INSERT INTO seance (jour, nom, nom_module, section, salle, plage_horaire, id_seance, groupe,niveau,formation) VALUES (?, ?,?, ?, ?, ?, ?, ?, ?, ?)`;
            db.query(insertQuery, [day, teacher, module, section, salle, time, startDate, selectedList,niveau,formation], (err, result) => {
                if (err) {
                    console.error('Error inserting data into database:', err);
                    return res.status(500).json({ error: 'An error occurred while inserting data into database' });
                } else {
                    console.log('Data inserted successfully');
                    return res.status(200).json({ message: 'Data inserted successfully' });
                }
            });
        });
    });
});


app.get('/section', (req, res) => {
    const searchQuery = req.query.search;
    let sql = 'SELECT id_section FROM section'; 
  
    if (searchQuery) {
        sql += ` WHERE id_section = '${searchQuery}'`;
    }
  
    db.query(sql, (err, sectionsData) => {
        if (err) {
            console.error('Error fetching section:', err);
            return res.status(500).json({ error: 'Error fetching section' });
        }
        return res.json(sectionsData);
    });
});





app.get("/modules", (req, res) => {
    let sql = "SELECT id_module, nom_module FROM modules"; 
    const searchQuery = req.query.search; 

   
    if (searchQuery) {
        sql += ` WHERE nom_module LIKE '%${searchQuery}%'`; 
    }

    db.query(sql, (err, modulesData) => {
        if (err) {
            console.error('Error fetching modules:', err);
            return res.status(500).json({ error: "Error fetching modules" });
        }
        
        return res.json(modulesData);
    });
});

// Endpoint to fetch professors associated with a specific module
app.get("/modules/:moduleId/enseignants", (req, res) => {
    const moduleId = req.params.moduleId;
    const sql = `SELECT enseignants.id_enseignant, enseignants.nom, enseignants.prenom 
                 FROM enseignants 
                 INNER JOIN enseinger ON enseignants.id_enseignant = enseinger.id_enseignant 
                 WHERE enseinger.id_module = ?`; 
    db.query(sql, [moduleId], (err, professorsData) => {
        if (err) {
            console.error('Error fetching professors:', err);
            return res.status(500).json({ error: "Error fetching professors" });
        }
        
        return res.json(professorsData);
    });
});

// Other endpoints remain the same...

app.get("/salle", (req, res) => {
  const selectedType = req.query.type;
  
  if (!selectedType) {
      // If type parameter is not provided, fetch distinct types
      db.query("SELECT DISTINCT type FROM salle", (err, types) => {
          if (err) {
              console.error('Error fetching types:', err);
              return res.status(500).json({ error: "Error fetching types" });
          }
          // Extract type values from the result and return them
          const typeValues = types.map(row => row.type);
          return res.json(typeValues);
      });
  } else {
      // If type parameter is provided, fetch id_salle values for the selected type
      db.query("SELECT id_salle FROM salle WHERE type = ?", [selectedType], (err, id_salles) => {
          if (err) {
              console.error('Error fetching id_salles:', err);
              return res.status(500).json({ error: "Error fetching id_salles" });
          }
          console.log('Fetched id_salles:', id_salles);
          return res.json(id_salles);
      });
  }
});

// Endpoint to fetch id_jour based on nom_jour
app.get('/jour', (req, res) => {
    const { nom_jour } = req.query;

    if (!nom_jour) {
        return res.status(400).json({ error: 'Missing nom_jour parameter.' });
    }

    const sql = 'SELECT id_jour FROM jour WHERE nom_jour = ?';

    db.query(sql, [nom_jour], (error, results) => {
        if (error) {
            console.error('Error fetching id_jour:', error);
            return res.status(500).json({ error: 'An error occurred while fetching id_jour.' });
        }

        if (results.length > 0) {
            res.json(results[0].id_jour);
        } else {
            res.status(404).json({ error: 'Id_jour not found for the given nom_jour.' });
        }
    });
});


app.get('/disponibilite', (req, res) => {
    const { id_jour, id_module, plage_horaire } = req.query;

    if (!id_jour || !id_module || !plage_horaire) {
        return res.status(400).json({ error: 'Missing id_jour, id_module, or plage_horaire parameter.' });
    }

    const sql = `SELECT disponibilite.id_enseignant 
                 FROM disponibilite  
                 INNER JOIN enseinger ON disponibilite.id_enseignant = enseinger.id_enseignant 
                 WHERE disponibilite.id_jour = ? AND enseinger.id_module = ? AND disponibilite.plage_horaire = ?`;

    db.query(sql, [id_jour, id_module, plage_horaire], (error, results) => {
        if (error) {
            console.error('Error fetching id_enseignants:', error);
            return res.status(500).json({ error: 'An error occurred while fetching id_enseignants.' });
        }

        if (results.length > 0) {
            res.json(results);
        } else {
            res.status(404).json({ error: 'No enseignants found for the given parameters.' });
        }
    });
});

// Endpoint to get nom and prenom based on id_enseignant
app.get('/enseignants', (req, res) => {
    const { id_enseignant } = req.query;

    if (!id_enseignant) {
        return res.status(400).json({ error: 'Missing id_enseignant parameter.' });
    }

    const sql = 'SELECT nom, prenom FROM enseignants WHERE id_enseignant = ?';

    db.query(sql, [id_enseignant], (error, results) => {
        if (error) {
            console.error('Error fetching nom and prenom:', error);
            return res.status(500).json({ error: 'An error occurred while fetching nom and prenom.' });
        }

        if (results.length > 0) {
            const enseignants = results.map(result => ({ nom: result.nom, prenom: result.prenom }));
            res.json(enseignants);
        } else {
            res.status(404).json({ error: 'nom and prenom not found for the given id_enseignant.' });
        }
    });
});


//code salle
app.get("/salles", (req, res) => {
    const sql = "SELECT id_salle as 'Numéro de salle', nbr_place as 'Nombre de places',type , bloc FROM salle";
    db.query(sql, (err, data) => {
        if (err) return res.json("Error ");
        return res.json(data);
    })
})

app.post('/salle', (req, res) => {
    const { id_salle , nbr_place , type , bloc } = req.body; 

    // Check if all required fields are provided
    if (!id_salle || !nbr_place || !type || !bloc) { // Changed coefficient to coef
        return res.status(400).json({ error: "Please provide all required fields" });
    }

    // Define the SQL INSERT statement
    const sql = "INSERT INTO salle (id_salle, nbr_place, type , bloc) VALUES (?, ?, ?, ?)";

    // Execute the SQL INSERT statement with the module data
    db.query(sql, [id_salle, nbr_place, type, bloc], (err, result) => { // Changed coefficient to coef
        if (err) {
            console.error("Error inserting salle:", err);
            return res.status(500).json({ error: "Failed to insert salle" });
        }
        console.log("salle inserted successfully");
        // Send a success response back to the client
        res.status(201).json({ message: "salle inserted successfully", salleId: result.insertId });
    })
});


app.delete('/salle/:id', (req, res) => {
    const id = req.params.id;

    
    const sql = "DELETE FROM salle WHERE id_salle = ?";

    db.query(sql, [id], (err) => {
        if (err) {
            console.error("Error deleting salle:", err);
            return res.status(500).json({ error: "Failed to delete salle" });
        }
        console.log("salle deleted successfully");
        
        res.status(200).json({ message: "salle deleted successfully" });
    })

});


app.put('/salle/:id', (req, res) => {
    const id = req.params.id;
    const { id_salle, nbr_place, type, bloc } = req.body; // Changed coefficient to coef

    // Check if all required fields are provided
    if (!nbr_place || !id_salle || !type || !bloc) { // Changed coefficient to coef
        return res.status(400).json({ error: "Please provide all required fields" });
    }

    // Define the SQL UPDATE statement
    const sql = "UPDATE salle SET  nbr_place = ?, type = ?, bloc= ? WHERE id_salle = ?";

    // Execute the SQL UPDATE statement with the module data
    db.query(sql, [ nbr_place, type,bloc, id], (err) => { // Changed coefficient to coef
        if (err) {
            console.error("Error updating salle:", err);
            return res.status(500).json({ error: "Failed to update salle" });
        }
        console.log("salle updated successfully");
        // Send a success response back to the client
        res.status(200).json({ message: "salle updated successfully" });
    });
});

//code module table 
app.get("/moduless", (req, res) => {
    const sql = "SELECT id_module AS 'code de module', nom_module AS 'nom de module', volume_horaire AS 'volume horaire', coef FROM modules";
    db.query(sql, (err, data) => {
        if (err) return res.status(500).json({ error: "Error fetching modules" });
        return res.json(data);
    });
});

app.post('/modules', (req, res) => {
    const { id_module, nom_module, volume_horaire, coef } = req.body;

    // Check if all required fields are provided
    if (!id_module || !nom_module || !volume_horaire || !coef) {
        return res.status(400).json({ error: "Please provide all required fields" });
    }

    // Define the SQL INSERT statement
    const sql = "INSERT INTO modules (id_module, nom_module, volume_horaire, coef) VALUES (?, ?, ?, ?)";

    // Execute the SQL INSERT statement with the module data
    db.query(sql, [id_module, nom_module, volume_horaire, coef], (err, result) => {
        if (err) {
            console.error("Error inserting module:", err);
            return res.status(500).json({ error: "Failed to insert module" });
        }
        console.log("Module inserted successfully");
        // Send a success response back to the client
        res.status(201).json({ message: "Module inserted successfully", moduleId: result.insertId });
    });
});

// Route to delete a module by ID
app.delete('/modules/:id', (req, res) => {
    const id = req.params.id;

    // Define the SQL DELETE statement
    const sql = "DELETE FROM modules WHERE id_module = ?";

    // Execute the SQL DELETE statement with the module ID
    db.query(sql, [id], (err) => {
        if (err) {
            console.error("Error deleting module:", err);
            return res.status(500).json({ error: "Failed to delete module" });
        }
        console.log("Module deleted successfully");
        // Send a success response back to the client
        res.status(200).json({ message: "Module deleted successfully" });
    });
});

// Route to update a module by ID
app.put('/modules/:id', (req, res) => {
    const id = req.params.id;
    const { nom_module, volume_horaire, coef } = req.body;

    // Check if all required fields are provided
    if (!nom_module || !volume_horaire || !coef) {
        return res.status(400).json({ error: "Please provide all required fields" });
    }

    // Define the SQL UPDATE statement
    const sql = "UPDATE modules SET nom_module = ?, volume_horaire = ?, coef= ? WHERE id_module = ?";

    // Execute the SQL UPDATE statement with the module data
    db.query(sql, [nom_module, volume_horaire, coef, id], (err) => {
        if (err) {
            console.error("Error updating module:", err);
            return res.status(500).json({ error: "Failed to update module" });
        }
        console.log("Module updated successfully");
        // Send a success response back to the client
        res.status(200).json({ message: "Module updated successfully" });
    });
});

//code enseignants
app.get("/enseignantss", (req, res) => {
    const sql = "SELECT id_enseignant as 'id de l`enseignant', nom, prenom, email, numero_tel as 'Numéro de téléphone' FROM enseignants";
    db.query(sql, (err, data) => {
        if (err) {
            console.error("Error fetching enseignants:", err);
            return res.status(500).json({ error: "Failed to fetch enseignants" });
        }
        return res.json(data);
    });
});

app.post('/enseignants', (req, res) => {
    const { id_enseignant, nom, prenom, email, numero_tel } = req.body;

    // Check if all required fields are provided
    if (!id_enseignant || !nom || !prenom || !email || !numero_tel) {
        return res.status(400).json({ error: "Please provide all required fields" });
    }

    // Define the SQL INSERT statement
    const sql = "INSERT INTO enseignants (id_enseignant, nom, prenom, email, numero_tel) VALUES (?, ?, ?, ?, ?)";

    // Execute the SQL INSERT statement with the enseignants data
    db.query(sql, [id_enseignant, nom, prenom, email, numero_tel], (err, result) => {
        if (err) {
            console.error("Error inserting enseignants:", err);
            return res.status(500).json({ error: "Failed to insert enseignants" });
        }
        console.log("Enseignant inserted successfully");
        // Send a success response back to the client
        res.status(201).json({ message: "Enseignant inserted successfully", enseignantsId: result.insertId });
    });
});

// Route to delete a enseignant by ID
app.delete('/enseignants/:id', (req, res) => {
    const id = req.params.id;

    // Define the SQL DELETE statement
    const sql = "DELETE FROM enseignants WHERE id_enseignant = ?";

    // Execute the SQL DELETE statement with the enseignant ID
    db.query(sql, [id], (err) => {
        if (err) {
            console.error("Error deleting enseignant:", err);
            return res.status(500).json({ error: "Failed to delete enseignant" });
        }
        console.log("Enseignant deleted successfully");
        // Send a success response back to the client
        res.status(200).json({ message: "Enseignant deleted successfully" });
    });
});

// Route to update a enseignant by ID
app.put('/enseignants/:id', (req, res) => {
    const id = req.params.id;
    const { nom, prenom, email, numero_tel } = req.body;

    // Check if all required fields are provided
    if (!nom || !prenom || !email || !numero_tel) {
        return res.status(400).json({ error: "Please provide all required fields" });
    }

    // Define the SQL UPDATE statement
    const sql = "UPDATE enseignants SET nom = ?, prenom = ?, email = ?, numero_tel = ? WHERE id_enseignant = ?";

    // Execute the SQL UPDATE statement with the enseignant data
    db.query(sql, [nom, prenom, email, numero_tel, id], (err, result) => {
        if (err) {
            console.error("Error updating enseignant:", err);
            return res.status(500).json({ error: "Failed to update enseignant" });
        }
        console.log("Enseignant updated successfully");
        // Send a success response back to the client
        res.status(200).json({ message: "Enseignant updated successfully", enseignantsId: id });
    });
});

//code section 

app.get("/sections", (req, res) => {
    const sql = "SELECT id_section as 'section', effectif FROM section";
    db.query(sql, (err, data) => {
        if (err) return res.json("Error ");
        return res.json(data);
    })
})

app.post('/section', (req, res) => {
    const { id_section , effectif  } = req.body; 

    
    if (!id_section || !effectif ) { 
        return res.status(400).json({ error: "Please provide all required fields" });
    }

    
    const sql = "INSERT INTO section (id_section, effectif) VALUES (?, ?)";

    
    db.query(sql, [id_section, effectif], (err, result) => { 
        if (err) {
            console.error("Error inserting section:", err);
            return res.status(500).json({ error: "Failed to insert section" });
        }
        console.log("section inserted successfully");
        
        res.status(201).json({ message: "section inserted successfully",sectionId: result.insertId });
    })
});


app.delete('/section/:id', (req, res) => {
    const id = req.params.id;

    
    const sql = "DELETE FROM section WHERE id_section = ?";

   
    db.query(sql, [id], (err) => {
        if (err) {
            console.error("Error deleting section:", err);
            return res.status(500).json({ error: "Failed to delete section" });
        }
        console.log("section deleted successfully");
        
        res.status(200).json({ message: "section deleted successfully" });
    })

});


app.put('/section/:id', (req, res) => {
    const id = req.params.id;
    const { effectif } = req.body; 
    if (!effectif) { 
        return res.status(400).json({ error: "Please provide all required fields" });
    }

    const sql = "UPDATE section SET effectif = ? WHERE id_section = ?";

    db.query(sql, [effectif, id], (err) => { 
        if (err) {
            console.error("Error updating section:", err);
            return res.status(500).json({ error: "Failed to update section" });
        }
        console.log("section updated successfully");
        
        res.status(200).json({ message: "section updated successfully" });
    });
});

//departm


app.get("/departements", (req, res) => {
    const sql = "SELECT * FROM departement";
    db.query(sql, (err, data) => {
        if (err) return res.json("Error ");
        return res.json(data);
    })
})

app.post('/departement', (req, res) => {
    const { id_departement, nom_departement } = req.body; 

    // Check if all required fields are provided
    if (!id_departement || !nom_departement ) { // Changed coefficient to coef
        return res.status(400).json({ error: "Please provide all required fields" });
    }

    // Define the SQL INSERT statement
    const sql = "INSERT INTO departement (id_departement, nom_departement) VALUES (?,?)";

    // Execute the SQL INSERT statement with the module data
    db.query(sql, [id_departement, nom_departement], (err, result) => { // Changed coefficient to coef
        if (err) {
            console.error("Error inserting departement:", err);
            return res.status(500).json({ error: "Failed to insert departement" });
        }
        console.log("departement inserted successfully");
        // Send a success response back to the client
        res.status(201).json({ message: "departement inserted successfully",departementId: result.insertId });
    })
});

// Route to delete a module by ID
app.delete('/departement/:id', (req, res) => {
    const id = req.params.id;

    // Define the SQL DELETE statement
    const sql = "DELETE FROM departement WHERE id_departement = ?";

    // Execute the SQL DELETE statement with the module ID
    db.query(sql, [id], (err) => {
        if (err) {
            console.error("Error deleting departement:", err);
            return res.status(500).json({ error: "Failed to delete departement" });
        }
        console.log("departement deleted successfully");
        // Send a success response back to the client
        res.status(200).json({ message: "departement deleted successfully" });
    })

});

// Route to update a module by ID
app.put('/departement/:id', (req, res) => {
    const id = req.params.id;
    const { id_departement ,nom_departement } = req.body; // Changed coefficient to coef

    // Check if all required fields are provided
    if (!id_departement || !nom_departement ) { // Changed coefficient to coef
        return res.status(400).json({ error: "Please provide all required fields" });
    }

     // Define the SQL UPDATE statement
     const sql = "UPDATE section nom_departement = ? WHERE id_departement = ?";

     // Execute the SQL UPDATE statement with the module data
     db.query(sql, [nom_departement,id_departement], (err) => { // Changed coefficient to coef
         if (err) {
             console.error("Error updating departement:", err);
             return res.status(500).json({ error: "Failed to update departement" });
         }
         console.log("departement updated successfully");
         // Send a success response back to the client
         res.status(200).json({ message: "departement updated successfully" });
     });
 });
//formation


app.get("/formations", (req, res) => {
    const sql = "SELECT * FROM formation";
    db.query(sql, (err, data) => {
        if (err) return res.json("Error ");
        return res.json(data);
    })
})


//CODE FORMATION POUR ADMIN
app.post('/formation', (req, res) => {
    const { id_formation ,  libelle_formation  } = req.body; 

    // Check if all required fields are provided
    if (!id_formation || !libelle_formation  ) { 
        return res.status(400).json({ error: "Please provide all required fields" });
    }

    // Define the SQL INSERT statement
    const sql = "INSERT INTO formation (id_formation,libelle_formation) VALUES (?, ?)";

    // Execute the SQL INSERT statement with the module data
    db.query(sql, [id_formation, libelle_formation ], (err, result) => {
        if (err) {
            console.error("Error inserting formation:", err);
            return res.status(500).json({ error: "Failed to insert formation" });
        }
        console.log("formation inserted successfully");
        // Send a success response back to the client
        res.status(201).json({ message: "formation inserted successfully",formationId: result.insertId });
    })
});

// Route to delete a module by ID
app.delete('/formation/:id', (req, res) => {
    const id = req.params.id;

    // Define the SQL DELETE statement
    const sql = "DELETE FROM formation WHERE id_formation = ?";

    // Execute the SQL DELETE statement with the module ID
    db.query(sql, [id], (err) => {
        if (err) {
            console.error("Error deleting formation:", err);
            return res.status(500).json({ error: "Failed to delete formation" });
        }
        console.log("formation deleted successfully");
        // Send a success response back to the client
        res.status(200).json({ message: "formation deleted successfully" });
    })

});
// Route to update a formation by ID
app.put('/formation/:id', (req, res) => {
    const id = req.params.id;
    const { libelle_formation, id_formation } = req.body;

    // Check if all required fields are provided
    if (!id_formation || !libelle_formation) {
        return res.status(400).json({ error: "Please provide all required fields" });
    }

    const sql = "UPDATE formation SET libelle_formation = ? WHERE id_formation = ?";

    db.query(sql, [libelle_formation, id], (err, result) => {
        if (err) {
            console.error("Error updating formation:", err);
            return res.status(500).json({ error: "Failed to update formation" });
        }
        // Check if any rows were affected by the update operation
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Formation not found" });
        }
        console.log("Formation updated successfully");
        // Send a success response back to the client
        res.status(200).json({ message: "Formation updated successfully" });
    });
});
//CODE NIVEAU FOR ADMIN
app.get("/niveaux", (req, res) => {
    const sql = "SELECT * FROM niveau";
    db.query(sql, (err, data) => {
        if (err) return res.json("Error ");
        return res.json(data);
    })
})

app.post('/niveau', (req, res) => {
    const { id_niveau, nom_niveau } = req.body; 

    // Check if all required fields are provided
    if (!id_niveau || !nom_niveau) { 
        return res.status(400).json({ error: "Please provide all required fields" });
    }

    // Define the SQL INSERT statement
    const sql = "INSERT INTO niveau (id_niveau, nom_niveau) VALUES (?, ?)";

    // Execute the SQL INSERT statement with the niveau data
    db.query(sql, [id_niveau, nom_niveau], (err, result) => {
        if (err) {
            console.error("Error inserting niveau:", err);
            return res.status(500).json({ error: "Failed to insert niveau" });
        }
        console.log("Niveau inserted successfully");
        // Send a success response back to the client
        res.status(201).json({ message: "Niveau inserted successfully", niveauId: result.insertId });
    })
});

app.delete('/niveau/:id', (req, res) => {
    const id = req.params.id;

    // Define the SQL DELETE statement
    const sql = "DELETE FROM niveau WHERE id_niveau = ?";

    // Execute the SQL DELETE statement with the niveau ID
    db.query(sql, [id], (err) => {
        if (err) {
            console.error("Error deleting niveau:", err);
            return res.status(500).json({ error: "Failed to delete niveau" });
        }
        console.log("Niveau deleted successfully");
        // Send a success response back to the client
        res.status(200).json({ message: "Niveau deleted successfully" });
    })

});

app.put('/niveau/:id', (req, res) => {
    const id = req.params.id;
    const { nom_niveau, id_niveau } = req.body;

    // Check if all required fields are provided
    if (!id_niveau || !nom_niveau) {
        return res.status(400).json({ error: "Please provide all required fields" });
    }

    const sql = "UPDATE niveau SET nom_niveau = ? WHERE id_niveau = ?";

    db.query(sql, [nom_niveau, id], (err, result) => {
        if (err) {
            console.error("Error updating niveau:", err);
            return res.status(500).json({ error: "Failed to update niveau" });
        }
        // Check if any rows were affected by the update operation
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Niveau not found" });
        }
        console.log("Niveau updated successfully");
        // Send a success response back to the client
        res.status(200).json({ message: "Niveau updated successfully" });
    });
});


 app.post('/checkDuplicateSalle', (req, res) => {
    // Extract data from the request body
    const { id_seance, jour, plage_horaire, id_salle } = req.body;

    // Query the database to check for duplicates
    const sql = 'SELECT COUNT(*) AS count FROM seance WHERE id_seance = ? AND jour = ? AND plage_horaire = ? AND id_salle = ?';
    db.query(sql, [id_seance, jour, plage_horaire, id_salle], (err, result) => {
        if (err) {
            console.error('Error checking duplicate salle:', err);
            return res.status(500).json({ error: 'An error occurred while checking duplicate salle' });
        }

        // Extract the count from the query result
        const count = result[0].count;

        // If count > 0, it means there is a duplicate
        const isDuplicate = count > 0;

        // Send the response
        res.json({ isDuplicate });
    });
});
app.listen(8081, () => {
    console.log("listening...");
});

