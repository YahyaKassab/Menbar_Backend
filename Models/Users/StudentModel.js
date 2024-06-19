const mongoose = require('mongoose')
const User = require('./User')
const crypto = require('crypto')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const Certificate = require('../Student/CertificateModel')
const catchAsync = require('../../utils/catchAsync')

const studentSchema = new mongoose.Schema(
  {
    // #region User
    Fname: {
      type: String,
      required: [true, 'A user must have a First name'],
    },
    Mname: {
      type: String,
    },
    Lname: {
      type: String,
      required: [true, 'A user must have a Last name'],
    },

    email: {
      type: String,
      trim: true,
      unique: true,
      lowercase: true,
      required: [true, 'A user must have an email address'],
      validate: [validator.isEmail, 'Please enter a valid email address'],

      //   maxLength: [100, 'A email  must be Less than 60 characters'],
      //   minLength: [10, 'A email  must be at least 10 characters'],
    },
    photo: String,
    role: {
      type: String,
      enum: ['Student', 'TeachLead', 'Teacher', 'Tech', 'Admin'],
      default: 'Student',
    },
    password: {
      type: String,
      required: [true, 'Please enter the password'],
      minLength: [5, 'A password must be at least 5 characters'],
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm the password'],
      validate: [
        function (conf) {
          //not arrow function because we need the 'this' keyword

          //only works on CREATE and SAVE!!
          return conf === this.password
        },
        'Confirmation is not equal to password',
      ],
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    country: {
      type: String,
      required: [true, 'Please Enter Your Country'],
    },
    nationality: String,
    city: String,
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    birthDate: { type: Date, required: [true, 'Please enter Your birthdate'] },
    isSingle: {
      type: Boolean,
      default: true,
    },
    confirmed: {
      type: Boolean,
      default: false,
    },
    phone: {
      type: {
        countryCode: {
          type: String,
          required: [true, 'Please enter the country code'],
        },
        number: {
          type: String,
          required: [true, 'Please enter your phone number'],
        },
      },
      required: false,
    },
    // #endregion
    level: String,
    lastCertificate: String,
    educationLevel: String,
    currentJob: String,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

studentSchema.virtual('courseStats', {
  ref: 'CourseStat',
  localField: '_id',
  foreignField: 'student',
})
studentSchema.virtual('certificates', {
  ref: 'Certificate',
  localField: '_id',
  foreignField: 'student',
})
studentSchema.virtual('age').get(User.calcAge)
studentSchema.methods.assignFinalAnswer = async function (finalAnswerId) {
  this.courseStats.finalAnswers = finalAnswerId
  await this.save()
}

studentSchema.methods.executeStudentSignupLogic = async function () {
  // Populate this with courseStats and lectureStats
  await this.populate({
    path: 'courseStats',
    populate: {
      path: 'lecturesStats',
      model: 'LectureStat',
    },
  })

  // Iterate over this.courseStats
  for (const courseStat of this.courseStats) {
    // Iterate over lecturesStats of each courseStat
    for (const lectureStat of courseStat.lecturesStats) {
      // Assign the student property to this._id
      lectureStat.student = this._id
      // Save the modified lectureStat
      await lectureStat.save()
    }
    // Save the modified courseStat
    await courseStat.save()
  }
}

studentSchema.pre(/^find/, User.includeActiveOnly)
studentSchema.pre('save', User.hashModifiedPassword, User.tokenTimeCheck)
studentSchema.methods.correctPassword = User.correctPassword
studentSchema.methods.changedPasswordAfter = User.changedPasswordAfter
studentSchema.methods.createPasswordResetToken = User.createPasswordResetToken
const Student = mongoose.model('Student', studentSchema)

module.exports = Student
