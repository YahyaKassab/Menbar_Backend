const mongoose = require('mongoose')
const certificateSchema = new mongoose.Schema(
  {
    // reference to the course
    course: {
      type: mongoose.Schema.ObjectId,
      ref: 'Course',
      required: [true, 'A certificate must have a course'],
    },

    student: {
      type: mongoose.Schema.ObjectId,
      ref: 'Student',
      required: [true, 'A certificate must have a student'],
    },

    pdfURL: String,
    Date: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

const Certificate = mongoose.model('Certificate', certificateSchema)

module.exports = Certificate
