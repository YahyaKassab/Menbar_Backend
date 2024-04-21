const mongoose = require('mongoose')
const { bookSchema } = require('./BookModel')
const libraryItemSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.ObjectId,
      ref: 'Course',
    },
    subject: {
      type: String,
      required: [true, 'A LibraryItem must have a subject'],
    },
    book: bookSchema,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)
const LibraryItem = mongoose.model('LibraryItem', libraryItemSchema)

module.exports = LibraryItem
