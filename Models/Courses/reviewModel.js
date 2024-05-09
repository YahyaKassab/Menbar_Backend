const mongoose = require('mongoose')

const ReviewSchema = new mongoose.Schema({
  review: {
    type: String,
    required: [true, 'Review can not be empty'],
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  student: {
    type: mongoose.Schema.ObjectId,
    ref: 'Student',
  },
})

ReviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'student',
    select: 'user.Fname user.email',
  })
  next()
})

const Review = mongoose.model('Review', ReviewSchema)
module.exports = Review
