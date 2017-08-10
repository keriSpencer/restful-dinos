const express = require('express')
const bodyParser = require('body-parser')
const pg = require('pg-promise')()
const db = pg('postgres://localhost:5432/dinosaurs')
const mustacheExpress = require('mustache-express')

const app = express()
app.use(express.static('public'))

app.engine('mustache', mustacheExpress())
app.set('views', './templates')
app.set('view engine', 'mustache')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/', (req, res) => {
  db.any('SELECT * FROM dinosaurs').then(dinos => {
    res.render('home', { dinos: dinos })
  })
})

app.get('/api/dinosaurs', (req, res) => {
  db.any('SELECT * FROM dinosaurs').then(dinos => {
    res.render('home', { dinos: dinos })
  })
})

app.get('/api/dinosaurs/:id', (req, res) => {
  const dinoId = parseInt(req.params.id)
  db.oneOrNone('SELECT * FROM dinosaurs WHERE id = $1', [dinoId]).then(dinos => {
    res.render('dino', { dinos: dinos })
  })
})

app.get('/api/dinosaurs/:id/edit', (req, res) => {
  const dinoId = parseInt(req.params.id)
  db.oneOrNone('SELECT * FROM dinosaurs WHERE id = $1', [dinoId]).then(dinos => {
    res.render('edit', { dinos: dinos })
  })
  console.log('Unagi')
})

app.get('/api/dinosaurs/:id/habitats', (req, res) => {
  const dinoId = parseInt(req.params.id)
  db.oneOrNone('SELECT habitats FROM dinosaurs WHERE id = $1', [dinoId]).then(data => {
    res.json(data)
  })
})

app.get('/new', (req, res) => {
  console.log('New Dino Page')
  res.render('createDino')
})

app.get('/api/dinosaurs/:id/delete', (req, res) => {
  const dinoId = parseInt(req.params.id)
  db.oneOrNone('SELECT * FROM dinosaurs WHERE id = $1', [dinoId]).then(dinos => {
    res.render('delete', { dinos: dinos })
  })
})

app.post('/new', (req, res) => {
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

app.post('/api/dinosaurs/:id', (req, res) => {
  const dinoId = parseInt(req.params.id)
  const dinoName = req.body.name
  const dinoColor = req.body.color
  const dinoSize = req.body.size
  const dinoHabitats = req.body.habitats
  db
    .none(`UPDATE dinosaurs SET name=$2, color=$3, size=$4, habitats=$5 WHERE id=$1`, [
      dinoId,
      dinoName,
      dinoColor,
      dinoSize,
      dinoHabitats
    ])
    .then(dinos => {
      res.redirect(`/api/dinosaurs/${dinoId}`)
    })
})

app.post('/api/dinosaurs/:id/delete', (req, res) => {
  const dinoId = parseInt(req.params.id)

  db.oneOrNone('DELETE FROM dinosaurs WHERE id = $1', dinoId).then(dinos => {
    res.redirect(`/`)
  })
})

app.listen(3000, () => {
  console.log('Listening on 3000')
})
