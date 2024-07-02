const catchAsync = require('./catchAsync')
const cloudinary = require('../cloudinary')
const Certificate = require('../Models/Student/CertificateModel')
const streamifier = require('streamifier')
const axios = require('axios')
const fs = require('fs')

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
        unique_filename: true, // Do not append unique identifier to filename
        overwrite: true, // Overwrite if file with the same name exists
        allowed_formats: ['pdf'], // Restrict to PDF format
      },
      (error, result) => {
        if (error) {
          return reject(error)
        }
        req.body.pdfURL = result.secure_url
        resolve(result.secure_url)
      },
    )

    streamifier.createReadStream(fileBuffer).pipe(uploadStream)
  })
}

exports.downloadPdfFromCloudinary = async function (publicId, outputFilePath) {
  try {
    const url = cloudinary.url(publicId, { resource_type: 'raw' })

    const response = await axios({
      url: url,
      method: 'GET',
      responseType: 'stream',
    })

    response.data.pipe(fs.createWriteStream(outputFilePath))

    return new Promise((resolve, reject) => {
      response.data.on('end', () => {
        resolve('Download completed')
      })

      response.data.on('error', (err) => {
        reject(err)
      })
    })
  } catch (error) {
    console.error('Error downloading PDF:', error)
    throw error
  }
}
function extractPublicId(url) {
  // Use regex to extract the part of the URL after '/upload/' and before the file extension
  const match = url.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
  return match ? match[1] : null;
}



exports.deletePdfFromCloudinary = async function (url) {
  try {
        // Example usage
    const publicId = extractPublicId(url);
    // Call Cloudinary API to delete the file
    const result = await cloudinary.uploader.destroy(publicId);

    // Check if the deletion was successful
    if (result.result === 'ok') {
      console.log('PDF deleted successfully');
      return { success: true, message: 'PDF deleted successfully' };
    } else {
      console.log('Failed to delete PDF');
      return{ success: false, message: 'Failed to delete PDF' };
    }
  } catch (error) {
    console.error('Error deleting PDF from Cloudinary:', error);
    return{ success: false, message: 'Error deleting PDF from Cloudinary', error };
  }
};


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
