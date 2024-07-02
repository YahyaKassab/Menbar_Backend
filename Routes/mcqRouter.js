const express = require('express')
const authController = require('../Controllers/Handlers/authController')
const factory = require('../Controllers/Handlers/handlerFactory')
const examController = require('../Controllers/Courses/examController')
const Teacher = require('../Models/Users/TeacherModel')
const router = express.Router()
// router.use(
//   authController.protect(Teacher),
//   authController.restrictTo('Teacher', 'Admin'),
// )
router.get('/ids', examController.mcqIds)
// #region Teacher

router.route('/').post(examController.createMcq).get(examController.getAllMcq)

router
  .route('/:id')
  .get(examController.getOneMcq)
  .patch(examController.updateMcq)
  .delete(examController.deleteMcq)
// #endregion

module.exports = router
