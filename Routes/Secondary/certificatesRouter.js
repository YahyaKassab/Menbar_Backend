const express = require('express')
const authController = require('../../Controllers/Handlers/authController')
const certificatesController = require('../../Controllers/Courses/certificatesController')
const Student = require('../../Models/Users/StudentModel')
const Teacher = require('../../Models/Users/TeacherModel')
const factory = require('../../Controllers/Handlers/handlerFactory')

const router = express.Router({ mergeParams: true })

router.get(
  '/pdf',
  authController.protect(Student),
  certificatesController.downloadCertificatePdf,
)
router.get(
  '/png',
  authController.protect(Student),
  certificatesController.downloadCertificatePng,
)

module.exports = router
