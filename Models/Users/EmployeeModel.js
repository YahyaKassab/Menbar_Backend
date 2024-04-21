const mongoose = require('mongoose')
const User = require('./User')

const employeeSchema = new mongoose.Schema(
  {
    user: User.userSchema,
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
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)
employeeSchema.pre(/^find/, User.includeActiveOnly)
employeeSchema.pre('save', User.hashModifiedPassword)
employeeSchema.pre('save', User.tokenTimeCheck)
employeeSchema.virtual('age').get(User.calcAge)
employeeSchema.methods.correctPassword = User.correctPassword
employeeSchema.methods.changedPasswordAfter = User.changedPasswordAfter
employeeSchema.methods.createPasswordResetToken = User.createPasswordResetToken
const Employee = mongoose.model('Employee', employeeSchema)

module.exports = Employee
