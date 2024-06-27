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
const ReportAi = require('../../Models/Exams/Answers/ReportAiModel')
const { createCertificate } = require('../../utils/certificatesHandler')
const { uploadPdf } = require('../../utils/cloudinaryMiddleware')
const sendEmail = require('../../utils/email')

// #region Final

exports.submitFinalAnswer = catchAsync(async function (req, res, next) {
  const { body } = req
  req.body.student = req.student.id

  // #region 1- add mcq and meq to db

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
  // #endregion
  // #region 2- auto mark mcq and meq using AI ----------------
  await Promise.all(mcqAnswers.map((answer) => answer.mark()))
  await Promise.all(meqAnswers.map((answer) => answer.markAi()))
  // #endregion
  // #region 3- create the body of answer-------------------
  const answerBody = factory.exclude(body, [
    'score',
    'marked',
    'mcqScore',
    'meqScore',
  ])
  const course = await Course.findById(req.params.courseId)
  const final = await FinalExam.findOne({ course: course.id })
  const courseStat = await CourseStat.findOne({
    student: req.student.id,
    course: course.id,
  }).populate({ path: 'lectureStats', select: 'bestQuizScore done' })

  answerBody.student = req.student.id
  answerBody.course = course.id
  answerBody.exam = final.id
  answerBody.durationInMins = 30
  answerBody.courseStat = courseStat.id
  // #endregion
  // #region 4- submit------------

  const finalAnswer = await FinalExamStudentAnswer.create(answerBody)
  await finalAnswer.populate([
    { path: 'mcqs', populate: 'mcq' },
    { path: 'meqs', populate: 'meq' },
  ]) // Find student and populate courseStats
  // #endregion
  // #region 5- assign scores in finalAnswer
  // #region assign mcqScore
  if (finalAnswer.mcqs && finalAnswer.mcqs.length > 0) {
    const score = finalAnswer.mcqs.filter((mcq) => mcq.correct).length
    const percentage = score / finalAnswer.mcqs.length
    finalAnswer.mcqScore = percentage
  } else finalAnswer.mcqScore = 0
  // #endregion
  // #region assign meqScoreTeacher
  if (finalAnswer.meqs && finalAnswer.meqs.length > 0) {
    finalAnswer.meqScoreTeacher = finalAnswer.meqs.reduce((totalScore, meq) => {
      const score = totalScore + (meq.scoreByTeacher || 0)

      return score / (finalAnswer.meqs.length * 5)
    }, 0)
  } else finalAnswer.meqScoreTeacher = 0
  // #endregion
  // #region assign meqScoreAi
  if (finalAnswer.meqs && finalAnswer.meqs.length > 0) {
    const totalScore = finalAnswer.meqs.reduce(
      (total, meq) => total + (meq.scoreByAi || 0),
      0,
    )
    const maximumScore = finalAnswer.meqs.length * 5 // Maximum score for all MEQs
    const normalizedScore = totalScore / maximumScore

    finalAnswer.meqScoreAi = normalizedScore // Normalized score out of 1
  } else finalAnswer.meqScoreAi = 0
  // #endregion
  // #region assign score (out of 90)
  const totalMcqScore = finalAnswer.mcqScore || 0
  const totalMeqScore =
    finalAnswer.meqScoreAi || finalAnswer.meqScoreTeacher || 0

  const scoreOutOf90 = (totalMcqScore + totalMeqScore) * 45

  finalAnswer.score = scoreOutOf90

  await finalAnswer.save()
  // #endregion
  // #endregion
  // #region 6- assign scores in courseStat
  // #region assign totalLecturesScoreOutOf10
  if (courseStat.lectureStats && courseStat.lectureStats.length > 0) {
    const totalPossibleScore = courseStat.lectureStats.length * 6 // Each lectureQuiz is out of 3 points

    // Sum up the bestQuizScore of each lectureStat
    const totalScore = courseStat.lectureStats.reduce((total, lectureStat) => {
      return total + (lectureStat.bestQuizScore || 0)
    }, 0)

    // Calculate percentage score out of 100
    const percentageScore = (totalScore / totalPossibleScore) * 100

    // Scale the percentage score to a score out of 10
    const scoreOutOf10 = (percentageScore / 10).toFixed(1) // Round to one decimal place

    courseStat.totalLecturesScoreOutOf10 = parseFloat(scoreOutOf10) // Convert to float (if needed) and return
  } else courseStat.totalLecturesScoreOutOf10 = 0
  // #endregion
  // #region assign totalScore and passed
  const finalAnswersScore = finalAnswer.score
  const totalLecturesScore = courseStat.totalLecturesScoreOutOf10 || 0

  courseStat.totalScore = totalLecturesScore + finalAnswersScore

  courseStat.passed = courseStat.totalScore >= 50
  await courseStat.save()
  // #endregion
  // #endregion

  if (courseStat.passed) {
    try {
      // #region 7- create Certificate
      const name = `${req.student.Fname} ${req.student.Lname}`
      const pdfBuffer = await createCertificate(name, course.subject)
      await uploadPdf(req, pdfBuffer)

      const certificate = await Certificate.create({
        student: req.student.id,
        course: course.id,
        pdfURL: req.body.pdfURL,
      })
      await courseStat.populate({ path: 'finalAnswers' })
      res.status(201).json({
        status: 'Success',
        data: { courseStat, finalAnswer, certificate },
      })
      // #endregion
    } catch (err) {
      console.error('Error handling certificate:', err)
    }
  } else {
    // Failed the course
    res.status(201).json({
      status: 'Success',
      data: { courseStat, finalAnswer },
    })
  }
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
    return next(new AppError('لا يوجد طالب بهذا ال id', 404))
  }
  // #endregion

  // #region Check if the lecture is open for the student
  const lectureId = req.body.lecture
  const lectureStat = await LectureStat.findOne({
    lecture: lectureId,
    student: req.body.student,
  })

  if (!lectureStat || !lectureStat.open) {
    return next(new AppError('المحاضرة ليست مفتوحة لك', 403))
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
  lectureStat.done = lectureStat.bestQuizScore === quiz.mcq.length

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

exports.reportAi = catchAsync(async (req, res, next) => {
  req.body.answer = req.params.answerId
  newDoc = await ReportAi.create(req.body)
  res.status(201).json({
    status: 'Success',
    data: newDoc,
  })
})

exports.getAllReports = factory.getAll(ReportAi, {
  path: 'answer',
  populate: [
    { path: 'meq' },
    { path: 'student', select: 'Fname Mname Lname email photo phone' },
  ],
})
exports.getReport = factory.getOne(ReportAi, {
  path: 'answer',
  populate: [
    { path: 'meq' },
    { path: 'student', select: 'Fname Mname Lname email photo phone' },
  ],
})
exports.deleteReport = factory.deleteOne(ReportAi)

exports.resolveReport = catchAsync(async (req, res, next) => {
  const newDoc = await ReportAi.findByIdAndUpdate(
    req.params.id,
    { viewed: true },
    {
      new: true,
    },
  )
  await newDoc.populate({
    path: 'answer',
    populate: { path: 'meq', populate: { path: 'course' } },
  })
  const student = await Student.findById(newDoc.answer.student)
  const answer = newDoc.answer
  answer.scoreByTeacher = req.body.score
  await answer.save()
  const meq = answer.meq
  const htmlMessage = `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #f4f4f4; padding: 20px; max-width: 600px; margin: auto; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
  
    <div style="background: #fff; padding: 20px; border-radius: 8px;">
      <h2 style="color: #333; font-size: 24px; margin-bottom: 20px;">Review Notification</h2>
  
      <p style="font-size: 16px;">Dear <strong>${student.Fname}</strong>,</p>
  
      <p style="font-size: 16px; margin-bottom: 15px;">We have reviewed your answer to the question "<strong>${meq.question}</strong>" for the course "<strong>${meq.course.text}</strong>".</p>
  
      <p style="font-size: 16px; margin-bottom: 15px;">The AI assessment gave you a score of <strong>${answer.scoreByAi}</strong>. After careful consideration, here is our feedback:</p>
  
      <blockquote style="font-size: 16px; font-style: italic; background-color: #f7f7f7; padding: 10px; border-left: 5px solid #3498db; margin: 15px 0;">
        Our chosen score is <strong>${answer.scoreByTeacher}</strong>
      </blockquote>
  
      <p style="font-size: 16px;">Thank you for your effort. If you have any questions or need further clarification, please do not hesitate to contact us.</p>
  
      <p style="font-size: 16px;">Best regards,<br>Your Course Team</p>
    </div>
  
  </div>
  `

  await sendEmail({
    email: student.email,
    subject: 'Report resolved',
    html: htmlMessage,
  })
  res.status(201).json({
    status: 'Success',
    data: answer,
  })
})
exports.deleteViewed = catchAsync(async (req, res, next) => {
  const viewedReports = await ReportAi.find({ viewed: true })
  await ReportAi.deleteMany({ viewed: true })
  res.status(200).json({
    status: 'success',
    deletedCount: viewedReports.length,
    message: `${viewedReports.length} viewed reports deleted successfully.`,
  })
})
