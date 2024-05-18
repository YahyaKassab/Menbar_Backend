const mongoose = require('mongoose')
const FinalExamStudentAnswer = require('../Exams/Answers/FinalExamStudentAnswerModel')

const finalsStatSchema = new mongoose.Schema(
  {
    finalsScore: Number,
    passedAt: Date,
    answers: {
      type: mongoose.Schema.ObjectId,
      ref: 'FinalExamStudentAnswer',
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

finalsStatSchema.pre(/^find/, function (next) {
  this.populate('answers')

  next()
})

const FinalsStat = mongoose.model('FinalsStat', finalsStatSchema)
module.exports = FinalsStat
