const mongoose = require('mongoose')
const FinalExamStudentAnswer = require('./Answers/FinalExamStudentAnswerModel')

exports.finalExamSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.ObjectId,
      ref: 'Course',
      required: [true, 'An answer must have a Course'],
    },
    durationInMins: Number,
    mcqs: Array, //MCQ
    meqs: Array, //MEQ
    // opensAt: Date,
    // closesAt: Date,
    passingPercentage: Number,
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
exports.FinalExam = mongoose.model('FinalExam', finalExamSchema)
