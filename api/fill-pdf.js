const { processRequest } = require('./utils');
const cors = require('cors');

// Setup CORS handler for Vercel
const allowCors = fn => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  return await fn(req, res);
};

async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }
    
    console.log('Received PDF fill request');
    
    const { fieldCount, unfilledCount, filledPdfBytes, outputFilename, totalFields, email_id } = await processRequest(req);
    
    // In a serverless function, we can't save the file to disk
    // Instead, we'll encode it as base64 and return it in the response
    const pdfBase64 = Buffer.from(filledPdfBytes).toString('base64');
    
    // Return JSON response with link to the PDF
    return res.status(200).json({
      success: true,
      message: `Successfully filled ${fieldCount} fields and made ${unfilledCount} unfilled fields read-only in the PDF`,
      filename: outputFilename,
      fields_filled: fieldCount,
      unfilled_readonly: unfilledCount,
      total_fields: totalFields,
      pdf_base64: pdfBase64,
      email_id: email_id
    });
    
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({ error: error.message });
  }
}

module.exports = allowCors(handler); 