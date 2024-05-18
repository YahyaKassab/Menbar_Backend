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
    exam: {
      type: mongoose.Schema.ObjectId,
      ref: 'FinalExam',
      required: [true, 'An answer must have an exam'],
    },
    mcqs: Array, //MCQAnswer
    meqs: Array, //MEQAsnwer
    mcqScore: Number,
    score: Number,
    scoreFrom: Number,
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
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)
const fillEmbedded = (fieldToFill, Model) => {
  catchAsync(async function (next) {
    const fieldPromises = this.fieldToFill.map(
      async (id) => await Model.findById(id),
    )
    this.field = await Promise.all(fieldPromises)
    next()
  })
}

finalExamStudentAnswerSchema.pre(
  'save',
  () => fillEmbedded(this.mcqs, MCQAnswer),
  () => fillEmbedded(this.meqs, MEQAnswer),
)
const FinalExamStudentAnswer = mongoose.model(
  'FinalExamStudentAnswer',
  finalExamStudentAnswerSchema,
)
module.exports = FinalExamStudentAnswer
