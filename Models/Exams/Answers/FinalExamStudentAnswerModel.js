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
  if (this.mcqs && this.mcqs.length > 0) {
    const score = this.mcqs.filter((mcq) => mcq.correct).length
    const percentage = score / this.mcqs.length
    return percentage
  }
  return 0
})

finalExamStudentAnswerSchema.virtual('meqScoreTeacher').get(function () {
  if (this.meqs && this.meqs.length > 0) {
    return this.meqs.reduce((totalScore, meq) => {
      const score = totalScore + (meq.scoreByTeacher || 0)

      return score / (this.meqs.length * 5)
    }, 0)
  }
  return 0
})

finalExamStudentAnswerSchema.virtual('meqScoreAi').get(function () {
  if (this.meqs && this.meqs.length > 0) {
    const totalScore = this.meqs.reduce(
      (total, meq) => total + (meq.scoreByAi || 0),
      0,
    )
    const maximumScore = this.meqs.length * 5 // Maximum score for all MEQs
    const normalizedScore = totalScore / maximumScore

    return normalizedScore // Normalized score out of 1
  }
  return 0
})

//Score of 90
finalExamStudentAnswerSchema.virtual('score').get(function () {
  const totalMcqScore = this.mcqScore || 0
  const totalMeqScore = this.meqScoreAi || this.meqScoreTeacher || 0

  const scoreOutOf90 = (totalMcqScore + totalMeqScore) * 45

  return scoreOutOf90
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
