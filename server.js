const express = require('express')
const bodyParser = require('body-parser')
const pg = require('pg-promise')()
const db = pg('postgres://localhost:5432/dinosaurs')

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/', (req, res) => {
  db.query('select * from dinosaurs').then(data => {
    res.json(data)
  })
})

app.get('/api/dinosaurs', (req, res) => {
  db.query('SELECT * FROM dinosaurs').then(data => {
    res.json(data)
  })
})

app.get('/api/dinosaurs/:id', (req, res) => {
  const dinoId = parseInt(req.params.id)
  db.oneOrNone('SELECT * FROM dinosaurs WHERE id = $1', [dinoId]).then(data => {
    res.json(data)
  })
})

app.get('/api/dinosaurs/:id/habitats', (req, res) => {
  const dinoId = parseInt(req.params.id)
  db.oneOrNone('SELECT habitats FROM dinosaurs WHERE id = $1', [dinoId]).then(data => {
    res.json(data)
  })
})

app.post('/api/dinosaurs', (req, res) => {
  const dinoName = req.body.name
  const dinoColor = req.body.color
  const dinoSize = req.body.size
  const dinoHabitats = req.body.habitats
  const newDino = { name: dinoName, color: dinoColor, size: dinoSize, habitats: dinoHabitats }

  db
    .one(
      `INSERT INTO "dinosaurs" (name, color, size, habitats)
             VALUES($(name), $(color), $(size), $(habitats)) RETURNING id`,
      newDino
    )
    .then(newDino => {
      res.redirect(`/api/dinosaurs/${newDino.id}`)
    })
})

app.put('/api/dinosaurs/:id', (req, res) => {
  const dinoId = parseInt(req.params.id)
  db.oneOrNone('SELECT * FROM dinosaurs WHERE id = $1', [dinoId]).then(data => {
    res.json(data)
  })
})

app.delete('/api/dinosaurs/:id', (req, res) => {
  const dinoId = parseInt(req.params.id)
  db.oneOrNone('DELETE FROM dinosaurs WHERE id = $1', [dinoId]).then(data => {
    res.json(data)
  })
})

app.listen(3000, () => {
  console.log('Listening on 3000')
})
