const catchAsync = require('../../utils/catchAsync')
const AppError = require('../../utils/appError')
const factory = require('../Handlers/handlerFactory')
const Lecture = require('../../Models/Courses/LectureModel')
const MCQ = require('../../Models/Exams/MCQModel')
const MEQ = require('../../Models/Exams/MEQModel')
const LectureQuiz = require('../../Models/Exams/LectureQuizModel')
const FinalExam = require('../../Models/Exams/FinalExamModel')

// #region Final
exports.getAllFinals = factory.getAll(FinalExam)
exports.getFinal = factory.getOne(FinalExam)
exports.createFinal = factory.createOne(FinalExam)

exports.generateFinal = catchAsync(async (req, res, next) => {
  const { courseId } = req.params
  const mcqNumber = parseInt(req.query.mcqNumber)
  const meqNumber = parseInt(req.query.meqNumber)

  // Validate the query parameters
  if (isNaN(mcqNumber) || isNaN(meqNumber)) {
    return new AppError('mcqNumber and meqNumber must be valid numbers', 400)
  }
  if (mcqs.length < mcqNumber || meqs.length < meqNumber) {
    return new AppError(
      'Not enough MCQs or MEQs available for the requested numbers',
      400,
    )
  }

  // Find all MCQs and MEQs for the given course
  const mcqs = await MCQ.find({ course: courseId })
  const meqs = await MEQ.find({ course: courseId })

  // Function to get random elements from an array
  const getRandomElements = (arr, num) => {
    const shuffled = arr.sort(() => 0.5 - Math.random())
    return shuffled.slice(0, num)
  }

  // Select random MCQs and MEQs
  const selectedMcqs = getRandomElements(mcqs, mcqNumber)
  const selectedMeqs = getRandomElements(meqs, meqNumber)

  req.body.mcqs = selectedMcqs.map((mcq) => mcq._id)
  req.body.meqs = selectedMeqs.map((meq) => meq._id)
  req.body.course = courseId

  const generatedFinal = await FinalExam.create(req.body)

  res.status(201).json({
    status: 'success',
    data: generatedFinal,
  })
})
exports.updateFinal = factory.updateOne(FinalExam)
exports.deleteFinal = factory.deleteOne(FinalExam)
// #endregion

// #region Quiz
exports.getQuizTeacher = factory.getOne(LectureQuiz, [
  { path: 'lecture', select: 'name' },
  { path: 'mcq' },
  { path: 'numberOfAnswers' },
  { path: 'avgTries' },
])
//check if student lecture opened
exports.getQuizStudent = factory.getOne(LectureQuiz, [
  { path: 'lecture', select: 'name' },
  { path: 'mcq' },
])
exports.createQuiz = factory.createOne(LectureQuiz)
exports.getAllQuizzes = factory.getAll(LectureQuiz)
exports.updateQuiz = factory.updateOne(LectureQuiz)
exports.deleteQuiz = factory.deleteOne(LectureQuiz)
// #endregion

// #region MCQ

exports.createMcq = factory.createOne(MCQ)
exports.updateMcq = factory.updateOne(MCQ)
exports.deleteMcq = factory.deleteOne(MCQ)
exports.getAllMcq = factory.getAll(MCQ)
exports.getOneMcq = factory.getOne(MCQ)
exports.mcqIds = factory.getIds(MCQ)

exports.getAllMcqForCourse = catchAsync(async (req, res, next) => {
  const { courseId } = req.params
  const mcqs = await MCQ.find({ course: courseId })
  res.status(200).json({
    status: 'Success',
    results: mcqs.length,
    data: { data: mcqs },
  })
})
exports.getAllMcqForLecture = catchAsync(async (req, res, next) => {
  const { lectureId } = req.params
  const mcqs = await MCQ.find({ lecture: lectureId })
  res.status(200).json({
    status: 'Success',
    results: mcqs.length,
    data: { data: mcqs },
  })
})

// #endregion

// #region MEQ
exports.getAllMeqForCourse = catchAsync(async (req, res, next) => {
  const { courseId } = req.params
  const meqs = await MEQ.find({ course: courseId })
  res.status(200).json({
    status: 'Success',
    results: meqs.length,
    data: { data: meqs },
  })
})
exports.meqIds = factory.getIds(MEQ)

exports.createMeq = factory.createOne(MEQ)
exports.updateMeq = factory.updateOne(MEQ)
exports.deleteMeq = factory.deleteOne(MEQ)
exports.getAllMeq = factory.getAll(MEQ)
exports.getOneMeq = factory.getOne(MEQ)

// #endregion
exports.getAllQuestions = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    const courseId = req.body.course

    // Allow nested routes
    let mcqQuery = MCQ.find({ course: courseId })
    let meqQuery = MEQ.find({ course: courseId })

    if (popOptions) {
      mcqQuery = mcqQuery.populate(popOptions)
      meqQuery = meqQuery.populate(popOptions)
    }

    // Apply pagination, filtering, sorting, etc.
    const mcqFeatures = new APIFeatures(mcqQuery, req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate()

    const meqFeatures = new APIFeatures(meqQuery, req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate()

    // Execute MCQ query
    const mcqDocs = await mcqFeatures.query

    // Execute MEQ query
    const meqDocs = await meqFeatures.query

    // Calculate total number of questions
    const totalQuestions = mcqDocs.length + meqDocs.length

    // Construct response object
    const responseData = {
      MCQ: mcqDocs,
      MEQ: meqDocs,
      totalQuestions: totalQuestions,
    }

    // Send response
    res.status(200).json({
      status: 'Success',
      result: totalQuestions,
      data: responseData,
    })
  })
