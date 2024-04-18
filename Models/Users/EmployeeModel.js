const mongoose = require('mongoose')
const User = require('./UserModel')

const employeeSchema = new mongoose.Schema({
  // Additional fields specific to Employees
  jobTitle: String,
  activities: [String],
  workHours: [
    {
      start: {
        hour: { type: Number, min: 0, max: 23 },
        min: { type: Number, min: 0, max: 59 },
      },
      end: {
        hour: { type: Number, min: 0, max: 23 },
        min: { type: Number, min: 0, max: 59 },
      },
      dayOfWeek: {
        type: String,
        enum: ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      },
    },
  ],
})

const Employee = User.discriminator('Employee', employeeSchema)

module.exports = Employee
