const rateLimit = require('express-rate-limit')
const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')

const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')

const teacherRouter = require('./Routes/teacherRouter')
const libraryRouter = require('./Routes/libraryRouter')
const studentRouter = require('./Routes/studentRouter')
const bookRouter = require('./Routes/bookRouter')
const commentRouter = require('./Routes/commentRouter')
const lectureRouter = require('./Routes/lectureRouter')
const quizRouter = require('./Routes/quizRouter')
const courseRouter = require('./Routes/courseRouter')

const app = express()

// 1) GLOBAL MIDDLEWARES
// Set security HTTP headers
app.use(helmet())

//middleware applies to all the routes because it is before it in the code

// Development logging
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'))
//middleware data from the body is added to the request

// Limit requests from same API
const limiter = rateLimit({
  // Max number of requests per ip per hour
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour.',
})

app.use('/api', limiter)

// Body parser, reading data from body into req.body
app.use(
  express.json({
    // Body must be less than 10kb
    limit: '1000kb',
  }),
)

// Data sanitization against NoSQL query injection
app.use(mongoSanitize())

// Data sanitization against XSS (some html malicios code)
app.use(xss())

// Prevent parameter pollution (removes query duplication)

// 🚨apply later
/*
app.use(
  hpp({
    // properties to allow duplicates ex:duration
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
)
*/
// Serving static files
app.use(express.static(`${__dirname}/public`))

// Test middlewares
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString()
  next()
})

app.use('/api/v1/students', studentRouter)
app.use('/api/v1/teachers', teacherRouter)
app.use('/api/v1/courses', courseRouter)
app.use('/api/v1/books', bookRouter)
app.use('/api/v1/library', libraryRouter)
app.use('/api/v1/comments', commentRouter)
app.use('/api/v1/quiz', quizRouter)
app.use('/api/v1/lectures', lectureRouter)
// app.use('/api/v1/tours', tourRouter)
// app.use('/api/v1/reviews', reviewRouter)

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404))
})

app.use(globalErrorHandler)
module.exports = app
