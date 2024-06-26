const mongoose = require('mongoose')
const bookSchema = new mongoose.Schema(
  {
    // reference to the course
    title: String,
    imageURL: String,
    description: String,
    readLink: String,
    downloadLink: String,
    course: {
      type: mongoose.Schema.ObjectId,
      ref: 'Course',
      required: [true, 'A Book must have a Course'],
      unique: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

const Book = mongoose.model('Book', bookSchema)
module.exports = Book
