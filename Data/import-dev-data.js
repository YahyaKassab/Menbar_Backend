const fs = require('fs')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const Teacher = require('../Models/Users/TeacherModel')

//Must be before the app
//Specifying the config file
dotenv.config({ path: './config.env' })

//env vars
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
)

//Connecting to the remote database
mongoose.connect(DB).then((con) => {
  console.log('DB connection successful')
})

//Read file

const teachers = JSON.parse(
  fs.readFileSync(`${__dirname}/Fill/teachers.json`, 'utf-8'),
)

//Import data into database

const importData = async () => {
  try {
    //we are not using password confirm property
    await Teacher.create(teachers, { validateBeforeSave: false })

    console.log('Data successfully loaded')
  } catch (err) {
    console.log(err)
  }
  process.exit()
}

// Delete all data from collection

const deleteData = async () => {
  try {
    await Teacher.deleteMany()
    console.log('Data successfulle deleted')
  } catch (err) {
    console.log(err)
  }
  process.exit()
}

if (process.argv[2] === '--import') importData()
else if (process.argv[2] === '--delete') deleteData()

console.log(process.argv)
