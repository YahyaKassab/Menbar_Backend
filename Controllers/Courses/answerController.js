const catchAsync = require('../../utils/catchAsync')
const AppError = require('../../utils/appError')
const factory = require('../Handlers/handlerFactory')
const MCQAnswer = require('../../Models/Exams/Answers/MCQAnswerModel')
const QuizAnswer = require('../../Models/Exams/Answers/QuizAnswerModel')
const MEQAnswer = require('../../Models/Exams/Answers/MEQAnswerModel')
const FinalExamStudentAnswer = require('../../Models/Exams/Answers/FinalExamStudentAnswerModel')
const FinalExam = require('../../Models/Exams/FinalExamModel')
const LectureQuiz = require('../../Models/Exams/LectureQuizModel')
const LectureStat = require('../../Models/Student/LectureStatModel')
const Student = require('../../Models/Users/StudentModel')
const Certificate = require('../../Models/Student/CertificateModel')
const Lecture = require('../../Models/Courses/LectureModel')
const CourseStat = require('../../Models/Student/CourseStatModel')
const Course = require('../../Models/Courses/CourseModel')
const { createCertificate } = require('../../utils/certificatesHandler')
const { uploadPdf } = require('../../utils/cloudinaryMiddleware')

// #region Final

exports.submitFinalAnswer = catchAsync(async function (req, res, next) {
  const { body } = req
  req.body.student = req.student.id

  //1- add mcq and meq to db------------------------

  //mcq
  body.mcqs.forEach((mcq) => {
    mcq.student = req.student.id
  })
  const mcqAnswers = await MCQAnswer.create(body.mcqs)
  body.mcqs = mcqAnswers.map((answer) => answer.id)
  body.meqs.forEach((meq) => {
    meq.student = req.student.id
  })

  //meq
  const meqAnswers = await MEQAnswer.create(body.meqs)
  body.meqs = meqAnswers.map((answer) => answer.id)

  //2- auto mark mcq and meq using AI ----------------
  await Promise.all(mcqAnswers.map((answer) => answer.mark()))
  await Promise.all(meqAnswers.map((answer) => answer.markAi()))

  //3- create the body of answer-------------------
  const answerBody = factory.exclude(body, [
    'score',
    'scoreFrom',
    'marked',
    'mcqScore',
    'meqScore',
  ])
  const course = Course.findById(req.params.courseId)
  const final = FinalExam.findOne({ course: course.id })
  answerBody.student = req.student.id
  answerBody.course = course.id
  answerBody.exam = final.id

  //4- submit------------
  const finalAnswer = await FinalExamStudentAnswer.create(answerBody)
  // Find student and populate courseStats

  //5- edit courseStat
  const courseStat = CourseStat.findOne({
    student: req.student.id,
    course: course.id,
  })

  courseStat.finalAnswers = finalAnswer.id

  // Assign final answer to courseStats

  await courseStat.save()

  // Check if student has passed the course and create certificate if needed

  //6- create certificates

  if (courseStat.passed) {
    const name = req.student.Fname + ' ' + req.student.Lname
    createCertificate(name, courseStat.totalScore, course.subject)
      .then((pdfBuffer) => {
        return uploadPdf(req, pdfBuffer)
      })
      .then(() => {
        next()
      })
      .catch((err) => {
        console.error('Error uploading PDF:', err)
        next(err) // Pass the error to the next middleware
      })
    await Certificate.create({
      student: req.student.id,
      course: course.id,
      pdfURL: req.body.pdfURL,
    })
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

  quizAnswer.scoreFrom = quiz.scoreFrom

  // #region Update lecture grades, scores, done?
  lectureStat.latestQuizGrade = quizAnswer
  lectureStat.latestQuizScore = quizAnswer.score
  lectureStat.bestQuizScore = Math.max(
    lectureStat.bestQuizScore || 0,
    quizAnswer.score || 0,
  )
  lectureStat.done = lectureStat.bestQuizScore === quiz.scoreFrom

  await lectureStat.save()
  // #endregion

  // #region Update open property in the next lecture
  const lecture = await Lecture.findById(req.body.lecture)
  const nextOrder = lecture.order + 1
  const courseStatId = lectureStat.courseStat.toString()
  const nextLecture = await Lecture.findOne({
    course: lecture.course,
    order: nextOrder,
  })
  const nextLectureStat = await LectureStat.findOne({
    student: req.body.student,
    lecture: nextLecture.id,
    courseStat: courseStatId,
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
