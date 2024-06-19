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
exports.uploadPdf = async (req, fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: 'raw', folder: 'certificates/' },
      (error, result) => {
        if (error) {
          return reject(error)
        }
        req.body.pdfURL = result.secure_url
        resolve(result)
      },
    )
    streamifier.createReadStream(fileBuffer).pipe(uploadStream)
  })
}
