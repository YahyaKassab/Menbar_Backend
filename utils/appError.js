class AppError extends Error {
  constructor(message, statusCode) {
    //this automatically sets the message
    super(message)

    this.statusCode = statusCode
    //turning status code into a string then checking if it starts with 4
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }
}

module.exports = AppError
