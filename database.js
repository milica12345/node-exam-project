var sqlite3 = require('sqlite3')
// var md5 = require('md5')

const DBSOURCE = "db.sqlite"

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
      // Cannot open database
      console.error(err.message)
      throw err
    }else{
        console.log('Connected to the SQLite database.')
        db.run(`CREATE TABLE IF NOT EXISTS user (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username text UNIQUE,
            CONSTRAINT username_unique UNIQUE (username)
            )`,
        (err) => {
            if (err) {
                console.log(err)
                // Table already created
            }else{
                console.log('All good!')
            }
        });
        db.run(`CREATE TABLE IF NOT EXISTS userExercises (
            exerciseId INTEGER PRIMARY KEY AUTOINCREMENT,
            id INTEGER,
            description text,
            duration text,
            date text
            )`,
        (err) => {
            if (err) {
                console.log(err)
                // Table already created
            }else{
                console.log('All good!')
            }
        });  
    }
});


module.exports = db