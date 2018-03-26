const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const csrf = require('csurf')
const path = require('path')
const mongodb = require('mongodb')
const crypto = require('crypto')
const PORT = process.env.PORT || 5000

const COLLECTION = 'edcelink'
let db

const app = express()
  .use(express.static(path.join(__dirname, 'public')))
  .use(bodyParser.urlencoded({ extended: false }))
  .use(cookieParser())
  .use(csrf({ cookie: true }))

mongodb.MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edcelink', (err, client) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  db = client.db()
  console.log('MongoDB is ready')
  app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
})

app
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => {
    res.render('pages/index', { token: req.csrfToken() })
  })
  .get('/:code', (req, res) => {
    db.collection(COLLECTION).findOne({ code: req.params.code}, (err, doc) => {
      if (err || !doc)
        res.render('pages/index', { token: req.csrfToken(), error: 'Link not found!' })
      else
        res.redirect(doc.url)
    })
  })
  .post('/', (req, res) => {
    const url = req.body.url
    const code = crypto.randomBytes(3).toString('hex')
    db.collection(COLLECTION).insertOne({url, code}, (err, doc) => {
      if (err)
        res.render('pages/index', { token: req.csrfToken(), error: 'Server error! Please try again later.' })
      else
        res.render('pages/index', { token: req.csrfToken(), link: `${req.headers.host}/${code}` })
    })
  })