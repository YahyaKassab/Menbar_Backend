const express = require('express')
const authController = require('../Controllers/Handlers/authController')
const factory = require('../Controllers/Handlers/handlerFactory')
const courseController = require('../Controllers/Courses/courseController')
const examController = require('../Controllers/Courses/examController')
const finalsRouter = require('./Secondary/finalsRouter')
const lectureRouter = require('./lectureRouter')
const Teacher = require('../Models/Users/TeacherModel')
const certificatesRouter = require('./Secondary/certificatesRouter')
const router = express.Router()

router.use('/:courseId/final', finalsRouter)
router.use('/:courseId/certificates', certificatesRouter)

// #region Guest & Student
router.route('/cer').get(async (req, res) => {
  try {
    const score = 70
    const courseName = 'Hadeeth'
    const studentName = 'yaya'

    if (!score || !courseName || !studentName) {
      return res.status(400).send('Missing required fields')
    }

    const buffer = await courseController.createCertificate(
      score,
      courseName,
      studentName,
    )

    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${studentName}_certificate.docx`,
    )
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    )
    res.send(buffer)
  } catch (error) {
    res.status(500).send('Internal Server Error')
  }
})
router.route('/').get(courseController.getCourses)
router.route('/guest/:id').get(courseController.getOneCourseGuests)
// #endregion

router.use(authController.protect(Teacher))
router.get('/ids', courseController.getIds)
// #region Teacher
router.get(
  '/:id/teacher',
  authController.restrictTo('Admin', 'Teacher'),
  courseController.getOneCourseTeacher,
)
router.use(factory.setCourseIds)
router.get(
  '/mcq/:courseId',
  authController.restrictTo('Admin', 'Teacher'),
  examController.getAllMcqForCourse,
)
router.get(
  '/meq/:courseId',
  authController.restrictTo('Admin', 'Teacher'),
  examController.getAllMeqForCourse,
)
router.get(
  '/questions/:courseId',
  authController.restrictTo('Admin', 'Teacher'),
  examController.getAllQuestions,
)
// #endregion

router.use(authController.restrictTo('Admin'))

// #region Admin
router.route('/').post(courseController.createCourse)
router
  .route('/:id')
  .patch(courseController.updateCourse)
  .delete(courseController.deleteCourse)
// #endregion

module.exports = router
