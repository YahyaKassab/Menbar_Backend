const catchAsync = require('../../utils/catchAsync')
const AppError = require('../../utils/appError')
const factory = require('../Handlers/handlerFactory')
const Course = require('../../Models/Courses/CourseModel')

const fs = require('fs')
const PDFDocument = require('pdfkit')
const Book = require('../../Models/Courses/BookModel')
const FinalExam = require('../../Models/Exams/FinalExamModel')
const Lecture = require('../../Models/Courses/LectureModel')
const MCQ = require('../../Models/Exams/MCQModel')
const MEQ = require('../../Models/Exams/MEQModel')
const LectureQuiz = require('../../Models/Exams/LectureQuizModel')
const CourseStat = require('../../Models/Student/CourseStatModel')
const FinalExamStudentAnswer = require('../../Models/Exams/Answers/FinalExamStudentAnswerModel')
const {deletePdfFromCloudinary} = require('../../utils/cloudinaryMiddleware')
const Certificate = require('../../Models/Student/CertificateModel')

exports.createCourse = catchAsync(async (req, res, next) => {
  const newCourse = await Course.create(req.body)
  res.status(201).json({
    status: 'Success',
    data: newCourse,
  })
})
exports.getAllCourses = factory.getAll(Course)
exports.getIds = factory.getIds(Course)
exports.getOneCourseTeacher = factory.getOne(Course, [
  'book',
  'teachers',
  'prerequisites',
  'lectures',
  'students',
])
exports.deleteCourse =  catchAsync(async (req, res, next) => {
  const courseId = req.params.id
  const course = await Course.findById(courseId)
  const book = await Book.findOne({course:courseId})
  const final = await FinalExam.findOne({course:courseId})
  const lectures = await Lecture.find({course:courseId})
  const lectureIds = lectures.map(lecture => lecture.id);
  const courseMcqs = await MCQ.find({course:courseId})
  const courseMeqs = await MEQ.find({course:courseId})
  const courseQuizzes = await LectureQuiz.find({ lecture: { $in: lectureIds }});
  const courseStats = await CourseStat.find({course:courseId})
  const finalAnswers = await FinalExamStudentAnswer.find({course:courseId})
  const certificates = await Certificate.find({course:courseId})
  if(certificates.length > 0){
    certificates.forEach(async cert => {
      await deletePdfFromCloudinary(cert.pdfURL)
      });
    }

   if (!course) {
     return next(new AppError('لم يتم العثور على الملف المطلوب', 404))
   }
  await Course.deleteOne(course)
  await Book.deleteOne(book)
  await Lecture.deleteMany(lectures)
  await MCQ.deleteMany(courseMcqs)
  await MEQ.deleteMany(courseMeqs)
  await LectureQuiz.deleteMany(courseQuizzes)
  await FinalExam.deleteOne(final)
  await CourseStat.deleteMany(courseStats)
  await FinalExamStudentAnswer.deleteMany(finalAnswers)
  await Certificate.deleteMany(certificates)


    res.status(204).json({ status: 'success', data: null })
  }
)
exports.updateCourse = factory.updateOne(Course)

exports.getCourses = factory.getAllInclude(
  Course,
  ['book'],
  ['text', 'level', 'description', 'subject', 'book', '_id'],
)

exports.getOneCourseGuests = factory.getOneExclude(
  Course,
  ['book', 'teachers', 'prerequisites', 'lectures'],
  ['students'],
)

exports.createCertificate = catchAsync(async (req, res, next) => {
  const doc = new PDFDocument({
    layout: 'landscape',
    size: 'A4',
  })
  const name = 'nigga'
  //pipe pdf file into a name.pdf
  doc.pipe(fs.createWriteStream(`${name}.pdf`))

  //draw image
  doc.image('certificate.png', 0, 0, { width: 842 })

  //set font
  doc.font('Courier')

  //draw the name
  doc.fontSize(30).text(name, 20, 265, {
    align: 'center',
  })
})
