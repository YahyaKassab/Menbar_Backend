const express = require('express')
const bookController = require('../Controllers/Courses/bookController')
const authController = require('../Controllers/Handlers/authController')
const { uploadBookIMG } = require('../utils/cloudinaryMiddleware')
const upload = require('../multer')
const Teacher = require('../Models/Users/TeacherModel')

const router = express.Router()

router
  .route('/')
  .get(bookController.getAllBooks)
  .post(upload.single('photo'), uploadBookIMG, bookController.createBook)
router.use(
  authController.protect(Teacher),
  authController.restrictTo('Admin', 'Teacher'),
)
router
  .route('/:id')
  .get(bookController.getBook)
  .patch(bookController.updateBook)
  .delete(bookController.deleteBook)

module.exports = router
