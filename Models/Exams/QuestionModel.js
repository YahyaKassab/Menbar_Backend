const mongoose = require('mongoose')

const questionSchema = new mongoose.Schema(
  {
    asker: {
      type: mongoose.Schema.ObjectId,
      ref: 'Student',
    },
    name: String,
    email: String,
    imageURL: String,
    isTech: Boolean,
    title: String,
    description: String,
    FAQ: Boolean,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    answer: {
      text: String,
      teacher: {
        type: mongoose.Schema.ObjectId,
        ref: 'Teacher',
      },
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

const Question = mongoose.model('Question', questionSchema)

module.exports = Question
