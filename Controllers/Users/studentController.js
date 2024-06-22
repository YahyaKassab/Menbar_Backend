const catchAsync = require('../../utils/catchAsync')
const AppError = require('../../utils/appError')
const factory = require('../Handlers/handlerFactory')
const Student = require('../../Models/Users/StudentModel')
const authController = require('../Handlers/authController')
const Course = require('../../Models/Courses/CourseModel')
const LectureStat = require('../../Models/Student/LectureStatModel')
const CourseStat = require('../../Models/Student/CourseStatModel')
const Certificate = require('../../Models/Student/CertificateModel')

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
    const courseIds = [
      '6668e476d515ebb61d73c2f4', //Hadeeth
      '6668e476d515ebb61d73c2f5', //Tafseer
      '6668e476d515ebb61d73c2f6', //Aqeedah
      '6668e476d515ebb61d73c2f7', //Fiqh
    ]

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
        } else {
          await LectureStat.create({
            lecture: lecture._id,
            student: newUser._id,
            courseStat: courseStat._id,
            open: false, // Set the open property to true
          })
        }
      }
    }

    // Send token and user data
    authController.createSendToken(newUser, 201, req, res)
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

exports.getCertificates = catchAsync(async (req, res, next) => {
  const certificates = await Certificate.find({
    student: req.student.id,
  }).populate({ path: 'course' })
  //SEND RESPONSE
  res.status(200).json({
    status: 'Success',
    results: certificates.length,
    data: { data: certificates },
  })
})

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
  })
    .populate({
      path: 'lectureStats',
      populate: [
        {
          path: 'lecture',
          populate: {
            path: 'quiz',
          },
        },
        { path: 'latestQuizGrade' },
      ],
    })
    .populate({
      path: 'course',
      populate: { path: 'final', populate: ['mcqs', 'meqs'] },
    })

  // Check if course stat was found
  if (!courseStat) {
    return next(new AppError('لم يتم العثور على الملف المطلوب', 404))
  }

  // Send response with course stat
  res.status(200).json({
    status: 'success',
    data: {
      courseStat,
    },
  })
})

exports.getAllCoursesStats = catchAsync(async (req, res, next) => {
  // Get student ID from request
  const studentId = req.student.id

  // Check if student ID and course ID are available
  if (!studentId) {
    return next(new AppError('Student ID and Course ID are required', 400))
  }

  // Find course stat where student ID matches and course ID matches
  const courseStat = await CourseStat.find({
    student: studentId,
  })
    .populate({
      path: 'lectureStats',
      populate: [{ path: 'lecture' }, { path: 'latestQuizGrade' }],
    })
    .populate('course')
  // Check if course stat was found
  if (!courseStat) {
    return next(new AppError('لم يتم العثور على الملف المطلوب', 404))
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
