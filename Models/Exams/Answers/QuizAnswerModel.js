const mongoose = require('mongoose')
const MCQAnswer = require('./MCQAnswerModel')

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
    durationInMins: Number,
    lectureQuizzesGrades: Array, //MCQAnswer
    score: Number,
    scoreFrom: Number,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)
const fillEmbedded = (fieldToFill, Model) => {
  catchAsync(async function (next) {
    const fieldPromises = fieldToFill.map(
      async (id) => await Model.findById(id),
    )
    fieldToFill = await Promise.all(fieldPromises)
    next()
  })
}

quizAnswerSchema.pre('save', () => {
  fillEmbedded(this.lectureQuizzesGrades, MCQAnswer)
})

const QuizAnswer = mongoose.model('QuizAnswer', quizAnswerSchema)
module.exports = QuizAnswer
