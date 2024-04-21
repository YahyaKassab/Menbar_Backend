const express = require('express')
const authController = require('../Controllers/authController')
const Teacher = require('../Models/Users/TeacherModel')

const router = express.Router()

//signup only posts
router.post('/signup', authController.signUp(Teacher))
router.post('/login', authController.login(Teacher))
// router.post('/login', authController.login)
// router.post('/forgot-password', authController.forgotPassword)
// //best for reset is PATCH
// router.patch('/reset-password/:token', authController.resetPassword)

// // runs in sequence, all next routes are protected
// // 🚨
// router.use(authController.protect)

// router.patch('/update-password', authController.updatePassword)
// router.get('/me', userController.getMe, userController.getUserById)
// router.delete('/delete-me', userController.deleteMe)
// router.patch('/update-me', userController.updateMe)

// router.use(authController.restrictTo('admin'))

// router.route('/').get(userController.getAllUsers)

// router
//   .route('/:id')
//   .get(userController.getUserById)
//   .patch(userController.updateUser)
//   .delete(userController.deleteUser)
module.exports = router
