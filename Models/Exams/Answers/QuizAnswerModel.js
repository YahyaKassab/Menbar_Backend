const mongoose = require('mongoose')
const MCQAnswer = require('./MCQAnswerModel')
const catchAsync = require('../../../utils/catchAsync')

const quizAnswerSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.ObjectId,
      ref: 'Student',
      required: [true, 'A grade must have a student'],
    },
    quiz: {
      type: mongoose.Schema.ObjectId,
      ref: 'LectureQuiz',
    },
    //MCQAnswer[]
    beginAtTime: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    endAtTime: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    lectureQuizzesGrades: Array, //MCQAnswer
    scoreFrom: Number,
    tries: {
      type: Number,
      default: 1,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)
quizAnswerSchema.virtual('durationInMins').get(function () {
  // Calculate duration in minutes
  const beginAtTime = this.beginAtTime.getTime() // Convert to milliseconds
  const endAtTime = this.endAtTime.getTime() // Convert to milliseconds
  const durationInMilliseconds = endAtTime - beginAtTime
  return Math.round(durationInMilliseconds / (1000 * 60)) // Convert milliseconds to minutes
})
quizAnswerSchema.virtual('score').get(function () {
  return (correctCount = this.lectureQuizzesGrades.filter(
    (quiz) => quiz.correct,
  ).length)
})

quizAnswerSchema.pre(/^find/, function (next) {
  this.populate('quiz')

  next()
})

const fillEmbedded = (fieldToFill, Model) => {
  catchAsync(async function (next) {
    const fieldPromises = fieldToFill.map(
      async (id) => await Model.findById(id),
    )
    fieldToFill = await Promise.all(fieldPromises)
    next()
  })
}

quizAnswerSchema.pre('save', () =>
  fillEmbedded(this.lectureQuizzesGrades, MCQAnswer),
)

const QuizAnswer = mongoose.model('QuizAnswer', quizAnswerSchema)
module.exports = QuizAnswer
