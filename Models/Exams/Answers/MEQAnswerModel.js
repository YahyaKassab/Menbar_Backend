const mongoose = require('mongoose')

exports.meqAnswerSchema = new mongoose.Schema(
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
      date: Date,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

exports.MEQAnswer = mongoose.model('MEQAnswer', meqAnswerSchema)
