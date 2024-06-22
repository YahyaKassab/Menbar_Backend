const fs = require('fs');
const PDFDocument = require('pdfkit');
const axios = require('axios');
const { PassThrough } = require('stream');

exports.createCertificate = async (name, subject) => {
  // Create the PDF document
  const doc = new PDFDocument({
    layout: 'landscape',
    size: 'A4',
  });

  // Create a memory stream to hold the PDF data
  const stream = new PassThrough();
  const buffers = [];
  stream.on('data', buffers.push.bind(buffers));
  stream.on('end', () => {
    const pdfBuffer = Buffer.concat(buffers);
    console.log('PDF created in memory');
    // You can now use `pdfBuffer` to upload it to your database or cloud storage
  });

  // Pipe the PDF to the memory stream
  doc.pipe(stream);

  // Determine the certificate image URL based on the subject
  let certificatePath = null;
  if (subject === 'fiqh') certificatePath = 'https://res.cloudinary.com/di7sxwjyd/image/upload/v1719000165/certificates/Fiqh_zmvmoq.png';
  else if (subject === 'aqeedah') certificatePath = 'https://res.cloudinary.com/di7sxwjyd/image/upload/v1719000165/certificates/Aqeedah_bctd1y.png';
  else if (subject === 'tafseer') certificatePath = 'https://res.cloudinary.com/di7sxwjyd/image/upload/v1719000164/certificates/Tafseer_zijaie.png';
  else if (subject === 'hadeeth') certificatePath = 'https://res.cloudinary.com/di7sxwjyd/image/upload/v1719000165/certificates/Hadeeth_mjhkur.png';

  // Fetch the image from the URL
  try {
    const response = await axios.get(certificatePath, { responseType: 'arraybuffer' });
    const imgBuffer = Buffer.from(response.data, 'binary');

    // Draw the image on the PDF
    doc.image(imgBuffer, 0, 0, { width: 900, height: 600 });
  } catch (error) {
    console.error('Error loading image:', error);
  }

  // Load the appropriate font based on the text
  function setFontAndText(text) {
    // Check if the text contains Arabic characters
    const isArabic = /[\u0600-\u06FF\u0750-\u077F]/.test(text);
    if (isArabic) {
      doc.font('Fonts/DTHULUTH.ttf'); // Custom Arabic font
      return reverseArabicText(text);
    } else {
      doc.font('Fonts/Amiri-Regular.ttf'); // Custom English font that also supports Arabic
      return text;
    }
  }

  // Function to reverse the order of words in Arabic text
  function reverseArabicText(text) {
    // Split the text into words
    const words = text.trim().split(/\s+/);

    // Reverse the order of words
    const reversedText = words.reverse().join(' ');

    return reversedText;
  }

  // Draw the name with appropriate font and order
  const displayName = setFontAndText(name);
  doc.fontSize(60).text(displayName, 100, 315, {
    align: 'center',
  });

  // Finalize the PDF and end the stream
  doc.end();

  // Wait for the stream to finish and return the buffer
  return new Promise((resolve, reject) => {
    stream.on('end', () => resolve(Buffer.concat(buffers)));
    stream.on('error', reject);
  });
};