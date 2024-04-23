const mongoose = require('mongoose')
const Lecture = require('./LectureModel')
const Teacher = require('../Users/TeacherModel')
const catchAsync = require('../../utils/catchAsync')
const courseSchema = new mongoose.Schema(
  {
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
    teachers: Array, //Teacher
    lectures: Array, //Lecture
    prerequisites: Array, //Course
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

const Course = mongoose.model('Course', courseSchema)
// Embed document on Saving
courseSchema.pre(
  'save',
  catchAsync(async function (next) {
    const lecturesPromises = this.lectures.map(
      async (id) => await Lecture.findById(id),
    )
    const teachersPromises = this.teachers.map(
      async (id) => await Teacher.findById(id),
    )
    const prerequisitesPromises = this.prerequisites.map(
      async (id) => await Course.findById(id),
    )
    this.prerequisites = await Promise.all(prerequisitesPromises)
    this.teachers = await Promise.all(teachersPromises)
    this.lectures = await Promise.all(lecturesPromises)
    next()
  }),
)

module.exports = Course
