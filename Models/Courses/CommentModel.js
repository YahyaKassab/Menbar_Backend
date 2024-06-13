const mongoose = require('mongoose')
const commentSchema = new mongoose.Schema(
  {
    text: String,
    student: {
      type: mongoose.Schema.ObjectId,
      ref: 'Student',
    },
    teacher: {
      type: mongoose.Schema.ObjectId,
      ref: 'Teacher',
    },
    lecture: {
      type: mongoose.Schema.ObjectId,
      ref: 'Lecture',
    },
    replies: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Comment',
      },
    ],
    totalScore: { type: Number, default: 0 },

    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Custom validator function to ensure either student or teacher is provided
commentSchema.path('teacher').validate(function (value) {
  return !!this.student || !!value
}, 'Either student or teacher must be provided')

// Custom validator function to ensure either student or teacher is provided
commentSchema.path('student').validate(function (value) {
  return !!this.teacher || !!value
}, 'Either student or teacher must be provided')
commentSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'student',
    select: ['Fname', 'Lname', 'photo'],
  })
  this.populate({
    path: 'teacher',
    select: ['Fname', 'Lname', 'photo'],
  })
  this.populate({
    path: 'replies',
  })

  next()
})

const Comment = mongoose.model('Comment', commentSchema)

module.exports = Comment
