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
    mcqs: Array, //MCQ
    meqs: Array, //MEQ
    opensAt: Date,
    closesAt: Date,
    year: Number,
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

finalExamSchema.pre(
  'save',
  () => fillEmbedded(this.mcqs, MCQ),
  () => fillEmbedded(this.meqs, MEQ),
)

finalExamSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'course',
    select: 'text level description subject',
  })

  next()
})
finalExamSchema.virtual('numberOfAnswers').get(async function () {
  const count = await FinalExamStudentAnswer.countDocuments({ exam: this._id })
  return count
})
const FinalExam = mongoose.model('FinalExam', finalExamSchema)
module.exports = FinalExam
