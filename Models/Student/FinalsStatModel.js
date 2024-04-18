const mongoose = require('mongoose')
const FinalExamStudentAnswer = require('../Exams/Answers/FinalExamStudentAnswerModel')

const finalsStatSchema = new mongoose.Schema({
  finalsScore: Number,
  passedAt: Date,
  answers: Array,
})

FinalsStatSchema.pre('save', async function (next) {
  const answersPromises = this.answers.map(
    async (id) => await FinalExamStudentAnswer.findById(id),
  )
  this.answers = await Promise.all(answersPromises)
  next()
})

const FinalsStat = User.discriminator('FinalsStat', finalsStatSchema)

module.exports = FinalsStat
