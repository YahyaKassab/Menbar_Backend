const catchAsync = require('../../utils/catchAsync')
const AppError = require('../../utils/appError')
const factory = require('../Handlers/handlerFactory')
const Student = require('../../Models/Users/StudentModel')
const authController = require('../Handlers/authController')
const Course = require('../../Models/Courses/CourseModel')
const LectureStat = require('../../Models/Student/LectureStatModel')
const CourseStat = require('../../Models/Student/CourseStatModel')

//middleware to set the input id from the logged in user
exports.getMe = (req, res, next) => {
  req.params.id = req.student.id
  next()
}

exports.signUp = catchAsync(async (req, res, next) => {
  const {
    Fname,
    Mname,
    Lname,
    email,
    photo,
    role,
    password,
    passwordConfirm,
    country,
    nationality,
    city,
    birthDate,
    isSingle,
    phone,
    lastCertificate,
    educationLevel,
    currentJob,
  } = req.body

  try {
    // Set the role based on the Model
    const level = 1
    const body = {
      Fname,
      Mname,
      Lname,
      email,
      photo,
      role,
      password,
      passwordConfirm,
      country,
      nationality,
      city,
      birthDate,
      isSingle,
      phone,
      lastCertificate,
      educationLevel,
      currentJob,
      level, // Add level here
    }
    // Create the user with the specified role
    const newUser = await Student.create(body)

    // Execute additional logic specific to students

    // Static course IDs (replace these with actual course IDs)
    const courseIds = ['664a74f2ebbbd514dcef3189']

    // Loop through each course ID
    for (const courseId of courseIds) {
      const course = await Course.findById(courseId).populate('lectures')

      if (!course) {
        throw new Error(`Course with ID ${courseId} not found`)
      }

      // Create CourseStat
      const courseStat = await CourseStat.create({
        course: courseId,
        lecturesDone: [],
        student: newUser._id,
      })
      // Create LectureStats for lectures with level 1 in the course

      for (const lecture of course.lectures) {
        if (lecture.order === 1) {
          await LectureStat.create({
            lecture: lecture._id,
            student: newUser._id,
            courseStat: courseStat._id,
            open: true, // Set the open property to true
          })
        }
      }
    }

    // Send token and user data
    authController.createSendToken(newUser, 201, res)
  } catch (err) {
    next(err)
  }
})
exports.loginStudent = authController.login(Student)
exports.forgetPasswordStudent = authController.forgotPassword(Student)
exports.resetPasswordStudent = authController.resetPassword(Student)

exports.createStudent = factory.createOneExclude(Student)
exports.getAllStudents = factory.getAll(Student)
exports.getOneStudent = factory.getOne(Student)
exports.updateStudent = factory.updateOne(Student)

exports.getCourseStats = catchAsync(async (req, res, next) => {
  // Get student ID from request
  const studentId = req.student.id

  // Get course ID from request parameters
  const { courseId } = req.params

  // Check if student ID and course ID are available
  if (!studentId || !courseId) {
    return next(new AppError('Student ID and Course ID are required', 400))
  }

  // Find course stat where student ID matches and course ID matches
  const courseStat = await CourseStat.findOne({
    student: studentId,
    course: courseId,
  }).populate(['lectureStats'])

  // Check if course stat was found
  if (!courseStat) {
    return next(
      new AppError('No course stat found for this student and course', 404),
    )
  }

  // Send response with course stat
  res.status(200).json({
    status: 'success',
    data: {
      courseStat,
    },
  })
})

exports.updateStudentByStudent = factory.updateOne(Student, [
  'role',
  'password',
  'createdAt',
  'active',
  'passwordResetExpires',
  'passwordResetToken',
  'passwordChangedAt',
  'passwordConfirm',
  'email',
  'courseStats',
])
exports.deleteStudent = factory.deleteOne(Student)
exports.deleteMe = catchAsync(async (req, res, next) => {
  await Student.findByIdAndUpdate(req.student.id, {
    $set: { active: false },
  })
  res.status(204).json({ status: 'success', data: null })
})

exports.ids = factory.getIds(Student)
exports.setStudentId = (req, res, next) => {
  req.body.student = req.student.id
  next()
}
