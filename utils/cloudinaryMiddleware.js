const catchAsync = require('./catchAsync')
const cloudinary = require('../cloudinary')

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
