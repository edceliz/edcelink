const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const csrf = require('csurf')
const path = require('path')
const PORT = process.env.PORT || 5000

express()
  .use(express.static(path.join(__dirname, 'public')))
  .use(bodyParser.urlencoded({ extended: false }))
  .use(cookieParser())
  .use(csrf({ cookie: true }))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => {
    res.render('pages/index', { token: req.csrfToken() })
  })
  .post('/', (req, res) => {
    res.render('pages/index', { token: req.csrfToken(), link: 'Heyyy' })
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
