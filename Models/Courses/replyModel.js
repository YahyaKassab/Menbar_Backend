const mongoose = require('mongoose')

const replySchema = new mongoose.Schema({
  reply: String,
  student: {
    type: mongoose.Schema.ObjectId,
    ref: 'Student',
  },
  comment: {
    type: mongoose.Schema.ObjectId,
    ref: 'Comment',
  },
})
replySchema.pre(/^find/, function (next) {
  this.populate({
    path: 'student',
    select: 'user.Fname',
  })
  next()
})
const Reply = mongoose.model('replies', replySchema)

module.exports = Reply
