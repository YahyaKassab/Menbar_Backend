const mongoose = require('mongoose')
const FinalExamStudentAnswer = require('./Answers/FinalExamStudentAnswerModel')
const MCQ = require('./MCQModel')
const MEQ = require('./MEQModel')
const catchAsync = require('../../utils/catchAsync')

const finalExamSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.ObjectId,
      ref: 'Course',
      required: [true, 'An answer must have a Course'],
    },
    durationInMins: Number,
    mcqs: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'MCQ',
        required: [true, 'An answer must have mcqs'],
      },
    ], //MCQ
    meqs: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'MEQ',
        required: [true, 'An answer must have meqs'],
      },
    ], //MEQ
    opensAt: Date,
    closesAt: Date,
    year: Number,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)
finalExamSchema.virtual('numberOfAnswers').get(async function () {
  const count = await FinalExamStudentAnswer.countDocuments({ exam: this._id })
  return count
})

finalExamSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'course',
    select: 'text level description subject',
  })

  next()
})
const FinalExam = mongoose.model('FinalExam', finalExamSchema)
module.exports = FinalExam
