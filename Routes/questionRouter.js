const express = require('express')
const questionController = require('../Controllers/Reviews/questionController')
const bookController = require('../Controllers/Courses/bookController')

const router = express.Router()
router.route('/guest').get(bookController.getBookssForGuest)

router.get('/ids', questionController.ids)

router
  .route('/')
  .get(bookController.getAllBooks)
  .post(bookController.createBook)

router
  .route('/:id')
  .get(bookController.getBook)
  .patch(bookController.updateBook)
  .delete(bookController.deleteBook)

module.exports = router
