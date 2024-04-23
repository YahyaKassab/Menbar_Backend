const mongoose = require('mongoose')

exports.quizAnswerSchema = new mongoose.Schema(
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

exports.QuizAnswer = mongoose.model('QuizAnswer', quizAnswerSchema)
