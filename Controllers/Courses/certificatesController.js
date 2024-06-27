const catchAsync = require('../../utils/catchAsync')
const AppError = require('../../utils/appError')
const factory = require('../Handlers/handlerFactory')
const Course = require('../../Models/Courses/CourseModel')
const {
  downloadPdfFromCloudinary,
  downloadFirstPageAsPng,
} = require('../../utils/cloudinaryMiddleware')
const Certificate = require('../../Models/Student/CertificateModel')

exports.downloadCertificatePdf = catchAsync(async (req, res, next) => {
  const name = `${req.student.Fname} ${req.student.Lname}`
  const certificate = await Certificate.findOne({
    course: req.params.courseId,
    student: req.student.id,
    pdfURL: { $ne: null },
  })

  await downloadPdfFromCloudinary(certificate.pdfURL, `./${name}.pdf`)
  res.status(201).json({
    status: 'success',
    data: null,
  })
})
exports.downloadCertificatePng = catchAsync(async (req, res, next) => {
  const name = `${req.student.Fname} ${req.student.Lname}`
  const certificate = await Certificate.findOne({
    course: req.params.courseId,
    student: req.student.id,
    pdfURL: { $ne: null },
  })
  await downloadFirstPageAsPng(certificate.pdfURL, `./${name}.png`)
  res.status(201).json({
    status: 'success',
    data: null,
  })
})
