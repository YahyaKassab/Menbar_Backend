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
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

bookSchema.virtual('course', {
  ref: 'Course',
  localField: '_id',
  foreignField: 'book',
})
const Book = mongoose.model('Book', bookSchema)
module.exports = Book
