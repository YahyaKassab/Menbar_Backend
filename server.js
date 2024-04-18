const mongoose = require('mongoose')
const dotenv = require('dotenv')

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message)
  console.log('UNCAUGHT EXCEPTION 💥 Shutting down....')
  //closes after ending all the pending requests
  process.exit(1)
})

//Must be before the app
//Specifying the config file
dotenv.config({ path: './config.env' })
const app = require('./app')

//env vars
const DB = process.env.DATABASE_ME.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
)

//Connecting to the remote database
mongoose.connect(DB).then((con) => {
  console.log('DB connection successful')
})

const port = process.env.PORT || 3000

//Server listening
const server = app.listen(port, () => {
  console.log('Connected on port:', port)
})

process.on('unhandledRejection', (err) => {
  console.log(err)
  console.log('UNHANDLER REJECTION 💥 Shutting down....')
  //closes after ending all the pending requests
  server.close(() => {
    process.exit(1)
  })
})
