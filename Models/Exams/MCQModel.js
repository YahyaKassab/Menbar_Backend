const mongoose = require('mongoose')

const mcqSchema = new mongoose.Schema(
  {
    lecture: {
      type: mongoose.Schema.ObjectId,
      ref: 'Lecture',
    },
    question: String,
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
