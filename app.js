const createError = require('http-errors');
const express = require('express');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const session= require('express-session')
const connectDB = require('./models/mongoConnection')
const ConnectMongodbSession = require('connect-mongodb-session')
const mongodbSession = new ConnectMongodbSession(session)
require('dotenv').config()

// DB connection
const db = require("./models/connection");


// const nocache = require('nocache')
const adminRouter = require('./routes/admin');
const usersRouter = require('./routes/users');



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// app.set('admin-layout','admin-layout')



// app.use(logger('dev'));
app.use(express.json());

//Session
app.use(session({
  saveUninitialized: false,
  secret: 'sessionSecret',
  resave: false,
  store: new mongodbSession({
    uri: "mongodb+srv://visnair1999:thangapan99@sneakerclub.lx4zarl.mongodb.net/SNEAKERCLUB",
    collection: "session"
  }),
  cookie: {
    maxAge: 6000000
  },
}))
app.use(function (req, res, next) {
  res.header(
    "Cache-Control",
    "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
  );
  next();
});


app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.static(path.join(__dirname, "public/admin-assets")));

app.use(session({secret:"key", resave: true,saveUninitialized: true,cookie:{maxAge:600000}}))



app.use('/', usersRouter);
app.use('/admin', adminRouter);


const start=function(){
  try{
    connectDB(process.env.MONGO_URL)
  }catch(err){
   // console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")
    console.log(err);
  }
}

start();




// catch 404 and forward to error handler

app.use(function(req, res, next) {
 // console.log("789")
  next(createError(404));
});

// error handler

app.use(function(err, req, res,next) {
  
  // set locals, only providing error in development

  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  
  res.status(err.status || 500);
  res.render('error',{layout:"empty-layout"});
});

module.exports = app;
