const fs = require('fs')
const PDFDocument = require('pdfkit')
const PDFDocument = require('pdfkit');
const fs = require('fs');
const {upload} = require('cloudinary')

exports.createCertificate = async (name, score, course) => {
  // Create the PDF document
  const doc = new PDFDocument({
    layout: 'landscape',
    size: 'A4',
  });

  // Pipe the PDF to a file
  const outputStream = fs.createWriteStream(`Certificates/${name}.pdf`);
  doc.pipe(outputStream);

  // Draw the first certificate image on top (if needed)
  
  const certificatePath = `Certificates/certificate${course}.png`;
  doc.image(certificatePath, 0, 0, { width: 900, height: 600 });

  // Load an Arabic font (Amiri-Regular in this case)
  doc.font('fonts/Amiri-Regular.ttf');

  // Function to reverse the order of words in Arabic text
  function reverseArabicText(text) {
    // Split the text into words
    const words = text.trim().split(/\s+/);

    // Reverse the order of words
    const reversedText = words.reverse().join(' ');

    return reversedText;
  }

  // Reverse the name (if needed)
  const reversedName = reverseArabicText(name);

  // Draw the name with reversed order
  doc.fontSize(60).text(reversedName, 15, 200, {
    align: 'center',
  });

  // Draw the score
  doc.fontSize(60).text(`${score}%`, 20, 330, {
    align: 'center',
  });

  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
  const year = String(today.getFullYear()).slice(-2);

  // Format the date as dd/mm/yy
  const formattedDate = `${day}/${month}/${year}`;

  doc.fontSize(30).text(formattedDate, 2, 430, {
    align: 'left',
  });

  // Finalize the PDF and end the stream
  doc.end();
  // Return a promise that resolves when the PDF has been fully written
  await new Promise((resolve, reject) => {
    outputStream.on('finish', resolve);
    outputStream.on('error', reject);
  });

  console.log(`PDF created: ${name}.pdf`);
  return `Certificates/${name}.pdf`
};
