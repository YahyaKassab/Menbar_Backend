const mongoose = require('mongoose')
const User = require('./User')
const Certificate = require('../Student/CertificateModel')
const ScheduleDay = require('../Student/ScheduleDayModel')
const CourseStats = require('../Student/CourseStatsModel')
const catchAsync = require('../../utils/catchAsync')
const AppError = require('../../utils/appError')
const modelsFeatures = require('../../utils/modelsFeatures')

const studentSchema = new mongoose.Schema(
  {
    user: User.userSchema,
    // Additional fields specific to students
    lastCertificate: String,
    educationLevel: String,
    currentJob: String,
    certificates: Array,
    weekSchedule: Array,
    courseStats: Array,
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
studentSchema.pre('save', User.hashModifiedPassword)
studentSchema.pre('save', User.tokenTimeCheck)
studentSchema.methods.correctPassword = User.correctPassword
studentSchema.methods.changedPasswordAfter = User.changedPasswordAfter
studentSchema.methods.createPasswordResetToken = User.createPasswordResetToken
studentSchema.virtual('age').get(User.calcAge)
studentSchema.pre('save', fillEmbedded(certificates, Certificate))
studentSchema.pre('save', fillEmbedded(weekSchedule, ScheduleDay))
studentSchema.pre('save', fillEmbedded(courseStats, CourseStats))
const Student = mongoose.model('Student', studentSchema)

module.exports = Student
