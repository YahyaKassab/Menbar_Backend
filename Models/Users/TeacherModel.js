const mongoose = require('mongoose')
const User = require('./User')
const catchAsync = require('../../utils/catchAsync')
const Course = require('../Courses/CourseModel')

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
    qualifications: String,
    educationLevel: String,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

teacherSchema.virtual('coursesToTeach', {
  ref: 'Course',
  localField: '_id',
  foreignField: 'teachers',
})

teacherSchema.pre(/^find/, User.includeActiveOnly)
teacherSchema.pre('save', User.hashModifiedPassword, User.tokenTimeCheck)

teacherSchema.post('save', async function (next) {
  await Promise.all(
    this.courses.map(async (course) => {
      await Course.findByIdAndUpdate(course, {
        $push: { teachers: this._id },
      })
    }),
  )
})
teacherSchema.methods.correctPassword = User.correctPassword
teacherSchema.methods.changedPasswordAfter = User.changedPasswordAfter
teacherSchema.methods.createPasswordResetToken = User.createPasswordResetToken
teacherSchema.virtual('age').get(User.calcAge)

const Teacher = mongoose.model('Teacher', teacherSchema)

module.exports = Teacher
