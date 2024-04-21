const mongoose = require('mongoose')

exports.finalExamSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.ObjectId,
      ref: 'Course',
      required: [true, 'An answer must have a Course'],
    },
    durationInMins: Number,
    //MCQ
    mcqs: Array,
    //MEQ
    meqs: Array,
    passingPercentage: Number,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

exports.FinalExam = mongoose.model('FinalExam', finalExamSchema)
