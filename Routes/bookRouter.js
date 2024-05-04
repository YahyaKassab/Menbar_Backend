const express = require('express')
const authController = require('../Controllers/authController')
const bookController = require('../Controllers/bookController')

const router = express.Router()
router.route('/guest').get(bookController.getBookssForGuest)

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
