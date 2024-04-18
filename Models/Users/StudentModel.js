const mongoose = require('mongoose')
const User = require('./UserModel')
const Certificate = require('../Student/CertificateModel')
const ScheduleDay = require('../Student/ScheduleDayModel')
const CourseStats = require('../Student/CourseStatsModel')
const catchAsync = require('../../utils/catchAsync')
const AppError = require('../../utils/appError')
const modelsFeatures = require('../../utils/modelsFeatures')

const studentSchema = new mongoose.Schema({
  // Additional fields specific to students
  lastCertificate: String,
  educationLevel: String,
  currentJob: String,
  certificates: Array,
  weekSchedule: Array,
  courseStats: Array,
})
const fillEmbedded = (fieldToFill, Model) => {
  catchAsync(async function (next) {
    const fieldPromises = this.fieldToFill.map(
      async (id) => await Model.findById(id),
    )
    this.field = await Promise.all(fieldPromises)
    next()
  })
}

userSchema.pre('save', fillEmbedded(certificates, Certificate))
userSchema.pre('save', fillEmbedded(weekSchedule, ScheduleDay))
userSchema.pre('save', fillEmbedded(courseStats, CourseStats))
const Student = User.discriminator('Student', studentSchema)

module.exports = Student
