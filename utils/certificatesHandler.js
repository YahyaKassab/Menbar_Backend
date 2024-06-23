const fs = require('fs')
const PDFDocument = require('pdfkit')
const axios = require('axios')
const { PassThrough } = require('stream')
const path = require('path')

exports.createCertificate = async (name, subject) => {
  const doc = new PDFDocument({
    layout: 'landscape',
    size: 'A4',
  })

  const stream = new PassThrough()
  const buffers = []
  stream.on('data', buffers.push.bind(buffers))

  doc.pipe(stream)

  let certificatePath = null
  switch (subject) {
    case 'fiqh':
      certificatePath =
        'https://res.cloudinary.com/di7sxwjyd/image/upload/v1719000165/certificates/Fiqh_zmvmoq.png'
      break
    case 'aqeedah':
      certificatePath =
        'https://res.cloudinary.com/di7sxwjyd/image/upload/v1719000165/certificates/Aqeedah_bctd1y.png'
      break
    case 'tafseer':
      certificatePath =
        'https://res.cloudinary.com/di7sxwjyd/image/upload/v1719000164/certificates/Tafseer_zijaie.png'
      break
    case 'hadeeth':
      certificatePath =
        'https://res.cloudinary.com/di7sxwjyd/image/upload/v1719000165/certificates/Hadeeth_mjhkur.png'
      break
  }

  try {
    const response = await axios.get(certificatePath, {
      responseType: 'arraybuffer',
    })
    const imgBuffer = Buffer.from(response.data, 'binary')
    doc.image(imgBuffer, 0, 0, { width: 900, height: 600 })
  } catch (error) {
    console.error('Error loading image:', error)
  }

  function setFontAndText(text) {
    const arabicPath = path.join(__dirname, 'Fonts', 'DTHULUTH.ttf')
    const englishPath = path.join(__dirname, 'Fonts', 'Amiri-Regular.ttf')
    const isArabic = /[\u0600-\u06FF\u0750-\u077F]/.test(text)
    if (isArabic) {
      console.log(arabicPath)
      doc.font(arabicPath)
      return reverseArabicText(text)
    } else {
      doc.font(englishPath)
      return text
    }
  }

  function reverseArabicText(text) {
    const words = text.trim().split(/\s+/)
    const reversedText = words.reverse().join(' ')
    return reversedText
  }

  const displayName = setFontAndText(name)
  doc.fontSize(60).text(displayName, 100, 315, {
    align: 'center',
  })

  doc.end()

  return new Promise((resolve, reject) => {
    stream.on('end', () => resolve(Buffer.concat(buffers)))
    stream.on('error', reject)
  })
}
