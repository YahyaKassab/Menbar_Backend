const mongoose = require('mongoose')

exports.questionSchema = new mongoose.Schema({
  asker: {
    type: mongoose.Schema.ObjectId,
    ref: 'Student',
  },
  imageURL: String,
  time: Date,
  isTech: Boolean,
  title: String,
  description: String,
  FAQ: Boolean,
  answer: {
    text: String,
    employee: {
      type: mongoose.Schema.ObjectId,
      ref: 'Employee',
    },
    date: Date,
  },
})

exports.Question = mongoose.model('Question', questionSchema)
