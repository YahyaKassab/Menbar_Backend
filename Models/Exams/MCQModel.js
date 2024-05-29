const mongoose = require('mongoose')

const mcqSchema = new mongoose.Schema(
  {
    lecture: {
      type: mongoose.Schema.ObjectId,
      ref: 'Lecture',
    },
    course: {
      type: mongoose.Schema.ObjectId,
      ref: 'Course',
    },
    question: String,
    page: Number,
    choices: [String],
    answer: Number,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

const MCQ = mongoose.model('MCQ', mcqSchema)

module.exports = MCQ
