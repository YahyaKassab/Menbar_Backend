const mongoose = require('mongoose')
const validator = require('validator')

const memberSchema = new mongoose.Schema(
  {
    // Additional fields specific to Members
    email: {
      type: String,
      trim: true,
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please enter a valid email address'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

const Member = mongoose.model('Member', memberSchema)

module.exports = Member
