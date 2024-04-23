const mongoose = require('mongoose')
const bookSchema = new mongoose.Schema(
  {
    // reference to the course
    title: String,
    imageURL: String,
    description: String,
    readLink: String,
    downloadLink: String,
  },
  {
    _id: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)
// const Book = mongoose.model('Book', bookSchema)
module.exports = bookSchema
