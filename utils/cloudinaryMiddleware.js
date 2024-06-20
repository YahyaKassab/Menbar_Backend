const catchAsync = require('./catchAsync')
const cloudinary = require('../cloudinary')
const Certificate = require('../Models/Student/CertificateModel')

exports.uploadStudentIMG = catchAsync(async (req, res, next) => {
  if (req.file) {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'students/',
    })

    req.body.photo = result.secure_url
    console.log(result.secure_url)
  }
  next()
})

exports.uploadBookIMG = catchAsync(async (req, res, next) => {
  if (req.file) {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'books/',
    })

    req.body.photo = result.secure_url
    console.log(result.secure_url)
  }
  next()
})
exports.uploadPdf =  catchAsync(async (req, res, next, filePath) => {
  const result = await cloudinary.uploader.upload(filePath, {
    resource_type: 'raw', // Because PDF is not an image
    folder:'certificates/'
  });
  req.body.pdfURL = result.secure_url
next()
})