const mongoose = require('mongoose')
const validator = require('validator')

const feedbackSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'please enter your name'],
  },
  email: {
    type: String,
    validate: validator.isEmail,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
})

const Feedback = mongoose.model('feedback', feedbackSchema)
module.exports = Feedback
