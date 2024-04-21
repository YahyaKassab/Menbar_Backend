const mongoose = require('mongoose')

exports.mcqAnswerSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.ObjectId,
      ref: 'Student',
      required: [true, 'An answer must have a student'],
    },
    mcq: {
      type: mongoose.Schema.ObjectId,
      ref: 'MCQ',
    },
    answer: Number,
    correct: Boolean,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

exports.MCQAnswer = mongoose.model('MCQAnswer', mcqAnswerSchema)
