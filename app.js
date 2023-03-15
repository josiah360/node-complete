const path = require('path')

const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const session = require('express-session')
const mongoDBStore = require('connect-mongodb-session')(session)
const csrfProtection = require('csurf')
const flash = require('connect-flash')
const multer = require('multer')


const adminRoutes = require('./routes/admin')
const shopRoutes = require('./routes/shop')
const authRoutes = require('./routes/auth')
const errorControllers = require('./controllers/error')

const User = require('./models/user')

const app = express()

const MONGO_URI = 'mongodb+srv://josiah:josiah1987@cluster0.dmn2c2v.mongodb.net/shop'

const store = new mongoDBStore({
  uri: MONGO_URI,
  collection: 'sessions'
})

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images')
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + '_' + file.originalname)
  }
})

const fileFilter = (req, file, cb) => {
  if(
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
    ) {
      cb(null, true)
    } else {
      cb(null, false)
    }
}

app.set('view engine', 'ejs')

app.set('views', 'views')

app.use(express.static(path.join(__dirname, 'public')))
app.use('/images', express.static(path.join(__dirname, 'images')))

app.use(bodyParser.urlencoded({extended: false}))

app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'))

app.use(session({
  secret: '12345678901234567890123456789012', 
  resave: false, 
  saveUninitialized: false, 
  store: store
}))

app.use(csrfProtection())

app.use(flash())

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn
  res.locals.csrfToken = req.csrfToken()
  next()
})

app.use((req, res, next) => {
  User.findById(req?.session?.user?._id)
    .then(user => {
      req.user = user
      next()
    })
    .catch(err => {
      next(new Error(err))
    })
})

app.use(authRoutes)
app.use('/admin', adminRoutes)
app.use(shopRoutes)
app.use('/500', errorControllers.get500)
app.use(errorControllers.error)

app.use((error, req, res, next) => {
  console.log(error)
  res.status(500).render('500', {
    pageTitle: 'Error!',
    activeLink: '/500',
    isAuthenticated: req.session.isLoggedIn
})
})


mongoose
  .set('strictQuery', true)
  .connect(MONGO_URI)
    .then(result => {
      console.log('Database connected!')
      app.listen(3000)
    })
    .catch(err => {
        console.log(err)
    })



