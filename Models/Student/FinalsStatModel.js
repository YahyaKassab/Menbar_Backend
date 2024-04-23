const mongoose = require('mongoose')
const {
  finalExamStudentAnswerSchema,
} = require('../Exams/Answers/FinalExamStudentAnswerModel')

const finalsStatSchema = new mongoose.Schema(
  {
    finalsScore: Number,
    passedAt: Date,
    answers: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'FinalExamStudentAnswer',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

finalsStatSchema.pre('save', async function (next) {
  const answersPromises = this.answers.map(
    async (id) => await FinalExamStudentAnswer.findById(id),
  )
  this.answers = await Promise.all(answersPromises)
  next()
})

const FinalsStat = mongoose.model('FinalsStat', finalsStatSchema)
module.exports = FinalsStat
