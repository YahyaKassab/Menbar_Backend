const AppError = require('../../utils/appError')

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`
  return new AppError(message, 400)
}
const handleCastFieldsDB = (err) => {
  const message = `Duplicate field value: "${err.keyValue.name}".Please use another value.`
  return new AppError(message, 400)
}
const handleCastValidationDB = (err) => {
  const message = err.message
  return new AppError(message, 400)
}

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  })
}

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    })

    // Programming or other unknown error: don't leak error details
  } else {
    //1) Log error
    console.error('Error💥', err)

    //2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong',
    })
  }
}

const handleJWTError = () =>
  new AppError('Invalid token. Please login again.', 401)

const handleJWTExpiredError = () =>
  new AppError('Your token has expired. Please login again.', 401)

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500
  err.status = err.status || 'error'

  if (process.env.NODE_ENV == 'development') {
    sendErrorDev(err, res)
  } else if (process.env.NODE_ENV == 'production') {
    let error = { ...err }

    //create a custom error object readable for user
    //invalid id in get
    if (err.name == 'CastError') error = handleCastErrorDB(error)
    //Duplicate fields
    if (err.code == 11000) error = handleCastFieldsDB(error)
    //Validation errors
    if (err.name == 'ValidationError') error = handleCastValidationDB(err)
    if (err.name == 'JsonWebTokenError') error = handleJWTError()
    if (err.name == 'TokenExpiredError') error = handleJWTExpiredError()

    sendErrorProd(error, res)
  }
}
