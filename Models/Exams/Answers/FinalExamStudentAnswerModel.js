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
    course: {
      type: mongoose.Schema.ObjectId,
      ref: 'Course',
      required: [true, 'An answer must have a course'],
    },
    mcqs: {
      type: mongoose.Schema.ObjectId,
      ref: 'MCQAnswer',
      required: [true, 'An answer must have an mcq answers'],
    }, //MCQAnswer
    meqs: {
      type: mongoose.Schema.ObjectId,
      ref: 'MEQAnswer',
      required: [true, 'An answer must have an meq answers'],
    }, //MEQAsnwer
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

// finalExamStudentAnswerSchema.statics.createFinalAnswer = async function (body) {
//   const newBody = factory.exclude(body, ['score', 'scoreFrom', 'marked'])
//   return await this.create(newBody)
// }
// Virtual for mcqScore
finalExamStudentAnswerSchema.virtual('mcqScore').get(function () {
  if (this.mcqs && Array.isArray(this.mcqs)) {
    return this.mcqs.filter((mcq) => mcq.correct).length
  }
  return 0
})
// Define the virtual field
finalExamStudentAnswerSchema.virtual('meqScoreTeacher').get(function () {
  // Ensure meqs is an array and not empty
  if (this.meqs && this.meqs.length > 0) {
    return this.meqs.reduce((totalScore, meq) => {
      return totalScore + (meq.scoreByTeacher || 0)
    }, 0)
  }
  return 0 // Return 0 if meqs array is empty or undefined
})

// Define the virtual field
finalExamStudentAnswerSchema.virtual('meqScoreAi').get(function () {
  // Ensure meqs is an array and not empty
  if (this.meqs && this.meqs.length > 0) {
    return this.meqs.reduce((totalScore, meq) => {
      return totalScore + (meq.scoreByAi || 0)
    }, 0)
  }
  return 0 // Return 0 if meqs array is empty or undefined
})

finalExamStudentAnswerSchema.virtual('score').get(function () {
  // Retrieve the scoreFrom value from the document
  const scoreFrom = this.scoreFrom || 1 // Default to 1 if scoreFrom is not defined (to prevent division by zero)

  // Calculate the total score based on actual scores
  const totalMcqScore = this.mcqScore || 0
  const totalMeqScore = this.meqScoreTeacher || this.meqScoreAi || 0

  // Calculate total score
  const totalScore = totalMcqScore + totalMeqScore

  // Calculate percentage
  const percentageScore = (totalScore / scoreFrom) * 100

  return percentageScore
})

// const fillEmbedded = (fieldToFill, Model) => {
//   catchAsync(async function (next) {
//     const fieldPromises = this.fieldToFill.map(
//       async (id) => await Model.findById(id),
//     )
//     this.field = await Promise.all(fieldPromises)
//     next()
//   })
// }

// finalExamStudentAnswerSchema.pre(
//   'save',
//   () => fillEmbedded(this.mcqs, MCQAnswer),
//   () => fillEmbedded(this.meqs, MEQAnswer),
// )
const FinalExamStudentAnswer = mongoose.model(
  'FinalExamStudentAnswer',
  finalExamStudentAnswerSchema,
)
module.exports = FinalExamStudentAnswer
