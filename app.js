const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
const path = require('path')
const mongoose = require('mongoose')
const passport = require('passport')
const exphbs = require('express-handlebars')
const methodOverride = require('method-override')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const connectDB = require('./config/db')

// config dotenv
dotenv.config({path: './config/config.env'})

// set up port
const PORT = process.env.PORT || 5000

// connect to database
connectDB()

// passport
require('./config/passport')(passport)

// create app
const app = express()

// logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

// session
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({mongooseConnection: mongoose.connection})
}))

// body parser
app.use(express.urlencoded({extended: false}))
app.use(express.json())

// helpers
const {formatDate, select, editIcon, stripTags} = require('./helpers/hbs')
// handlebars
app.engine('.hbs', exphbs({helpers: {
    formatDate,
    select,
    editIcon,
    stripTags
}, defaultLayout: 'main', extname: '.hbs'}));
app.set('view engine', '.hbs');

//passport 
app.use(passport.initialize());
app.use(passport.session());

// override
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
        var method = req.body._method
        delete req.body._method
        return method
    }
}))

// serve static files
app.use(express.static(path.join(__dirname, 'public')))

// global variable
app.use(function (req, res, next) {
    res.locals.user = req.user || null
    next()
})

// routes
app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))
app.use('/stories', require('./routes/stories'))
// start server
app.listen(PORT, console.log(`Running in ${process.env.NODE_ENV} on ${PORT}`))