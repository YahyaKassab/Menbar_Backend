const express = require('express')
const authController = require('../Controllers/Handlers/authController')
const examController = require('../Controllers/Courses/examController')
const Teacher = require('../Models/Users/TeacherModel')
const router = express.Router()
// router.use(
//   authController.protect(Teacher),
//   authController.restrictTo('Teacher', 'Admin'),
// )
// #region Teacher
router.get('/ids', examController.meqIds)

router.route('/').post(examController.createMeq).get(examController.getAllMeq)

router
  .route('/:id')
  .get(examController.getOneMeq)
  .patch(examController.updateMeq)
  .delete(examController.deleteMeq)
// #endregion

module.exports = router
