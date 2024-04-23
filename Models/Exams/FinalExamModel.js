const mongoose = require('mongoose')

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
    passingPercentage: Number,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

exports.FinalExam = mongoose.model('FinalExam', finalExamSchema)
