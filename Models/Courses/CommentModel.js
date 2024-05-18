const mongoose = require('mongoose')
const commentSchema = new mongoose.Schema(
  {
    text: String,
    student: {
      type: mongoose.Schema.ObjectId,
      ref: 'Student',
      required: [true, 'A comment must have a student'],
    },
    lecture: {
      type: mongoose.Schema.ObjectId,
      ref: 'Lecture',
      required: [true, 'A comment must have a lecture'],
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
commentSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'student',
    select: 'user.Fname',
  })
  this.populate({
    path: 'replies',
  })
  next()
})

const Comment = mongoose.model('Comment', commentSchema)

module.exports = Comment
