const mongoose = require('mongoose')

exports.quizAnswerSchema = new mongoose.Schema({
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
  answers: Array,
  durationInMins: Number,
  lectureQuizzesGrades: Array,
  score: Number,
  scoreFrom: Number,
})

exports.QuizAnswer = mongoose.model('QuizAnswer', quizAnswerSchema)
