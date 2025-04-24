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
    
    console.log('Received PDF fill binary request');
    
    const { filledPdfBytes, outputFilename } = await processRequest(req);
    
    // Return binary PDF directly
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${outputFilename}`);
    res.status(200).send(Buffer.from(filledPdfBytes));
    
  } catch (error) {
    console.error('Error processing binary request:', error);
    return res.status(500).json({ error: error.message });
  }
}

module.exports = allowCors(handler); 