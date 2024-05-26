const mongoose = require('mongoose')

const questionSchema = new mongoose.Schema(
  {
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
      teacher: {
        type: mongoose.Schema.ObjectId,
        ref: 'Teacher',
      },
      date: Date,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

const Question = mongoose.model('Question', questionSchema)

module.exports = Question
