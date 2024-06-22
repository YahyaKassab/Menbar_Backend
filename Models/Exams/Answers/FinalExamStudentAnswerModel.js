const mongoose = require('mongoose')
const MCQAnswer = require('./MCQAnswerModel')
const MEQAnswer = require('./MEQAnswerModel')
const catchAsync = require('../../../utils/catchAsync')

const finalExamStudentAnswerSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.ObjectId,
      ref: 'Student',
      required: [true, 'An answer must have a student'],
    },
    courseStat: {
      type: mongoose.Schema.ObjectId,
      ref: 'CourseStat',
      required: [true, 'A stat must have a courseStat'],
    },
    exam: {
      type: mongoose.Schema.ObjectId,
      ref: 'FinalExam',
      required: [true, 'An answer must have an exam'],
    },
    course: {
      type: mongoose.Schema.ObjectId,
      ref: 'Course',
      required: [true, 'An answer must have a course'],
    },
    mcqs: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'MCQAnswer',
        required: [true, 'An answer must have an mcq answers'],
      },
    ], //MCQAnswer
    meqs: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'MEQAnswer',
        required: [true, 'An answer must have an meq answers'],
      },
    ], //MEQAsnwer
    marked: Boolean,
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
    mcqScore: Number,
    meqScoreTeacher: Number,
    meqScoreAi: Number,
    score: Number,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

const FinalExamStudentAnswer = mongoose.model(
  'FinalExamStudentAnswer',
  finalExamStudentAnswerSchema,
)
module.exports = FinalExamStudentAnswer
