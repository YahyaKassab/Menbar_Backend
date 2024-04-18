const mongoose = require('mongoose')
const MCQAnswer = require('../Exams/Answers/MCQAnswerModel')

const mcqGradesSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.ObjectId,
    ref: 'Student',
    required: [true, 'A grade must have a student'],
  },
  quiz: {
    type: mongoose.Schema.ObjectId,
    ref: 'LectureQuiz',
  },
  lectureQuizzesGrades: Array,
  score: Number,
  scoreFrom: Number,
})

mcqGradesSchema.pre('save', async function (next) {
  const lectureQuizzesGradesPromises = this.lectureQuizzesGrades.map(
    async (id) => await MCQAnswer.findById(id),
  )
  this.lectureQuizzesGrades = await Promise.all(lectureQuizzesGradesPromises)
  next()
})

const MCQGrades = User.discriminator('MCQGrades', mcqGradesSchema)

module.exports = MCQGrades
