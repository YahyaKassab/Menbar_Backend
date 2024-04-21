const mongoose = require('mongoose')
exports.bookSchema = new mongoose.Schema(
  {
    // reference to the course
    title: String,
    imageURL: String,
    description: String,
    readLink: String,
    downloadLink: String,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)
exports.Book = mongoose.model('Book', bookSchema)
