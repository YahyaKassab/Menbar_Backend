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

// #region Final
exports.submitFinalAnswer = catchAsync(async function (req, res, next) {
  const body = req.body
  const studentId = body.student

  // Create MCQ answers
  const answers = await MCQAnswer.create(body.mcqs)

  // Mark MCQ answers
  for (const answer of answers) {
    await answer.mark()
  }

  // Update body with created MCQ answers
  body.mcqs = answers

  // Create final exam answer
  const newBody = factory.exclude(body, ['score', 'scoreFrom', 'marked'])
  const finalAnswer = await FinalExamStudentAnswer.create(newBody)

  // Find student and populate courseStats
  const student = await Student.findById(studentId).populate('courseStats')

  // Assign final answer to courseStats
  student.courseStats.finalAnswers = finalAnswer.id
  await student.save()
  await student.populate('courseStats')
  // Check if student has passed the course
  if (student.courseStats.passed) {
    // Create certificate
    const certificate = await Certificate.create({
      course: student.courseStats.course, // Assuming courseStats contains course information
      imageURL: 'URL_of_the_certificate_image',
      Date: new Date(),
    })

    // Add certificate to student.certificates
    student.certificates.push(certificate)
  }

  // Save student changes
  await student.save()

  // Respond with success
  res.status(201).json({
    status: 'Success',
    data: finalAnswer,
  })
})

exports.getAllFinalAnswers = factory.getAll(FinalExamStudentAnswer, {
  path: 'student',
  select: 'user.Fname',
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
  const studentId = req.body.student
  const quizId = req.params.id
  const lectureId = req.body.lecture

  // #region Create and mark MCQ answers
  const mcqAnswers = await MCQAnswer.create(req.body.lectureQuizzesGrades)
  for (const answer of mcqAnswers) {
    await answer.mark()
  }
  // #endregion

  // #region Create the quiz answer
  const quizAnswer = await QuizAnswer.create({
    ...factory.exclude(req.body, excludedFields),
    lectureQuizzesGrades: mcqAnswers,
    quiz: quizId,
  }).populate({
    path: 'lecture',
    populate: {
      path: 'quiz',
      model: 'LectureQuiz',
    },
  })
  // #endregion

  const quiz = quizAnswer.lecture.quiz

  // #region Find the student and populate courseStats and lecturesStats
  const student = await Student.findById(studentId).populate({
    path: 'courseStats',
    populate: {
      path: 'lecturesStats',
    },
  })

  if (!student) {
    return next(new AppError('No student found with that ID', 404))
  }
  // #endregion

  // #region Update lecture grades, scores, done?
  let currentLectureStat
  for (const courseStat of student.courseStats) {
    currentLectureStat = courseStat.lecturesStats.find(
      (lectureStat) => lectureStat.lecture.toString() === lectureId.toString(),
    )
    if (currentLectureStat) break
  }

  if (!currentLectureStat) {
    return next(new AppError('No lectureStat found with that lecture ID', 404))
  }

  currentLectureStat.latestQuizGrade = quizAnswer
  currentLectureStat.latestQuizScore = quizAnswer.score
  currentLectureStat.bestQuizScore = Math.max(
    currentLectureStat.bestQuizScore,
    quizAnswer.score,
  )
  currentLectureStat.done = quizAnswer.score === quizAnswer.scoreFrom

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

  if (nextLectureStat) {
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

exports.checkLectureOpen = catchAsync(async (req, res, next) => {
  const { lectureId } = req.params
  const studentId = req.user.id

  // Find the lectureStat for the student and the lecture
  const student = await Student.findById(studentId).populate({
    path: 'courseStats',
    populate: {
      path: 'lecturesStats',
      match: { lecture: lectureId }, // Only match the specific lecture
    },
  })

  if (!student) {
    return next(new AppError('No student found with that ID', 404))
  }

  let lectureStat
  for (const courseStat of student.courseStats) {
    lectureStat = courseStat.lecturesStats.find(
      (stat) => stat.lecture.toString() === lectureId.toString(),
    )
    if (lectureStat) break
  }

  if (!lectureStat || !lectureStat.open) {
    return next(
      new AppError('You do not have permission to access this lecture', 403),
    )
  }

  next()
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

  for (const courseStat of student.courseStats) {
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

exports.createMcqAnswer = factory.createOne(MCQAnswer, ['correct'])

exports.getAllMcqAnswers = factory.getAll(MCQAnswer)

exports.getAllMeqAnswers = factory.getAll(MEQAnswer)

exports.createMeqAnswer = factory.createOne(MEQAnswer, ['score', 'feedback'])
