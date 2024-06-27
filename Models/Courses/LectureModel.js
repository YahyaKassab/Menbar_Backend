const mongoose = require('mongoose')
const Course = require('./CourseModel')
const lectureSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'A lecture must have a name'] },
    description: String,
    order: Number,
    course: {
      type: mongoose.Schema.ObjectId,
      ref: 'Course',
    },
    videoLink: {
      type: String,
      required: [true, 'A lecture must have a video'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

lectureSchema.virtual('quiz', {
  ref: 'LectureQuiz',
  foreignField: 'lecture',
  localField: '_id',
  justOne: true,
})

lectureSchema.virtual('comments', {
  ref: 'Comment',
  foreignField: 'lecture',
  localField: '_id',
})

const Lecture = mongoose.model('Lecture', lectureSchema)

module.exports = Lecture
