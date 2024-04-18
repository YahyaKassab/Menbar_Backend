const crypto = require('crypto')
const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

function isValidPassword(password) {
  // Regular expressions for validation
  const uppercaseRegex = /[A-Z]/
  const lowercaseRegex = /[a-z]/
  const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/
  const digitRegex = /[0-9]/

  // Check if the password meets all criteria
  return (
    uppercaseRegex.test(password) &&
    lowercaseRegex.test(password) &&
    specialCharRegex.test(password) &&
    digitRegex.test(password)
  )
}
function isValidEmail(email) {
  // Regular expression for validating email addresses
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const userSchema = new mongoose.Schema(
  {
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

          //only words on CREATE and SAVE!!
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
    Country: {
      type: String,
      required: [true, 'Please Enter Your Country'],
    },
    Nationality: String,
    City: String,
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    BirthDate: { type: Date, required: [true, 'Please enter Your birthdate'] },
    IsSingle: {
      type: Boolean,
      default: true,
    },
    Phone: {
      phone: {
        type: String,
        required: [true, 'Please enter your phone number'],
      },
    },

    //Check on this
    Age: {
      type: Number,
      set: function (val) {
        return Date.now() - this.BirthDate
      },
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)
userSchema.pre(/^find/, function (next) {
  //'this' is the current query
  this.find({ active: { $ne: false } })
  next()
})

userSchema.pre('save', async function (next) {
  //if the password wasnt changed, we dont need to reencrypt the password
  if (!this.isModified('password')) next()

  //the second parameter is the intensiveness of the computation power used for encryption
  this.password = await bcrypt.hash(this.password, 12)

  //required means that it must be inputed in the body, not necessarily saved in the database
  this.passwordConfirm = undefined

  next()
})

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next()

  // Insures that the token is always created after the password has been changed
  this.passwordChangedAt = Date.now() - 50000
  next()
})

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword)
}

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = this.passwordChangedAt.getTime() / 1000
    // console.log(changedTimestamp, JWTTimestamp)
    //if changed timestamp greater than jwtTimestamp => password changed after token was signed
    return JWTTimestamp < changedTimestamp
  }

  // no password changed after token was signed
  return false
}

userSchema.methods.createPasswordResetToken = function () {
  // save it to db and send it to user
  const resetToken = crypto.randomBytes(32).toString('hex')
  //encypted token to db
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')

  // console.log({ resetToken }, this.passwordResetToken)
  //10 mins
  this.passwordResetExpires = Date.now() + 10 * 1000 * 60
  return resetToken
}

//Create the model
const User = mongoose.model('User', userSchema)

module.exports = User
