const catchAsync = require('./catchAsync')
const cloudinary = require('../cloudinary')
const Certificate = require('../Models/Student/CertificateModel')
const streamifier = require('streamifier');


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
exports.uploadTeacherIMG = catchAsync(async (req, res, next) => {
  if (req.file) {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'teachers/',
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
      {
        resource_type: 'auto', // Let Cloudinary determine the resource type
        folder: 'certificates/',
        use_filename: true, // Use the original filename if available
        unique_filename: false, // Do not append unique identifier to filename
        overwrite: true, // Overwrite if file with the same name exists
        allowed_formats: ['pdf'], // Restrict to PDF format
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        req.body.pdfURL = result.secure_url;
        resolve(result.secure_url);
      }
    )

    streamifier.createReadStream(fileBuffer).pipe(uploadStream)
  })
}

exports.uploadQuestionImage = catchAsync(async (req, res, next) => {
  if (req.file) {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'questions/',
    })

    req.body.imageURL = result.secure_url
    console.log(result.secure_url)
  }
  next()
})
