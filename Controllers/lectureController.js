const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const factory = require('./handlerFactory')
const Lecture = require('../Models/Courses/LectureModel')

exports.createLecture = factory.createOne(Lecture)
exports.getAllLecture = factory.getAll(Lecture)
exports.getOneLecture = factory.getOne(Lecture, { path: 'comments' })
exports.updateLecture = factory.updateOne(Lecture)
exports.deleteLecture = factory.deleteOne(Lecture)

exports.getLecturesForGuests = catchAsync(async (req, res, next) => {
  const lectures = await Lecture.find()
  // console.log(courses)
  const lecForGuest = lectures.map((lec) => ({
    name: lec.name,
    description: lec.description,
  }))
  res.status(200).json({
    status: 'Success',
    results: lectures.length,
    data: { data: lecForGuest },
  })
})
