const mongoose = require('mongoose')
const User = require('./User')
const Certificate = require('../Student/CertificateModel')
const Course = require('../Courses/CourseModel')
const CourseStats = require('../Student/CourseStatModel')
const catchAsync = require('../../utils/catchAsync')
const AppError = require('../../utils/appError')
const modelsFeatures = require('../../utils/modelsFeatures')

const studentSchema = new mongoose.Schema(
  {
    user: User.userSchema,
    // Additional fields specific to students
    level: String,
    lastCertificate: String,
    educationLevel: String,
    currentJob: String,
    certificates: Array, //Certificate
    courseStats: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'CourseStat',
      },
    ], //CourseStat
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)
const fillEmbedded = (fieldToFill, Model) => {
  catchAsync(async function (next) {
    const fieldPromises = this.fieldToFill.map(
      async (id) => await Model.findById(id),
    )
    this.field = await Promise.all(fieldPromises)
    next()
  })
}
studentSchema.pre(/^find/, User.includeActiveOnly)
studentSchema.virtual('age').get(User.calcAge)
studentSchema.pre(
  'save',
  User.hashModifiedPassword,
  User.tokenTimeCheck,
  //add a condition
  fillEmbedded(this.certificates, Certificate),
)
studentSchema.methods.correctPassword = User.correctPassword
studentSchema.methods.changedPasswordAfter = User.changedPasswordAfter
studentSchema.methods.createPasswordResetToken = User.createPasswordResetToken
const Student = mongoose.model('Student', studentSchema)

module.exports = Student
