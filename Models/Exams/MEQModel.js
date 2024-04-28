const mongoose = require('mongoose')

const meqSchema = new mongoose.Schema(
  {
    lecture: {
      type: mongoose.Schema.ObjectId,
      ref: 'Lecture',
    },
    question: String,
    optimalAnswer: String,
    scoreFrom: Number,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

const MEQ = mongoose.model('MEQ', meqSchema)
module.exports = MEQ
