const mongoose = require('mongoose')
const courseSchema = new mongoose.Schema({
  text: String,
  level: Number,
  description: String,
  subject: {
    type: String,
    enum: ['aqeedah', 'hadeeth', 'fiqh', 'tafseer'],
  },
  book: {
    type: mongoose.Schema.ObjectId,
    ref: 'Book',
    required: [true, 'A Course must have a book'],
  },
  students: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Student',
    },
  ],
  teachers: Array,
  lectures: Array,
  prerequisites: Array,
})
const Course = mongoose.model('Course', courseSchema)

module.exports = Course
