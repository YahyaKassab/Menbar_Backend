const mongoose = require('mongoose')

exports.finalExamStudentAnswerSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.ObjectId,
      ref: 'Student',
      required: [true, 'An answer must have a student'],
    },
    exam: {
      type: mongoose.Schema.ObjectId,
      ref: 'FinalExam',
      required: [true, 'An answer must have an exam'],
    },
    mcq: Array,
    meq: Array,
    score: Number,
    scoreFrom: Number,
    marked: Boolean,
    revised: Boolean,
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
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

exports.FinalExamStudentAnswer = mongoose.model(
  'FinalExamStudentAnswer',
  finalExamStudentAnswerSchema,
)
