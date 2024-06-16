const path = require('path')
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const ejs = require("ejs");

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const viewRouter = require("./routes/viewRoute");
const userRouter = require("./routes/userRoute");
const batchRouter = require("./routes/batchRoute");
const courseRouter = require("./routes/courseRoute");
const facultyRouter = require("./routes/facultyRoute");
const studentRouter = require("./routes/studentRoute");

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: false }));

// 1) GLOBAL MIDDLEWARES

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour!'
});

app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());
  
// Prevent parameter pollution
// app.use(
//     hpp({
//       whitelist: [
//         
//       ]
//     })
// );
  
// Test middleware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    // console.log(req.headers);
    next();
});

// VIEWS
app.use('/', viewRouter);


// 3) ROUTES
app.use('/api/v1/auth', userRouter);
app.use('/api/v1/batch', batchRouter);
app.use('/api/v1/course', courseRouter);
app.use('/api/v1/faculty', facultyRouter);
app.use('/api/v1/student', studentRouter);

  
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;