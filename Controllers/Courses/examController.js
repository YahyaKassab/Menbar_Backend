const catchAsync = require('../../utils/catchAsync')
const AppError = require('../../utils/appError')
const factory = require('../Handlers/handlerFactory')
const Lecture = require('../../Models/Courses/LectureModel')
const MCQ = require('../../Models/Exams/MCQModel')
const MEQ = require('../../Models/Exams/MEQModel')
const LectureQuiz = require('../../Models/Exams/LectureQuizModel')
const FinalExam = require('../../Models/Exams/FinalExamModel')
const Course = require('../../Models/Courses/CourseModel')

// #region Final
exports.getAllFinals = factory.getAll(FinalExam)
exports.getFinal = catchAsync(async (req, res, next) => {
  const exam = await FinalExam.findOne({ course: req.params.courseId })
    .populate({
      path: 'mcqs',
      select: '-answer -page',
    })
    .populate({
      path: 'meqs',
      select: '-optimalAnswer -page',
    })
  if (!exam) return next(new AppError('Final exam not found', 404))
  res.status(200).json({
    status: 'Success',
    data: exam,
  })
})
exports.getFinalTeacher = catchAsync(async (req, res, next) => {
  const exam = await FinalExam.findOne({ course: req.params.courseId })
    .populate({
      path: 'mcqs',
    })
    .populate({
      path: 'meqs',
    })
  if (!exam) return next(new AppError('Final exam not found', 404))
  res.status(200).json({
    status: 'Success',
    data: exam,
  })
})
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
exports.getQuizTeacher = catchAsync(async (req, res, next) => {
  const { lectureId } = req.params

  console.log('lectureId:', lectureId)

  if (!lectureId) {
    return next(new AppError('Lecture ID is required', 400))
  }

  const lectureQuiz = await LectureQuiz.findOne({ lecture: lectureId })

  if (!lectureQuiz) {
    return next(new AppError('No document found with that ID', 404))
  }

  res.status(200).json({
    status: 'success',
    data: lectureQuiz,
  })
})
//check if student lecture opened

exports.getQuizStudent = catchAsync(async (req, res, next) => {
  console.log('params', req.params)
  const quiz = await LectureQuiz.find({ lecture: req.params.lectureId })
    .populate({
      path: 'lecture',
      select: 'name',
    })
    .populate('mcq')
  res.status(200).json({
    status: 'success',
    data: quiz,
  })
})
// exports.setQuizId = catchAsync(async (req, res, next) => {
//   // Find the lecture by ID and populate the 'quiz' virtual property
//   const lecture = await Lecture.findById(req.params.lectureId).populate('quiz')

//   if (!lecture || !lecture.quiz) {
//     return next(new AppError('Lecture or quiz not found', 404))
//   }
//   // Set the quiz ID in req.params
//   req.params.id = lecture.quiz[0]._id
//   console.log('quiz:', req.params.id)

//   // Proceed to the next middleware or route handler
//   next()
// })

exports.createQuiz = catchAsync(async (req, res, next) => {
  // Check if the lecture exists
  const lecture = await Lecture.findById(req.body.lecture)
  if (!lecture) {
    return next(new AppError('No lecture found with that ID', 404))
  }

  // Check if the lecture already has a quiz
  const existingQuiz = await LectureQuiz.findOne({ lecture: req.body.lecture })
  if (existingQuiz) {
    return next(new AppError('Lecture already has a quiz', 400))
  }

  // Create the new quiz
  const newDoc = await LectureQuiz.create(req.body)

  res.status(201).json({
    status: 'success',
    data: newDoc,
  })
})

exports.createAllQuizzes = catchAsync(async (req, res, next) => {
  // Fetch all lectures
  const lectures = await Lecture.find()

  const quizzes = []

  // Iterate through each lecture
  for (const lecture of lectures) {
    // Fetch MCQs for the current lecture
    const mcqs = await MCQ.find({ lecture: lecture._id })

    if (mcqs.length > 0) {
      // Randomly select 3 MCQs
      const selectedMCQs = getRandomElements(mcqs, 3)

      // Create a new quiz
      const quiz = new LectureQuiz({
        lecture: lecture._id,
        mcq: selectedMCQs.map((mcq) => mcq._id),
      })

      await quiz.save()
      quizzes.push(quiz)
    }
  }

  res.status(201).json({
    status: 'success',
    data: {
      quizzes,
    },
  })
})

// Utility function to get 'n' random elements from an array
function getRandomElements(arr, n) {
  const result = new Array(n)
  let len = arr.length
  const taken = new Array(len)

  if (n > len) {
    throw new RangeError(
      'getRandomElements: more elements taken than available',
    )
  }

  while (n--) {
    const x = Math.floor(Math.random() * len)
    result[n] = arr[x in taken ? taken[x] : x]
    taken[x] = --len in taken ? taken[len] : len
  }

  return result
}

exports.createAllFinals = catchAsync(async (req, res, next) => {
  // Fetch all courses
  const courses = await Course.find()

  const finals = []

  // Iterate through each course
  for (const course of courses) {
    // Fetch MCQs for the current course
    const mcqs = await MCQ.find({ course: course._id })

    // Fetch MEQs for the current course
    const meqs = await MEQ.find({ course: course._id })

    // Create a new final exam
    const finalExam = new FinalExam({
      course: course._id,
      durationInMins: 120, // Example duration
      mcqs: mcqs.map((mcq) => mcq._id),
      meqs: meqs.map((meq) => meq._id),
      opensAt: new Date(), // Example opens at current date/time
      closesAt: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // Example closes after 7 days
      year: new Date().getFullYear(), // Example year
    })

    await finalExam.save()
    finals.push(finalExam)
  }

  res.status(201).json({
    status: 'success',
    data: {
      finals,
    },
  })
})

exports.getAllQuizzes = factory.getAll(LectureQuiz)
exports.updateQuiz = catchAsync(async (req, res, next) => {
  const doc = await LectureQuiz.findOneAndUpdate(
    { lecture: req.params.lectureId },
    req.body,
    {
      new: true, // Return the updated document
      runValidators: true, // Run validators on update
    },
  )

  if (!doc) {
    return next(new AppError('No document found with that ID', 404))
  }

  res.status(200).json({
    status: 'Success',
    data: doc,
  })
})
exports.deleteQuiz = catchAsync(async (req, res, next) => {
  const doc = await LectureQuiz.findOneAndDelete({
    lecture: req.params.lectureId,
  })

  if (!doc) {
    return next(new AppError('No document found with that ID', 404))
  }
  res.status(204).json({ status: 'success', data: null })
})
// #endregion

// #region MCQ

exports.createMcq = factory.createOne(MCQ)
exports.createMcqOnLecture = catchAsync(async (req, res, next) => {
  // Find the lecture by ID
  console.log('body', req.body)
  const lecture = await Lecture.findById(req.body.lecture)

  // If the lecture is not found, throw an error
  if (!lecture) {
    return next(new AppError('Lecture not found', 404))
  }

  // Set the course ID in the request body to be the same as the lecture's course
  req.body.course = lecture.course

  // Create the MCQ
  const mcq = await MCQ.create(req.body)

  // Send a response with the created MCQ
  res.status(201).json({
    status: 'success',
    data: {
      mcq,
    },
  })
})
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
  const mcqs = await MCQ.find({ lecture: req.params.lectureId })
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
exports.getAllQuestions = catchAsync(async (req, res, next) => {
  const { courseId } = req.params

  // Allow nested routes
  const mcqDocs = await MCQ.find({ course: courseId })
  const meqDocs = await MEQ.find({ course: courseId })

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
