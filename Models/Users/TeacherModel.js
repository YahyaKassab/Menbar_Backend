const mongoose = require('mongoose')
const User = require('./User')
const catchAsync = require('../../utils/catchAsync')
const Course = require('../Courses/CourseModel')
const crypto = require('crypto')
const validator = require('validator')
const bcrypt = require('bcryptjs')

const teacherSchema = new mongoose.Schema(
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

    examsMarked: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'FinalExamStudentAnswer',
      },
    ],
    qualifications: String,
    educationLevel: String,
    coursesToTeach: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Course',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)
teacherSchema.virtual('age').get(User.calcAge)

teacherSchema.pre(/^find/, User.includeActiveOnly)
teacherSchema.pre('save', User.hashModifiedPassword, User.tokenTimeCheck)

teacherSchema.methods.correctPassword = User.correctPassword
teacherSchema.methods.changedPasswordAfter = User.changedPasswordAfter
teacherSchema.methods.createPasswordResetToken = User.createPasswordResetToken

const Teacher = mongoose.model('Teacher', teacherSchema)

module.exports = Teacher
