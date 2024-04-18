const mongoose = require('mongoose')
const {
  finalExamStudentAnswerSchema,
} = require('../Exams/Answers/FinalExamStudentAnswerModel')

exports.finalsStatSchema = new mongoose.Schema({
  finalsScore: Number,
  passedAt: Date,
  answers: finalExamStudentAnswerSchema,
})

FinalsStatSchema.pre('save', async function (next) {
  const answersPromises = this.answers.map(
    async (id) => await FinalExamStudentAnswer.findById(id),
  )
  this.answers = await Promise.all(answersPromises)
  next()
})

exports.FinalsStat = mongoose.model('FinalsStat', finalsStatSchema)
