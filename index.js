const express = require('express')
const bodyParser = require('body-parser');
const app = express()
const cors = require('cors')
var db = require("./database.js")
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

app.post('/api/users', async(req, res) => {
  const user = {
    username: req.body.username,
  }

  try {
    var sql ='INSERT INTO user (username) VALUES (?)'
    var params =[user.username];
    const dbUser = await db.run(sql, params, function (err, result) {
        if (err){
          res.status(404).json({"error": err.message})
          return;
        }
        res.json({
          username: user.username,
          id: this.lastID
        })
    });
  } catch (err) {
    res.status(404).json({"error": err.message})
  }
});

app.get('/api/users', (req, res) => {
    var sql = "SELECT * FROM user"
    var params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
          // res.status(400).json({"error":err.message});
          res.status(404).send('User exists')
          return
        }
        if (rows.length === 0) {
          res.status(404).send('Not found');
        } else {
          res.json({
            "data":rows
        })
        }
      });
});

app.post('/api/users/:_id/exercises', (req, res) => {
  const id = req.params._id
  const description = req.body.description
  const duration = req.body.duration
  const date = req.body.date ? new Date(req.body.date).toLocaleDateString().split('T')[0] : new Date().toLocaleDateString().split('T')[0]
  if (duration === "" || description === "") {
    res.status(400).json({"error": 'Missing required params'})
  } else if (date === "Invalid Date") {
    res.status(400).json({"error": 'Invalid date format'})
  } else {
    try {
      db.run(
        'INSERT INTO userExercises (description, duration, date, id) VALUES (?,?,?,?)',
        [description, duration, date, id],
        function (err, result) {
            if (err){
                res.status(400).json({"error": 'Not able to insert exercise'})
                return;
            }
            let returnData = {
              userId: id,
              duration,
              description,
              date
            }
            res.json(returnData)
      });
    }
    catch {
      res.status(404).send('Not able to save');
    }
  }
});

app.get('/api/users/:_id/logs', (req, res, next) => {
  const id = req.params._id
  const limit = req.query.limit
  const fromDate = req.query.from
  const toDate = req.query.to
  var sql = "SELECT * FROM userExercises WHERE id = ?"
  var params = [id]
  db.all(sql, params, (err, rows) => {
      if (err) {
        // res.status(400).json({"error":err.message});
        res.status(404).send('Not found')
        return
      }
      if (rows && rows.length === 0) {
        res.status(404).send('Empty');
      } else {
        let filteredRows = rows;
        if (fromDate) {
          filteredRows = filteredRows.filter(row => new Date(row.date) >= new Date(new Date(fromDate).toLocaleDateString().split('T')[0]));
        }
        if (toDate) {
          filteredRows = filteredRows.filter(row => new Date(row.date) <= new Date(new Date(toDate).toLocaleDateString()));
        }
        const limitedRows = filteredRows.slice(0, limit);

        res.json({
          "logs":limitedRows,
          "count":filteredRows.length
      })
      }
    });
});



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
