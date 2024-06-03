const catchAsync = require('../../utils/catchAsync')
const AppError = require('../../utils/appError')
const factory = require('../Handlers/handlerFactory')
const MCQAnswer = require('../../Models/Exams/Answers/MCQAnswerModel')
const QuizAnswer = require('../../Models/Exams/Answers/QuizAnswerModel')
const MEQAnswer = require('../../Models/Exams/Answers/MEQAnswerModel')
const FinalExamStudentAnswer = require('../../Models/Exams/Answers/FinalExamStudentAnswerModel')
const LectureQuiz = require('../../Models/Exams/LectureQuizModel')
const LectureStat = require('../../Models/Student/LectureStatModel')
const Student = require('../../Models/Users/StudentModel')
const Certificate = require('../../Models/Student/CertificateModel')
const Lecture = require('../../Models/Courses/LectureModel')
const CourseStat = require('../../Models/Student/CourseStatModel')

// #region Final

exports.submitFinalAnswer = catchAsync(async function (req, res, next) {
  const { body } = req
  req.body.student = req.student

  // Create and mark MCQ answers
  const answers = await MCQAnswer.create(body.mcqs)
  await Promise.all(answers.map((answer) => answer.mark()))

  // Update body with created MCQ answers
  body.mcqs = answers
  const newBody = factory.exclude(body, [
    'score',
    'scoreFrom',
    'marked',
    'mcqScore',
    'meqScore',
  ])
  // Create final exam answer
  const finalAnswer = await FinalExamStudentAnswer.create(newBody)

  // Find student and populate courseStats
  const student = await Student.findById(req.student).populate('courseStats')

  // Assign final answer to courseStats

  student.courseStats.finalAnswers = finalAnswer.id
  await student.save()

  // Check if student has passed the course and create certificate if needed
  await student.checkAndCreateCertificate()

  if (student.courseStats.passed) {
    const certificate = await Certificate.create({
      course: student.courseStats.course,
      imageURL: 'URL_of_the_certificate_image',
      Date: new Date(),
    })
    student.certificates.push(certificate)
    await student.save()
  }

  // Respond with success
  res.status(201).json({
    status: 'Success',
    data: finalAnswer,
  })
})

exports.getAllFinalAnswers = factory.getAll(FinalExamStudentAnswer, {
  path: 'student',
  select: 'Fname',
})

exports.getFinalAnswer = factory.getOne(FinalExamStudentAnswer, [
  'student',
  'exam',
])
exports.markMeq = catchAsync(async function (req, res, next) {
  const { meqId, score, feedback } = req.body

  // Assuming you have the student answer ID (e.g., from a URL parameter)
  const studentAnswerId = req.params.id

  // Update the MEQs array
  const doc = await FinalExamStudentAnswer.findOneAndUpdate(
    { _id: studentAnswerId },
    {
      $set: {
        'meqs.$[elem].score': score,
        'meqs.$[elem].feedback': feedback,
        marked: true,
      },
    },
    {
      arrayFilters: [{ 'elem.meqId': meqId }],
      new: true, // Return the updated document
    },
  )
  if (!doc)
    return res
      .status(404)
      .json({ status: 'Error', message: 'Student answer not found' })

  res.status(200).json({ status: 'Success', data: doc })
})

// #endregion

// #region Quiz
exports.submitQuiz = catchAsync(async (req, res, next) => {
  // #region Find the student and populate courseStats and lecturesStats
  const student = await Student.findById(req.body.student)
  const courseStats = await CourseStat.find({
    _id: { $in: student.courseStats },
  })

  if (!student) {
    return next(new AppError('No student found with that ID', 404))
  }
  // #endregion

  // #region Check if the lecture is open for the student
  const lectureId = req.body.lecture
  const lectureStat = await LectureStat.findOne({
    lecture: lectureId,
    student: req.body.student,
  })

  if (!lectureStat || !lectureStat.open) {
    return next(new AppError('The lecture is not open for the student', 403))
  }
  // #endregion

  // #region Create and mark MCQ answers
  req.body.lectureQuizzesGrades = req.body.lectureQuizzesGrades.map(
    (grade) => ({
      ...grade,
      student: req.body.student,
    }),
  )

  const mcqAnswers = await MCQAnswer.create(req.body.lectureQuizzesGrades)
  for (const answer of mcqAnswers) {
    await answer.mark()
  }
  // #endregion

  // #region Create the quiz answer
  const fields = factory.exclude(req.body, ['score'])
  const body = {
    ...fields,
    lectureQuizzesGrades: mcqAnswers,
  }
  const quizAnswer = await QuizAnswer.create(body)
  // #endregion

  const quiz = await LectureQuiz.findById(quizAnswer.quiz)

  // #region Update lecture grades, scores, done?
  lectureStat.latestQuizGrade = quizAnswer
  lectureStat.latestQuizScore = quizAnswer.score
  lectureStat.bestQuizScore = Math.max(
    lectureStat.bestQuizScore || 0,
    quizAnswer.score || 0,
  )
  lectureStat.done = lectureStat.bestQuizScore === quizAnswer.scoreFrom

  await lectureStat.save()
  // #endregion

  // #region Update open property in the next lecture
  const lecture = await Lecture.findById(req.body.lecture)
  const nextOrder = lecture.order + 1
  const nextLectureStat = await LectureStat.findOne({
    student: req.body.student,
    order: nextOrder,
    courseStat: lectureStat.courseStat,
  })

  if (nextLectureStat && lectureStat.done) {
    nextLectureStat.open = true
    await nextLectureStat.save()
  }
  // #endregion

  // #region Respond with success
  res.status(201).json({
    status: 'Success',
    data: quizAnswer, // Assuming you want to return the created quiz in the response
  })
  // #endregion
})

// #endregion

// #region two funcions misplaced
/*

exports.submitQuiz = catchAsync(async (req, res, next) => {
  const studentId = req.body.student

  // Create the quiz answer
  const quizAnswer = await QuizAnswer.create(
    factory.exclude(req.body, excludedFields),
  ).populate({
    path: 'lecture',
    populate: {
      path: 'quiz',
      model: 'LectureQuiz',
    },
  })
  const quiz = quizAnswer.lecture.quiz
  // Find the lectureStat for the student
  const student = await Student.findById(student).populate({
    path: 'courseStats',
    populate: {
      path: 'lecturesStats',
    },
  })
  if (!student) {
    return next(new AppError('No student found with that ID', 404))
  }
  // #region Update lecture grades, scores, done?
  // Assuming req.body.lecture contains the lecture ID to match
  const lectureId = req.body.lecture
  let currentLectureStat

  for (const courseStat of courseStats) {
    currentLectureStat = courseStat.lecturesStats.find(
      (lectureStat) => lectureStat.lecture.toString() === lectureId.toString(),
    )
    if (currentLectureStat) break
  }

  if (!currentLectureStat) {
    return next(new AppError('No lectureStat found with that lecture ID', 404))
  }

  // Assign the quiz to the latestQuizGrade field
  currentLectureStat.latestQuizGrade = quizAnswer
  currentLectureStat.latestQuizScore = quizAnswer.score
  currentLectureStat.bestQuizScore = Math.max(
    currentLectureStat.bestQuizScore,
    quizAnswer.score,
  )
  currentLectureStat.done = quizAnswer.score == quizAnswer.scoreFrom
  // Save the updated lectureStat
  await currentLectureStat.save()
  // #endregion

  // #region Update open property in the next lecture
  const nextOrder = currentLectureStat.order + 1
  let nextLectureStat

  for (const courseStat of student.courseStats) {
    nextLectureStat = courseStat.lecturesStats.find(
      (lectureStat) => lectureStat.order === nextOrder,
    )
    if (nextLectureStat) break
  }

  if (!nextLectureStat) {
    return next(
      new AppError(
        'No next lectureStat found with order 1 more than the current one',
        404,
      ),
    )
  }

  // Set the open property to true and save
  nextLectureStat.open = true
  await nextLectureStat.save()
  // #endregion

  // Respond with success
  res.status(201).json({
    status: 'Success',
    data: quizAnswer, // Assuming you want to return the created quiz in the response
  })
})

exports.createQuizAnswer = catchAsync(async function (req, res, next) {
  //1- Create Answer
  //2- Mark
  let body = req.body
  const quizId = req.params.id
  const answers = await MCQAnswer.create(body.lectureQuizzesGrades)
  for (const answer of answers) {
    await answer.mark()
  }
  body.lectureQuizzesGrades = answers

  body.quiz = quizId

  const quiz = await QuizAnswer.create(body)
  res.status(201).json({
    status: 'Success',
    data: quiz,
  })
})
// #
*/
exports.getAllQuizAnswers = factory.getAll(QuizAnswer)
exports.getOneQuizAnswer = factory.getOne(QuizAnswer)
exports.updateAnswer = factory.updateOne(QuizAnswer, [
  'lectureQuizzesGrades',
  'score',
])
exports.deleteAnswer = factory.deleteOne(QuizAnswer)
// #endregion

// #region MCQ
// #endregion

// #region MEQ
// #endregion

exports.createMcqAnswer = factory.createOneExclude(MCQAnswer, ['correct'])

exports.getAllMcqAnswers = factory.getAll(MCQAnswer)

exports.getAllMeqAnswers = factory.getAll(MEQAnswer)

exports.createMeqAnswer = factory.createOneExclude(MEQAnswer, [
  'score',
  'feedback',
])
exports.setQuizAnswerIds = async (req, res, next) => {
  try {
    // Set req.body.student to req.student.id
    req.body.student = req.student.id

    // Set req.body.lecture to req.params.lectureId
    req.body.lecture = req.params.lectureId

    // Fetch the lecture to get the quiz ID
    const lecture = await Lecture.findById(req.params.lectureId).populate([
      'quiz',
    ])
    if (!lecture) {
      throw new Error('Lecture not found')
    }
    // Set req.body.quiz to the quiz ID fetched from the lecture
    req.body.quiz = lecture.quiz[0].id

    // Continue to the next middleware
    next()
  } catch (error) {
    next(error)
  }
}
