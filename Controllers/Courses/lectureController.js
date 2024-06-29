const catchAsync = require('../../utils/catchAsync')
const AppError = require('../../utils/appError')
const factory = require('../Handlers/handlerFactory')
const Lecture = require('../../Models/Courses/LectureModel')
const Student = require('../../Models/Users/StudentModel')
const CourseStat = require('../../Models/Student/CourseStatModel')
const LectureStat = require('../../Models/Student/LectureStatModel')

exports.createLecture =  catchAsync(async (req, res, next) => {
  if(!req.body.order){
    const lastLecture = await Lecture.findOne({ course: req.body.course }).sort({ order: -1 });
    req.body.order = lastLecture.order + 1
    }
  const lecture = await Lecture.create(req.body)
  const courseStats = await CourseStat.find({course:lecture.course})
  courseStats.forEach(async courseStat => {
    await LectureStat.create({
      lecture:lecture.id,
      student:courseStat.student,
      courseStat:courseStat.id,
    })
  });
      res.status(201).json({
      status: 'Success',
      data: lecture,
    })
})
factory.createOne(Lecture)
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
exports.nextLecture = catchAsync(async (req, res, next) => {
  const order = req.params.order * 1 + 1
  const course = req.params.course
  const nextLecture = await Lecture.findOne({
    order,
    course,
  }).populate(['comments', 'course', 'quiz'])
  if (!nextLecture) {
    return next(new AppError('هذه اخر محاضرة', 404))
  }

  res.status(200).json({
    status: 'Success',
    data: nextLecture,
  })
})
exports.prevLecture = catchAsync(async (req, res, next) => {
  const order = req.params.order * 1 - 1
  const course = req.params.course
  const prevLecture = await Lecture.findOne({
    order,
    course,
  }).populate(['comments', 'course', 'quiz'])
  if (!prevLecture) {
    return next(new AppError('هذه أول محاضرة', 404))
  }

  res.status(200).json({
    status: 'Success',
    data: prevLecture,
  })
})
