const mongoose = require('mongoose')

exports.mcqSchema = new mongoose.Schema(
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

exports.MCQ = mongoose.model('MCQ', mcqSchema)
