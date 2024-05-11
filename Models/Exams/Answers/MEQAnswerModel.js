const mongoose = require('mongoose')

const meqAnswerSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.ObjectId,
      ref: 'Student',
      required: [true, 'An answer must have a student'],
    },
    meq: {
      type: mongoose.Schema.ObjectId,
      ref: 'MEQ',
    },
    answer: String,
    score: Number,
    feedback: {
      text: String,
      date: {
        type: Date,
      },
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

const MEQAnswer = mongoose.model('MEQAnswer', meqAnswerSchema)
module.exports = MEQAnswer
