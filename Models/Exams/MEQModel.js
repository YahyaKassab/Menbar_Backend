const mongoose = require('mongoose')

exports.meqSchema = new mongoose.Schema(
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

exports.MEQ = mongoose.model('MEQ', meqSchema)
