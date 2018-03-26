const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const csrf = require('csurf')
const path = require('path')
const mongodb = require('mongodb')
const crypto = require('crypto')
const PORT = process.env.PORT || 5000

// NoSQL Collection Name
const COLLECTION = 'edcelink'
let db

const app = express()
  .use(express.static(path.join(__dirname, 'public')))
  .use(bodyParser.urlencoded({ extended: false }))
  // Enable CSRF Protection
  .use(cookieParser())
  .use(csrf({ cookie: true }))

mongodb.MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edcelink', (err, client) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  // Initialize Application
  db = client.db()
  console.log('MongoDB is ready')
  app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
})

app
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  // Index Page
  .get('/', (req, res) => {
    res.render('pages/index', { token: req.csrfToken() })
  })
  // Redirection Page
  .get('/:code', (req, res) => {
    // Find original destination by document code
    db.collection(COLLECTION).findOne({ code: req.params.code}, (err, doc) => {
      if (err || !doc)
        res.render('pages/index', { token: req.csrfToken(), error: 'Link not found!' })
      else
        res.redirect(doc.url)
    })
  })
  // Link Shortener
  .post('/', (req, res) => {
    const url = req.body.url
    // Generate pseudorandom character combination
    const code = crypto.randomBytes(3).toString('hex')
    // Insert original destination and its code into collection
    db.collection(COLLECTION).insertOne({url, code}, (err, doc) => {
      if (err)
        res.render('pages/index', { token: req.csrfToken(), error: 'Server error! Please try again later.' })
      else
        res.render('pages/index', { token: req.csrfToken(), link: `${req.headers.host}/${code}` })
    })
  })