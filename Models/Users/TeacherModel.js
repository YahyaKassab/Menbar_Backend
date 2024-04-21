const mongoose = require('mongoose')
const User = require('./User')
const catchAsync = require('../../utils/catchAsync')

const teacherSchema = new mongoose.Schema(
  {
    // Additional fields specific to Teachers
    user: User.userSchema,
    examsMarked: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'FinalExamStudentAnswer',
      },
    ],
    coursesToTeach: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Course',
      },
    ],
    qualifications: String,
    educationLevel: String,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

teacherSchema.pre(/^find/, User.includeActiveOnly)
teacherSchema.pre('save', User.hashModifiedPassword)
teacherSchema.pre('save', User.tokenTimeCheck)
teacherSchema.methods.correctPassword = User.correctPassword
teacherSchema.methods.changedPasswordAfter = User.changedPasswordAfter
teacherSchema.methods.createPasswordResetToken = User.createPasswordResetToken
teacherSchema.virtual('age').get(User.calcAge)

const Teacher = mongoose.model('Teacher', teacherSchema)

module.exports = Teacher
