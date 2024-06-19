const fs = require('fs')
const PDFDocument = require('pdfkit')
exports.createCertificate = async (name, score, course) => {
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
  const certificatePath = `Certificates/certificate${course}.png`
  doc.image(certificatePath, 0, 0, { width: 900, height: 600 })

  // Load an Arabic font (Amiri-Regular in this case)
  doc.font('fonts/Amiri-Regular.ttf')

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
  doc.fontSize(60).text(reversedName, 15, 200, {
    align: 'center',
  })

  // Draw the score
  doc.fontSize(60).text(`${score}%`, 20, 330, {
    align: 'center',
  })

  const today = new Date()
  const day = String(today.getDate()).padStart(2, '0')
  const month = String(today.getMonth() + 1).padStart(2, '0') // Months are zero-indexed
  const year = String(today.getFullYear()).slice(-2)

  // Format the date as dd/mm/yy
  const formattedDate = `${day}/${month}/${year}`

  doc.fontSize(30).text(formattedDate, 2, 430, {
    align: 'left',
  })

  // Finalize the PDF and end the stream
  doc.end()

  // Wait for the stream to finish and return the buffer
  return new Promise((resolve, reject) => {
    stream.on('end', () => resolve(Buffer.concat(buffers)))
    stream.on('error', reject)
  })
}
