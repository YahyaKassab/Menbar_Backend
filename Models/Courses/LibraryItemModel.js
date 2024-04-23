const mongoose = require('mongoose')
const bookSchema = require('./BookModel')
const libraryItemSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.ObjectId,
      ref: 'Course',
    },
    subject: {
      type: String,
      // required: [true, 'A LibraryItem must have a subject'],
    },
    book: bookSchema,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

libraryItemSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'tour',
  //   select: 'name',
  // }).populate({
  //   path: 'user',
  //   select: 'name photo',
  // })
  this.populate({
    path: 'book',
    select: 'title description',
  })
  next()
})

const LibraryItem = mongoose.model('LibraryItem', libraryItemSchema)

module.exports = LibraryItem
