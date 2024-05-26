const mongoose = require('mongoose')
const Lecture = require('./LectureModel')
const Teacher = require('../Users/TeacherModel')
const Student = require('../Users/StudentModel')
const catchAsync = require('../../utils/catchAsync')
const Book = require('./BookModel')
const courseSchema = new mongoose.Schema(
  {
    text: String,
    level: Number,
    description: String,
    subject: {
      type: String,
      enum: ['aqeedah', 'hadeeth', 'fiqh', 'tafseer'],
    },
    //Lecture
    prerequisites: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Course',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

courseSchema.virtual('teachers', {
  ref: 'Teacher',
  localField: '_id',
  foreignField: 'coursesToTeach',
})
courseSchema.virtual('book', {
  ref: 'Book',
  localField: '_id',
  foreignField: 'course',
})
courseSchema.virtual('lectures', {
  ref: 'Lecture',
  localField: '_id',
  foreignField: 'course',
})
courseSchema.virtual('students', {
  ref: 'Student', // Reference to the Student model
  localField: '_id', // Field from Course model
  foreignField: 'courseStats.course', // Field from CourseStat model
  justOne: false, // We expect multiple students
  options: {
    // Populate the 'courseStats' field in the Student model
    ref: 'CourseStat',
    localField: 'courseStats',
    foreignField: '_id',
    select: 'course', // Select only the 'course' field for matching
  },
})

const Course = mongoose.model('Course', courseSchema)

module.exports = Course
