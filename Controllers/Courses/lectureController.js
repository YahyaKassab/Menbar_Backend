const catchAsync = require('../../utils/catchAsync')
const AppError = require('../../utils/appError')
const factory = require('../Handlers/handlerFactory')
const Lecture = require('../../Models/Courses/LectureModel')

exports.createLecture = factory.createOne(Lecture)
exports.getAllLectures = factory.getAll(Lecture, { path: 'course' })
exports.getOneLectureTeacher = factory.getOne(Lecture, [
  'comments',
  'course',
  'quiz',
])
exports.updateLecture = factory.updateOne(Lecture)
exports.deleteLecture = factory.deleteOne(Lecture)
exports.ids = factory.getIds(Lecture)

exports.getLectureStudent = factory.getOne(Lecture, [
  'comments',
  'course',
  'quiz',
])
