const fs = require('fs')
const PDFDocument = require('pdfkit')
exports.createCertificate = async (name, subject) => {
  // Create the PDF document
  const doc = new PDFDocument({
    layout: 'landscape',
    size: 'A4',
  })

  // Create a memory stream to hold the PDF data
  const stream = new PassThrough()
  const buffers = []
  stream.on('data', buffers.push.bind(buffers))
  stream.on('end', () => {
    const pdfBuffer = Buffer.concat(buffers)
    console.log('PDF created in memory')
    // You can now use `pdfBuffer` to upload it to your database or cloud storage
  })

  // Pipe the PDF to the memory stream
  doc.pipe(stream)

  // Draw the first certificate image on top (if needed)
  const certificatePath = `Certificates/${subject}.png`
  doc.image(certificatePath, 0, 0, { width: 900, height: 600 })

  // Load an Arabic font (Amiri-Regular in this case)
  doc.font('Fonts/DTHULUTH.ttf')

  // Function to reverse the order of words in Arabic text
  function reverseArabicText(text) {
    // Split the text into words
    const words = text.trim().split(/\s+/)

    // Reverse the order of words
    const reversedText = words.reverse().join(' ')

    return reversedText
  }

  // Reverse the name (if needed)
  const reversedName = reverseArabicText(name)

  // Draw the name with reversed order
  doc.fontSize(60).text(reversedName, 100, 315, {
    align: 'center',
  })

  // Finalize the PDF and end the stream
  doc.end()

  // Wait for the stream to finish and return the buffer
  return new Promise((resolve, reject) => {
    stream.on('end', () => resolve(Buffer.concat(buffers)))
    stream.on('error', reject)
  })
}
