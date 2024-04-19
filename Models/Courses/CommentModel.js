const mongoose = require('mongoose')
const commentSchema = new mongoose.Schema({
  text: String,
  lecture: {
    type: mongoose.Schema.ObjectId,
    ref: 'Lecture',
    required: [true, 'A comment must have a lecture'],
  },
  student: {
    type: mongoose.Schema.ObjectId,
    ref: 'Student',
    required: [true, 'A comment must have a student'],
  },

  upvotes: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Student',
    },
  ],
  downvotes: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Student',
    },
  ],
  totalScore: { type: Number, default: 0 },
  replies: Array,
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
})
const Comment = mongoose.model('Comment', commentSchema)

module.exports = Comment
