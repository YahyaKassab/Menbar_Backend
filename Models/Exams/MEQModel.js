const mongoose = require('mongoose')

const meqSchema = new mongoose.Schema(
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
    optimalAnswer: String,
    keywords: [String],
    scoreFrom: Number,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

const MEQ = mongoose.model('MEQ', meqSchema)
module.exports = MEQ
